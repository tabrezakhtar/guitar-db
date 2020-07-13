import { 
  getGuitars,
  getGuitarsSuccess,
  getGuitarsFailure } from './guitarsActions';

export const ADD_SHAPE = 'ADD_SHAPE';
export const RESET_FILTER = 'RESET_FILTER';
export const ADD_BRAND = 'ADD_BRAND';
export const ADD_PICKUPS = 'ADD_PICKUPS';
export const ADD_TREMOLO = 'ADD_TREMOLO';
export const ADD_FRETBOARD = 'ADD_FRETBOARD';
export const ADD_COLOUR = 'ADD_COLOUR';
export const REMOVE_COLOUR = 'REMOVE_COLOUR';

export const addSelectedValueToFilter = (action, filterValue) => ({
  type: action,
  payload: {action, filterValue}
});

export function updateFilter(filterType, filterValue) {
  return async dispatch => {
    dispatch(addSelectedValueToFilter(filterType, filterValue));
  }
}

export function fetchGuitarsByFilter(filter) {
  return async dispatch => {
    dispatch(getGuitars());
    try {
      const response = await fetch(`/api/guitars/filterBy?filter=${JSON.stringify(filter)}`);
      const data = await response.json();
      dispatch(getGuitarsSuccess(data));
    } catch (error) {
      dispatch(getGuitarsFailure());
    }
  }
}