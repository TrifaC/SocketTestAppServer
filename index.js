/**
 * Some Note to explain:
 * 1. Client side should enter the name then doing the connect action.
 *     1.1 e.g. clientObjects = { player1Name: player1, player2Name: player2 }
 * 2. Socket can support deliver a JSON object in one communication.
 *     2.1 e.g. client side can send { param1: value1, param2: value2 ...... }
 *     2.2 The message should be changed into JSON object first in client side.
 */


/************************************** Variable And Constants Declaration *******************************************/

// Constants File Import.
const constants = require('./util/constants.json')
// Create Express Service.
const app = require('express')();
// Bind the HTTP Service.
const http = require('http').createServer(app);
// invoke the instrument for socket.io admin UI
const {
    instrument
} = require('@socket.io/admin-ui');
// Inject the Socket.io, bind the socket io with the admin UI.
const io = require('socket.io')(http, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true
    }
});
instrument(io, {
    auth: false
});
const port = process.env.PORT || 3000;

// The object to store the clients.
let clientObjects = {}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


/************************************* Support Functions ************************************************************/

    
    function initClientObject(client, data) {
        let clientObject = {}
        clientObject[constants.OBJECT_KEY.NAME] = data.name
        clientObject[constants.OBJECT_KEY.COUNT] = 0
        clientObject[constants.OBJECT_KEY.STATE] = constants.STATE.INIT
        return clientObject
    }


/************************************** Socket Logic *****************************************************************/


// Method will execute during connection event.
io.on(constants.SERVER_EVENT.CONNECTION, (client) => {
    // Event: Register the client
    client.on(constants.CLIENT_EVENT.REGISTER, data => {
        clientObjects[client.id] = initClientObject(client, data);
        console.log("****************************************************************************************************");
        console.log('RECEIVE REGISTER EVENT:', "Client " + data.name + " has enter the room who is a grade " + data.grade + " student.");
        console.log('OBJECT REVIEW:', JSON.stringify(clientObjects[client.id]))
        console.log("****************************************************************************************************\n");
        io.emit(constants.CLIENT_EVENT.CHAT, "Client " + data.name + " has enter the room who is a " + data.grade + " student.");
    })

    // Event: Show Chat Message. (Receive from client.)
    client.on(constants.CLIENT_EVENT.CHAT, msg => {
        console.log("****************************************************************************************************")
        console.log('RECEIVE CHAT EVENT :', "Client " + client.username + " says " + msg)
        console.log("****************************************************************************************************\n")        
        io.emit(constants.CLIENT_EVENT.CHAT, msg);
    });

    // Event: Start Sport Section.
    client.on(constants.CLIENT_EVENT.START, startPoint => {
        clientObjects[client.id][constants.OBJECT_KEY.STATE] = constants.STATE.START
        console.log("****************************************************************************************************")
        console.log('RECEIVE START EVENT :', "Client " + client.username + " start the sport section at " + startPoint)
        console.log('OBJECT REVIEW: :', JSON.stringify(clientObjects[client.id]))
        console.log("****************************************************************************************************\n")
        io.emit(constants.CLIENT_EVENT.START, startPoint);
    });

    // Event: Finish Sport Section.
    client.on(constants.CLIENT_EVENT.FINISH, finishPoint => {
        console.log("****************************************************************************************************")
        console.log('RECEIVE FINISH EVENT :', "Client " + client.username + " finish the sport section at  " + finishPoint)
        console.log("****************************************************************************************************\n")
        io.emit(constants.CLIENT_EVENT.FINISH, finishPoint);
    });

    // Event: Continuous Push up Section. (Test Only)
    client.on(constants.CLIENT_EVENT.PUSH_UP, pushUpTimePoint => {
        clientObjects[client.id][constants.OBJECT_KEY.COUNT] = pushUpTimePoint
        console.log("****************************************************************************************************")
        console.log('RECEIVE PUSH UP EVENT :', "Client " + clientObjects[client.id][constants.OBJECT_KEY.NAME] + " do a push a up, total " + pushUpTimePoint)
        console.log('OBJECT REVIEW :', JSON.stringify(clientObjects[client.id]))

        console.log("****************************************************************************************************\n")
        io.emit(constants.CLIENT_EVENT.PUSH_UP, pushUpTimePoint);
    });

    // Event: Disconnect. (Receive fro client, Server cannot get the name of client.)
    client.on(constants.CLIENT_EVENT.DISCONNECT, () => {
        console.log("****************************************************************************************************")
        console.log('CLIENT OBJECTS REVIEW:', JSON.stringify(clientObjects))
        console.log("****************************************************************************************************\n")
        //delete clientObjects[client.id]
    });

});

http.listen(port, () => {
    console.log("****************************************************************************************************")
    console.log(`Socket.IO server running at http://localhost:${port}/`);
    console.log("****************************************************************************************************\n")
});