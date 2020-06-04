import React, { useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Switch, Route } from 'react-router-dom'
import SideBar from './sidebar';
import Tiles from './rhs';

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
          <li className="menu__item"><NavLink exact activeClassName="header__menu-active" to="/matches">View Cart</NavLink></li>
          <li className="menu__item"><NavLink exact activeClassName="header__menu-active"to="/about">About</NavLink></li>
        </ul>
            
      </header>

      <div className="container">
        
        <SideBar guitars={guitars} />

        <div className="rhs">
          <Tiles guitars={guitars}/>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
