import { combineReducers } from 'redux'

import guitarsReducer from './guitarsReducer';
import filtersReducer from './filtersReducer';
import menuReducer from './menuReducer';

const rootReducer = combineReducers({
  guitars: guitarsReducer,
  filters: filtersReducer,
  selected: menuReducer
})

export default rootReducer
