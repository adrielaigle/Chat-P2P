const socket = io();
let mySocketId = null;

const peers = {}; 

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const usernameInput = document.getElementById('username');

if (localStorage.getItem('chat_username')) {
  usernameInput.value = localStorage.getItem('chat_username');
}

usernameInput.addEventListener('change', () => {
  localStorage.setItem('chat_username', usernameInput.value.trim());
});

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const message = input.value.trim();

  if (!username) {
    alert("Por favor, insira seu nome antes de enviar uma mensagem.");
    usernameInput.focus();
    return;
  }

  if (message) {
    const data = {
      username,
      message: convertEmojis(message),
      id: mySocketId
    };

    for (const peer of Object.values(peers)) {
      if (peer.dataChannel.readyState === 'open') {
        peer.dataChannel.send(JSON.stringify(data));
      }
    }

    displayMessage(data); 
    input.value = '';
  }
});

socket.on('connect', () => {
  mySocketId = socket.id;
});

socket.on('user-connected', async (peerId) => {
  if (peerId === mySocketId) return;

  const peer = createPeerConnection(peerId);
  const dataChannel = peer.createDataChannel("chat");

  setupDataChannel(peerId, dataChannel);

  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);

  socket.emit('signal', {
    to: peerId,
    offer
  });

  peers[peerId] = { connection: peer, dataChannel };
});

socket.on('signal', async (data) => {
  let peer = peers[data.from]?.connection;

  if (!peer) {
    peer = createPeerConnection(data.from);
    peers[data.from] = { connection: peer };
  }

  if (data.offer) {
    await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit('signal', {
      to: data.from,
      answer
    });

  } else if (data.answer) {
    await peer.setRemoteDescription(new RTCSessionDescription(data.answer));

  } else if (data.ice) {
    try {
      await peer.addIceCandidate(new RTCIceCandidate(data.ice));
    } catch (err) {
      console.warn('Erro ao adicionar ICE:', err);
    }
  }
});

socket.on('user-disconnected', (peerId) => {
  if (peers[peerId]) {
    peers[peerId].connection.close();
    delete peers[peerId];
  }
});

function createPeerConnection(peerId) {
  const peer = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('signal', {
        to: peerId,
        ice: event.candidate
      });
    }
  };

  peer.ondatachannel = (event) => {
    const channel = event.channel;
    setupDataChannel(peerId, channel);
    peers[peerId].dataChannel = channel;
  };

  return peer;
}

function setupDataChannel(peerId, channel) {
  channel.onmessage = (event) => {
    const data = JSON.parse(event.data);
    displayMessage(data);
  };
}

function isMyMessage(data) {
  const myUsername = usernameInput.value.trim();
  return data.id === mySocketId || data.username === myUsername;
}

function displayMessage(data) {
  const wrapper = document.createElement('li');
  wrapper.classList.add('message-wrapper');

  if (isMyMessage(data)) {
    wrapper.classList.add('sent');
  } else {
    wrapper.classList.add('received');
  }

  const bubble = document.createElement('div');
  bubble.classList.add('message');

  const isMine = isMyMessage(data);

  if (!isMine && data.id !== 'sistema') {
    const nameSpan = document.createElement('span');
    nameSpan.textContent = data.username;
    nameSpan.classList.add('username');
    nameSpan.style.color = stringToColor(data.username);
    bubble.appendChild(nameSpan);
  }

  const messageSpan = document.createElement('span');
  messageSpan.innerHTML = data.message;
  bubble.appendChild(messageSpan);

  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);

  messages.scrollTo({
    top: messages.scrollHeight,
    behavior: 'smooth'
  });
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}

function convertEmojis(text) {
  return text
    .replace(/:\)/g, '😊')
    .replace(/:\(/g, '😢')
    .replace(/:o/gi, '😮')
    .replace(/:D/gi, '😄')
    .replace(/<3/g, '❤️');
}

const toggle = document.getElementById('toggle-dark');
toggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  toggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('dark_mode', isDark);
});

if (localStorage.getItem('dark_mode') === 'true') {
  document.body.classList.add('dark');
  toggle.textContent = '☀️';
}