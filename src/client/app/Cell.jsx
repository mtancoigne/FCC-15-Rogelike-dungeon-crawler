import React from 'react';

class Cell extends React.Component{
  render(){
    var className='map-cell';
    if(['visible', 'half'].indexOf(this.props.cellData.type.discovered)>-1){
      var tmp='';
      // Adding styles from cellData
      this.props.cellData.type.classNames.map((c)=>{tmp+=' map-cell-'+c});

      className+=tmp;
      // Items
      for(let i in this.props.items){
        if(this.props.items[i].position===this.props.position){
          className+=' map-cell-item-'+this.props.items[i].className;
        }
      }
      if(this.props.cellData.type.discovered=='half'){className+=' map-cell-void-half'};
    }else{
      className+=' map-cell-void';
    }
    className+=' map-cell-'+this.props.cellData.x+'-'+this.props.cellData.y

    return (<div className={className}></div>);
  }
}

export default Cell;
