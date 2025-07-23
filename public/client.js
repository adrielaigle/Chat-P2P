// Array global para chats
let chats = [];
let currentChat = null;

// Pegando elementos do DOM
const chatsList = document.getElementById('chats-list');
const newChatBtn = document.getElementById('new-chat-btn');
const welcomeScreen = document.getElementById('welcome-screen');
const chatHeader = document.getElementById('chat-header');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// Inicializa a interface
function init() {
  loadChats();
  renderChats();
  showWelcome();

  // Eventos
  newChatBtn.addEventListener('click', createNewChat);
  sendBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

function showWelcome() {
  // Exibe a tela de boas-vindas
  welcomeScreen.style.display = 'block';
  
  // Esconde a área do chat
  chatHeader.style.display = 'none';
  chatMessages.style.display = 'none';
  messageInput.parentElement.style.display = 'none'; // Container do input e botão
}


// Simular carregar chats do localStorage ou iniciar vazio
function loadChats() {
  const saved = localStorage.getItem('chats');
  chats = saved ? JSON.parse(saved) : [];
}

// Salvar chats no localStorage
function saveChats() {
  localStorage.setItem('chats', JSON.stringify(chats));
}

// Renderizar lista de chats
function renderChats() {
  chatsList.innerHTML = '';

  chats.forEach(chat => {
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item';
    if (currentChat && currentChat.id === chat.id) chatItem.classList.add('active');

    const initials = chat.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    chatItem.innerHTML = `
      <div class="chat-avatar">${initials}</div>
      <div class="chat-details">
        <h4>${chat.name}</h4>
        <p>${chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length -1].content : 'Nenhuma mensagem ainda'}</p>
      </div>
      <span class="chat-time">${chat.lastTime || ''}</span>
    `;

    chatItem.addEventListener('click', () => openChat(chat));
    chatsList.appendChild(chatItem);
  });
}

// Criar novo chat
function createNewChat() {
  const name = prompt('Nome do novo chat:');
  if (!name || !name.trim()) return;

  const newChat = {
    id: Date.now(),
    name: name.trim(),
    messages: []
  };

  chats.unshift(newChat);
  saveChats();
  renderChats();
  openChat(newChat);
}

// Abrir chat selecionado
function openChat(chat) {
  currentChat = chat;

  // Mostrar o chat e esconder boas vindas
  welcomeScreen.style.display = 'none';
  chatHeader.style.display = 'flex';
  chatMessages.style.display = 'block';
  messageInput.parentElement.style.display = 'flex';

  // Atualizar header do chat
  const initials = chat.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  chatHeader.innerHTML = `
    <div class="chat-header-avatar">${initials}</div>
    <div class="chat-header-info">
      <h3>${chat.name}</h3>
      <p>Online • P2P</p>
    </div>
  `;

  // Renderizar mensagens
  renderMessages(chat);
  renderChats(); // atualizar seleção da lista
}

// Renderizar mensagens do chat
function renderMessages(chat) {
  chatMessages.innerHTML = '';

  chat.messages.forEach(msg => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('discord-message');

    messageDiv.innerHTML = `
      <div class="message-meta">
        <span class="message-user">${msg.sent ? 'Você' : chat.name}</span>
        <span class="message-time">${msg.time}</span>
      </div>
      <div class="message-text">${msg.content}</div>
    `;

    chatMessages.appendChild(messageDiv);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Enviar mensagem no chat aberto
function sendMessage() {
  if (!currentChat) return;

  const content = messageInput.value.trim();
  if (!content) return;

  const newMsg = {
    id: Date.now(),
    content,
    time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
    sent: true
  };

  currentChat.messages.push(newMsg);
  currentChat.lastTime = 'Agora';

  saveChats();
  renderMessages(currentChat);
  renderChats();

  messageInput.value = '';

  // Aqui você pode integrar o envio via WebRTC/Socket que já tem no seu client.js
}

document.addEventListener('DOMContentLoaded', init);
