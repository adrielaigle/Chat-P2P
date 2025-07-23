const chatsList = document.getElementById('chats-list');
const mainChat = document.querySelector('.main-chat');
const welcomeScreen = document.getElementById('welcome-screen');
const newChatBtn = document.getElementById('new-chat-btn');
const userAvatar = document.getElementById('user-avatar');
const usernameDisplay = document.getElementById('username-display');

const chatHeader = document.getElementById('chat-header');
const chatMessages = document.getElementById('chat-messages');
const messageInputContainer = document.querySelector('.message-input-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

let chats = [];
let currentChat = null;

document.addEventListener('DOMContentLoaded', () => {
  loadUserData();
  loadChats();
  setupEventListeners();
  showWelcomeScreen();
});

function loadUserData() {
  const savedName = localStorage.getItem('chat_username') || 'Usuário';
  const initials = savedName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  userAvatar.textContent = initials;
  usernameDisplay.textContent = savedName;
}

function loadChats() {
  const savedChats = JSON.parse(localStorage.getItem('chats')) || [
    { id: 1, name: "Marketing Pessoal", unread: 2, messages: [
      { content: "Bem-vindo ao grupo!", time: "09:00", sent: false },
      { content: "Obrigado!", time: "09:05", sent: true },
    ] },
    { id: 2, name: "Projeto Finanças", unread: 0, messages: [] },
    { id: 3, name: "Evento Corporativo", unread: 0, messages: [] }
  ];

  chats = savedChats;
  renderChats();
}

function renderChats() {
  chatsList.innerHTML = '';

  chats.forEach(chat => {
    const chatItem = document.createElement('div');
    chatItem.classList.add('chat-item');
    if (currentChat && currentChat.id === chat.id) chatItem.classList.add('active');

    const initials = chat.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    chatItem.innerHTML = `
      <div class="chat-avatar">${initials}</div>
      <div class="chat-details">
        <h4 class="chat-name">${chat.name}</h4>
        <p class="chat-last-message">${chat.lastMessage || ''}</p>
      </div>
      <span class="chat-time">${chat.lastTime || ''}</span>
      <button class="delete-chat-btn" title="Apagar chat"><i class="fas fa-trash"></i></button>
    `;

    // Clique no chat para abrir
    chatItem.addEventListener('click', () => openChat(chat));

    // Clique no botão apagar — precisa evitar que abra o chat ao clicar no botão
    chatItem.querySelector('.delete-chat-btn').addEventListener('click', (e) => {
      e.stopPropagation(); // evita abrir o chat

      const confirmDelete = confirm(`Quer apagar o chat "${chat.name}"?`);
      if (confirmDelete) {
        deleteChat(chat.id);
      }
    });

    chatsList.appendChild(chatItem);
  });
}

function deleteChat(chatId) {
  // Remove chat do array
  chats = chats.filter(c => c.id !== chatId);

  // Se o chat aberto era esse, fecha ele e mostra welcome
  if (currentChat && currentChat.id === chatId) {
    currentChat = null;
    chatHeader.style.display = 'none';
    chatMessages.style.display = 'none';
    messageInputContainer.style.display = 'none';
    welcomeScreen.style.display = 'flex';
  }

  saveChats();
  renderChats();
}

function getInitials(name) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function getLastMessagePreview(chat) {
  if (!chat.messages || chat.messages.length === 0) return 'Nenhuma mensagem';
  const lastMsg = chat.messages[chat.messages.length - 1];
  return (lastMsg.sent ? 'Você: ' : '') + lastMsg.content.slice(0, 30) + (lastMsg.content.length > 30 ? '...' : '');
}

function openChat(chat) {
  currentChat = chat;

  // Atualiza header da conversa
  chatHeader.style.display = 'flex';
  chatHeader.innerHTML = `
    <div class="chat-header-avatar">${getInitials(chat.name)}</div>
    <div class="chat-header-info">
      <h3>${chat.name}</h3>
      <p>Online • P2P</p>
    </div>
  `;

  // Exibir mensagens
  chatMessages.style.display = 'flex';
  renderMessages(chat);

  // Mostrar input
  messageInputContainer.style.display = 'flex';
  welcomeScreen.style.display = 'none';

  // Atualizar lista (para remover notificações, etc)
  renderChats();
}

function renderMessages(chat) {
  chatMessages.innerHTML = '';

  if (!chat.messages || chat.messages.length === 0) {
    chatMessages.innerHTML = `<div class="empty-chat">
      <p>Nenhuma mensagem ainda</p>
      <small>Envie a primeira mensagem para iniciar a conversa</small>
    </div>`;
    return;
  }

  chat.messages.forEach(msg => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('discord-message');

    const initials = (msg.sent ? 'Você' : chat.name)
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    messageDiv.innerHTML = `
      <div class="message-header">
        <div class="avatar">${initials}</div>
        <div class="meta">
          <span class="message-user">${msg.sent ? 'Você' : chat.name}</span>
          <span class="message-time">${msg.time}</span>
        </div>
      </div>
      <div class="message-text">${msg.content}</div>
    `;

    chatMessages.appendChild(messageDiv);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setupEventListeners() {
  newChatBtn.addEventListener('click', createNewChat);

  sendBtn.addEventListener('click', () => {
    if (currentChat) sendMessage();
  });

  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && currentChat) sendMessage();
  });
}

function createNewChat() {
  const chatName = prompt("Nome do novo chat:");
  if (chatName && chatName.trim() !== '') {
    const newChat = {
      id: Date.now(),
      name: chatName.trim(),
      unread: 0,
      messages: []
    };
    chats.unshift(newChat);
    saveChats();
    renderChats();
    openChat(newChat);
  }
}

function sendMessage() {
  const content = messageInput.value.trim();
  if (!content) return;

  const newMessage = {
    content,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sent: true
  };

  if (!currentChat.messages) currentChat.messages = [];
  currentChat.messages.push(newMessage);

  saveChats();
  renderMessages(currentChat);
  renderChats();

  messageInput.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function saveChats() {
  localStorage.setItem('chats', JSON.stringify(chats));
}

function showWelcomeScreen() {
  welcomeScreen.style.display = 'flex';
  chatHeader.style.display = 'none';
  chatMessages.style.display = 'none';
  messageInputContainer.style.display = 'none';
}
