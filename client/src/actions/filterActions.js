import { 
  getGuitars,
  getGuitarsSuccess,
  getGuitarsFailure } from './guitarsActions';

export function fetchGuitarsByFilter() {
  return async dispatch => {
    dispatch(getGuitars());
    try {
      const response = await fetch('/api/guitars/filterBy?filter={"colour":["buttercream"],"brand":"fender"}');
      const data = await response.json();
      dispatch(getGuitarsSuccess(data));
    } catch (error) {
      dispatch(getGuitarsFailure());
    }
  }
}
