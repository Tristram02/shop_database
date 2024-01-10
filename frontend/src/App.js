import logo from './logo.svg';
import './App.css';
import React, {useEffect, useState} from 'react'

function App() {
  const [data, setData] = useState([]);
  const [kategorie, setKategorie] = useState([]);

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

  useEffect(() => {
    fetch('http://localhost:5000/products')
    .then(res => res.json())
    .then(data => setData(data))
    .catch(err => console.log(err));
  }, [])
  
  useEffect(() => {
    fetch('http://localhost:5000/categories')
    .then(res => res.json())
    .then(data => setKategorie(data))
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

  async function handleUpdateProduct() {
    await fetch('http://localhost:5000/products/6', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedProduct)
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
          {data.map((item, index) => (
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
    </div>
  );
}

export default App;
