const express = require('express');
const cors = require('cors');
const app = express();
const expressWs = require('express-ws')(app);

const port = 8000;

app.use(cors());

const clients = {};

app.ws('/chat', (ws, req) => {
  const id = req.get('sec-websocket-key');
  clients[id] = ws;

  console.log('Client connected.');
  console.log('Number of active connections: ', Object.values(clients).length);

  let username;

  ws.on('message', (msg) => {
    console.log('Client sent message: ', msg);
    let decodedMessage;

    try {
      decodedMessage = JSON.parse(msg);
    } catch (e) {
      return ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Message is not JSON'
      }));
    }

    switch (decodedMessage.type) {
      case 'SET_USERNAME':
        username = decodedMessage.username;
        break;
      case 'CREATE_MESSAGE':
        Object.values(clients).forEach(client => {
          client.send(JSON.stringify({
            type: 'NEW_MESSAGE',
            text: decodedMessage.text,
            username: username
          }));
        });
        break;
      default:
        return ws.send(JSON.stringify({
          type: 'ERROR',
          message: 'Unknown message type'
        }));
    }

  });

  ws.on('close', (msg) => {
    delete clients[id];
    console.log('Client disconnected.');
    console.log('Number of active connections: ', Object.values(clients).length);
  });
});

app.listen(port, () => {
  console.log(`Server started on ${port} port!`);
});