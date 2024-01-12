const express = require('express');
const sql = require('mysql');
const cors = require('cors');
const {check, validationResult} = require("express-validator");
const {
    ReasonPhrases,
    StatusCodes,
} = require('http-status-codes');
const util = require('util');
const jsonPatch = require('fast-json-patch');

const app = express();
app.use(cors());
app.use(express.json({limit: '1mb'}))

const db = sql.createConnection({
    host: "localhost",
    user: "root",
    password: '',
    database: "shop_database_aji"
});

const dbQuery = util.promisify(db.query).bind(db);

const validateProduct = [
    check('Nazwa').notEmpty().withMessage("Nazwa produktu nie może być pusta"),
    check("Opis").notEmpty().withMessage("Opis produktu nie może być pusty"),
    check("Cena jednostkowa")
        .isFloat({min: 0})
        .withMessage("Cena produktu musi być liczbą większą lub równą 0"),
    check('Waga jednostkowa')
        .isFloat({min: 0})
        .withMessage("Waga produktu musi być liczbą większą lub równą 0"),
];

app.get('/products', (req, res) => {
    const query = "select * from produkt";
    try {
        db.query(query, (err, data) => {
            if (err) {
                console.log(err);
            }
            return res.json(data);
        })
    } catch (err) {
        console.log("Error: ", err);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
});

app.get('/products/:id', (req, res) => {
    const productID = req.params.id;

    try {
        db.query('select * from produkt where ID_produktu = ?', [productID], (err, data) => {
            if (data.length > 0) {
                return res.json(data);
            } else {
                res.status(404).json({error: "Nie znaleziono produktu"});
            }
        });
    } catch (err) {
        console.log("Error: ", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
})

app.post('/products', async (req, res) => {
    const newProduct = req.body;

    try {
        const result = db.query("insert into produkt set ?", [newProduct]);
        res.json({productID: result.insertId})
    } catch (err) {
        console.log("Error: ", err);
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
});

app.put('/products/:id', validateProduct, (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({"error": error.array()});
    }

    const productID = req.params.id;
    const newProduct = req.body;

    try {
        db.query('select * from produkt where ID_produktu = ?', [productID], (err, data) => {
            if (data.length === 0) {
                return res.status(404).json({error: "Nie znaleziono produktu"});
            }

            db.query('update produkt set ? where ID_produktu = ?', [
                newProduct,
                productID
            ]);
            res.json({success: true});
        });
    } catch (err) {
        console.log("Error: ", err);
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
});

app.get('/categories', (req, res) => {
    const query = "select * from kategoria";
    try {
        db.query(query, (err, data) => {
            if (err) {
                console.log(err);
            }
            return res.json(data);
        })
    } catch (err) {
        console.log("Error: ", err);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
});

async function getOrdersWithProducts(ordersResult) {
    return await Promise.all(ordersResult.map(async (order) => {
        const orderID = order["ID_zamowienia"];

        const productsQuery = 'SELECT * FROM zamowione_towary WHERE ID_zamowienia = ?';
        const productsResult = await dbQuery(productsQuery, [orderID]);

        const products = productsResult.map(product => ({
            "ID_produktu": product["ID_produktu"],
            "liczba_sztuk": product["liczba_sztuk"]
        }));

        return {
            "ID_zamowienia": orderID,
            "orderData": {
                "Data zatwierdzenia": order["Data zatwierdzenia"],
                "Stan zamowienia": order["Stan zamowienia"],
                "Nazwa uzytkownika": order["Nazwa uzytkownika"],
                "Email": order["Email"],
                "Numer telefonu": order["Numer telefonu"]
            },
            "products": products
        };
    }));
}

const validateOrderPut = [
    check('orderData.Nazwa uzytkownika').notEmpty().withMessage("Nazwa użytkownika nie może być pusta"),
    check('orderData.Email').notEmpty().isEmail().withMessage("Nieprawidłowy format adresu email"),
    check('orderData.Numer telefonu').notEmpty().isNumeric().withMessage("Numer telefonu musi być liczbą"),
    check('orderData.Data zatwierdzenia').notEmpty().isDate().withMessage("Nieprawidłowy format daty"),
    check('orderData.Stan zamowienia').notEmpty().isIn(['ZATWIERDZONE', 'NIEZATWIERDZONE', 'ANULOWANE', 'ZREALIZOWANE']).withMessage("Nieprawidłowy status zamówienia"),

    check('products.*.ID_produktu').notEmpty().withMessage("ID produktu nie może być puste"),
    check('products.*.liczba_sztuk').isInt({min: 1}).withMessage("Liczba sztuk musi być liczbą całkowitą większą od 0"),

    check('products').custom(async (products, {req}) => {
        const productIds = products.map(product => product.ID_produktu);
        const existingProducts = await dbQuery('SELECT ID_produktu FROM produkt WHERE ID_produktu IN (?)', [productIds]);

        const existingProductIds = existingProducts.map(product => product.ID_produktu);
        const nonExistingProductIds = productIds.filter(id => !existingProductIds.includes(id));

        if (nonExistingProductIds.length > 0) {
            throw new Error(`Produkty o ID ${nonExistingProductIds.join(', ')} nie istnieją w bazie danych`);
        }

        return true;
    }),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        next();
    }

]

app.get('/orders', async (req, res) => {
    const query = "SELECT * FROM zamowienie";
    try {
        const ordersResult = await dbQuery(query);

        if (ordersResult.length > 0) {

            const ordersData = await getOrdersWithProducts(ordersResult);

            res.json(ordersData);
        } else {
            res.status(404).json({error: "Nie znaleziono zamówień"});
        }
    } catch (err) {
        console.error("Error: ", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
});

app.get('/orders/:id', async (req, res) => {
    const orderID = req.params.id;

    try {
        const orderQuery = 'SELECT * FROM zamowienie WHERE ID_zamowienia = ?';
        const orderResult = await dbQuery(orderQuery, [orderID]);

        if (orderResult.length > 0) {
            const ordersData = await getOrdersWithProducts(orderResult);

            res.json(ordersData);
        } else {
            res.status(404).json({error: "Nie znaleziono zamowienia"});
        }
    } catch (err) {
        console.error("Error: ", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
});

app.get('/users/:user/orders', async (req, res) => {
    const orderUser = req.params.user;

    try {
        const ordersResult = await dbQuery('SELECT * FROM zamowienie WHERE `Nazwa uzytkownika` = ?', [orderUser]);

        if (ordersResult.length > 0) {
            const ordersData = await getOrdersWithProducts(ordersResult);

            res.json(ordersData);
        } else {
            res.status(404).json({error: "Nie znaleziono uzytkownika"});
        }
    } catch (err) {
        console.error("Error: ", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
});

app.get('/orders/status/:id', async (req, res) => {
    const orderStatus = req.params.id;

    try {
        const ordersResult = await dbQuery('SELECT * FROM zamowienie WHERE `Stan zamowienia` = ?', [orderStatus]);

        if (ordersResult.length > 0) {
            const ordersData = await getOrdersWithProducts(ordersResult);

            res.json(ordersData);
        } else {
            res.status(404).json({error: "Nie znaleziono zamówień o podanym stanie"});
        }
    } catch (err) {
        console.error("Error: ", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
});

app.post('/orders', validateOrderPut, async (req, res) => {
    const {orderData, products} = req.body;
    try {
        await db.beginTransaction();

        const result1 = await dbQuery("INSERT INTO zamowienie SET ?", orderData);
        const orderID = result1.insertId;

        const insertProductPromises = products.map(async (product) => {
            const productData = {
                ID_zamowienia: orderID,
                ID_produktu: product.ID_produktu,
                liczba_sztuk: product.liczba_sztuk
            };

            return db.query("INSERT INTO zamowione_towary SET ?", productData);
        });

        await Promise.all(insertProductPromises);

        await db.commit();

        res.json({orderID});
    } catch (err) {
        await db.rollback();

        console.error("Error: ", err);
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
});

const validatePatchOrderStatus = [
    check('[0].op').equals('replace').withMessage("Operacja musi być 'replace'"),

    check('[0].path').equals('/Stan zamowienia').withMessage("Pole 'path' musi być '/Stan zamowienia'"),

    check('[0].value')
        .isString().withMessage("Wartość musi być ciągiem znaków")
        .isIn(['ZATWIERDZONE', 'NIEZATWIERDZONE', 'ANULOWANE', 'ZREALIZOWANE'])
        .withMessage("Nieprawidłowy status zamówienia"),

    check('id').custom(async (id, {req}) => {
        const orderExists = await dbQuery('SELECT * FROM zamowienie WHERE ID_zamowienia = ?', [id]);

        if (!orderExists || orderExists.length === 0) {
            throw new Error("Zamówienie o podanym ID nie istnieje");
        }

        const value = req.body[0].value;

        const orderId = req.params.id;

        const previousOrder = await dbQuery('SELECT `Stan zamowienia` FROM zamowienie WHERE ID_zamowienia = ?', [orderId]);
        const previousOrderStatus = previousOrder[0]["Stan zamowienia"];

        if (previousOrderStatus === 'ANULOWANE' && value === 'ANULOWANE') {
            throw new Error("Nie można zmienić stanu zamówienia po anulowaniu");
        }

        const allowedTransitions = {
            'NIEZATWIERDZONE': ['ZATWIERDZONE', 'ANULOWANE'],
            'ZATWIERDZONE': ['ZREALIZOWANE', 'ANULOWANE'],
            'ZREALIZOWANE': []
        };

        if (previousOrderStatus in allowedTransitions && !allowedTransitions[previousOrderStatus].includes(value)) {
            throw new Error(`Nieprawidłowa zmiana statusu zamówienia z '${previousOrderStatus}' na '${value}'`);
        }

        return true;
    }),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        next();
    }
];

app.patch('/orders/:id', validatePatchOrderStatus, async (req, res) => {
    const orderID = req.params.id;
    const patchData = req.body;
    console.log(patchData)

    try {
        const orderResult = await dbQuery('SELECT * FROM zamowienie WHERE ID_zamowienia = ?', [orderID]);

        if (orderResult.length === 0) {
            return res.status(404).json({error: "Nie znaleziono zamowienia"});
        }

        const currentOrder = orderResult[0];

        const patchedOrder = jsonPatch.applyPatch(currentOrder, patchData).newDocument;

        await dbQuery('UPDATE zamowienie SET ? WHERE ID_zamowienia = ?', [patchedOrder, orderID]);

        res.json({success: true});
    } catch (err) {
        console.error("Error: ", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
});


app.get('/status', (req, res) => {
    const query = "select * from stan_zamowienia";
    try {
        db.query(query, (err, data) => {
            if (err) {
                console.log(err);
            }
            return res.json(data);
        })
    } catch (err) {
        console.log("Error: ", err);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
});


app.listen(5000, (err) => {
    console.log("Port 5000...");
})