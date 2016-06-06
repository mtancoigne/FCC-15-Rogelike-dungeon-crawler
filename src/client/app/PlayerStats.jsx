import React from 'react';

class PlayerStats extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    var percent=Math.ceil(this.props.life/this.props.totalLife*100);
    var barColor='green';
    if(percent>=75){
      barColor='green';
    }else if(percent>=33){
      barColor='orange';
    }else{
      barColor='red';
    }

    return(
      <div className="avatar" id="target-player">
        <div className="avatar-header">
          <div className="avatar-img avatar-player">
          </div>
          <div className="avatar-content">
            <p className="avatar-name">
              {this.props.name}
            </p>
            <p className="avatar-description">
              {this.props.description}
            </p>
          </div>
        </div>
        <table>
          <tbody>
            <tr>
              <th>Level:</th>
              <td>
                {this.props.level}
              </td>
            </tr>
            <tr>
              <th>Life:</th>
              <td>
                <div className="progress">
                  <span>{this.props.life}/{this.props.totalLife}</span>
                  <div className="bar-wrap">&nbsp;<div className={'bar '+barColor} style={{width:percent+'%'}}></div></div>
                </div>

              </td>
            </tr>
            <tr>
              <th>Experience:</th>
              <td>
                {this.props.experience}
              </td>
            </tr>
            <tr>
              <th>Strength:</th>
              <td>
                {this.props.strength}
              </td>
            </tr>
            <tr>
              <th>Damage:</th>
              <td>
                {this.props.damage}
              </td>
            </tr>
            <tr>
              <th>Armor:</th>
              <td>
                {this.props.armor}
              </td>
            </tr>
            <tr>
              <th>Celerity:</th>
              <td>
                {this.props.celerity}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default PlayerStats;
