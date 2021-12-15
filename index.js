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
  
  // Append the client into the object, and broadcast that some client has enter the room.
  // console.log("client connected: The id is " + client.id)
  socketObjects[client.id] = client
  io.emit('chat message', "A client " + client.id + " enter the room")

  client.on('chat message', msg => {
    console.log(msg)
    io.emit('chat message', msg);
  });

  client.on('disconnect', () => {
    delete socketObjects[client.id]
    client.emit('Le')
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
