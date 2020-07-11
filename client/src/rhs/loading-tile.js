import React from 'react';

function LoadingTile({times}) {
  const list = [...Array(times)].map(() => 
    <li className="tile tile__loading">
      <span className="like" />
      <img src={'/tail-spin.svg'} alt={'loading...'}/>
      <span className="title" />
      <span className="description" />
    </li>
  );

  return <React.Fragment>
    {list}
  </React.Fragment>;
}

export default LoadingTile;