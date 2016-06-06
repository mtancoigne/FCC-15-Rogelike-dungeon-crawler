import React from 'react';

class MapInfos extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    return(
      <div className="panel">
        <h2>Dungeon:</h2>
        <p>Final floor of Doom</p>
          <p>Bosses: 1/1</p>
          <p>Enemies: 20/20</p>
          <p>Chests: 10/10</p>
      </div>
    );
  }
}

export default MapInfos;
