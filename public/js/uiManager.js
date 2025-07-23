const chatsList = document.getElementById('chats-list');
const welcomeScreen = document.getElementById('welcome-screen');
const chatHeader = document.getElementById('chat-header');
const chatMessages = document.getElementById('chat-messages');
const messageInputContainer = document.querySelector('.message-input-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const newChatBtn = document.getElementById('new-chat-btn');

let callbacks = {};

export function setupUIEventListeners(cb) {
  callbacks = cb;

  newChatBtn.addEventListener('click', () => {
    const name = prompt('Nome do novo chat:');
    if (callbacks.onCreateChat) callbacks.onCreateChat(name);
  });

  sendBtn.addEventListener('click', () => {
    if (callbacks.onSendMessage) {
      callbacks.onSendMessage(messageInput.value.trim());
      messageInput.value = '';
    }
  });

  messageInput.addEventListener('keypress', e => {
    if (e.key === 'Enter' && callbacks.onSendMessage) {
      callbacks.onSendMessage(messageInput.value.trim());
      messageInput.value = '';
    }
  });
}

export function renderChats(chats, activeChatId = null) {
  chatsList.innerHTML = '';

  chats.forEach(chat => {
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item';
    if (activeChatId === chat.id) chatItem.classList.add('active');

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
        <p>${chat.messages.length > 0 ? chat.messages[chat.messages.length-1].content : 'Nenhuma mensagem ainda'}</p>
      </div>
      <span class="chat-time">${chat.lastTime || ''}</span>
      <button class="delete-chat-btn" title="Apagar chat">×</button>
    `;

    chatItem.querySelector('.chat-details').addEventListener('click', () => {
      if (callbacks.onOpenChat) callbacks.onOpenChat(chat.id);
    });

    chatItem.querySelector('.delete-chat-btn').addEventListener('click', e => {
      e.stopPropagation();
      if (callbacks.onDeleteChat) callbacks.onDeleteChat(chat.id);
    });

    chatsList.appendChild(chatItem);
  });
}

export function renderMessages(chat) {
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

export function showWelcomeScreen() {
  welcomeScreen.style.display = 'flex';
  chatHeader.style.display = 'none';
  chatMessages.style.display = 'none';
  messageInputContainer.style.display = 'none';
}

export function showChatScreen(chat) {
  welcomeScreen.style.display = 'none';
  chatHeader.style.display = 'flex';
  chatMessages.style.display = 'block';
  messageInputContainer.style.display = 'flex';

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
}

// --------------------------------
// Modal do nome do usuário

export function showUsernameModal(onNameSaved) {
  const modal = document.getElementById('username-modal');
  const input = document.getElementById('username-input');
  const btn = document.getElementById('username-submit-btn');

  modal.style.display = 'flex';
  input.value = '';

  btn.onclick = () => {
    const name = input.value.trim();
    if (!name) {
      alert('Por favor, digite um nome válido.');
      return;
    }
    localStorage.setItem('chat_username', name);
    updateUserUI(name);
    modal.style.display = 'none';
    setupChangeUsernameButton();

    if (onNameSaved) onNameSaved();
  };

  input.onkeypress = e => {
    if (e.key === 'Enter') {
      btn.click();
    }
  };
}

export function updateUserUI(name) {
  const userAvatar = document.getElementById('user-avatar');
  const usernameDisplay = document.getElementById('username-display');

  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  userAvatar.textContent = initials;
  usernameDisplay.textContent = name;
}

export function setupChangeUsernameButton() {
  const userDetails = document.querySelector('.user-details');
  const existingBtn = document.getElementById('change-username-btn');
  if (existingBtn) existingBtn.remove();

  const btn = document.createElement('button');
  btn.id = 'change-username-btn';
  btn.textContent = 'Editar nome';
  btn.style.marginTop = '6px';
  btn.style.fontSize = '12px';
  btn.style.background = 'transparent';
  btn.style.border = 'none';
  btn.style.color = '#a5b4fc';
  btn.style.cursor = 'pointer';

  btn.onclick = () => {
    showUsernameModal();
  };

  userDetails.appendChild(btn);
}
