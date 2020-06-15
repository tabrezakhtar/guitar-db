import React from 'react';
import { connect } from 'react-redux';
import {startCase} from 'lodash'
import Colour from './colour';
import Shapes from './shapes';

import { updateFilter, ADD_BRAND, ADD_PICKUPS, ADD_FRETBOARD, ADD_TREMOLO, RESET_FILTER } from '../actions/filtersActions'
import FilterTypes from '../filter-types';

function SideBar({dispatch, settings}) {
  const brands = [...settings.brand].sort().map((brand, i) =>
    <option key={i} value={brand}>{startCase(brand)}</option>
  );

  const pickups = [...settings.pickups].sort().map((pickups, i) =>
    <option key={i} value={pickups}>{pickups.toUpperCase()}</option>
  );

  const tremolo = [...settings.tremolo].sort().map((tremolo, i) =>
    <option key={i} value={tremolo}>{startCase(tremolo)}</option>
  );

  const fretboard = [...settings.fretboard].sort().map((fretboard, i) =>
    <option key={i} value={fretboard}>{startCase(fretboard)}</option>
  );

  const colours = [...settings.colours].sort().map((colour, i) =>
    <Colour id={i} bgColour={colour}/>
  );

  const selectClick = (action, filterType, value) => {
    if (value === FilterTypes.ALL) {
      dispatch(updateFilter(RESET_FILTER, filterType));
    } else {
      dispatch(updateFilter(action, value));
    }
  }

  return (
    <div className="sidebar">
      <Shapes />

      <div className="sidebar__filters">
        <div className="form">
          
          <div className="form__group">
            <label className="form__label" htmlFor="brand">Brand</label>
            <select className="form__select" name="brand" onChange={(e) => selectClick(ADD_BRAND, FilterTypes.BRAND, e.target.value)}>
              <option value={FilterTypes.ALL}>All</option>
              {brands}
            </select>
          </div>

          <div className="form__group">
            <label className="form__label" htmlFor="pickups">Pickups</label>
            <select className="form__select" name="pickups" onChange={(e) => selectClick(ADD_PICKUPS, FilterTypes.PICKUPS, e.target.value)}>
            <option value={FilterTypes.ALL}>All</option>
              {pickups}
            </select>
          </div>

          <div className="form__group">
            <label className="form__label" htmlFor="tremolo">Tremolo</label>
            <select className="form__select" name="tremolo" onChange={(e) => selectClick(ADD_TREMOLO, FilterTypes.TREMOLO, e.target.value)}>
            <option value={FilterTypes.ALL}>All</option>
              {tremolo}
            </select>
          </div>

          <div className="form__group">
            <label className="form__label" htmlFor="fretboard">Fretboard</label>
            <select className="form__select" name="fretboard" onChange={(e) => selectClick(ADD_FRETBOARD, FilterTypes.FRETBOARD, e.target.value)}>
            <option value={FilterTypes.ALL}>All</option>
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