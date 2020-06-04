import React, {useState} from 'react';

function Colour({id, bgColour, checked}) {
  const [toggle, setToggle] = useState(checked)

  function toggleImage() {
    setToggle(!toggle);
  }

  let hideImage = '';
  if (!toggle) {
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