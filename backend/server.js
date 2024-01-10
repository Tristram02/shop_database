const express = require('express');
const sql = require('mysql');
const cors = require('cors');
const { check, validationResult } = require("express-validator");
const { ReasonPhrases, StatusCodes } = require("http-status-code");

const app = express();
app.use(cors());

const db = sql.createConnection({
    host: "localhost",
    user: "root",
    password: '',
    database: "shop_database_aji"
});

const validateProduct = [
    check("nazwa").notEmpty().withMessage("Nazwa produktu nie może być pusta"),
    check("opis").notEmpty().withMessage("Opis produktu nie może być pusty"),
    check("cena")
      .isFloat({ min: 0 })
      .withMessage("Cena produktu musi być liczbą większą lub równą 0"),
    check("waga")
      .isFloat({ min: 0 })
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
})

app.post('/products', async (req, res) => {
    const newProduct = req.body;
    console.log(newProduct);
})


app.listen(5000, (err) => {
    console.log("Port 5000...");
})