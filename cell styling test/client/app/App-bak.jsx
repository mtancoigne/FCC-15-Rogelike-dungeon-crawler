console.clear();

import React from 'react';
import {render} from 'react-dom';

/* ------------------------------

Main React component

------------------------------ */
class App extends React.Component {

  constructor(props){
    super(props);
    // Default data and configuration
    this.state={}
  }

  render() {
    return (
      <div>
        Empty app
      </div>
    );
  }
}


/* ------------------------------
Render the App
------------------------------ */
$(document).ready(()=>{
  //render(<App />, document.getElementById('app'));
});

function randomizer1(){
  var size=20;
  for(let i=0; i<size; i++){
    $('#game').append('<div id="row'+i+'" class="row"></div>');
    for(let j=0; j<size; j++){
      var cellType='';
      // Walls all around:
      if(i===0 || i===size-1 || j===0 || j===size-1){
        cellType+=' cell-wall';
      }else{
        // Any other type with a high percentage of chance it's a floor tile
        var seed=Math.floor(Math.random()*100);
        if(seed<80){
            cellType+=' cell-floor';
        }else if(seed<90){
          cellType+=' cell-wall';
        }else if(seed<95){
          cellType+=' cell-enemy';
        }else if(seed<98){
          cellType+=' cell-item';
        }else{
          cellType+='cell-boss';
        }
      }
      // Rendering
      $('#row'+i).append('<div id="cell'+i+'-'+j+'" class="cell'+cellType+'"></div>');
    }
  }
}


/*--------------------------------------------------------*/
// Returns the current state of a given cell : if the cell don't exists, it's a wall.

var MapGen=function(){

}


function isIsolated(x, y, arr){
  var currState=getCellState(x, y, arr);
  // Get adjacent cells
  var sum=0;

  sum+=getCellState(x-1, y-1, arr);
  sum+=getCellState(x, y-1, arr);
  sum+=getCellState(x+1, y-1, arr);
  sum+=getCellState(x-1, y, arr);
  sum+=getCellState(x+1, y, arr);
  sum+=getCellState(x-1, y+1, arr);
  sum+=getCellState(x, y+1, arr);
  sum+=getCellState(x+1, y+1, arr);

  if(currState===0 && sum>5){
    return true; // Wall conversion
  }else if(currState===1 && sum<5){
    return false; // Floor conversion
  }else{ // Same value
    return arr[x][y];
  }
}
/*
will create a random map of base*reductions
Walls have the 'true' value.
*/
function randoReducter(base, reductions){
  var fillTreshold=3;
  var percentage=0.9;
  // First pass:
  var grid=[];
  var out='';
  for(let i=0; i<base; i++){
    var row=[]
    for(let j=0; j<base; j++){
        row.push((Math.floor(Math.random()*100)>50)?true:false);
      //}
    }
    grid.push(row);
  }
  //return grid;
  // Now, the reductions
  for(let n=0; n<reductions; n++){
    var newReduction=[];
    for(let i=0; i<grid.length; i++){
      var newRow1=[];
      var newRow2=[];
      for(let j=0; j<grid.length; j++){
        /* Make a block of 4 cells from one, depending on its state :
           the cells created have 75% chance to be the same as the original
        */
        let state=grid[i][j]; // true or false
        newRow1.push((Math.random()<percentage)?state:!state);
        newRow1.push((Math.random()<percentage)?state:!state);
        newRow2.push((Math.random()<percentage)?state:!state);
        newRow2.push((Math.random()<percentage)?state:!state);
      }
      newReduction.push(newRow1);
      newReduction.push(newRow2);
    }
    grid=newReduction.slice();
  }

  // Closing the map
  for(let i=0; i<grid.length; i++){
    for(let j=0; j<grid.length; j++){
      if(i===0 || i===grid.length-1 || j===0 || j===grid.length-1){
        grid[i][j]=true;
      }
    }
  }

  // Looking for empty cells
  for(let i=0; i<grid.length; i++){
    for(let j=0; j<grid.length; j++){
      grid[i][j]=isIsolated(i, j, grid);
    }
  }

  return grid;
}

// Try of randoReducter
var grid=randoReducter(5,4);

for(let i=0; i<grid.length; i++){
  $('#game').append('<div id="row'+i+'" class="row"></div>');
  for(let j=0; j<grid.length; j++){
    $('#row'+i).append('<div id="cell'+i+'-'+j+'" class="cell'+(grid[i][j]===true?' cell-floor':' cell-wall')+'"></div>');
  }
}

//Styling cells
