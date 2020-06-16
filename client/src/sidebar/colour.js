import React, {useState} from 'react';

function Colour({id, bgColour, onColourSelected, checked}) {
  const [toggle, setToggle] = useState(checked);

  function toggleImage() {
    setToggle(!toggle);
    onColourSelected(bgColour, !toggle);
  }

  let hideImage = '';
  if (!toggle) {
    hideImage = 'hide';
  }

  return <div className={'colour ' + bgColour} title={bgColour}>
    <label htmlFor={id}>
      <input type="checkbox" id={id} name={id} className="visually-hidden" onChange={toggleImage}/>
      <img src="/tick.svg" alt="tick" className={hideImage}/>
    </label>
  </div>
}

export default Colour;