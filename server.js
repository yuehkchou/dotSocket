var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html')
});

http.listen(3000, function(){
  console.log('listen on *: 3000')
})
var users = [];
io.on('connection', function(socket) {
  // socket.broadcast.emit('connected');
  socket.join('room'); // joined the room name 'room'
  socket.emit('user join', 'You are connected!');
  socket.broadcast.emit('user join', 'Another client has just connected!');
  // on user join
  socket.on('new user', function(username) {
    if(users.indexOf(username) != -1) {
      // cb(false);
    } else {
      // cb(true);
      socket.nickname = username;
      users.push(socket.nickname);
      io.sockets.emit('usernames', users)
      updateUsers();
    }
  })
  // set nick name
  socket.on('nickname', function(nickname) {
    socket.nickname = nickname
    users.push(socket.nickname);
    updateUsers()
    console.log(users)
  })
  // helper function
  function updateUsers() {
    io.sockets.emit('usernames', users)
  }
  // on discconect
  socket.on('disconnect', function(){
    if(!socket.nickname) return
    users.splice(users.indexOf(socket.nickname), 1);
    io.emit('disconnect' , 'user disconnect');
    updateUsers();
    console.log('user disconnected');
  });
  // on message
  socket.on('chat message', function(msg) {
    io.emit('chat message', {msg: msg, nick: socket.nickname});
    console.log('message: ' + msg)
  })
  // refresh guest list
  var clients = io.sockets.adapter.rooms['room'].sockets;
  console.log('clients', clients)

});

http.listen(3000, function(){
  console.log('listening on *:3000');
})
