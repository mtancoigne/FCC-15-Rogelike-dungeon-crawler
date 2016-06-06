import React from 'react';

class EnemyInfos extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    var name='Not in combat.';
    var description='';
    var link='';
    var level='';
    var damage='';
    var strength='';
    var celerity='';
    var armor='';
    var life='';
    var pBar='';
    if(this.props.name!=null){
      name=this.props.name;
      description=this.props.description;
      link=this.props.link;
      level=this.props.level;
      damage=this.props.stats.damage;
      strength=this.props.stats.strength;
      armor=this.props.stats.armor;
      celerity=this.props.stats.celerity;
      var barColor='green';
      var percent=Math.ceil(this.props.stats.life/this.props.stats.totalLife*100);

      if(percent>=75){
        barColor='green';
      }else if(percent>=33){
        barColor='orange';
      }else{
        barColor='red';
      }

      pBar=(<div className="progress">
        <span>{this.props.stats.life}/{this.props.stats.totalLife}</span>
        <div className="bar-wrap">&nbsp;<div className={'bar '+barColor} style={{width:percent+'%'}}></div></div>
      </div>

      );
    }

    return(
      <div className="avatar" id="target-enemy">
        <div className="avatar-header">
          <div className={"avatar-img avatar-"+(this.props.name!=null?this.props.className:'none')}>
          </div>
          <div className="avatar-content">
            <p className="avatar-name">
              {name}
            </p>
            <p className="avatar-description">
              {description}
            </p>
          </div>
        </div>
        <a
          className={"btn"+(this.props.name==null?' disabled':'')}
          href={link}
          target="_blank">
          More infos...
        </a>
        <table>
          <tbody>
            <tr>
              <th><span className="ico ico-stat-level"></span>Level:</th>
              <td>
                {level}
              </td>
            </tr>
            <tr>
              <th><span className="ico ico-stat-life"></span>Life:</th>
              <td>
                {pBar}
              </td>
            </tr>
            <tr>
              <th><span className="ico ico-stat-strength"></span>Strength:</th>
              <td>
                {strength}
              </td>
            </tr>
            <tr>
              <th><span className="ico ico-stat-damage"></span>Damage:</th>
              <td>
                {damage}
              </td>
            </tr>
            <tr>
              <th><span className="ico ico-stat-armor"></span>Armor:</th>
              <td>
                {armor}
              </td>
            </tr>
            <tr>
              <th><span className="ico ico-stat-celerity"></span>Celerity:</th>
              <td>
                {celerity}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default EnemyInfos;
