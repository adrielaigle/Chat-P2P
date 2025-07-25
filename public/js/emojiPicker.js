import { EmojiButton } from 'https://cdn.jsdelivr.net/npm/@joeattardi/emoji-button@4.6.4/dist/index.min.js';

export function setupEmojiPicker() {
  const emojiBtn = document.getElementById('emoji-btn');
  const messageInput = document.getElementById('message-input');

  if (!emojiBtn || !messageInput) {
    console.warn('Emoji: botão ou campo de texto não encontrados');
    return;
  }

  const picker = new EmojiButton({
    position: 'top-end',
    theme: 'auto',
    zIndex: 9999
  });

  emojiBtn.addEventListener('click', () => {
    picker.togglePicker(emojiBtn);
  });

  picker.on('emoji', selection => {
  messageInput.value += selection.emoji;
  messageInput.focus();
});
}