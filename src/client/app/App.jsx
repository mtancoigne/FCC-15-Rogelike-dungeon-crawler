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
  ReactDOM.render(<App />, document.getElementById('app'));
});
