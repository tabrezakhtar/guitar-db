import React from 'react';
import { connect } from 'react-redux';
import { fetchGuitarsByFilter, updateFilter } from '../actions/filtersActions'
import ShapesEnum from '../shapes-enum';
import FilterTypes from '../filter-types';

function Shapes({dispatch, filters}) {
  const shapeClick = (shape) => {
    dispatch(updateFilter(FilterTypes.SHAPE, shape));
  }

  return (
    <div className="sidebar__shapes">
      <input type="radio" id="radioSingleCut" name="guitarsShapes" value={ShapesEnum.SINGLE_CUT} onClick={() => shapeClick(ShapesEnum.SINGLE_CUT)}/>
      <label for="radioSingleCut">
        <img src="/singlecut_outline.png" alt="Single Cut Guitars"/>
      </label>

      <input type="radio" id="radioSType" name="guitarsShapes" value={ShapesEnum.S_TYPE} onClick={() => shapeClick(ShapesEnum.S_TYPE)}/>
      <label for="radioSType">
        <img src="/stype_outline.png" alt="S-Type Guitars"/>
      </label>

      <input type="radio" id="radioTType" name="guitarsShapes" value={ShapesEnum.T_TYPE} onClick={() => shapeClick(ShapesEnum.T_TYPE)}/>
      <label for="radioTType">
        <img src="/ttype_outline.png" alt="T-Type Guitars"/>
      </label> 

      <input type="radio" id="radioVType" name="guitarsShapes" value={ShapesEnum.V_TYPE} onClick={() => shapeClick(ShapesEnum.V_TYPE)}/>
      <label for="radioVType">
        <img src="/v_outline.png" alt="V-Type Guitars"/>
      </label> 
    </div>
  );
}

const mapStateToProps = state => ({
  filters: state.filters
})

export default connect(mapStateToProps)(Shapes)