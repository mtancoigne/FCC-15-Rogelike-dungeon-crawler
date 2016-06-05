import React from 'react';

class PlayerStats extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    return(
      <div>
        <h2>Stats:</h2>
        <ul>
          <li>Level: <strong>{this.props.level}</strong></li>
          <li>Life: <strong>{this.props.life}</strong>/{this.props.totalLife}</li>
          <li>Experience: {this.props.experience}</li>
          <li>Damage: {this.props.damage}</li>
          <li>Attack: {this.props.attack}</li>
        </ul>
      </div>
    );
  }
}

export default PlayerStats;
