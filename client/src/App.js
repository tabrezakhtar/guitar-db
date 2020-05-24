import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {

  const [guitars, setGuitars] = useState([]);

  useEffect(() => {
    async function fetchData() {
      debugger;
      const response = await fetch("/api/guitars");
      const guitars = await response.json();
      setGuitars(guitars)
    }
    fetchData();
  }, []);

  return (
    <div className="App">
      <ul>
        {
          guitars.map(guitar => {
            return <li>{guitar.brand + ' ' + guitar.name}</li>
          })
        }
      </ul>
    </div>
  );
}

export default App;
