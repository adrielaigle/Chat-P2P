
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
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
    initTheme();

    loadUserData();

    loadChats();

    setupEventListeners();
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');

        if (body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    });
}

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
    // Simular carregamento de chats do armazenamento local
    const savedChats = JSON.parse(localStorage.getItem('chats')) || [
        { id: 1, name: "Marketing Pessoal", unread: 2 },
        { id: 2, name: "Projeto Finanças", unread: 0 },
        { id: 3, name: "Evento Corporativo", unread: 0 }
    ];

    chats = savedChats;
    renderChats();
}

function renderChats() {
    chatsList.innerHTML = '';

    chats.forEach(chat => {
        const initials = chat.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();

        const chatItem = document.createElement('div');
        chatItem.classList.add('chat-item');
        if (currentChat && currentChat.id === chat.id) chatItem.classList.add('active');
        chatItem.dataset.id = chat.id;

        chatItem.innerHTML = `
            <div class="chat-avatar">${initials}</div>
            <div class="chat-info">
                <h4>${chat.name}</h4>
                <p>${chat.lastMessage || 'Nenhuma mensagem ainda'}</p>
            </div>
            <div class="chat-meta">
                <div class="chat-time">${chat.lastTime || ''}</div>
                ${chat.unread > 0 ? `<div class="chat-badge">${chat.unread}</div>` : ''}
            </div>
        `;

        chatItem.addEventListener('click', () => openChat(chat));
        chatsList.appendChild(chatItem);
    });
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

function openChat(chat) {
    currentChat = chat;

    // Atualizar lista de chats
    renderChats();

    // Esconder tela de boas-vindas
    welcomeScreen.style.display = 'none';

    // Mostrar área de chat
    chatHeader.style.display = 'flex';
    chatMessages.style.display = 'flex';
    messageInputContainer.style.display = 'flex';

    // Configurar header do chat
    const initials = chat.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    chatHeader.innerHTML = `
        <div class="chat-header-avatar">${initials}</div>
        <div class="chat-header-info">
            <h3>${chat.name}</h3>
            <p>Online • P2P</p>
        </div>
        <div class="chat-actions">
            <button class="chat-action-btn"><i class="fas fa-phone-alt"></i></button>
            <button class="chat-action-btn"><i class="fas fa-video"></i></button>
            <button class="chat-action-btn"><i class="fas fa-info-circle"></i></button>
        </div>
    `;

    // Carregar mensagens
    chatMessages.innerHTML = '';

    if (chat.messages && chat.messages.length > 0) {
        chat.messages.forEach(msg => {
            const messageElement = createMessageElement(msg);
            chatMessages.appendChild(messageElement);
        });
    } else {
        chatMessages.innerHTML = `
            <div class="empty-chat">
                <p>Nenhuma mensagem ainda</p>
                <small>Envie a primeira mensagem para iniciar a conversa</small>
            </div>
        `;
    }

    // Scrolla pro fim
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const content = messageInput.value.trim();
    if (content) {
        const newMessage = {
            id: Date.now(),
            content,
            sender: 'Você',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sent: true
        };

        // Adicionar ao chat atual
        currentChat.messages = currentChat.messages || [];
        currentChat.messages.push(newMessage);

        // Atualizar último mensagem
        currentChat.lastMessage = content;
        currentChat.lastTime = 'Agora';

        // Salvar e renderizar
        saveChats();
        renderChats();

        // Adicionar ao DOM
        chatMessages.appendChild(createMessageElement(newMessage));

        // Limpar input e scrollar para baixo
        messageInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function createMessageElement(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', message.sent ? 'sent' : 'received');

    messageElement.innerHTML = `
        ${message.content}
        <div class="message-time">${message.time}</div>
    `;

    return messageElement;
}

function saveChats() {
    localStorage.setItem('chats', JSON.stringify(chats));
}
