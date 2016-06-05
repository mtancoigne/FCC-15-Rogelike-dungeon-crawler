import React from 'react';

class QuestLog extends React.Component{
  constructor(props){
    super(props);
  }

  render(){

    var content=[]
    for(let i=this.props.messages.length-1; i>=0; i--){
      content.push(<div className={'message-'+this.props.messages[i].type} key={this.props.messages[i].id}>{this.props.messages[i].message}</div>);
    }

    return(
      <div>
        <h2>Quest log</h2>
        <div id="questLog">
          {content}
        </div>
      </div>
    );
  }
}

export default QuestLog;
