import { Card, Monster, Spell, Trap, Effect } from './models';
import { awaitTime, checkPrivateCardsBoth, deckDestruction, deckToGraveyard, drawCards, fiberJar, fiberJarHandle, graveyardToBanish, matchDataUpdate, put, reduceLifePoint, returnSnatchMonsters, selectEquipTarget, selectOppo, shuffle, unlink } from '../gamePlayLogic';
import { selectCards } from '../component/selectCard';
import {
    destroy, searcher, asyncSelectCard, betray, sweep, discard, handReturnToDeck, attackIncrease, openCards, salvage, monsterBanish, deckBanish, handleDraw, reduceLifePointBoth, revive,
    summon, useRightOfSummon, graveReturnToHand, promiseDraw,
} from '../gamePlayLogic';
import { handleSelectTarget } from '../component/selectTarget';
import { choice } from '../component/choice';
import { a } from 'react-spring';
import { handleDisplayPrivateCards } from '../component/displayPrivateCards';

// 強欲な壺
const PotOfGreedEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter,) => {
    console.log(fields)
    const hand = fields.hand;
    const setHand = fieldsSetter.setHand;
    const deck = fields.deck;
    const setDeck = fieldsSetter.setDeck;
    let updateFields = {}
    // const drawCards = [deck[0], deck[1]];

    const updateHandAndDeck = await drawCards(socket, roomName, deck, hand, setHand, setDeck, playerId, 2);
    updateFields = { ...fields }
    updateFields.hand = updateHandAndDeck.updatedHand
    updateFields.deck = updateHandAndDeck.updatedDeck
    socket.emit('drawCards', { roomName, opponentPlayerId, num: 2 });
    // let message = ''
    // message = '強欲な壺によりカードを2枚手札に加えました'
    // socket.emit('messageLog', { roomName: roomName, type: 'battleLog', playerId: playerId, message: message })
    
    console.log('pod of greed fields',updateFields)
    return updateFields
}
const PotOfGreedEffect1 = new Effect(['PotOfGreed'], 1, 'normalSpell', true, 'none', 0, null);
const PotOfGreedEffect2 = new Effect(['PotOfGreed'], 1, 'normalSpell', true, 'none', 0, null);

// ならず者傭兵部隊
const exiledForceEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('ならず者傭兵部隊')
    let updatefields = fields;
    // const myMonsterZone = fields.monsterZone[playerId];
    // const oppoMonsterZone = fields.monsterZone[opponentPlayerId];
    // const targets = myMonsterZone.concat(oppoMonsterZone).filter(id => id != null);
    const card = allCards[cardId];
    const targetCardId = card.effect.target
    console.log(targetCardId)
    if (targetCardId && allCards[targetCardId].location == 'monsterZone') {
        socket.emit('destroy', { roomName, fields: fields, playerId: allCards[targetCardId].owner, cardId: targetCardId });
        updatefields = await destroy(allCards[targetCardId].owner, fields, fieldsSetter, targetCardId);
    }
    card.effect.target = null
    console.log(targetCardId)

    // if (targets.length > 0) {
    //     const targetCardId = await asyncSelectCard(socket, cardId, targets, selectTargetProps);
    //     console.log('narazumono', targetCardId, 'owner is ', allCards[targetCardId].owner)
    //     // let message = 'ならず者傭兵部隊によって' + allCards[targetCardId].name + 'が破壊されました'
    //     // socket.emit('messageLog', { roomName: roomName, type: 'battleLog', playerId: playerId, message: message })
        
    //     // 破壊処理を相手に通知
    //     socket.emit('destroy', { roomName, fields: fields, playerId: allCards[targetCardId].owner, cardId: targetCardId });
    //     updatefields = await destroy(allCards[targetCardId].owner, fields, fieldsSetter, targetCardId);
    // } else {
    //     // let message = 'ならず者傭兵部隊の効果はモンスターが居ないため不発になりました'
    //     // socket.emit('messageLog', { roomName: roomName, type: 'battleLog', playerId: playerId, message: message })  
    // }
    console.log('narazumono is done');
    return updatefields;
}
const exiledForceEffect1 = new Effect(['exiledForce'], 1, 'ignition', true, 'self', 1, null);
const exiledForceEffect2 = new Effect(['exiledForce'], 1, 'ignition', true, 'self', 1, null);

// サイクロン
// 多分できてる
const mysticalSpaceTyphoonEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('effect sycron',cardId)
    console.log(fields, JSON.stringify(fields));
    let updatefields = fields;

    const card = allCards[cardId];
    const targetCardId = card.effect.target
    console.log(targetCardId)


    // サイクロンの破壊対象範囲を設定
    // const mySpellTrapZone = fields.spellTrapZone[playerId];
    // const oppoSpellTrapZone = fields.spellTrapZone[opponentPlayerId];
    // const targets = mySpellTrapZone.concat(oppoSpellTrapZone).filter(id => id != null);

    // // ターゲットとして指定
    // console.log('選択可能カードは', targets)
    if (targetCardId && allCards[targetCardId].location == 'spellTrapZone') {
        // emitを使いクリックされたカードを受け取る
        // const targetCardId = await asyncSelectCard(socket, cardId, targets, selectTargetProps);
        // 破壊カードの所持者
        const targetCardOwner = allCards[targetCardId].owner;
        // let targetCardOwnerName = ''

        // if (targetCardOwner == playerId) {
        //     targetCardOwnerName = 'あなた';
        // } else if (targetCardOwner == opponentPlayerId) {
        //     targetCardOwnerName = '相手';
        // }
        
        console.log('サイクロンの対象は', targetCardId,'owner is ',targetCardOwner)
        // let message = 'サイクロンによって' + allCards[targetCardId].name + 'が破壊されました';
        // socket.emit('messageLog', { roomName: roomName, type: 'battleLog', playerId: playerId, message: message }) 
        
        // 破壊処理を相手に通知
        socket.emit('destroy', { roomName, fields: fields, playerId: targetCardOwner, cardId: targetCardId });
        updatefields = await destroy(targetCardOwner, fields, fieldsSetter, targetCardId);

        // 強奪が破壊された場合はサイドエフェクトではなく即時コントロールを返す
        // 強奪対象がモンスターゾーンに居るとき
        if (allCards[targetCardId].name == "強奪" && allCards[targetCardId].link.length != 0 && allCards[allCards[targetCardId].link[0]].location == "monsterZone") {
            updatefields = await snatchStealEffectDetail2(socket, roomName, targetCardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps);
        }
        if (allCards[targetCardId].name == "早すぎた埋葬" && allCards[targetCardId].link.length != 0 && allCards[allCards[targetCardId].link[0]].location == "monsterZone") {
            updatefields = await prematureBurialEffectDetail2(socket, roomName, targetCardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps);
        }
        if (allCards[targetCardId].name == "リビングデッドの呼び声" && allCards[targetCardId].link.length != 0 && allCards[allCards[targetCardId].link[0]].location == "monsterZone") {
            updatefields = await CallOfTheHauntedEffectDetail2(socket, roomName, targetCardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps);
        }
    
        console.log('sycron ended')
    }
    card.effect.target = null
    console.log(targetCardId)
    return updatefields
}
const mysticalSpaceTyphoonEffect1 = new Effect(['mysticalSpaceTyphoon'], 2, 'none', true, 'none', 0, null);
const mysticalSpaceTyphoonEffect2 = new Effect(['mysticalSpaceTyphoon'], 2, 'none', true, 'none', 0, null);

// 増援
// TODO 戦士族カードが少なすぎて確認不能
const reinforcementOfTheArmyEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    let updatefields = fields;
    // 戦士族のリストを作成
    const soldiers = fields.deck[playerId].filter((cardId) => allCards[cardId].type == 'soldier' && allCards[cardId].level <= 4);
    console.log(soldiers)
    if (soldiers.length > 0) {
        // リストから手札に加えるカードの選択
        const selectedCards = await selectCards(soldiers, 1, selectTargetProps.setHoverCardId, cardId);
        const selectedCard = selectedCards[0];
        console.log(selectedCard);
        // サルベージを記録
        const playersMatchData = await matchDataUpdate(playerId, opponentPlayerId, updatefields, selectTargetProps.turnCount, 'search');

        let matchData = playersMatchData[playerId].matchData
        matchData.canSearchCard = selectedCards
        matchData.searchCard = selectedCard
        matchData.usePlayer = playerId;

        socket.emit('searchResult', { searchResult: matchData });

        const message = "相手が" + allCards[selectedCard].name + "を手札に加えました"
        socket.emit('messagePopUp', { roomName, message: message });
        let messageLog = '増援によって' + allCards[selectedCard].name + "を手札に加えました";
        socket.emit('messageLog', { roomName: roomName, type: 'battleLogEffectDetail', playerId: playerId, message: messageLog }) 
        // 選択されたカードを手札に加える
        // 選択したカードをデッキから削除
        socket.emit('search', { roomName, playerId: playerId, cardId: selectedCard });
        
        updatefields = await searcher(playerId, updatefields, fieldsSetter, selectedCard);
        // デッキをシャッフル
        updatefields.deck = await shuffle(playerId, updatefields, fieldsSetter);
        // 自分と相手でシャッフルすると整合性が取れないのでシャッフルした物を相手に渡してシャッフルした風にする
        socket.emit('deckShuffled', { roomName, playerId: playerId, updateDeck: updatefields.deck });
        // 引いたあとにシャッフルするために遅延
        setTimeout(() => {
            socket.emit('shuffleAnimation', { roomName, playerId: playerId })
        }, 1000); // ここではアニメーションの持続時間を1秒(1000ミリ秒)と仮定
        // await awaitTime(1800);
        console.log(updatefields.deck)
    
        // 効果処理を相手に通知
        console.log('造園',updatefields)        
    }    


    return updatefields;
}
const reinforcementOfTheArmyEffect1 = new Effect(['reinforcementOfTheArmy'], 1, 'normalSpell', true, 'none', 0, null);
const reinforcementOfTheArmyEffect2 = new Effect(['reinforcementOfTheArmy'], 1, 'normalSpell', true, 'none', 0, null);

// 心変わり
// ターン終了時に相手に返す処理が未実装。ターン終了時側で処理？
const changeOfHeartEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('心変わり')
    let updatefields = fields;
    console.log(fields)


    const card = allCards[cardId];
    const targetCardId = card.effect.target
    console.log(targetCardId)

    // 効果処理時点でモンスターが5体いたら対象を破壊
    // if (updatefields.monsterZone[playerId].filter((id) => id != null).length == 5) {
    //     socket.emit('destroy', { roomName, fields: fields, playerId: allCards[targetCardId].owner, cardId: targetCardId });
    //     updatefields = await destroy(allCards[targetCardId].owner, fields, fieldsSetter, targetCardId);
    //     card.effect.target = null
    //     console.log(targetCardId)
    //     return updatefields;
    // }

    // 対象範囲を設定
    // const targets = fields.monsterZone[opponentPlayerId].filter(id => id != null);
    // 相手モンスターが存在したら
    if (targetCardId && allCards[targetCardId].location == 'monsterZone') {
        // ターゲットとして指定
        // console.log('選択可能カードは', targets)
        // // emitを使いクリックされたカードを受け取る
        // const targetCardId = await asyncSelectCard(socket, cardId, targets, selectTargetProps);
    
    
        console.log('心変わりの対象は', targetCardId)
        // コントロール奪取処理を相手に通知

        // message = '心変わりによって' + allCards[targetCardId].name + 'のコントロールが変更されました';
        // socket.emit('messageLog', { roomName: roomName, type: 'battleLog', playerId: playerId, message: message }) 
        
        // 心変わりのリンクは複数ある場合あり
        socket.emit('betray', { roomName, steeler: playerId, victim: opponentPlayerId, targetCardId: targetCardId });
        // 効果処理時点でモンスターが5体いたら対象を破壊
        if (updatefields.monsterZone[playerId].filter((id) => id != null).length == 5) {
            updatefields.monsterZone = await betray(playerId, opponentPlayerId, updatefields, fieldsSetter, targetCardId);
            card.effect.target = null
            console.log(targetCardId)
            return updatefields;
        }
        const updatedMonsterZone = await betray(playerId, opponentPlayerId, fields, fieldsSetter, targetCardId);
        allCards[cardId].link = [...allCards[cardId].link, targetCardId];
        socket.emit('link', { roomName, linkCardId: cardId, targetCardId: targetCardId });
        allCards[targetCardId].link = [...allCards[targetCardId].link, cardId];
        socket.emit('link', { roomName, linkCardId: targetCardId, targetCardId: cardId });
        updatefields.monsterZone = updatedMonsterZone;
        // コントロール奪取を記録
        const playersMatchData = await matchDataUpdate(playerId, opponentPlayerId, updatefields, selectTargetProps.turnCount, 'betray');

        let matchData = playersMatchData[playerId].matchData
        matchData.betrayCard = targetCardId
        matchData.usePlayer = playerId;

        socket.emit('betrayResult', { betrayResult: matchData });

        console.log('kokoro gawari ended')

    }
    card.effect.target = null
    console.log(targetCardId)

    return updatefields;
}
const changeOfHeartEffect1 = new Effect(['changeOfHeart'], 1, 'normalSpell', true, 'none', 0, null);
const changeOfHeartEffect2 = new Effect(['changeOfHeart'], 1, 'normalSpell', true, 'none', 0, null);

// ライトニング・ボルテックス
const lightningVortexEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('ライトニング・ボルテックス', fields);
    // 表側だけを取得
    const target = fields.monsterZone[opponentPlayerId].filter((id => id != null && allCards[id].faceStatus != "downDef"));
    console.log('相手フィールド', target)
    socket.emit('sweep', {roomName, fields: fields, target });
    const updateFields = await sweep(playerId, opponentPlayerId, fields, fieldsSetter, target);
    return updateFields;
}
const lightningVortexEffect1 = new Effect(['lightningVortex'], 1, 'normalSpell', true, 'discard', 1, null);
const lightningVortexEffect2 = new Effect(['lightningVortex'], 1, 'normalSpell', true, 'discard', 1, null);

// 大嵐
const heavyStormEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('大嵐');
    const mySpellTrapZone = fields.spellTrapZone[playerId];
    const oppoSpellTrapZone = fields.spellTrapZone[opponentPlayerId];
    const target = mySpellTrapZone.concat(oppoSpellTrapZone).filter(id => id != null);
    socket.emit('sweep', { roomName, fields: fields, target });
    console.log(target)
    console.log(JSON.stringify(allCards[target[0]]))
    console.log(JSON.stringify(allCards[target[1]]))
    // for (let i of target) {
    //     console.log(i)
    //     console.log(allCards[i].name)
    //     console.log(allCards[i].link)
    //     console.log(allCards[i].length)
    //     console.log(allCards[allCards[i].link[0]])
    //     console.log(allCards[allCards[i].link[0]].location)
    // }
    const snatchSteals = target.filter((targetCardId) => targetCardId != null && allCards[targetCardId].name == "強奪" && allCards[targetCardId].link.length != 0 && allCards[allCards[targetCardId].link[0]].location == "monsterZone");
    const prematureBurials = target.filter((targetCardId) => targetCardId != null && allCards[targetCardId].name == "早すぎた埋葬" && allCards[targetCardId].link.length != 0 && allCards[allCards[targetCardId].link[0]].location == "monsterZone");
    const CallOfTheHaunteds = target.filter((targetCardId) => targetCardId != null && allCards[targetCardId].name == "リビングデッドの呼び声" && allCards[targetCardId].link.length != 0 && allCards[allCards[targetCardId].link[0]].location == "monsterZone");
    let updateFields = await sweep(playerId, opponentPlayerId, fields, fieldsSetter, target);
    console.log('snatchSteals', snatchSteals)
    // 同じカードを強奪しているときはownerとcontrollerが同じなので何もしない
    if (snatchSteals.length == 1) {
        // 強奪が破壊された場合はサイドエフェクトではなく即時コントロールを返す
        updateFields = await snatchStealEffectDetail2(socket, roomName, snatchSteals[0], playerId, opponentPlayerId, updateFields, fieldsSetter, selectTargetProps);
    } else if (snatchSteals.length == 2 && allCards[snatchSteals[0]].link[0] != allCards[snatchSteals[1]].link[0]) {
        // 違う対象の2枚の強奪を同時破壊時
        socket.emit('returnSnatchMonsters', { roomName, snatchSteals });
        updateFields = await returnSnatchMonsters(playerId, opponentPlayerId, snatchSteals, updateFields, fieldsSetter);
    }
    if (prematureBurials.length != 0) {
        for (let prematureBurial of prematureBurials) {
            updateFields = await prematureBurialEffectDetail2(socket, roomName, prematureBurial, playerId, opponentPlayerId, updateFields, fieldsSetter, selectTargetProps);
        }
    }
    if (CallOfTheHaunteds.length != 0) {
        for (let CallOfTheHaunted of CallOfTheHaunteds) {
            updateFields = await CallOfTheHauntedEffectDetail2(socket, roomName, CallOfTheHaunted, playerId, opponentPlayerId, updateFields, fieldsSetter, selectTargetProps);
        }
    }
    return updateFields;
}

const heavyStormEffect1 = new Effect(['heavyStorm'], 1, 'normalSpell', true, 'none', 0, null);
const heavyStormEffect2 = new Effect(['heavyStorm'], 1, 'normalSpell', true, 'none', 0, null);

// 押収
const confiscationEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    const hand = fields.hand;
    const setHand = fieldsSetter.setHand;
    const graveyard = fields.graveyard;
    const setGraveyard = fieldsSetter.setGraveyard;
    let updatefields = fields
    if (updatefields.hand[opponentPlayerId].length > 0) {
        const cardTypeOrder = { 'Monster': 1, 'Spell': 2, 'Trap': 3 };
        const oppoHand = [...updatefields.hand[opponentPlayerId]].sort((a, b) => {
            const cardA = allCards[a];
            const cardB = allCards[b];

            // cardTypeで比較
            if (cardTypeOrder[cardA.cardtype] !== cardTypeOrder[cardB.cardtype]) {
                return cardTypeOrder[cardA.cardtype] - cardTypeOrder[cardB.cardtype];
            }

            // Monsterカードの場合、levelで比較
            if (cardA.cardtype === 'Monster' && cardB.cardtype === 'Monster') {
                if (cardA.level === cardB.level) {
                    // typeで比較 (localeCompareの代わりに比較演算子を使用)
                    if (cardA.type < cardB.type) return -1;
                    if (cardA.type > cardB.type) return 1;
                    return 0;
                } else {
                    return cardA.level - cardB.level;
                }
            }

        });
        const targets = await selectCards(oppoHand, 1, selectTargetProps.setHoverCardId, cardId);

        // ピーピングハンデスを使ったらその時点でのデータを取得
        const playersMatchData = await matchDataUpdate(playerId, opponentPlayerId, fields, selectTargetProps.turnCount, 'peeping');

        let matchData = playersMatchData[playerId].matchData
        matchData.peepingCards = oppoHand
        matchData.discardCard = targets[0]
        matchData.usePlayer = playerId;

        // ピーピングハンデス使用時点でのデータを送信しサーバーに保存
        socket.emit('peepingResult', { peepingResult: matchData });
    
        updatefields = await discard(opponentPlayerId, targets[0], updatefields, hand, setHand, graveyard, setGraveyard);
        socket.emit('discard', { roomName, playerId: opponentPlayerId, discardCardId: targets[0] });
        const message = allCards[targets[0]].name + "が墓地に送られました"
        socket.emit('messagePopUp', { roomName, message: message });

        let messageLog = '押収によって' + allCards[targets[0]].name + "が墓地に送られました";
        socket.emit('messageLog', { roomName: roomName, type: 'battleLogEffectDetail', playerId: playerId, message: messageLog }) 
        // シャッフル処理
    }
    return updatefields;
}

const confiscationEffect1 = new Effect(['confiscation'], 1, 'normalSpell', true, 'lifePoint', 1000, null);
const confiscationEffect2 = new Effect(['confiscation'], 1, 'normalSpell', true, 'lifePoint', 1000, null);

// 強引な番兵
const theForcefulSentryEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    const hand = fields.hand;
    const setHand = fieldsSetter.setHand;
    const deck = fields.deck;
    const setDeck = fieldsSetter.setDeck;
    let updatefields = fields

    if (fields.hand[opponentPlayerId].length > 0) {
        const cardTypeOrder = { 'Monster': 1, 'Spell': 2, 'Trap': 3 };
        const oppoHand = [...updatefields.hand[opponentPlayerId]].sort((a, b) => {
            const cardA = allCards[a];
            const cardB = allCards[b];

            // cardTypeで比較
            if (cardTypeOrder[cardA.cardtype] !== cardTypeOrder[cardB.cardtype]) {
                return cardTypeOrder[cardA.cardtype] - cardTypeOrder[cardB.cardtype];
            }

            // Monsterカードの場合、levelで比較
            if (cardA.cardtype === 'Monster' && cardB.cardtype === 'Monster') {
                if (cardA.level === cardB.level) {
                    // typeで比較 (localeCompareの代わりに比較演算子を使用)
                    if (cardA.type < cardB.type) return -1;
                    if (cardA.type > cardB.type) return 1;
                    return 0;
                } else {
                    return cardA.level - cardB.level;
                }
            }

        });
        console.log(oppoHand)
        const targets = await selectCards(oppoHand, 1, selectTargetProps.setHoverCardId, cardId);

        // ピーピングハンデスを使ったらその時点でのデータを取得
        const playersMatchData = await matchDataUpdate(playerId, opponentPlayerId, fields, selectTargetProps.turnCount, 'peeping');

        let matchData = playersMatchData[playerId].matchData
        matchData.peepingCards = oppoHand
        matchData.discardCard = targets[0]
        matchData.usePlayer = playerId;

        // ピーピングハンデス使用時点でのデータを送信しサーバーに保存
        socket.emit('peepingResult', { peepingResult: matchData });
    
        updatefields = await handReturnToDeck(opponentPlayerId, targets[0], fields, hand, setHand, deck, setDeck);
        socket.emit('handReturnToDeck', { roomName, playerId: opponentPlayerId, cardId: targets[0] });
        const message = allCards[targets[0]].name + "がデッキに戻りました"
        socket.emit('messagePopUp', { roomName, message: message });

        let messageLog = '強引な番兵によって' + allCards[targets[0]].name + "がデッキに戻りました";
        socket.emit('messageLog', { roomName: roomName, type: 'battleLogEffectDetail', playerId: playerId, message: messageLog }) 
    }

    return updatefields;
}

const theForcefulSentryEffect1 = new Effect(['theForcefulSentry'], 1, 'normalSpell', true, 'none', 0, null);
const theForcefulSentryEffect2 = new Effect(['theForcefulSentry'], 1, 'normalSpell', true, 'none', 0, null);


// イグザリオン・ユニバース
const exarionUniverseEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    if (allCards[cardId].location == "monsterZone") {
        await attackIncrease(cardId, -400);
        socket.emit('attackIncrease', { roomName, cardId, value: -400 });
        allCards[cardId].effect.canUse = false;
    }
    return fields;
}

// // canUseは自身が攻撃時にのみtrueになり基本はfalse
const exarionUniverseEffect1 = new Effect(['exarionUniverse'], 1, 'battle', true, 'none', 0, null);
const exarionUniverseEffect2 = new Effect(['exarionUniverse'], 1, 'battle', true, 'none', 0, null);

// 光の護封剣
const swordsOfRevealingLightEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    const downDefCards = fields.monsterZone[opponentPlayerId].filter((cardId) => cardId != null && allCards[cardId].faceStatus == 'downDef');
    allCards[cardId].effect.canUse = false;
    allCards[cardId].counter = 0;
    await openCards(downDefCards);
    socket.emit('openCards', { roomName, cardIds: downDefCards, useCardId: cardId });

    return fields
}

const swordsOfRevealingLightEffect1 = new Effect(['swordsOfRevealingLight'], 1, 'normalSpell', true, 'none', 0, null);
const swordsOfRevealingLightEffect2 = new Effect(['swordsOfRevealingLight'], 1, 'normalSpell', true, 'none', 0, null);

// 聖なる魔術師
// 発動のエフェクト時に両者それぞれでeffect.canUseをfalseに
const magicianOfFaithEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {



    const card = allCards[cardId];
    const targetCardId = card.effect.target
    console.log(targetCardId)



    // const graveyardSpell = fields.graveyard[playerId].filter((cardId) => allCards[cardId].cardtype == 'Spell');
    // サルベージ対象が無ければ何もせずに終了
    if (targetCardId && allCards[targetCardId].location == 'graveyard') {
        // console.log(graveyardSpell)
        // const targets = await selectCards(graveyardSpell, 1, selectTargetProps.setHoverCardId, cardId);
        const message = "相手が" + allCards[targetCardId].name + "を手札に加えました"
        socket.emit('messagePopUp', { roomName, message: message });

        let messageLog = '聖なる魔術師によって' + allCards[targetCardId].name + "を手札に加えました";
        socket.emit('messageLog', { roomName: roomName, type: 'battleLogEffectDetail', playerId: playerId, message: messageLog }) 

        const updatefields = await salvage(playerId, fields, fieldsSetter, targetCardId);
        socket.emit('salvage', { roomName, playerId, cardId: targetCardId });
        // サルベージを記録
        const playersMatchData = await matchDataUpdate(playerId, opponentPlayerId, updatefields, selectTargetProps.turnCount, 'salvage');

        let matchData = playersMatchData[playerId].matchData
        matchData.salvageCard = targetCardId
        matchData.usePlayer = playerId;

        socket.emit('salvageResult', { salvageResult: matchData });
        // effect.canUseは変えない。リバース時のみなので
        console.log('聖なる魔術師', updatefields)
        
        card.effect.target = null
        console.log(targetCardId)
        return updatefields;
    }

    socket.emit('usedEffect', { roomName, effectUsedCardId: cardId });

    allCards[cardId].effect.canUse = false;
    return fields
}

// インスタンスを分けないとeffectを更新したときに後から上書きされる
const magicianOfFaithEffect1 = new Effect(['magicianOfFaith'], 1, 'reverse', true, 'none', 0, null);
const magicianOfFaithEffect2 = new Effect(['magicianOfFaith'], 1, 'reverse', true, 'none', 0, null);
const magicianOfFaithEffect3 = new Effect(['magicianOfFaith'], 1, 'reverse', true, 'none', 0, null);
const magicianOfFaithEffect4 = new Effect(['magicianOfFaith'], 1, 'reverse', true, 'none', 0, null);

// 抹殺の使徒
const noblemanOfCrossoutEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('抹殺の使徒')
    const card = allCards[cardId];
    const targetCardId = card.effect.target
    console.log(targetCardId)

    let updatefields = fields;


    // const downDefMonster = fields.monsterZone[opponentPlayerId].filter((cardId) => cardId != null && allCards[cardId].faceStatus == 'downDef');
    // console.log(downDefMonster)
    if (targetCardId && allCards[targetCardId].location == 'monsterZone') {
        // const targetCardId = await asyncSelectCard(socket, cardId, downDefMonster, selectTargetProps);
        // console.log(targetCardId)
        // モンスターの除外
        socket.emit('monsterBanish', { roomName, cardId: targetCardId });
        updatefields = await monsterBanish(fields, fieldsSetter, targetCardId);
        if (allCards[targetCardId].effect.triggerCondition === 'reverse') {
            
            // デッキから同名カードの除外
            socket.emit('deckBanish', { roomName, cardId: targetCardId });
            updatefields = await deckBanish(playerId, opponentPlayerId, updatefields, fieldsSetter, targetCardId);
            console.log(selectTargetProps.setOppoChoicing)
            await awaitTime(1000)
            // // デッキの確認
            await checkPrivateCardsBoth(socket, roomName, playerId, opponentPlayerId, updatefields, selectTargetProps.setOppoChoicing, selectTargetProps.setHoverCardId, selectTargetProps.isMobile);
            // デッキをシャッフル
            updatefields.deck = await shuffle(playerId, updatefields, fieldsSetter);
            updatefields.deck = await shuffle(opponentPlayerId, updatefields, fieldsSetter);
            socket.emit('deckShuffled', { roomName, playerId: playerId, updateDeck: updatefields.deck });
            // 終わったあとにシャッフルするために遅延
            setTimeout(() => {
                socket.emit('shuffleAnimation', { roomName, playerId: playerId })
                socket.emit('shuffleAnimation', { roomName, playerId: opponentPlayerId })
            }, 1000); // ここではアニメーションの持続時間を1秒(1000ミリ秒)と仮定
            // await awaitTime(1800);
            // socket.emit('displayPrivateCards', { roomName, deck:updatefields.deck });
            // await handleDisplayPrivateCards(playerId, opponentPlayerId, updatefields);
        }
    }
    card.effect.target = null
    console.log(targetCardId)
    return updatefields;
}
const noblemanOfCrossoutEffect1 = new Effect(['noblemanOfCrossout'], 1, 'normalSpell', true, 'none', 0, null);
const noblemanOfCrossoutEffect2 = new Effect(['noblemanOfCrossout'], 1, 'normalSpell', true, 'none', 0, null);

// パーシアス
const airknightParshathEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => { 
    console.log('パーシアス')
    let updatefields = fields
    if (fields.deck[playerId].length <= 0) {
        // デッキ切れでの敗北時
        const decisionObj = { decision: true, winner: opponentPlayerId }
        updatefields.decision = true
        updatefields.winner = opponentPlayerId
        updatefields.players = await matchDataUpdate(playerId, opponentPlayerId, updatefields, selectTargetProps.turnCount)
        updatefields.players[playerId].matchData.winner = opponentPlayerId; 
            
        socket.emit('decision', { roomName, decisionObj, result: updatefields.players[playerId].matchData })
        
        return updatefields
    }
    // 一枚だけドロー
    updatefields = await handleDraw(socket, roomName, updatefields, fieldsSetter, playerId, opponentPlayerId, selectTargetProps.turnCount);

    return updatefields;
}
const airknightParshathEffect1 = new Effect(['airknightParshath'], 1, 'damageConfirm', true, 'none', 0, null);
const airknightParshathEffect2 = new Effect(['airknightParshath'], 1, 'damageConfirm', true, 'none', 0, null);

// 破壊輪
const ringOfDestructionEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('破壊輪')
    let updatefields = fields;


    const card = allCards[cardId];
    const targetCardId = card.effect.target
    console.log(targetCardId)



    const monsters = fields.monsterZone[playerId].concat(fields.monsterZone[opponentPlayerId]).filter(id => id != null);
    // console.log(updatefields)
    // console.log(updatefields.monsterZone)
    const JinzoExist = updatefields.monsterZone[playerId].concat(updatefields.monsterZone[opponentPlayerId]).some((id) => id != null && allCards[id].name == "人造人間－サイコ・ショッカー" && allCards[id].faceStatus != "downDef")
    console.log(JinzoExist)
    console.log(updatefields.monsterZone[playerId].concat(updatefields.monsterZone[playerId]))

    // 裏側じゃないモンスターを取得
    // const upMonsters = monsters.filter((cardId) => allCards[cardId].faceStatus != 'downDef');
    if (targetCardId && allCards[targetCardId].location == 'monsterZone' && !JinzoExist) {
        // const targetCardId = await asyncSelectCard(socket, cardId, upMonsters, selectTargetProps);
        // console.log(targetCardId)

        const value = allCards[targetCardId].attack;
        // 破壊と両者へLPダメージ
        socket.emit('destroy', { roomName, fields: fields, playerId: allCards[targetCardId].owner, cardId: targetCardId });
        updatefields = await destroy(allCards[targetCardId].owner, fields, fieldsSetter, targetCardId);
        let updateplayers = await reduceLifePointBoth(updatefields.players, fieldsSetter.setPlayers, playerId, opponentPlayerId, value, selectTargetProps.setPlayerDamageValue, selectTargetProps.setOpponentPlayerDamageValue);
        socket.emit('reduceLPBoth', { roomName, value });
        updatefields.players = updateplayers

        // LPのチェック
        if (updateplayers[opponentPlayerId].hp <= 0) {
            if (updateplayers[playerId].hp <= 0) {
                // 引き分け時
                const decisionObj = { decision: true, winner: 'none' }
                updatefields.decision = true
                updatefields.winner = 'none'
                updatefields.players = await matchDataUpdate(playerId, opponentPlayerId, updatefields, selectTargetProps.turnCount)
                socket.emit('decision', { roomName, decisionObj, result: updatefields.players[playerId].matchData })
            } else {
                // 相手のLPが0
                const decisionObj = { decision: true, winner: playerId }
                updatefields.decision = true
                updatefields.winner = playerId
                updatefields.players = await matchDataUpdate(playerId, opponentPlayerId, updatefields, selectTargetProps.turnCount)
                socket.emit('decision', { roomName, decisionObj, result: updatefields.players[playerId].matchData })
            }
            return updatefields;

        } else if (updateplayers[playerId].hp <= 0) {
            // 自分のLPが0
            const decisionObj = { decision: true, winner: opponentPlayerId }
            updatefields.decision = true
            updatefields.winner = opponentPlayerId
            updatefields.players = await matchDataUpdate(playerId, opponentPlayerId, updatefields, selectTargetProps.turnCount)
            socket.emit('decision', { roomName, decisionObj, result: updatefields.players[playerId].matchData })
            return updatefields;
        }
        // // // デバッグ用
        // updatefields.players = await matchDataUpdate(playerId, opponentPlayerId, updatefields, selectTargetProps.turnCount)
        // const decisionObj = { decision: true, winner: playerId, result: updatefields.players[playerId].matchData}
        // updatefields.decision = true
        // socket.emit('decision', { roomName, decisionObj, result: updatefields.players[playerId].matchData })

    }
    card.effect.target = null
    console.log(targetCardId)

    return updatefields;
}
const ringOfDestructionEffect1 = new Effect(['ringOfDestruction'], 2, 'none', true, 'none', 0, null);
const ringOfDestructionEffect2 = new Effect(['ringOfDestruction'], 2, 'none', true, 'none', 0, null);

// リビングデッドの呼び声
const CallOfTheHauntedEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('リビングデッドの呼び声', fields);
    let updatefields = fields
    const card = allCards[cardId];
    const targetCardId = card.effect.target
    console.log(targetCardId)
    // モンスターがいっぱいだったら自壊
    if (updatefields.monsterZone[playerId].filter((id) => id != null).length == 5) {
        socket.emit('destroy', { roomName, fields: updatefields, playerId: playerId, cardId: cardId });
        // 自身を破壊
        updatefields = await destroy(playerId, fields, fieldsSetter, cardId);
        card.effect.target = null
        return updatefields
    }



    // 早すぎた埋葬は対象を取らないのでチェックしない
    // 早すぎた埋葬でリンクされているものは蘇生不可
    // let premelLinked = null
    // const premel = fields.spellTrapZone[playerId].find((id) => id != null && allCards[id].name == "早すぎた埋葬");
    // if (premel && allCards[premel].link[0]) {
    //     premelLinked = allCards[premel].link[0];
    // }
    // const graveMonster = fields.graveyard[playerId].filter((cardId) => allCards[cardId].cardtype == 'Monster' && (allCards[cardId].name != 'カオス・ソルジャー －開闢の使者－' || allCards[cardId].uuid != ''))
    const JinzoExist = updatefields.monsterZone[playerId].concat(updatefields.monsterZone[opponentPlayerId]).filter(id => id != null).some((id) => allCards[id].name == "人造人間－サイコ・ショッカー" && allCards[id].faceStatus != "downDef")
    // モンスターが墓地にモンスターが1体以上居てショッカーがいなければ
    if (targetCardId && allCards[targetCardId].location == 'graveyard' && !JinzoExist && allCards[cardId].location == "spellTrapZone") {
        // 墓地からカードを選択
        // const target = await selectCards(graveMonster, 1, selectTargetProps.setHoverCardId, cardId);
        // リンク付けをしてから蘇生,そうじゃないとショッカーのリンク解除が先に処理されるs
        allCards[cardId].link = [...allCards[cardId].link, targetCardId];
        allCards[targetCardId].link = [...allCards[targetCardId].link, cardId];
        socket.emit('link', { roomName, linkCardId: cardId, targetCardId: targetCardId });
        socket.emit('link', { roomName, linkCardId: targetCardId, targetCardId: cardId });
        // チェーンの一番最初がこのカードなら
        if (selectTargetProps.chainBlockCards[0] == cardId) {
            selectTargetProps.setActionMonster(targetCardId)
            socket.emit('addActionMonster', { roomName, actionMonster: targetCardId, action: 'summon' });
        }
        // 選択したモンスターを蘇生
        if (allCards[targetCardId].name == "魔導戦士ブレイカー") {
            allCards[targetCardId].counter = -1
        }
        updatefields = await revive(socket, roomName, playerId, fields, fieldsSetter, targetCardId);
        //emitする
        socket.emit('revive', { roomName, playerId: playerId, cardId: targetCardId });
    }
    console.log(allCards[cardId], JSON.stringify(allCards[cardId]))
    console.log(updatefields, JSON.stringify(updatefields))

    card.effect.target = null
    console.log(targetCardId)
    return updatefields;
}

// 開闢で除外された場合は破壊されていないので破壊されない
// リビングデッドの呼び声の破壊時
const CallOfTheHauntedEffectDetail2 = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('リビングデッドの呼び声が破壊されました', fields);
    let updatefields = fields
    if (updatefields.monsterZone[playerId].concat(updatefields.monsterZone[opponentPlayerId]).some((id) => id != null && allCards[id].name == '人造人間－サイコ・ショッカー' && allCards[id].faceStatus != "downDef")) {
        return updatefields;
    }
    const linkCardId = allCards[cardId].link[0]
    const linkCard = allCards[linkCardId];
    console.log(linkCard)
    await unlink(cardId, linkCardId);
    await unlink(linkCardId, cardId);

    socket.emit('unlink', { roomName, cardId: cardId, unlinkCardId: linkCardId });
    socket.emit('unlink', { roomName, cardId: linkCardId, unlinkCardId: cardId });
    //emitする
    socket.emit('destroy', { roomName, fields: fields, playerId: linkCard.owner, cardId: linkCardId });
    // リンク先のカードを破壊
    updatefields = await destroy(linkCard.owner, fields, fieldsSetter, linkCardId);
    return updatefields;
}

// リビデ対象が破壊された時用の自壊
const CallOfTheHauntedEffectDetail3 = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('リビングデッドの呼び声の対象が破壊されました', fields);
    console.log(allCards[cardId], JSON.stringify(allCards[cardId]));
    let updatefields = fields
    const linkCardId = allCards[cardId].link[0]
    console.log(allCards[linkCardId], JSON.stringify(allCards[linkCardId]));
    const linkCard = allCards[linkCardId];
    console.log(linkCard)
    await unlink(cardId, linkCardId);
    await unlink(linkCardId, cardId);

    socket.emit('unlink', { roomName, cardId: cardId, unlinkCardId: linkCardId });
    socket.emit('unlink', { roomName, cardId: linkCardId, unlinkCardId: cardId });
    //emitする
    socket.emit('destroy', { roomName, fields: fields, playerId: playerId, cardId: cardId });
    // リンク先のカードを破壊
    updatefields = await destroy(playerId, fields, fieldsSetter, cardId);
    return updatefields;
}

const CallOfTheHauntedEffect1 = new Effect(['CallOfTheHaunted', 'CallOfTheHaunted2', 'CallOfTheHaunted3'], 2, 'none,destroy', true, 'none', 0, null);
const CallOfTheHauntedEffect2 = new Effect(['CallOfTheHaunted', 'CallOfTheHaunted2', 'CallOfTheHaunted3'], 2, 'none,destroy', true, 'none', 0, null);

// 早すぎた埋葬
const prematureBurialEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('早すぎた埋葬', fields);
    let updatefields = fields


    const card = allCards[cardId];
    const targetCardId = card.effect.target
    console.log(targetCardId)
    
    // モンスターがいっぱいだったら自壊
    if (updatefields.monsterZone[playerId].filter((id) => id != null).length == 5) {
        socket.emit('destroy', { roomName, fields: updatefields, playerId: playerId, cardId: cardId });
        // 自身を破壊
        updatefields = await destroy(playerId, fields, fieldsSetter, cardId);
        card.effect.target = null
        return updatefields
    }

    // 蘇生先を選択
    // const equipCardId = await selectEquipTarget(socket, cardId, updatefields, fieldsSetter, playerId, opponentPlayerId, selectTargetProps);
    // console.log("装備対象は", equipCardId)
    // 自身のリンク先として対象をリンク


    const reviveMonster = targetCardId;

    // 効果処理時に自身が場になければ不発
    if (targetCardId && allCards[targetCardId].location == 'graveyard' && updatefields.spellTrapZone[playerId].includes(cardId)) {
        // const reviveMonster = allCards[cardId].link[0];
        if (allCards[reviveMonster].name == "魔導戦士ブレイカー") {
            allCards[reviveMonster].counter = -1
        }
        // 装備先と自身にリンク
        allCards[reviveMonster].link = [...allCards[reviveMonster].link, cardId]
        allCards[cardId].link = [...allCards[cardId].link, reviveMonster];
        // 効果発動時に対象をリンク付けしているのでそこから蘇生先を取得
        socket.emit('revive', { roomName, playerId: playerId, cardId: reviveMonster});
        updatefields = await revive(socket, roomName, playerId, fields, fieldsSetter, reviveMonster);
        //emitする
        socket.emit('link', { roomName, linkCardId: reviveMonster, targetCardId: cardId });
        socket.emit('link', { roomName, linkCardId: cardId, targetCardId: reviveMonster  });
    }
    
    card.effect.target = null
    console.log(targetCardId)

    return updatefields;
}

const prematureBurialEffectDetail2 = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('早すぎた埋葬が破壊されました', fields);
    let updatefields = fields
    const linkCardId = allCards[cardId].link[0]
    const linkCard = allCards[linkCardId];
    console.log(linkCard)
    await unlink(cardId, linkCardId);
    await unlink(linkCardId, cardId);

    socket.emit('unlink', { roomName, cardId: cardId, unlinkCardId: linkCardId });
    socket.emit('unlink', { roomName, cardId: linkCardId, unlinkCardId: cardId });
    //emitする
    socket.emit('destroy', { roomName, fields: fields, playerId: linkCard.owner, cardId: linkCardId });
    // リンク先のカードを破壊
    updatefields = await destroy(linkCard.owner, fields, fieldsSetter, linkCardId);
    return updatefields;
}

const prematureBurialEffect1 = new Effect(['prematureBurial', 'prematureBurial2'], 1, 'normalSpell,destroy', true, 'lifePoint', 800, null);
const prematureBurialEffect2 = new Effect(['prematureBurial', 'prematureBurial2'], 1, 'normalSpell,destroy', true, 'lifePoint', 800, null);

// 強奪
const snatchStealEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('強奪', fields)
    let updatefields = fields

    const card = allCards[cardId];
    const targetCardId = card.effect.target
    console.log(targetCardId)
    // // 効果処理時点でモンスターが5体いたら対象を破壊
    // if (updatefields.monsterZone[playerId].filter((id) => id != null).length == 5) {
    //     card.effect.target = null
    //     console.log(targetCardId)
    //     return updatefields;
    // }


    let updatedMonsterZone = updatefields.monsterZone
    // 全部null,相手モンスターがいなければ自壊して終了
    console.log(fields, JSON.stringify(fields))
    // 対象が無い、モンスターゾーンにいない、コントローラーが相手じゃない場合矯正終了
    if (!targetCardId || allCards[targetCardId].location != 'monsterZone' || allCards[targetCardId].controller != opponentPlayerId) {
        card.effect.target = null
        socket.emit('destroy', { roomName, fields: updatefields, playerId: playerId, cardId: cardId });
        updatefields = await destroy(playerId, updatefields, fieldsSetter, cardId);
        console.log(targetCardId)
        return updatefields
    }
    // 強奪自身が無い場合も何もせずに終了
    if ((allCards[cardId].location != 'spellTrapZone' || !updatefields.spellTrapZone[playerId].includes(cardId))) {
        if (allCards[targetCardId].name == '魂を削る死霊') {
            socket.emit('link', { roomName, linkCardId: targetCardId, targetCardId: cardId });
            allCards[targetCardId].link = [...allCards[targetCardId].link, cardId]
        }
        card.effect.target = null
        return updatefields
    }
    // 奪取先を選択
    const equipCardId = targetCardId
    
    // コントロール奪取処理を相手に通知
    socket.emit('betray', { roomName, steeler: playerId, victim: opponentPlayerId, targetCardId: equipCardId });
    if (updatefields.monsterZone[playerId].filter((id) => id != null).length == 5) {
        updatedMonsterZone = await betray(playerId, opponentPlayerId, updatefields, fieldsSetter, equipCardId);
        updatefields.monsterZone = updatedMonsterZone;
        socket.emit('destroy', { roomName, fields: updatefields, playerId: playerId, cardId: cardId });
        updatefields = await destroy(playerId, updatefields, fieldsSetter, cardId);

        card.effect.target = null
        console.log(targetCardId)
        return updatefields;
    }
    console.log("装備対象は", equipCardId)
    // 自身のリンク先として対象をリンク
    allCards[cardId].link = [...allCards[cardId].link, equipCardId];


    console.log('強奪の対象は', equipCardId);
    // 装備先のカードにこのカード(強奪)をリンク
    const linkCardId = equipCardId
    allCards[linkCardId].link = [...allCards[linkCardId].link, cardId]

    updatedMonsterZone = await betray(playerId, opponentPlayerId, updatefields, fieldsSetter, linkCardId);
    socket.emit('link', { roomName, linkCardId: linkCardId, targetCardId: cardId });
    socket.emit('link', { roomName, linkCardId: cardId, targetCardId: linkCardId });


    // コントロール奪取を記録
    const playersMatchData = await matchDataUpdate(playerId, opponentPlayerId, updatefields, selectTargetProps.turnCount, 'betray');

    let matchData = playersMatchData[playerId].matchData
    matchData.betrayCard = linkCardId
    matchData.usePlayer = playerId;

    socket.emit('betrayResult', { betrayResult: matchData });

    updatefields.monsterZone = updatedMonsterZone;
    console.log('強奪終了', updatefields)

    card.effect.target = null
    console.log(targetCardId)

    return updatefields;
}

const snatchStealEffectDetail2 = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('強奪が破壊されました', fields);
    let updatefields = fields
    const snatchSteal = allCards[cardId];
    const snatchStealOwner = snatchSteal.owner;
    const stolenCard = allCards[snatchSteal.link[0]];
    // 破壊された強奪の相手プレイヤー
    let notOwner = ''
    if (snatchStealOwner === playerId) {
        notOwner = opponentPlayerId;
    } else {
        notOwner = playerId;
    }
    console.log(playerId, notOwner);
    const changeOfHerats = updatefields.graveyard[playerId].concat(updatefields.graveyard[opponentPlayerId]).concat(updatefields.hand[playerId]).concat(updatefields.hand[opponentPlayerId]).filter((cardId) => allCards[cardId].name == "心変わり");
    // const allSpellTrap = updatefields.graveyard[playerId].concat(updatefields.graveyard[opponentPlayerId]);
    // const changeOfHerats = allSpellTrap.filter((cardId) => allCards[cardId].name == "心変わり");
    console.log(stolenCard)
    console.log(stolenCard.owner, stolenCard.controller, snatchStealOwner)
    console.log(changeOfHerats)
    // リンク先が心変わりされている場合は何もせずに終了
    for (let changeOfHeratId of changeOfHerats) {
        const card = allCards[changeOfHeratId];
        console.log(card, card.link, snatchSteal.link[0], (card.link.includes(snatchSteal.link[0])))
        if (card.link.includes(snatchSteal.link[0])) {
            await unlink(cardId, stolenCard.id);
            await unlink(stolenCard.id, cardId);

            socket.emit('unlink', { roomName, cardId: cardId, unlinkCardId: stolenCard.id });
            socket.emit('unlink', { roomName, cardId: stolenCard.id, unlinkCardId: cardId });
            return updatefields;
        }    
    }
    
    // 持ち主に返却する場合
    // 強奪一枚or二枚で自身の強奪を破壊した場合。
    console.log("jadge", stolenCard.owner, stolenCard.controller, snatchStealOwner)
    if (stolenCard.owner !== stolenCard.controller || (stolenCard.owner === stolenCard.controller && stolenCard.controller === snatchStealOwner)) {
        socket.emit('betray', { roomName, steeler: notOwner, victim: stolenCard.controller, targetCardId: allCards[cardId].link[0] });
        const updatedMonsterZone = await betray(notOwner, stolenCard.controller, fields, fieldsSetter, allCards[cardId].link[0]);
        await unlink(cardId, stolenCard.id);
        await unlink(stolenCard.id, cardId);
    
        socket.emit('unlink', { roomName, cardId: cardId, unlinkCardId: stolenCard.id });
        socket.emit('unlink', { roomName, cardId: stolenCard.id, unlinkCardId: cardId });
        
        updatefields.monsterZone = updatedMonsterZone;
        
    }
    return updatefields;

}
const snatchStealEffectDetail3 = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    let updatefields = fields;
    if (allCards[cardId].location == 'spellTrapZone') {
        // 自分の強奪なら相手が回復。相手の強奪なら自分が回復
        if (allCards[cardId].controller == playerId) {
            if (updatefields.players[opponentPlayerId].hp > 0) {
                updatefields.players = await reduceLifePoint(updatefields.players, fieldsSetter.setPlayers, opponentPlayerId, -1000, selectTargetProps.setOpponentPlayerDamageValue)
                socket.emit('reduceLP', { roomName, playerId: opponentPlayerId, value: -1000 });
                const message = allCards[cardId].name + "の効果でライフポイントを1000回復しました"
                socket.emit('messageLog', { roomName: roomName, type: 'damageLog', playerId: opponentPlayerId, message: message })
            }
        } else {
            if (updatefields.players[playerId].hp > 0) {
                updatefields.players = await reduceLifePoint(updatefields.players, fieldsSetter.setPlayers, playerId, -1000, selectTargetProps.setPlayerDamageValue)
                socket.emit('reduceLP', { roomName, playerId: playerId, value: -1000 });
                const message = allCards[cardId].name + "の効果でライフポイントを1000回復しました"
                socket.emit('messageLog', { roomName: roomName, type: 'damageLog', playerId: playerId, message: message })
            }
        }
    }

    console.log('強奪回復終了', updatefields)

    return updatefields;
}
const snatchStealEffect1 = new Effect(['snatchSteal', 'snatchSteal2', 'snatchSteal3'], 1, 'normalSpell,destroy', true, 'none', 0, null);
const snatchStealEffect2 = new Effect(['snatchSteal', 'snatchSteal2', 'snatchSteal3'], 1, 'normalSpell,destroy', true, 'none', 0, null);

// 炸裂装甲
const sakuretsuArmorEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('炸裂装甲')
    const target = allCards[cardId].link[0];
    let updatefields = fields
    const JinzoExist = updatefields.monsterZone[playerId].concat(updatefields.monsterZone[opponentPlayerId]).some((id) => id != null && allCards[id].name == "人造人間－サイコ・ショッカー" && allCards[id].faceStatus != "downDef")

    console.log(target)
    if (allCards[target].location === 'monsterZone' && !JinzoExist) {
        //emitする
        socket.emit('destroy', { roomName, fields: fields, playerId: opponentPlayerId, cardId: target });
        // 攻撃してきたカードの破壊
        updatefields = await destroy(opponentPlayerId, fields, fieldsSetter, target);
    }
    await unlink(cardId, target)
    return updatefields;
}

const sakuretsuArmorEffect1 = new Effect(['sakuretsuArmor'], 2, 'attack', true, 'none', 0, null);
const sakuretsuArmorEffect2 = new Effect(['sakuretsuArmor'], 2, 'attack', true, 'none', 0, null);
const sakuretsuArmorEffect3 = new Effect(['sakuretsuArmor'], 2, 'attack', true, 'none', 0, null);
const sakuretsuArmorEffect4 = new Effect(['sakuretsuArmor'], 2, 'attack', true, 'none', 0, null);

// 激流葬
const torrentialTributeEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('激流葬');
    let updatefields = fields;
    const JinzoExist = updatefields.monsterZone[playerId].concat(updatefields.monsterZone[opponentPlayerId]).some((id) => id != null && allCards[id].name == "人造人間－サイコ・ショッカー" && allCards[id].faceStatus != "downDef")
    if (!JinzoExist) {
        const monsterZone = updatefields.monsterZone[playerId];
        const oppoMonsterZone = updatefields.monsterZone[opponentPlayerId];
        const target = monsterZone.concat(oppoMonsterZone).filter(id => id != null);
        socket.emit('sweep', { roomName, fields: updatefields, target: target.filter(id => id != null) });
        updatefields = await sweep(playerId, opponentPlayerId, updatefields, fieldsSetter, target.filter(id => id != null));
    }

    return updatefields;
}

const torrentialTributeEffect1 = new Effect(['torrentialTribute'], 2, 'summoned', true, 'none', 0, null);
const torrentialTributeEffect2 = new Effect(['torrentialTribute'], 2, 'summoned', true, 'none', 0, null);

// 奈落 召喚のactionに対してのチェーン検証不足
const bottomlessTrapHoleEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('奈落', selectTargetProps);
    let updatefields = fields
    const target = allCards[cardId].link[0];
    console.log(target)
    const JinzoExist = updatefields.monsterZone[playerId].concat(updatefields.monsterZone[opponentPlayerId]).some((id) => id != null && allCards[id].name == "人造人間－サイコ・ショッカー" && allCards[id].faceStatus != "downDef")

    // そのモンスターが効果処理時にモンスターゾーンに居れば
    if (allCards[target].location === 'monsterZone' && !JinzoExist) {
        // モンスターの除外
        socket.emit('monsterBanish', { roomName, cardId: target });
        updatefields = await monsterBanish(fields, fieldsSetter, target);
    }
    await unlink(cardId, target)

    return updatefields;
}
const bottomlessTrapHoleEffect1 = new Effect(['bottomlessTrapHole'], 2, 'summoned', true, 'none', 0, null);
const bottomlessTrapHoleEffect2 = new Effect(['bottomlessTrapHole'], 2, 'summoned', true, 'none', 0, null);

// 砂塵の大竜巻
const dustTornadoEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('砂塵', cardId)
    console.log(fields)
    let updatefields = fields;


    const card = allCards[cardId];
    const targetCardId = card.effect.target
    console.log(targetCardId)

    // サイクロンの破壊対象範囲を設定
    const JinzoExist = updatefields.monsterZone[playerId].concat(updatefields.monsterZone[opponentPlayerId]).some((id) => id != null && allCards[id].name == "人造人間－サイコ・ショッカー" && allCards[id].faceStatus != "downDef")
    if (targetCardId && allCards[targetCardId].location == 'spellTrapZone' && !JinzoExist) {
        
        // const mySpellTrapZone = updatefields.spellTrapZone[playerId];
        // const oppoSpellTrapZone = updatefields.spellTrapZone[opponentPlayerId].filter(id => id != null);
        // const targets = oppoSpellTrapZone;
        // ターゲットとして指定
        // console.log('選択可能カードは', targets)
        // emitを使いクリックされたカードを受け取る
        // const targetCardId = await asyncSelectCard(socket, cardId, targets, selectTargetProps);
        // 破壊カードの所持者
        const targetCardOwner = allCards[targetCardId].owner;
        
        console.log('砂塵の対象は', targetCardId, 'owner is ', targetCardOwner)
        
        
        // 破壊処理を相手に通知
        socket.emit('destroy', { roomName, fields: updatefields, playerId: targetCardOwner, cardId: targetCardId });
        updatefields = await destroy(targetCardOwner, updatefields, fieldsSetter, targetCardId);
        // choiceで魔法罠セット確認のためにコストを上げる
        // コストを払わないので上げても問題ない
        allCards[cardId].effect.costValue = 1;
        // 強奪が破壊された場合はサイドエフェクトではなく即時コントロールを返す
        if (allCards[targetCardId].name == "強奪" && allCards[targetCardId].link.length != 0 && allCards[allCards[targetCardId].link[0]].location == "monsterZone") {
            updatefields = await snatchStealEffectDetail2(socket, roomName, targetCardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps);
        }
        if (allCards[targetCardId].name == "早すぎた埋葬" && allCards[targetCardId].link.length != 0 && allCards[allCards[targetCardId].link[0]].location == "monsterZone") {
            updatefields = await prematureBurialEffectDetail2(socket, roomName, targetCardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps);
        }
        if (allCards[targetCardId].name == "リビングデッドの呼び声" && allCards[targetCardId].link.length != 0 && allCards[allCards[targetCardId].link[0]].location == "monsterZone") {
            updatefields = await CallOfTheHauntedEffectDetail2(socket, roomName, targetCardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps);
        }
        console.log('砂塵',allCards[cardId]);
        // 手札に魔法罠があって空きがあればセットするか確認
        if (updatefields.hand[playerId].some((id) => allCards[id].cardtype == "Spell" || allCards[id].cardtype == "Trap") && updatefields.spellTrapZone[playerId].includes(null)) {
            
            // カードのセットするかの確認
            const cardSetBool = await choice(cardId, updatefields);
            if (cardSetBool) {
                const canSetCard = updatefields.hand[playerId].filter((cardId) => allCards[cardId].cardtype == 'Spell' || allCards[cardId].cardtype == 'Trap');
                
                const setCard = await asyncSelectCard(socket, cardId, canSetCard, selectTargetProps);
                console.log(setCard)
                updatefields = await put(setCard, updatefields, fieldsSetter, playerId, 'down',);
                if ((allCards[setCard].cardtype == 'Spell' && allCards[setCard].category == 'quick') || (allCards[setCard].cardtype == 'Trap')) {
                    allCards[setCard].canChange = false;
                }
                socket.emit('put', { roomName, cardId: setCard, face: 'down' });
            }
            
            // asyncSelectCardで手札から選択したカードをputする
        }
    }
    // 魔法罠の選択が終わり次第コストを下に戻す
    allCards[cardId].effect.costValue = 0;
    card.effect.target = null
    console.log(targetCardId)

    console.log('砂塵終了', updatefields, JSON.stringify(updatefields))
    return updatefields
    
}
const dustTornadoEffect1 = new Effect(['dustTornado'], 2, 'none', true, 'none', 0, null);
const dustTornadoEffect2 = new Effect(['dustTornado'], 2, 'none', true, 'none', 0, null);


// スケープゴート 
const scapeGoatEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('スケープゴート');
    let updatefields = fields;
    let updateMonsterZone = updatefields.monsterZone;
    if (updateMonsterZone[playerId].filter(id => id != null).length <= 1) {
        let goatsNumber = 41
        // スケープゴートのカードIDが50より大きいなら後攻プレイヤーの発動
        if (cardId > 50) {
            goatsNumber = 91
        }
        socket.emit('goats', { roomName, playerId, updateMonsterZone, goatsNumber });
        // updateMonsterZone[playerId] = [...updateMonsterZone[playerId], goatsNumber, goatsNumber + 1, goatsNumber + 2, goatsNumber + 3];
        // 場の羊トークンを取得
        const allMonster = updateMonsterZone[playerId].concat(updateMonsterZone[opponentPlayerId]).filter((id) => id != null);
        const existGoats = allMonster.filter((id) => id != null && allCards[id].name == "羊トークン");
        let goatsCount = 0
        for (let i = 0; i < updateMonsterZone[playerId].length; i++) {
            // 空きスロットに要素を追加
            if (updateMonsterZone[playerId][i] === null) {
                while (existGoats.includes(goatsNumber)) {
                    console.log(goatsNumber,'はすでにあるよ')
                    goatsNumber++; // 次の要素の値を更新
                }
                console.log(goatsNumber)
                updateMonsterZone[playerId][i] = goatsNumber;
                allCards[goatsNumber].location = 'monsterZone';
                allCards[goatsNumber].faceStatus = 'def';
                goatsCount++;
                if (goatsCount == 4) {
                    break   
                }
                goatsNumber++; // 次の要素の値を更新
            }
        }
        console.log('goats', updateMonsterZone, JSON.stringify(updateMonsterZone));
        console.log(updatefields)
        fieldsSetter.setMonsterZone(updateMonsterZone);
        updatefields.monsterZone = updateMonsterZone;
    }

    return updatefields
}

const scapeGoatEffect1 = new Effect(['scapeGoat'], 2, 'none', true, 'none', 0, null);
const scapeGoatEffect2 = new Effect(['scapeGoat'], 2, 'none', true, 'none', 0, null);

// キラースネーク
const sinisterSSerpentEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('キラースネーク', fields, cardId, JSON.stringify(fields));
    const updatefields = await salvage(playerId, fields, fieldsSetter, cardId)
    // emit
    socket.emit('salvage', { roomName, playerId, cardId: cardId });
    console.log('キラースネーク end', updatefields, JSON.stringify(updatefields));
    return updatefields
}

const sinisterSSerpentEffect1 = new Effect(['sinisterSSerpent'], 1, 'stanby', true, 'none', 0, null);
const sinisterSSerpentEffect2 = new Effect(['sinisterSSerpent'], 1, 'stanby', true, 'none', 0, null);

// 同族感染ウイルス
const tribeInfectingVirusEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('同族感染ウイルス')

    const targetType = allCards[cardId].effect.target
    console.log('choice is ', targetType);
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
    // let message = typeList[targetType] + 'が選択されました'
    // socket.emit('messagePopUp', { roomName, message: message });
    // socket.emit('messageLog', { roomName: roomName, type: 'battleLogEffectDetail', playerId: playerId, message: message })

    const allMonsters = Object.values(fields.monsterZone).flat();
    const targetCards = allMonsters.filter((cardId) => cardId != null && allCards[cardId].type === targetType && allCards[cardId].faceStatus != "downDef");
    console.log('同族感染ウイルスの対象は',targetCards)
    socket.emit('sweep', { roomName, fields: fields, target:targetCards });
    const updatefields = await sweep(playerId, opponentPlayerId, fields, fieldsSetter, targetCards);

    allCards[cardId].effect.target = null;
    return updatefields;
}

const tribeInfectingVirusEffect1 = new Effect(['tribeInfectingVirus'], 1, 'ignition', true, 'discard', 1, null);
const tribeInfectingVirusEffect2 = new Effect(['tribeInfectingVirus'], 1, 'ignition', true, 'discard', 1, null);

// 首領・ザルーグ
const donZaloogEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('首領・ザルーグ');
    // どっちの効果を使うか。ハンデスならtrueで帰ってくる
    let updatefields = fields;
    allCards[cardId].effect.canUse = false;
    const effectChoice = await choice(cardId, fields);
    if (effectChoice) {
        // ランダムハンデス
        if (fields.hand[opponentPlayerId].length != 0) {
            socket.emit('useCardData', { roomName, cardId });
            // 相手の手札からランダムで一枚取得
            let rondomNum = Math.floor(Math.random() * fields.hand[opponentPlayerId].length)
            console.log(rondomNum)
            const discardCard = fields.hand[opponentPlayerId][rondomNum];
            updatefields = await discard(opponentPlayerId, discardCard, updatefields, updatefields.hand, fieldsSetter.setHand, updatefields.graveyard, fieldsSetter.setGraveyard);
            socket.emit('discard', { roomName, playerId: opponentPlayerId, discardCardId: discardCard });
            // ハンデスを記録
            socket.emit('useCardData', { roomName, cardId });
            const message = allCards[discardCard].name + "が墓地に送られました"
            socket.emit('messagePopUp', { roomName, message: message });
            let messageLog = '首領・ザルーグによって' + allCards[discardCard].name + "が墓地に送られました";
            socket.emit('messageLog', { roomName: roomName, type: 'battleLogEffectDetail', playerId: playerId, message: messageLog })
        }
    } else {
        //デッキトップ二枚墓地
        console.log('デッキ破壊')
        updatefields = await deckDestruction(opponentPlayerId, updatefields, fieldsSetter)
        console.log(updatefields)
        socket.emit('deckDestruction', { roomName, num: 0 });
    }
    return updatefields;
}
const donZaloogEffect1 = new Effect(['donZaloog'], 1, 'damageConfirm', true, 'none', 0, null);
const donZaloogEffect2 = new Effect(['donZaloog'], 1, 'damageConfirm', true, 'none', 0, null);

// 異次元の女戦士
const DDWarriorLadyEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps, targetCardId) => {
    console.log('異次元の女戦士');
    socket.emit('monsterBanish', { roomName, cardId: cardId });
    // 相手のカードと自身にリビデがついてないか確認。あればリンクを外してリビデが自壊しないように
    if (allCards[targetCardId].link.length != 0 &&
        allCards[targetCardId].link.some((id) => allCards[id].name == "リビングデッドの呼び声")) {
        const livingDeadId = allCards[targetCardId].link.find((id) => allCards[id].name == "リビングデッドの呼び声");
        socket.emit('unlink', { roomName, cardId: targetCardId, unlinkCardId: livingDeadId });
        socket.emit('unlink', { roomName, cardId: livingDeadId, unlinkCardId: targetCardId });
        await unlink(targetCardId, livingDeadId)
        await unlink(livingDeadId, targetCardId)
    }
    if (allCards[cardId].link.length != 0 &&
        allCards[cardId].link.some((id) => allCards[id].name == "リビングデッドの呼び声")) {
        const livingDeadId = allCards[cardId].link.find((id) => allCards[id].name == "リビングデッドの呼び声");
        socket.emit('unlink', { roomName, cardId: cardId, unlinkCardId: livingDeadId });
        socket.emit('unlink', { roomName, cardId: livingDeadId, unlinkCardId: cardId });
        await unlink(cardId, livingDeadId)
        await unlink(livingDeadId, cardId)
    }

    let updatefields = await monsterBanish(fields, fieldsSetter, cardId);
    updatefields = await monsterBanish(updatefields, fieldsSetter, targetCardId);
    socket.emit('monsterBanish', { roomName, cardId: targetCardId });

    return updatefields;
}

const DDWarriorLadyEffect1 = new Effect(['DDWarriorLady'], 1, 'battleConfirm', true, 'none', 0, null);
const DDWarriorLadyEffect2 = new Effect(['DDWarriorLady'], 1, 'battleConfirm', true, 'none', 0, null);
const DDWarriorLadyEffect3 = new Effect(['DDWarriorLady'], 1, 'battleConfirm', true, 'none', 0, null);
const DDWarriorLadyEffect4 = new Effect(['DDWarriorLady'], 1, 'battleConfirm', true, 'none', 0, null);
const DDWarriorLadyEffect5 = new Effect(['DDWarriorLady'], 1, 'battleConfirm', true, 'none', 0, null);
const DDWarriorLadyEffect6 = new Effect(['DDWarriorLady'], 1, 'battleConfirm', true, 'none', 0, null);

// 霊滅術師カイクウ
const kycooTheGhostDestroyerEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('霊滅術師カイクウ',selectTargetProps);
    const graveyardMonster = fields.graveyard[opponentPlayerId].filter((cardId) => allCards[cardId].cardtype == 'Monster');
    const targets = await selectCards(graveyardMonster, 'kycoo', selectTargetProps.setHoverCardId, cardId);
    let updatefields = fields
    if (targets.length != 0) {
        updatefields = await graveyardToBanish(opponentPlayerId, fields, fieldsSetter, targets);
        socket.emit('kycoo', { roomName, cardIds: targets });
    }
    console.log('カイクウ終了')
    return updatefields;
}

const kycooTheGhostDestroyerEffect1 = new Effect(['kycooTheGhostDestroyer'], 1, 'damageConfirm', true, 'none', 0, null);
const kycooTheGhostDestroyerEffect2 = new Effect(['kycooTheGhostDestroyer'], 1, 'damageConfirm', true, 'none', 0, null);

// 人造人間－サイコ・ショッカー
// 使われない
const JinzoEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('人造人間－サイコ・ショッカー');
    // リビングデッドの呼び声があればリンクを外す;
    const concatSpellTrapZone = [].concat(...Object.values(fields.spellTrapZone));
    console.log(fields.spellTrapZone,concatSpellTrapZone)
    // const concatSpellTrapZone = fields.spellTrapZone[playerId].concat(fields.spellTrapZone[opponentPlayerId]);
    // フィールド上のリビングデッドの呼び声を取得
    const CallOfTheHaunteds = concatSpellTrapZone.filter((cardId) => cardId != null && allCards[cardId].name == 'リビングデッドの呼び声' && allCards[cardId].faceStatus == "up" && allCards[cardId].link.length != 0);
    if (CallOfTheHaunteds.length >= 1) {
        for (let cardId of CallOfTheHaunteds){
            console.log('link is',allCards[cardId].link,'card info is', allCards[cardId])
            console.log('link is', JSON.stringify(allCards[cardId].link), 'card info is', JSON.stringify(allCards[cardId]))
            // リビングデッドの呼び声のリンク先からもリンクを外す
            socket.emit('unlink', { roomName, cardId: allCards[cardId].link[0], unlinkCardId: cardId });
            socket.emit('unlink', { roomName, cardId: cardId, unlinkCardId: allCards[cardId].link[0] });
            await unlink(allCards[cardId].link[0], cardId)
            await unlink(cardId, allCards[cardId].link[0])

            console.log('link is', allCards[cardId].link, 'card info is', allCards[cardId])
            console.log('link is', JSON.stringify(allCards[cardId].link), 'card info is', JSON.stringify(allCards[cardId]))

        }
    }

    console.log('ショッカー終わり', CallOfTheHaunteds, allCards[CallOfTheHaunteds[0]]);

    return fields;
}
// 召喚時に強制発動させるからconditionは関係ない
const JinzoEffect1 = new Effect(['Jinzo'], 1, 'summon', true, 'none', 0, null);
const JinzoEffect2 = new Effect(['Jinzo'], 1, 'summon', true, 'none', 0, null);

// 魂を削る死霊 魔法罠の対象で自壊する効果未実装
const spiritReaperEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('魂を削る死霊');
    let updatefields = fields;
    // ランダムハンデス
    if (updatefields.hand[opponentPlayerId].length != 0) {
        // 相手の手札からランダムで一枚取得
        let rondomNum = Math.floor(Math.random() * updatefields.hand[opponentPlayerId].length)
        console.log(rondomNum)
        const discardCard = updatefields.hand[opponentPlayerId][rondomNum];
        updatefields = await discard(opponentPlayerId, discardCard, updatefields, updatefields.hand, fieldsSetter.setHand, updatefields.graveyard, fieldsSetter.setGraveyard);
        socket.emit('discard', { roomName, playerId: opponentPlayerId, discardCardId: discardCard });
        const message = allCards[discardCard].name + "が墓地に送られました"
        socket.emit('messagePopUp', { roomName, message: message });
        // たけしは誘発効果もあるから個別処理
        socket.emit('useCardData', { roomName, cardId });

        let messageLog = '魂を削る死霊によって' + allCards[discardCard].name + "が墓地に送られました";
        socket.emit('messageLog', { roomName: roomName, type: 'battleLogEffectDetail', playerId: playerId, message: messageLog })
    }
    return updatefields;

}
const spiritReaperEffectDetail2 = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('魂を削る死霊2');
    let updatefields = fields;
    // 自壊
    if (allCards[cardId].location == 'monsterZone') {
        socket.emit('destroy', { roomName, fields: updatefields, playerId: playerId, cardId: cardId });
        updatefields = await destroy(playerId, updatefields, fieldsSetter, cardId);
    }
    console.log(updatefields, JSON.stringify(updatefields))
    return updatefields;

}

const spiritReaperEffect1 = new Effect(['spiritReaper', 'spiritReaper2'], 1, 'damageConfirm', true, 'none', 0, null);
const spiritReaperEffect2 = new Effect(['spiritReaper', 'spiritReaper2'], 1, 'damageConfirm', true, 'none', 0, null);

// お注射天使リリー
const injectionFairyLilyEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('お注射天使リリー');
    let updatefields = fields;
    if (allCards[cardId].attack == 400) {
        socket.emit('reduceLP', { roomName, playerId: playerId, value: 2000 });
        let updateplayers = await reduceLifePoint(fields.players, fieldsSetter.setPlayers, playerId, 2000, selectTargetProps.setPlayerDamageValue);
        const message = allCards[cardId].name + "の効果発動のため" + 2000 + "ポイントのライフを支払いました"
        socket.emit('messageLog', { roomName: roomName, type: 'damageLog', playerId: playerId, message: message }) 
        await attackIncrease(cardId, 3000);
        socket.emit('attackIncrease', { roomName, cardId, value: 3000 });
    
        updatefields.players = updateplayers;
    }

    return updatefields;
}

const injectionFairyLilyEffect1 = new Effect(['injectionFairyLily'], 1, 'battleCalc', true, 'none', 0, null);
const injectionFairyLilyEffect2 = new Effect(['injectionFairyLily'], 1, 'battleCalc', true, 'none', 0, null);

// ファイバーポッド
const fiberJarEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('ファイバーポッド');
    let updatefields = fields
    // ファイバーポッドを記録
    updatefields.players = await matchDataUpdate(playerId, opponentPlayerId, updatefields, selectTargetProps.turnCount, 'fiberJar');

    updatefields.players[playerId].matchData.usePlayer = playerId;

    // socket.emit('fiberJarResult', { fiberJarResult: matchData });

    // デッキにカードを戻す
    updatefields = await fiberJarHandle(socket, roomName, playerId, opponentPlayerId, updatefields, fieldsSetter);
    // let updatefields = fields
    console.log(updatefields)
    console.log(JSON.stringify(updatefields))
    // シャッフルする
    updatefields.deck = await shuffle(playerId, updatefields, fieldsSetter);
    updatefields.deck = await shuffle(opponentPlayerId, updatefields, fieldsSetter);
    socket.emit('deckShuffled', { roomName, playerId: playerId, updateDeck: updatefields.deck });
    await awaitTime(1000);
    socket.emit('shuffleAnimation', { roomName, playerId: playerId })
    socket.emit('shuffleAnimation', { roomName, playerId: opponentPlayerId })
    // await awaitTime(1800);
    // 五枚ドローする
    updatefields = await promiseDraw(socket, roomName, playerId, updatefields, 5);
    console.log('ファイバーポッド完全終了')
    return updatefields;
    
}

// インスタンスを分けないとeffectを更新したときに後から上書きされる
const fiberJarEffect1 = new Effect(['fiberJar'], 1, 'reverse', true, 'none', 0, null);
const fiberJarEffect2 = new Effect(['fiberJar'], 1, 'reverse', true, 'none', 0, null);

// ブレイドナイト 効果はないがもしものために
const bladeKnightEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('ブレイドナイト　効果ないよ～～～！！');
    return fields;
}

// canUseはfalseにしておいて発動不可にする
const bladeKnightEffect1 = new Effect(['bladeKnight'], 0, 'null', false, 'none', 0);
const bladeKnightEffect2 = new Effect(['bladeKnight'], 0, 'null', false, 'none', 0);


// カオス・ソルジャー －開闢の使者－ 除外効果
// リビングデッドの呼び声のリンクモンスターを除外した場合にはリビングデッドの呼び声は破壊されない
const blackLusterSoldier = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('カオス・ソルジャー －開闢の使者－');
    let updatefields = fields;

    const card = allCards[cardId];
    const targetCardId = card.effect.target
    console.log(targetCardId)
    if (targetCardId && allCards[targetCardId].location == 'monsterZone') {

        // 両者のモンスターゾーンから選択
        // const targets = updatefields.monsterZone[playerId].concat(updatefields.monsterZone[opponentPlayerId]).filter(id => id != null);
        // if (targets.length != 0) {
        //     const targetCardId = await asyncSelectCard(socket, cardId, targets, selectTargetProps);
            // 対象がリビングデッドの呼び声の装備先であればリンクを外してリビデの誘発が発動しないように
        if (allCards[targetCardId].link.length != 0 &&
            allCards[targetCardId].link.some((id)=>allCards[id].name == "リビングデッドの呼び声")) {
            // ここの設定
            const livingDeadId = allCards[targetCardId].link.find((id) => allCards[id].name == "リビングデッドの呼び声");
            socket.emit('unlink', { roomName, cardId: targetCardId, unlinkCardId: livingDeadId });
            socket.emit('unlink', { roomName, cardId: livingDeadId, unlinkCardId:targetCardId });
            await unlink(targetCardId, livingDeadId)
            await unlink(livingDeadId, targetCardId)

        }
        
        updatefields = await monsterBanish(updatefields, fieldsSetter, targetCardId);
        socket.emit('monsterBanish', { roomName, cardId: targetCardId });
    }
    card.effect.target = null
    console.log(targetCardId)


    allCards[cardId].attackable = false;
    allCards[cardId].effect.canUse = false;

    return updatefields;
}
// 開闢の再攻撃効果
const blackLusterSoldier2 = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    allCards[cardId].effect.canUse = false;
    return fields;

}
const blackLusterSoldierEffect1 = new Effect(['blackLusterSoldier', 'blackLusterSoldier2'], 1, 'ignition', true, 'none', 0, null);
const blackLusterSoldierEffect2 = new Effect(['blackLusterSoldier', 'blackLusterSoldier2'], 1, 'ignition', true, 'none', 0, null);

// 魔導戦士ブレイカー
// 初期値は-1通常召喚時はカウンター0,消費後は-1になる。
const breakerTheMagicalWarriorEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('魔導戦士ブレイカー');
    let updatefields = fields;
    const card = allCards[cardId];

    const targetCardId = card.effect.target
    console.log(targetCardId)

    // card.counter = -1;
    // card.effect.canUse = false;
    // socket.emit('removeCounter', { roomName, cardId: cardId });

    // const mySpellTrapZone = fields.spellTrapZone[playerId];
    // const oppoSpellTrapZone = fields.spellTrapZone[opponentPlayerId];
    // const targets = mySpellTrapZone.concat(oppoSpellTrapZone).filter(id => id != null);
    // // ターゲットとして指定
    // console.log('選択可能カードは', targets)
    if (targetCardId && allCards[targetCardId].location == 'spellTrapZone') {
        // emitを使いクリックされたカードを受け取る
        // const targetCardId = await asyncSelectCard(socket, cardId, targets, selectTargetProps);
    
    
        // 破壊処理を相手に通知
        socket.emit('destroy', { roomName, fields: updatefields, playerId: allCards[targetCardId].owner, cardId: targetCardId });
        updatefields = await destroy(allCards[targetCardId].owner, fields, fieldsSetter, targetCardId);
        // 強奪が破壊された場合はサイドエフェクトではなく即時コントロールを返す
        if (allCards[targetCardId].name == "強奪" && allCards[targetCardId].link.length != 0 && allCards[allCards[targetCardId].link[0]].location == "monsterZone") {
            updatefields = await snatchStealEffectDetail2(socket, roomName, targetCardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps);
        }
        if (allCards[targetCardId].name == "早すぎた埋葬" && allCards[targetCardId].link.length != 0 && allCards[allCards[targetCardId].link[0]].location == "monsterZone") {
            updatefields = await prematureBurialEffectDetail2(socket, roomName, targetCardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps);
        }
        if (allCards[targetCardId].name == "リビングデッドの呼び声" && allCards[targetCardId].link.length != 0 && allCards[allCards[targetCardId].link[0]].location == "monsterZone") {
            updatefields = await CallOfTheHauntedEffectDetail2(socket, roomName, targetCardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps);
        }
    }
    card.effect.target = null
    console.log(targetCardId)
    return updatefields;
}
// 魔導戦士ブレイカー2
const breakerTheMagicalWarriorEffectDetail2 = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('魔導戦士ブレイカー');
    const card = allCards[cardId];
    if (card.location == 'monsterZone') {
        card.counter = 1;
        card.effect.canUse = true;
        socket.emit('putCounter', { roomName, cardId: cardId });
    }

    return fields;
}

const breakerTheMagicalWarriorEffect1 = new Effect(['breakerTheMagicalWarrior', 'breakerTheMagicalWarrior2'], 1, 'ignition', false, 'none', 0, null);
const breakerTheMagicalWarriorEffect2 = new Effect(['breakerTheMagicalWarrior', 'breakerTheMagicalWarrior2'], 1, 'ignition', false, 'none', 0, null);




// 苦渋の選択
const PainfulChoiceEffectDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('苦渋の選択');
    let updatefields = fields
    const myDeck = updatefields.deck[playerId];
    if (myDeck.length >= 5) {
        const cardTypeOrder = { 'Monster': 1, 'Spell': 2, 'Trap': 3 };

        const sortedDeck = [...myDeck].sort((a, b) => {
            const cardA = allCards[a];
            const cardB = allCards[b];

            // cardTypeで比較
            if (cardTypeOrder[cardA.cardtype] !== cardTypeOrder[cardB.cardtype]) {
                return cardTypeOrder[cardA.cardtype] - cardTypeOrder[cardB.cardtype];
            }

            // Monsterカードの場合、levelで比較
            if (cardA.cardtype === 'Monster' && cardB.cardtype === 'Monster') {
                if (cardA.level === cardB.level) {
                    // typeで比較 (localeCompareの代わりに比較演算子を使用)
                    if (cardA.type < cardB.type) return -1;
                    if (cardA.type > cardB.type) return 1;
                    return 0;
                } else {
                    return cardA.level - cardB.level;
                }
            }

        });
        let targets = await selectCards(sortedDeck, 5, selectTargetProps.setHoverCardId, cardId, playerId);
        // 相手に一枚選ばせる
        selectTargetProps.setOppoChoicing(true)
        const searchCard = await selectOppo(socket, roomName, targets, 1, selectTargetProps.setOppoChoicing, cardId);
        console.log(targets, searchCard[0])
        // 選ばれたカード以外は墓地へ
        let targetsToGrave = targets.filter((cardId) => cardId != searchCard[0]);
        console.log(targets)

        const message = "相手が" + allCards[searchCard[0]].name + "を手札に加えました"
        socket.emit('messagePopUp', { roomName, message: message });

        let messageLog = '苦渋の選択によって' + allCards[searchCard[0]].name + "を手札に加えました";
        socket.emit('messageLog', { roomName: roomName, type: 'battleLogEffectDetail', playerId: playerId, message: messageLog })
        // 苦渋の選択を使ったらその時点でのデータを取得
        const playersMatchData = await matchDataUpdate(playerId, opponentPlayerId, fields, selectTargetProps.turnCount, 'painfulChoice');

        let matchData = playersMatchData[playerId].matchData
        matchData.painfulChoice1 = targets[0]
        matchData.painfulChoice2 = targets[1]
        matchData.painfulChoice3 = targets[2]
        matchData.painfulChoice4 = targets[3]
        matchData.painfulChoice5 = targets[4]
        matchData.painfulChoiceResult = searchCard[0];
        matchData.usePlayer = playerId;
        // 苦渋の選択使用時点でのデータを送信しサーバーに保存
        socket.emit('painfulChoiceResult', { painfulChoiceResult: matchData });
    
        socket.emit('deckToGraveyard', { roomName, targets: targetsToGrave });
        
        updatefields = await deckToGraveyard(updatefields, fieldsSetter, targetsToGrave);
        updatefields = await searcher(playerId, updatefields, fieldsSetter, searchCard[0]);
    
        socket.emit('search', { roomName, playerId: playerId, cardId: searchCard[0] });
        // デッキをシャッフル
        updatefields.deck = await shuffle(playerId, updatefields, fieldsSetter);
        // await awaitTime(1800);
        console.log(updatefields.deck)
        // 自分と相手でシャッフルすると整合性が取れないのでシャッフルした物を相手に渡してシャッフルした風にする
        socket.emit('deckShuffled', { roomName, playerId: playerId, updateDeck: updatefields.deck });
        // 終わったあとにシャッフルするために遅延
        setTimeout(() => {
            socket.emit('shuffleAnimation', { roomName, playerId: playerId })
        }, 1000); // ここではアニメーションの持続時間を1秒(1000ミリ秒)と仮定
    
        console.log(updatefields)
    }

    return updatefields;
}

const PainfulChoiceEffect1 = new Effect(['PainfulChoice'], 1, 'normalSpell', true, 'none', 0, null);
const PainfulChoiceEffect2 = new Effect(['PainfulChoice'], 1, 'normalSpell', true, 'none', 0, null);


const sheepTokenEffect = new Effect([''], 0, 'null', false, 'none', 0);



const cardEffects = {
    "PotOfGreed": PotOfGreedEffectDetail,
    "exiledForce": exiledForceEffectDetail,
    'mysticalSpaceTyphoon': mysticalSpaceTyphoonEffectDetail,
    'reinforcementOfTheArmy': reinforcementOfTheArmyEffectDetail,
    'changeOfHeart': changeOfHeartEffectDetail,
    'lightningVortex': lightningVortexEffectDetail,
    'heavyStorm': heavyStormEffectDetail,
    'confiscation': confiscationEffectDetail,
    'theForcefulSentry': theForcefulSentryEffectDetail,
    'exarionUniverse': exarionUniverseEffectDetail,
    'swordsOfRevealingLight': swordsOfRevealingLightEffectDetail,
    'magicianOfFaith': magicianOfFaithEffectDetail,
    'noblemanOfCrossout': noblemanOfCrossoutEffectDetail,
    'airknightParshath': airknightParshathEffectDetail,
    'ringOfDestruction': ringOfDestructionEffectDetail,
    'CallOfTheHaunted': CallOfTheHauntedEffectDetail,
    'CallOfTheHaunted2': CallOfTheHauntedEffectDetail2,
    'CallOfTheHaunted3': CallOfTheHauntedEffectDetail3,
    'prematureBurial': prematureBurialEffectDetail,
    'prematureBurial2': prematureBurialEffectDetail2,
    'snatchSteal': snatchStealEffectDetail,
    'snatchSteal2': snatchStealEffectDetail2,
    'snatchSteal3': snatchStealEffectDetail3,
    'sakuretsuArmor': sakuretsuArmorEffectDetail,
    'torrentialTribute': torrentialTributeEffectDetail,
    'bottomlessTrapHole': bottomlessTrapHoleEffectDetail,
    'dustTornado': dustTornadoEffectDetail,
    'scapeGoat': scapeGoatEffectDetail,
    'sinisterSSerpent': sinisterSSerpentEffectDetail,
    'tribeInfectingVirus': tribeInfectingVirusEffectDetail,
    'donZaloog': donZaloogEffectDetail,
    'DDWarriorLady': DDWarriorLadyEffectDetail,
    'kycooTheGhostDestroyer': kycooTheGhostDestroyerEffectDetail,
    'Jinzo': JinzoEffectDetail,
    'spiritReaper': spiritReaperEffectDetail,
    'spiritReaper2': spiritReaperEffectDetail2,
    'injectionFairyLily': injectionFairyLilyEffectDetail,
    'fiberJar': fiberJarEffectDetail,
    'bladeKnight': bladeKnightEffectDetail,
    'blackLusterSoldier': blackLusterSoldier,
    'blackLusterSoldier2': blackLusterSoldier2,
    'PainfulChoice': PainfulChoiceEffectDetail,
    'breakerTheMagicalWarrior': breakerTheMagicalWarriorEffectDetail,
    'breakerTheMagicalWarrior2': breakerTheMagicalWarriorEffectDetail2
};

const exarionUniverseText = "イグザリオン・ユニバース\n☆4 効果モンスター/ 闇属性/ 獣戦士族\n自分のターンのバトルステップ時に発動することができる。このカードの攻撃力を400ポイントダウンして守備表示モンスターを攻撃したときにその守備力を攻撃力が超えていれば、その数値だけ相手に戦闘ダメージを与える。この効果は発動ターンのエンドフェイズ時まで続く。\n攻1800/守1900"
const exiledForceText = "ならず者傭兵部隊\n☆4 効果モンスター/ 地属性/ 戦士族\nこのカードを生贄に捧げる。フィールド上のモンスター1体を破壊する。\n攻1000/守1000"
const PotOfGreedText = "強欲な壺\n 通常魔法\nデッキからカードを2枚ドローする"
const PainfulChoiceText = "苦渋の選択\n通常魔法\n自分のデッキからカードを5枚選択して相手に見せる。相手はその中から1枚を選択する。相手が選択したカード1枚を自分の手札に加え、残りのカードを墓地へ捨てる。"
const reinforcementOfTheArmyText = "増援\n通常魔法\n自分のデッキからレベル4以下の戦士族モンスター1体を手札に加える。"
const changeOfHeartText = "心変わり\n通常魔法\nターン終了時まで、フィールド上の相手モンスター1体(表示形式は問わない)のコントロールを得ることができ、自分のカードのように使用できる。"
const lightningVortexText = "ライトニング・ボルテックス\n通常魔法\n手札を1枚捨てる。相手フィールド上に表側表示で存在するモンスターを全て破壊する。"
const heavyStormText = "大嵐\n通常魔法\nフィールド上の魔法・罠カードを全て破壊する。"
const confiscationText = "押収\n通常魔法\n1000ポイントライフを払う。相手の手札を見てその中からカードを1枚選んで墓地に捨てる。"
const theForcefulSentryText = "強引な番兵\n通常魔法\n相手の手札を見る。その中からカードを1枚選んで相手のデッキに戻す。その後、デッキをシャッフルする。"
const swordsOfRevealingLightText = "光の護封剣\n通常魔法\n相手フィールド上に存在する全てのモンスターを表側表示にする。このカードは発動後(相手ターンで数えて)3ターンの間フィールド上に残り続ける。このカードがフィールド上に存在する限り、相手フィールド上モンスターは攻撃宣言を行うことができない。"
const noblemanOfCrossoutText = "抹殺の使徒\n通常魔法\n裏側表示のモンスター1体を破壊し、ゲームから除外する。もしそれがリバース効果モンスターだった場合お互いのデッキを確認し、破壊したモンスターと同名カードを全てゲームから除外する。その後デッキをシャッフルする。"
const magicianOfFaithText = "聖なる魔術師\n☆1 リバースモンスター/ 光属性/ 魔法使い族\nリバース:自分の墓地から魔法カードを1枚選択する。選択したカードを自分の手札に加える。\n攻300/守400"
const airknightParshathText = "天空騎士パーシアス\n☆5 効果モンスター/ 光属性/ 天使族\n守備表示モンスター攻撃時、その守備力を攻撃力が超えていれば、その数値だけ相手に戦闘ダメージを与える。また、このカードが相手プレイヤーに戦闘ダメージを与えたとき、自分はカードを1枚ドローする。\n攻1900/守1400"
const ringOfDestructionText = "破壊輪\n通常罠\nフィールド上に表側表示で存在するモンスター1体を破壊し、お互いにその攻撃力分のダメージを受ける。"
const CallOfTheHauntedText = "リビングデッドの呼び声\n永続罠\n自分の墓地からモンスター1体を選択し、攻撃表示で特殊召喚する。このカードがフィールド上に存在しなくなった時、そのモンスターを破壊する。そのモンスターが破壊された時このカードを破壊する。"
const prematureBurialText = "早すぎた埋葬\n装備魔法\n800ライフポイントを払う。自分の墓地からモンスターカードを1体選択して攻撃表示でフィールド上に特殊召喚し、このカードを装備する。このカードが破壊された時、装備モンスターを破壊する。"
const snatchStealText = "強奪\n装備魔法\nこのカードを装備した相手モンスターのコントロールを得る。相手のスタンバイフェイズ毎に、相手は1000ライフポイントを回復する。"
const sakuretsuArmorText = "炸裂装甲\n通常罠\n相手モンスターの攻撃宣言時に発動することができる。その攻撃モンスター1体を破壊する。"
const torrentialTributeText = "激流葬\n通常罠\nモンスターが召喚・反転召喚・特殊召喚された時に発動可能。フィールド上のモンスターを全て破壊する。"
const bottomlessTrapHoleText = "奈落の落とし穴\n通常罠\n相手が攻撃力1500以上のモンスターを召喚・反転召喚・特殊召喚した時、そのモンスターを破壊しゲームから除外する。"
const dustTornadoText = "砂塵の大竜巻\n通常罠\n相手フィールド上の魔法または罠カード1枚を破壊する。破壊したあと、自分の手札から魔法か罠カード1枚をセットすることができる。"
const scapeGoatText = "スケープゴート\n速攻魔法\nこのカードを発動するターン、自分は召喚・反転召喚・特殊召喚することはできない。自分フィールド上に「羊トークン」(獣族・地・攻/守 0)4体を守備表示で特殊召喚する。このトークンはアドバンス召喚のためにはリリースできない。"
const sinisterSSerpentText = "キラースネーク\n☆1 効果モンスター/ 水属性/ 爬虫類族\n自分のスタンバイフェイズ時にこのカードが墓地に存在している場合、このカードを手札に戻すことができる。\n攻300/守250"
const tribeInfectingVirusText = "同族感染ウイルス\n☆4 効果モンスター/ 水属性/ 水族\n手札を1枚捨てて種族を1つ宣言する。自分と相手フィールド上に表側表示で存在する宣言した種族のモンスターを全て破壊する。\n攻1600/守1000"
const donZaloogText = "首領・ザルーグ\n☆4 効果モンスター/ 闇属性/ 戦士族\nこのカードが相手プレイヤーに戦闘ダメージを与えた時、次の効果から1つを選択して発動する事ができる。\n●相手の手札をランダムに1枚選択して捨てる。\n●相手のデッキの上から2枚を墓地へ送る。\n攻1400/守1500"
const DDWarriorLadyText = "異次元の女戦士\n☆4 効果モンスター/ 光属性/ 戦士族\nこのカードが相手モンスターと戦闘を行った時、相手モンスターとこのカードをゲームから除外する事ができる。\n攻1500/守1600"
const kycooTheGhostDestroyerText = "霊滅術師カイクウ\n☆4 効果モンスター/ 闇属性/ 魔法使い族\nこのカードが相手に戦闘ダメージを与える度に、相手墓地から2枚までモンスターを除外する事ができる。またこのカードがフィールド上に存在する限り、相手は墓地のカードをゲームから除外する事はできない。\n攻1800/守700"
const JinzoText = "人造人間－サイコ・ショッカー\n☆6 効果モンスター/ 闇属性/ 機械族\nこのカードがフィールド上に表側表示で存在する限り罠カードは発動できず、すべてのフィールド上罠カードの効果は無効になる。\n攻2400/守1500"
const spiritReaperText = "魂を削る死霊\n☆3 効果モンスター/ 闇属性/ アンデッド族\nこのカードは戦闘によっては破壊されない。魔法・罠・効果モンスターの効果の対象になった時、このカードを破壊する。このカードが相手プレイヤーへの直接攻撃に成功した場合、相手はランダムに手札を1枚捨てる。\n攻300/守200"
const injectionFairyLilyText = "お注射天使リリー\n☆3 効果モンスター/ 地属性/ 魔法使い族\nこのカードが自分・相手のターンに戦闘を行う場合、そのダメージステップ時に発動する事ができる。2000ライフポイントを払う事で、このカードの攻撃力はダメージ計算時のみ3000ポイントアップする。\n攻400/守1500"
const fiberJarText = "ファイバーポッド\n☆3 リバースモンスター/ 地属性/ 植物族\nリバース:お互いにフィールド上カードと手札と墓地のカードをデッキと合わせてシャッフルする。その後デッキからカードを5枚ドローする。\n攻500/守500"
const bladeKnightText = "ブレイドナイト\n☆4 効果モンスター/ 光属性/ 戦士族\n自分の手札が1枚以下の場合、フィールド上のこのカードの攻撃力は400ポイントアップする。また、自分フィールド上モンスターがこのカードしか存在しない時、このカードが戦闘で破壊したリバース効果モンスターの効果は無効化される。\n攻1600/守1000"
const blackLusterSoldierText = "カオス・ソルジャー －開闢の使者－\n☆8 効果モンスター/ 光属性/ 戦士族\nこのカードは通常召喚できない。自分の墓地の光属性と闇属性モンスターを1体ずつゲームから除外して特殊召喚する。自分のターンに一度だけ、次の効果から1つを選択して発動する事ができる。\n●フィールド上に存在するモンスター1体をゲームから除外する。この効果を発動する場合、このターンこのカードは攻撃する事ができない。\n●このカードが戦闘によって相手モンスターを破壊した場合、もう一度だけ続けて攻撃を行う事ができる。\n攻3000/守2500"
const mysticalSpaceTyphoonText = "サイクロン\n速攻魔法\nフィールド上の魔法または罠カード1枚を破壊する。"
const breakerTheMagicalWarriorText = "魔導戦士ブレイカー\n☆4 効果モンスター/ 闇属性/ 魔法使い族\nこのカードが召喚に成功した時、このカードに魔力カウンターを1個乗せる(最大1個まで)。このカードに乗っている魔力カウンター1個につき、このカードの攻撃力は300ポイントアップする。また、その魔力カウンターを1個取り除く事で、フィールド上の魔法・罠カード1枚を破壊する。\n攻1600/守1000"
const sheepTokenText = "羊トークン\n☆1 トークン\n地属性\n獣族\nこのカードはトークンとして使用することができる。\n攻0/守0 "

const allCards = {
    '1': new Monster(1, '聖なる魔術師', magicianOfFaithEffect1, 'Monster', magicianOfFaithText, './04picture/Magician of Faith.jpg', 'none', 'deck', '', '', true, null, 1, 300, 400, 'wizard', 'light', [], 0, true, ''),
    '2': new Monster(2, '聖なる魔術師', magicianOfFaithEffect2, 'Monster', magicianOfFaithText, './04picture/Magician of Faith.jpg', 'none', 'deck', '', '', true, null, 1, 300, 400, 'wizard', 'light', [], 0, true, ''),
    '3': new Monster(3, 'キラースネーク', sinisterSSerpentEffect1, 'Monster', sinisterSSerpentText, './04picture/Sinister Serpent.jpg', 'none', 'deck', '', '', true, null, 1, 300, 250, 'repyile', 'water', [], 0, true, ''),
    '4': new Monster(4, '人造人間－サイコ・ショッカー', JinzoEffect1, 'Monster', JinzoText, './04picture/Jinzo.jpg', 'none', 'deck', '', '', true, null, 6, 2400, 1500, 'machine', 'dark', [], 0, true, ''),
    '5': new Monster(5, '霊滅術師カイクウ', kycooTheGhostDestroyerEffect1, 'Monster', kycooTheGhostDestroyerText, './04picture/Kycoo the Ghost Destroyer.jpg', 'none', 'deck', '', '', true, null, 4, 1800, 700, 'wizard', 'dark', [], 0, true, ''),
    '6': new Monster(6, 'ならず者傭兵部隊', exiledForceEffect1, 'Monster', exiledForceText, './04picture/Exiled Force.jpg', 'none', 'deck', '', '', true, null, 4, 1000, 1000, 'soldier', 'earth', [], 0, true, ''),
    '7': new Monster(7, 'ファイバーポッド', fiberJarEffect1, 'Monster', fiberJarText, './04picture/Fiber Jar.jpg', 'none', 'deck', '', '', true, null, 3, 500, 500, 'plant', 'earth', [], 0, true, ''),
    '8': new Monster(8, 'お注射天使リリー', injectionFairyLilyEffect1, 'Monster', injectionFairyLilyText, './04picture/Injection Fairy Lily.jpg', 'none', 'deck', '', '', true, null, 3, 400, 1500, 'wizard', 'earth', [], 0, true, ''),
    '9': new Monster(9, '天空騎士パーシアス', airknightParshathEffect1, 'Monster', airknightParshathText, './04picture/Airknight Parshath.jpg', 'none', 'deck', '', '', true, null, 5, 1900, 1400, 'fairy', 'light', [], 0, true, ''),
    '10': new Monster(10, 'イグザリオン・ユニバース', exarionUniverseEffect1, 'Monster', exarionUniverseText, './04picture/Exarion Universe.jpg', 'none', 'deck', '', '', true, null, 4, 1800, 1900, 'beastWarrior', 'dark', [], 0, true, ''),
    '11': new Monster(11, '首領・ザルーグ', donZaloogEffect1, 'Monster', donZaloogText, './04picture/Don Zaloog.jpg', 'none', 'deck', '', '', true, null, 4, 1400, 1500, 'soldier', 'dark', [], 0, true, ''),
    '12': new Monster(12, '魂を削る死霊', spiritReaperEffect1, 'Monster', spiritReaperText, './04picture/Spirit Reaper.jpg', 'none', 'deck', '', '', true, null, 3, 300, 200, 'zombie', 'dark', [], 0, true, ''),
    '13': new Monster(13, 'ブレイドナイト', bladeKnightEffect1, 'Monster', bladeKnightText, './04picture/Blade Knight.jpg', 'none', 'deck', '', '', true, null, 4, 1600, 1000, 'soldier', 'light', [], 0, true, ''),
    '14': new Monster(14, '魔導戦士ブレイカー', breakerTheMagicalWarriorEffect1, 'Monster', breakerTheMagicalWarriorText, './04picture/Breaker the Magical Warrior.jpg', 'none', 'deck', '', '', true, null, 4, 1600, 1000, 'wizard', 'dark', [], -1, true, ''),
    '15': new Monster(15, '同族感染ウイルス', tribeInfectingVirusEffect1, 'Monster', tribeInfectingVirusText, './04picture/Tribe-Infecting Virus.jpg', 'none', 'deck', '', '', true, null, 4, 1600, 1000, 'water', 'water', [], 0, true, ''),
    '16': new Monster(16, '異次元の女戦士', DDWarriorLadyEffect1, 'Monster', DDWarriorLadyText, './04picture/D.D. Warrior Lady.jpg', 'none', 'deck', '', '', true, null, 4, 1500, 1600, 'soldier', 'light', [], 0, true, ''),
    '17': new Monster(17, '異次元の女戦士', DDWarriorLadyEffect2, 'Monster', DDWarriorLadyText, './04picture/D.D. Warrior Lady.jpg', 'none', 'deck', '', '', true, null, 4, 1500, 1600, 'soldier', 'light', [], 0, true, ''),
    '18': new Monster(18, '異次元の女戦士', DDWarriorLadyEffect3, 'Monster', DDWarriorLadyText, './04picture/D.D. Warrior Lady.jpg', 'none', 'deck', '', '', true, null, 4, 1500, 1600, 'soldier', 'light', [], 0, true, ''),
    '19': new Monster(19, 'カオス・ソルジャー －開闢の使者－', blackLusterSoldierEffect1, 'Monster', blackLusterSoldierText, './04picture/Black Luster Soldier - Envoy of the Beginning.jpg', 'none', 'deck', '', '', true, null, 8, 3000, 2500, 'soldier', 'light', [], 0, true, ''),
    '20': new Spell(20, '光の護封剣', swordsOfRevealingLightEffect1, 'Spell', swordsOfRevealingLightText, './04picture/Swords of Revealing Light.jpg', 'none', 'deck', '', '', false, null, 'swordsOfRevealingLight', [], 0),
    '21': new Spell(21, '強欲な壺', PotOfGreedEffect1, 'Spell', PotOfGreedText, './04picture/Pot of Greed.jpg', 'none', 'deck', '', '', false, null, 'normal', [], 0),
    '22': new Spell(22, '心変わり', changeOfHeartEffect1, 'Spell', changeOfHeartText, './04picture/Change of Heart.jpg', 'none', 'deck', '', '', false, null, 'normal', [], 0),
    '23': new Spell(23, '大嵐', heavyStormEffect1, 'Spell', heavyStormText, './04picture/Heavy Storm.jpg', 'none', 'deck', '', '', false, null, 'normal', [], 0),
    '24': new Spell(24, '強奪', snatchStealEffect1, 'Spell', snatchStealText, './04picture/Snatch Steal.jpg', 'none', 'deck', '', '', false, null, 'equip', [], 0),
    '25': new Spell(25, '押収', confiscationEffect1, 'Spell', confiscationText, './04picture/CONFISCATION.jpg', 'none', 'deck', '', '', false, null, 'normal', [], 0),
    '26': new Spell(26, '強引な番兵', theForcefulSentryEffect1, 'Spell', theForcefulSentryText, './04picture/The Forceful Sentry.jpg', 'none', 'deck', '', '', false, null, 'normal', [], 0),
    '27': new Spell(27, 'サイクロン', mysticalSpaceTyphoonEffect1, 'Spell', mysticalSpaceTyphoonText, './04picture/Mystical Space Typhoon.jpg', 'none', 'deck', '', '', false, null, 'quick', [], 0),
    '28': new Spell(28, '苦渋の選択', PainfulChoiceEffect1, 'Spell', PainfulChoiceText, './04picture/PAINFUL CHOICE.jpg', 'none', 'deck', '', '', false, null, 'normal', [], 0),
    '29': new Spell(29, '抹殺の使徒', noblemanOfCrossoutEffect1, 'Spell', noblemanOfCrossoutText, './04picture/Nobleman of Crossout.jpg', 'none', 'deck', '', '', false, null, 'normal', [], 0),
    '30': new Spell(30, '早すぎた埋葬', prematureBurialEffect1, 'Spell', prematureBurialText, './04picture/Premature Burial.jpg', 'none', 'deck', '', '', false, null, 'equip', [], 0),
    '31': new Spell(31, 'スケープゴート', scapeGoatEffect1, 'Spell', scapeGoatText, './04picture/Scapegoat.jpg', 'none', 'deck', '', '', false, null, 'quick', [], 0),
    '32': new Spell(32, '増援', reinforcementOfTheArmyEffect1, 'Spell', reinforcementOfTheArmyText, './04picture/Reinforcement of the Army.jpg', 'none', 'deck', '', '', false, null, 'normal', [], 0),
    '33': new Spell(33, 'ライトニング・ボルテックス', lightningVortexEffect1, 'Spell', lightningVortexText, './04picture/Lightning Vortex.jpg', 'none', 'deck', '', '', false, null, 'normal', [], 0),
    '34': new Trap(34, '砂塵の大竜巻', dustTornadoEffect1, 'Trap', dustTornadoText, './04picture/Dust Tornado.jpg', 'none', 'deck', '', '', false, null, 'none', []),
    '35': new Trap(35, 'リビングデッドの呼び声', CallOfTheHauntedEffect1, 'Trap', CallOfTheHauntedText, './04picture/Call of the Haunted.jpg', 'none', 'deck', '', '', false, null, 'continuous', []),
    '36': new Trap(36, '破壊輪', ringOfDestructionEffect1, 'Trap', ringOfDestructionText, './04picture/Ring of Destruction.jpg', 'none', 'deck', '', '', false, null, 'none', []),
    '37': new Trap(37, '激流葬', torrentialTributeEffect1, 'Trap', torrentialTributeText, './04picture/Torrential Tribute.jpg', 'none', 'deck', '', '', false, null, 'none', []),
    '38': new Trap(38, '奈落の落とし穴', bottomlessTrapHoleEffect1, 'Trap', bottomlessTrapHoleText, './04picture/Bottomless Trap Hole.jpg', 'none', 'deck', '', '', false, null, 'none', []),
    '39': new Trap(39, '炸裂装甲', sakuretsuArmorEffect1, 'Trap', sakuretsuArmorText, './04picture/Sakuretsu Armor.jpg', 'none', 'deck', '', '', false, null, 'none', []),
    '40': new Trap(40, '炸裂装甲', sakuretsuArmorEffect2, 'Trap', sakuretsuArmorText, './04picture/Sakuretsu Armor.jpg', 'none', 'deck', '', '', false, null, 'none', []),
    '41': new Monster(41, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
    '42': new Monster(42, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
    '43': new Monster(43, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
    '44': new Monster(44, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
    '45': new Monster(45, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
    '46': new Monster(46, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
    '47': new Monster(47, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
    '48': new Monster(48, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
    '49': new Monster(49, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
    '50': new Monster(50, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
    '51': new Monster(51, '聖なる魔術師', magicianOfFaithEffect3, 'Monster', magicianOfFaithText, './04picture/Magician of Faith.jpg', 'none', 'deck', '', '', true, null, 1, 300, 400, 'wizard', 'light', [], 0, true, ''),
    '52': new Monster(52, '聖なる魔術師', magicianOfFaithEffect4, 'Monster', magicianOfFaithText, './04picture/Magician of Faith.jpg', 'none', 'deck', '', '', true, null, 1, 300, 400, 'wizard', 'light', [], 0, true, ''),
    '53': new Monster(53, 'キラースネーク', sinisterSSerpentEffect2, 'Monster', sinisterSSerpentText, './04picture/Sinister Serpent.jpg', 'none', 'deck', '', '', true, null, 1, 300, 250, 'repyile', 'water', [], 0, true, ''),
    '54': new Monster(54, '人造人間－サイコ・ショッカー', JinzoEffect2, 'Monster', JinzoText, './04picture/Jinzo.jpg', 'none', 'deck', '', '', true, null, 6, 2400, 1500, 'machine', 'dark', [], 0, true, ''),
    '55': new Monster(55, '霊滅術師カイクウ', kycooTheGhostDestroyerEffect2, 'Monster', kycooTheGhostDestroyerText, './04picture/Kycoo the Ghost Destroyer.jpg', 'none', 'deck', '', '', true, null, 4, 1800, 700, 'wizard', 'dark', [], 0, true, ''),
    '56': new Monster(56, 'ならず者傭兵部隊', exiledForceEffect2, 'Monster', exiledForceText, './04picture/Exiled Force.jpg', 'none', 'deck', '', '', true, null, 4, 1000, 1000, 'soldier', 'earth', [], 0, true, ''),
    '57': new Monster(57, 'ファイバーポッド', fiberJarEffect2, 'Monster', fiberJarText, './04picture/Fiber Jar.jpg', 'none', 'deck', '', '', true, null, 3, 500, 500, 'plant', 'earth', [], 0, true, ''),
    '58': new Monster(58, 'お注射天使リリー', injectionFairyLilyEffect2, 'Monster', injectionFairyLilyText, './04picture/Injection Fairy Lily.jpg', 'none', 'deck', '', '', true, null, 3, 400, 1500, 'wizard', 'earth', [], 0, true, ''),
    '59': new Monster(59, '天空騎士パーシアス', airknightParshathEffect2, 'Monster', airknightParshathText, './04picture/Airknight Parshath.jpg', 'none', 'deck', '', '', true, null, 5, 1900, 1400, 'fairy', 'light', [], 0, true, ''),
    '60': new Monster(60, 'イグザリオン・ユニバース', exarionUniverseEffect2, 'Monster', exarionUniverseText, './04picture/Exarion Universe.jpg', 'none', 'deck', '', '', true, null, 4, 1800, 1900, 'beastWarrior', 'dark', [], 0, true, ''),
    '61': new Monster(61, '首領・ザルーグ', donZaloogEffect2, 'Monster', donZaloogText, './04picture/Don Zaloog.jpg', 'none', 'deck', '', '', true, null, 4, 1400, 1500, 'soldier', 'dark', [], 0, true, ''),
    '62': new Monster(62, '魂を削る死霊', spiritReaperEffect2, 'Monster', spiritReaperText, './04picture/Spirit Reaper.jpg', 'none', 'deck', '', '', true, null, 3, 300, 200, 'zombie', 'dark', [], 0, true, ''),
    '63': new Monster(63, 'ブレイドナイト', bladeKnightEffect2, 'Monster', bladeKnightText, './04picture/Blade Knight.jpg', 'none', 'deck', '', '', true, null, 4, 1600, 1000, 'soldier', 'light', [], 0, true, ''),
    '64': new Monster(64, '魔導戦士ブレイカー', breakerTheMagicalWarriorEffect2, 'Monster', breakerTheMagicalWarriorText, './04picture/Breaker the Magical Warrior.jpg', 'none', 'deck', '', '', true, null, 4, 1600, 1000, 'wizard', 'dark', [], -1, true, ''),
    '65': new Monster(65, '同族感染ウイルス', tribeInfectingVirusEffect2, 'Monster', tribeInfectingVirusText, './04picture/Tribe-Infecting Virus.jpg', 'none', 'deck', '', '', true, null, 4, 1600, 1000, 'water', 'water', [], 0, true, ''),
    '66': new Monster(66, '異次元の女戦士', DDWarriorLadyEffect4, 'Monster', DDWarriorLadyText, './04picture/D.D. Warrior Lady.jpg', 'none', 'deck', '', '', true, null, 4, 1500, 1600, 'soldier', 'light', [], 0, true, ''),
    '67': new Monster(67, '異次元の女戦士', DDWarriorLadyEffect5, 'Monster', DDWarriorLadyText, './04picture/D.D. Warrior Lady.jpg', 'none', 'deck', '', '', true, null, 4, 1500, 1600, 'soldier', 'light', [], 0, true, ''),
    '68': new Monster(68, '異次元の女戦士', DDWarriorLadyEffect6, 'Monster', DDWarriorLadyText, './04picture/D.D. Warrior Lady.jpg', 'none', 'deck', '', '', true, null, 4, 1500, 1600, 'soldier', 'light', [], 0, true, ''),
    '69': new Monster(69, 'カオス・ソルジャー －開闢の使者－', blackLusterSoldierEffect2, 'Monster', blackLusterSoldierText, './04picture/Black Luster Soldier - Envoy of the Beginning.jpg', 'none', 'deck', '', '', true, null, 8, 3000, 2500, 'soldier', 'light', [], 0, true, ''),
    '70': new Spell(70, '光の護封剣', swordsOfRevealingLightEffect2, 'Spell', swordsOfRevealingLightText, './04picture/Swords of Revealing Light.jpg', 'none', 'deck', '', '', false, null, 'swordsOfRevealingLight', [], 0),
    '71': new Spell(71, '強欲な壺', PotOfGreedEffect2, 'Spell', PotOfGreedText, './04picture/Pot of Greed.jpg', 'none', 'deck', '', '', false, null, 'normal', [], 0),
    '72': new Spell(72, '心変わり', changeOfHeartEffect2, 'Spell', changeOfHeartText, './04picture/Change of Heart.jpg', 'none', 'deck', '', '', false, null, 'normal', [], 0),
    '73': new Spell(73, '大嵐', heavyStormEffect2, 'Spell', heavyStormText, './04picture/Heavy Storm.jpg', 'none', 'deck', '', '', false, null, 'normal', [], 0),
    '74': new Spell(74, '強奪', snatchStealEffect2, 'Spell', snatchStealText, './04picture/Snatch Steal.jpg', 'none', 'deck', '', '', false, null, 'equip', [], 0),
    '75': new Spell(75, '押収', confiscationEffect2, 'Spell', confiscationText, './04picture/CONFISCATION.jpg', 'none', 'deck', '', '', false, null, 'normal', [], 0),
    '76': new Spell(76, '強引な番兵', theForcefulSentryEffect2, 'Spell', theForcefulSentryText, './04picture/The Forceful Sentry.jpg', 'none', 'deck', '', '', false, null, 'normal', [], 0),
    '77': new Spell(77, 'サイクロン', mysticalSpaceTyphoonEffect2, 'Spell', mysticalSpaceTyphoonText, './04picture/Mystical Space Typhoon.jpg', 'none', 'deck', '', '', false, null, 'quick', [], 0),
    '78': new Spell(78, '苦渋の選択', PainfulChoiceEffect2, 'Spell', PainfulChoiceText, './04picture/PAINFUL CHOICE.jpg', 'none', 'deck', '', '', false, null, 'normal', [], 0),
    '79': new Spell(79, '抹殺の使徒', noblemanOfCrossoutEffect2, 'Spell', noblemanOfCrossoutText, './04picture/Nobleman of Crossout.jpg', 'none', 'deck', '', '', false, null, 'normal', [], 0),
    '80': new Spell(80, '早すぎた埋葬', prematureBurialEffect2, 'Spell', prematureBurialText, './04picture/Premature Burial.jpg', 'none', 'deck', '', '', false, null, 'equip', [], 0),
    '81': new Spell(81, 'スケープゴート', scapeGoatEffect2, 'Spell', scapeGoatText, './04picture/Scapegoat.jpg', 'none', 'deck', '', '', false, null, 'quick', [], 0),
    '82': new Spell(82, '増援', reinforcementOfTheArmyEffect2, 'Spell', reinforcementOfTheArmyText, './04picture/Reinforcement of the Army.jpg', 'none', 'deck', '', '', false, null, 'normal', [], 0),
    '83': new Spell(83, 'ライトニング・ボルテックス', lightningVortexEffect2, 'Spell', lightningVortexText, './04picture/Lightning Vortex.jpg', 'none', 'deck', '', '', false, null, 'normal', [], 0),
    '84': new Trap(84, '砂塵の大竜巻', dustTornadoEffect2, 'Trap', dustTornadoText, './04picture/Dust Tornado.jpg', 'none', 'deck', '', '', false, null, 'none', []),
    '85': new Trap(85, 'リビングデッドの呼び声', CallOfTheHauntedEffect2, 'Trap', CallOfTheHauntedText, './04picture/Call of the Haunted.jpg', 'none', 'deck', '', '', false, null, 'continuous', []),
    '86': new Trap(86, '破壊輪', ringOfDestructionEffect2, 'Trap', ringOfDestructionText, './04picture/Ring of Destruction.jpg', 'none', 'deck', '', '', false, null, 'none', []),
    '87': new Trap(87, '激流葬', torrentialTributeEffect2, 'Trap', torrentialTributeText, './04picture/Torrential Tribute.jpg', 'none', 'deck', '', '', false, null, 'none', []),
    '88': new Trap(88, '奈落の落とし穴', bottomlessTrapHoleEffect2, 'Trap', bottomlessTrapHoleText, './04picture/Bottomless Trap Hole.jpg', 'none', 'deck', '', '', false, null, 'none', []),
    '89': new Trap(89, '炸裂装甲', sakuretsuArmorEffect3, 'Trap', sakuretsuArmorText, './04picture/Sakuretsu Armor.jpg', 'none', 'deck', '', '', false, null, 'none', []),
    '90': new Trap(90, '炸裂装甲', sakuretsuArmorEffect4, 'Trap', sakuretsuArmorText, './04picture/Sakuretsu Armor.jpg', 'none', 'deck', '', '', false, null, 'none', []),
    '91': new Monster(91, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
    '92': new Monster(92, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
    '93': new Monster(93, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
    '94': new Monster(94, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
    '95': new Monster(95, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
    '96': new Monster(96, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
    '97': new Monster(97, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
    '98': new Monster(98, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
    '99': new Monster(99, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
    '100': new Monster(100, '羊トークン', sheepTokenEffect, 'Token', sheepTokenText, './04picture/goatToken.jpg', 'def', 'none', '', '', false, null, 1, 0, 0, 'beast', 'earth', [], 0, true, ''),
}

// ゲーム終了時などに初期状態へ戻す
const cleanUpAllCards = () => {
    for (let key in allCards) {
        const card = allCards[key];
        card.faceStatus = 'none'
        card.location = 'deck'
        card.controller = ''
        card.owner = ''
        card.position = null
        card.link = []
        if (card.cardtype == 'Monster') {
            card.canChange = true
            card.counter = 0
            card.uuid = ''
            card.attackable = true
            if (card.name == "お注射天使リリー") {
                card.attack = 400
            } else if (card.name == "イグザリオン・ユニバース") {
                card.attack = 1800
            }
        } else if (card.cardtype == 'Spell') {
            card.canChange = false
            card.counter = 0
        } else if (card.cardtype == 'Trap') {
            card.canChange = false
        }
        if (card.name != '魔導戦士ブレイカー' && card.name != 'ブレイドナイト' && card.name != '羊トークン' ) {
            card.effect.canUse = true
        } else {
            card.effect.canUse = false;
        }
        if (card.name == '魔導戦士ブレイカー') {
            card.counter = -1
        }
        if (card.name == '砂塵の大竜巻') {
            card.effect.costValue = 0
        }
    }
    
}

export { cardEffects, allCards, heavyStormEffectDetail, torrentialTributeEffectDetail, cleanUpAllCards };
