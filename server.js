const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const QRCode = require('qrcode');
const ip = require('ip');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

const chatHistory = [];
const connectedIPs = new Set();
const activeUsernames = new Map();

app.use(express.static('public'));

server.listen(PORT, () => {
  const url = `http://${ip.address()}:${PORT}`;
  console.log(`Servidor rodando em ${url}`);
  
  QRCode.toString(url, { type: 'terminal' }, (err, qr) => {
    if (!err) console.log(qr);
    console.log(`Acesse ou escaneie o QR Code para entrar no chat: ${url}`);
  });
});

io.on('connection', (socket) => {
  const clientIp = socket.handshake.address;

  if (connectedIPs.has(clientIp)) {
    socket.emit('error message', 'Apenas uma conexão por dispositivo/IP é permitida.');
    socket.disconnect(true);
    return;
  }

  connectedIPs.add(clientIp);
  console.log(`Usuário conectado: ${clientIp}`);

  socket.emit('chat history', chatHistory);

  socket.on('chat message', (data) => {
    const username = data.username.trim();

    const nameInUse = Array.from(activeUsernames.values()).includes(username);
    if (!activeUsernames.has(socket.id) && nameInUse) {
      socket.emit('error message', 'Este nome já está em uso. Escolha outro.');
      socket.disconnect(true);
      return;
    }

    activeUsernames.set(socket.id, username);

    chatHistory.push(data);
    if (chatHistory.length > 500) chatHistory.shift();

    io.emit('chat message', data);
  });

  socket.on('disconnect', () => {
    console.log(`Usuário desconectado: ${clientIp}`);
    connectedIPs.delete(clientIp);
    activeUsernames.delete(socket.id);
  });
});