const fs = require('fs'); // fsモジュールのトップレベルを読み込む
const fsPromises = fs.promises; // fs.promises APIを使用するための参照
const { Readable } = require('stream');
const { resolve } = require('path');
const path = require('path');
const { s3Client, bucketName } = require('../config/config');
const { ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
// const AWS = require('aws-sdk');
// const s3 = new AWS.S3();
const csvParser = require('csv-parser');


let users = [];
// ルームごとの選択結果を保持するオブジェクト
const roomChoices = {};

const dirPath = path.join(__dirname, '../csv');
const baseName = 'matchData';
const fileExtension = '.csv';
// let matchCount = 0


// マッチカウントを前回の最終結果から取得して初期化
let matchCount;
const directoryPath = path.join(__dirname, '../csv');
const filePrefixes = ['matchData_', 'fiberJar_', 'painfulChoice_', 'peeping_', 'search_', 'salvage_', 'betray_']; // 複数の接頭辞を配列で指定

async function initializeMatchCount() {
    try {
        // const latestFilePathMatchData = await findLatestCsvFile(dirPath, baseName, fileExtension);
        // const latestFilePathFiberJar = await findLatestCsvFile(dirPath, 'fiberJar', fileExtension);
        // const latestFilePathPainfulChoice = await findLatestCsvFile(dirPath, 'painfulChoice', fileExtension);
        // const latestFilePathPeeping = await findLatestCsvFile(dirPath, 'peeping', fileExtension);
        // const latestFilePathSearch = await findLatestCsvFile(dirPath, 'search', fileExtension);
        // const latestFilePathSalvage = await findLatestCsvFile(dirPath, 'salvage', fileExtension);
        // const latestFilePathBetray = await findLatestCsvFile(dirPath, 'betray', fileExtension);

        // const lastMatchNumberMatchData = await getLastMatchNumber(latestFilePathMatchData);
        // const lastMatchNumberFiberJar = await getLastMatchNumber(latestFilePathFiberJar);
        // const lastMatchNumberPainfulChoice = await getLastMatchNumber(latestFilePathPainfulChoice);
        // const lastMatchNumberPeeping = await getLastMatchNumber(latestFilePathPeeping);
        // const lastMatchNumberSearch = await getLastMatchNumber(latestFilePathSearch);
        // const lastMatchNumberSalvage = await getLastMatchNumber(latestFilePathSalvage);
        // const lastMatchNumberBetray = await getLastMatchNumber(latestFilePathBetray);

        matchCount = lastMatchNumber ? parseInt(lastMatchNumber) : 0;
        console.log('初期試合番号:', matchCount);
    } catch (err) {
        console.error('エラー:', err);
        matchCount = 0; // エラーが発生した場合のデフォルト値
    }
}
// // s3内の最新のマッチ番号を取得

async function getLatestMatchNumber() {
    let maxMatchNumber = 0;

    for (const prefix of filePrefixes) {
        const command = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix
        });
        const { Contents } = await s3Client.send(command);
        console.log('コンテンツ', Contents);
        if (!Contents || Contents.length === 0) {
            continue;
        }
        for (const file of Contents) {
            const getObjectCommand = new GetObjectCommand({
                Bucket: bucketName,
                Key: file.Key
            });

            const { Body } = await s3Client.send(getObjectCommand);
            await new Promise((resolve, reject) => {
                const fileStream = Readable.from(Body);
                fileStream.pipe(csvParser())
                    .on('data', (data) => {
                        const matchNumber = parseInt(data.matchNumber, 10);
                        if (!isNaN(matchNumber)) {
                            maxMatchNumber = Math.max(maxMatchNumber, matchNumber);
                        }
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });
        }
    }
    return maxMatchNumber + 1; // 最大のマッチ番号に1を加える
}

// // s3内の最新のマッチ番号を取得
// async function getLatestMatchNumber() {

//     let maxMatchNumber = 0;

//     for (const prefix of filePrefixes) {
//         const command = new ListObjectsV2Command({
//             Bucket: bucketName,
//             Prefix: prefix
//         });
//         const { Contents } = await s3Client.send(command);

//         for (const file of Contents || []) {
//             // CSVファイル名からマッチ番号を抽出
//             const match = file.Key.match(new RegExp(`${prefix}(\\d+)\\.csv$`));
//             if (match) {
//                 const matchNumber = parseInt(match[1], 10);
//                 maxMatchNumber = Math.max(maxMatchNumber, matchNumber);
//             }
//         }
//     }

//     // 最大のマッチ番号に1を加える
//     return maxMatchNumber + 1;
// }
    // try {

    //     // const { Body } = await s3Client.send(command);
    //     const command = new ListObjectsV2Command({
    //         Bucket: bucketName,
    //         Prefix: `matchData_`
    //     });
    //     const { Contents } = await s3Client.send(command);
    //     const fileNumbers = (Contents || []).map(file => {
    //         const match = file.Key.match(new RegExp(`matchData_(\\d+)\\.csv$`));
    //         return match ? parseInt(match[1], 10) : 0;
    //     });
    //     let latestMatchNumber = Math.max(...fileNumbers, 0);


    //     return latestMatchNumber + 1;
    // } catch (error) {
    //     if (error.name === 'NoSuchKey') {
    //         console.error('指定されたファイルが見つかりません: ', error.message);
    //         console.log('マッチ番号は0になります')
    //         return 0; // ファイルが存在しない場合は0を返す
    //     } else {
    //         // その他のエラーの場合はエラーを投げる
    //         throw error;
    //     }
    // }


function findLatestCsvFile(dirPath, baseName, fileExtension) {
    return new Promise((resolve, reject) => {
        fs.readdir(dirPath, (err, files) => {
            if (err) {
                reject(err);
                return;
            }

            let maxIndex = -1;
            let latestFile = '';
            console.log(JSON.stringify(files))
            console.log(files)
            files.forEach(file => {
                if (file.startsWith(baseName) && file.endsWith(fileExtension)) {
                    const index = parseInt(file.split('_')[1]);
                    if (index > maxIndex) {
                        maxIndex = index;
                        latestFile = file;
                    }
                }
            });

            if (latestFile) {
                resolve(path.join(dirPath, latestFile));
            } else {
                reject(new Error('最新のCSVファイルが見つかりません。'));
            }
        });
    });
}


function getLastMatchNumber(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            const lines = data.trim().split('\n');

            let maxMatchNumber = 0;

            lines.forEach(line => {
                const matchNumber = parseInt(line.split(',')[0]);
                if (!isNaN(matchNumber)) {
                    maxMatchNumber = Math.max(maxMatchNumber, matchNumber);
                }
            });
            resolve(maxMatchNumber);
            // const lastLine = lines[lines.length - 1];
            // const matchNumber = lastLine.split(',')[0]; // 一番左の列（試合番号）
            // console.log(matchNumber)
            // if (matchNumber) {
            //     resolve(matchNumber);
            // } else {
            //     resolve(0);
            // }
        });
    });
}



async function findMaxNumberInFile(filePath) {
    return new Promise((resolve, reject) => {
        let maxNumber = -1;
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => {
                // 最初のカラムの値を取得
                const firstColumnValue = data['matchNumber'];
                const number = parseInt(firstColumnValue, 10);
                if (!isNaN(number)) {
                    maxNumber = Math.max(maxNumber, number);
                }
            })
            .on('end', () => {
                console.log('ファイル毎の最大マッチ番号',filePath,maxNumber)
                resolve(maxNumber);
            })
            .on('error', reject);
    });
}

async function findMaxNumberedFile(dirPath, prefix) {
    try {
        const files = await fsPromises.readdir(dirPath);
        let maxFileNumber = -1;
        let targetFilePath = '';

        for (const file of files) {
            const match = file.match(new RegExp(`^${prefix}(\\d+)\\.csv$`));
            if (match) {
                const number = parseInt(match[1], 10);
                if (number > maxFileNumber) {
                    maxFileNumber = number;
                    targetFilePath = path.join(dirPath, file);
                }
            }
        }
        console.log(targetFilePath)
        if (targetFilePath) {
            const maxNumber = await findMaxNumberInFile(targetFilePath);
            return maxNumber;
        } else {
            return 0; // 見つからなかった場合
        }
    } catch (error) {
        console.error('Error finding max numbered file:', error);
        throw error;
    }
}
// ローカルの最大マッチ番号取得
async function findMaxAmongPrefixes(dirPath, prefixes) {
    // 各prefixに対する最大値を取得
    const results = await Promise.all(prefixes.map(prefix => findMaxNumberedFile(dirPath, prefix)));
    // 最大値の中でさらに最大のものを探す
    const maxResult = Math.max(...results);
    return maxResult + 1; // これは数値を返します
}



// findMaxAmongPrefixes(directoryPath, filePrefixes).then(maxResult => {
//     if (maxResult) {
//         console.log('The path of the file with the overall maximum number is:', maxResult.maxNumber);
//     } else {
//         console.log('No matching files were found.');
//     }
// }).catch(err => {
//     console.error('Error:', err);
// });


// マッチ番号をカウントする処理のラップ関数
async function checkAndSetleatestMatchNumber() {
    try {
        // 両方のPromiseを並行して実行し、結果を待つ
        const [fileNumber, maxResult] = await Promise.all([
            getLatestMatchNumber(),
            findMaxAmongPrefixes(directoryPath, filePrefixes)
        ]);

        console.log("最新のマッチ番号は:", fileNumber);

        // findMaxAmongPrefixesが最大値を直接返すように仮定
        const maxFileNumber = maxResult; // この部分は実際の返り値に応じて調整する

        if (maxFileNumber) {
            console.log('The path of the file with the overall maximum number is:', maxFileNumber);
        } else {
            console.log('No matching files were found.');
        }

        // より大きい方の値をmatchCountに代入
        matchCount = Math.max(fileNumber, maxFileNumber);
        matchCount += 1;
        console.log("更新後のmatchCount:", matchCount);

    } catch (error) {
        console.error("エラーが発生しました:", error);
    }
    // getLatestMatchNumber().then(fileNumber => {
    //     console.log("最新のマッチ番号は:", fileNumber);
    //     matchCount = fileNumber
    // }).catch(error => {
    //     console.error("エラーが発生しました:", error);
    // });
    // findMaxAmongPrefixes(directoryPath, filePrefixes).then(maxResult => {
    //     if (maxResult) {
    //         console.log('The path of the file with the overall maximum number is:', maxResult.maxNumber);
    //     } else {
    //         console.log('No matching files were found.');
    //     }
    // }).catch(err => {
    //     console.error('Error:', err);
    // });
}













const removeUserOnDisconnect = (disconnectedSocketID) => {
    // socketIDが一致しないユーザーのみを残す
    console.log(users, disconnectedSocketID)
    users = users.filter(user => user.socketId !== disconnectedSocketID);
}

const beforeDuelHandler = (socket, io) => {
    socket.on('match', ({ playerName, secretword }) => {
        // const uesr = { playerName, secretword, sessionId };
        const user = { playerName: playerName, secretword: secretword, socketId: socket.id, pairSocketId: null}
        const matchedPlayer = users.find(
            (user) => user.secretword === secretword
        );
        if (matchedPlayer) {
            // マッチしたユーザーをマッチング待機リストから削除
            const index = users.indexOf(matchedPlayer);
            users.splice(index, 1);
            // マッチング成功した場合の処理
            // 1. セッションIDの関連付け。お互いのidをもたせる
            matchedPlayer.pairSocketId = socket.id;
            user.pairSocketId = matchedPlayer.socketId;
            // 2. マッチング成功イベントの送信
            const room = `${matchedPlayer.socketId}${user.socketId}`;
            console.log('matchCount', matchCount)
            socket.emit('matchSuccess', { playerName: matchedPlayer.playerName, roomName: room, playerId: socket.id, matchedPlayerId: user.pairSocketId});
            // socket.emit('matchSuccess', { playerName: matchedPlayer.playerName, roomName: room, playerId: socket.id, matchedPlayerId: user.pairSocketId});
            // 3. 対戦相手にもマッチング成功イベントの送信
            io.to(user.pairSocketId).emit('matchSuccess', { playerName: playerName, roomName: room, playerId: user.pairSocketId, matchedPlayerId: socket.id});
            // io.to(user.pairSocketId).emit('matchSuccess', {playerName: playerName, roomName: room, playerId: user.pairSocketId, matchedPlayerId: socket.id});


            
        } else {
            // マッチングしてない人は待機リストに追加
            users.push(user)
        }
        console.log('users', users, user)

    });

    // 'decideTurn' イベントを受け取った時の処理
    socket.on('decideTurn', (choice, roomName, playerName) => {

        if (!roomChoices[roomName]) {
            roomChoices[roomName] = {};
        }
        console.log('choice', choice);

        roomChoices[roomName][socket.id] = [choice, playerName]; // ルーム内のクライアントの選択を保存
        const player1SocketId = Object.keys(roomChoices[roomName])[0];
        const player2SocketId = Object.keys(roomChoices[roomName])[1];

        console.log('players', player1SocketId, player2SocketId)

        // 両プレイヤーが選択した場合の処理
        if (Object.keys(roomChoices[roomName]).length === 2) {
            const player1Choice = roomChoices[roomName][player1SocketId][0];
            const player2Choice = roomChoices[roomName][player2SocketId][0];
            // 両プレイヤーが同じ選択をした場合はランダムに先行を決める
            if (player1Choice === player2Choice) {
                const firstPlayer = Math.random() < 0.5 ? player1SocketId : player2SocketId;
                // 後攻も取得
                let secondPlayer = '';
                let firstPlayerName = roomChoices[roomName][firstPlayer][1];
                let secondPlayerName = '';
                
                if (firstPlayer === player1SocketId) {
                    secondPlayer = player2SocketId;
                    secondPlayerName = roomChoices[roomName][secondPlayer][1];
                } else {
                    secondPlayer = player1SocketId;
                    secondPlayerName = roomChoices[roomName][secondPlayer][1];

                }
                console.log('matchCount', matchCount)
                io.to(roomName).emit('turnDecision', { firstPlayer, firstPlayerName, secondPlayer, secondPlayerName, matchCount: ++matchCount });
            } else {
                // 一方が "give" を選択した場合、相手が先行となる
                const firstPlayer = player1Choice === 'give' ? player2SocketId : player1SocketId;
                // 後攻も取得
                let secondPlayer = '';
                let firstPlayerName = roomChoices[roomName][firstPlayer][1];
                let secondPlayerName = '';
                
                if (firstPlayer === player1SocketId) {
                    secondPlayer = player2SocketId;
                    secondPlayerName = roomChoices[roomName][secondPlayer][1];
                } else {
                    secondPlayer = player1SocketId;
                    secondPlayerName = roomChoices[roomName][secondPlayer][1];

                }
                console.log('matchCount',matchCount)

                io.to(roomName).emit('turnDecision', { firstPlayer, firstPlayerName, secondPlayer, secondPlayerName, matchCount: ++matchCount });
            }

            // 選択結果を初期化
            roomChoices[roomName] = {};
        }
        socket.roomName = roomName
    });

};
module.exports = { beforeDuelHandler, users, roomChoices, removeUserOnDisconnect, initializeMatchCount, checkAndSetleatestMatchNumber};
// export { beforeDuelHandler, users, roomChoices };