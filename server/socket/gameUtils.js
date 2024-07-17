// const { io } = require('../server');
const fs = require('fs');
const lockfile = require('lockfile');
const path = require('path');
const ManagementMatchData = require('../managementMatchData');

// ルームでのお互いのプレイヤー待機
const roomWaiter = {}

const matchResultDataManager = new ManagementMatchData('matchData')
const fiberJarResultDataManager = new ManagementMatchData('fiberJar')
const painfulChoiceResultDataManager = new ManagementMatchData('painfulChoice')
const peepingResultDataManager = new ManagementMatchData('peeping')
const searchResultDataManager = new ManagementMatchData('search')
const salvageResultDataManager = new ManagementMatchData('salvage')
const betrayResultDataManager = new ManagementMatchData('betray')

// const matchResultCsvFilePath = path.join(__dirname, '../csv/matchData_1.csv');
// const fiberJarResultCsvFilePath = path.join(__dirname, '../csv/fiberJar_1.csv');
// const painfulChoiceResultCsvFilePath = path.join(__dirname, '../csv/painfulChoice_1.csv');
// const peepingResultCsvFilePath = path.join(__dirname, '../csv/peeping_1.csv');
// const searchResultCsvFilePath = path.join(__dirname, '../csv/search_1.csv');
// const salvageResultCsvFilePath = path.join(__dirname, '../csv/salvage_1.csv');
// const betrayResultCsvFilePath = path.join(__dirname, '../csv/betray_1.csv');



// マッチリザルトを保存
// obj={matchData}
const resultSave = (obj, csvFilePath) => {
    console.log('save result!!',obj)
    // // オブジェクトをCSV形式に変換する関数
    function convertToCSV(obj) {
        const headers = Object.keys(obj).join(',');
        const values = Object.values(obj).join(',');

        return `${headers}\n${values}`;
    }

    // // CSVファイルに書き込む関数（ロック機能付き）
    // function writeCSVWithLock(filePath, obj) {
    //     return new Promise((resolve, reject) => {
    //         const lockPath = `${filePath}.lock`;

    //         // ファイルロックを取得
    //         lockfile.lock(lockPath, { retries: 10, retryWait: 100 }, (lockErr) => {
    //             if (lockErr) {
    //                 return reject(lockErr);
    //             }

    //             // CSV形式に変換
    //             const csvData = convertToCSV(obj);

    //             // CSVファイルに書き込み
    //             fs.appendFile(filePath, csvData + '\n', (writeErr) => {
    //                 // ロック解放
    //                 lockfile.unlock(lockPath, (unlockErr) => {
    //                     if (unlockErr) {
    //                         return reject(unlockErr);
    //                     }
    //                     if (writeErr) {
    //                         return reject(writeErr);
    //                     }
    //                     resolve();
    //                 });
    //             });
    //         });
    //     });
    // }

    function getFileLineCount(filePath) {
        return new Promise((resolve, reject) => {
            let lineCount = 0;
            fs.createReadStream(filePath)
                .on('data', buffer => {
                    let idx = -1;
                    lineCount--; // 最後の行の改行を考慮してデクリメント
                    do {
                        idx = buffer.indexOf(10, idx + 1);
                        lineCount++;
                    } while (idx !== -1);
                })
                .on('end', () => {
                    resolve(lineCount);
                })
                .on('error', reject);
        });
    }

    function writeCSVWithLock(filePath, obj, maxLines = 1000) {
        return getFileLineCount(filePath)
            .then(lineCount => {
                let headers = '';
                if (lineCount === 0) { // 最初の行の場合、ヘッダを含める
                    headers = Object.keys(obj).join(',') + '\n';
                }
                if (lineCount >= maxLines) {
                    // 新しいファイル名を生成（例: data_1.csv, data_2.csv, ...）
                    const fileExtension = path.extname(filePath);
                    const baseName = path.basename(filePath, fileExtension);
                    const dirName = path.dirname(filePath);
                    let newFileIndex = parseInt(baseName.split('_')[1]) || 0;

                    let newFilePath;
                    do {
                        newFilePath = path.join(dirName, `${baseName}_${newFileIndex}${fileExtension}`);
                        newFileIndex++;
                    } while (fs.existsSync(newFilePath));

                    filePath = newFilePath;
                }

                // CSV形式に変換
                const values = Object.values(obj).map(value =>
                    Array.isArray(value) ? `"${value.join('|')}"` : value // 配列をパイプ区切りの文字列に変換
                ).join(',');
                const csvData = headers + values;

                // ファイルロックを取得して書き込み
                const lockPath = `${filePath}.lock`;
                return new Promise((resolve, reject) => {
                    lockfile.lock(lockPath, { retries: 10, retryWait: 100 }, (lockErr) => {
                        if (lockErr) return reject(lockErr);

                        fs.appendFile(filePath, csvData + '\n', (writeErr) => {
                            lockfile.unlock(lockPath, (unlockErr) => {
                                if (unlockErr) return reject(unlockErr);
                                if (writeErr) return reject(writeErr);
                                resolve();
                            });
                        });
                    });
                });
            });
    }

    // 使用例
    // const obj = { name: 'Alice', age: 30, city: 'Wonderland' };
    // const csvFilePath = path.join(__dirname, '../../csv/matchData_1.csv');
    const maxLines = 1000; // ここで最大行数を設定

    writeCSVWithLock(csvFilePath, obj, maxLines)
        .then(() => console.log('CSVファイルに書き込みました。'))
        .catch(error => console.error('書き込みエラー:', error));
}

const gameUtilsHandler = (socket, io) => {
    // 相手がドローしたときの処理
    socket.on('draw', (data) => {

        socket.broadcast.to(data.roomName).emit('draw');
    });
    // 相手が複数ドローしたときの処理
    socket.on('drawCards', (data) => {

        socket.broadcast.to(data.roomName).emit('drawCards', data.num);
    });
    // 相手が召喚したときの処理
    socket.on('normalSummon', (data) => {
        console.log('normal summon', data.roomName, data.playerId, data.cardId, data.face);
        socket.broadcast.to(data.roomName).emit('normalSummon', data.playerId, data.cardId, data.face);
    });
    // 生贄召喚したときの処理
    socket.on('advanceSummon', (data) => {

        socket.broadcast.to(data.roomName).emit('advanceSummon', data.playerId, data.cardId, data.tribute, data.face);
    });

    socket.on('put', (data) => {

        socket.broadcast.to(data.roomName).emit('put', data.cardId, data.face);
    });

    socket.on('activate', (data) => {
        
        socket.broadcast.to(data.roomName).emit('activate', data.card);
    });
    socket.on('change', (data) => {
        
        socket.broadcast.to(data.roomName).emit('change', data.cardId);
    });
    socket.on('reverse', (data) => {
        console.log('server reverse')
        socket.broadcast.to(data.roomName).emit('reverse', data.cardId, data.face);
    });
    // チェーン確認を相手に聞く
    socket.on('chainConfirm', (data) => {
        console.log('chain?', data.eventName, data.effectProps)
        // console.log('chain block cards is ',data.chainBlockCards)
        // このplayerIdは効果発動者
        socket.broadcast.to(data.roomName).emit('confirmChain', data.effectProps, data.playerId, data.chainBlockCards, data.eventName, data.action, data.fields, data.target);
    });
    // チェーン確認を自分に聞く
    socket.on('chainConfirmSelf', (data) => {
        console.log('chainConfirmSelf', data.eventName, data.effectProps)
        // console.log('chain block cards is ', data.chainBlockCards)

        socket.emit('confirmChain', data.effectProps, data.playerId, data.chainBlockCards, data.eventName, data.action, data.fields, data.target);
    });
    // チェーン結果を相手に返す
    socket.on('chainConfirmResult', (data) => {
        console.log('chained', data.eventName)
        // console.log('chain block cards is ', data.chainBlockCards)
        chainBlockCards = data.chainBlockCards;
        updateFields = data.updateFields;
        console.log(data)

        socket.broadcast.to(data.roomName).emit(data.eventName, { chainBlockCards, updateFields });
    });
    // チェーン結果を自分に返す
    socket.on('chainConfirmResultSelf', (data) => {
        console.log('self chained')
        // console.log('chain block cards is ', data.chainBlockCards)
        chainBlockCards = data.chainBlockCards;
        updateFields = data.updateFields;

        socket.emit(data.eventName, { chainBlockCards, updateFields });
    });
    // 相手始動のクイックエフェクト確認(往復)の待機
    socket.on('quickEffectStart', (data) => {
        console.log('quickEffectStart', data);
        console.log('待機イベント名', 'quickEffectStart' + data.quickEffectStack);
        socket.broadcast.to(data.roomName).emit('quickEffectStart', { fields: data.fields, action: data.action, actionMonster: data.actionMonster, quickEffectStack: data.quickEffectStack });
    });
    // 相手始動の両者クイックエフェクト終了
    socket.on('quickEffectEnd', (data) => {
        console.log('quickEffectEnd', data);
        console.log('終了イベント名', 'quickEffectEnd' + data.quickEffectStack);
        socket.broadcast.to(data.roomName).emit('quickEffectEnd' + data.quickEffectStack, data.quickEffectResult);
    });
    socket.on('actionChainStart', (data) => {
        console.log('actionChainStart');
        socket.broadcast.to(data.roomName).emit('actionChainStart', { effectProps: data.effectProps, cardId: data.cardId, chainCards: data.chainCards, action: data.action});
    });
    socket.on('actionChainEnd', (data) => {
        console.log('actionChainEnd');
        socket.broadcast.to(data.roomName).emit('actionChainEnd');
    });
    // 相手のクイックエフェクト発動可否の確認
    socket.on('quickEffect', (data) => {
        console.log('quickEffect', data)
        console.log('待機イベント名', 'quickEffectConfirm' + data.quickEffectStack);
        socket.broadcast.to(data.roomName).emit('quickEffect', { conditions: data.conditions, quickEffectStack: data.quickEffectStack });
    });
    // 相手がクイックエフェクトを使ったかどうか
    socket.on('quickEffectConfirm', (data) => {
        console.log('quickEffectConfirm', data, 'quickEffectConfirm' + data.eventName + data.quickEffectStack)
        socket.broadcast.to(data.roomName).emit('quickEffectConfirm' + data.eventName + data.quickEffectStack, { fields: data.fields, status: data.status });
    });
    // 自分がクイックエフェクトを使ったかどうか
    socket.on('quickEffectSelf', (data) => {
        console.log('quickEffectSelf', data)
        console.log('終了イベント名', 'quickEffectSelf' + data.quickEffectStack);
        socket.emit('quickEffectSelf' + data.quickEffectStack, { fields: data.fields, status: data.status });
    });
    // socket.on('quickEffectConfirmResult', (data) => {
    //     console.log('quickefected')
    //     socket.broadcast.to(data.roomName).emit('quickEffectConfirmResult', data.useCard);
    // });
    // playerIdのcardを破壊する
    socket.on('destroy', (data) => {
        console.log('destroy')
        socket.broadcast.to(data.roomName).emit('destroy', data.fields ,data.playerId, data.cardId);
    });
    // effectingをfalseにすることによりuseEffectでcleanUpをトリガー
    socket.on('cleanUp', (data) => {
        console.log('cleanUp');
        socket.broadcast.to(data.roomName).emit('cleanUp', { useCardIds:data.cards, fields:data.fields});
    });
    socket.on('selectCard', (data) => {
        console.log('selectCard', data.cardId)
        socket.emit('selectCard', data.cardId);
    });
    // 心変わりなどのコントローラー奪取
    socket.on('betray', (data) => {
        console.log('betray', data)
        socket.broadcast.to(data.roomName).emit('betray', { steeler: data.steeler, victim: data.victim, targetCardId: data.targetCardId });
    });
    // 強奪などの紐づけ
    socket.on('link', (data) => {
        console.log('link')
        socket.broadcast.to(data.roomName).emit('link', { linkCardId: data.linkCardId, targetCardId: data.targetCardId });
    });
    // 強奪などの紐づけ
    socket.on('unlink', (data) => {
        console.log('unlink')
        socket.broadcast.to(data.roomName).emit('unlink', { cardId: data.cardId, unlinkCardId: data.unlinkCardId });
    });
    // まとめて破壊
    socket.on('sweep', (data) => {
        console.log('sweep')
        socket.broadcast.to(data.roomName).emit('sweep', { fields: data.fields, target:data.target });
    });
    // ハンデス
    socket.on('discard', (data) => {
        console.log('discard');
        socket.broadcast.to(data.roomName).emit('discard', { playerId:data.playerId, discardCardId:data.discardCardId });
    });
    // ハンデス
    socket.on('discardCards', (data) => {
        console.log('discardCards');
        socket.broadcast.to(data.roomName).emit('discardCards', { playerId: data.playerId, targets: data.targets });
    });
    // 番兵
    socket.on('handReturnToDeck', (data) => {
        console.log('handReturnToDeck');
        socket.broadcast.to(data.roomName).emit('handReturnToDeck', { playerId:data.playerId, cardId:data.cardId });
    });
    // ライフ減少
    socket.on('reduceLP', (data) => {
        console.log('reduceLP');
        socket.broadcast.to(data.roomName).emit('reduceLP', { playerId:data.playerId, value:data.value });
    });
    // 破壊輪による両者LP現象
    socket.on('reduceLPBoth', (data) => {
        console.log('reduceLPBoth');
        socket.broadcast.to(data.roomName).emit('reduceLPBoth', { value:data.value });
    });
    // 護封剣の時の裏守備開示
    socket.on('openCards', (data) => {
        console.log('openCards');
        // socket.broadcast.to(data.roomName).emit('openCards', { cardIds: data.cardIds });
        socket.broadcast.to(data.roomName).emit('openCards', { cardIds: data.cardIds, useCardId: data.useCardId });
    })
    // 聖なる魔術師のサルベージ
    socket.on('salvage', (data) => {
        console.log('salvage');
        socket.broadcast.to(data.roomName).emit('salvage', { playerId:data.playerId, cardId: data.cardId });
    })
    // 蘇生
    socket.on('revive', (data) => {
        console.log('revive');
        socket.broadcast.to(data.roomName).emit('revive', { playerId:data.playerId, cardId: data.cardId });
    })
    // モンスターの除外
    socket.on('monsterBanish', (data) => {
        console.log('monsterBanish');
        socket.broadcast.to(data.roomName).emit('monsterBanish', { cardId: data.cardId });
    })
    // デッキから除外、抹殺の使徒の追加効果
    socket.on('deckBanish', (data) => {
        console.log('deckBanish');
        socket.broadcast.to(data.roomName).emit('deckBanish', { cardId: data.cardId });
    })
    // ザルーグのデッキ破壊
    socket.on('deckDestruction', (data) => {
        console.log('deckDestruction');
        socket.broadcast.to(data.roomName).emit('deckDestruction', { num:data.num });
    })
    // 相手モンスターの効果発動確認
    socket.on('opponentMonsterEffect', (data) => {
        console.log('opponentMonsterEffect');
        socket.broadcast.to(data.roomName).emit('opponentMonsterEffect', { eventName: data.eventName, cardId: data.cardId, targetId: data.targetId });
    })
    // 相手モンスターの効果終了
    socket.on('opponentMonsterEffectEnd', (data) => {
        console.log('opponentMonsterEffectEnd');
        socket.broadcast.to(data.roomName).emit(data.eventName, { oppoDDEffectChoice: data.DDEffectChoice, updatefields: data.updateFields });
    })
    // お注射天使リリーの効果発動確認
    socket.on('lily', (data) => {
        console.log('lily');
        socket.broadcast.to(data.roomName).emit('lily', { eventName: data.eventName, cardId: data.cardId, fields:data.fields});
    })
    // お注射天使リリーの効果終了
    socket.on('lilyEnd', (data) => {
        console.log('lilyEnd');
        socket.broadcast.to(data.roomName).emit(data.eventName, { updatefields: data.updateFields });
    })
    // リバース効果の強制発動
    socket.on('enforceActivate', (data) => {
        console.log('enforceActivate');
        socket.broadcast.to(data.roomName).emit('enforceActivate', { eventName: data.eventName, cardId: data.cardId});
    })
    // リバース効果の効果終了
    socket.on('enforceActivateEnd', (data) => {
        console.log('enforceActivateEnd');
        socket.broadcast.to(data.roomName).emit(data.eventName, { updatefields: data.updateFields });
    })
    // カイクウ
    socket.on('kycoo', (data) => {
        console.log('kycoo');
        socket.broadcast.to(data.roomName).emit('kycoo', { cardIds: data.cardIds });
    })
    // 攻撃力の増減
    socket.on('attackIncrease', (data) => {
        console.log('attackIncrease');
        socket.broadcast.to(data.roomName).emit('attackIncrease', { cardId: data.cardId, value: data.value });
    })
    
    // ファイバーポッドのデッキ戻し
    socket.on('fiberJar', (data) => {
        console.log('fiberJar');
        // socket.broadcast.to(data.roomName).emit('fiberJar', { updatefields: data.updatefields });
        io.to(data.roomName).emit('fiberJar', { playerId: data.playerId, updatefields: data.updatefields });
        fiberJarResultDataManager.addData(data.updatefields.players[data.playerId].matchData)
    })
    // ファイバーポッドのデッキ戻し完了
    socket.on('fiberJarEnd', (data) => {
        console.log('fiberJarEnd');
        socket.broadcast.to(data.roomName).emit('fiberJarEnd', { updatefields: data.updatefields });
    })

    // ファイバーポッドの非同期5ドロー
    // ioインスタンスを使用した処理
    socket.on('promiseDraw', (data) => {
        console.log('promiseDraw');
        io.to(data.roomName).emit('promiseDraw', { num: data.num, updatefields: data.fields, eventName:data.eventName });
    })
    // ファイバーポッドの非同期5ドロー終了通知
    socket.on('promiseDrawEnd', (data) => {
        console.log('promiseDrawEnd', data.eventName);
        socket.broadcast.to(data.roomName).emit(data.eventName, { updatefields:data.updatefields });
        // io.to(data.roomName).emit(data.eventName, { updatefields:data.updatefields });
    })
    // 増援によるカードサーチ
    socket.on('search', (data) => {
        console.log('search');
        socket.broadcast.to(data.roomName).emit('search', { playerId: data.playerId, cardId: data.cardId });
    })
    // デッキのシャッフル(相手がシャッフルしたデッキを受け取り上書きするだけ)
    socket.on('deckShuffled', (data) => {
        console.log('deckShuffled');
        socket.broadcast.to(data.roomName).emit('deckShuffled', { playerId: data.playerId, updateDeck: data.updateDeck });
    })
    // 苦渋の選択で相手に5枚から1枚を選ばせる
    socket.on('selectOppo', (data) => {
        console.log('selectOppo');
        socket.broadcast.to(data.roomName).emit('selectOppo', { selectArray: data.selectArray, num: data.num, cardId: data.cardId });
    })
    // 苦渋の選択で5枚から選んだ1枚を返す
    socket.on('selectOppoEnd', (data) => {
        console.log('selectOppoEnd');
        socket.broadcast.to(data.roomName).emit('selectOppoEnd', { cardId: data.cardId });
    })
    // 苦渋の選択で5枚から選んだ1枚を返す
    socket.on('deckToGraveyard', (data) => {
        console.log('deckToGraveyard');
        socket.broadcast.to(data.roomName).emit('deckToGraveyard', { targets: data.targets });
    })
    
    // カウンターを乗せる
    socket.on('putCounter', (data) => {
        console.log('putCounter');
        socket.broadcast.to(data.roomName).emit('putCounter', { cardId: data.cardId });
    })
    // カウンターを取り除く
    socket.on('removeCounter', (data) => {
        console.log('removeCounter');
        socket.broadcast.to(data.roomName).emit('removeCounter', { cardId: data.cardId });
    })
    // 開闢の召喚
    socket.on('blackLusterSummon', (data) => {
        console.log('blackLusterSummon');
        socket.broadcast.to(data.roomName).emit('blackLusterSummon', { playerId: data.playerId, cardId: data.cardId, tributeCardIds: data.tributeCardIds, faceStatus: data.faceStatus });
    })
    // ゲーム開始時の先行側からの通知
    socket.on('startUp', (data) => {
        console.log('startUp');
        socket.broadcast.to(data.roomName).emit('startUp', { updatefields: data.updatefields });
    })
    // ターンプレイヤーによるターンの完全終了通知
    socket.on('endTurn', (data) => {
        console.log('endTurn');
        socket.broadcast.to(data.roomName).emit('endTurn' );
    })
    // フェイズ変更用
    socket.on('changePhase', (data) => {
        console.log('changePhase', data.phase);
        socket.broadcast.to(data.roomName).emit('changePhase', { changePhase: data.changePhase} );
    })
    // スケープゴート
    socket.on('goats', (data) => {
        console.log('goats');
        socket.broadcast.to(data.roomName).emit('goats', { activatePlayerId: data.playerId, updateMonsterZone: data.updateMonsterZone, goatsNumber: data.goatsNumber} );
    })
    // スケープゴート
    socket.on('returnSnatchMonsters', (data) => {
        console.log('returnSnatchMonsters', data);
        socket.broadcast.to(data.roomName).emit('returnSnatchMonsters', { snatchSteals: data.snatchSteals } );
    })
    // コンディションの追加
    socket.on('conditionAdd', (data) => {
        console.log('conditionAdd', data);
        socket.broadcast.to(data.roomName).emit('conditionAdd', { condition: data.condition } );
    })
    // コンディションの削除
    socket.on('conditionRemove', (data) => {
        console.log('conditionRemove', data);
        socket.broadcast.to(data.roomName).emit('conditionRemove', { condition: data.condition } );
    })
    // アクションモンスターの追加
    socket.on('addActionMonster', (data) => {
        console.log('addActionMonster', data);
        socket.broadcast.to(data.roomName).emit('addActionMonster', { actionMonster: data.actionMonster, action:data.action } );
    })
    // メッセージポップアップの表示
    socket.on('messagePopUp', (data) => {
        console.log('messagePopUp', data);
        socket.broadcast.to(data.roomName).emit('messagePopUp', { message: data.message } );
    })
    // 効果使用の通知
    socket.on('effectUse', (data) => {
        console.log('effectUse', data);
        socket.broadcast.to(data.roomName).emit('effectUse', { cardId: data.cardId } );
    })
    // 攻撃先の登録
    socket.on('setAttackedTargetId', (data) => {
        console.log('setAttackedTargetId', data);
        socket.broadcast.to(data.roomName).emit('setAttackedTargetId', { targetCardId: data.targetCardId } );
    })
    // 効果処理時のエフェクト発動
    socket.on('effectVisualize', (data) => {
        console.log('effectVisualize', data);
        io.to(data.roomName).emit('animating');
        io.to(data.roomName).emit('effectVisualize', { cardId: data.cardId });
    })
    // 効果発動時のエフェクト発動
    socket.on('effectTrigger', (data) => {
        console.log('effectTrigger', data);
        io.to(data.roomName).emit('animating');
        io.to(data.roomName).emit('effectTrigger', { cardId: data.cardId });
    })
    // ライトニング・ボルテックス発動時の専用イベント。discardとputを一つの関数で行う
    socket.on('voltexActivate', (data) => {
        console.log('voltexActivate', data);
        socket.broadcast.to(data.roomName).emit('voltexActivate', { voltexId: data.voltexId, discardCardId: data.discardCardId });
    })
    // メッセージログの表示
    socket.on('messageLog', (data) => {
        console.log('messageLog', data);
        io.to(data.roomName).emit('messageLog', { type: data.type, action: data.action, playerId: data.playerId, message: data.message });
    })
    // 抹殺の使徒の非公開領域確認用
    socket.on('displayPrivateCards', (data) => {
        console.log('displayPrivateCards', data);
        socket.broadcast.to(data.roomName).emit('displayPrivateCards', { fields: data.fields });
    })
    // 抹殺の使徒の非公開領域確認の完了用
    socket.on('checkPrivateCards', (data) => {
        console.log('checkPrivateCards', data);
        socket.broadcast.to(data.roomName).emit('checkPrivateCards', { status: true });
    })
    // 攻撃時の矢印表示
    socket.on('displayArrow', (data) => {
        console.log('displayArrow', data);
        io.to(data.roomName).emit('displayArrow', { attackCardId: data.attackCardId, targetCardId: data.targetCardId });
    })
    // 攻撃時の矢印削除
    socket.on('offArrow', (data) => {
        console.log('offArrow', data);
        io.to(data.roomName).emit('offArrow');
    })
    // 攻撃時の移動アニメーション
    socket.on('cardAttackAnimation', (data) => {
        console.log('cardAttackAnimation', data);
        io.to(data.roomName).emit('animating');
        io.to(data.roomName).emit('cardAttackAnimation' + data.attackerId, { attackerId: data.attackerId, targetId: data.targetId});
    })
    // 攻撃時の移動アニメーションの完了通知
    socket.on('endCardAttackAnimation', (data) => {
        console.log('endCardAttackAnimation', data);
        io.to(data.roomName).emit('endCardAttackAnimation');
    })
    // 勝敗決着時に相手に教える
    socket.on('decision', (data) => {
        console.log('decision', data);
        io.to(data.roomName).emit('decision', { decisionObj: data.decisionObj });
        matchResultDataManager.addData(data.result);
    })
    // 決着後タイトルに戻る
    socket.on('leaveRoom', (roomName) => {
        socket.leave(roomName);
        // socket.broadcast.to(roomName).emit('leaveRoom');
        socket.to(roomName).emit('userDisconnected', { userId: socket.id });
        delete roomWaiter[roomName]
    });

    // メッセージログ用のチェーン数カウントをリセットする
    socket.on('chainCountMsgReset', (data) => {
        console.log('chainCountMsgReset');
        io.to(data.roomName).emit('chainCountMsgReset');
    })

    // カード使用回数のカウント処理、効果発動で取得してはいけないもの達
    socket.on('useCardData', (data) => {
        console.log('useCardData');
        io.to(data.roomName).emit('useCardData', { cardId: data.cardId });
    })
    // 両プレイヤーにシャッフルアニメーションを実行させる
    socket.on('shuffleAnimation', (data) => {
        console.log('shuffleAnimation',data);
        io.to(data.roomName).emit('shuffleAnimation', { playerId: data.playerId });
    })
    // 自身が選択中のことを相手に教える
    socket.on('nowChoicing', (data) => {
        console.log('nowChoicing', data);
        socket.broadcast.to(data.roomName).emit('nowChoicing');
    })
    // 相手に効果対象を選択してもらう
    socket.on('checkEffectTarget', (data) => {
        console.log('checkEffectTarget', data);
        socket.broadcast.to(data.roomName).emit('checkEffectTarget', { cardId: data.cardId });
    })
    // 相手から要求された効果対象の選択を相手に返す
    socket.on('checkEffectTargetEnd', (data) => {
        console.log('checkEffectTargetEnd', data);
        socket.broadcast.to(data.roomName).emit('checkEffectTargetEnd', { effectTargetCardId: data.effectTargetcardId });
    })
    // 効果を使用済みにするイベント
    socket.on('usedEffect', (data) => {
        console.log('usedEffect', data);
        socket.broadcast.to(data.roomName).emit('usedEffect', { effectUsedCardId: data.effectUsedCardId });
    })








    // // ファイバーポッドを使ったときの状況を保存
    // 普通のファイバーポッド処理に含んだので不使用
    // socket.on('fiberJarResult', (data) => {
    //     console.log('fiberJarResult');
    //     resultSave(data.fiberJarResult, fiberJarResultCsvFilePath);
    // })
    // 苦渋の選択を使ったときの状況を保存
    socket.on('painfulChoiceResult', (data) => {
        console.log('painfulChoiceResult');
        painfulChoiceResultDataManager.addData(data.painfulChoiceResult);
    })
    //ピーピングハンデスをしたときの状態を保存
    socket.on('peepingResult', (data) => {
        console.log('peepingResult');
        peepingResultDataManager.addData(data.peepingResult);
    })
    //増援でサーチしたときの状態を保存
    socket.on('searchResult', (data) => {
        console.log('searchResult');
        searchResultDataManager.addData(data.searchResult);
    })
    //セイマジでサルベージしたときの状態を保存
    socket.on('salvageResult', (data) => {
        console.log('salvageResult');
        salvageResultDataManager.addData(data.salvageResult);
    })
    //セイマジでサルベージしたときの状態を保存
    socket.on('betrayResult', (data) => {
        console.log('betrayResult');
        betrayResultDataManager.addData(data.betrayResult);
    })
    
    
    
    // 両プレイヤーを待つ
    socket.on('waitBothPlayer', (data) => {
        console.log('waitBothPlayer', data);
        const roomName = data.roomName
        // ルーム内で相手が待っていたら両者揃ったことになる
        // roomWaiter[roomName]はオブジェクトにしてIDをキーとしてismobileをバリューに持たせ、返却先でお互いがモバイルか判断
        if (roomWaiter[roomName]) {
            console.log({ ...roomWaiter[roomName], [data.playerId]: data.isMobile })
            io.to(roomName).emit('bothPlayerSynced', { ...roomWaiter[roomName], [data.playerId]:data.isMobile });
            delete roomWaiter[roomName]
        } else {
            // 相手が待ってなかったら自分のIDを入れて待つ
            roomWaiter[roomName] = {
                [data.playerId]:data.isMobile
            }
        }
        console.log(roomWaiter)
    })

};
module.exports = gameUtilsHandler;