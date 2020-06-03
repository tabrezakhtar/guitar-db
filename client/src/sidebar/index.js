import React from 'react';

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
    </div>
  );
}

export default SideBar;
