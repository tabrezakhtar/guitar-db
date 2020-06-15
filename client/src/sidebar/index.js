import React from 'react';
import { connect } from 'react-redux';
import {sortBy} from 'lodash'
import Colour from './colour';
import Shapes from './shapes';

import { fetchGuitarsByFilter, updateFilter, ADD_BRAND } from '../actions/filtersActions'
import FilterTypes from '../filter-types';

function SideBar({dispatch, settings}) {
  const brands = settings.brand.map((brand, i) =>
    <option key={i} value={brand}>{brand}</option>
  );

  const pickups = settings.pickups.map((pickups, i) =>
    <option key={i} value={pickups}>{pickups.toUpperCase()}</option>
  );

  const tremolo = settings.tremolo.map((tremolo, i) =>
    <option key={i} value={tremolo}>{tremolo}</option>
  );

  const fretboard = settings.fretboard.map((fretboard, i) =>
    <option key={i} value={fretboard}>{fretboard}</option>
  );

  const sortedColors = [...settings.colours].sort()
  const colours = sortedColors.map((colour, i) =>
    <Colour id={i} bgColour={colour}/>
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
  settings: state.guitars.settings
})

export default connect(mapStateToProps)(SideBar)