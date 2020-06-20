import React from 'react';
import EmptyTile from './empty-tile';
import LoadingTile from './loading-tile';
import {capitalize, divide} from 'lodash'

function Tiles({guitars, onOpenModal, loading}) {

  if (loading) {
    return <ul className="tile-container">
      <LoadingTile times={8}/>
    </ul>;
  }

  if (!guitars.length) {
    return <div className="no-results">No results found with your current filter.</div>;
  }

  const list = guitars.map(guitar => 
    <li className="tile" onClick={() => onOpenModal(`/images/${guitar.filename}`)}>
      <span className="like"><span role="img" aria-label="pin emoji">📌</span></span>
      <img src={`/images/${guitar.filename}`} alt={`${guitar.brand} ${guitar.name}`}/>
      <span className="title">{capitalize(guitar.brand) + ' ' + capitalize(guitar.name)}</span>
      <span className="description">{guitar.description}</span>
    </li>
  )
  return <ul className="tile-container">
    {list}
    <EmptyTile times={4}/>
  </ul>;
}

export default Tiles;