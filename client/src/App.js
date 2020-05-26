import React, { useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Switch, Route } from 'react-router-dom'

function App() {

  const [guitars, setGuitars] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/api/guitars");
      const guitars = await response.json();
      setGuitars(guitars)
    }
    fetchData();
  }, []);

  return (
    <BrowserRouter>
      <header className="header">
        <div className="header__logo-box">
          <NavLink to='/'><img src="/ball.png" alt="Logo" className="header__logo"/><span>whatsthescore</span></NavLink>
        </div>

        <ul className="header__menu">
          <li className="menu__item"><NavLink exact activeClassName="header__menu-active" to="/">Home</NavLink></li>
          <li className="menu__item"><NavLink exact activeClassName="header__menu-active" to="/matches">Matches</NavLink></li>
          <li className="menu__item"><NavLink exact activeClassName="header__menu-active"to="/about">About</NavLink></li>
        </ul>
            
      </header>

      <div className="main">
        <ul>
          {
            guitars.map(guitar => {
              return <li>{guitar.brand + ' ' + guitar.name}</li>
            })
          }
        </ul>
      </div>

      <footer className="footer">
        FOOTER
      </footer>
    </BrowserRouter>
  );
}

export default App;
