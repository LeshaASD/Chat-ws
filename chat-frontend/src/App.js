import React, { Component, Fragment } from 'react';

class App extends Component {
  state = {
    username: '',
    usernameSet: false,
    messages: [],
    messageText: ''
  };

  componentDidMount() {
    this.websocket = new WebSocket('ws://localhost:8000/chat');

    this.websocket.onmessage = (message) => {
      console.log(message.data);
      const decodedMessage = JSON.parse(message.data);

      switch (decodedMessage.type) {
        case 'NEW_MESSAGE':
          this.setState({
            messages: [
              ...this.state.messages,
              decodedMessage
            ]
          });
          break;
      }
    };
  }

  usernameChangeHandler = event => {
    this.setState({username: event.target.value});
  };

  changeMessageTextHandler = event => {
    this.setState({messageText: event.target.value});
  };

  usernameSetHandler = event => {
    event.preventDefault();

    const message = JSON.stringify({
      type: 'SET_USERNAME',
      username: this.state.username
    });

    this.websocket.send(message);
    this.setState({usernameSet: true});
  };

  sendMessageHandler = event => {
    event.preventDefault();

    const message = JSON.stringify({
      type: 'CREATE_MESSAGE',
      text: this.state.messageText
    });

    this.websocket.send(message);
  };

  canvasClicked = event => {
    console.log(event.clientX, event.clientY);
  };

  render() {
    return (
      <Fragment>
        {this.state.usernameSet ?
          <Fragment>
            {this.state.messages.map(message => (
              <p>
                <b>{message.username}: </b>
                <span>{message.text}</span>
              </p>
            ))}
            <form onSubmit={this.sendMessageHandler}>
              <input type="text" required
                     value={this.state.messageText}
                     onChange={this.changeMessageTextHandler} />
              <button type="submit">Send</button>
            </form>
          </Fragment>
          :
          <form onSubmit={this.usernameSetHandler}>
            <input
              type="text" required
              value={this.state.username}
              onChange={this.usernameChangeHandler}/>
            <button type="submit">Enter chat</button>
          </form>
        }
      </Fragment>
    );
  }
}

export default App;
