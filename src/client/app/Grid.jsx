import React from 'react';
import Row from './Row.jsx';

class Grid extends React.Component{
  render(){
    var rowId=-1;

    var gridRows=this.props.grid.map((row)=>{
      rowId++;
      return (
        <Row
          rowData={row}
          cells={this.props.cells}
          key={rowId}
          y={rowId}
          items={this.props.items}
        />
      );
    });
    return(
      <div id="grid">
        {gridRows}
      </div>
    );
  }
}

export default Grid;
