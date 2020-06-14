import {omit} from 'lodash';
import * as actions from '../actions/filtersActions';
import deepFreeze from 'deep-freeze';
import produce from 'immer';

export const initialState = {}

export default function filtersReducer(state = initialState, action) {
  deepFreeze(initialState);
  return produce(state, draft => {
    switch (action.type) {
      case actions.ADD_SHAPE:
        draft.shape = action.payload.filterValue;
        return draft;
      case actions.RESET_SHAPE:
        delete draft.shape;
        return draft;
      case actions.ADD_BRAND:
        draft.brand = action.payload.filterValue;
        return draft;
      default:
        return state
    }
  })
}