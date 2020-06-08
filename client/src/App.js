import React, { useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Switch, Route } from 'react-router-dom'
import ImageGallery from 'react-image-gallery';
import SideBar from './sidebar';
import Tiles from './rhs';

function App() {

  const images = [
    {
      original: 'images/strat1.jpeg',
      thumbnail: 'images/strat1.jpeg',
    },
    {
      original: 'images/strat2.jpeg',
      thumbnail: 'images/strat2.jpeg',
    },
    {
      original: 'images/strat3.jpeg',
      thumbnail: 'images/strat3.jpeg',
    },
  ];

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
          <NavLink to='/'><span>Guitar Explorer</span></NavLink>
        </div>

        <ul className="header__menu">
          <li className="menu__item"><NavLink exact activeClassName="header__menu-active" to="/">Home</NavLink></li>
          <li className="menu__item"><NavLink exact activeClassName="header__menu-active" to="/likes">Likes</NavLink></li>
          <li className="menu__item"><NavLink exact activeClassName="header__menu-active"to="/about">About</NavLink></li>
        </ul>
            
      </header>

      <div className="container">
        
        <SideBar guitars={guitars} />

        <div className="rhs">
          <Tiles guitars={guitars}/>
        </div>
      </div>

      <div className="popup">
        <div className="popup__content">
          <div className="popup__left">
            {/* <img src="/images/strat1.jpeg" alt="stratocaster" className="popup__img"/> */}
            <ImageGallery items={images} showFullscreenButton={false} showPlayButton={false}/>
          </div>
          <div className="popup__right">
            Activated charcoal mixtape jean shorts pinterest vinyl post-ironic, polaroid DIY paleo single-origin coffee. Edison bulb salvia copper mug adaptogen asymmetrical unicorn. Fixie roof party chicharrones VHS, tousled cloud bread cred gluten-free ramps. Poke green juice stumptown post-ironic health goth. Cred green juice semiotics copper mug, cold-pressed pinterest vape woke jean shorts leggings edison bulb cardigan.
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
