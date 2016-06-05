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

/**
Generates a map.
Original idea found here: http://web.archive.org/web/20110825054218/http://properundead.com/2009/03/cave-generator.html

@author mtancoigne, 15/05/2016
@license MIT

@var array grid The map. Walls are true, floor is false. No lava
*/
var MapGen=function(base, reductions, cleanup){
  /**
  Returns 0 if the current cell is a floor cell
  Returns 1 if it's a wall cell, or if outside of the map.

  @var x int Current row
  @var y int Current col
  */
  this._getCellState=function(x,y){
    if(x>=0 && y>=0 && x<this.grid.length && y<this.grid.length){
      return (this.grid[x][y]===true)?1:0;
    }else{
      return 1; // Outside, so it's a wall.
    }
  }

  /**
  Checks if a cell is isolated and returns its new state.

  @var x int Current row
  @var y int Current col
  */
  this._isIsolated=function(x, y){
    var currState=this._getCellState(x, y);
    var sum=0;
    // Cumulate the values
    sum+=this._getCellState(x-1, y-1);
    sum+=this._getCellState(x, y-1);
    sum+=this._getCellState(x+1, y-1);
    sum+=this._getCellState(x-1, y);
    sum+=this._getCellState(x+1, y);
    sum+=this._getCellState(x-1, y+1);
    sum+=this._getCellState(x, y+1);
    sum+=this._getCellState(x+1, y+1);

    // Compare and convert
    if(currState===0 && sum>5){
      return true; // Wall conversion
    }else if(currState===1 && sum<5){
      return false; // Floor conversion
    }else{ // Same value
      return this.grid[x][y];
    }
  }

  /**
  Creates a map of size base*(reductions^2)

  @var int base Base size of the map
  @var int reductions Number of reductions.
  */
  this._createMap=function(base, reductions, cleanup){
    var fillTreshold=3;
    var percentage=0.9;
    // First pass:
    this.grid=[];
    for(let i=0; i<base; i++){
      var row=[]
      for(let j=0; j<base; j++){
          row.push((Math.floor(Math.random()*100)>50)?true:false);
        //}
      }
      this.grid.push(row);
    }
    //return grid;
    // Now, the reductions
    for(let n=0; n<reductions; n++){
      var newReduction=[];
      for(let i=0; i<this.grid.length; i++){
        var newRow1=[];
        var newRow2=[];
        for(let j=0; j<this.grid.length; j++){
          /* Make a block of 4 cells from one, depending on its state :
             the cells created have 75% chance to be the same as the original
          */
          let state=this.grid[i][j]; // true or false
          newRow1.push((Math.random()<percentage)?state:!state);
          newRow1.push((Math.random()<percentage)?state:!state);
          newRow2.push((Math.random()<percentage)?state:!state);
          newRow2.push((Math.random()<percentage)?state:!state);
        }
        newReduction.push(newRow1);
        newReduction.push(newRow2);
      }
      this.grid=newReduction.slice();
    }

    // Closing the map
    for(let i=0; i<this.grid.length; i++){
      for(let j=0; j<this.grid.length; j++){
        if(i===0 || i===this.grid.length-1 || j===0 || j===this.grid.length-1){
          this.grid[i][j]=true;
        }
      }
    }

    // Looking for empty cells
    if(cleanup===true){
      for(let i=0; i<this.grid.length; i++){
        for(let j=0; j<this.grid.length; j++){
          this.grid[i][j]=this._isIsolated(i, j);
        }
      }
    }
  }

  this._getStyle=function(x, y){
    if(this.grid[x][y]===false){
      return '';
    }else{

    }
  }

  this._checksum=function(x, y){
    var sum='';
    var currentCell=this._getCellState(x, y);
    // Cumulate the values
    sum+=this._getCellState(x-1, y-1);
    sum+=this._getCellState(x-1, y);
    sum+=this._getCellState(x-1, y+1);
    sum+=this._getCellState(x, y-1);
    sum+=currentCell;
    sum+=this._getCellState(x, y+1);
    sum+=this._getCellState(x+1, y-1);
    sum+=this._getCellState(x+1, y);
    sum+=this._getCellState(x+1, y+1);

    console.log({x:x, y:y, checksum:sum, int:parseInt(sum, 2)});
    // Corners: outside
    if(['111111110', '000000001'].indexOf(sum)>=0){return 'otl';}
    if(['111111011', '000000100'].indexOf(sum)>=0){return 'otr';}
    if(['110111111', '001000000'].indexOf(sum)>=0){return 'obl';}
    if(['011111111', '100000000'].indexOf(sum)>=0){return 'obr';}

    // Corners: inside
    if(['000011011', '111100100'].indexOf(sum)>=0){return 'itl';}
    if(['000110110', '111001001'].indexOf(sum)>=0){return 'itr';}
    if(['011011000', '100100111'].indexOf(sum)>=0){return 'ibl';}
    if(['110110000', '001001111'].indexOf(sum)>=0){return 'ibr';}

    // Corners: between
    if(['111100101', '000011010'].indexOf(sum)>=0){return 'btl';}
    if(['111001101', '000110010'].indexOf(sum)>=0){return 'btr';}
    if(['101100111', '010011000'].indexOf(sum)>=0){return 'bbl';}
    if(['101001111', '010110000'].indexOf(sum)>=0){return 'bbr';}

    // Line blocks
    if([
      '000111111', '111000000',
      '001111111', '110000000',
      '110111111', '010000000',
      '100111111', '011000000'].indexOf(sum)>=0){ return 'it';}
    if([
      '011011011', '100100100',
      '111011011', '000100100',
      '111011111', '000100000',
      '011011111', '100100000'].indexOf(sum)>=0){ return 'il';}
    if([
      '111111000', '000000111',
      '111111001', '000000110',
      '111111101', '000000010',
      '111111100', '000000011'].indexOf(sum)>=0){ return 'ib';}
    if([
      '110110110', '001001001',
      '111110110', '000001001',
      '111110111', '000001000',
      '110110111', '001001000'].indexOf(sum)>=0){ return 'ir';}
    // Simple tiles
    if(['000010010', '111101101'].indexOf(sum)>=0){ return 'svt';}
    if([
      '010010010', '101101101',
      '110010010', '001101101',
      '011010010', '100101101',
      '010010011', '101101100',
      '010010110', '101101001',
      '011010011', '100101100',
      '110010110', '001101001',
      '111010010', '000101101',
      '101101000', '010010111'].indexOf(sum)>=0){ return 'svm';}
    if(['010010000', '101101111'].indexOf(sum)>=0){ return 'svb';}
    if(['000011000', '111100111'].indexOf(sum)>=0){ return 'shl';}
    if([
      '000111000', '111000111',
      '000111100', '111000011',
      '100111000', '011000111',
      '001111000', '110000111',
      '000111001', '111000110',
      '000111101', '111000010',
      '101111000', '010000111',
      '100111100', '011000011',
      '001111001', '110000110'].indexOf(sum)>=0){ return 'shm';}
    if(['000110000', '111001111'].indexOf(sum)>=0){ return 'shr';}
    // Intersections
    if(['000111010', '111000101'].indexOf(sum)>=0){ return 'stt';}
    if(['010110010', '101001101'].indexOf(sum)>=0){ return 'str';}
    if(['010111000', '101000111'].indexOf(sum)>=0){ return 'stb';}
    if(['010011010', '101100101'].indexOf(sum)>=0){ return 'stl';}
    // Alone
    if(['000010000', '111101111'].indexOf(sum)>=0){ return 'sa';}
    // Full
    if(['111111111', '000000000'].indexOf(sum)>=0){ return 'sf';}

    // X intersections
    if(['101000101', '010111010'].indexOf(sum)>=0){return 'x';} // X
    // X (3 tiles)
    if(['101000100', '010111011'].indexOf(sum)>=0){return 'x3t';}
    if(['101000001', '010111110'].indexOf(sum)>=0){return 'x3l';}
    if(['001000101', '110111010'].indexOf(sum)>=0){return 'x3b';}
    if(['100000101', '011111010'].indexOf(sum)>=0){return 'x3r';}
    // X (2 tiles)
    if(['101000000', '010111111'].indexOf(sum)>=0){return 'x2t';}
    if(['001000001', '110111110'].indexOf(sum)>=0){return 'x2l';}
    if(['000000101', '111111010'].indexOf(sum)>=0){return 'x2b';}
    if(['100000100', '011111011'].indexOf(sum)>=0){return 'x2r';}
    // X (1 tile)
    if(['100000000', '111111110'].indexOf(sum)>=0){return 'x1tl';}
    if(['001000000', '110111111'].indexOf(sum)>=0){return 'x1tr';}
    if(['000000001', '111111110'].indexOf(sum)>=0){return 'x1br';}
    if(['000000100', '111111011'].indexOf(sum)>=0){return 'x1bl';}
  }
  /**
  Renders the map using jquery in the given target.
  The rendered lines/cells can have a prefixed id.
  */
  this.jQueryRender=function(target, prefix){
    for(let i=0; i<this.grid.length; i++){
      $(target).append('<div id="'+prefix+'row'+i+'" class="row"></div>');
      for(let j=0; j<this.grid.length; j++){
        var cellType=this._checksum(i, j);
        console.log({x:i,y:j, celltype:cellType});
        $('#'+prefix+'row'+i).append('<div id="cell'+i+'-'+j+'" class="cell '+cellType+(this.grid[i][j]===true?' cell-wall':' cell-floor')+'"></div>');
      }
    }
  }

  this._createMap(base, reductions, cleanup);
}

var test=[
  '11111111111111',
  '11000000000011',
  '11011101101011',
  '11011101101011',
  '11011101101011',
  '11000000000011',
  '11011100100011',
  '11000000000011',
  '11001111110011',
  '11001000010011',
  '11001111110011',
  '11000000000011',
  '11001101011111',
  '11111111111111'
];
var testArr=[];
for(let i=0; i<test.length; i++){
  let row=[];
  for(let j=0; j<test[i].length; j++){
    row.push((test[i][j]==='1')?true:false);
  }
  testArr.push(row);
}
var map=new MapGen(5,4);
//map.grid=testArr;
map.jQueryRender('#game');
