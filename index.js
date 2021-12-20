/**
 * Some Note to explain:
 * 1. Client side should enter the name then doing the connect action.
 *     1.1 e.g. socketObjects = { player1Name: player1, player2Name: player2 }
 * 2. Socket can support deliver a JSON object in one communication.
 *     2.1 e.g. client side can send { param1: value1, param2: value2 ...... }
 *     2.2 The message should be changed into JSON object first in client side.
*/


/************************************** Variable And Constants Declaration *******************************************/


// Create Express Service.
const app = require('express')();
// Bind the HTTP Service.
const http = require('http').createServer(app);
// Inject the Socket.io
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

// The object to store the clients.
let socketObjects = {}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


/************************************** Socket Logic *****************************************************************/


// Method will execute during connection event.
io.on('connection', (client) => {
  
  // Event: Register the client
  client.on('register', data=> {
    console.log('RECEIVE USER NAME:', "The client " + data.name + " has enter the room who is a " + data.grade + " student.")
    client.username = data.name
    socketObjects[data.name] = client
    io.emit('chat message', "The client " + data.name + " has enter the room who is a " + data.grade + " student.")
  })

  // Event: Show Chat Message. (Receive from client.)
  client.on('chat message', msg => {
    console.log('RECEIVE CHAT MESSAGE FROM :', "Client " + client.username + " says " + msg)
    io.emit('chat message', msg);
  });

  // Event: Disconnect. (Receive fro client)
  client.on('disconnect', () => {
    console.log('RECEIVE DISCONNECT :', "Client " + client.username + " leave the room")
    delete socketObjects[client.id]
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
