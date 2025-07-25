import { 
  setupUIEventListeners, 
  renderChats, 
  renderMessages, 
  showWelcomeScreen, 
  showChatScreen,
  updateUserUI,
  setupChangeUsernameButton,
  showUsernameModal
} from './uiManager.js';

import {setupEmojiPicker} from './emojiPicker.js';

let chats = [];
let currentChat = null;

// Gerenciamento de Chats
export function loadChats() {
  const saved = localStorage.getItem('chats');
  chats = saved ? JSON.parse(saved) : [];
}

export function saveChats() {
  localStorage.setItem('chats', JSON.stringify(chats));
}

export function getChats() {
  return chats;
}

export function addChat(name) {
  const newChat = {
    id: Date.now(),
    name,
    messages: []
  };
  chats.unshift(newChat);
  saveChats();
  return newChat;
}

export function deleteChat(chatId) {
  chats = chats.filter(c => c.id !== chatId);
  saveChats();
}

// Funções para callbacks:

function handleCreateChat(name) {
  if (!name) return;
  const newChat = addChat(name);
  renderChats(getChats());
  handleOpenChat(newChat.id);
}

function handleOpenChat(chatId) {
  currentChat = getChats().find(c => c.id === chatId);
  if (!currentChat) return;
  showChatScreen(currentChat);
  renderMessages(currentChat);
  renderChats(getChats(), currentChat.id);
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
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sent: true
  });

  saveChats();
  renderMessages(currentChat);
  renderChats(getChats(), currentChat.id);
}

// Agora sim, registra os listeners
setupUIEventListeners({
  onCreateChat: handleCreateChat,
  onOpenChat: handleOpenChat,
  onDeleteChat: handleDeleteChat,
  onSendMessage: handleSendMessage,
});

// Inicialização do nome do usuário
document.addEventListener('DOMContentLoaded', () => {
  const savedName = localStorage.getItem('chat_username');

  if (savedName) {
    updateUserUI(savedName);
    setupChangeUsernameButton();
  }

  // Só exibe o modal e atualiza se o campo for preenchido
  showUsernameModal(() => {
    const updatedName = localStorage.getItem('chat_username');
    if (updatedName) {
      updateUserUI(updatedName);
    }
  });

  // Também pode carregar os chats e renderizar:
  loadChats();
  renderChats(getChats());

  // Opcional: mostrar tela de boas-vindas se não tiver chat aberto
  if (!currentChat) showWelcomeScreen();

  setupEmojiPicker();
});
