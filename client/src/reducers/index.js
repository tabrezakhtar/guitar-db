import { combineReducers } from 'redux'

import guitarsReducer from './guitarsReducer'
import filtersReducer from './filtersReducer'

const rootReducer = combineReducers({
  guitars: guitarsReducer,
  filters: filtersReducer
})

export default rootReducer
