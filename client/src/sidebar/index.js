import React from 'react';
import { connect } from 'react-redux';
import { startCase } from 'lodash'
import Colour from './colour';
import Shapes from './shapes';

import { updateFilter, ADD_BRAND, ADD_PICKUPS, ADD_FRETBOARD, ADD_TREMOLO, RESET_FILTER, ADD_COLOUR, REMOVE_COLOUR } from '../actions/filtersActions'
import FilterTypes from '../filter-types';

function SideBar({dispatch, settings}) {

  const selectClick = (action, filterType, value) => {
    if (value === FilterTypes.ALL) {
      dispatch(updateFilter(RESET_FILTER, filterType));
    } else {
      dispatch(updateFilter(action, value));
    }
  };

  function colourClick(colour, status) {
    if (status) {
      dispatch(updateFilter(ADD_COLOUR, colour));
    } else {
      dispatch(updateFilter(REMOVE_COLOUR, colour));
    }
  }

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
    <Colour id={i} bgColour={colour} onColourSelected={colourClick}/>
  );

  const filterSelect = (label, action, filterType, options) =>
    <div className="form__group">
    <label className="form__label" htmlFor="brand">{label}</label>
    <select className="form__select" name="brand" onChange={(e) => selectClick(action, filterType, e.target.value)}>
      <option value={FilterTypes.ALL}>All</option>
      {options}
    </select>
  </div>;

  const filterSelectValues = [
    { label: 'Brand', action: ADD_BRAND, filterType: FilterTypes.BRAND, options: brands },
    { label: 'Pickups', action: ADD_PICKUPS, filterType: FilterTypes.PICKUPS, options: pickups },
    { label: 'Tremolo', action: ADD_TREMOLO, filterType: FilterTypes.TREMOLO, options: tremolo },
    { label: 'Fretboard', action: ADD_FRETBOARD, filterType: FilterTypes.FRETBOARD, options: fretboard }
  ];

  const filterSelectList = filterSelectValues.map(s => {
    return filterSelect(s.label, s.action, s.filterType, s.options);
  });

  return (
    <div className="sidebar">
      <Shapes />

      <div className="sidebar__filters">
        <div className="form">
          
          {filterSelectList}

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
});

export default connect(mapStateToProps)(SideBar)