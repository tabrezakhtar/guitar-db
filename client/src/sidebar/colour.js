import React, {useState} from 'react';

function Colour({id, bgColour}) {
  const [toggle, setToggle] = useState(-1)

  function toggleImage() {
    setToggle(toggle * -1);
  }

  let hideImage = '';
  if (toggle === -1) {
    hideImage = 'hide';
  }

  return <div className={'colour ' + bgColour}>
    <label htmlFor={id}>
      <input type="checkbox" id={id} name={id} className="visually-hidden" onChange={toggleImage}/>
      <img src="/tick.svg" alt="tick" className={hideImage}/>
    </label>
  </div>
}
 
export default Colour;