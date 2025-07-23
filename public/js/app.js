import { 
  loadChats, saveChats, getChats, addChat, deleteChat 
} from '../chatManager.js';

import { 
  renderChats, renderMessages, showWelcomeScreen, showChatScreen, setupUIEventListeners,
  showUsernameModal, updateUserUI, setupChangeUsernameButton
} from '../uiManager.js';

let currentChat = null;

function init() {
  const savedName = localStorage.getItem('chat_username');

  if (!savedName) {
    // Mostrar modal para usuário digitar nome
    showUsernameModal(() => {
      // Callback opcional, quando o nome for salvo, inicia o app normalmente
      const name = localStorage.getItem('chat_username');
      updateUserUI(name);
      setupChangeUsernameButton();
      loadChats();
      renderChats(getChats());
      showWelcomeScreen();
      setupListeners();
    });
  } else {
    // Se já tem nome salvo, só atualiza a UI e continua
    updateUserUI(savedName);
    setupChangeUsernameButton();
    loadChats();
    renderChats(getChats());
    showWelcomeScreen();
    setupListeners();
  }
}

function setupListeners() {
  setupUIEventListeners({
    onCreateChat: handleCreateChat,
    onOpenChat: handleOpenChat,
    onDeleteChat: handleDeleteChat,
    onSendMessage: handleSendMessage,
  });
}

function handleCreateChat(name) {
  if (!name) return;
  const newChat = addChat(name);
  renderChats(getChats());
  openChat(newChat);
}

function handleOpenChat(chatId) {
  currentChat = getChats().find(c => c.id === chatId);
  if (!currentChat) return;
  showChatScreen(currentChat);
  renderMessages(currentChat);
  renderChats(getChats());
}

function handleDeleteChat(chatId) {
  deleteChat(chatId);
  if (currentChat && currentChat.id === chatId) {
    currentChat = null;
    showWelcomeScreen();
  }
  renderChats(getChats());
}

function handleSendMessage(message) {
  if (!currentChat || !message) return;

  currentChat.messages.push({
    id: Date.now(),
    content: message,
    time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
    sent: true
  });

  saveChats();
  renderMessages(currentChat);
  renderChats(getChats());
}

function openChat(chat) {
  currentChat = chat;
  showChatScreen(currentChat);
  renderMessages(currentChat);
  renderChats(getChats());
}

document.addEventListener('DOMContentLoaded', init);
