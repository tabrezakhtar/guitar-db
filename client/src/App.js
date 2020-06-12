import React, { useEffect, useState } from 'react';
import { BrowserRouter, NavLink, withRouter } from 'react-router-dom'
import { connect } from 'react-redux';
import { fetchGuitars } from './actions/guitarsActions'
import { fetchGuitarsByFilter } from './actions/filtersActions'
import ImageGallery from 'react-image-gallery';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import SideBar from './sidebar';
import Tiles from './rhs';

function App({dispatch, guitars, filters, loading, hasErrors}) {
  useEffect(() => {
    if (filters && filters.hasOwnProperty('shape')) {
      dispatch(fetchGuitarsByFilter(filters))
    } else {
      dispatch(fetchGuitars())
    }
  }, [dispatch, filters])

  const [open, setOpen] = useState(false)

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

  const onOpenModal = () => {
    setOpen(true);
  };

  const onCloseModal = () => {
    setOpen(false);
  };

  return (
    <BrowserRouter>
      <header className="header">
        <div className="header__logo-box">
          <NavLink to='/'><span>Guitar Explorer🔥</span></NavLink>
        </div>

        <ul className="header__menu">
          <li className="menu__item"><NavLink exact activeClassName="header__menu-active" to="/">Home</NavLink></li>
          <li className="menu__item"><NavLink exact activeClassName="header__menu-active" to="/likes">Likes</NavLink></li>
          <li className="menu__item"><NavLink exact activeClassName="header__menu-active"to="/about">About</NavLink></li>
        </ul>
            
      </header>

      <div className="container">
        
        <SideBar guitars={guitars}/>

        <div className="rhs">
          <Tiles guitars={guitars} onOpenModal={onOpenModal}/>
        </div>
      </div>

      <Modal open={open} onClose={onCloseModal} center>
        <div className="popup">
          <div className="popup__content">
            <div className="popup__left">
              <ImageGallery items={images} showFullscreenButton={false} showPlayButton={false}/>
            </div>
            <div className="popup__right">
              Alder body with gloss finish
              Three Player Series single-coil Stratocaster pickups
              “Modern C"-shaped neck profile
              9.5"-radius fingerboard
              2-point tremolo bridge with bent-steel saddles
            </div>
          </div>
        </div>
      </Modal>
    </BrowserRouter>
  );
}

const mapStateToProps = state => ({
  guitars: state.guitars.guitars,
  filters: state.filters
})

// export default withRouter(connect(mapStateToProps)(App))
export default connect(mapStateToProps)(App)