import React from 'react';

class MapInfos extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    return(
      <div className="panel" id="mapInfos">
        <h2>Dungeon:</h2>
        <p>Final floor of Doom</p>
        <p><span className="ico ico-boss"></span>{this.props.items.boss!=undefined?this.props.items.boss:0}/{this.props.orig.boss}</p>
        <p><span className="ico ico-enemy"></span>{this.props.items.enemy!=undefined?this.props.items.enemy:0}/{this.props.orig.enemy}</p>
        <p><span className="ico ico-chest"></span>{this.props.items.chest!=undefined?this.props.items.chest:0}/{this.props.orig.chest}</p>
        <p><span className="ico ico-health"></span>{this.props.items.health!=undefined?this.props.items.health:0}/{this.props.orig.health}</p>
        <p><span className="ico ico-floor"></span>Regular floor</p>
        <p><span className="ico ico-wall"></span>Wall</p>
        <p><span className="ico ico-water"></span>Water</p>
        <p><span className="ico ico-lava"></span>Lava</p>
      </div>
    );
  }
}

export default MapInfos;
