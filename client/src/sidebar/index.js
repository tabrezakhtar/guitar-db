import React from 'react';
import { connect } from 'react-redux';
import {uniqBy} from 'lodash'
import Colour from './colour';
import Shapes from './shapes';

import { fetchGuitarsByFilter, updateFilter, ADD_BRAND } from '../actions/filtersActions'
import FilterTypes from '../filter-types';

function SideBar({dispatch, guitarList}) {
  const brands = uniqBy(guitarList, 'brand').map((guitar) =>
    <option key={guitar._id} value={guitar.brand}>{guitar.brand}</option>
  );

  const pickups = uniqBy(guitarList, 'pickups').map((guitar) =>
    <option key={guitar._id} value={guitar.pickups}>{guitar.pickups.toUpperCase()}</option>
  );

  const tremolo = uniqBy(guitarList, 'tremolo').map((guitar) =>
    <option key={guitar._id} value={guitar.tremolo}>{guitar.tremolo}</option>
  );

  const fretboard = uniqBy(guitarList, 'fretboard').map((guitar) =>
    <option key={guitar._id} value={guitar.fretboard}>{guitar.fretboard}</option>
  );

  const colours = uniqBy(guitarList, 'colour').map((guitar) =>
    <Colour id={guitar._id} bgColour={guitar.colour}/>
  );

  const selectClick = (type, e) => {
    const value = e.target.value;
    dispatch(updateFilter(type, value));
  }

  return (
    <div className="sidebar">
      <Shapes />

      <div className="sidebar__filters">
        <div className="form">
          
          <div className="form__group">
            <label className="form__label" htmlFor="brand">Brand</label>
            <select className="form__select" name="brand" onChange={(e) => selectClick(ADD_BRAND, e)}>
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

const mapStateToProps = state => ({
  guitarList: state.guitars.guitars
})

export default connect(mapStateToProps)(SideBar)