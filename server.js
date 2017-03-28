var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html')
});

http.listen(3000, function(){
  console.log('listen on *: 3000')
})

app.use(express.static(__dirname + '/client'));
var users = [];
var targets = {};
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
      targets[socket.nickname] = socket.id
      users.push(socket.nickname);
      io.sockets.emit('usernames', users)
      updateUsers();
    }
  })
  // set nick name
  // socket.on('nickname', function(nickname) {
  //   socket.nickname = nickname
  //
  //   users.push(socket.nickname);
  //   updateUsers()
  //   console.log(users)
  // })
  // helper function
  function updateUsers() {
    io.sockets.emit('usernames', users)
  }
  // on discconect
  socket.on('disconnect', function(){
    if(!socket.nickname) return
    users.splice(users.indexOf(socket.nickname), 1);
    io.emit('disconnect' , 'user disconnect');
    delete targets[socket.nickname];
    updateUsers();
    console.log('user disconnected');
  });
  // on message
  socket.on('chat message', function(msg) {
    var text = msg.trim();
    if(text[0] === '@') {
      var name = text.substring(1, text.indexOf(' '))
      var message = text.substring(text.indexOf(' '), text.length)
      console.log('to :', name, 'info: ', message)
      if(name in targets){
        console.log('whisper')
        io.to(targets[name]).emit('chat message', {
          msg: message, nick: `(@${socket.nickname})`
        })
        io.to(targets[socket.nickname]).emit('chat message', {
          msg: message, nick: `(to @${name})`
        })
      }
    } else {
      io.emit('chat message', {msg: msg, nick: socket.nickname});
      console.log('message: ' + msg)
    }
  })

  // on private message
  socket.on('private message', function(from, msg) {
    console.log('')
  })
  // refresh guest list
  var clients = io.sockets.adapter.rooms['room'].sockets;
  console.log('clients', clients)
});

http.listen(3000, function(){
  console.log('listening on *:3000');
})
