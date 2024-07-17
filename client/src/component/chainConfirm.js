import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { allCards } from '../models/cards';
import { activate, getPriority } from '../gamePlayLogic';

import '../css/chainConfirm.css'


const ChainConfirm = ({ socket, roomName, fields, players, setPlayers, chainProps, playerId, opponentPlayerId, setChainConfirmFlag, chainBlockCards, eventName, conditions, setConditions, otherProps, setEffecting}) => {
    const [isMinimized, setIsMinimized] = useState(false);
    // console.log(chainBlockCards, chainProps.activater, chainProps.activateCard, chainProps)
    // let activateCard = allCards[chainBlockCards[chainBlockCards.length - 1]];
    let activateCard = allCards[chainProps.activateCard];

    let activater = chainProps.activater;
    let actionMonster = allCards[chainProps.actionMonster]
    let activatePlayer = ""
    let actionPlayer = ""

    useEffect(() => {
        setEffecting(false)
    },[])

    useEffect(() => {
        if (chainProps.action === 'summoned' || chainProps.action === 'summon' || chainProps.action === 'reverse') {
            activater = chainProps.activater
            // 含まれてたら無限に追加しちゃうので無いときにだけ足す
            if (!conditions.includes('summoned')) {
                // 通常魔法は使用不可、召喚反応系を使用可能にする
                let newConditions = conditions.filter((condition) => condition != 'normalSpell');
                newConditions = [...conditions, 'summoned']
                setConditions(newConditions);
            }
        } else if (chainProps.action === 'attack') {
            if (!conditions.includes('attack')) {
                setConditions([...conditions, 'attack']);
            }
        }
    }, []);
    let message = '';
    const effectTarget = chainProps.effectTarget
    console.log(effectTarget)

    // chainProps.actionは追加される。chainProps.phaseも同様
    switch (chainProps.action) {
        case 'effect':
            activatePlayer = activateCard.controller
            if (activatePlayer == playerId) {
                activatePlayer = 'あなた';
            } else {
                activatePlayer = '相手';
            }
            
            if (!conditions.includes('attack') && !conditions.includes('summoned')) {   
                // console.log('action is effecting', activateCard, chainProps);
                let targetStr = ''
                // if (activateCard.link != '' && (activateCard.cardtype == "Spell" || activateCard.cardtype == "Trap")) {
                    //     targetStr = allCards[activateCard.link].name + 'を対象に'
                // }
                // ウイルス以外は対象を表記
                if (effectTarget != null && activateCard.name != '同族感染ウイルス') {
                    // 相手の裏側だったら内容は言わない
                    if ((allCards[effectTarget].faceStatus == 'down' || allCards[effectTarget].faceStatus == 'downDef' ) && allCards[effectTarget].controller == opponentPlayerId) {
                        targetStr = '裏側のカードを対象に'
                    } else {
                        targetStr = allCards[effectTarget].name + 'を対象に'
                    }
                } else if (effectTarget != null && activateCard.name == '同族感染ウイルス') {
                    const typeList = {
                        water: '水族',
                        soldier: '戦士族',
                        beastWarrior: '獣戦士族',
                        wizard: '魔法使い族',
                        fairy: '天使族',
                        plant: '植物族',
                        repyile: '爬虫類族',
                        zombie: 'アンデッド族',
                        machine: '機械族',
                        beast: '獣族',
                    }
                    targetStr = typeList[effectTarget] + 'を指定して'
                }
                message = activatePlayer + 'の' + activateCard.name + 'が' + targetStr + '効果を発動しました。何かカードを発動しますか？'
            } else if (conditions.includes('summoned')){
                // 魔導戦士ブレイカーの召喚に対してチェーンするとバグる
                if (actionMonster) {
                    actionPlayer = actionMonster.controller
                    if (actionPlayer == playerId) {
                        actionPlayer = 'あなた';
                    } else {
                        actionPlayer = '相手';
                    }
                    let targetStr = ''

                    // ウイルス以外は対象を表記
                    if (effectTarget != null && activateCard.name != '同族感染ウイルス') {
                        if ((allCards[effectTarget].faceStatus == 'down' || allCards[effectTarget].faceStatus == 'downDef') && allCards[effectTarget].controller == opponentPlayerId) {
                            targetStr = '裏側のカードを対象に'
                        } else {
                            targetStr = allCards[effectTarget].name + 'を対象に'
                        }
                    } else if (effectTarget != null && activateCard.name == '同族感染ウイルス') {
                        const typeList = {
                            water: '水族',
                            soldier: '戦士族',
                            beastWarrior: '獣戦士族',
                            wizard: '魔法使い族',
                            fairy: '天使族',
                            plant: '植物族',
                            repyile: '爬虫類族',
                            zombie: 'アンデッド族',
                            machine: '機械族',
                            beast: '獣族',
                        }
                        targetStr = typeList[effectTarget] + 'を指定して'
                    }
                    message = actionPlayer + 'の' + actionMonster.name + 'が召喚され、' + activatePlayer + "の" + activateCard.name + 'が' + targetStr + '効果を発動しました。何かカードを発動しますか？'
                }
            } else if (conditions.includes('attack')) {
                actionPlayer = actionMonster.controller

                let targetStr = ''
                // ウイルス以外は対象を表記
                if (effectTarget != null && activateCard.name != '同族感染ウイルス') {
                    if ((allCards[effectTarget].faceStatus == 'down' || allCards[effectTarget].faceStatus == 'downDef') && allCards[effectTarget].controller == opponentPlayerId) {
                        targetStr = '裏側のカードを対象に'
                    } else {
                        targetStr = allCards[effectTarget].name + 'を対象に'
                    }
                } else if (effectTarget != null && activateCard.name == '同族感染ウイルス') {
                    const typeList = {
                        water: '水族',
                        soldier: '戦士族',
                        beastWarrior: '獣戦士族',
                        wizard: '魔法使い族',
                        fairy: '天使族',
                        plant: '植物族',
                        repyile: '爬虫類族',
                        zombie: 'アンデッド族',
                        machine: '機械族',
                        beast: '獣族',
                    }
                    targetStr = typeList[effectTarget] + 'を指定して'
                }
                if (actionPlayer == playerId) {
                    actionPlayer = 'あなた';
                } else {
                    actionPlayer = '相手';
                }
                message = actionPlayer + 'の' + actionMonster.name + 'が攻撃宣言をし、' + activatePlayer + "の" + activateCard.name + 'が' + targetStr + '発動しました。何かカードを発動しますか？'
            }
                break;
        case 'sideeffect':
            activatePlayer = activateCard.controller
            activateCard = allCards[chainProps.activateCard];
            // console.log('action is effecting', activateCard);
            if (activatePlayer == playerId) {
                activatePlayer = 'あなた';
            } else {
                activatePlayer = '相手';
            }
            if (conditions.includes('summoned')) {

                actionPlayer = actionMonster.controller
                if (actionPlayer == playerId) {
                    actionPlayer = 'あなた';
                } else {
                    actionPlayer = '相手';
                }
                message = actionPlayer + 'の' + actionMonster.name + 'が召喚され、' + activatePlayer + "の" + activateCard.name + 'が発動しました。何かカードを発動しますか？'
            } else if (activateCard.link != '' && (activateCard.cardtype == "Spell" || activateCard.cardtype == "Trap") && (activateCard.name != '強奪' && !conditions.includes('stanby'))) {
                if (activateCard.name == "リビングデッドの呼び声" && allCards[activateCard.link].location != "monsterZone") {
                    message = activatePlayer + 'の' + activateCard.name + 'が' + activateCard.name + 'を対象に発動しました。何かカードを発動しますか？'
                } else {
                    message = activatePlayer + 'の' + activateCard.name + 'が' + allCards[activateCard.link].name + 'を対象に発動しました。何かカードを発動しますか？'
                }
            } else {
                let targetStr = ''
                if (effectTarget != null) {
                    targetStr = allCards[effectTarget].name + 'を対象に'
                }
                message = activatePlayer + 'の' + activateCard.name + 'が' + targetStr + '発動しました。何かカードを発動しますか？'
            }
            break;
        case 'summon':
            // console.log(chainProps.actionMonster, actionMonster)
            if (actionMonster) {
                actionPlayer = actionMonster.controller
                if (actionPlayer == playerId) {
                    actionPlayer = 'あなた';
                } else {
                    actionPlayer = '相手';
                }
                console.log('action is summon', actionMonster);
                message = actionPlayer + 'が' + actionMonster.name + 'を召喚しました。何かカードを発動しますか？'
            } else {
                message = '誰かが多分何かを召喚しました。何かカードを発動しますか？(本来表示されません。表示された場合はご報告ください)'
            }

            break;
        case 'attack':
            actionPlayer = actionMonster.controller
            // console.log(chainProps)
            if (actionPlayer == playerId) {
                actionPlayer = 'あなた';
            } else {
                actionPlayer = '相手';
            }
            let targetStr = ''
            if (chainProps.attackedTargetId == '') {
                targetStr = "ダイレクトアタックを"
            } else {
                if (allCards[chainProps.attackedTargetId].controller == playerId || allCards[chainProps.attackedTargetId].faceStatus != "downDef") {
                    targetStr = allCards[chainProps.attackedTargetId].name + "に攻撃"
                } else {
                    targetStr = "裏側守備表示のモンスターに攻撃"
                }
            }
            // console.log('action is attack', actionMonster);
            message = actionPlayer + 'の' + actionMonster.name + 'が' + targetStr + '宣言をしました。何かカードを発動しますか？'
            break;
        case 'change':
            activatePlayer = activateCard.controller
            activateCard = allCards[chainProps.activateCard];
            // console.log('action is effecting', activateCard);
            if (activatePlayer == playerId) {
                activatePlayer = 'あなた';
            } else {
                activatePlayer = '相手';
            }
            // console.log('action is change', activateCard);
            message = activatePlayer + 'の' + activateCard.name + 'が表示形式を変更しました。何かカードを発動しますか？'
            break;
        case 'set':
            activateCard = allCards[chainProps.activateCard];
            activatePlayer = activateCard.controller

            if (activatePlayer == playerId) {
                activatePlayer = 'あなた';
            } else {
                activatePlayer = '相手';
            }
            // console.log('action is set', activateCard);
            message = activatePlayer + 'がカードをセットしました。何かカードを発動しますか？'
            break;
        case 'reverse':
            actionPlayer = actionMonster.controller
            if (actionPlayer == playerId) {
                actionPlayer = 'あなた';
            } else {
                actionPlayer = '相手';
            }
            // console.log('action is set', actionMonster);
            message = actionPlayer + 'が' + activateCard.name + 'を反転召喚しました。何かカードを発動しますか？'
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
        
    }
    
    // console.log(chainProps,chainProps.activateCard)
    // console.log(activateCard)
    // console.log('chain confirm chain block cards is', chainBlockCards )

    // console.log('playerID=', playerId, '||||activaterID=', activater)
    // if (activatePlayer == playerId) {
    //     activatePlayer = 'あなた';
    // } else {
    //     activatePlayer = '相手';
    // }

    const handleCancel = async () => {
        // 発動者かどうかでemit内容を変える
        // 誘発効果などの場合activaterを事前にターンプレイヤーにする
        // 厳密には優先権を持ってるかで判断では？

        // if (players[playerId].priority) {
        if (playerId != activater) {
            // 非発動者がチェーンしない場合優先権を返す
            await getPriority(players, setPlayers, opponentPlayerId, playerId);
            otherProps.setOppoChoicing(true)
            console.log('emit chainConfirmResult', chainBlockCards, 'event name ', eventName, fields)
            socket.emit('chainConfirmResult', { roomName, chainBlockCards, eventName, updateFields: fields });
        } else {
            await getPriority(players, setPlayers, opponentPlayerId, playerId);
            console.log('emit chainConfirmSelf', chainBlockCards, 'event name ', eventName)
            socket.emit('chainConfirmResultSelf', { roomName, chainBlockCards, eventName, updateFields:fields });
        }
        setChainConfirmFlag(false);
        chainProps.setEffectTarget(null)
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

                {/* カード一覧 */}

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


// チェーンハンドラ、必要な値をセットしてコンポーネント表示フラグをON
const handleChain = async (effectProps, activatePlayer, playerId, setChainConfirmFlag, setActivater, setActivateCard, chainBlockCards, setChainBlockCards) => {
    if (effectProps == null) {
        console.log('副作用フックでの呼び出しなので強制終了するよ～ん')
        return
    }
    console.log('handle chain  chain block cards',chainBlockCards)
    
    // const activateCard = effectProps.cardId
    // setActivateCard(activateCard);
    setActivater(activatePlayer);

    setChainBlockCards(chainBlockCards);
    setChainConfirmFlag(true);

}


export { ChainConfirm, handleChain };
