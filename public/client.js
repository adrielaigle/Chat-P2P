const socket = io();
let mySocketId = null;

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
    socket.emit('chat message', data);
    input.value = '';
  }
});

socket.on('connect', () => {
  mySocketId = socket.id;
});

socket.on('chat history', (history) => {
  messages.innerHTML = '';
  for (const data of history) {
    displayMessage(data);
  }
});

socket.on('chat message', function(data) {
  displayMessage(data);
});

socket.on('error message', (msg) => {
  alert(msg);
});

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