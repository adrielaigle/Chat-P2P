const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const ip = require('ip');
const QRCode = require('qrcode');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3000;

app.use(express.static('public'));

server.listen(PORT, () => {
  const url = `http://${ip.address()}:${PORT}`;
  console.log(`Servidor de sinalização rodando em ${url}`);

  QRCode.toString(url, { type: 'terminal' }, (err, qr) => {
    if (!err) console.log(qr);
    console.log(`Acesse ou escaneie para entrar no chat: ${url}`);
  });
});

io.on('connection', (socket) => {
  console.log(`Usuário conectado: ${socket.id}`);

  socket.broadcast.emit('user-connected', socket.id);

  socket.on('signal', (data) => {
    io.to(data.to).emit('signal', {
      from: socket.id,
      ...data
    });
  });

  socket.on('disconnect', () => {
    console.log(`Usuário desconectado: ${socket.id}`);
    socket.broadcast.emit('user-disconnected', socket.id);
  });
});