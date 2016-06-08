import React from 'react';
import Row from './Row.jsx';

class Grid extends React.Component{
  render(){
    var rowId=-1;
    var gridRows=[];
    for(let i in this.props.grid){
      gridRows.push(
        <Row
          rowData={this.props.grid[i]}
          cells={this.props.cells}
          key={i}
          y={i}
          items={this.props.items}
        />
      )
    }
    return(
      <div id="grid" className="panel">
        {gridRows}
      </div>
    );
  }
}

export default Grid;
