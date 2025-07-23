let chats = [];

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

