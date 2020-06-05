import React from 'react';

function EmptyTile({times}) {
  const list = [...Array(times)].map(() => 
    <div className="tile empty"></div>
  );

  return <React.Fragment>
    {list}
  </React.Fragment>;
}

export default EmptyTile;