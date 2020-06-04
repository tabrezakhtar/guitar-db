import React from 'react';
import Colour from './colour';

function SideBar() {
  return (
    <div className="sidebar">
      <span className="sidebar__category">view by shape</span>

      <div className="sidebar__shapes">
        <span><img src="/singlecut_outline.png" alt="Single Cut Guitars"/></span>
        <span><img src="/stype_outline.png" alt="S-Type Guitars"/></span>
        <span><img src="/ttype_outline.png" alt="T-Type Guitars"/></span>
        <span><img src="/v_outline.png" alt="V-Type Guitars"/></span>
      </div>

      <div className="sidebar__filters">
        <div className="form">
          
          <div className="form__group">
            <label className="form__label" htmlFor="brand">Brand</label>
            <select className="form__select" name="brand">
              <option value="fender">Fender</option>
              <option value="prs">PRS</option>
              <option value="ibanez">Ibanez</option>
            </select>
          </div>

          <div className="colourContainer">
            <Colour id="chk1" bgColour="red" checked={true}/>
            <Colour id="chk2" bgColour="white"/>
            <Colour id="chk3" bgColour="yellow"/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideBar;
