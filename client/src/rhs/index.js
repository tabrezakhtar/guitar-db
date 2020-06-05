import React from 'react';
import EmptyTile from './empty-tile';

function Tiles({guitars}) {
  const list = guitars.map(guitar => 
    <div className="tile">
      <img src="/images/strat1.jpeg" alt="fender1"/>
      <span className="title">{guitar.brand + ' ' + guitar.name}</span>
      <span className="description">Player Series Stratocaster White</span>
    </div>
  )
  return <React.Fragment>
    {list}
    <EmptyTile times={3}/>
  </React.Fragment>;
}

export default Tiles;