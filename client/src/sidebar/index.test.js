import React from 'react';
import { shallow } from 'enzyme';
import SideBar from './index';
import Colour from './colour';
import Shapes from './shapes';
import * as filterActions from '../actions/filtersActions';
import FilterTypes from '../filter-types';
import {startCase} from "lodash";
import ShapesEnum from "../shapes-enum";

const settings = {
  brand: ['fender', 'prs'],
  colours: ['black', 'red'],
  pickups: ['sss', 'hh'],
  tremolo: ['2 point', 'fixed'],
  fretboard: ['maple', 'rosewood'],
};

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

const filterSelect = (label, action, filterType, options) =>
  <div className="form__group">
    <label className="form__label" htmlFor={label}>{label}</label>
    <select className="form__select" name={label}>
      <option value={FilterTypes.ALL}>All</option>
      {options}
    </select>
  </div>;

const filterSelectValues = [
  { label: 'Brand', action: filterActions.ADD_BRAND, filterType: FilterTypes.BRAND, options: brands },
  { label: 'Pickups', action: filterActions.ADD_PICKUPS, filterType: FilterTypes.PICKUPS, options: pickups },
  { label: 'Tremolo', action: filterActions.ADD_TREMOLO, filterType: FilterTypes.TREMOLO, options: tremolo },
  { label: 'Fretboard', action: filterActions.ADD_FRETBOARD, filterType: FilterTypes.FRETBOARD, options: fretboard }
];

const filterSelectList = filterSelectValues.map(s => {
  return filterSelect(s.label, s.action, s.filterType, s.options);
});

const colours = [...settings.colours].sort().map((colour, i) =>
  <Colour id={i} bgColour={colour} />
);

afterEach( () => {
  jest.restoreAllMocks()
});

describe('when the component loads', () => {
  test('it renders the filter options', () => {
    const wrapper = shallow(<SideBar.WrappedComponent settings={settings} />);
    expect(wrapper.containsMatchingElement(
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
    )).toEqual(true);
  });
});

describe('when a filter component is clicked', () => {
  test('it resets the brand filter', () => {
    const dispatchStub = jest.fn();
    const updateFilterSpy = jest.spyOn(filterActions, 'updateFilter');
    const wrapper = shallow(<SideBar.WrappedComponent dispatch={dispatchStub} settings={settings} />);
    const brandSelect = wrapper.find({ name: 'Brand' }).simulate('change', { target: { value: FilterTypes.ALL }});
    expect(dispatchStub).toBeCalledWith(expect.any(Function));
    expect(updateFilterSpy).toBeCalledWith(filterActions.RESET_FILTER, FilterTypes.BRAND);
  });

  test('it selects a brand', () => {
    const dispatchStub = jest.fn();
    const updateFilterSpy = jest.spyOn(filterActions, 'updateFilter');
    const wrapper = shallow(<SideBar.WrappedComponent dispatch={dispatchStub} settings={settings} />);
    wrapper.find({ name: 'Brand' }).simulate('change', { target: { value: 'Fender' }});
    debugger;
    expect(dispatchStub).toBeCalledWith(expect.any(Function));
    expect(updateFilterSpy).toBeCalledWith(filterActions.ADD_BRAND, 'Fender');
  });
});