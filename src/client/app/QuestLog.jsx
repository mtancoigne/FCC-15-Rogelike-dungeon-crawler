import React from 'react';

class QuestLog extends React.Component{
  constructor(props){
    super(props);
  }

  render(){

    var content=[]
    for(let i=0; i<this.props.messages.length; i++){
      content.push(<div className={'message-'+this.props.messages[i].type} key={this.props.messages[i].id}>{this.props.messages[i].message}</div>);
    }
    return(
      <div className="panel">
        <div id="questLog">
          {content}
        </div>
      </div>
    );
  }
}

export default QuestLog;
