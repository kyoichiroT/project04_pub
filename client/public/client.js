const socket = io();

// ユーザー名を入力してチャットに参加する処理
const username = prompt('Enter your username');
socket.emit('join', username);

// メッセージを送信する処理
document.getElementById('chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const message = document.getElementById('message-input').value;
    socket.emit('sendMessage', message);
    document.getElementById('message-input').value = '';
});

// メッセージを受信して表示する処理
socket.on('message', (message) => {
    const messageElement = document.createElement('li');
    messageElement.innerText = `${message.user}: ${message.text}`;
    document.getElementById('messages').appendChild(messageElement);
});