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
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>

      <ul>
        {
          guitars.map(guitar => {
            return <li>{guitar.id + ' ' + guitar.name}</li>
          })
        }
      </ul>
    </div>
  );
}

export default App;
