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
          <NavLink to='/'><span>GuitarDB</span></NavLink>
        </div>

        <ul className="header__menu">
          <li className="menu__item"><NavLink exact activeClassName="header__menu-active" to="/">Home</NavLink></li>
          <li className="menu__item"><NavLink exact activeClassName="header__menu-active" to="/matches">Matches</NavLink></li>
          <li className="menu__item"><NavLink exact activeClassName="header__menu-active"to="/about">About</NavLink></li>
        </ul>
            
      </header>

      <div className="container">
        <div className="sidebar">
          side menu content here
        </div>

        <div className="rhs">
          <ul>
            {
              guitars.map(guitar => {
                return <li>{guitar.brand + ' ' + guitar.name}</li>
              })
            }
          </ul>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
