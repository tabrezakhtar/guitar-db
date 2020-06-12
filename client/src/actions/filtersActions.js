import { 
  getGuitars,
  getGuitarsSuccess,
  getGuitarsFailure } from './guitarsActions';

export const ADD_SHAPE = 'ADD_SHAPE'

export const addSelectedValueToFilter = (filterType, filterValue) => ({
  type: ADD_SHAPE,
  payload: {filterType, filterValue}
})

export function updateFilter(filterType, filterValue) {
  return async dispatch => {
    dispatch(addSelectedValueToFilter(filterType, filterValue));
  }
}

export function fetchGuitarsByFilter(filter) {
  return async dispatch => {
    dispatch(getGuitars());
    try {
      const response = await fetch(`/api/guitars/filterBy?filter={"shape":"ttype"}`);
      const data = await response.json();
      dispatch(getGuitarsSuccess(data));
    } catch (error) {
      dispatch(getGuitarsFailure());
    }
  }
}