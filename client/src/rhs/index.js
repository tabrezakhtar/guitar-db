import React from 'react';

function Tiles({guitars}) {
  const list = guitars.map(guitar => <li>{guitar.brand + ' ' + guitar.name}</li>)
  return <ul>{list}</ul>;
}

export default Tiles;