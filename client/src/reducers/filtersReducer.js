import {omit} from 'lodash';
import * as actions from '../actions/filtersActions';
import deepFreeze from 'deep-freeze';

export const initialState = {
  filters: {}
}

export default function filtersReducer(state = initialState, action) {
  deepFreeze(initialState);
  switch (action.type) {
    case actions.ADD_SHAPE:
      return {...state.filters, shape: action.payload.filterValue}
    case actions.RESET_SHAPE:
      return omit(state.filters, 'shape');
    default:
      return state
  }
}