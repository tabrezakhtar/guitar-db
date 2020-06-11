import { combineReducers } from 'redux'

import guitarsReducer from './guitarsReducer'

const rootReducer = combineReducers({
  guitars: guitarsReducer
})

export default rootReducer
