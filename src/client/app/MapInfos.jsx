import React from 'react';

class MapInfos extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    return(
      <div>
        <h2>Dungeon:</h2>
        <p>Final floor of Doom</p>
        <ul>
          <li>Bosses: 1/1</li>
          <li>Enemies: 20/20</li>
          <li>Chests: 10/10</li>
        </ul>
      </div>
    );
  }
}

export default MapInfos;
