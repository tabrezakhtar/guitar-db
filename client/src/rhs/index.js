import React from 'react';
import ImageLoader from '../ImageLoader';
import EmptyTile from './empty-tile';

function Tiles({guitars, onOpenModal}) {
  const list = guitars.map(guitar => 
    <li className="tile" onClick={onOpenModal}>
      <span className="like">📌</span>
      {ImageLoader(`/images/${guitar.filename}`, `${guitar.brand} ${guitar.name} image`)}
      <span className="title">{guitar.brand + ' ' + guitar.name}</span>
      <span className="description">{guitar.description}</span>
    </li>
  )
  return <ul className="tile-container">
    {list}
    <EmptyTile times={3}/>
  </ul>;
}

export default Tiles;