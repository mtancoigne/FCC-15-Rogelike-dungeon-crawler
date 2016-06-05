import React from 'react';

import Cell from './Cell.jsx';

class Row extends React.Component{

  render(){
    var cellId=-1;
    var cells=this.props.rowData.map((cell)=>{
      cellId++;
      var position=cellId+':'+this.props.y;
      var itemId=null;
      var item=null;
      // find items
      /*for(let i in this.props.items){
        if(this.props.items[i].position===position){
          itemId=i;
          item=this.props.items[i];
          console.log('... found a '+i);
        }
      }*/
      return (<Cell
        cellData={this.props.cells[position]}
        position={position}
        key={position}
        items={this.props.items}
        />);
    });
    return (
      <div className="map-row">
        {cells}
      </div>
    );
  }
}

export default Row;
