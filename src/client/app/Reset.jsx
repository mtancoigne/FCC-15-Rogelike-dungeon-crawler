import React from 'react';

class Reset extends React.Component{
  render(){
    if(this.props.gameOver==false){
      return null;
    }
    return(
      <div>
        <div className="overlay"/>
        <div id="reset" className="panel">
          <p>{this.props.message}</p>
          <button className="btn btn-block btn-green" onClick={this._reset.bind(this)}>Restart</button>
        </div>
      </div>
    );
  }
  _reset(){
    this.props.reset();
  }
}

export default Reset;
