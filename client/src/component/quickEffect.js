import React, { useEffect, useLayoutEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { activate, getPriority } from '../gamePlayLogic';
import { allCards } from '../models/cards';


const QuickEffect = ({ socket, roomName, players, setPlayers, playerId, opponentPlayerId, setQuickEffectTiming, conditions, setConditions, setSpellSpeed, phase, chainProps, quickEffectStack, fields, oppoChoicing, setOppoChoicing, setEffecting }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    let message = '';
    let activater = chainProps.activater;
    let actionMonster = allCards[chainProps.actionMonster]
    let activatePlayer = ""
    let actionPlayer = ""
    // console.log(conditions,chainProps);
    // console.log(chainProps.actionMonster)
    // console.log((chainProps.actionMonster))
    // console.log((chainProps.action === 'summoned' || chainProps.action === 'summon' || chainProps.action === 'reverse') && chainProps.actionMonster)
    // setConditions(conditions.filter(condition => condition != "ignition"));

    // レンダリング関数での実行ではなくレンダリング直前に行うことで衝突を避ける
    useLayoutEffect(() => {
        console.log('oppoChoicing',oppoChoicing, JSON.stringify(oppoChoicing));
        if (!players[playerId].priority) {
            getPriority(players, setPlayers, playerId, opponentPlayerId);
            setEffecting(false);
        }
        if ((chainProps.action === 'summoned' || chainProps.action === 'summon' || chainProps.action === 'reverse') && chainProps.actionMonster) {
            activater = chainProps.activater
            // 含まれてたら無限に追加しちゃうので無いときにだけ足す
            if (!conditions.includes('summoned')) {
                console.log(chainProps);
                // 通常魔法は使用不可、召喚反応系を使用可能にする
                let newConditions = conditions.filter((condition) => condition != 'normalSpell');
                newConditions = [...conditions, 'summoned']
                setConditions(newConditions);
            }
        } else if (chainProps.action === 'attack' && chainProps.actionMonster) {
            if (!conditions.includes('attack')) {
                setConditions([...conditions, 'attack']);
            }
        }
        if (conditions.includes("ignition") && !conditions.includes("summoned")) {
            setConditions(conditions.filter(condition => condition != "ignition"))
        }
    }, []);
    const handleCancel = async () => {
        await getPriority(players, setPlayers, opponentPlayerId, playerId);
        console.log('quick effect ', players[playerId]);
        if (players[playerId].turnPlayer) {
            console.log('quickEffectSelf', quickEffectStack)
            if ((phase == "main1" || phase == "main2") && !conditions.includes("ignition")) {
                // 起動効果が使えるタイミングならクイックエフェクト終了時に戻す
                setConditions([...conditions, "ignition"]);
            }
            socket.emit('quickEffectSelf', { roomName, status: false, fields: fields, quickEffectStack: quickEffectStack });
        } else {
            let eventName = "";
            if (conditions.includes('phaseEnd')) {
                eventName = "phaseEnd";
            }
            console.log('quickEffectConfirm', quickEffectStack)
            socket.emit('quickEffectConfirm', { roomName, status: false, eventName: eventName, fields: fields, quickEffectStack: quickEffectStack });
            // フェイズ終了のときはフェイズ終了タイミングを削除
            // if (conditions.includes('phaseEnd')) {
            //     setConditions(conditions.filter((condition) => condition != 'phaseEnd'))
            // }
            setOppoChoicing((prevState) => {
                console.log('quickEffectConfirm', prevState)
                return true
            })
        }
        setQuickEffectTiming(false);
        setSpellSpeed(0)
    }


    // useEffect(() => {
    //     if ((chainProps.action === 'summoned' || chainProps.action === 'summon' || chainProps.action === 'reverse') && chainProps.actionMonster) {
    //         activater = chainProps.activater
    //         // 含まれてたら無限に追加しちゃうので無いときにだけ足す
    //         if (!conditions.includes('summoned')) {
    //             console.log(chainProps);
    //             // 通常魔法は使用不可、召喚反応系を使用可能にする
    //             let newConditions = conditions.filter((condition) => condition != 'normalSpell');
    //             newConditions = [...conditions, 'summoned']
    //             setConditions(newConditions);
    //         }
    //     } else if (chainProps.action === 'attack' && chainProps.actionMonster) {
    //         if (!conditions.includes('attack')) {
    //             setConditions([...conditions, 'attack']);
    //         }
    //     }
    //     if (conditions.includes("ignition") && !conditions.includes("summoned")) {
    //         setConditions(conditions.filter(condition => condition != "ignition"))
    //     }
    // }, []);
    message = '一連の効果処理が終了しました。何かカードを発動しますか？'

    switch (chainProps.action) {
        case 'summon':
            // console.log(chainProps.actionMonster, actionMonster)
            if (actionMonster) {
                actionPlayer = actionMonster.controller
                if (actionPlayer == playerId) {
                    actionPlayer = 'あなた';
                } else {
                    actionPlayer = '相手';
                }
                // console.log('action is summon', actionMonster);
                message = actionPlayer + 'が' + actionMonster.name + 'を召喚しました。何かカードを発動しますか？'
            } else {
                message = '誰かがなんかを召喚しました。何かカードを発動しますか？'
            }

            break;
        case 'attack':
            if (actionMonster) {
                actionPlayer = actionMonster.controller
            } else { actionPlayer = '誰か'}
            console.log(chainProps)
            if (actionPlayer == playerId) {
                actionPlayer = 'あなた';
            } else {
                actionPlayer = '相手';
            }
            let targetStr = ''
            if (!chainProps.attackedTargetId) {
                targetStr = "ダイレクトアタックを"
            } else {
                if ((allCards[chainProps.attackedTargetId] && allCards[chainProps.attackedTargetId].controller) == playerId || allCards[chainProps.attackedTargetId].faceStatus != "downDef") {
                    targetStr = allCards[chainProps.attackedTargetId].name + "に攻撃"
                } else {
                    targetStr = "裏側守備表示のモンスターに攻撃"
                }
            }
            // console.log('action is attack', actionMonster);
            if (actionMonster) {
                message = actionPlayer + 'の' + actionMonster.name + 'が' + targetStr + '宣言をしました。何かカードを発動しますか？'
            } else {
                message = "???"
            }
            break;
        case 'change':
            if (actionMonster) {
                actionPlayer = actionMonster.controller

                console.log('action is effecting', actionMonster);
                if (actionPlayer == playerId) {
                    actionPlayer = 'あなた';
                } else {
                    actionPlayer = '相手';
                }
                // console.log('action is change', actionMonster);
                message = actionPlayer + 'の' + actionMonster.name + 'が表示形式を変更しました。何かカードを発動しますか？'
            } else {
                message = "????"
            }
            break;
        case 'set':
            if (actionMonster) {
                actionPlayer = actionMonster.controller
    
                if (actionPlayer == playerId) {
                    actionPlayer = 'あなた';
                    message = actionPlayer + 'が' + actionMonster.name+ 'をセットしました。何かカードを発動しますか？'
                } else {
                    actionPlayer = '相手';
                    message = actionPlayer + 'がモンスターをセットしました。何かカードを発動しますか？'
                }
                // console.log('action is set', actionMonster);
            } else {
                message = '誰か' + 'がカードをセットしました。何かカードを発動しますか？'
            }
            break;
        case 'reverse':
            if (actionMonster) {
                actionPlayer = actionMonster.controller
                if (actionPlayer == playerId) {
                    actionPlayer = 'あなた';
                } else {
                    actionPlayer = '相手';
                }
                // console.log('action is set', actionMonster);
                message = actionPlayer + 'が' + actionMonster.name + 'を反転召喚しました。何かカードを発動しますか？'
            } else {
                message = "?????"
            }
            break;
        case 'phase':

            if (activater == playerId) {
                if (chainProps.phase == 'draw') {
                    message = 'ドローフェイズです。何かカードを発動しますか？'
                } else if (chainProps.phase == 'stanby') {
                    message = 'スタンバイフェイズです。何かカードを発動しますか？'
                } else if (chainProps.phase == 'end') {
                    message = 'エンドフェイズです。何かカードを発動しますか？'
                }
            } else {
                console.log('action is phase');
                // let phase = ""
                // if (chainProps.phase == "draw") {
                //     phase = "ドロー"
                // } else if (chainProps.phase == "stanby") {
                //     phase = "スタンバイ"
                // } else if (chainProps.phase == "main1") {
                //     phase = "メインフェイズ1"
                // } else if (chainProps.phase == "battle") {
                //     phase = "バトル"
                // } else if (chainProps.phase == "main2") {
                //     phase = "メインフェイズ2"
                // } else if (chainProps.phase == "end") {
                //     phase = "エンドフェイズ"
                // } 
                // message = "相手が" + phase + "を終了しようとしています。何かカードを発動しますか？";
            }
            break;
        case 'battleStep':

            if (players[playerId].turnPlayer) {
                message = 'バトルステップです。何かカードを発動しますか？'
            } else {
                message = "相手がバトルステップを終了しようとしています。何かカードを発動しますか？";
            }
            break;

    }

    if (conditions.includes('phaseEnd')) {
        if (players[playerId].turnPlayer) {
            if (phase == 'draw') {
                message = 'ドローフェイズです。何かカードを発動しますか？'
            } else if (phase == 'stanby') {
                message = 'スタンバイフェイズです。何かカードを発動しますか？'
            } else if (phase == 'end') {
                message = 'エンドフェイズです。何かカードを発動しますか？'
            }
        } else {
            let phaseMessage = "";
            if (phase == "draw") {
                phaseMessage = "ドローフェイズ"
            } else if (phase == "stanby") {
                phaseMessage = "スタンバイフェイズ"
            } else if (phase == "main1") {
                phaseMessage = "メインフェイズ1"
            } else if (phase == "battle") {
                phaseMessage = "バトルフェイズ"
            } else if (phase == "main2") {
                phaseMessage = "メインフェイズ2"
            } else if (phase == "end") {
                phaseMessage = "エンドフェイズ"
            }
            message = "相手が" + phaseMessage + "を終了しようとしています。何かカードを発動しますか？";
        }
    } else {
        // message = '一連の効果処理が終了しました。何かカードを発動しますか？'
    }

    return (
        <div className={`card-selection-wrapper ${isMinimized ? 'minimized' : ''}`}>
            <div className={`card-selection ${isMinimized ? 'minimized' : ''}`}>
                <div className='minimize-button'>
                    {/* 縮小ボタン */}
                    <button onClick={() => setIsMinimized(true)}>縮小</button>
                </div>
                <div className='message'>
                    {message}
                </div>
                
       
                <div className='buttons'>
                    <button onClick={() => setIsMinimized(true)} className='confirm-button'>発動する</button>
                    <button onClick={handleCancel} className='cancel-button'>やめる</button>
                </div>
                

            </div>
            <div>
                {/* 縮小ウィンドウをクリックしたときの処理 */}
                {isMinimized && (
                    <div className="minimized-window" onClick={() => setIsMinimized(false)}>
                        {/* 縮小ウィンドウの内容 */}
                        <p>戻る</p>
                    </div>
                )}
            </div>

        </div>

    );
};

// クイックエフェクト確認のコンポーネント表示し、選択したカードを返却
// 条件付きレンダリングになったため不要
// const confirmQuickEffect = async (cardList, effectProps, socket, roomName) => {
//     console.log('クイックエフェクトの確認コンポーネントを表示します')
//     return new Promise((resolve) => {
//         const handleCardSelection = (selectedCard) => {
//             root.unmount(); // コンポーネントのアンマウント
//             resolve(selectedCard);
//         };

//         const cardSelectionElement = document.createElement('div');
//         document.body.appendChild(cardSelectionElement);

//         const root = createRoot(cardSelectionElement);
//         root.render(<QuickEffect onSelect={handleCardSelection} cardList={cardList}/>);
//     });
// };

// // クイックエフェクトの確認
// const handleQuickEffect = async (cardList, effectProps, setPlayers, socket, roomName, fields) => {
//     console.log('handleQuickEffect', useCard)
    

// }


export { QuickEffect };
