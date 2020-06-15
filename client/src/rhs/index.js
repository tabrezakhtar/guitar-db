import React from 'react';
import EmptyTile from './empty-tile';
import LoadingTile from './loading-tile';

function Tiles({guitars, onOpenModal, loading}) {

  if (loading) {
    return <ul className="tile-container">
      <LoadingTile times={8}/>
    </ul>;
  }

  const list = guitars.map(guitar => 
    <li className="tile" onClick={() => onOpenModal(`/images/${guitar.filename}`)}>
      <span className="like">📌</span>
      <img src={`/images/${guitar.filename}`} alt={`${guitar.brand} ${guitar.name} image`}/>
      <span className="title">{guitar.brand + ' ' + guitar.name}</span>
      <span className="description">{guitar.description}</span>
    </li>
  )
  return <ul className="tile-container">
    {list}
    <EmptyTile times={4}/>
  </ul>;
}

export default Tiles;