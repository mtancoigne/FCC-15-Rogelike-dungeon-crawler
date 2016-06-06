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
        <p><span className="ico ico-boss"></span>{this.props.items.boss}/{this.props.orig.boss}</p>
        <p><span className="ico ico-enemy"></span>{this.props.items.enemy}/{this.props.orig.enemy}</p>
        <p><span className="ico ico-chest"></span>{this.props.items.chest}/{this.props.orig.chest}</p>
        <p><span className="ico ico-health"></span>{this.props.items.health}/{this.props.orig.health}</p>
        <p><span className="ico ico-floor"></span>Regular floor</p>
        <p><span className="ico ico-wall"></span>Wall</p>
        <p><span className="ico ico-water"></span>Water</p>
        <p><span className="ico ico-lava"></span>Lava</p>
      </div>
    );
  }
}

export default MapInfos;
