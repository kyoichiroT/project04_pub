// const config = require('./config/config.js');
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const http = require('http').createServer(app);
const { beforeDuelHandler, checkAndSetleatestMatchNumber } = require('./socket/matching');
const utilsHandler = require('./socket/utils')
const gameUtilsHandler = require('./socket/gameUtils')

const fs = require('fs');
const path = require('path');

// const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
// const { S3Client, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
// const csvParser = require('csv-parser');
// const { pipeline } = require('stream/promises');
// const { Readable } = require('stream');

// const bucketName = "04kankyoudata";


// // S3からファイルを取得する関数
// const getFileFromS3 = async (bucketName, fileName) => {
//     try {
//         const getObjectParams = {
//             Bucket: bucketName,
//             Key: fileName,
//         };
//         const command = new GetObjectCommand(getObjectParams);
//         const { Body } = await s3Client.send(command);

//         const content = await streamToString(Body);
//         console.log(content); // ファイルの内容をコンソールに出力
//     } catch (error) {
//         console.error(error);
//     }
// };

// // この関数を呼び出してS3からファイルを取得
// getFileFromS3("04kankyoudata", "test.txt"); // 実際のバケット名とファイル名に置き換えてください





// // S3から最新のファイル名を取得
// async function getLatestFileNumber() {
//     const command = new ListObjectsV2Command({
//         Bucket: bucketName,
//         Prefix: 'matchData_'
//     });
//     try {
//         const { Contents } = await s3Client.send(command);
//         // Contentsがundefinedか、空の場合は空の配列を使用するようにしてエラーを避ける
//         const fileNumbers = (Contents || []).map(file => {
//             const match = file.Key.match(/matchData_(\d+)\.csv$/);
//             return match ? parseInt(match[1], 10) : 0;
//         });

//         // ファイルが見つからなかった場合、0を返す
//         return Math.max(...fileNumbers, 0);
//     } catch (error) {
//         console.error('S3からファイルリストの取得中にエラーが発生しました: ', error);
//         // エラーが発生した場合も0を返すか、適切に処理する
//         return 0;
//     }
// }

// // 最新のマッチ番号を取得
// async function getLatestMatchNumber(fileNumber) {
//     const command = new GetObjectCommand({
//         Bucket: bucketName,
//         Key: `matchData_${fileNumber}.csv`
//     });
//     try {
        
//         const { Body } = await s3Client.send(command);
    
//         // Body.stream()を使用してレスポンスをストリームに変換
//         let latestMatchNumber = 0;
    
//         // Node.jsのStreamを使用してデータを読み込み
//         await pipeline(
//             Body.pipe(csvParser({ headers: ['matchNumber'] })),
//             async function (source) {
//                 for await (const chunk of source) {
//                     latestMatchNumber = Math.max(latestMatchNumber, parseInt(chunk.matchNumber, 10));
//                 }
//             }
//         );
    
//         return latestMatchNumber;
//     } catch(error) {
//         if (error.name === 'NoSuchKey') {
//             console.error('指定されたファイルが見つかりません: ', error.message);
//             return 0; // ファイルが存在しない場合は0を返す
//         } else {
//             // その他のエラーの場合はエラーを投げる
//             throw error;
//         }
//     }
// }
// console.log(getLatestFileNumber());
// console.log(getLatestMatchNumber());


// getLatestFileNumber().then(fileNumber => {
//     console.log("最新のファイル番号は:", fileNumber);
// }).catch(error => {
//     console.error("エラーが発生しました:", error);
// });

// getLatestMatchNumber().then(fileNumber => {
//     console.log("最新のマッチ番号は:", fileNumber);
// }).catch(error => {
//     console.error("エラーが発生しました:", error);
// });





// 開発者用アナウンスメッセージ
let latestAnnouncement = "";
// アナウンスメッセージ更新用関数
function updateLatestAnnouncement(newAnnouncement) {
    latestAnnouncement = newAnnouncement;
    console.log(latestAnnouncement)
}

// CORS 設定
// app.use(cors({
//     origin: clientPath
// }));
app.use(cors());
const io = require('socket.io')(http, {
    // cors is secret

    pingInterval: 10000,
    pingTimeout: 60000
});
io.on('connection', (socket) => {
    // 各ハンドラーファイルの処理を実行する
    utilsHandler(socket, io, updateLatestAnnouncement);
    beforeDuelHandler(socket, io);
    gameUtilsHandler(socket, io);
    
    console.log('クライアントとの接続が確立されました');
    if (latestAnnouncement !== '') {
        console.log('アナウンスあり', latestAnnouncement)
        socket.emit('developAnnounce', { developCommand:latestAnnouncement });
    }
});

// csvディレクトリがあるか確認、なければ作成
const csvDir = path.join(__dirname, 'csv');

if (!fs.existsSync(csvDir)) {
    fs.mkdirSync(csvDir, { recursive: true });
}
// サーバー側で試合数を保存
// initializeMatchCount();
checkAndSetleatestMatchNumber()



// クライアントとの接続を待機するポート番号
const port = process.env.PORT || 8080;
// セッションの設定
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    // cookie: {
    //     maxAge: 90 * 60 * 1000 // 90分の有効期限
    // }
}));
app.use(express.json()); // リクエストボディをJSONとして解析するためのミドルウェア



// ルーティングのモジュールをインポート
const playerInfoRoutes = require('./routes/routePlayerInfo');

// ルーティングのモジュールを使用
app.use('/api', playerInfoRoutes);

app.get('/', function (req, res) {
    res.send('Hello World!');
});

// io.on('connection', (socket) => {
//     console.log('A user connected');
//     users = []
//     // ユーザーがチャットに参加するときの処理
//     socket.on('join', (username) => {
//         users[socket.id] = username;
//         console.log(`${username} joined the chat`);

//         // 参加したユーザーにだけ「自分が参加したことを知らせる」メッセージを送信
//         socket.emit('message', { user: 'admin', text: `Welcome to the chat, ${username}!` });

//         // 他のユーザーには「新しいユーザーが参加したことを知らせる」メッセージを送信
//         socket.broadcast.emit('message', { user: 'admin', text: `${username} has joined the chat` });
//     });

//     // ユーザーがメッセージを送信したときの処理
//     socket.on('sendMessage', (message) => {
//         // メッセージを送信したユーザーのユーザー名を取得
//         const username = users[socket.id];

//         // すべてのユーザーにメッセージを送信
//         io.emit('message', { user: username, text: message });
//     });

//     // ユーザーがチャットから退出したときの処理
//     socket.on('disconnect', () => {
//         // 退出したユーザーのユーザー名を取得
//         const username = users[socket.id];
//         console.log(`${username} left the chat`);

//         // 他のユーザーに「ユーザーが退出したことを知らせる」メッセージを送信
//         socket.broadcast.emit('message', { user: 'admin', text: `${username} has left the chat` });

//         // ユーザーの情報を削除
//         delete users[socket.id];
//     });
// });

http.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = { http, io };
// // matching.jsの呼び出し
// require('./socket/matching')(app, http);