import React from 'react';

class Cell extends React.Component{
  render(){
    var className='map-cell';
    if(this.props.cellData.discovered){
      className+=' map-cell-'+this.props.cellData.type.name;

      for(let i in this.props.items){
        if(this.props.items[i].position===this.props.position){
          className+=' map-cell-item-'+this.props.items[i].className;
        }
      }
    }else{
      className+=' map-cell-void';
    }
    className+=' map-cell-'+this.props.cellData.x+'-'+this.props.cellData.y

    return (<div className={className}></div>);
  }
}

export default Cell;
