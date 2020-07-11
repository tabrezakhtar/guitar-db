import * as actions from '../actions/guitarsActions';
import deepFreeze from 'deep-freeze';
import produce from 'immer';

export const initialState = {
  loading: false,
  hasErrors: false,
  guitars: [],
  settings: {
    brand: [],
    colours: [],
    pickups: [],
    tremolo: [],
    fretboard: []
  }
};

export default function guitarsReducer(state = initialState, action) {
  deepFreeze(initialState);

  return produce(state, draft => {
    switch (action.type) {
      case actions.GET_GUITARS: {
        draft.loading = true;
        return draft;
      }
      case actions.GET_GUITARS_SUCCESS: {
        draft.guitars = action.payload.guitars;
        draft.settings = action.payload.settings;
        draft.loading = false;
        draft.hasErrors = false;
        return draft;
      }
      case actions.GET_GUITARS_FAILURE: {
        draft.loading = false;
        draft.hasErrors = true;
        return draft;
      }
      default:
        return draft;
    }
  })
  
}