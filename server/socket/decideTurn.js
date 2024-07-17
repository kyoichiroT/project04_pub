// ルームごとの選択結果を保持するオブジェクト
const roomChoices = {};
const turnDecideHandler = (socket, io) => {
    // 'decideTurn' イベントを受け取った時の処理
    socket.on('decideTurn', (choice, roomName) => {

        if (!roomChoices[roomName]) {
            roomChoices[roomName] = {};
        }

        roomChoices[roomName][socket.id] = choice; // ルーム内のクライアントの選択を保存

        // 両プレイヤーが選択した場合の処理
        if (Object.keys(roomChoices[roomName]).length === 2) {
            const player1Choice = roomChoices[roomName][0];
            const player2Choice = roomChoices[roomName][1];

            // 両プレイヤーが同じ選択をした場合はランダムに先行を決める
            if (player1Choice === player2Choice) {
                const firstPlayer = Math.random() < 0.5 ? player1SocketId : player2SocketId;
                console.log('roomaNAme=',roomName)
                io.to(roomName).emit('turnDecision', firstPlayer);
            } else {
                // 一方が "give" を選択した場合、相手が先行となる
                const firstPlayer = player1Choice === 'give' ? player2SocketId : player1SocketId;
                console.log('roomaNAme=', roomName)

                io.to(roomName).emit('turnDecision', firstPlayer);
            }

            // 選択結果を初期化
            roomChoices[roomName] = {};
        }
    });
};

module.exports = turnDecideHandler;