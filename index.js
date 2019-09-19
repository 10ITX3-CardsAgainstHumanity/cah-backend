const server = require('http').createServer();
const io = require('socket.io')(server);

const config = {
    port: process.env.PORT || 8080
};

server.listen(config.port, () => {
    console.log(`cah-backend is running on port ${config.port}`);
});

io.on('connection', (socket) => {
    console.log('new connection', socket.id);

    setInterval(() => {
       io.emit('time', Date.now());
    }, 1000);

    socket.on('disconnect', () => {
        console.log('disconnect', socket.id);
    });
});