import React from 'react';
import ShapesEnum from '../shapes-enum';

function Shapes() {
  const shapeClick = (shape) => {
    // debugger;
  }

  return (
    // <div className="sidebar__shapes">
    //   <a href="#" onClick={() => shapeClick(ShapesEnum.SINGLE_CUT)}><img src="/singlecut_outline.png" alt="Single Cut Guitars"/></a>
    //   <a href="#" onClick={() => shapeClick(ShapesEnum.S_TYPE)}><img src="/stype_outline.png" alt="S-Type Guitars"/></a>
    //   <a href="#" onClick={() => shapeClick(ShapesEnum.T_TYPE)}><img src="/ttype_outline.png" alt="T-Type Guitars"/></a>
    //   <a href="#" onClick={() => shapeClick(ShapesEnum.V_TYPE)}><img src="/v_outline.png" alt="V-Type Guitars"/></a>
    // </div>

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

export default Shapes;
