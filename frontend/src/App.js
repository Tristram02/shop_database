import './App.css';
import React, {useEffect, useState} from 'react'

function App() {
    const [products, setProducts] = useState([]);
    const [kategorie, setKategorie] = useState([]);
    const [zamowienia, setZamowienia] = useState([]);
    const [stanyZamowien, setStanyZamowien] = useState([]);


    const newProduct = {
        "Cena jednostkowa": 70,
        "Kategoria towaru": "Odzież",
        "Nazwa": "Bluza",
        "Opis": "Bluza męska rozmiar L",
        "Waga jednostkowa": 20
    };

    const updatedProduct = {
        "Cena jednostkowa": 70,
        "Kategoria towaru": "Odzież",
        "Nazwa": "Bluza",
        "Opis": "Bluza męska rozmiar L",
        "Waga jednostkowa": 40
    }

    const newZamowienie =
        {"orderData": {
            "Data zatwierdzenia": "2021-05-05",
            "Stan zamowienia": "NIEZATWIERDZONE",
            "Nazwa uzytkownika": "janKowalski",
            "Email": "jankowalski@poczta.com",
            "Numer telefonu": "123456789"
        },
        "products": [
            {
                "ID_produktu": 1,
                "liczba_sztuk": 5
            },
            {
                "ID_produktu": 2,
                "liczba_sztuk": 3
            }
        ]
    }

    const updatedZamownienie =   [{
        "op": "replace",
        "path": "/Stan zamowienia",
        "value": "ANULOWANE"
    }]

    useEffect(() => {
        fetch('http://localhost:5000/products')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.log(err));
    }, [])

    useEffect(() => {
        fetch('http://localhost:5000/categories')
            .then(res => res.json())
            .then(data => setKategorie(data))
            .catch(err => console.log(err));
    }, [])

    useEffect(() => {
        fetch('http://localhost:5000/orders')
            .then(res => res.json())
            .then(data => setZamowienia(data))
            .catch(err => console.log(err));
    }, [])

    useEffect(() => {
        fetch('http://localhost:5000/status')
            .then(res => res.json())
            .then(data => setStanyZamowien(data))
            .catch(err => console.log(err));
    }, [])

    async function handleAddProduct() {
        await fetch('http://localhost:5000/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProduct)
        })
    }

    async function handleAddZamowienie() {
        await fetch('http://localhost:5000/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newZamowienie)
        })
    }

    async function handleUpdateProduct() {
        await fetch('http://localhost:5000/products/6', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProduct)
        })
    }

    async function handleUpdateZamowienie() {
        await fetch('http://localhost:5000/orders/5', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedZamownienie)
        })
    }


    return (
        <div className="App">
            <h2>Produkty</h2>
            <table>
                <thead>
                <th>ID</th>
                <th>Nazwa</th>
                <th>Opis</th>
                <th>Cena</th>
                <th>Waga</th>
                <th>Kategoria</th>
                </thead>
                <tbody>
                {products.map((item, index) => (
                    <tr key={index}>
                        <td>{item["ID_produktu"]}</td>
                        <td>{item["Nazwa"]}</td>
                        <td>{item["Opis"]}</td>
                        <td>{item["Cena jednostkowa"]}</td>
                        <td>{item["Waga jednostkowa"]}</td>
                        <td>{item["Kategoria towaru"]}</td>

                    </tr>
                ))}
                </tbody>
            </table>

            <button onClick={handleAddProduct}>Add product</button>
            <button onClick={handleUpdateProduct}>Update product</button>
            <h2>Kategorie</h2>
            <table>
                <thead>
                <th>Nazwa</th>
                </thead>
                <tbody>
                {kategorie.map((item, index) => (
                    <tr key={index}>
                        <td>{item["Nazwa"]}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <h2>Zamówienia</h2>
            <table>
                <thead>
                <th>ID</th>
                <th>Data zatwierdzenia</th>
                <th>Stan zamówienia</th>
                <th>Nazwa użytkownika</th>
                <th>Email</th>
                <th>Numer telefonu</th>
                <th>Id</th>
                <th>Sztuki</th>
                </thead>
                <tbody>
                {Array.isArray(zamowienia) && zamowienia.length > 0 ? (
                zamowienia.map((item, index) => (
                    <tr key={index}>
                        <td>{item["ID_zamowienia"]}</td>
                        <td>{item.orderData["Data zatwierdzenia"]}</td>
                        <td>{item.orderData["Stan zamowienia"]}</td>
                        <td>{item.orderData["Nazwa uzytkownika"]}</td>
                        <td>{item.orderData["Email"]}</td>
                        <td>{item.orderData["Numer telefonu"]}</td>
                        {item.products.map((product, index) => (
                            <tr key={index}>
                                <td>{product["ID_produktu"]}</td>
                                <td>{product["liczba_sztuk"]}</td>
                            </tr>
                        ))}
                    </tr>
                ))) : (
                    <tr>
                        <td colSpan={3}>No orders</td>
                    </tr>
                )}
                </tbody>
            </table>
            <button onClick={handleAddZamowienie}>Add zamowienie</button>
            <button onClick={handleUpdateZamowienie}>Update zamowienie</button>
            <h2>Stany zamówień</h2>
            <table>
                <thead>
                <th>Nazwa</th>
                </thead>
                <tbody>
                {stanyZamowien.map((item, index) => (
                    <tr key={index}>
                        <td>{item["Nazwa"]}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;
