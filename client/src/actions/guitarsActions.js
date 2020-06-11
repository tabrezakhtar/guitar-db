export const GET_GUITARS = 'GET GUITARS'
export const GET_GUITARS_SUCCESS = 'GET_GUITARS_SUCCESS'
export const GET_GUITARS_FAILURE = 'GET_GUITARS_FAILURE'

export const getGuitars = () => ({ type: GET_GUITARS })
export const getGuitarsSuccess = guitars => ({
  type: GET_GUITARS_SUCCESS,
  payload: guitars
})
export const getGuitarsFailure = () => ({ type: GET_GUITARS_FAILURE })

export function fetchGuitars() {
  return async dispatch => {
    dispatch(getGuitars());
    try {
      const response = await fetch('/api/guitars');
      const data = await response.json();
      dispatch(getGuitarsSuccess(data));
    } catch (error) {
      dispatch(getGuitarsFailure());
    }
  }
}
