import logo from './logo.svg';
import './App.css';
import React, {useEffect, useState} from 'react'

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/products')
    .then(res => res.json())
    .then(data => setData(data))
    .catch(err => console.log(err));
  }, [])
  data.map(item => {
    console.log(item);
  })
  return (
    <div className="App">
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
    </div>
  );
}

export default App;
