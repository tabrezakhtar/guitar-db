import React from 'react';
import {uniqBy} from 'lodash'
import Colour from './colour';

function SideBar({guitars}) {

  const brands = uniqBy(guitars, 'brand').map((guitar) =>
    <option key={guitar._id} value={guitar.brand}>{guitar.brand}</option>
  );

  const pickups = uniqBy(guitars, 'pickups').map((guitar) =>
    <option key={guitar._id} value={guitar.pickups}>{guitar.pickups.toUpperCase()}</option>
  );

  const tremolo = uniqBy(guitars, 'tremolo').map((guitar) =>
    <option key={guitar._id} value={guitar.tremolo}>{guitar.tremolo}</option>
  );

  const fretboard = uniqBy(guitars, 'fretboard').map((guitar) =>
    <option key={guitar._id} value={guitar.fretboard}>{guitar.fretboard}</option>
  );

  const colours = uniqBy(guitars, 'colour').map((guitar) =>
    <Colour id={guitar._id} bgColour={guitar.colour}/>
  );

  return (
    <div className="sidebar">
      <span className="sidebar__category">view by shape</span>

      <div className="sidebar__shapes">
        <span><img src="/singlecut_outline.png" alt="Single Cut Guitars"/></span>
        <span><img src="/stype_outline.png" alt="S-Type Guitars"/></span>
        <span><img src="/ttype_outline.png" alt="T-Type Guitars"/></span>
        <span><img src="/v_outline.png" alt="V-Type Guitars"/></span>
      </div>

      <div className="sidebar__filters">
        <div className="form">
          
          <div className="form__group">
            <label className="form__label" htmlFor="brand">Brand</label>
            <select className="form__select" name="brand">
              <option>All</option>
              {brands}
            </select>
          </div>

          <div className="form__group">
            <label className="form__label" htmlFor="pickups">Pickups</label>
            <select className="form__select" name="pickups">
            <option>All</option>
              {pickups}
            </select>
          </div>

          <div className="form__group">
            <label className="form__label" htmlFor="tremolo">Tremolo</label>
            <select className="form__select" name="tremolo">
            <option>All</option>
              {tremolo}
            </select>
          </div>

          <div className="form__group">
            <label className="form__label" htmlFor="fretboard">Fretboard</label>
            <select className="form__select" name="fretboard">
            <option>All</option>
              {fretboard}
            </select>
          </div>

          <div className="form__group">
            <label className="form__label">Colour</label>
            <div className="colourContainer">
              {colours}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default SideBar;
