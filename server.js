var app = require('http').createServer()
var io = require('socket.io')(app)

app.listen(80)

io.on('connection', function (socket) {

})
