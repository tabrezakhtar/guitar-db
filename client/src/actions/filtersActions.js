import { 
  getGuitars,
  getGuitarsSuccess,
  getGuitarsFailure } from './guitarsActions';

import ShapesEnum from '../shapes-enum';

export const ADD_SHAPE = 'ADD_SHAPE'
export const RESET_SHAPE = 'RESET_SHAPE'

export const addSelectedValueToFilter = (filterType, filterValue) => ({
  type: ADD_SHAPE,
  payload: {filterType, filterValue}
})

export const removeSelectedValueToFilter = (filterType, filterValue) => ({
  type: RESET_SHAPE,
  payload: {filterType, filterValue}
})

export function updateFilter(filterType, filterValue) {
  return async dispatch => {
    if (filterValue === ShapesEnum.ALL) {
      dispatch(removeSelectedValueToFilter(filterType, filterValue));
    } else {
      dispatch(addSelectedValueToFilter(filterType, filterValue));
    }
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