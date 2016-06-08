import React from 'react';

class PlayerStats extends React.Component{
  constructor(props){
    super(props);

    this._goDown=this._goDown.bind(this);
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
    var pBar='';
    if(this.props.life>0){
      pBar=(<div className="progress">
        <span>{this.props.life}/{this.props.totalLife}</span>
        <div className="bar-wrap">&nbsp;<div className={'bar '+barColor} style={{width:percent+'%'}}></div></div>
      </div>)
    }
    var button='';
    var btnClass=" btn-green"
    var btnText="Go deeper in the cave..."
    var bntOnClick=this._goDown;
    var hostiles=(this.props.items.enemy || 0)+(this.props.items.boss||0);
    if(hostiles > 0){
      btnClass=" disabled";
      btnText=hostiles+ ' hostile(s) remaining...';
      bntOnClick=null;
    }
    var button=(<button className={'btn btn-block'+btnClass} onClick={bntOnClick}>&gt; {btnText} &lt;</button>);

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
              <th><span className="ico ico-stat-level"></span>Level:</th>
              <td>
                {this.props.level}
              </td>
            </tr>
            <tr>
              <th><span className="ico ico-stat-life"></span>Life:</th>
              <td>
                {pBar}
              </td>
            </tr>
            <tr>
              <th><span className="ico ico-stat-xp"></span>Experience:</th>
              <td>
                {this.props.experience}
              </td>
            </tr>
            <tr>
              <th><span className="ico ico-stat-strength"></span>Strength:</th>
              <td>
                {this.props.strength}
              </td>
            </tr>
            <tr>
              <th><span className="ico ico-stat-damage"></span>Damage:</th>
              <td>
                {this.props.damage}
              </td>
            </tr>
            <tr>
              <th><span className="ico ico-stat-armor"></span>Armor:</th>
              <td>
                {this.props.armor}
              </td>
            </tr>
            <tr>
              <th><span className="ico ico-stat-celerity"></span>Celerity:</th>
              <td>
                {this.props.celerity}
              </td>
            </tr>
          </tbody>
        </table>
        {button}
      </div>
    );
  }
  _goDown(){
    this.props.goDown();
  }
}

export default PlayerStats;
