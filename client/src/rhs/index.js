import React from 'react';

function Tiles({guitars}) {
  const list = guitars.map(guitar => 
    <div>
      {guitar.brand + ' ' + guitar.name}
      <img src="/images/strat1.jpeg" alt="fender1" width="100px"/>
    </div>
  )
  return <div>{list}</div>;
}

export default Tiles;