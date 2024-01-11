const express = require('express');
const sql = require('mysql');
const cors = require('cors');
const {check, validationResult} = require("express-validator");
const {
    ReasonPhrases,
    StatusCodes,
} = require('http-status-codes');

const app = express();
app.use(cors());
app.use(express.json({limit: '1mb'}))

const db = sql.createConnection({
    host: "localhost",
    user: "root",
    password: '',
    database: "shop_database_aji"
});

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

app.get('/orders', (req, res) => {
    const query = "select * from zamowienie";
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

app.get('/orders/:id', (req, res) => {
    const orderID = req.params.id;

    try {
        db.query('select * from zamowienie where ID_zamowienia = ?', [orderID], (err, data) => {
            if (data.length > 0) {
                return res.json(data);
            } else {
                res.status(404).json({error: "Nie znaleziono zamowienia"});
            }
        });
    } catch (err) {
        console.log("Error: ", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }

})

app.get('/users/:user/orders', (req, res) => {
    const orderUser = req.params.user;

    try {
        db.query('select * from zamowienie where `Nazwa uzytkownika` = ?', [orderUser], (err, data) => {
            if (data.length > 0) {
                return res.json(data);
            } else {
                res.status(404).json({error: "Nie znaleziono uzytkownika"});
            }
        });
    } catch (err) {
        console.log("Error: ", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
})

app.get('/orders/status/:id', (req, res) => {
    const orderStatus = req.params.id;

    try {
        db.query('select * from zamowienie where `Stan zamowienia` = ?', [orderStatus], (err, data) => {
            if (data.length > 0) {
                return res.json(data);
            } else {
                res.status(404).json({error: "Nie znaleziono stanu zamowienia"});
            }
        });
    } catch (err) {
        console.log("Error: ", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
})

// dodaj zamowienie
app.post('/orders', (req, res) => {
    const newOrder = req.body;

    try {
        const result = db.query("insert into zamowienie set ?", [newOrder]);
        res.json({orderID: result.insertId})
    } catch (err) {
        console.log("Error: ", err);
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
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