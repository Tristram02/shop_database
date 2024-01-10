const express = require('express');
const sql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser')

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = sql.createConnection({
    host: "localhost",
    user: "root",
    password: '',
    database: "shop_database_aji"
})

app.get('/', function (req, res) {
    return res.json("Msg from backend");
})

app.get('/products', (req, res) => {
    const query = "select * from produkt";
    db.query(query, (err, data) => {
        if (err) {
            console.log(err);
        }
        return res.json(data);
    })
})


app.listen(5000, (err) => {
    console.log("Port 5000...");
})