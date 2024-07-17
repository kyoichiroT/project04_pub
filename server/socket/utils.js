let { users, roomChoices, removeUserOnDisconnect } = require('./matching');
// const { myFunction, myVariable } = require('./myModule.js');

const utilsHandler = (socket, io, updateLatestAnnouncement) => {
    // ルームに参加する処理
    socket.on('joinRoom', (roomName) => {
        console.log('join room :',roomName)
        socket.join(roomName)
        socket.roomName = roomName

    });
    // 切断時の処理
    socket.on('disconnect', () => {
        console.log('クライアントが切断されました');
        // ルームからクライアントを除外する
        // console.log(socket)
        const roomName = socket.roomName;
        delete roomChoices[roomName]
        console.log(users, socket.id)
        // users = users.filter((user) => user.socketId != socket.id);
        removeUserOnDisconnect(socket.id)
        console.log(roomName,'disconected')
        socket.to(roomName).emit('userDisconnected', { userId: socket.id });
        socket.leaveAll();
    });

    // 開発者用コマンド.全ユーザー及び初期値としてアナウンス文字を追加する
    socket.on('developAnnounce', (data) => {
        console.log('developAnnounce', data);
        io.emit('developAnnounce', data);
        updateLatestAnnouncement(data.developCommand);
    })

};
module.exports = utilsHandler;