import React from 'react';

function EmptyTile({times}) {
  const list = [...Array(times)].map(() => 
    <li className="tile empty" />
  );

  return <React.Fragment>
    {list}
  </React.Fragment>;
}

export default EmptyTile;