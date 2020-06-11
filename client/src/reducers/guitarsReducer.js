import * as actions from '../actions/guitarsActions';
import deepFreeze from 'deep-freeze';

export const initialState = {
  loading: false,
  hasErrors: false,
  guitars: []
}

export default function guitarsReducer(state = initialState, action) {
  deepFreeze(initialState);
  switch (action.type) {
    case actions.GET_GUITARS:
      return { ...state, loading: true }
    case actions.GET_GUITARS_SUCCESS:
      return { guitars: action.payload, loading: false, hasErrors: false }
    case actions.GET_GUITARS_FAILURE:
      return { ...state, loading: false, hasErrors: true }
    default:
      return state
  }
}