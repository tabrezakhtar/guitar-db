import {remove} from 'lodash';
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
      case actions.RESET_FILTER:
        delete draft[action.payload.filterValue];
        return draft;
      case actions.ADD_BRAND:
        draft.brand = action.payload.filterValue;
        return draft;
      case actions.ADD_PICKUPS:
        draft.pickups = action.payload.filterValue;
        return draft;
      case actions.ADD_TREMOLO:
        draft.tremolo = action.payload.filterValue;
        return draft;
      case actions.ADD_FRETBOARD:
        draft.fretboard = action.payload.filterValue;
        return draft;
      case actions.ADD_COLOUR:
        draft.colour ? draft.colour.push(action.payload.filterValue) : draft.colour = [action.payload.filterValue]
        return draft;
      case actions.REMOVE_COLOUR:
        remove(draft.colour, function(c) {
          return c === action.payload.filterValue;
        });

        if (draft.colour && !draft.colour.length) {
          delete draft.colour;
        }

        return draft;
      default:
        return state
    }
  })
}