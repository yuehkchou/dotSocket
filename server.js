var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html')
});

http.listen(3000, function(){
  console.log('listen on *: 3000')
})

io.on('connection', function(socket) {
  // socket.broadcast.emit('connected');
  var users = [];
  socket.on('new user', function( message, callback) {
    if(nicknames.indexOf(message)!= -1) {
      callback(false)
    } else {
      callback(true)
      socket.nickname = message;
      users.push(socket.nickname);
      io.sockets.emit('usernames', users)
      updateNicknames();
    }
  })
  socket.emit('user join', 'You are connected!');
  socket.broadcast.emit('user join', 'Another client has just connected!');
  console.log('a user connected');
    // io.emit('join', 'user connects')
  // set nick name
  socket.on('nickname', function(nickname) {
    socket.nickname = nickname
    users.push(socket.nickname);
  })
  socket.on('disconnect', function(){
    io.emit('disconnect' , 'user disconnect')
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg) {
    io.emit('chat message', {msg: msg, nick: socket.nickname});
    console.log('message: ' + msg)
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
})
