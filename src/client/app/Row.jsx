import React from 'react';

import Cell from './Cell.jsx';

class Row extends React.Component{

  render(){
    var cells=[];
    for(let x in this.props.rowData){
      var position=x+':'+this.props.y;
      var itemId=null;
      var item=null;
      cells.push(
        <Cell
          cellData={this.props.cells[position]}
          position={position}
          key={position}
          items={this.props.items}
          />
      );
    }
    return (
      <div className="map-row">
        {cells}
      </div>
    );
  }
}

export default Row;
