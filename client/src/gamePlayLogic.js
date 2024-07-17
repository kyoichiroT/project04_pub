import { allCards } from "./models/cards";
import { CardSelection, selectCards } from "./component/selectCard";
import { handleChain } from "./component/chainConfirm";
import { handleQuickEffect } from "./component/quickEffect";
import { handleSelectTarget } from "./component/selectTarget";
import { cardEffects } from "./models/cards";
import { v4 as uuidv4 } from 'uuid';
import { choice } from "./component/choice";
import { a } from "react-spring";
import e from "cors";
import { handleDisplayPrivateCards } from "./component/displayPrivateCards";
import displayArrow from "./component/arrow";
// import { FirstPersonControls } from "@react-three/drei";

// マッチデータの更新
const matchDataUpdate = async (playerId, opponentPlayerId, fields, turnCount, option) => {
    let updatefields = fields;
    let updatePlayers = updatefields.players;
    let matchData = updatePlayers[playerId].matchData
    let firstPlayer = '';
    let secondPlayer = '';
    if (matchData.firstPlayer == playerId) {
        firstPlayer = playerId;
        secondPlayer = opponentPlayerId;
    } else {
        firstPlayer = opponentPlayerId;
        secondPlayer = playerId;        
    }

    matchData.firstPlayerLP = updatePlayers[firstPlayer].hp;
    matchData.secondPlayerLP = updatePlayers[secondPlayer].hp;

    matchData.firstPlayer_monster_length = updatefields.monsterZone[firstPlayer].filter((cardId) => cardId != null).length;
    matchData.firstPlayer_monster1 = updatefields.monsterZone[firstPlayer][0];
    matchData.firstPlayer_monster2 = updatefields.monsterZone[firstPlayer][1];
    matchData.firstPlayer_monster3 = updatefields.monsterZone[firstPlayer][2];
    matchData.firstPlayer_monster4 = updatefields.monsterZone[firstPlayer][3];
    matchData.firstPlayer_monster5 = updatefields.monsterZone[firstPlayer][4];
    matchData.firstPlayer_spell_trap_length = updatefields.spellTrapZone[firstPlayer].filter((cardId) => cardId != null).length;
    matchData.firstPlayer_spell_trap1 = updatefields.spellTrapZone[firstPlayer][0];
    matchData.firstPlayer_spell_trap2 = updatefields.spellTrapZone[firstPlayer][1];
    matchData.firstPlayer_spell_trap3 = updatefields.spellTrapZone[firstPlayer][2];
    matchData.firstPlayer_spell_trap4 = updatefields.spellTrapZone[firstPlayer][3];
    matchData.firstPlayer_spell_trap5 = updatefields.spellTrapZone[firstPlayer][4];
    matchData.firstPlayer_hand_length = updatefields.hand[firstPlayer].length;
    matchData.firstPlayer_hand_json = updatefields.hand[firstPlayer];
    matchData.firstPlayer_grave_length = updatefields.graveyard[firstPlayer].length;
    matchData.firstPlayer_grave_json = updatefields.graveyard[firstPlayer];
    matchData.firstPlayer_banish_length = updatefields.banishZone[firstPlayer].length;
    matchData.firstPlayer_banish_json = updatefields.banishZone[firstPlayer];

    matchData.secondPlayer_monster_length = updatefields.monsterZone[secondPlayer].filter((cardId) => cardId != null).length;
    matchData.secondPlayer_monster1 = updatefields.monsterZone[secondPlayer][0];
    matchData.secondPlayer_monster2 = updatefields.monsterZone[secondPlayer][1];
    matchData.secondPlayer_monster3 = updatefields.monsterZone[secondPlayer][2];
    matchData.secondPlayer_monster4 = updatefields.monsterZone[secondPlayer][3];
    matchData.secondPlayer_monster5 = updatefields.monsterZone[secondPlayer][4];
    matchData.secondPlayer_spell_trap_length = updatefields.spellTrapZone[secondPlayer].filter((cardId) => cardId != null).length;
    matchData.secondPlayer_spell_trap1 = updatefields.spellTrapZone[secondPlayer][0];
    matchData.secondPlayer_spell_trap2 = updatefields.spellTrapZone[secondPlayer][1];
    matchData.secondPlayer_spell_trap3 = updatefields.spellTrapZone[secondPlayer][2];
    matchData.secondPlayer_spell_trap4 = updatefields.spellTrapZone[secondPlayer][3];
    matchData.secondPlayer_spell_trap5 = updatefields.spellTrapZone[secondPlayer][4];
    matchData.secondPlayer_hand_length = updatefields.hand[secondPlayer].length;
    matchData.secondPlayer_hand_json = updatefields.hand[secondPlayer];
    matchData.secondPlayer_grave_length = updatefields.graveyard[secondPlayer].length;
    matchData.secondPlayer_grave_json = updatefields.graveyard[secondPlayer];
    matchData.secondPlayer_banish_length = updatefields.banishZone[secondPlayer].length;
    matchData.secondPlayer_banish_json = updatefields.banishZone[secondPlayer];

    if (matchData.firstPlayerLP <= 0 || matchData.secondPlayerLP <= 0) {
        matchData.cause = 'beatDown'
        if (matchData.firstPlayerLP <= 0 && matchData.secondPlayerLP <= 0) {
            matchData.winner = "draw"
        } else if (matchData.firstPlayerLP <= 0 || matchData.firstPlayer_deck_length == 0) {
            matchData.winner = secondPlayer
        } else if (matchData.secondPlayerLP <= 0 || matchData.secondPlayer_deck_length == 0){
            matchData.winner = firstPlayer
        } else {
            matchData.winner = null
        }

    } else if (matchData.firstPlayer_deck_length == 0 || matchData.secondPlayer_deck_length == 0) {
        matchData.cause = 'libraryOut'
    } else if (option == 'fiberJar') {
        matchData.cause = 'fiberJar'
    } else if (option == 'painfulChoice') {
        matchData.cause = 'painfulChoice'
    } else if (option == 'peeping') {
        matchData.cause = 'peeping'
    } else if (option == 'search') {
        matchData.cause = 'search'
    } else if (option == 'salvage') {
        matchData.cause = 'salvage'
    } else if (option == 'betray') {
        matchData.cause = 'betray'
    }
    matchData.turn_count = turnCount
    matchData.date = new Date();
    console.log(matchData.date)
    updatePlayers[playerId].matchData = matchData;
    return updatePlayers;
}

// 1枚ドローするときの処理
const drawCard = async (fields, fieldsSetter, playerId) => {
    console.log('draw!!!',fields)
    const deck = fields.deck
    const setHand = fieldsSetter.setHand;
    const setDeck = fieldsSetter.setDeck;

    let updatefields = { ...fields };


    if (deck[playerId].length === 0) {
        // デッキが空の場合は何もしない
        return updatefields;
    }
    if (deck[playerId].length > 0) {
        // deckからカードを一枚取り出す
        const drawnCard = deck[playerId][0];
        allCards[drawnCard].location = 'hand';
        console.log(drawnCard)

        // const updateHand = updatefields.hand;
        // const updateDeck = updatefields.deck;

        // updateHand[playerId] = [...updateHand[playerId], drawnCard];
        // updateDeck[playerId] = updateDeck[playerId].slice(1);

        // setHand(updateHand);
        // setDeck(updateDeck);

        // updatefields.hand = updateHand;
        // updatefields.deck = updateDeck;
        
        // handにカードを追加する
        updatefields.hand[playerId] = [...updatefields.hand[playerId], drawnCard];
        updatefields.deck[playerId] = updatefields.deck[playerId].slice(1);

        setHand(updatefields.hand)
        setDeck(updatefields.deck)



        return updatefields;
                
    }
}
const handleDraw = async (socket, roomName, fields, fieldsSetter, playerId, opponentPlayerId, turnCount) => {
    let updatefields = fields;
    if (fields.deck.length == 0) {
        // 敗北処理
        const decisionObj = {
            decision: true,
            winner: opponentPlayerId
        }
        updatefields.players = await matchDataUpdate(playerId, opponentPlayerId, updatefields, turnCount)
        socket.emit('decision', { roomName, decisionObj, result: updatefields.players[playerId].matchData })
    }

    updatefields = await drawCard(fields, fieldsSetter, playerId)
    // 相手にドローしたことを通知
    socket.emit('draw', { roomName, opponentPlayerId });

    return updatefields;
}
// 複数枚ドローするときの処理
const drawCards = async (socket, roomName, deck, hand, setHand, setDeck, playerId, numCards) => {
    const drawnCards = deck[playerId].slice(0, numCards);
    const remainingDeck = deck[playerId].slice(numCards);

    let updatedHand = [];
    updatedHand = { ...hand };
    updatedHand[playerId] = [...updatedHand[playerId], ...drawnCards];
    setHand(updatedHand);
    console.log('updatedHand',updatedHand)

    const updatedDeck = { ...deck };
    updatedDeck[playerId] = remainingDeck;
    setDeck(updatedDeck);
    for (const drawnCard of drawnCards) {
        allCards[drawnCard].location = 'hand';
    }

    return { updatedHand, updatedDeck }
};

const handleDrawCards = async (socket, opponentPlayerId, roomName, deck, hand, setHand, setDeck, playerId, numCards) => {
    const updateFields = await drawCards(socket, roomName, deck, hand, setHand, setDeck, playerId, numCards)

    // 相手にドローしたことを通知
    socket.emit('drawCards', { roomName, opponentPlayerId, num: numCards });

    return updateFields;
}

// 手札から指定したカードの削除
const removeFromHnad = async (hand, setHand, playerId, cardId) => {
    // handから取り出したカードを削除する
    console.log('removeFromHnad', hand[playerId], cardId)
    const updatedHand = hand[playerId].filter((handCardId) => handCardId !== cardId);
    let updatedHandArray
    updatedHandArray = { ...hand };
    updatedHandArray[playerId] = updatedHand;
    // 更新されたhandをセットする
    setHand(updatedHandArray);
    console.log('remove from hand', JSON.stringify(updatedHandArray), 'card=', cardId);
    return updatedHandArray;
}

// デッキから指定したカードの削除
const removeFromDeck = async (deck, setDeck, playerId, cardId) => {
    // deckから取り出したカードを削除する
    const updateDeckArray = { ...deck };
    updateDeckArray[playerId] = deck[playerId].filter((deckCardId) => deckCardId != cardId);
    setDeck(updateDeckArray);
    return updateDeckArray

    // const updatedDeck = deck[playerId].filter((deckCardId) => deckCardId !== cardId);

    // // 更新されたdeckをセットする
    // setDeck((prevDeck) => {
    //     const updateDeckArray = { ...prevDeck };
    //     updateDeckArray[playerId] = updatedDeck;
    //     return updateDeckArray;
    // });
}



// モンスターゾーンから指定したカードの削除
const removeFromMonsterZone = async (monsterZone, setMonsterZone, playerId, cardId) => {
    const updatedMonsterArray = { ...monsterZone };

    const index = updatedMonsterArray[playerId].indexOf(cardId);
    console.log(index);
    if (index !== -1) {
        updatedMonsterArray[playerId][index] = null; // 空のスロットにカードを配置
    }
    // const updatedMonsterZone = updatedMonsterArray[playerId].filter((targetCardId) => targetCardId !== cardId);
    // updatedMonsterArray[playerId] = updatedMonsterZone;

    if (allCards[cardId].name == "魔導戦士ブレイカー") {
        allCards[cardId].counter = -1;
        allCards[cardId].effect.canUse = false;
    }
    setMonsterZone(updatedMonsterArray);
    console.log(updatedMonsterArray)
    return updatedMonsterArray;
}
// 魔法罠ゾーンから指定したカードの削除
const removeFromSpellTrapZone = async (spellTrapZone, setSpellTrapZone, playerId, cardId) => {
    let updatedSpellTrapArray = { ...spellTrapZone };

    const index = updatedSpellTrapArray[playerId].indexOf(cardId);
    console.log(index);
    if (index !== -1) {
        updatedSpellTrapArray[playerId][index] = null; // 空のスロットにカードを配置
    }
    // const updatedSpellTrapZone = spellTrapZone[playerId].filter((targetCardId) => targetCardId !== cardId);
    // updatedSpellTrapArray[playerId] = updatedSpellTrapZone;
    setSpellTrapZone(updatedSpellTrapArray)
    if (allCards[cardId].name == "光の護封剣") {
        allCards[cardId].counter = 0;
    }
    console.log('remove spell trap Zone', cardId, updatedSpellTrapArray, JSON.stringify(updatedSpellTrapArray));
    return updatedSpellTrapArray;
}
// 墓地から指定カードの削除
const removeFromGraveyard = async (graveyard, setGraveyard, playerId, cardId) => {
    const updateGraveyard = graveyard[playerId].filter((targetCardId) => targetCardId != cardId);
    let updateGraveyardArray = { ...graveyard };
    updateGraveyardArray[playerId] = updateGraveyard;
    setGraveyard(updateGraveyardArray)
    return updateGraveyardArray;
}

// 手札にカードを加える処理
const addHand = async (hand, setHand, playerId, cardId) => {
    const updateHand = { ...hand };
    updateHand[playerId] = [...updateHand[playerId], cardId];
    setHand(updateHand);
    return updateHand;
}



// 魔法罠ゾーンにカードの追加
const addSpellTrapZone = async (spellTrapZone, setSpellTrapZone, playerId, cardId) => {
    const updateSpellTrapZone = spellTrapZone;
    const index = updateSpellTrapZone[playerId].indexOf(null); // 最初の空のスロットを探す
    if (index !== -1) {
        updateSpellTrapZone[playerId][index] = cardId; // 空のスロットにカードを配置
    } else {
        console.log("ゾーンがいっぱいです"); // エラーメッセージや他の処理
    }
    console.log(updateSpellTrapZone); // エラーメッセージや他の処理

    // updateSpellTrapZone[playerId] = [...updateSpellTrapZone[playerId], cardId];
    setSpellTrapZone(updateSpellTrapZone);
    return updateSpellTrapZone;
}
// 墓地にカードの追加
const addGraveyard = async (graveyard, setGraveyard, playerId, cardId) => {
    console.log('add grave card', cardId)

    allCards[cardId].faceStatus = 'up';
    allCards[cardId].location = 'graveyard';
    allCards[cardId].controller = allCards[cardId].owner 
    let updateGraveyard = { ...graveyard };
    updateGraveyard[playerId] = [...updateGraveyard[playerId], cardId];
    setGraveyard(updateGraveyard)
    console.log('addgrave',updateGraveyard)
    return updateGraveyard;
}
// 除外ゾーンに追加
const addBanishZone = async (playerId, banishZone, setBanishZone, cardId) => {
    let updateBanishZone = { ...banishZone };
    updateBanishZone[playerId] = [...updateBanishZone[playerId], cardId];
    setBanishZone(updateBanishZone);
    return updateBanishZone;
}
// ハンデス
const discard = async (playerId, cardId, fields, hand, setHand, graveyard, setGraveyard) => {
    console.log('discatrdd',playerId)
    let updatedHand = await removeFromHnad(hand, setHand, playerId, cardId)
    let updateGraveyard = await addGraveyard(graveyard, setGraveyard, playerId, cardId)
    const updateFields = { ...fields };
    updateFields.hand = updatedHand;
    updateFields.graveyard = updateGraveyard;

    console.log('discard fields', updateFields)
    return updateFields;
}
// 手札からデッキに返す
const handReturnToDeck = async (playerId, cardId, fields, hand, setHand, deck, setDeck) => {

    let updatedHand = await removeFromHnad(hand, setHand, playerId, cardId);
    let updateDeck = { ...deck };
    // カードを裏側に
    const card = allCards[cardId];
    card.faceStatus = 'none';
    card.location = 'deck';
    updateDeck[playerId] = [...updateDeck[playerId], cardId ];
    setDeck(updateDeck);
    const updateFields = { ...fields };
    updateFields.hand = updatedHand;
    updateFields.deck = updateDeck;

    console.log('hand retun deck fields', updateFields)
    return updateFields;
}
// 墓地から手札に戻す
const graveReturnToHand = async (playerId, cardId, fields, fieldsSetter) => {
    let updatefields = fields;
    updatefields.hand = await addHand(fields.hand, fieldsSetter.setHand, playerId, cardId);
    updatefields.graveyard = await removeFromGraveyard(fields.graveyard, fieldsSetter.setGraveyard, playerId, cardId);

    return updatefields;
}

// 召喚権の使用
const useRightOfSummon = async (players, setPlayers, playerId) => {
    let updatePlayers = players
    updatePlayers[playerId].rightOfSummon = false;
    setPlayers(updatePlayers)
    return updatePlayers
}
// 優先権の獲得
const getPriority = async (players, setPlayers, playerId, opponentPlayerId) => {
    console.log(players, playerId, opponentPlayerId);
    let updatePlayers = players;
    updatePlayers[playerId].priority = true;
    updatePlayers[opponentPlayerId].priority = false;
    setPlayers((prevState) => {
        return {
            ...prevState,
            [playerId]: { ...prevState[playerId], priority: true },
            [opponentPlayerId]: { ...prevState[opponentPlayerId], priority: false }
        };
    });
    // console.log(updatePlayers, JSON.stringify(updatePlayers))
    return updatePlayers;

}
// 優先権をターンプレイヤーに返す
const returnPriority = async (players, setPlayers, playerId, opponentPlayerId) => {
    const updatePlayers = { ...players };
    if (updatePlayers[playerId].turnPlayer) {
        updatePlayers[playerId].priority = true;
    } else {
        updatePlayers[opponentPlayerId].priority = false;
    }
    setPlayers(updatePlayers);
}

//召喚するときの共通処理
const summon = async (socket, roomName, cardId, fields, fieldsSetter, playerId, face) => {
    // monsterZoneにカードを追加する
    const card = allCards[cardId]
    const monsterZone = fields.monsterZone;
    let updatedMonsterZone = { ...monsterZone };
    const index = updatedMonsterZone[playerId].indexOf(null); // 最初の空のスロットを探す
    if (index !== -1) {
        updatedMonsterZone[playerId][index] = cardId; // 空のスロットにカードを配置
    } else {
        console.log("ゾーンがいっぱいです"); // エラーメッセージや他の処理
    }
    // updatedMonsterZone[playerId] = [...updatedMonsterZone[playerId], cardId];
    fieldsSetter.setMonsterZone(updatedMonsterZone);

    console.log('summon', updatedMonsterZone)
    // カード情報の更新
    card.location = 'monsterZone';
    card.faceStatus = face;
    card.attackable = true;
    card.canChange = false;
    // リバースカードが攻撃表示で召喚されたら効果発動不能にする
    if (card.effect.triggerCondition == "reverse") {
        if (face == 'attack') {
            allCards[cardId].effect.canUse = false
        }
    }
    // 召喚回数データの集計
    // 自身が召喚したモンスターのコントローラーであれば
    if ((socket.id == allCards[cardId].controller) && (allCards[cardId].name == '人造人間－サイコ・ショッカー' || allCards[cardId].name == 'カオス・ソルジャー －開闢の使者－' || allCards[cardId].name == '天空騎士パーシアス')) {
        // ハンデスを記録
        socket.emit('useCardData', { roomName, cardId });
    }
    card.uuid = uuidv4();
    // 主に蘇生時などに効果を使えるようにする
    if (card.name != '魔導戦士ブレイカー' && card.name != 'ブレイドナイト' && card.effect.triggerCondition != 'reverse') {
        card.effect.canUse = true;
    }
    return updatedMonsterZone
}
  
// 通常召喚するときの処理
const normalSummon = async (socket, roomName, cardId, fields, fieldsSetter, playerId, setPlayers, face) => {
    console.log('normal summon', playerId)
    let updatefields = fields;
    const hand = fields.hand;
    const setHand = fieldsSetter.setHand;
    // リバース効果カードを表側で召喚したら効果発動を不可に。セットしたら発動可能に
    if (allCards[cardId].effect.triggerCondition == 'reverse') {
        if (face == 'attack') {
            allCards[cardId].effect.canUse = false
        } else if (face == 'downDef') {
            allCards[cardId].effect.canUse = true
        }
    }
    updatefields.monsterZone = await summon(socket, roomName, cardId, fields, fieldsSetter, playerId, face);
    updatefields.hand = await removeFromHnad(hand, setHand, playerId, cardId);
    updatefields.players = await useRightOfSummon(fields.players, setPlayers, playerId);
    return updatefields
}

const advanceSummon = async (socket, roomName, cardId, fields, fieldsSetter, playerId, setPlayers, selectTargetProps, face) => {
    console.log('advance summon',fields);
    // トークンじゃないモンスターカードから生贄先を選択
    const targetIds = fields.monsterZone[playerId].filter((cardId) => allCards[cardId] && allCards[cardId].cardtype != 'Token');
    const tributeCardId = await asyncSelectCard(socket, cardId, targetIds, selectTargetProps)
    if (tributeCardId == null) {
        return null;
    }
    // 生贄がリビデでの蘇生先なら自壊させないためにリンク解除
    console.log(allCards[tributeCardId], JSON.stringify(allCards[tributeCardId]))
    const tributeLinkCallOfTheHauntedId = allCards[tributeCardId].link.find((linkId) => allCards[linkId].name == "リビングデッドの呼び声")
    console.log(tributeLinkCallOfTheHauntedId)

    // リビデが紐ついてたら削除
    if (tributeLinkCallOfTheHauntedId) {
        socket.emit('unlink', { roomName, cardId: tributeLinkCallOfTheHauntedId, unlinkCardId: tributeCardId });
        socket.emit('unlink', { roomName, cardId: tributeCardId, unlinkCardId: tributeLinkCallOfTheHauntedId });
        await unlink(tributeLinkCallOfTheHauntedId, tributeCardId)
        await unlink(tributeCardId, tributeLinkCallOfTheHauntedId)

        // リビデのリンク先は解除
        // allCards[tributeLinkCallOfTheHauntedId].link = [];
        // console.log(allCards[tributeLinkCallOfTheHauntedId], JSON.stringify(allCards[tributeLinkCallOfTheHauntedId]))

        // // 生贄先はリビデのリンクのみ解除
        // allCards[tributeCardId].link = allCards[tributeCardId].link.filter((linkId) => linkId != tributeLinkCallOfTheHauntedId);
        // console.log(allCards[tributeCardId], JSON.stringify(allCards[tributeCardId]))

    }
    // 生贄カードを破壊し手札から生贄召喚
    let updatefields = await destroy(playerId, fields, fieldsSetter, tributeCardId)
    await summon(socket, roomName, cardId, fields, fieldsSetter, playerId, face);
    await removeFromHnad(updatefields.hand, fieldsSetter.setHand, playerId, cardId);
    await useRightOfSummon(fields.players, setPlayers, playerId);

    return tributeCardId;
}

// 魔法罠をセットするときの処理
const put = async (cardId, fields, fieldsSetter, playerId, face) => {
    const hand = fields.hand;
    const spellTrapZone = fields.spellTrapZone;
    const setHand = fieldsSetter.setHand;
    const setSpellTrapZone = fieldsSetter.setSpellTrapZone;
    // カードの位置情報の更新
    allCards[cardId].location = 'spellTrapZone';
    allCards[cardId].faceStatus = face;
    // 各ゾーンの状態更新
    const updateSpellTrapZone = await addSpellTrapZone(spellTrapZone, setSpellTrapZone, playerId, cardId);
    const updateHand = await removeFromHnad(hand, setHand, playerId, cardId);
    let updatefields = fields;

    updatefields.spellTrapZone = updateSpellTrapZone; 
    updatefields.hand = updateHand;
    return updatefields
}


// 表示形式を変更するときの処理
const change = async (playerId, monsterZone, setMonsterZone, cardId) => {
    console.log('change')

    // 1. prevMonsterZone のコピーを作成
    const updatedMonsterZone = { ...monsterZone };

    // 2. コピーされた monsterZone を変更
    const targetCardId = updatedMonsterZone[playerId].find((findCardId) => findCardId == cardId);
    const targetCard = allCards[targetCardId]
    if (targetCard.faceStatus == 'attack') {
        targetCard.faceStatus = 'def';
    } else {
        targetCard.faceStatus = 'attack';
    }
    setMonsterZone(updatedMonsterZone);


}

// リバースするときの処理
const reverse = async (cardId, face) => {
    console.log('reverse', cardId, allCards[cardId],face)
    allCards[cardId].faceStatus = face;
}

// 効果発動のラッパー兼チェーンブロックの作成
const makeChainBlock = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, effectProps, chainProps, chainConfirmFlag, setChainConfirmFlag, chainBlockCards, selectTargetProps, setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps) => {
    setSpellSpeed(1);
    const card = allCards[cardId];
    // let beforeMonsterInfoSelf = await savedInfo(fields.monsterZone[playerId]);
    // let beforeMonsterInfoOppo = await savedInfo(fields.monsterZone[opponentPlayerId]);
    if (chainProps.conditions.includes('summoned')) {
        socket.emit('conditionAdd', { roomName, condition: ['summoned'] });
    } else if (chainProps.conditions.includes('attack')) {
        socket.emit('conditionAdd', { roomName, condition: ['attack'] });
    }
    chainProps.setChainBlockCards([cardId]);
    const obj = await activate(socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, effectProps, chainProps, chainConfirmFlag, setChainConfirmFlag, chainBlockCards, selectTargetProps, otherProps)
    console.log('チェーンブロックが確定しました', setQuickEffectTiming)
    console.log(obj)
    console.log(obj.useCardIds)
    let updatefields = obj.updateFields
    if (updatefields.decision) {
        // LPが0以下なら終了
        return obj;
    }
    // 新しいfieldsを返してそれを使って処理
    updatefields = await effectResolution(socket, roomName, playerId, opponentPlayerId, updatefields, fieldsSetter, chainProps, obj.useCardIds, setSpellSpeed, setQuickEffectTiming)
    // 攻撃時で攻撃モンスターが居なくなっていれば矢印削除イベントを起こす
    // console.log(chainProps.actionMonster, allCards[chainProps.actionMonster].location)
    if (chainProps.conditions.includes('attack') && allCards[chainProps.actionMonster] && allCards[chainProps.actionMonster].location != "monsterZone") {
        socket.emit('offArrow', { roomName });
    }
    socket.emit("chainCountMsgReset", { roomName });

    chainProps.setChainBlockCards(obj.useCardIds);
    setEffecting(false);
    updatefields.players = await getPriority(updatefields.players, fieldsSetter.setPlayers, opponentPlayerId, playerId);

    let newConditions = chainProps.conditions;
    // チェーン1で蘇生していればその召喚に対してチェーン確認。チェーン2以降での召喚は確認しない
    if ((card.name == '早すぎた埋葬' || card.name == 'リビングデッドの呼び声') && card.location == 'spellTrapZone' || (card.name == 'スケープゴート')) {
        console.log('revived', card);
        let actionMonster = "";
        if (card.name != 'スケープゴート') {
            actionMonster = card.link[0];
        } else {
            let goatsNumber = 41
            // スケープゴートのカードIDが50未満なら先行プレイヤーの発動
            if (cardId > 50) {
                goatsNumber = 91
            }
            actionMonster = goatsNumber
        }
        socket.emit('addActionMonster', { roomName, actionMonster: actionMonster, action: 'summon' });
        chainProps.setActionMonster(actionMonster)
        if (!chainProps.conditions.includes('summoned')) {
            newConditions = [...chainProps.conditions, 'summoned', 'ignition']
            chainProps.setConditions(newConditions);
            chainProps.conditions = newConditions
        }
        console.log('special summon card', card.name, newConditions)
        socket.emit('conditionAdd', { roomName, condition: ['summoned', 'ignition'] });
    }
    console.log(updatefields);
    socket.emit('chainCountMsgReset', { roomName });

    let reviveTakeshi = false
    if ((card.name == '早すぎた埋葬' || card.name == 'リビングデッドの呼び声') && card.link[0] != null && allCards[card.link[0]].name == "魂を削る死霊") {
        reviveTakeshi = card.link[0]
    }
    //  // サイドエフェクトの確認。発動したかをboolで返す
    const sideEffect = await sideEffectChain(socket, roomName, playerId, opponentPlayerId, updatefields, fieldsSetter, effectProps, chainProps, chainConfirmFlag, setChainConfirmFlag, chainBlockCards, selectTargetProps, setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps);
    
    // ターンプレイヤーにクイックエフェクトの確認を行う。召喚していれば召喚のアクションチェインをトリガー
    // サイドエフェクトでクイックエフェクトの確認を行うのでサイドエフェクトが発動したときはクイックエフェクトの確認をしない
    // if (!sideEffect.result && (card.name == '早すぎた埋葬' || card.name == 'リビングデッドの呼び声') && card.location == 'spellTrapZone') {
    //     let chainObj = {}
    //     if (fields.players[playerId].turnPlayer) {
    //         chainObj = await actionChain(socket, roomName, effectProps, playerId, opponentPlayerId, card.link, updatefields, fieldsSetter, [card.link], setChainConfirmFlag, chainProps, 'summon', setSpellSpeed, setQuickEffectTiming);
    //     } else {
    //         chainObj = await oppoActionChain(socket, roomName, effectProps, playerId, opponentPlayerId, card.link, updatefields, fieldsSetter, [card.link], setChainConfirmFlag, chainProps, "summon", setSpellSpeed, setQuickEffectTiming);
    //     }
    //     updatefields = chainObj.updateFields
// } else
    // クイックエフェクトの確認
    if (!sideEffect.result) {
        let action = "";
        let actionMonster = "";
        if ((card.name == '早すぎた埋葬' || card.name == 'リビングデッドの呼び声') && card.location == 'spellTrapZone' || (card.name == 'スケープゴート')) {
            action = "summon";
            if (card.name != 'スケープゴート') {
                actionMonster = card.link[0]
            } else {
                let goatsNumber = 41
                // スケープゴートのカードIDが50未満なら先行プレイヤーの発動
                if (cardId > 50) {
                    goatsNumber = 91
                }
                actionMonster = goatsNumber
            }
        }
        if (reviveTakeshi) {
            action = "summon";
            actionMonster = reviveTakeshi
        }
        console.log('no revived')
        let quickefected = {}
        // ターンプレイヤーにクイックエフェクトの確認を行う
        if (fields.players[playerId].turnPlayer) {
            console.log('自分のクイックエフェクト確認')
            quickefected = await quickEffectConfirm(socket, roomName, setQuickEffectTiming, chainProps.setChainBlockCards, newConditions, chainProps.setConditions, updatefields, fieldsSetter, playerId, opponentPlayerId, action, chainProps.setAction, actionMonster, chainProps.setActionMonster, quickEffectStack, setQuickEffectStack, otherProps)
            console.log(quickefected)
            if (quickefected.status) {
                obj.updateFields = quickefected.fields
                obj.chainBlockCards = quickefected.chainBlockCards
            }
        } else {
            console.log('相手のクイックエフェクト確認', quickEffectStack)
            otherProps.setOppoChoicing(true)
            quickefected = await selfQuickEffectConfirm(socket, roomName, updatefields, action, actionMonster, quickEffectStack)
            console.log(quickefected)
            if (quickefected.status) {
                obj.updateFields = quickefected.fields
                obj.chainBlockCards = quickefected.chainBlockCards
            }
        }

    }
    chainProps.setChainBlockCards([]);

    return obj;
}

// 効果発動時の処理
const activate = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, effectProps, chainProps, chainConfirmFlag, setChainConfirmFlag, chainBlockCards, selectTargetProps, otherProps) => {
    let updateFields = fields;
    console.log(chainBlockCards)
    const setChainBlockCards = chainProps.setChainBlockCards
    const setActivater = chainProps.setActivater
    const setActivateCard = chainProps.setActivateCard
    setActivater(playerId);
    setActivateCard(cardId);
    let chainCards = chainBlockCards
    chainCards = [...chainBlockCards, cardId];
    // if (!chainBlockCards.includes(cardId)) {
    //     chainCards = [...chainBlockCards, cardId];
    // } else {
    //     console.log('もう含まれてるからたさないよ')
    // }
    console.log(chainCards)
    console.log('effectProps', effectProps, JSON.stringify(effectProps))
    // 優先権を渡す
    updateFields.players = await getPriority(fields.players, fieldsSetter.setPlayers, opponentPlayerId, playerId);
    let chainObj = await chain(socket, roomName, effectProps, playerId, opponentPlayerId, cardId, updateFields, fieldsSetter, chainCards, setChainBlockCards, 'effect', otherProps);
    console.log('chain result ',chainObj)
    let useCardIds = chainObj.chainBlockCards;
    console.log('useCardとchainblock cards ', useCardIds, ':::', chainCards)
    // 相手がチェーンしなかった場合自分がチェーンできる。現在のチェーンブロック内のカードと相手の結果を比較する
    console.log('effectProps', effectProps)
    if (useCardIds.length == chainCards.length) {
        chainObj = await chainSelf(socket, roomName, effectProps, playerId, opponentPlayerId, cardId, chainCards, setChainBlockCards, setChainConfirmFlag, chainProps.setEventName, 'effect', updateFields);
        console.log('chainself result ', chainObj)

        useCardIds = chainObj.chainBlockCards;
    }
    updateFields = chainObj.updateFields;
    // LPがあるなら効果発動する
    if (!chainObj.updateFields.decision) {
        console.log('selectTargetProps====', selectTargetProps)
        chainProps.setEffecting(true);
        // チェーンを組み終わったので効果処理
        console.log('chainobj.updateFields',chainObj.updateFields)
        updateFields = await activateDetail(socket, roomName, cardId, playerId, opponentPlayerId, updateFields, fieldsSetter, selectTargetProps);
    }

    // チェーンブロックを組み終わって元の処理に返す処理

    // TODO 副次効果のチェーン解決時にバグる?
    if (chainProps.eventName.includes(playerId)) {
        // チェーンブロック作成者がチェーンを終わらせたとき
        console.log('効果処理も含めてチェーン終わり！')
        socket.emit('chainConfirmResultSelf', { roomName, effectProps, playerId, chainBlockCards: useCardIds, eventName: chainProps.eventName, updateFields });
    } else {
        // チェーンブロック作成者じゃない方がチェーンを終わらせたとき
        console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
        socket.emit('chainConfirmResult', { roomName, useCardIds, eventName: chainProps.eventName, chainBlockCards: useCardIds, updateFields });
    }

    setChainBlockCards(useCardIds)
    setChainConfirmFlag(false);
    // chainProps.setEffectTarget(null)
    chainProps.setEffecting(false);
    console.log('activate update fields',updateFields);

    return { useCardIds, updateFields };


}


// チェイン時に相手の応答を待つ このplayerIdは効果発動のactivePlayerとして使われる
const chain = async (socket, roomName, effectProps, playerId, opponentPlayerId, cardId, fields, fieldsSetter, chainBlockCards, setChainBlockCards, action, otherProps, effectTarget) => {

    // 相手が使うようにIDと発動カードを交換
    // effectProps.cardId = cardId;
    effectProps.playerId = opponentPlayerId
    effectProps.opponentPlayerId = playerId
    console.log('chain func ', action)
    otherProps.setOppoChoicing(true)
    let target = effectTarget ? effectTarget : allCards[chainBlockCards[chainBlockCards.length - 1]].effect.target

    // 相手が発動したカードを返す
    return new Promise((resolve, reject) => {
        const eventName = cardId + action + playerId;
        console.log('AWAIT ', eventName)
        console.log(chainBlockCards[chainBlockCards.length - 1])
        console.log(allCards[chainBlockCards[chainBlockCards.length - 1]].effect.target)
        console.log(target)
        socket.emit('chainConfirm', { roomName, effectProps, playerId, chainBlockCards, eventName, action, fields, target: target });
        
        // result = {chainBlockCards, updateFields}
        socket.on(eventName, async (result) => {
            console.log('チェーン処理が帰って来ました', result, fields)
            console.log(JSON.stringify(result), JSON.stringify(fields))
            
            if (result.chainBlockCards) {
                setChainBlockCards(result.chainBlockCards);
            }
            // 優先権を獲得
            // await getPriority(result.updateFields.players, fieldsSetter.setPlayers, playerId, opponentPlayerId);
            otherProps.setOppoChoicing(false)
            resolve(result);
            console.log('chain func', result);
            socket.off(eventName);
        });
    });
};
// チェイン時に自分の応答を待つ このplayerIdは効果発動のactivePlayerとして使われる
const chainSelf = async (socket, roomName, effectProps, playerId, opponentPlayerId, cardId, chainBlockCards, setChainBlockCards, setChainConfirmFlag, setEventName, action, fields, effectTarget) => {
    console.log('chain self')
    console.log('chainself func ', action)
    let target = effectTarget ? effectTarget : allCards[chainBlockCards[chainBlockCards.length - 1]].effect.target
    // 自分が発動したカードを返す
    return new Promise((resolve, reject) => {
        const eventName = cardId + action + playerId;
        setEventName(eventName)
        console.log('AWAIT ', chainBlockCards, eventName)
        console.log(target)
        socket.emit('chainConfirmSelf', { roomName, effectProps, playerId, chainBlockCards, eventName, action, fields, target: target });
        
        // result = {chainBlockCards, updateFields}
        socket.on(eventName, (result) => {
            console.log('自分もチェーンしませんでした', result)
            setChainConfirmFlag(false);
            if (result.chainBlockCards) {
                setChainBlockCards(result.chainBlockCards);
            }
            resolve(result);
            socket.off(eventName);

        });
    });
};

// 実際の効果処理(効果解決)
const activateDetail = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps) => {
    console.log('効果発動した', cardId)
    const card = allCards[cardId];
    let updatefields = fields;
    await visualizeEffectAndWait(socket, roomName, cardId)
    if (card.name == '魔導戦士ブレイカー' && card.counter == 0) {
        // ブレイカーの反転召喚時のみカウンター乗せ
        updatefields = await cardEffects[card.effect.effectDetails[1]](socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps);
    } else {
        updatefields = await cardEffects[card.effect.effectDetails[0]](socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps);
    }
    // const updateFields = await card.effect.effectDetails[0](socket, roomName, card, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps);
    console.log('effect update fields', updatefields);
    // フィールドの変更があればupdateFieldsを定義して返還
    return updatefields;

}

// 効果発動のコスト支払い
// 手札のみ予め捨てるカードを指定しておく
const payCost = async (socket, roomName, cardId, playerId, fields, fieldsSetter, discardCardId, setPlayerDamageValue) => {
    console.log('コスト支払い', cardId)
    let updateFields = fields;
    let updatePlayers = updateFields.players;
    const card = allCards[cardId];
    // console.log(cardId,allCards ,card)
    switch (card.effect.cost) {
        case 'lifePoint':
            console.log('コストはLP')
            updatePlayers = await reduceLifePoint(updateFields.players, fieldsSetter.setPlayers, playerId, card.effect.costValue, setPlayerDamageValue);
            let message = '';
            if (card.name == "早すぎた埋葬") {
                message = "800ポイントのライフを支払いました"
            } else if (card.name == "押収") {
                message = "1000ポイントのライフを支払いました"
            }
            socket.emit('messageLog', { roomName: roomName, type: 'damageLog', playerId: playerId, message: message }) 
            socket.emit('reduceLP', { roomName, playerId: playerId, value: card.effect.costValue });
            break;
        case 'discard':
            console.log('コストは手札', discardCardId)
            updateFields = await discard(playerId, discardCardId, updateFields, updateFields.hand, fieldsSetter.setHand, updateFields.graveyard, fieldsSetter.setGraveyard)
            socket.emit('discard', { roomName, playerId, discardCardId: discardCardId });
            // updateFields = await discardSelf(socket, roomName, cardId, playerId, updateFields, fieldsSetter, selectTargetProps)
            // // discardSelf側でemitしている
            // if (updateFields == null) {
            //     return null;
            // }
            break;
        case 'self':
            // 生贄がリビデでの蘇生先なら自壊させないためにリンク解除
            const tributeLinkCallOfTheHauntedId = allCards[cardId].link.find((linkId) => allCards[linkId].name == "リビングデッドの呼び声")
            console.log(tributeLinkCallOfTheHauntedId)

            // リビデが紐ついてたら削除
            if (tributeLinkCallOfTheHauntedId) {
                socket.emit('unlink', { roomName, cardId: tributeLinkCallOfTheHauntedId, unlinkCardId: cardId });
                socket.emit('unlink', { roomName, cardId: cardId, unlinkCardId: tributeLinkCallOfTheHauntedId });
                await unlink(tributeLinkCallOfTheHauntedId, cardId)
                await unlink(cardId, tributeLinkCallOfTheHauntedId)
            }
            socket.emit('destroy', { roomName, fields: updateFields, playerId: allCards[cardId].owner, cardId: cardId });
            updateFields = await destroy(playerId, updateFields, fieldsSetter, cardId);
            break;
        case 'counter':
            // costでは判別しない

            break;
        default:
            console.log('コスト無し！')
            if (card.name == "魔導戦士ブレイカー" && card.counter == 1) {
                card.counter = -1;
                card.effect.canUse = false;
                socket.emit('removeCounter', { roomName, cardId: cardId });
            }
            return updateFields;
    }

    console.log('コスト支払い後', updateFields)
    return updateFields
}

// コストによる手札捨て。手札が溢れた場合にも使うかも
const discardSelf = async (socket, roomName, cardId, playerId, fields, fieldsSetter, selectTargetProps) => {
    const hand = fields.hand;
    const setHand = fieldsSetter.setHand;
    const graveyard = fields.graveyard;
    const setGraveyard = fieldsSetter.setGraveyard;
    
    const targets = fields.hand[playerId];
    // ライトニング・ボルテックスの場合自身をコストにできないようにする
    if (allCards[cardId].name == "ライトニング・ボルテックス") {
        targets = targets.filter((id) => id != cardId);
    }
    // コストとして捨てるカードの選択
    const discardCardId = await asyncSelectCard(socket, cardId, targets, selectTargetProps);
    console.log('手札から捨てるカードは ', discardCardId)
    if (discardCardId == null) {
        return null;
    }
    // 捨てて相手に通知
    const updateFields = await discard(playerId, discardCardId, fields, hand, setHand, graveyard, setGraveyard)
    socket.emit('discard', { roomName, playerId, discardCardId: discardCardId });
    return updateFields;
}

// 破壊処理
// 両プレイヤーでそれぞれ行われる
const destroy = async (playerId, fields, fieldsSetter, cardId) => {
    let updatefields = fields;
    let monsterZone = updatefields.monsterZone;
    const setMonsterZone = fieldsSetter.setMonsterZone;
    let spellTrapZone = updatefields.spellTrapZone;
    const setSpellTrapZone = fieldsSetter.setSpellTrapZone;
    let graveyard = updatefields.graveyard;
    const setGraveyard = fieldsSetter.setGraveyard;
    console.log(cardId)
    const card = allCards[cardId];
    console.log(card.cardtype,card)
    console.log('destroy', spellTrapZone, playerId);
    // それぞれのカードを破壊、トークンのみ墓地に送らない
    if (card.cardtype == 'Monster' || card.cardtype == 'Token') {
        console.log('monster')
        if (card.name == 'イグザリオン・ユニバース' && card.attack != 1800) {
            card.attack = 1800;
        };
        // トークンが破壊されるときは専用の配列に入れる
        if (card.cardtype == 'Token') {
            card.faceStatus = 'none'
            const index = monsterZone[card.controller].indexOf(cardId);
            let newGoatsZone = fields.extinctionGoats;
            // モンスターゾーンの配列と同じインデックスにいれる
            newGoatsZone[card.controller][index] = cardId;
            console.log(newGoatsZone)
            fieldsSetter.setExtinctionGoats(newGoatsZone)
        }
        monsterZone = await removeFromMonsterZone(monsterZone, setMonsterZone, card.controller, cardId);
    } else if (card.cardtype == 'Spell' || card.cardtype == 'Trap') {
        console.log('spelltrap')
        spellTrapZone = await removeFromSpellTrapZone(spellTrapZone, setSpellTrapZone, card.controller, cardId);
    }
    if (card.cardtype != 'Token') {
        graveyard = await addGraveyard(graveyard, setGraveyard, card.owner, cardId);
    } else {
        card.location = 'none'
    }
    card.controller = card.owner;
    updatefields.monsterZone = monsterZone;
    updatefields.spellTrapZone = spellTrapZone;
    updatefields.graveyard = graveyard;
    if (card.cardtype == 'Monster' && card.link.length != 0) {
        // 装備カードを即時破壊
        for (let linkId of card.link) {
            if ((allCards[linkId].name == "強奪" || allCards[linkId].name == "早すぎた埋葬") && allCards[linkId].location == "spellTrapZone") {
                console.log('link card destroy', JSON.stringify(card))
                await unlink(cardId, linkId);
                await unlink(linkId, cardId);
                updatefields = await destroy(allCards[linkId].controller, updatefields, fieldsSetter, linkId);
            }
            // リビングデッドの呼び声もチェーンブロックを作らない効果なのでここで破壊
            if ((allCards[linkId].name == "リビングデッドの呼び声") && allCards[linkId].location == "spellTrapZone") {
                console.log('link card destroy', JSON.stringify(card))
                await unlink(cardId, linkId);
                await unlink(linkId, cardId);
                // 場にショッカーが居なければリビデを破壊
                // if (!spellTrapZone[playerId].concat(spellTrapZone[opponentPlayerId]).filter((id) => id != null)
                if (!(Object.values(fields.monsterZone)[0].concat(Object.values(fields.monsterZone)[1]).filter((id) => id != null)
                    .some((id) => allCards[id].name == "人造人間－サイコ・ショッカー"))) {
                        updatefields = await destroy(allCards[linkId].controller, updatefields, fieldsSetter, linkId);
                    }
            }
            if (allCards[linkId].name == "心変わり") {
                console.log('link card destroy', JSON.stringify(card))
                await unlink(cardId, linkId);
                await unlink(linkId, cardId);
            }
        }
    }
    console.log('destroyed!!', updatefields, JSON.stringify(updatefields))
    return updatefields;
}
// 効果解決後の処理
const effectResolution = async (socket, roomName, playerId, opponentPlayerId, fields, fieldsSetter, chainProps, useCardIds, setSpellSpeed, setQuickEffectTiming) => {
    console.log('effectResolution')
    socket.emit('cleanUp', { roomName, fields, useCardIds });
    const updateFields = await cleanUp(socket, roomName, playerId, opponentPlayerId, fields, fieldsSetter, chainProps, useCardIds, setSpellSpeed);
    chainProps.setEffectTarget(null)
    chainProps.setEffecting(false);

    // await quickEffectConfirm(socket, roomName, setQuickEffectTiming)

    return updateFields;
    // await sweep(socket, roomName, playerId, opponentPlayerId, fields, chainProps, cards, setSpellSpeed);
}


// 効果処理が終わったあとのクリーンアップ
// effectResolutionからかemit受け取りで呼び出される
const cleanUp = async (socket, roomName, playerId, opponentPlayerId, fields, fieldsSetter, chainProps, useCardIds, setSpellSpeed) => {
    console.log('cleanUp ', fields, useCardIds)
    // 効果処理後に表側で滞在しない魔法罠とリンク先が破壊されている装備カードの全破壊
    const cleanUpCards = fields.spellTrapZone[playerId].concat(fields.spellTrapZone[opponentPlayerId]).filter((cardId) => (
        cardId != null &&
        allCards[cardId].faceStatus == 'up' &&
        allCards[cardId].category != 'swordsOfRevealingLight' &&
        // 装備カードは必ず一枚だけリンクする
        (allCards[cardId].category != 'equip' || allCards[cardId].link.length != 0 && allCards[allCards[cardId].link[0]].location == "graveyard") &&
        allCards[cardId].category != 'continuous'
    ))

    console.log("cleanUpCards",JSON.stringify(cleanUpCards))

    // const cleanUpCards = useCardIds.filter((cardId) => allCards[cardId].cardtype != 'Monster' && (allCards[cardId].category != 'swordsOfRevealingLight' && allCards[cardId].category != 'equip' && allCards[cardId].category != 'continuous'))
    const updateFields = await sweep(playerId, opponentPlayerId, fields, fieldsSetter, cleanUpCards);
    // チェーンブロック内のカードをリセット
    chainProps.setChainBlockCards([]);
    // 召喚のコンディションがついていたり通常魔法不可だったらそれをもとに戻す
    if (!chainProps.conditions.includes('summoned')) {
            const newConditions = [...chainProps.conditions, 'summoned']
            chainProps.setConditions(newConditions);
    }
    // socket.emit('conditionRemove', { roomName, condition: ["summoned", "attack"] });


    let newConditions = chainProps.conditions.filter((condition) => condition != 'summoned');
    // メイン1,2のときでかつ通常魔法が使えないときは使えるようにする
    if ((chainProps.conditions.includes('mail1') || chainProps.conditions.includes('mail2')) && !newConditions.includes('normalSpell')) {
        newConditions = [...newConditions, 'normalSpell'];
    }
    chainProps.setConditions(newConditions);
    chainProps.setEffecting(false);
    chainProps.setActionMonster("");
    chainProps.setAction("");
    chainProps.setActivateCard("");
    setSpellSpeed(0);
    if (fields.players[playerId].turnPlayer) {
        updateFields.players = await getPriority(updateFields.players, fieldsSetter.setPlayers, playerId, opponentPlayerId);
    } else {
        updateFields.players = await getPriority(updateFields.players, fieldsSetter.setPlayers, opponentPlayerId, playerId);
    }
    console.log('cleanup fields',updateFields)
    return updateFields;
}

// 受け取ったcardsをすべて墓地に送る
// ハンドからカード発動時にspellTrapZSoneのStateには発動カードが入ってないけどこの処理上は問題ない
// sweepをemitするときにlocationを設定すること。locationが違うカード達がsweepされることはないはず
const sweep = async (playerId, opponentPlayerId, fields, fieldsSetter, cardIds) => {
    console.log('sweep fields', fields);
    console.log('sweep fieldsSetter', fieldsSetter);
    console.log('target cards', cardIds)


    let updateMonsterZone = {}
    let updateSpellTrapZone = {}
    let updateGraveyard = {}
    let newGoatsZone = fields.extinctionGoats;
    cardIds.forEach(cardId => {
        allCards[cardId].faceStatus = 'up';
        allCards[cardId].location = 'graveyard';
        allCards[cardId].controller = allCards[cardId].owner
    })
    let updateFields = fields;
    console.log(fields.players[playerId])

    // 破壊カードに装備先モンスターが居れば装備カードを破壊
    // if (card.cardtype == 'Monster' && card.link.length != 0) {
    //     // 装備カードを即時破壊
    //     for (let linkId of card.link) {
    //         if ((allCards[linkId].name == "強奪" || allCards[linkId].name == "早すぎた埋葬" || allCards[linkId].name == "リビングデッドの呼び声") && allCards[linkId].location == "spellTrapZone") {
    //             console.log('link card destroy', JSON.stringify(card))
    //             await unlink(cardId, linkId);
    //             await unlink(linkId, cardId);
    //             updatefields = await destroy(allCards[linkId].controller, updatefields, fieldsSetter, linkId);
    //         }
    //     }
    for (const id of cardIds) {
        const card = allCards[id]
        if (card.cardtype == "Monster" && card.link.length != 0) {
            for (let linkId of card.link) {
                if ((allCards[linkId].name == "強奪" || allCards[linkId].name == "早すぎた埋葬") && allCards[linkId].location == "spellTrapZone") {
                    console.log('link card destroy', JSON.stringify(card))
                    await unlink(id, linkId);
                    await unlink(linkId, id);
                    updateFields = await destroy(allCards[linkId].controller, updateFields, fieldsSetter, linkId);
                }
                // リビングデッドの呼び声もチェーンブロックを作らない効果なのでここで破壊
                if ((allCards[linkId].name == "リビングデッドの呼び声") && allCards[linkId].location == "spellTrapZone") {
                    console.log('link card destroy', JSON.stringify(card))
                    // 場にショッカーが居なければリビデを破壊
                    // 破壊対象にショッカーがいてもリビデ破壊
                    console.log(!(fields.monsterZone[playerId].concat(fields.monsterZone[opponentPlayerId]).filter((id) => id != null)
                        .some((id) => allCards[id].name == "人造人間－サイコ・ショッカー")))
                    console.log(cardIds.some((id) => allCards[id].name == "人造人間－サイコ・ショッカー"))
                    if (!(fields.monsterZone[playerId].concat(fields.monsterZone[opponentPlayerId]).filter((id) => id != null)
                        .some((id) => allCards[id].name == "人造人間－サイコ・ショッカー")) || cardIds.some((id) => allCards[id].name == "人造人間－サイコ・ショッカー")) {
                            updateFields = await destroy(allCards[linkId].controller, updateFields, fieldsSetter, linkId);
                    }
                    await unlink(id, linkId);
                    await unlink(linkId, id);
                }
                
            }
            
        }
        // トークンが破壊されるときは専用の配列に入れる
        if (card.cardtype == 'Token') {
            const index = updateFields.monsterZone[card.controller].indexOf(id);
            // モンスターゾーンの配列と同じインデックスにいれる
            newGoatsZone[card.controller][index] = id;
            console.log(index, newGoatsZone, JSON.stringify(newGoatsZone))
            console.log(newGoatsZone[card.controller][index],id)
        }

        if (card.name == "光の護封剣") {
            card.counter = 0;
        }
        if (card.name == "魔導戦士ブレイカー") {
            card.counter = -1;
            card.effect.canUse = false;
        }
        // else if (card.cardtype != "Monster" && (card.link !== "" && Number(card.link) >= 0 && Number(card.link) <= 100)) {
        //     if ((card.name == "強奪") && allCards[card.link].location == "monsterZone") {
        //         const linkId = card.link;
        //         allCards[linkId].link = "";
        //         card.link = "";
        //         updateFields = await destroy(card.controller, updateFields, fieldsSetter, linkId);
        //     }
        // }
    }

    const monsterZone = updateFields.monsterZone;
    const setMonsterZone = fieldsSetter.setMonsterZone;
    const spellTrapZone = updateFields.spellTrapZone;
    const setSpellTrapZone = fieldsSetter.setSpellTrapZone;
    const graveyard = updateFields.graveyard;
    const setGraveyard = fieldsSetter.setGraveyard;
    // それぞれのゾーンから選択されたカードを削除
    if (!updateFields.players[playerId].priority) {
        updateMonsterZone = { ...monsterZone };
        updateMonsterZone[playerId] = monsterZone[playerId].map(cardId => cardIds.includes(cardId) ? null : cardId);
        // updateMonsterZone[playerId] = monsterZone[playerId].filter(cardId => cardId != null && !cardIds.some(targetId => targetId == cardId));
        updateMonsterZone[opponentPlayerId] = monsterZone[opponentPlayerId].map(cardId => cardIds.includes(cardId) ? null : cardId);
    
        updateSpellTrapZone = { ...spellTrapZone };
        updateSpellTrapZone[playerId] = spellTrapZone[playerId].map(cardId => cardIds.includes(cardId) ? null : cardId);
        updateSpellTrapZone[opponentPlayerId] = spellTrapZone[opponentPlayerId].map(cardId => cardIds.includes(cardId) ? null : cardId);
        // 全部のカードを墓地へ
        updateGraveyard = { ...graveyard };
        // すでに墓地にあるものは含めない
        cardIds.forEach(cardId => {
            if (allCards[cardId].owner == playerId && allCards[cardId].cardtype != "Token" && !updateGraveyard[playerId].includes(cardId)) {
                updateGraveyard[playerId] = [...updateGraveyard[playerId], cardId]
            } else if (allCards[cardId].owner == opponentPlayerId && allCards[cardId].cardtype != "Token" && !updateGraveyard[opponentPlayerId].includes(cardId)) {
                updateGraveyard[opponentPlayerId] = [...updateGraveyard[opponentPlayerId], cardId]
            }
        });
        setMonsterZone(updateMonsterZone);
        setSpellTrapZone(updateSpellTrapZone);
        setGraveyard(updateGraveyard);
        console.log(JSON.stringify(newGoatsZone))
        fieldsSetter.setExtinctionGoats(newGoatsZone)
        updateFields.monsterZone = updateMonsterZone;
        updateFields.spellTrapZone = updateSpellTrapZone;
        updateFields.graveyard = updateGraveyard;
    
        // setMonsterZone(prevState => {
        //     console.log(monsterZone, prevState, updateMonsterZone)
        //     updateMonsterZone = { ...prevState };
        //     updateMonsterZone[playerId] = prevState[playerId].filter(cardId => cardId != null && !cardIds.some(targetId => targetId == cardId));
        //     updateMonsterZone[opponentPlayerId] = prevState[opponentPlayerId].filter(cardId => cardId != null && !cardIds.some(targetId => targetId == cardId));
        //     console.log(updateMonsterZone)
        //     return updateMonsterZone
        // })
        // setSpellTrapZone(prevState => {
        //     updateSpellTrapZone = { ...prevState };
        //     updateSpellTrapZone[playerId] = prevState[playerId].filter(cardId => cardId != null && !cardIds.some(targetId => targetId == cardId));
        //     updateSpellTrapZone[opponentPlayerId] = prevState[opponentPlayerId].filter(cardId => cardId != null && !cardIds.some(targetId => targetId == cardId));
        //     return updateSpellTrapZone

        // })
        // setGraveyard(prevState => {
        //     // 全部のカードを墓地へ
        //     updateGraveyard = { ...prevState };
        //     // すでに墓地にあるものは含めない
        //     cardIds.forEach(cardId => {
        //         if (allCards[cardId].owner == playerId && allCards[cardId].cardtype != "Token" && !updateGraveyard[playerId].some(targetId => targetId == cardId)) {
        //             updateGraveyard[playerId] = [...updateGraveyard[playerId], cardId]
        //         } else if (allCards[cardId].owner == opponentPlayerId && allCards[cardId].cardtype != "Token" && !updateGraveyard[opponentPlayerId].some(targetId => targetId == cardId)) {
        //             updateGraveyard[opponentPlayerId] = [...updateGraveyard[opponentPlayerId], cardId]
        //         }
        //     });
        //     return updateGraveyard
        // })
        // console.log(updateMonsterZone)
    } else {
        
        updateMonsterZone = { ...monsterZone };
        updateMonsterZone[playerId] = monsterZone[playerId].map(cardId => cardIds.includes(cardId) ? null : cardId);
        updateMonsterZone[opponentPlayerId] = monsterZone[opponentPlayerId].map(cardId => cardIds.includes(cardId) ? null : cardId);
    
        updateSpellTrapZone = { ...spellTrapZone };
        updateSpellTrapZone[playerId] = spellTrapZone[playerId].map(cardId => cardIds.includes(cardId) ? null : cardId);
        updateSpellTrapZone[opponentPlayerId] = spellTrapZone[opponentPlayerId].map(cardId => cardIds.includes(cardId) ? null : cardId);
        // 全部のカードを墓地へ
        updateGraveyard = { ...graveyard };
        // すでに墓地にあるものは含めない
        cardIds.forEach(cardId => {
            if (allCards[cardId].owner == playerId && allCards[cardId].cardtype != "Token" && !updateGraveyard[playerId].some(targetId => targetId == cardId)) {
                updateGraveyard[playerId] = [...updateGraveyard[playerId], cardId]
            } else if (allCards[cardId].owner == opponentPlayerId && allCards[cardId].cardtype != "Token" && !updateGraveyard[opponentPlayerId].some(targetId => targetId == cardId)) {
                updateGraveyard[opponentPlayerId] = [...updateGraveyard[opponentPlayerId], cardId]
            }
        });
        setMonsterZone(updateMonsterZone);
        setSpellTrapZone(updateSpellTrapZone);
        setGraveyard(updateGraveyard);
        console.log(JSON.stringify(newGoatsZone))
        fieldsSetter.setExtinctionGoats(newGoatsZone)
        updateFields.monsterZone = updateMonsterZone;
        updateFields.spellTrapZone = updateSpellTrapZone;
        updateFields.graveyard = updateGraveyard;
    }
    // console.log('monster', updateMonsterZone, 'spell', updateSpellTrapZone, 'grave', updateGraveyard)
    console.log(updateFields, JSON.stringify(updateFields))

    return updateFields;

}

// デッキから手札にサーチする処理
const searcher = async (playerId, fields, fieldsSetter, cardId) => {
    const deck = fields.deck;
    const hand = fields.hand;
    const setDeck = fieldsSetter.setDeck;
    const setHand = fieldsSetter.setHand;

    allCards[cardId].location = 'hand';
    if (allCards[cardId].location.controller == playerId) {
        allCards[cardId].faceStatus = 'up';
    }

    const updateDeck = await removeFromDeck(deck, setDeck, playerId, cardId);
    console.log(updateDeck, cardId)
    const updateHand = await addHand(hand, setHand, playerId, cardId);
    let updatefields = fields

    updatefields.deck = updateDeck;
    updatefields.hand = updateHand;
    console.log(updatefields)
    return updatefields;
}

// デッキをシャッフルするときの処理
// 一人用
const shuffle = async (playerId, fields, fieldsSetter) => {
    let updateDeck = fields.deck;
    console.log(updateDeck)
    console.log(fields,updateDeck)
    const updateDeckPlayer = updateDeck[playerId];
    // const updateDeckOppo = updateDeck[opponentPlayerId];
    console.log(updateDeckPlayer)

    for (let i = updateDeckPlayer.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [updateDeckPlayer[i], updateDeckPlayer[j]] = [updateDeckPlayer[j], updateDeckPlayer[i]];
    }
    updateDeck[playerId] = updateDeckPlayer
    // 一人用なため不要
    // for (let i = updateDeckOppo.length - 1; i > 0; i--) {
    //     const j = Math.floor(Math.random() * (i + 1));
    //     [updateDeckOppo[i], updateDeckOppo[j]] = [updateDeckOppo[j], updateDeckOppo[i]];
    // }
    // updateDeck[opponentPlayerId] = updateDeckOppo
    console.log(updateDeck)

    fieldsSetter.setDeck(updateDeck);

    return updateDeck
}

// const checkQuickEffect = async (cardList, effectProps, setPlayers, socket, roomName, fields) => {
//     await handleQuickEffect(cardList, effectProps, setPlayers, socket, roomName, fields);
//     const useCard = await quickEffectConfirm(socket, roomName, effectProps);
//     console.log('quick effect timing use card', useCard);
// }

// クイックエフェクトの確認
// { fields, chainBlockCards, status:true/false }
const quickEffectConfirm = async (socket, roomName, setQuickEffectTiming, setChainBlockCards, conditions, setConditions, fields, fieldsSetter, playerId, opponentPlayerId, action, setAction, actionMonster, setActionMonster, quickEffectStack, setQuickEffectStack, otherProps) => {
    setChainBlockCards([]);
    let updatefields = fields;
    let newConditions = conditions
    // アクションモンスターがいればプロパティにセット
    console.log(action, actionMonster);
    if (actionMonster != '') {
        console.log(actionMonster);
        setAction(action);
        setActionMonster(actionMonster);
        socket.emit('addActionMonster', { roomName, actionMonster: actionMonster, action });
        if (action == "summon" && !conditions.includes("summon")) {
            newConditions = [...conditions, "summoned"]
            setConditions([...conditions, "summoned"]);
            socket.emit('conditionAdd', { roomName, condition: ["summoned"] });
        } else if (action == "attack" && !conditions.includes("attack")) {
            newConditions = [...conditions, "attack"]
            setConditions([...conditions, "attack"]);
            socket.emit('conditionAdd', { roomName, condition: ["attack"] });
        }
    } else {
        // アクションモンスターがなければ召喚や攻撃をしてないわけだから外す
        newConditions = conditions.filter((condition) => condition != "summoned" && condition != "attack");
        setConditions(newConditions);
        console.log('removed conditions')
        socket.emit('conditionRemove', { roomName, condition: ["summoned", "attack"] });
    }
    // updatefields.updatePlayers = await getPriority(updatefields.players, fieldsSetter.setPlayers, playerId, opponentPlayerId);
    console.log('setQuickEffectStack', quickEffectStack)
    let quickefectStatus = {}
    console.log((updatefields.spellTrapZone[playerId].some(id => id != null && allCards[id].faceStatus == "down" && allCards[id].canChange) || ((newConditions.includes('summoned') && updatefields.monsterZone[playerId].some(id => id != null && allCards[id].faceStatus != "downDef" && (allCards[id].effect.canUse || allCards[id].name == "カオス・ソルジャー －開闢の使者－") && allCards[id].effect.triggerCondition == "ignition")))))
    console.log(updatefields.spellTrapZone[playerId].some(id => id != null && allCards[id].faceStatus == "down" && allCards[id].canChange), newConditions.includes('summoned'), updatefields.monsterZone[playerId].some(id => id != null && allCards[id].faceStatus != "downDef" && (allCards[id].effect.canUse || allCards[id].name == "カオス・ソルジャー －開闢の使者－") && allCards[id].effect.triggerCondition == "ignition"))
    // // 裏向きの使用可能カードがあるか、または召喚時のみ起動効果持ちが居るか
    // if (updatefields.spellTrapZone[playerId].some(id => id != null && allCards[id].faceStatus == "down" && allCards[id].canChange) || ((newConditions.includes('summoned') && updatefields.monsterZone[playerId].some(id => id != null && allCards[id].faceStatus != "downDef" && (allCards[id].effect.canUse || allCards[id].name == "カオス・ソルジャー －開闢の使者－") && allCards[id].effect.triggerCondition == "ignition")))) {
    //     console.log('自身にクイックエフェクト')
    //     quickefectStatus = await quickEffectConfirmSelf(socket, setQuickEffectTiming, quickEffectStack, setQuickEffectStack)
    // } else {
    //     quickefectStatus = {status:false}
    // }
    // 手札から速攻魔法があるからもう自分は確定でクイックエフェクト聞く
    quickefectStatus = await quickEffectConfirmSelf(socket, setQuickEffectTiming, quickEffectStack, setQuickEffectStack)
    let quickefectStatusOppo = {}
    if (!quickefectStatus.status) {
        otherProps.setOppoChoicing(true)
        quickefectStatusOppo = await quickEffectConfirmOppo(socket, roomName, newConditions, updatefields, fieldsSetter, playerId, opponentPlayerId, "", quickEffectStack)
    }
    console.log('全部終わった', quickEffectStack)
    // setQuickEffectStack(0);
    otherProps.setOppoChoicing(false)
    // 相手がクイックエフェクトを使ってたらその後の盤面を返す
    if (quickefectStatusOppo.status) {
        console.log('相手がクイックエフェクト使ったよ', quickefectStatusOppo, JSON.stringify(quickefectStatusOppo))
        return quickefectStatusOppo;
        // 自分が使ってればその後の盤面を返す
    } else if (quickefectStatus.status) {
        console.log('自分がクイックエフェクト使ったよ', quickefectStatus, JSON.stringify(quickefectStatus))
        return quickefectStatus;
        // 二人とも使わなければそのまま
    } else {
        console.log('ふたりともクイックエフェクト使わなかったよ', quickefectStatus, quickefectStatusOppo, updatefields)
        // console.log('ふたりともクイックエフェクト使わなかったよ', quickefectStatus, quickefectStatusOppo, updatefields, JSON.stringify(updatefields))
        // 両者のクイックエフェクトが終わったタイミングで召喚と攻撃のコンディションを外す
        return { fields: updatefields, chainBlockCards:[], status:false }
    }
}

// 自身へのクイックエフェクト確認の応答を待つ
const selfQuickEffectConfirm = async (socket, roomName, updatefields, action, actionMonster, quickEffectStack) => {

    return new Promise((resolve, reject) => {
        console.log(quickEffectStack);
        socket.emit('quickEffectStart', { roomName, fields: updatefields, action, actionMonster, quickEffectStack: quickEffectStack});
        console.log('相手始動のクイックエフェクト確認(往復)の待機', quickEffectStack)
        socket.on('quickEffectEnd' + quickEffectStack, (result) => {
            console.log('相手始動の両者クイックエフェクト確認が終わりました', result)
            resolve(result);
            socket.off('quickEffectEnd' + quickEffectStack);

        });
    });
};

// 自身へのクイックエフェクト確認の応答を待つ
const quickEffectConfirmSelf = async (socket, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, setConditions, phaseEnd) => {
    if (phaseEnd == "phaseEnd") {
        console.log("phaseEnd")
        setConditions((prevState) => [...prevState, 'phaseEnd']);
    }
    // result.status = { fields, chainBlockCards, status:true/false}
    return new Promise((resolve, reject) => {
        setQuickEffectTiming(true);
        const stackNum = quickEffectStack + 1;
        setQuickEffectStack(stackNum);
        console.log('自分のクイックエフェクト待機', 'quickEffectSelf' + stackNum)
        socket.on('quickEffectSelf' + stackNum, (result) => {
            console.log('自身のquickeffectの結果が帰ってきました', result, stackNum)
            resolve(result);
            socket.off('quickEffectSelf' + stackNum);

        });
    });
};

// 相手のクイックエフェクト発動可否の応答を待つ
const quickEffectConfirmOppo = async (socket, roomName, conditions, fields, fieldsSetter, playerId, opponentPlayerId, eventName, quickEffectStack) => {
    console.log(eventName);
    console.log('quickEffectConfirm' + eventName)
    // result.status = { fields, status:true/false}
    const stackNum =  quickEffectStack + 1
    return new Promise((resolve, reject) => {
        console.log('相手のクイックエフェクト待機', stackNum)
        console.log('quickEffectConfirm' + eventName + stackNum)
        socket.emit('quickEffect', { roomName, conditions, quickEffectStack: stackNum});
        socket.on('quickEffectConfirm' + eventName + stackNum, async (result) => {
            console.log('相手のquickeffectの結果が帰ってきました', result, stackNum)
            let updatePlayers = await getPriority(fields.players, fieldsSetter.setPlayers, playerId, opponentPlayerId);
            result.fields.players = updatePlayers
            resolve(result);
            socket.off('quickEffectConfirm' + eventName + stackNum);

        });
    });
};

// カード選択
const asyncSelectCard = async (socket, cardId, targetIds, selectTargetProps, attackOption) => {
    console.log('target', targetIds, cardId);
    selectTargetProps.setTargetCards(targetIds);
    if (attackOption != undefined) {
        selectTargetProps.setAttackOption(attackOption);
    }
    // 選択したカードを返す
    return new Promise((resolve, reject) => {
        handleSelectTarget(cardId, selectTargetProps);
        socket.on('selectCard', (result) => {
            selectTargetProps.setTargetCards([]);
            if (result != null) {
                resolve(result);
            } else {
                resolve(result);
                // reject(result);
            }
            socket.off('selectCard');

        });
    });
};

// 相手モンスター1体のコントローラーを自分に変更する
const betray = async (playerId, opponentPlayerId, fields, fieldsSetter, targetCardId) => {
    console.log(fields, 'fields', fieldsSetter, fieldsSetter, targetCardId, allCards[targetCardId])
    let updatefields = fields;
    let updatedMonsterZone = { ...fields.monsterZone };
    // updateMonsterZone[playerId] = updateMonsterZone[playerId].push(targetCard);
    // updateMonsterZone[opponentPlayerId] = updateMonsterZone[opponentPlayerId].filter((card) => card.id !== targetCard.id);
    // コントロール奪取側のモンスターがいっぱいの場合対象を破壊
    if (fields.monsterZone[playerId].filter(id => id != null).length == 5) {
        updatefields = await destroy(opponentPlayerId, updatefields, fieldsSetter, targetCardId);
        updatedMonsterZone = updatefields.monsterZone
    } else {
        // updatedMonsterZone = summon
        const index = updatedMonsterZone[playerId].indexOf(null); // 最初の空のスロットを探す
        if (index !== -1) {
            updatedMonsterZone[playerId][index] = targetCardId; // 空のスロットにカードを配置
        } else {
            console.log("ゾーンがいっぱいです"); // エラーメッセージや他の処理
        }
        // updatedMonsterZone[playerId] = [...updatedMonsterZone[playerId], targetCardId];
        updatedMonsterZone[opponentPlayerId] = updatedMonsterZone[opponentPlayerId].map((cardId) => cardId == targetCardId ? null : cardId);
        console.log('opp monster', updatedMonsterZone)
        fieldsSetter.setMonsterZone(updatedMonsterZone);
    }
    allCards[targetCardId].controller = playerId;
    
    // console.log('my monster', updateMonsterZoneplayerId)

    return updatedMonsterZone;
}

// setDamageValueにはLP変動するプレイヤーのsetXXXDamageValueが入る
const reduceLifePoint = async (players, setPlayers, playerId, value, setDamageValue) => {
    console.log(players, setDamageValue)
    // console.log(players, JSON.stringify(players), setDamageValue)
    // await awaitTime(1)
    const updatePlayers = { ...players };
    updatePlayers[playerId].hp -= value;
    console.log(updatePlayers)
    // console.log(updatePlayers, JSON.stringify(updatePlayers))
    setDamageValue(value)
    
    setPlayers(updatePlayers);
    return updatePlayers;
}

const reduceLifePointBoth = async (players, setPlayers, playerId, opponentPlayerId, value, setPlayerDamageValue, setOpponentPlayerDamageValue) => {
    const updatePlayers = { ...players };
    // await awaitTime(1)
    updatePlayers[playerId].hp -= value;
    updatePlayers[opponentPlayerId].hp -= value;
    console.log('setplayers', setPlayers)
    setPlayers(updatePlayers);
    // ダメージ表示アニメーション
    setPlayerDamageValue(value);
    setOpponentPlayerDamageValue(value);
    return updatePlayers;
}



// 攻撃を押したときに発動
const attack = async (socket, roomName, cardId, players, setPlayers, playerId, opponentPlayerId, fields, fieldsSetter, chainProps, chainCards, setChainConfirmFlag, selectTargetProps, effectProps, attackOption, setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps) => {
    let updatefields = fields;
    const JsonOppoMonster = JSON.stringify(fields.monsterZone[opponentPlayerId].filter(id => id != null));
    // 攻撃先の選択
    const targets = fields.monsterZone[opponentPlayerId].filter(id => id != null);
    console.log(fields, '攻撃可能先', targets);
    let targetCardId = '' 
    let reviveCheckObj = {};
    // 攻撃可能先がなければダイレクト
    if (targets.length != 0) {
        targetCardId = await asyncSelectCard(socket, cardId, targets, selectTargetProps, attackOption);
    } else {
        targetCardId = await asyncSelectCard(socket, cardId, [999], selectTargetProps, attackOption);
    }
    // ダイレクトのときはtargetCardId=''

    console.log('攻撃先', targetCardId);
    let attackedRoot = {}
    // 攻撃を辞める場合は終了
    if (targetCardId == null) {
        console.log('攻撃終了～～～～')
        return updatefields;
    }
    socket.emit('displayArrow', { roomName, attackCardId: cardId, targetCardId: targetCardId})
    // 攻撃対象を設定した時点で攻撃済フラグを立てる
    allCards[cardId].attackable = false;
    // 攻撃宣言をしたら表示形式は変えられないようにする
    allCards[cardId].canChange = false;

    const beforefields = fields;
    // 自身と相手に攻撃時のクイックエフェクトの確認。
    console.log(chainProps)
    chainProps.setAction('attack')
    chainProps.setActivateCard(cardId)
    // if (allCards[cardId].name == "イグザリオン・ユニバース") {
    //     let exarionChoice = await choice(cardId, updatefields);
    //     if (exarionChoice) {
    //         await triggerEffectAndWait(socket, roomName, cardId)
    //         await visualizeEffectAndWait(socket, roomName, cardId)
    //         updatefields = await cardEffects[allCards[cardId].effect.effectDetails[0]](socket, roomName, cardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps);
    //     }
    // }
    // クイックエフェクト前の相手モンスターの場所とuuidを保存
    let beforeMonsterInfo = await savedInfo(fields.monsterZone[opponentPlayerId].filter(id => id != null));

    // クイックエフェクト後に攻撃するモンスターのuuidを確認するためにクイックエフェクト確認前の値を保存
    const attackMonsterInfo = { id: cardId, uuid: allCards[cardId].uuid };

    console.log('attackOption', attackOption)
    chainProps.setAttackedTargetId(targetCardId);
    socket.emit('setAttackedTargetId', { roomName, targetCardId });
    // 攻撃宣言に対してのチェーン確認、攻撃先の再選択時にはチェーンの確認はしない
    if (attackOption != 'reSelect') {
        // socket.emit('addActionMonster', { roomName, actionMonster: cardId, action:'attack' });
        // socket.emit('conditionAdd', { roomName, condition: ['attack'] });
        // effectProps.attackedTarget = targetCardId;
        
        // ここでreviveをチェックしながらクイックエフェクトを実行する
        reviveCheckObj = await checkReviveAndQuickEffect(socket, roomName, setQuickEffectTiming, chainProps.setChainBlockCards, chainProps.conditions, chainProps.setConditions, updatefields, fieldsSetter, playerId, opponentPlayerId, 'attack', chainProps.setAction, cardId, chainProps.setActionMonster, quickEffectStack, setQuickEffectStack, otherProps);
        // let chainObj = await actionChain(socket, roomName, effectProps, playerId, opponentPlayerId, cardId, fields, fieldsSetter, chainCards, setChainConfirmFlag, chainProps, 'attack', setSpellSpeed, setQuickEffectTiming);
        // let quickEffectObj = await quickEffectConfirm(socket, roomName, setQuickEffectTiming, chainProps.setChainBlockCards, chainProps.conditions, chainProps.setConditions, updatefields, fieldsSetter, playerId, opponentPlayerId, 'attack', chainProps.setAction, cardId, chainProps.setActionMonster)
        console.log('蘇生確認クイックエフェクトオブジェクト', reviveCheckObj);
        let quickEffectObj = reviveCheckObj.quickEffectObj;

        updatefields = quickEffectObj.fields
        // const sideEffectObj = await sideEffectChain(socket, roomName, playerId, opponentPlayerId, updatefields, fieldsSetter, effectProps, chainProps, chainProps.chainConfirmFlag, setChainConfirmFlag, [], selectTargetProps, setEffecting, setSpellSpeed, setQuickEffectTiming)
        // updatefields = sideEffectObj.updatefields;
        // socket.emit('conditionRemove', { roomName, condition: ['attack'] });
        const newConditions = chainProps.conditions.filter(condition => condition != 'attack');
        chainProps.setConditions(newConditions);
        console.log('攻撃宣言後のクイックエフェクトタイミング',JSON.stringify(quickEffectObj),JSON.stringify(quickEffectObj.chainBlockCards),JSON.stringify([cardId]))
        // 何かカードを使ったら
        // while (quickEffectObj.chainBlockCards.length != 0) {
        //     console.log('なんかしら使った')
        //     // チェーン1で連続してリビデを使われたとき用
        //     if (allCards[quickEffectObj.chainBlockCards[0]].name == "リビングデッドの呼び声") {
        //         console.log('リビデ使った', quickEffectObj)
                
        //         console.log(quickEffectObj, allCards[quickEffectObj.chainBlockCards[0]]);
        //         // selectTargetProps.setActionMonster(allCards[chainObj.chainBlockCards[0]].link)
        //         effectProps.cardId = allCards[quickEffectObj.chainBlockCards[0]].link;
        //         // quickEffectObj = await actionChain(socket, roomName, effectProps, playerId, opponentPlayerId, allCards[quickEffectObj.chainBlockCards[0]].link, updatefields, fieldsSetter, [allCards[quickEffectObj.chainBlockCards[0]].link], setChainConfirmFlag, chainProps, 'summon', setSpellSpeed, setQuickEffectTiming);
        //         quickEffectObj = await quickEffectConfirm(socket, roomName, setQuickEffectTiming, chainProps.setChainBlockCards, newConditions, chainProps.setConditions, updatefields, fieldsSetter, playerId, opponentPlayerId)
        //     // リビデ以外を使ったら
        //     } else {
        //         console.log('リビデ以外使った',quickEffectObj)
        //         let effected = true
        //         // 両者がクイックエフェクトで何も使わなくなるまで聞き続ける
        //         // ↑効果発動の時点でpromiseが帰ってきてループしちゃう
        //         let quickEffected = {}
        //         // while (effected) {
        //             quickEffected = await quickEffectConfirm(socket, roomName, setQuickEffectTiming, chainProps.setChainBlockCards, newConditions, chainProps.setConditions, quickEffectObj.updateFields, fieldsSetter, playerId, opponentPlayerId)
        //             console.log("クイックエフェクト終了！！", quickEffected);
        //             effected = quickEffected.status
        //         // }
        //         updatefields = quickEffected.updatefields;
        //         quickEffectObj.chainBlockCards = [];
        //     }
        // }
    }
    // ↓beforefieldsとupdatefieldsの差で判別
    console.log('attacked', beforefields, fields, updatefields);
    // アタックモンスターが居なくなったら中止、相手モンスターの増減により攻撃先の変更及び中止を選択
    
    console.log('batttle info', fields, updatefields, beforeMonsterInfo, attackMonsterInfo);
    console.log(reviveCheckObj)
    // 攻撃宣言したモンスターが相手フィールドに写ってたりしたら
    if (!(updatefields.monsterZone[playerId].includes(cardId)) || allCards[cardId].controller != playerId) {
        socket.emit('offArrow', { roomName });
        return updatefields
    }

    updatefields.players = await getPriority(updatefields.players, fieldsSetter.setPlayers, opponentPlayerId, playerId);
    // 攻撃時のコンディションを外す
    let newConditions = chainProps.conditions.filter((condition) => condition != "attack")
    newConditions = [...newConditions , 'battleStep']
    chainProps.setConditions(newConditions);
    socket.emit('conditionRemove', { roomName, condition: ["attack"] });
    // イグユニの発動及びチェーン、それに伴いクイックエフェクト確認
    // if (attackOption != 'reSelect') {
    // ↓全てにおいてクイックエフェクトするっぽい
    // if (true) {
    //     if (allCards[cardId].location === 'monsterZone' && (allCards[cardId].uuid === attackMonsterInfo.uuid)) {
    //         // イグユニの効果発動
    //         // 攻撃先モンスターが守備表示限定
    //         if (allCards[cardId].name == "イグザリオン・ユニバース" && allCards[cardId].effect.canUse && (targetCardId != '' && (allCards[cardId].faceStatus == "def" || allCards[cardId].faceStatus == "downDef"))) {
    //             socket.emit('addActionMonster', { roomName, actionMonster: '', action: 'battleStep' });
    //             chainProps.setAction('battleStep')
    //             // let exarionChoice = await choice(cardId, updatefields);
    //             // if (exarionChoice) {
    //             //     await triggerEffectAndWait(socket, roomName, cardId)
    //             //     // await visualizeEffectAndWait(socket, roomName, cardId)
    //             //     reviveCheckObj = await checkReviveAndChain(socket, roomName, cardId, playerId, opponentPlayerId, updatefields, fieldsSetter, effectProps, chainProps, false, setChainConfirmFlag, [], selectTargetProps, setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps)
    //             //     // updatefields = await cardEffects[allCards[cardId].effect.effectDetails[0]](socket, roomName, cardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps);
    //             //     console.log(reviveCheckObj)
    //             //     console.log(reviveCheckObj.quickEffectObj)
    //             //     console.log(reviveCheckObj.quickEffectObj.fields)
    //             //     let quickEffectObj = reviveCheckObj.quickEffectObj;
    //             //     updatefields = quickEffectObj.updateFields
    //             // }
    //         } else {
    //             socket.emit('addActionMonster', { roomName, actionMonster: '', action: 'battleStep' });
    //             chainProps.setAction('battleStep')
    //             chainProps.setActionMonster('')
    //         }
    //     }
    // }
    // 攻撃モンスターが居なくなったら中止
    // 攻撃モンスターが自分フィールド上から消えても中止
    if (!(allCards[cardId].location === 'monsterZone' && (allCards[cardId].uuid === attackMonsterInfo.uuid) || !(updatefields.monsterZone[playerId].includes(cardId)))) {
        socket.emit('offArrow', { roomName });
        // updatefields = await attack(socket, roomName, cardId, players, setPlayers, playerId, opponentPlayerId, updatefields, fieldsSetter, chainProps, chainCards, setChainConfirmFlag, selectTargetProps, effectProps, 'reSelect', setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps)
        return updatefields;
    }
    // 盤面変化を検知したらreSelect
    if (!((JsonOppoMonster == JSON.stringify(updatefields.monsterZone[opponentPlayerId].filter(id => id != null))) && !reviveCheckObj.result)) {
        socket.emit('offArrow', { roomName });
        updatefields = await attack(socket, roomName, cardId, players, setPlayers, playerId, opponentPlayerId, updatefields, fieldsSetter, chainProps, chainCards, setChainConfirmFlag, selectTargetProps, effectProps, 'reSelect', setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps)
        return updatefields;
    }
    // 盤面変化確認フラグ
    let reSelectFlag = false;
    // クイックエフェクト何も使わないまで一生聞く。
    // イグユニは自身が攻撃時にのみ効果発動を可能にする
    // if (allCards[cardId].name == "イグザリオン・ユニバース") {
    //     allCards[cardId].effect.canUse = true
    // }

    do {
        socket.emit('addActionMonster', { roomName, actionMonster: '', action: 'battleStep' });
        chainProps.setAction('battleStep')
        chainProps.setActionMonster('')
        reviveCheckObj = await checkReviveAndQuickEffect(socket, roomName, setQuickEffectTiming, chainProps.setChainBlockCards, newConditions, chainProps.setConditions, updatefields, fieldsSetter, playerId, opponentPlayerId, '', chainProps.setAction, '', chainProps.setActionMonster, quickEffectStack, setQuickEffectStack, otherProps);
        console.log('攻撃宣言後のクイックエフェクトの確認だ～', reviveCheckObj)
        console.log('使った？', reviveCheckObj.quickEffectObj.status)
        let quickEffectObj = reviveCheckObj.quickEffectObj;
        updatefields = quickEffectObj.fields
        console.log('盤面変化を確認')

        console.log(!(allCards[cardId].location === 'monsterZone' && (allCards[cardId].uuid === attackMonsterInfo.uuid) || !((JsonOppoMonster == JSON.stringify(updatefields.monsterZone[opponentPlayerId].filter(id => id != null))) && !reviveCheckObj.result)))
        console.log(!(allCards[cardId].location === 'monsterZone' && (allCards[cardId].uuid === attackMonsterInfo.uuid)))
        console.log(!((JsonOppoMonster == JSON.stringify(updatefields.monsterZone[opponentPlayerId].filter(id => id != null))) && !reviveCheckObj.result))

        // 攻撃モンスター消えたら即終了
        if (!(allCards[cardId].location === 'monsterZone' && (allCards[cardId].uuid === attackMonsterInfo.uuid)) || !(updatefields.monsterZone[playerId].includes(cardId))) {
            socket.emit('offArrow', { roomName });
            return updatefields;
        }
        // 盤面変化を検知したら即刻停止
        if (!((JsonOppoMonster == JSON.stringify(updatefields.monsterZone[opponentPlayerId].filter(id => id != null))) && !reviveCheckObj.result)) {
            console.log('盤面変化を検知', quickEffectObj)
            reSelectFlag = true
            break
        }
    } while (reviveCheckObj.quickEffectObj.status)

    // 盤面変化してたら矢印消して再選択に移行
    if (reSelectFlag) {
        socket.emit('offArrow', { roomName });
        updatefields = await attack(socket, roomName, cardId, players, setPlayers, playerId, opponentPlayerId, updatefields, fieldsSetter, chainProps, chainCards, setChainConfirmFlag, selectTargetProps, effectProps, 'reSelect', setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps)
        return updatefields;
    }
    // if (allCards[cardId].name == "イグザリオン・ユニバース") {
    //     allCards[cardId].effect.canUse = false
    // }
    newConditions = newConditions.filter((condition) => condition != "battleStep")
    chainProps.setConditions(newConditions);

    // 攻撃したモンスターが居続けるなら続行。破壊→蘇生された時用にuuidで確認
    if (allCards[cardId].location === 'monsterZone' && (allCards[cardId].uuid === attackMonsterInfo.uuid)) {

        const beforeJSONoppoMonster = JSON.stringify(fields.monsterZone[opponentPlayerId].filter(id => id != null))
        const updateJSONoppoMonster = JSON.stringify(updatefields.monsterZone[opponentPlayerId].filter(id => id != null))
        console.log(beforeJSONoppoMonster, updateJSONoppoMonster, (beforeJSONoppoMonster == updateJSONoppoMonster))
        console.log(JsonOppoMonster,JSON.stringify(fields.monsterZone[opponentPlayerId]), JSON.stringify(updatefields.monsterZone[opponentPlayerId]), JSON.stringify((fields.monsterZone[opponentPlayerId]) == JSON.stringify(updatefields.monsterZone[opponentPlayerId])))
        // 攻撃先モンスターが居るか
        console.log(beforeMonsterInfo)
        console.log(beforeMonsterInfo[targetCardId])
        // 攻撃先のモンスターが増減したり蘇生されたりしていないか、あとダイレクトのときは通す
        // if ((JsonOppoMonster == JSON.stringify(updatefields.monsterZone[opponentPlayerId])) && ((Object.keys(beforeMonsterInfo).length === 0 ) || allCards[targetCardId].location === 'monsterZone' && (beforeMonsterInfo[targetCardId].uuid === allCards[targetCardId].uuid))) {
        if ((JsonOppoMonster == JSON.stringify(updatefields.monsterZone[opponentPlayerId].filter(id => id != null))) && !reviveCheckObj.result) {
            

            // 相手モンスターのlocation,uuidが変わってないかチェック
            const allMatched = JSON.parse(JsonOppoMonster).map(id => {
                const card = allCards[id];
                console.log(card, card.location, beforeMonsterInfo[id].location, '', card.uuid, beforeMonsterInfo[id].uuid)
                if (card) {
                    return card.location === beforeMonsterInfo[id].location && card.uuid === beforeMonsterInfo[id].uuid;
                }

                return updatefields;
            }).every(result => result);
            console.log(allMatched);
            if (allMatched) {
                console.log('問題なし！')
                // イグユニの効果確認の前に優先権を奪う
                // updatefields.players = await getPriority(updatefields.players, fieldsSetter.setPlayers, opponentPlayerId, playerId);
                // // イグユニの効果発動
                // if (allCards[cardId].name == "イグザリオン・ユニバース" && allCards[cardId].effect.canUse) {
                //     let exarionChoice = await choice(cardId, updatefields);
                //     if (exarionChoice) {
                //         await triggerEffectAndWait(socket, roomName, cardId)
                //         await visualizeEffectAndWait(socket, roomName, cardId)
                //         updatefields = await cardEffects[allCards[cardId].effect.effectDetails[0]](socket, roomName, cardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps);
                //     }
                // }
                // 問題なければバトル開始。適宜効果処理
                updatefields = await battle(socket, roomName, cardId, targetCardId, players, setPlayers, playerId, opponentPlayerId, updatefields, fieldsSetter, chainProps, chainCards, setChainConfirmFlag, selectTargetProps, effectProps, setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps);
                if (updatefields.decision) {
                    // 勝敗が決していれば即座に返す 実際はdecisionObjが返される
                    return updatefields;
                }
                updatefields.players = await getPriority(updatefields.players, fieldsSetter.setPlayers, playerId, opponentPlayerId);
                // attackedRoot.unmount();
                console.log('アタック終了！')
                return updatefields
            } else {
                console.log('uuid変わったよ')
            }

            
            // 相手モンスターの数が変わっている場合の攻撃先変更orキャンセルの確認
            console.log('相手モンスターの数が変わったよ！')
        }
        console.log('相手モンスター消えたよ')
        if (attackedRoot) {
            // attackedRoot.unmount();
            // console.log(attackedRoot, JSON.stringify(attackedRoot));
            socket.emit('offArrow', { roomName });
        }
        updatefields = await attack(socket, roomName, cardId, players, setPlayers, playerId, opponentPlayerId, updatefields, fieldsSetter, chainProps, chainCards, setChainConfirmFlag, selectTargetProps, effectProps, 'reSelect', setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps)
        if (updatefields.decision) {
            // 勝敗が決していれば即座に返す 実際はdecisionObjが返される
            return updatefields;
        }
    }
    if (attackedRoot) {
        // attackedRoot.unmount();
        socket.emit('offArrow', { roomName });
    }
    // 攻撃モンスターが居ないので終了
    console.log('攻撃したモンスター消えたよ')
    return updatefields
    
}

// ダメージステップ
const battle = async (socket, roomName, cardId, targetCardId, players, setPlayers, playerId, opponentPlayerId, fields, fieldsSetter, chainProps, chainCards, setChainConfirmFlag, selectTargetProps, effectProps, setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps) => {
    // ダメージステップ開始時はすることないのでスキップ
    console.log('battle', cardId, targetCardId);
    let damage = 0;
    let destroyCards = [];
    const card = allCards[cardId]
    let targetCard = {}
    // ダイレクトのときは相手モンスター無し
    if (targetCardId != '') {
        targetCard = allCards[targetCardId]
    }
    // ダイレクトのときはtargetCardId=''

    let updatefields = fields;
    let reverseFlag = false;
    let decisionObj = { decision: false, winner: 'none' };


    // 攻撃先がモンスターであれば、ダイレクトじゃないとき
    if (targetCardId) {
        // 攻撃先が裏守備なら反転(ダメージ計算前)
        if (targetCard.faceStatus == 'downDef') {
            await reverse(targetCardId, 'def');
            socket.emit('reverse', { roomName, cardId: targetCardId, face: 'def' });
            console.log('open')
            console.log('reverse flag check', targetCard.effect.triggerCondition.includes('reverse'), (card.name != 'ブレイドナイト' || updatefields.monsterZone[playerId].filter(id => id != null).length != 1))
            // 相手が裏守備のモンスターかつ単体のブレイドナイトでなければリバースを後で発動
            if (targetCard.effect.triggerCondition.includes('reverse') && (card.name != 'ブレイドナイト' || updatefields.monsterZone[playerId].filter(id => id != null).length != 1)) {
                // セイマジは不発だとしてもこの時点で効果発動済にする
                if (targetCard.name == '聖なる魔術師') {
                    targetCard.effect.canUse = false;
                }
                // セイマジの墓地がなかったらリバースフラグは立てない
                if (targetCard.name == 'ファイバーポッド' || (targetCard.name == '聖なる魔術師' && updatefields.graveyard[targetCard.controller].filter((id) => allCards[id].cardtype == 'Spell').length != 0)) {
                    reverseFlag = true;
                }
            }
        }
    }
    // (ダメージ計算時)
    // お注射天使リリーの効果発動確認
    let lilyEffectChoice = null
    let useOppoLily = null
    // 自身のLPが2000より多くあるか
    updatefields.players = await getPriority(updatefields.players, fieldsSetter.setPlayers, opponentPlayerId, playerId);
    // 自分のリリーの発動確認
    if (card.name == 'お注射天使リリー' && card.faceStatus == "attack" && updatefields.players[playerId].hp > 2000) {
        lilyEffectChoice = await choice(cardId, updatefields);
        if (lilyEffectChoice) {
            await triggerEffectAndWait(socket, roomName, cardId)
            // await visualizeEffectAndWait(socket, roomName, cardId)
            // updatefields = await cardEffects[card.effect.effectDetails[0]](socket, roomName, cardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps);
        }
    }
    // 相手のリリーの発動確認
    if (targetCardId && targetCard.name == 'お注射天使リリー' && targetCard.faceStatus == "attack" && updatefields.players[opponentPlayerId].hp > 2000) {
        // 相手にも確認。LPが2000より多くあるか
        otherProps.setOppoChoicing(true)
        const lilyobj = await opponentLily(socket, roomName, playerId, updatefields, targetCardId);
        otherProps.setOppoChoicing(false)

        useOppoLily = lilyobj.updatefields;
        console.log('useOppoLily', useOppoLily)
    }
    // 素直に両方が使った場合には自分→相手の順で発動(相手から先に処理)
    if (lilyEffectChoice === true && useOppoLily === true) {
        console.log('自分相手使った')
        await visualizeEffectAndWait(socket, roomName, targetCardId)
        updatefields = await cardEffects[targetCard.effect.effectDetails[0]](socket, roomName, targetCardId, opponentPlayerId, playerId, updatefields, fieldsSetter, selectTargetProps);
        await visualizeEffectAndWait(socket, roomName, cardId)
        updatefields = await cardEffects[card.effect.effectDetails[0]](socket, roomName, cardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps);

    // 自分が使わずに相手が使ったらもう一回自分に確認をして、その後処理
    // 相手→自分発動なので自分から先に処理
    } else if (lilyEffectChoice === false && useOppoLily === true) {
        console.log('相手使った')
        lilyEffectChoice = await choice(cardId, updatefields);
        if (lilyEffectChoice) {
            console.log('相手自分使った')
            await triggerEffectAndWait(socket, roomName, cardId)
            await visualizeEffectAndWait(socket, roomName, cardId)
            updatefields = await cardEffects[card.effect.effectDetails[0]](socket, roomName, cardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps);
            await visualizeEffectAndWait(socket, roomName, targetCardId)
            updatefields = await cardEffects[targetCard.effect.effectDetails[0]](socket, roomName, targetCardId, opponentPlayerId, playerId, updatefields, fieldsSetter, selectTargetProps);
            // 相手が使って結局自分は使わないとき
        } else {
            console.log('相手だけ使った')
            await visualizeEffectAndWait(socket, roomName, targetCardId)
            updatefields = await cardEffects[targetCard.effect.effectDetails[0]](socket, roomName, targetCardId, opponentPlayerId, playerId, updatefields, fieldsSetter, selectTargetProps);
        }
    // 自分が使って相手が使わないもしくはリリーじゃないとき
    } else if (lilyEffectChoice === true && (useOppoLily == false || useOppoLily == null)) {
        console.log('自分だけ')
        await visualizeEffectAndWait(socket, roomName, cardId)
        updatefields = await cardEffects[card.effect.effectDetails[0]](socket, roomName, cardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps);

    // 相手が使って自分が使わないもしくはリリーじゃないとき
    } else if (useOppoLily == true && (lilyEffectChoice == false || lilyEffectChoice == null)) {
        console.log('相手だけ')
        await visualizeEffectAndWait(socket, roomName, targetCardId)
        updatefields = await cardEffects[targetCard.effect.effectDetails[0]](socket, roomName, targetCardId, opponentPlayerId, playerId, updatefields, fieldsSetter, selectTargetProps);

    }
    socket.emit('chainCountMsgReset', { roomName });
    // 攻守確定
    // ダメージ確定(ダメージ計算)
    socket.emit('offArrow', { roomName });
    await attackMoveAnimation(socket, roomName, cardId, targetCardId)


    if (targetCardId) {
        // 相手が攻撃表示のとき
        if (targetCard.faceStatus == 'attack') {
            // 戦闘ダメージを計算
            damage = card.attack - targetCard.attack;
            // ダメージから破壊対象を保存
            // ダメージが0なら両方行われる
            if (damage >= 0 && targetCard.name != '魂を削る死霊') {
                destroyCards.push(targetCard);
            }
            if (damage <= 0 && card.name != '魂を削る死霊') {
                destroyCards.push(card);
            }
        // 相手が守備、裏守備のとき
        } else {
            // 攻撃力が守備力以上であれば
            if (card.attack > targetCard.defense) {
                // パーシアスまたはイグユニ(効果が発動していれば(効果使用済みなら))
                if ((card.name == '天空騎士パーシアス' ) || (card.name == 'イグザリオン・ユニバース' && !card.effect.canUse)) {
                    damage = card.attack - targetCard.defense
                } else {
                    damage = 0;
                }
                if (targetCard.name != '魂を削る死霊') {
                    destroyCards.push(targetCard);
                }
            // 攻撃力が守備力未満であれば
            } else {
                // 自身に発生するダメージ
                damage = card.attack - targetCard.defense;
            }

        }
    } else {
        // ダイレクトのときは攻撃力がそのままダメージ
        damage = card.attack;
    }
    socket.emit('chainCountMsgReset', { roomName });
    console.log('damage', damage)
    console.log('updatefields.players', updatefields.players)
    // console.log('updatefields.players', updatefields.players, JSON.stringify(updatefields.players))
    // LPなどのダメージ発生
    if (damage != 0) {
        let updatePlayers = updatefields.players;
        if (damage > 0) {
            const message = card.name + "の攻撃により" + damage + "ポイントのダメージを受けました"
            socket.emit('messageLog', { roomName: roomName, type: 'damageLog', playerId: opponentPlayerId, message: message }) 
            updatePlayers = await reduceLifePoint(updatePlayers, fieldsSetter.setPlayers, opponentPlayerId, damage, selectTargetProps.setOpponentPlayerDamageValue);
            socket.emit('reduceLP', { roomName, playerId: opponentPlayerId, value: damage });
        } else {
            const message = card.name + "で攻撃しましたが" + damage * -1 + "ポイントのダメージを受けました"
            socket.emit('messageLog', { roomName: roomName, type: 'damageLog', playerId: playerId, message: message }) 
            // 自分が食らうときはダメージが負の値なので-1をかける
            updatePlayers = await reduceLifePoint(updatePlayers, fieldsSetter.setPlayers, playerId, damage * -1, selectTargetProps.setPlayerDamageValue);
            socket.emit('reduceLP', { roomName, playerId: playerId, value: damage * -1 });
        }
        updatefields.players = updatePlayers
        console.log('updateplayers',updatePlayers)

    }
    console.log(updatefields.players, JSON.stringify(updatefields.players))
    if (updatefields.players[opponentPlayerId].hp <= 0 || updatefields.players[playerId].hp <= 0) {
        console.log(otherProps, JSON.stringify(otherProps));
        updatefields.players = await matchDataUpdate(playerId, opponentPlayerId, updatefields, otherProps.turnCount);
    }
    // LPのチェック
    if (updatefields.players[opponentPlayerId].hp <= 0) {
        // 決まってたら試合終了
        decisionObj.decision = true;
        decisionObj.winner = playerId;

        socket.emit('decision', { roomName, decisionObj, result: updatefields.players[playerId].matchData })
        return decisionObj;
    } else if (updatefields.players[playerId].hp <= 0) {
        decisionObj.decision = true;
        decisionObj.winner = opponentPlayerId;

        socket.emit('decision', { roomName, decisionObj, result: updatefields.players[playerId].matchData })
        return decisionObj;
    }

    // 戦闘破壊確定
    // ショッカーのみ先にlocationをgraveyardにして効果をOFFにする
    // 別に破壊されるまでにトラップが使えないから関係ない
    // if ((cardId == 29 || cardId == 79) && destroyCards.includes(card)) {
    //     card.location = 'graveyard'
    // }
    // if ((targetCardId == 29 || targetCardId == 79) && destroyCards.includes(targetCard)) {
    //     targetCard.location = 'graveyard'
    // }

    // (ダメージ計算後)

    // お注射天使リリーの効果を戻す
    if (card.name == 'お注射天使リリー' && card.attack == 3400) {
        await attackIncrease(cardId, -3000);
        socket.emit('attackIncrease', { roomName, cardId, value: -3000 });
    }

    if (Object.keys(targetCard).length != 0) {
        // ダイレクトじゃなければ相手にも確認
        if (targetCard.name == 'お注射天使リリー' && targetCard.attack == 3400) {
            await attackIncrease(targetCardId, -3000);
            socket.emit('attackIncrease', { roomName, cardId: targetCardId, value: -3000 });
        }
    }
    // パーシアス、首領、たけし、カイクウの効果処理
    if (card.effect.triggerCondition.includes('damageConfirm') && damage > 0) {
        // カイクウと首領のみ追加効果の発動確認
        let damageConfirmEffectChoice = true;
        console.log(updatefields.monsterZone[opponentPlayerId])
        console.log(updatefields.monsterZone[opponentPlayerId].some((id) => id != null && allCards[id].name == "霊滅術師カイクウ"))
        console.log(!updatefields.monsterZone[opponentPlayerId].some((id) => id != null && allCards[id].name == "霊滅術師カイクウ"))
        // カイクウは相手の場にカイクウが居たら、墓地にモンスターが一枚も無ければ発動不可
        if ((card.name == '霊滅術師カイクウ' && !updatefields.monsterZone[opponentPlayerId].some((id) => id != null && allCards[id].name == "霊滅術師カイクウ") && updatefields.graveyard[opponentPlayerId].some((id) => allCards[id].cardtype == "Monster"))
            || (card.name == '首領・ザルーグ' && (updatefields.hand[opponentPlayerId].length != 0 || updatefields.deck[opponentPlayerId].length > 1))) {
            damageConfirmEffectChoice = await choice(cardId, updatefields);
        } else {
            damageConfirmEffectChoice = false;
        }
        // else if (card.name == '霊滅術師カイクウ' && updatefields.monsterZone[opponentPlayerId].some((id) => allCards[id].name == "霊滅術師カイクウ")) {
        //     damageConfirmEffectChoicefalse
        // }
        // たけしとパーシアスは強制発動
        if (card.name == "天空騎士パーシアス" || card.name == '魂を削る死霊') {
            damageConfirmEffectChoice = true
        }
        // たけしはダイレクト時のみ
        if (damageConfirmEffectChoice && (card.name != '魂を削る死霊' || !targetCardId)) {
            console.log('ダメージ計算時効果発動', card, targetCard, selectTargetProps);
            if (card.name == '霊滅術師カイクウ') {
                const graveyardMonster = updatefields.graveyard[opponentPlayerId].filter((cardId) => allCards[cardId].cardtype == 'Monster');
                // カイクウは墓地に一枚以上モンスターがないと発動不可
                if (graveyardMonster.length > 0) {
                    await awaitTime(300)
                    await triggerEffectAndWait(socket, roomName, cardId)
                    await visualizeEffectAndWait(socket, roomName, cardId)
                    updatefields = await cardEffects[card.effect.effectDetails[0]](socket, roomName, cardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps);
                }
            } else {
                await awaitTime(300)
                await triggerEffectAndWait(socket, roomName, cardId)
                await visualizeEffectAndWait(socket, roomName, cardId)
                updatefields = await cardEffects[card.effect.effectDetails[0]](socket, roomName, cardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps);
            }
        }
        // 自傷で相手モンスターの戦闘ダメ発生効果の確認
    } else if (targetCardId != '' && targetCard.effect.triggerCondition.includes('damageConfirm') && damage < 0) {
        if ((targetCard.name == '霊滅術師カイクウ' && !updatefields.monsterZone[playerId].some((id) => id != null && allCards[id].name == "霊滅術師カイクウ") && updatefields.graveyard[playerId].some((id) => allCards[id].cardtype == "Monster"))
            || (targetCard.name == '首領・ザルーグ' && (updatefields.hand[playerId].length != 0 || updatefields.deck[playerId].length > 1)) || (targetCard.name == '天空騎士パーシアス') ) {
            otherProps.setOppoChoicing(true)
            const opponentMonsterEffectObj = await opponentMonsterEffect(socket, roomName, playerId, updatefields, targetCardId, cardId);
            otherProps.setOppoChoicing(false)
            updatefields = opponentMonsterEffectObj.updatefields
        }
    }
    if (updatefields.decision) {
        return updatefields;
    }
    socket.emit('chainCountMsgReset', { roomName });

    let effectTargetCardId = null
    // リバースモンスターの発動エフェクト
    if (reverseFlag) {
        await triggerEffectAndWait(socket, roomName, targetCardId)
        if (targetCard.name == '聖なる魔術師') {
            effectTargetCardId = await opponentCheckEffectTarget(socket, roomName, targetCardId, otherProps.setOppoChoicing);
            targetCard.effect.canUse = false
            console.log(effectTargetCardId)
            // 直レンダリングで使うから要らないけど一応
            chainProps.setEffectTarget(effectTargetCardId)
        }
    }
    
    // 異次元の女戦士の効果使用フラグ
    let DDEffectChoice = false
    let oppoDDEffectChoice = false
    
    // 女戦士はリバースのあとにチェーンする形で発動する
    if (card.name == '異次元の女戦士' && Object.keys(targetCard).length != 0) {
        // 女戦士の効果確認
        DDEffectChoice = await choice(cardId, updatefields, targetCardId, effectTargetCardId);
        if (DDEffectChoice) {
            await triggerEffectAndWait(socket, roomName, cardId)
            await visualizeEffectAndWait(socket, roomName, cardId)
            updatefields = await cardEffects[card.effect.effectDetails[0]](socket, roomName, cardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps, targetCardId);
        }
    }
    // リバース効果の処理。女戦士より後
    if (reverseFlag) {
        otherProps.setOppoChoicing(true)
        const enforceActivateObj = await opponentActivate(socket, roomName, playerId, updatefields, targetCardId);
        otherProps.setOppoChoicing(false)
        updatefields = enforceActivateObj.updatefields;
    }
    socket.emit('chainCountMsgReset', { roomName });

    // ファイバーポッドが発動してたらこのあとの処理は要らないので矯正終了
    if ((Object.keys(targetCard).length != 0) && targetCard.name == 'ファイバーポッド' && reverseFlag) {
        console.log('ファイバーポッド発動して戦闘終了', updatefields, JSON.stringify(updatefields))
        updatefields.players = await getPriority(updatefields.players, fieldsSetter.setPlayers, playerId, opponentPlayerId);
        return updatefields
    }

    // 攻撃側女戦士が効果発動していたら発動しない
    if ((Object.keys(targetCard).length != 0) && !DDEffectChoice && targetCard.name == '異次元の女戦士') {
        // 相手が使うからカードの順は逆で渡す
        otherProps.setOppoChoicing(true)
        let DDobj = await opponentMonsterEffect(socket, roomName, playerId, updatefields, targetCardId, cardId);
        otherProps.setOppoChoicing(false)
        // なんかプレイヤー情報が抜ける
        DDobj.updatefields.players = updatefields.players
        console.log(DDobj)
        updatefields = DDobj.updatefields
        oppoDDEffectChoice = DDobj.oppoDDEffectChoice
    }
    socket.emit('chainCountMsgReset', { roomName });
    // (ダメージステップ終了)
    chainProps.setEffectTarget(null)

    // カードの破壊
    console.log('破壊されるカードは', destroyCards, DDEffectChoice, oppoDDEffectChoice)
    if (destroyCards && !DDEffectChoice && !oppoDDEffectChoice) {
        console.log('battle destroy')
        for(const card of destroyCards) {
            socket.emit('destroy', { roomName, fields: updatefields, playerId: card.controller, cardId: card.id });
            updatefields = await destroy(card.controller, updatefields, fieldsSetter, card.id);
            console.log('battle destroying ', card, updatefields)
        }

    }

    // 一連の処理終了。攻撃終了時のクイックエフェクトの確認
    // chainconfrimFlagは使ってない
    await sideEffectChain(socket, roomName, playerId, opponentPlayerId, updatefields, fieldsSetter, effectProps, chainProps, null, setChainConfirmFlag, [], selectTargetProps, setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps)

    // 相手にも効果確認
    if (card.name == 'カオス・ソルジャー －開闢の使者－' && card.effect.canUse == true && destroyCards.length == 1) {
        const blackLusterChoice = await choice(cardId, updatefields);
        if (blackLusterChoice) {
            console.log('開闢の二回攻撃するよ')
            await triggerEffectAndWait(socket, roomName, cardId)
            await visualizeEffectAndWait(socket, roomName, cardId)
            updatefields = await cardEffects[card.effect.effectDetails[1]](socket, roomName, cardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps, targetCardId);
            updatefields = await attack(socket, roomName, cardId, updatefields.players, setPlayers, playerId, opponentPlayerId, updatefields, fieldsSetter, chainProps, chainCards, setChainConfirmFlag, selectTargetProps, effectProps, 'reAttack', setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps)
            if (updatefields.decision) {
                // 勝敗が決していれば即座に返す 実際はdecisionObjが返される
                return updatefields;
            }
            console.log('開闢の二回攻撃終わったよ')
        }
    }
    console.log('バトル終了！！', updatefields)
    updatefields.players = await getPriority(updatefields.players, fieldsSetter.setPlayers, playerId, opponentPlayerId);
    return updatefields
}

const attackIncrease = async (cardId, value) => {
    allCards[cardId].attack += value;
}
// 護封剣用の処理、裏守備のカードが渡される
const openCards = async (cardIds) => {
    if (cardIds.length != 0) {
        cardIds.forEach((cardId) => {
            allCards[cardId].faceStatus = 'def';
        })
    }
}

// ターンエンド時の色々処理
// 毎ターン両プレイヤーで実行される
const endTurn = async (socket, roomName, players, playerId, opponentPlayerId, fields, fieldsSetter) => {
    console.log('endturn')
    let updatefields = fields;
    let updatePlayers = players;
    const myMonsterZone = fields.monsterZone[playerId];
    const oppoMonsterZone = fields.monsterZone[opponentPlayerId];
    const allMonster = myMonsterZone.concat(oppoMonsterZone);
    const mySpellTrapZone = fields.spellTrapZone[playerId];
    const oppoSpellTrapZone = fields.spellTrapZone[opponentPlayerId];
    const allSpellTrap = mySpellTrapZone.concat(oppoSpellTrapZone).filter(id => id != null);
    const allFieldsCards = allMonster.concat(allSpellTrap).filter(id => id != null);
    let snatchSteelCards = []

    // 全てのモンスターゾーンの効果使用を可能にする
    allFieldsCards.forEach((cardId) => {
        const card = allCards[cardId];
        // モンスターとか魔法とかあんまり区分けしなくても良さそうだけど拡張性のため
        if (card.cardtype == 'Monster') {
            card.attackable = true;
            // イグユニは効果使用済みの場合は攻撃力を戻す
            if (card.name == 'イグザリオン・ユニバース' && card.attack != 1800){
                card.attack = 1800;
            };
            // 魔導戦士ブレイカーはカウンター依存なので魔導戦士ブレイカー以外の効果使用を可能にする。ブレイドナイトは効果なし.リバース効果もちも変更しない
            if (card.name != '魔導戦士ブレイカー' && card.name != 'ブレイドナイト' && card.effect.triggerCondition != 'reverse') {
                card.effect.canUse = true;
            }
        } else if (card.cardtype == 'Spell' || card.cardtype == 'Trap'){
            // 永続、装備、護封剣は使用できないようにする
            if (card.category != 'continuous' && card.category != 'equip' && card.category != 'swordsOfRevealingLight') {
                card.effect.canUse = true;
            }
        } else if (card.cardtype == 'Token') {
            card.attackable = true;
        }
        card.canChange = true;
    })
    
    // 墓地と手札の心変わりのリンクから奪っているモンスターを返却
    // 墓地手札魔法罠の心変わり全部
    const graveyardChangeOfHeart = fields.graveyard[playerId].concat(fields.graveyard[opponentPlayerId], fields.hand[playerId], fields.hand[opponentPlayerId], fields.spellTrapZone[playerId], fields.spellTrapZone[opponentPlayerId]).filter((cardId) => cardId != null && allCards[cardId].name == '心変わり');
    let changeOfHeartTarget = []
    // 全心変わりの対象を取得
    // リンク先のカードを取得しながら心変わりのリンク解除
    if (graveyardChangeOfHeart.length != 0) {
        graveyardChangeOfHeart.forEach((cardId) => {
            changeOfHeartTarget.push(...allCards[cardId].link)
            allCards[cardId].link = []
        })
    }
    console.log(changeOfHeartTarget)
    if (changeOfHeartTarget.length != 0) {
        // すべての心変わり対象に対して
        for (let id of changeOfHeartTarget) {
            const cardId = id
            // モンスターゾーンに居れば
            if (allCards[cardId].location == "monsterZone") {
                // 心変わり対象でかつ強奪対象のものを抜き出す
                const linkedSnatchSteel = allCards[cardId].link.filter((linkId) => allCards[linkId].name == "強奪")
                // 心変わりのリンク先の強奪が0,2枚のときは必ず返す
                // 強奪が一枚あったとしてもその強奪の使用者と心変わり対象のコントローラーが不一致であれば相手にコントローラーを渡す
                if (linkedSnatchSteel.length == 0 || linkedSnatchSteel.length == 2 || (linkedSnatchSteel.length == 1 && (allCards[linkedSnatchSteel[0]] && allCards[linkedSnatchSteel[0]].controller != allCards[cardId].controller))) {
                    // コントローラーを強奪者に返す
                    // 心変わり使ったほう
                    const changeOfHeartUser = allCards[id].controller;
                    // 奪われたほう(返却先)
                    const stoler = Object.keys(players).find((userId) => userId != changeOfHeartUser);

                    updatefields.monsterZone = await betray(stoler, changeOfHeartUser, updatefields, fieldsSetter, cardId)
                    // updatefields.monsterZone = await betray(allCards[cardId].owner, allCards[cardId].controller, updatefields, fieldsSetter, cardId)
                }
                // 強奪にリンクしているモンスターにリンクしている心変わりを抜き出す
                console.log(allCards[id])
                // 心変わり対象モンスターのリンク先と使用済み心変わりを比較してどの心変わりとリンクしているかを探す
                const ChangeOfHeartCardId = allCards[id].link.find((monsterLinkCard) => graveyardChangeOfHeart.some((linkCard) => linkCard == monsterLinkCard));
                // 返すにしろ返さないにしろリンクは外す
                await unlink(id, ChangeOfHeartCardId);
            }
        }
    }


    // 護封剣
    const swordOfLightIds = allSpellTrap.filter((cardId) => (cardId != null && allCards[cardId].name == '光の護封剣'));
    console.log(swordOfLightIds)
    for (const swordOfLightId of swordOfLightIds) {
        const swordOfLight = allCards[swordOfLightId];
        // 護封剣発動プレイヤーのターン終了時じゃなければカウントを進める
        console.log(swordOfLight.controller, playerId, players);
        console.log(players[swordOfLight.controller].turnPlayer, players[swordOfLight.controller])
        // if (!players[swordOfLight.controller].turnPlayer) {
        //     console.log('護封剣カウント+1', JSON.stringify(swordOfLight))
        //     swordOfLight.counter += 1;
        // }
        if (swordOfLight.counter == 3) {
            await destroy(swordOfLight.controller, updatefields, fieldsSetter, swordOfLightId);
        }
        // if (swordOfLight.counter == 3) {
        //     await destroy(swordOfLight.controller, fields, fieldsSetter, swordOfLightId);
        //     // 両者で実行されるから要らないはず
        //     // socket.emit('destroy', { roomName, playerId: swordOfLight.controller, cardId: swordOfLightId });
        // }else if (!players[swordOfLight.controller].turnPlayer) {
        //     swordOfLight.counter += 1;
        //     console.log('護封剣のターンカウント勧めたよ',swordOfLight,swordOfLight.counter)
        // }
        
    }

    // ターン終了時のプレイヤーの情報処理
    updatePlayers[playerId].rightOfSummon = true;
    updatePlayers[playerId].useGoats = false;
    updatePlayers[playerId].useReverseAndSpecialSummon = false;
    updatePlayers[opponentPlayerId].rightOfSummon = true;
    updatePlayers[opponentPlayerId].useGoats = false;
    updatePlayers[opponentPlayerId].useReverseAndSpecialSummon = false;
    // ターンプレイヤーの操作
    if (updatePlayers[playerId].turnPlayer) {
        updatePlayers[playerId].turnPlayer = false;
        updatePlayers[playerId].priority = false;
        updatePlayers[opponentPlayerId].turnPlayer = true;
        updatePlayers[opponentPlayerId].priority = true;
    } else {
        updatePlayers[playerId].turnPlayer = true;
        updatePlayers[playerId].priority = true;
        updatePlayers[opponentPlayerId].turnPlayer = false;
        updatePlayers[opponentPlayerId].priority = false;
    }
    fieldsSetter.setPlayers(updatePlayers);
}

// 墓地から手札に回収 聖なる魔術師限定
const salvage = async (playerId, fields, fieldsSetter, cardId) => {
    allCards[cardId].location = 'hand'
    allCards[cardId].effect.canUse = true
    console.log('salvage',fields,cardId,fieldsSetter,playerId)
    const updateGraveyard = await removeFromGraveyard(fields.graveyard, fieldsSetter.setGraveyard, playerId, cardId);
    const updateHand = await addHand(fields.hand, fieldsSetter.setHand, playerId, cardId);
    let updatefields = { ...fields };
    updatefields.graveyard = updateGraveyard;
    updatefields.hand = updateHand;

    return updatefields;
}

const revive = async (socket, roomName, playerId, fields, fieldsSetter, cardId) => {
    let updatefields = fields;
    updatefields.graveyard = await removeFromGraveyard(fields.graveyard, fieldsSetter.setGraveyard, playerId, cardId);
    const updateMonsterfields = await summon(socket, roomName, cardId, fields, fieldsSetter, playerId, 'attack');
    console.log('revive', updateMonsterfields)
    updatefields.monsterZone = updateMonsterfields
    return updatefields;
}

// モンスターの除外
const monsterBanish = async (fields, fieldsSetter, cardId) => {
    let updatefields = fields;
    let updateMonsterZone = updatefields.monsterZone
    let updateBanishZone = updatefields.banishZone

    const card = allCards[cardId]
    const cardController = card.controller;
    card.faceStatus = 'up'
    card.location = 'banishZone'

    // トークンが破壊されるときは専用の配列に入れる
    if (card.cardtype == 'Token') {
        const index = updateMonsterZone[card.controller].indexOf(cardId);
        let newGoatsZone = fields.extinctionGoats;
        // モンスターゾーンの配列と同じインデックスにいれる
        newGoatsZone[card.controller][index] = cardId;
        console.log(newGoatsZone)
        fieldsSetter.setExtinctionGoats(newGoatsZone)
    }
    updateMonsterZone = await removeFromMonsterZone(updateMonsterZone, fieldsSetter.setMonsterZone, cardController, cardId)
    // トークンの場合は除外せずただ削除
    if (allCards[cardId].cardtype != "Token") {
        updateBanishZone = await addBanishZone(card.owner, updateBanishZone, fieldsSetter.setBanishZone, cardId)
    } else {
        card.location = 'none'
    }
    card.controller = card.owner

    if (card.cardtype == 'Monster' && card.link.length != 0) {
        for (let linkId of card.link) {
            if ((allCards[linkId].name == "強奪" || allCards[linkId].name == "早すぎた埋葬") && allCards[linkId].location == "spellTrapZone") {
                console.log('link card destroy', JSON.stringify(card))
                await unlink(cardId, linkId);
                await unlink(linkId, cardId);
                updatefields = await destroy(allCards[linkId].controller, updatefields, fieldsSetter, linkId);
            }
            if ((allCards[linkId].name == "リビングデッドの呼び声") && allCards[linkId].location == "spellTrapZone") {
                console.log('link card destroy', JSON.stringify(card))
                await unlink(cardId, linkId);
                await unlink(linkId, cardId);
                // 場にショッカーが居なければリビデを破壊
                // if (!spellTrapZone[playerId].concat(spellTrapZone[opponentPlayerId]).filter((id) => id != null)
                if (allCards[cardId].name != "人造人間－サイコ・ショッカー" && !(Object.values(updateMonsterZone)[0].concat(Object.values(updateMonsterZone)[1]).filter((id) => id != null)
                    .some((id) => allCards[id].name == "人造人間－サイコ・ショッカー"))) {
                        updatefields = await destroy(allCards[linkId].controller, updatefields, fieldsSetter, linkId);
                }
            }
        }
    }
    updatefields.monsterZone = updateMonsterZone;
    updatefields.banishZone = updateBanishZone;

    return updatefields;
}

// 墓地から除外.カイクウ用
const graveyardToBanish = async (banishPlayerId, fields, fieldsSetter, cardIds) => {
    let updatefields = fields

    let updateGraveyard = updatefields.graveyard;
    updateGraveyard[banishPlayerId] = updateGraveyard[banishPlayerId].filter((targetCardId) => !cardIds.includes(targetCardId));
    fieldsSetter.setGraveyard(updateGraveyard)

    let updateBanishZone = updatefields.banishZone;
    updateBanishZone[banishPlayerId] = [...updateBanishZone[banishPlayerId], ...cardIds];
    fieldsSetter.setBanishZone(updateBanishZone)
    
    for (let id of cardIds) {
        allCards[id].location = "banishZone";
    }

    updatefields.graveyard = updateGraveyard;
    updatefields.banishZone = updateBanishZone;

    console.log(updatefields)

    return updatefields;

}

//抹殺の使徒の追加効果
const deckBanish = async (playerId, opponentPlayerId, fields, fieldsSetter, cardId) => {
    const cardName = allCards[cardId].name;

    const myDeck = fields.deck[playerId];
    const oppoDeck = fields.deck[opponentPlayerId];
    const targets = myDeck.concat(oppoDeck);
    const banishCards = targets.filter((targetId) => allCards[targetId].name == cardName);
    let updatefields = fields;
    console.log(banishCards)

    if (banishCards.length > 0) {
        for (let i = 0; i < banishCards.length; i++) {
            allCards[banishCards[i]].faceStatus = 'up'
            allCards[banishCards[i]].location = 'banishZone'
            const owner = allCards[banishCards[i]].owner;
            updatefields.deck = await removeFromDeck(updatefields.deck, fieldsSetter.setDeck, owner, banishCards[i])
            updatefields.banishZone = await addBanishZone(owner, updatefields.banishZone, fieldsSetter.setBanishZone, banishCards[i])
        }
    }
    return updatefields;
}

// 優先権が移らない行動に対してのチェイン。モンスター召喚や攻撃などの自分が先のクイックエフェクト
// cardIdはフェイズ終了時などは無し
// 相手が優先権を持っている場合はemitして相手からトリガーする
const actionChain = async (socket, roomName, effectProps, playerId, opponentPlayerId, cardId, fields, fieldsSetter, chainCards, setChainConfirmFlag, chainProps, action, setSpellSpeed, setQuickEffectTiming) => {
    
    let chainObj = await chainSelf(socket, roomName, effectProps, playerId, opponentPlayerId, cardId, chainCards, chainProps.setChainBlockCards, setChainConfirmFlag, chainProps.setEventName, action);
    console.log('chainself result ', chainObj)
    // チェーンしてないとき
    if (chainCards === chainObj.chainBlockCards) {
        console.log('chainCards === chainObj.chainBlockCards')
    }
    if (chainCards == chainObj.chainBlockCards) {
        console.log('chainCards == chainObj.chainBlockCards')
    }
    console.log(chainCards, chainObj.chainBlockCards)
    if (JSON.stringify(chainCards) == JSON.stringify(chainObj.chainBlockCards)) {
    // if (chainObj.chainBlockCards.length == 0) {
        console.log('チェーンなし', chainCards, chainObj.chainBlockCards)
        chainObj.updateFields.players = await getPriority(fields.players, fieldsSetter.setPlayers, opponentPlayerId, playerId);
        chainObj = await chain(socket, roomName, effectProps, playerId, opponentPlayerId, cardId, chainObj.updateFields, fieldsSetter, chainCards, chainProps.setChainBlockCards, action);
    }
    // チェーンしたらスキップする
    
    console.log('チェーンしたからスキップ', chainCards, chainObj.chainBlockCards)
    console.log('chain result ', chainObj, chainObj.updateFields)
    chainObj.updateFields = await effectResolution(socket, roomName, playerId, opponentPlayerId, chainObj.updateFields, fieldsSetter, chainProps, chainObj.chainBlockCards, setSpellSpeed, setQuickEffectTiming)
    return chainObj
}

// アクションに対してのチェーンハンドラ
const actionChainHandle = async (socket, roomName, playerId, opponentPlayerId, cardId, fields, fieldsSetter, chainCards, setChainConfirmFlag, chainProps, action, setSpellSpeed, setQuickEffectTiming) => {
    let updatefields = fields;
    const effectProps = {
        cardId: cardId,
        playerId: playerId,
        opponentPlayerId: opponentPlayerId,
    };
    let chainobj = await actionChain(socket, roomName, effectProps, playerId, opponentPlayerId, cardId, fields, fieldsSetter, chainCards, setChainConfirmFlag, chainProps, action, setSpellSpeed, setQuickEffectTiming);
    console.log(chainobj)
    console.log(JSON.stringify(chainobj))
    // なんか使ったらクイックエフェクトの確認
    if (JSON.stringify(chainobj.chainBlockCards) != JSON.stringify([cardId])) {
        const quickefected = await quickEffectConfirm(socket, roomName, setQuickEffectTiming, chainProps.setChainBlockCards, chainProps.conditions, chainProps.setConditions, chainobj.updateFields, fieldsSetter, playerId, opponentPlayerId, action, setAction, actionMonster, setActionMonster, quickEffectStack, setQuickEffectStack)
        updatefields = quickefected.fields;
    } else {
        updatefields = chainobj.updateFields
    }
    chainProps.setConditions(chainProps.conditions.filter((condition) => condition != "summoned" && condition != "attack"));
    socket.emit('conditionRemove', { roomName, condition: ["summoned", "attack"] });
    return updatefields;
    // await effectResolution(socket, roomName, playerId, opponentPlayerId, chainobj.updateFields, fieldsSetter, chainProps, chainobj.useCardIds, setSpellSpeed, setQuickEffectTiming)

}

// アクションチェイン相手が先に確認を問われる場合(非ターンプレイヤーがターンプレイヤー中にチェーンブロックを組み始めて蘇生などがされた場合)
const oppoActionChain = async (socket, roomName, effectProps, playerId, opponentPlayerId, cardId, fields, fieldsSetter, chainCards, setChainConfirmFlag, chainProps, action, setSpellSpeed, setQuickEffectTiming) => {
    await getPriority(fields.players, fieldsSetter.setPlayers, opponentPlayerId, playerId);
    
    let chainObj = await chain(socket, roomName, effectProps, playerId, opponentPlayerId, cardId, fields, fieldsSetter, chainCards, chainProps.setChainBlockCards, action);
    if (JSON.stringify(chainCards) == JSON.stringify(chainObj.chainBlockCards)) {
        await getPriority(fields.players, fieldsSetter.setPlayers, playerId, opponentPlayerId);
        console.log('チェーンなし', chainCards, chainObj.chainBlockCards)
        chainObj = await chainSelf(socket, roomName, effectProps, playerId, opponentPlayerId, cardId, chainCards, chainProps.setChainBlockCards, setChainConfirmFlag, chainProps.setEventName, action);
    }
    console.log('chainself result ', chainObj)
    console.log('チェーンしたからスキップ', chainCards, chainObj.chainBlockCards)
    await effectResolution(socket, roomName, playerId, opponentPlayerId, chainObj.updateFields, fieldsSetter, chainProps, chainObj.chainBlockCards, setSpellSpeed, setQuickEffectTiming)
    await getPriority(fields.players, fieldsSetter.setPlayers, opponentPlayerId, playerId);


    console.log('chain result ', chainObj, chainObj.updateFields)
    return chainObj

};

// 副次効果の確認。使用していればtrue何も無ければfalseが返される
// 魔導戦士ブレイカーや護封剣のリバースや擬似的にたけしの自壊も
// 副次効果でのチェーン。すべての効果発動エフェクトだけ出して実際に発動するのは最後の一枚だけ
// updatefieldsとresult(true/false)が返る
// fakeSideEffectにはキラスネの強制発動や強奪の発動などが入る
const sideEffectChain = async (socket, roomName, playerId, opponentPlayerId, fields, fieldsSetter, effectProps, chainProps, chainConfirmFlag, setChainConfirmFlag, chainBlockCards, selectTargetProps, setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps, fakeSideEffect) => {
    // await makeChainBlock(socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, effectProps, chainProps, chainConfirmFlag, setChainConfirmFlag, chainBlockCards, selectTargetProps, setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps)
    // await awaitTime(500)
    console.log('sideEffectChain', fields, chainProps)
    let updatefields = fields;
    let sideEffectCards = []


    // 墓地からリンク付きのカードのみ取り出す
    // 装備系の破壊時効果がチェーンブロックを組まない効果だから墓地発動の誘発効果は無いっぽい？
    const myLinkedCards = fields.graveyard[playerId].filter(
        (cardId) => (allCards[cardId].link.length != 0 && allCards[cardId].cardtype != "Monster" && allCards[cardId].location == "graveyard" && allCards[allCards[cardId].link[0]].location == "monsterZone" && (allCards[cardId].name != '心変わり' && allCards[cardId].name != '強奪' && allCards[cardId].name != '早すぎた埋葬' && allCards[cardId].name != 'リビングデッドの呼び声'))
    )
    const oppoLinkedCards = fields.graveyard[opponentPlayerId].filter(
        (cardId) => (allCards[cardId].link.length != 0 && allCards[cardId].cardtype != "Monster" && allCards[cardId].location == "graveyard" && allCards[allCards[cardId].link[0]].location == "monsterZone" && (allCards[cardId].name != '心変わり' && allCards[cardId].name != '強奪' && allCards[cardId].name != '早すぎた埋葬' && allCards[cardId].name != 'リビングデッドの呼び声'))
    )
    // // 除外ゾーンからもリンク付きのカードを取り出す
    // const myBanishLinkedCards = fields.banishZone[opponentPlayerId].filter(
    //     (cardId) => (allCards[cardId].link.length != 0 && allCards[cardId].cardtype != "Monster" && allCards[cardId].location == "graveyard" && allCards[allCards[cardId].link[0]].location == "monsterZone" && (allCards[cardId].name != '心変わり' && allCards[cardId].name != '強奪'))
    // )
    // const oppoBanishLinkedCards = fields.banishZone[playerId].filter(
    //     (cardId) => (allCards[cardId].link.length != 0 && allCards[cardId].cardtype != "Monster" && allCards[cardId].location == "graveyard" && allCards[allCards[cardId].link[0]].location == "monsterZone" && (allCards[cardId].name != '心変わり' && allCards[cardId].name != '強奪'))
    // )

    // 墓地と除外にあるリビデに紐づいたカードを取得(リビデに紐づいたカードが墓地と除外に無いか確認)
    // リビデはチェーンブロックを作らない即時効果なので誘発ではない
    // const myCallOfTheHauntedLinked = fields.spellTrapZone[playerId].filter((cardId) => allCards[cardId] && allCards[cardId].name == "リビングデッドの呼び声" && (allCards[cardId].link[0] && (allCards[allCards[cardId].link[0]].location == "graveyard" || allCards[allCards[cardId].link[0]].location == "banishZone")))
    // const OppoCallOfTheHauntedLinked = fields.spellTrapZone[opponentPlayerId].filter((cardId) => allCards[cardId] && allCards[cardId].name == "リビングデッドの呼び声" && (allCards[cardId].link[0] && (allCards[allCards[cardId].link[0]].location == "graveyard" || allCards[allCards[cardId].link[0]].location == "banishZone")))


    // 魔導戦士ブレイカーはカウンターを消費すると-1になる。召喚時のみ0
    const myBreakers = fields.monsterZone[playerId].filter(
        (cardId) => (cardId != null && allCards[cardId].name == '魔導戦士ブレイカー' && allCards[cardId].counter == 0 && allCards[cardId].faceStatus != "downDef") 
    )
    const oppoBreakers = fields.monsterZone[opponentPlayerId].filter(
        (cardId) => (cardId != null && allCards[cardId].name == '魔導戦士ブレイカー' && allCards[cardId].counter == 0 && allCards[cardId].faceStatus != "downDef")
    )
    // フィールド上のリンク付きたけし
    const mytakeshi = fields.monsterZone[playerId].filter((cardId) => cardId != null && (allCards[cardId].name == '魂を削る死霊' && (((allCards[cardId].faceStatus == 'attack' || allCards[cardId].faceStatus == 'def') && allCards[cardId].canChange) && (allCards[cardId].link.length != 0) || allCards[cardId].link.some((id) => allCards[id].name == '強奪' || allCards[id].name == '早すぎた埋葬' || allCards[id].name == 'リビングデッドの呼び声'))))
    const oppotakeshi = fields.monsterZone[opponentPlayerId].filter((cardId) => cardId != null && (allCards[cardId].name == '魂を削る死霊' && (((allCards[cardId].faceStatus == 'attack' || allCards[cardId].faceStatus == 'def') && allCards[cardId].canChange) && (allCards[cardId].link.length != 0) || allCards[cardId].link.some((id) => allCards[id].name == '強奪' || allCards[id].name == '早すぎた埋葬' || allCards[id].name == 'リビングデッドの呼び声'))))
    // フィールド上のたけし
    // const takeshi = fields.monsterZone[playerId].concat(fields.monsterZone[opponentPlayerId]).filter((cardId) => allCards[cardId].name == '魂を削る死霊' && (allCards[cardId].faceStatus == 'attack' || allCards[cardId].faceStatus == 'def'))
    // // フィールド上のリンク系カード。flatで心変わりの対象も1元の配列になる
    // // SpellTrapは全部リンク持ちなので!=""で判別してもよさげ
    // const fieldsLinkedCards = fields.spellTrapZone[playerId].concat(fields.spellTrapZone[opponentPlayerId]).filter(
    //     (cardId) => (allCards[cardId].link !== "")
    // )
    // console.log(fieldsLinkedCards);
    // const linkCards = fieldsLinkedCards.map((id) => allCards[id].link).flat()
    // console.log(linkCards)
    // console.log(takeshi);
    // // 効果対象になったたけし
    // const effectTakeshi = takeshi.filter((cardId) => linkCards.includes(cardId));
    // console.log(effectTakeshi);

    // 表側だけどまだ効果を発動していないリバースカードがあれば(護封剣で表にされたリバース効果モンスター用)
    const fieldsReverseMonsters = fields.monsterZone[opponentPlayerId].filter((cardId) => cardId != null && allCards[cardId].effect.triggerCondition == 'reverse' && allCards[cardId].effect.canUse == true && allCards[cardId].faceStatus == 'def');

    // リビデのリンク先のカードが墓地に送られた場合自壊。除外時は自壊しない(除外方法が開闢のみで開闢効果は破壊ではないため)
    // その他装備カードの破壊時はdestroy側で即時処理
    // for (let i = 0; i < fieldsLinkedCards.length; i++){
    //     const cardId = fieldsLinkedCards[i]
    //     let linkId = allCards[cardId].link;
    //     if ((allCards[linkId].location == 'graveyard' && allCards[cardId].name == 'リビングデッドの呼び声')) {
    //         updatefields = await destroy(allCards[cardId].owner, updatefields, fieldsSetter, cardId);
    //         socket.emit('destroy', { roomName, playerId: allCards[cardId].owner, cardId: cardId });
    //     }
    // }

    // sideEffectCards = [...fieldsReverseMonsters, ...myBreakers, ...mytakeshi, ...oppoBreakers, ...oppotakeshi];
    console.log(fieldsReverseMonsters, myLinkedCards, myBreakers, mytakeshi, oppoLinkedCards, oppoBreakers, oppotakeshi)
    sideEffectCards = [...fieldsReverseMonsters, ...myLinkedCards, ...myBreakers, ...mytakeshi, ...oppoLinkedCards, ...oppoBreakers, ...oppotakeshi];

    // 場にショッカーが含まれていたらリビデは発動しない
    // if (fields.monsterZone[playerId].concat(fields.monsterZone[opponentPlayerId]).some((cardId) => cardId != null && allCards[cardId].name == "人造人間－サイコ・ショッカー" && allCards[cardId].faceStatus  != "downDef")) {
    //     sideEffectCards = [...fieldsReverseMonsters, ...myLinkedCards, ...myBreakers, ...mytakeshi, ...oppoLinkedCards, ...oppoBreakers, ...oppotakeshi];
    // } else {
    //     sideEffectCards = [...fieldsReverseMonsters, ...myLinkedCards, ...myCallOfTheHauntedLinked, ...myBreakers, ...mytakeshi, ...oppoLinkedCards, ...OppoCallOfTheHauntedLinked, ...oppoBreakers, ...oppotakeshi];
    // }
    // 多分fakeSideEffectは必ず配列になってるはず
    if (fakeSideEffect) {
        // 
        console.log(fakeSideEffect)
        if (Array.isArray(fakeSideEffect)) {
            sideEffectCards = fakeSideEffect
        } else {
            sideEffectCards = [fakeSideEffect]
        }
    }
    console.log('sideEffectCards', sideEffectCards)

    // たけしは誘発効果の様な振る舞いをするが実際にはチェーンブロックを組まない効果なのでこのタイミングで先に破壊
    if (sideEffectCards.some((id) => allCards[id].name == "魂を削る死霊")) {
        for (let sideEffectCardId of sideEffectCards) {
            if (allCards[sideEffectCardId].name == "魂を削る死霊") {
                await visualizeEffectAndWait(socket, roomName, sideEffectCardId)
                updatefields = await cardEffects[allCards[sideEffectCardId].effect.effectDetails[1]](socket, roomName, sideEffectCardId, playerId, opponentPlayerId, updatefields, fieldsSetter, selectTargetProps);
            }
        }
        // 全てたけしの場合はそもそもサイドエフェクトじゃないからこの場合は強制終了
        if (sideEffectCards.every((id) => allCards[id].name == "魂を削る死霊")) {
            return { updatefields: updatefields, result: false }
        }
        // たけしが居たら誘発しないように削除
        sideEffectCards = sideEffectCards.filter((id) => allCards[id].name != "魂を削る死霊");
    }
    console.log('sideEffectCards', sideEffectCards)

    // セイマジ用の効果対象用変数
    let effectTargetCardId = null

    for (let sideEffectCard of sideEffectCards) {
        // 不発でも効果使用済みに
        if (allCards[sideEffectCard].name == '聖なる魔術師') {
            allCards[sideEffectCard].effect.canUse = false;
        }
        // セイマジで墓地の魔法が0だったら誘発一覧から削除
        if (allCards[sideEffectCard].name == '聖なる魔術師' && updatefields.graveyard[allCards[sideEffectCard].controller].filter((id) => allCards[id].cardtype == 'Spell').length == 0) {
            sideEffectCards = sideEffectCards.filter((id) => id != sideEffectCard)
            continue
        }
        console.log('triggerEffectAndWait', sideEffectCard)
        await triggerEffectAndWait(socket, roomName, sideEffectCard);

        if (allCards[sideEffectCard].name == '聖なる魔術師') {
            effectTargetCardId = await opponentCheckEffectTarget(socket, roomName, sideEffectCard, otherProps.setOppoChoicing);
            console.log(effectTargetCardId)
            chainProps.setEffectTarget(effectTargetCardId)
        }
    }
    // 誘発効果の一覧をチェーンブロックにする
    chainProps.setChainBlockCards(sideEffectCards);


    if (sideEffectCards.length > 0) {

        const queueLast = sideEffectCards[sideEffectCards.length - 1];
        
        console.log('queueLast', queueLast)
        chainProps.activateCard = queueLast;

        let chainCards = sideEffectCards;
        let useCardIds = []
        console.log(allCards[queueLast])
        // const beforeMonsterInfo = await savedInfo(fields.monsterZone[opponentPlayerId]);
        let chainObj = {}
        // 相手のカードなら
        if (allCards[queueLast].controller !== playerId) {
            // 相手がチェーンしなかった場合自分がチェーンできる。現在のチェーンブロック内のカードと相手の結果を比較する
            chainObj = await chainSelf(socket, roomName, effectProps, playerId, opponentPlayerId, queueLast, chainCards, chainProps.setChainBlockCards, setChainConfirmFlag, chainProps.setEventName, 'sideeffect', updatefields, effectTargetCardId);
            console.log('chainself result ', chainObj)

            useCardIds = chainObj.chainBlockCards;
            await getPriority(updatefields.players, fieldsSetter.setPlayers, opponentPlayerId, playerId);
            if (useCardIds.length == chainCards.length) {

                chainObj = await chain(socket, roomName, effectProps, playerId, opponentPlayerId, queueLast, chainObj.updateFields, fieldsSetter, chainCards, chainProps.setChainBlockCards, 'sideeffect', otherProps, effectTargetCardId);
                console.log('chain result ', chainObj)
                useCardIds = chainObj.chainBlockCards;
            }
            console.log('useCardとchainblock cards ', useCardIds, ':::', chainCards)
            updatefields = chainObj.updateFields;
            console.log(updatefields);
        // 自分のカードなら
        } else {
            // updatefields = await makeChainBlock(socket, roomName, queueLast, playerId, opponentPlayerId, updatefields, fieldsSetter, effectProps, chainProps, chainConfirmFlag, setChainConfirmFlag, sideEffectCards, selectTargetProps, setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps)
            console.log("end makechain in sideeffect")
            await getPriority(updatefields.players, fieldsSetter.setPlayers, opponentPlayerId, playerId);
            chainObj = await chain(socket, roomName, effectProps, playerId, opponentPlayerId, queueLast, fields, fieldsSetter, chainCards, chainProps.setChainBlockCards, 'sideeffect', otherProps, effectTargetCardId);
            console.log('chain result ', chainObj)
            useCardIds = chainObj.chainBlockCards;
            console.log('useCardとchainblock cards ', useCardIds, ':::', chainCards)
            // 相手がチェーンしなかった場合自分がチェーンできる。現在のチェーンブロック内のカードと相手の結果を比較する
            if (useCardIds.length == chainCards.length) {
                chainObj = await chainSelf(socket, roomName, effectProps, playerId, opponentPlayerId, queueLast, chainCards, chainProps.setChainBlockCards, setChainConfirmFlag, chainProps.setEventName, 'sideeffect', updatefields, effectTargetCardId);
                console.log('chainself result ', chainObj)

                useCardIds = chainObj.chainBlockCards;
            }
            updatefields = chainObj.updateFields;
            console.log(updatefields);
        }

        console.log('チェーンブロックが確定しました', setQuickEffectTiming, updatefields)
        console.log(chainObj)
        console.log(chainObj.useCardIds)
        console.log(sideEffectCards)
        setEffecting(true)
        for (let i = sideEffectCards.length - 1; i >= 0; i--) {
            const card = allCards[sideEffectCards[i]];
            console.log(card)
            console.log(card.effect.effectDetails)
            // リバース効果用に効果配列の長さで副次効果かリバース効果か判断。副次効果なら効果配列は2以上
            if (card.effect.effectDetails.length == 1) {
                // 自分のリバースモンスターなら自分が発動
                if (card.controller == playerId) {
                    await visualizeEffectAndWait(socket, roomName, sideEffectCards[i])
                    updatefields = await cardEffects[card.effect.effectDetails[0]](socket, roomName, sideEffectCards[i], playerId, opponentPlayerId, chainObj.updateFields, fieldsSetter, selectTargetProps );
                } else {
                // 相手のリバースモンスターなら相手側で発動
                    otherProps.setOppoChoicing(true)
                    const oppoEffect = await opponentMonsterEffect(socket, roomName, playerId, updatefields, sideEffectCards[i], null);
                    otherProps.setOppoChoicing(false)
                    allCards[sideEffectCards[i]].effect.canUse = false;
                    updatefields = oppoEffect.updatefields;
                }

            } else {
                // サイドエフェクト発動するときはモンスターだったら自身がモンスターゾーンに居るか、装備系なら対象がモンスターゾーンにいれば発動
                if (card.cardtype == 'Monster' && card.location == 'monsterZone') {
                    await visualizeEffectAndWait(socket, roomName, sideEffectCards[i])
                    updatefields = await cardEffects[card.effect.effectDetails[1]](socket, roomName, sideEffectCards[i], playerId, opponentPlayerId, chainObj.updateFields, fieldsSetter, selectTargetProps);
                } else if (card.name == "強奪" && card.location == 'spellTrapZone' && fakeSideEffect && fakeSideEffect.includes(card.id)) {
                    // 強奪の回復効果
                    console.log('card is fake sideeffect')
                    await visualizeEffectAndWait(socket, roomName, sideEffectCards[i])
                    // fakeSideEffectによる回復効果の誘発なら
                    // 強奪のコントローラーが自分か相手かで引数を変えて正しい対象者に回復をさせる
                    updatefields = await cardEffects[card.effect.effectDetails[2]](socket, roomName, sideEffectCards[i], playerId, opponentPlayerId, chainObj.updateFields, fieldsSetter, selectTargetProps);
                    
                } else if (((card.cardtype == 'Spell' || card.cardtype == 'Trap') && (allCards[card.link[0]] && allCards[card.link[0]].location == 'monsterZone'))) {
                    // 早すぎた埋葬の破壊時かな
                    console.log('real')
                    await visualizeEffectAndWait(socket, roomName, sideEffectCards[i])
                    updatefields = await cardEffects[card.effect.effectDetails[1]](socket, roomName, sideEffectCards[i], playerId, opponentPlayerId, chainObj.updateFields, fieldsSetter, selectTargetProps);
                } else if (card.name == "リビングデッドの呼び声" && allCards[card.link[0]].location != 'monsterZone') {
                    // リビデの破壊時
                    await visualizeEffectAndWait(socket, roomName, sideEffectCards[i])
                    updatefields = await cardEffects[card.effect.effectDetails[2]](socket, roomName, sideEffectCards[i], playerId, opponentPlayerId, chainObj.updateFields, fieldsSetter, selectTargetProps);
                }
            }
        }
        
        // console.log("myCallOfTheHauntedLinked", myCallOfTheHauntedLinked,"OppoCallOfTheHauntedLinked", OppoCallOfTheHauntedLinked)

        // ↓多分要らないけど怖いから残しておく
        if (!fakeSideEffect) {
            sideEffectCards.forEach((cardId) => {
                socket.emit('unlink', { roomName, cardId: cardId, unlinkCardId: null });
                allCards[cardId].link = []
            });
        }
        socket.emit('chainCountMsgReset', { roomName });
        // 新しいfieldsを返してそれを使って処理
        updatefields = await effectResolution(socket, roomName, playerId, opponentPlayerId, updatefields, fieldsSetter, chainProps, useCardIds, setSpellSpeed, setQuickEffectTiming)

        chainProps.setChainBlockCards(useCardIds);
        // チェインするときやクイックエフェクトタイミングでそれぞれ優先権が配られるのでとりあえず優先権を奪って問題ないはず
        await getPriority(updatefields.players, fieldsSetter.setPlayers, opponentPlayerId, playerId);
        setEffecting(false);
        
        console.log('sideeffectchain fields', fields, updatefields);
        // 副次効果にチェーンした場合はそれによって副次効果が発動していないか確認
        socket.emit("chainCountMsgReset", { roomName });
        const sideEffect = await sideEffectChain(socket, roomName, playerId, opponentPlayerId, updatefields, fieldsSetter, effectProps, chainProps, chainConfirmFlag, setChainConfirmFlag, chainBlockCards, selectTargetProps, setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps);
        socket.emit('chainCountMsgReset', { roomName });


        console.log(updatefields)
        console.log(fields)
        // ターンプレイヤーにクイックエフェクトの確認を行う。召喚していれば召喚のアクションチェインをトリガー
        // updateFieldsに新しい要素があるか確認。あれば召喚したことになる
        // const hasNewElement = updatefields.monsterZone[playerId].concat(updatefields.monsterZone[opponentPlayerId]).some(cardId => !fields.monsterZone[playerId].concat(fields.monsterZone[opponentPlayerId]).includes(cardId));
        // 副次効果が発動していないかつ新しいモンスターが居るor uuidが変わったモンスターがいる場合
        // console.log(sideEffect, hasNewElement, !uuidCheck(beforeMonsterInfo, updatefields.monsterZone[opponentPlayerId]))
        // chainProps.setConditions(chainProps.conditions.filter((condition) => condition != ''))
        if (!sideEffect.result && !(fakeSideEffect)) {
            // if ((hasNewElement || !uuidCheck(beforeMonsterInfo, updatefields.monsterZone[opponentPlayerId]))) {
            //     if (fields.players[playerId].turnPlayer) {
            //         chainObj = await actionChain(socket, roomName, effectProps, playerId, opponentPlayerId, cardId, updatefields, fieldsSetter, chainCards, setChainConfirmFlag, chainProps, 'summon', setSpellSpeed, setQuickEffectTiming);
            //     } else {
            //         chainObj = await oppoActionChain(socket, roomName, effectProps, playerId, opponentPlayerId, cardId, fields, fieldsSetter, chainCards, setChainConfirmFlag, chainProps, 'summon', setSpellSpeed, setQuickEffectTiming)
            //     }
            // } else
            if (fields.players[playerId].turnPlayer) {
                const quickefected = await quickEffectConfirm(socket, roomName, setQuickEffectTiming, chainProps.setChainBlockCards, chainProps.conditions, chainProps.setConditions, updatefields, fieldsSetter, playerId, opponentPlayerId, '', '', '', '', quickEffectStack, setQuickEffectStack, otherProps)
                updatefields = quickefected.fields;
            } else {
                console.log('相手のクイックエフェクト確認')
                otherProps.setOppoChoicing(true)
                const quickefected = await selfQuickEffectConfirm(socket, roomName, updatefields, '', '', quickEffectStack)
                updatefields = quickefected.fields
            }
        }

        // const chainBlockCards = await activate(socket, roomName, card, players, setPlayers, playerId, opponentPlayerId, fields, effectProps);
        // console.log('cards in chainblock ', chainBlockCards)
        // return obj.useCardIds;
        return { updatefields:updatefields, result:true }
    }
    // if (myCallOfTheHauntedLinked.concat(OppoCallOfTheHauntedLinked).length != 0) {

    //     for (let linkId of myCallOfTheHauntedLinked.concat(OppoCallOfTheHauntedLinked)) {
    //         if (allCards[linkId].link.length != 0) {
    //             const linkCardId = allCards[linkId].link[0];
    //             console.log(linkId, linkCardId)
    //             await unlink(linkId, linkCardId);
    //             await unlink(linkCardId, linkId);

    //             socket.emit('unlink', { roomName, cardId: linkId, unlinkCardId: linkCardId });
    //             socket.emit('unlink', { roomName, cardId: linkCardId, unlinkCardId: linkId });
    //         }

    //     }
    // }
    chainProps.setChainBlockCards([])
    console.log('sideeffect終了')
    return { updatefields: updatefields, result: false }
}

// 配列内のカードのID,location,uuidをオブジェクトに保存して返却
// TODO保存されたIDがループカウンタになってる
const savedInfo = async (array) => {
    let InfoObj = {}
    for (let i = 0; i < array.length; i++){
        InfoObj[array[i]] = {
            id: array[i],
            location: allCards[array[i]].location,
            uuid: allCards[array[i]].uuid
        };
    }
    return InfoObj;
}

// 渡されたオブジェクトと現在のモンスターゾーンのが完全一致しているか確認.uuidが違うものを配列で返す
const uuidCheck = async (beforeMonsterInfo, monsterZone) => {
    // キーの配列を取得して前回のモンスターゾーンと現在のモンスターゾーンで比較する
    console.log(beforeMonsterInfo, monsterZone)
    if (Object.keys(beforeMonsterInfo).length != 0) {
        const allMatched = monsterZone.filter(id => {
            const card = allCards[id];
            console.log(id, card, JSON.stringify(beforeMonsterInfo), beforeMonsterInfo[id]);
            console.log(card, card.location, beforeMonsterInfo[id].location, '', card.uuid, beforeMonsterInfo[id].uuid)
            if (card) {
                return card.location === beforeMonsterInfo[id].location && card.uuid !== beforeMonsterInfo[id].uuid;
            }
            return false;
        })
        console.log(allMatched)
        return allMatched;
    }
    return []
}

// 首領・ザルーグ用のデッキトップから2枚墓地に送る処理
const deckDestruction = async (opponentPlayerId, fields, fieldsSetter, num) => {
    let updatefields = fields;
    let updateDeck = fields.deck;
    let updateGraveyard = fields.graveyard;

    // 前2枚を消しながら取得
    const destructCards = updateDeck[opponentPlayerId].splice(0, 2);
    destructCards.forEach((cardId) => {
        allCards[cardId].faceStatus = 'up'
        allCards[cardId].location = 'graveyard'
    })
    fieldsSetter.setDeck(updateDeck)
    // 墓地にその2枚を足す
    updateGraveyard[opponentPlayerId] = [...updateGraveyard[opponentPlayerId], ...destructCards];
    fieldsSetter.setGraveyard(updateGraveyard);
    console.log(updateDeck, updateGraveyard)
    updatefields.deck = updateDeck;
    updatefields.graveyard = updateGraveyard;

    console.log(updatefields)

    return updatefields;
}

// 女戦士(相手の効果モンスター)の効果発動を待機する関数
const opponentMonsterEffect = async (socket, roomName, playerId, fields, cardId, targetId) => {
    
    return new Promise((resolve, reject) => {
        const eventName = cardId + playerId;
        console.log('opponentMonsterEffect', { roomName, eventName, cardId, targetId })
        socket.emit('opponentMonsterEffect', { roomName, eventName, cardId, targetId});

        // result = {oppoDDEffectChoice, updateFields}
        socket.on(eventName, (result) => {
            console.log('opponentMonsterEffect チェーン処理が帰って来ました', result, fields)
            // 優先権を獲得
            resolve(result);
            socket.off(eventName);

        });
    });
}
// 相手のお注射天使リリーの発動を待機する
const opponentLily = async (socket, roomName, playerId, fields, cardId) => {

    return new Promise((resolve, reject) => {
        const eventName = cardId + playerId;
        console.log('lily', { roomName, eventName, cardId, fields})
        socket.emit('lily', { roomName, eventName, cardId, fields});

        // result = {updatefields}
        socket.on(eventName, (result) => {
            console.log('Lily チェーン処理が帰って来ました', result, fields)
            // 優先権を獲得
            resolve(result);
            socket.off(eventName);

        });
    });
}

// リバースしたときに相手に強制発動させる
const opponentActivate = async (socket, roomName, playerId, fields, cardId) => {
    return new Promise((resolve, reject) => {
        const eventName = cardId + playerId;
        console.log('enforceActivate', { roomName, eventName, cardId })
        socket.emit('enforceActivate', { roomName, eventName, cardId });

        // result = {updatefields}
        socket.on(eventName, (result) => {
            console.log('enforceActivate チェーン処理が帰って来ました', result, fields)
            // 優先権を獲得
            resolve(result);
            socket.off(eventName);
        });
    });
}

// ファイバーポッド用 除外以外のすべてのカードをデッキに戻す
const fiberJar = async (socket, roomName, playerId, opponentPlayerId, fields, fieldsSetter) => {
    console.log('ファイバーポッド開始')
    let updatefields = fields
    let newGoatsZone = fields.extinctionGoats;
    console.log(updatefields)
    // 戻すカードを全取得
    const allMonsters = updatefields.monsterZone[playerId].filter((id) => id != null).concat(updatefields.monsterZone[opponentPlayerId].filter((id) => id != null));
    // すべてのモンスターのコントローラーを所持者に返す
    for (let monster of allMonsters) {
        allCards[monster].controller = allCards[monster].owner;
        if (allCards[monster].name == 'イグザリオン・ユニバース' && allCards[monster].attack != 1800) {
            allCards[monster].attack = 1800;
        };
        // トークンが破壊されるときは専用の配列に入れる
        if (allCards[monster].cardtype == 'Token') {
            const index = updatefields.monsterZone[allCards[monster].controller].indexOf(monster);
            // モンスターゾーンの配列と同じインデックスにいれる
            newGoatsZone[allCards[monster].controller][index] = monster;
            console.log(index, newGoatsZone, JSON.stringify(newGoatsZone))
            console.log(newGoatsZone[allCards[monster].controller][index], monster)
        }
    }
    fieldsSetter.setExtinctionGoats(newGoatsZone)

    let returnToDeckCardsPlayer = updatefields.hand[playerId].concat(allMonsters.filter(id => allCards[id].owner == playerId), updatefields.spellTrapZone[playerId].filter(id => id != null), updatefields.graveyard[playerId]);
    let returnToDeckCardsOppo = updatefields.hand[opponentPlayerId].concat(allMonsters.filter(id => allCards[id].owner == opponentPlayerId), updatefields.spellTrapZone[opponentPlayerId].filter(id => id != null), updatefields.graveyard[opponentPlayerId]);
    // 様々なオプションを初期状態に戻す
    // 開闢はuuidの有無で召喚済みか確認しているためuuidのリセットで蘇生制限をかける

    // トークンは最初に削除
    if (returnToDeckCardsPlayer.filter((cardId) => allCards[cardId].cardtype == 'Token').length != 0) {
        console.log(returnToDeckCardsPlayer.filter((cardId) => allCards[cardId].cardtype == 'Token'))
        for (let goat of returnToDeckCardsPlayer.filter((cardId) => allCards[cardId].cardtype == 'Token')) {
            console.log(goat);
            allCards[goat].location = 'none'
        }
    }
    returnToDeckCardsPlayer = returnToDeckCardsPlayer.filter((cardId) => allCards[cardId].cardtype != 'Token')
    returnToDeckCardsPlayer.forEach((cardId) => {
        const card = allCards[cardId];
        if (card.cardtype == 'Monster') {
            card.link = []
            card.uuid = ''
            if (card.name == '魔導戦士ブレイカー') {
                card.counter = -1
                card.effect.canUse = false;
            } else {
                card.counter = 0
            }
        } else if (card.cardtype == 'Spell') {
            card.link = []
            card.counter = 0
        } else if (card.cardtype == 'Trap') {
            card.link = []
        }
        if (card.name != '魔導戦士ブレイカー' && card.name != 'ブレイドナイト' && card.effect.triggerCondition != 'reverse') {
            card.effect.canUse = true;
        }
        card.canChange = false;
        card.faceStatus = 'none'
        card.location = 'deck'
        console.log(card)
        if (card.owner != playerId) {
            returnToDeckCardsOppo.push(cardId);
        }
    })
    if (returnToDeckCardsOppo.filter((cardId) => allCards[cardId].cardtype == 'Token').length != 0) {
        console.log(returnToDeckCardsOppo.filter((cardId) => allCards[cardId]))
        for (let goat of returnToDeckCardsOppo.filter((cardId) => allCards[cardId].cardtype == 'Token')) {
            console.log(goat);
            allCards[goat].location = 'none'
        }
    }
    returnToDeckCardsOppo = returnToDeckCardsOppo.filter((cardId) => allCards[cardId].cardtype != 'Token')
    returnToDeckCardsOppo.forEach((cardId) => {
        const card = allCards[cardId];
        if (card.cardtype == 'Monster') {
            card.link = []
            card.uuid = ''
            if (card.name == '魔導戦士ブレイカー') {
                card.counter = -1
                card.effect.canUse = false;
            } else {
                card.counter = 0
            }
        } else if (card.cardtype == 'Spell') {
            card.link = []
            card.counter = 0
        } else if (card.cardtype == 'Trap') {
            card.link = []
        }
        if (card.name != '魔導戦士ブレイカー' && card.name != 'ブレイドナイト' && card.effect.triggerCondition != 'reverse') {
            card.effect.canUse = true;
        }
        card.canChange = false;
        card.faceStatus = 'none'
        card.location = 'deck'
        console.log(card)
        if (card.owner != opponentPlayerId) {
            returnToDeckCardsPlayer.push(cardId);
        }
    })
    console.log(returnToDeckCardsPlayer)
    updatefields.deck[playerId] = updatefields.deck[playerId].concat(returnToDeckCardsPlayer);
    updatefields.deck[opponentPlayerId] = updatefields.deck[opponentPlayerId].concat(returnToDeckCardsOppo);

    updatefields.hand[playerId] = []
    updatefields.hand[opponentPlayerId] = []
    updatefields.monsterZone[playerId] = [null, null, null, null, null]
    updatefields.monsterZone[opponentPlayerId] = [null, null, null, null, null]
    updatefields.spellTrapZone[playerId] = [null, null, null, null, null]
    updatefields.spellTrapZone[opponentPlayerId] = [null, null, null, null, null]
    updatefields.graveyard[playerId] = []
    updatefields.graveyard[opponentPlayerId] = []

    fieldsSetter.setDeck(updatefields.deck)
    fieldsSetter.setHand(updatefields.hand)
    fieldsSetter.setMonsterZone(updatefields.monsterZone)
    fieldsSetter.setSpellTrapZone(updatefields.spellTrapZone)
    fieldsSetter.setGraveyard(updatefields.graveyard)

    console.log(updatefields)



    console.log('ファイバーポッド終了')
    return updatefields;


}

// ファイバーポッドのデッキ戻しのハンドリング。両者がデッキに全部戻したら終わる
const fiberJarHandle = async (socket, roomName, playerId, opponentPlayerId, fields, fieldsSetter) => {
    // let updatefields = await fiberJar(socket, roomName, playerId, opponentPlayerId, fields, fieldsSetter);
    
    socket.emit('fiberJar', { roomName, playerId, updatefields: fields })
    return new Promise((resolve, reject) => {
        console.log('相手のファイバーポッドを待っています')
        socket.on('fiberJarEnd', (result) => {
            console.log('相手のファイバーポッドが完了しました')
            socket.off('fiberJarEnd');
            resolve(result.updatefields); // イベントが発生したら Promise を解決する
        });
        // エラー処理などが必要な場合はここで reject を呼び出す
    });



    // const asyncfunc = () => {
    //     return new Promise((resolve, reject) => {
    //         console.log('相手のファイバーポッドを待っています')
    //         socket.on('fiberJarEnd', (result) => {
    //             console.log('相手のファイバーポッドが完了しました')
    //             socket.off('fiberJarEnd');
    //             resolve(result); // イベントが発生したら Promise を解決する
    //         });
    //         // エラー処理などが必要な場合はここで reject を呼び出す
    //     });

    // }
    // socket.emit('fiberJar', { roomName, updatefields: fields })

    // return Promise.all([
    //     // fiberJar(socket, roomName, playerId, opponentPlayerId, fields, fieldsSetter),
    //     asyncfunc()
    // ]).then((results) => {
    //     // 両プレイヤーが準備完了した後の処理
    //     console.log('両プレイヤーの準備完了');
    //     return results[0];
    // });
}

// 非同期でドローを待機 これによりデッキに戻すアニメーションのあとにドローできる
const promiseDraw = async (socket, roomName, playerId ,fields, num) => {
    return new Promise((resolve, reject) => {
        let eventName = 'promiseDrawEnd' + playerId;
        console.log('promiseDraw', { roomName, eventName, num, fields })
        socket.emit('promiseDraw', { roomName, eventName, num, fields });

        // result = {updatefields}
        socket.on(eventName, (result) => {
            console.log('promiseDraw終わった', result, fields)
            socket.off(eventName);
            resolve(result.updatefields);
        });
    });
};

// 苦渋の選択用の相手にカードをselectさせる
const selectOppo = async (socket, roomName, selectArray, num, setOppoChoicing, cardId) => {
    return new Promise((resolve, reject) => {
        console.log('selectOppo', { roomName, selectArray, num, cardId})
        socket.emit('selectOppo', { roomName, selectArray, num, cardId});

        // result = {updatefields}
        socket.on('selectOppoEnd', (result) => {
            console.log('selectOppoEnd終わった', result)
            setOppoChoicing(false)
            // 優先権を獲得
            resolve(result.cardId)
            socket.off('selectOppoEnd');
        });
    });
}

// 苦渋の選択で選ばれなかったカードを墓地に
const deckToGraveyard = async(fields, fieldsSetter, targets) => {
    let updatefields = fields;
    let updateDeck = updatefields.deck;
    let updateGraveyard = updatefields.graveyard;

    targets.forEach((cardId) => {
        const card = allCards[cardId];
        card.faceStatus = 'up';
        card.location = 'graveyard';
    })

    // カードの所持者を取得
    const cardOwner = allCards[targets[0]].owner;
    // デッキから指定カードを削除
    updateDeck[cardOwner] = updateDeck[cardOwner].filter(cardId => !targets.includes(cardId));
    console.log(updateDeck);

    // 墓地に指定カードを追加
    updateGraveyard[cardOwner] = [...updateGraveyard[cardOwner], ...targets];
    console.log(updateGraveyard)
    updatefields.deck = updateDeck;
    updatefields.graveyard = updateGraveyard;

    fieldsSetter.setDeck(updateDeck);
    fieldsSetter.setGraveyard(updateGraveyard);

    return updatefields
}

const blackLusterSummonHandle = async (socket, roomName, cardId, playerId, fields, fieldsSetter, setHoverCardId) => {
    console.log('開闢の召喚');
    let updatefields = fields;
    // 墓地の光闇モンスターを取得
    const graveyardMonster = fields.graveyard[playerId].filter((cardId) => allCards[cardId].cardtype == 'Monster' && (allCards[cardId].attribute == 'light' || allCards[cardId].attribute == 'dark'));
    const tributeMonster = await selectCards(graveyardMonster, 'blackLuster', setHoverCardId, cardId);

    console.log(tributeMonster)
    if (tributeMonster == null) {
        return null
    }
    // 'attack' 'def' falseで帰って来る。falseはキャンセル
    const blackLusterFaceStatus = await choice(cardId, updatefields, "bluckLusterSS")
    console.log(blackLusterFaceStatus)
    if (blackLusterFaceStatus == false) {
        return null
    }
    socket.emit('blackLusterSummon', { roomName, playerId, cardId: cardId, tributeCardIds: tributeMonster, faceStatus: blackLusterFaceStatus })
    updatefields = await blackLusterSummon(socket, roomName, playerId, fields, fieldsSetter, cardId, tributeMonster, blackLusterFaceStatus);


    return updatefields;
}
const blackLusterSummon = async (socket, roomName, playerId, fields, fieldsSetter, cardId, tributeCardIds, blackLusterFaceStatus) => {
    let updatefields = fields;
    let updateGraveyard = updatefields.graveyard;
    let updateBanishZone = updatefields.banishZone;
    console.log(updatefields)

    // 除外するカードのステータス変更
    tributeCardIds.forEach((cardId) => {
        allCards[cardId].location = 'banishZone'
        allCards[cardId].effect.canUse = false;
    })
    console.log(updatefields)

    // 墓地から除外ゾーンへ
    updateGraveyard[playerId] = updateGraveyard[playerId].filter((cardId) => !tributeCardIds.includes(cardId));
    updateBanishZone[playerId] = [...updateBanishZone[playerId], ...tributeCardIds]
    console.log(updatefields)

    fieldsSetter.setGraveyard(updateGraveyard);
    fieldsSetter.setBanishZone(updateBanishZone);
    console.log(updatefields)

    // 召喚
    updatefields.monsterZone = await summon(socket, roomName, cardId, updatefields, fieldsSetter, playerId, blackLusterFaceStatus);
    updatefields.hand = await removeFromHnad(updatefields.hand, fieldsSetter.setHand, playerId, cardId);
    console.log(updatefields)

    return updatefields;
}

const gameStart = async (socket, roomName, fields, fieldsSetter, playerId, opponentPlayerId)=>{
    let updatefields = fields;
    let updateDeckandHand = await drawCards(socket, roomName, fields.deck, fields.hand, fieldsSetter.setHand, fieldsSetter.setDeck, playerId, 5);
    updateDeckandHand = await drawCards(socket, roomName, updateDeckandHand.updatedDeck, updateDeckandHand.updatedHand, fieldsSetter.setHand, fieldsSetter.setDeck, opponentPlayerId, 5);
    updatefields.deck = updateDeckandHand.updatedDeck
    updatefields.hand = updateDeckandHand.updatedHand

    return updatefields;
}

// 装備カードの装備先を選択
const selectEquipTarget = async (socket, cardId, fields, fieldsSetter, playerId, opponentPlayerId, selectTargetProps) => {
    let updatefields = fields;
    let targetfields = []
    let target = '';
    if (allCards[cardId].name == '早すぎた埋葬') {
        targetfields = updatefields.graveyard[playerId].filter((cardId) => allCards[cardId].cardtype == 'Monster' && (allCards[cardId].name != 'カオス・ソルジャー －開闢の使者－' || allCards[cardId].uuid != ''))
        target = await selectCards(targetfields, 1, selectTargetProps.setHoverCardId, cardId);
        if (target == null) {
            return false
        }
        if (target) {
            target = target[0]
        } else {
            return null
        }
    } else if (allCards[cardId].name == '強奪') {
        targetfields = updatefields.monsterZone[opponentPlayerId].filter(id => id != null);
        // 表向きのモンスターのみを取得
        const upMonsters = targetfields.filter((cardId) => allCards[cardId].faceStatus != 'downDef');
        console.log(upMonsters)
        target = await asyncSelectCard(socket, cardId, upMonsters, selectTargetProps);
        console.log(target)
    }
    console.log(target)
    return target
}

// 2枚の被強奪モンスターを同時に返還するときの処理
const returnSnatchMonsters = async (playerId, opponentPlayerId, snatchSteals, fields, fieldsSetter) => {
    console.log('returnSnatchMonsters', fields, snatchSteals);
    let updatefields = fields
    for (let i = 0; i < snatchSteals.length; i++){
        const cardId = snatchSteals[i];
        const stolenCard = allCards[allCards[cardId].link[0]];
        // 破壊された強奪の相手プレイヤー
        const allSpellTrap = updatefields.graveyard[playerId].concat(updatefields.graveyard[opponentPlayerId]);
        const changeOfHerats = allSpellTrap.filter((cardId) => allCards[cardId] && allCards[cardId].name == "心変わり");
    
        // リンク先が心変わりされている場合は何もせずに終了
        changeOfHerats.forEach((cardId) => {
            const card = allCards[cardId];
            if (card.link.includes(allCards[cardId].link[0])) {
                return updatefields;
            }
        })
    
        const updatedMonsterZone = await betray(stolenCard.owner, stolenCard.controller, updatefields, fieldsSetter, allCards[cardId].link[0]);
        updatefields.monsterZone = updatedMonsterZone;
        
    }
    return updatefields;
}

// カードの使用可かの確認
const checkCanEnable = (cardId, playerId, opponentPlayerId, fields, action, actionMonster, useGoats, conditions) => {
    let enable = true;
    const players = fields.players
    const deck = fields.deck
    const hand = fields.hand
    const monsterZone = fields.monsterZone
    const spellTrapZone = fields.spellTrapZone
    const graveyard = fields.graveyard
    if (fields.hand[playerId][0] == cardId) {
        console.log('カードの使用確認！！！！！')
    }
    if (allCards[cardId].location != "deck"){
            
        switch (allCards[cardId].name) {
            case "お注射天使リリー":
                // HP2000以下なら発動不可
                if (players[playerId].hp <= 2000) {
                    enable = false;
                }
                break
            case "同族感染ウイルス":
                // 手札0枚なら発動不可
                if (hand[playerId].length == 0) {
                    enable = false;
                }
                break
            case "強欲な壺":
                // デッキが2枚以下なら発動不可
                if (deck[playerId].length <= 1) {
                    enable = false;
                }
                break
            case "心変わり":
                // 相手モンスターが居ないなら発動不可
                // 自分モンスターが空いてなければ発動不可
                if (monsterZone[opponentPlayerId].every(element => element == null) || monsterZone[playerId].every(element => element != null)) {
                    enable = false;
                } else {
                    enable = true;                    
                }
                break
            
            case "強奪":
                // 相手の表側モンスターが居ないなら発動不可
                if (!monsterZone[opponentPlayerId].some((id) => id != null && allCards[id].faceStatus != "downDef") || monsterZone[playerId].every(element => element != null)) {
                    enable = false;
                }
                break
            case "押収":
                // 相手の手札が無いかLP1000以下のとき使用不可
                if (hand[opponentPlayerId].length == 0 || players[playerId].hp <= 1000) {
                    enable = false;
                }
                break
            case "強引な番兵":
                // 相手の手札が無いとき使用不可
                if (hand[opponentPlayerId].length == 0 ) {
                    enable = false;
                }
                break
            case "苦渋の選択":
                // デッキが5枚以下のとき使用不可
                if (deck[playerId].length <= 4 ) {
                    enable = false;
                }
                break        
            case "抹殺の使徒":
                // お互いの場に裏守備が無いとき使用不可
                if (!monsterZone[playerId].concat(monsterZone[opponentPlayerId]).some((id) => allCards[id] && allCards[id].faceStatus == "downDef")) {
                    enable = false;
                }
                break
            case "早すぎた埋葬":
                // console.log(graveyard[playerId])
                // console.log(graveyard[playerId].some((id) => id != null && allCards[id].cardtype == "Monster" ))
                // console.log(graveyard[playerId].some((id) =>(allCards[id].name != "カオス・ソルジャー －開闢の使者－")))
                // console.log(graveyard[playerId].some((id) =>(allCards[id].uuid != "")))
                // console.log(graveyard[playerId].some((id) =>(!allCards[id].name == "カオス・ソルジャー －開闢の使者－" || allCards[id].uuid != "")))
                // console.log(graveyard[playerId].some((id) => id != null && (allCards[id].cardtype == "Monster" && (allCards[id].name != "カオス・ソルジャー －開闢の使者－" || allCards[id].uuid != ""))))
                // console.log(!useGoats)
                // console.log(monsterZone[playerId].some(id => id == null))
                // console.log(players[playerId].hp > 800)
                // 墓地にモンスターが居ないときとスケープゴート使ったときとLPが800以下のとき使用不可
                // uuidが無い開闢は含めない
                if (graveyard[playerId].some((id) => id != null && (allCards[id].cardtype == "Monster" && (allCards[id].name != "カオス・ソルジャー －開闢の使者－" || allCards[id].uuid != ""))) && !useGoats && monsterZone[playerId].some(id => id == null) && players[playerId].hp > 800) {
                    enable = true;
                } else {
                    enable = false;
                }
                break
            case "スケープゴート":
                // 場に2体以上居るときと召喚、反転、特殊召喚していたら使用不可
                console.log(monsterZone)
                console.log(players)
                console.log(monsterZone[playerId].filter(id => id != null).length >= 2)
                console.log(players[playerId].useReverseAndSpecialSummon)
                console.log(!players[playerId].rightOfSummon)
                if (monsterZone[playerId].filter(id => id != null).length >= 2 || players[playerId].useReverseAndSpecialSummon) {
                    enable = false;
                }
                break
            case "増援":
                // デッキに一枚も戦士族が居ないとき使用不可
                if (deck[playerId].some((id) => id != null && (allCards[id].type == "soldier") && allCards[id].level <= 4)) {
                    enable = true;
                } else {
                    enable = false;
                }
                break
            case "ライトニング・ボルテックス":
                // 手札がないときないとき使用不可
                if (hand[playerId].length == 0 || (hand[playerId].length == 1 && hand[playerId][0] == cardId) || monsterZone[opponentPlayerId].every((id) => id == null || allCards[id].faceStatus =="downDef")) {
                    enable = false;
                }
                break
            case "リビングデッドの呼び声":
                // 墓地にモンスターが居ないときとスケープゴート使ったとき使用不可
                if (graveyard[playerId].some((id) => allCards[id].cardtype == "Monster") && !useGoats && monsterZone[playerId].some(id => id == null)) {
                    enable = true;
                } else {
                    enable = false;
                }
                break
            case "破壊輪":
                // 場にモンスターが居ないとき使用不可
                if (monsterZone[playerId].concat(monsterZone[opponentPlayerId]).some((id) => allCards[id] && (allCards[id].faceStatus == "attack" || allCards[id].faceStatus == "def"))) {
                    enable = true;
                } else {
                    enable = false;
                }
                break
            case "奈落の落とし穴":
                // 召喚モンスターの攻撃力が1500未満のとき使用不可
                if (allCards[actionMonster] && allCards[actionMonster].controller == opponentPlayerId && allCards[actionMonster].attack >= 1500) {
                    enable = true;
                } else {
                    enable = false;
                }
                break
            case "激流葬":
                // 場に誰もいなければ使用不可
                if (monsterZone[playerId].concat(monsterZone[opponentPlayerId]).every(id => id == null)) {
                    enable = false;
                }
                break
            case "炸裂装甲":
                console.log(cardId, actionMonster, allCards[actionMonster])
                // ターンプレイヤーは使えないように
                // 召喚時も使えないように
                if (!(players[playerId].turnPlayer) && allCards[actionMonster] && allCards[actionMonster].controller == opponentPlayerId && !conditions.includes('summoned')) {
                    enable = true;
                } else {
                    enable = false;
                }
                break
            case "カオス・ソルジャー －開闢の使者－":
                // 相手の場にカイクウが居るときとスケープゴート使ったとき召喚不可
                if (monsterZone[opponentPlayerId].some((id) => (allCards[id] && (allCards[id].name == "霊滅術師カイクウ" && allCards[id].faceStatus != "downDef"))) || useGoats) {
                    enable = false;
                }
                break
            case "魔導戦士ブレイカー":
                // 罠魔法が一つもなかったら使えない
                if (spellTrapZone[playerId].concat(spellTrapZone[opponentPlayerId]).every(id => id == null)) {
                    enable = false;
                }
                break
            case "ならず者傭兵部隊":
                // 自身は対象に取れないため自分以外のモンスターがいるかチェック
                if (monsterZone[playerId].concat(monsterZone[opponentPlayerId]).every(id => id == null || id == cardId)) {
                    enable = false;
                }
                break
            case "サイクロン":
                // 罠魔法が一つもなかったら使えない
                // 自身は対象に取れない
                if (spellTrapZone[playerId].concat(spellTrapZone[opponentPlayerId]).every(id => id == null || id == cardId)) {
                    enable = false;
                }
                break
            case "大嵐":
                // 罠魔法が一つもなかったら使えない
                // 自身は対象に取れない
                if (spellTrapZone[playerId].concat(spellTrapZone[opponentPlayerId]).every(id => id == null || id == cardId)) {
                    enable = false;
                }
                break
            case "砂塵の大竜巻":
                // 相手の罠魔法が一つもなかったら使えない
                if (spellTrapZone[opponentPlayerId].every(id => id == null)) {
                    enable = false;
                }
                break
            case "イグザリオン・ユニバース":
                console.log(action)
                // 相手の罠魔法が一つもなかったら使えない
                if (action == 'battleStep') {
                    enable = true;
                } else {
                    enable = false;
                }
                break
            
            default:
                enable = true;
        }
    }

    return enable;
}

// 蘇生を監視しながらクイックエフェクトの確認、蘇生したらresultがtrueになる
// クイックエフェクト使ったらstatus:true
// {quickEffectObj:{ fields, chainBlockCards, status:true/false }, result:true/false}
const checkReviveAndQuickEffect = async (socket, roomName, setQuickEffectTiming, setChainBlockCards, conditions, setConditions, updatefields, fieldsSetter, playerId, opponentPlayerId, action, setAction, cardId, setActionMonster, quickEffectStack, setQuickEffectStack, otherProps) => {
    return new Promise(async (resolve, reject) => {
        let result = false;
        const handler = () => {
            result = true;
            socket.off('revive', handler);
        };
        socket.on('revive', handler);

        // effectDetail関数を実行
        try {
            // let data = await effectDetail(); // effectDetailが非同期関数である場合、awaitを使用
            let quickEffectObj = await quickEffectConfirm(socket, roomName, setQuickEffectTiming, setChainBlockCards, conditions, setConditions, updatefields, fieldsSetter, playerId, opponentPlayerId, action, setAction, cardId, setActionMonster, quickEffectStack, setQuickEffectStack, otherProps)
            console.log(quickEffectObj, JSON.stringify(quickEffectObj))
            socket.off('revive', handler); // リスナーを削除
            resolve({ quickEffectObj, result });
        } catch (error) {
            socket.off('revive', handler); // エラーが発生した場合にもリスナーを削除
            reject(error);
        }
    });
}
// 蘇生を監視しながらクイックエフェクトの確認、蘇生したらresultがtrueになる
// {{ fields, chainBlockCards, stausu:true/false }, true/false}
const checkReviveAndChain = async (socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, effectProps, chainProps, chainConfirmFlag, setChainConfirmFlag, chainBlockCards, selectTargetProps, setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps) => {
    return new Promise(async (resolve, reject) => {
        let result = false;
        const handler = () => {
            result = true;
            socket.off('revive', handler);
        };
        socket.on('revive', handler);

        // effectDetail関数を実行
        try {
            // let data = await effectDetail(); // effectDetailが非同期関数である場合、awaitを使用
            let quickEffectObj = await makeChainBlock(socket, roomName, cardId, playerId, opponentPlayerId, fields, fieldsSetter, effectProps, chainProps, chainConfirmFlag, setChainConfirmFlag, chainBlockCards, selectTargetProps, setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps)
            console.log(quickEffectObj, JSON.stringify(quickEffectObj))
            socket.off('revive', handler); // リスナーを削除
            resolve({ quickEffectObj, result });
        } catch (error) {
            socket.off('revive', handler); // エラーが発生した場合にもリスナーを削除
            reject(error);
        }
    });
}
// 効果処理時のエフェクト
const visualizeEffectAndWait = (socket, roomName, cardId) => {
    console.log('effectVisualize', cardId);
    return new Promise(resolve => {
        socket.emit('effectVisualize', { roomName, cardId });
        setTimeout(resolve, 1200); // アニメーション時間と同期
    });
}
// 効果発動時のユーティリティ
// const triggerEffect = (socket, roomName, playerId, cardId) => {
//     const card = allCards[cardId];
//     const message = card.name + 'を発動しました'
//     socket.emit('messageLog', { type: 'battleLog', playerId: card.controller, message: message })
//     await triggerEffectAndWait(socket, roomName, cardId)
// }


// 効果発動時のエフェクト
const triggerEffectAndWait = (socket, roomName, cardId) => {
    console.log('effectTrigger', cardId);
    const card = allCards[cardId];
    const message = card.name + 'が発動しました'
    socket.emit('messageLog', { roomName: roomName, type: 'battleLogTrigger', action:'effect', playerId: card.controller, message: message })

    return new Promise(resolve => {
        socket.emit('effectTrigger', { roomName, cardId });
        setTimeout(resolve, 1200); // アニメーション時間と同期
    });
}
// 両プレイヤーを待つ関数(主にゲームスタート時)
// playerIdをキーに持ちisMobileをバリューに持つ
const waitBothPlayer = (socket, roomName, playerId, isMobile) => {
    return new Promise((resolve, reject) => {
        console.log('AWAIT both player')
        socket.emit('waitBothPlayer', { roomName, playerId, isMobile});

        socket.on('bothPlayerSynced', async (result) => {
            console.log('両プレイヤーが待ち終わりました', result)
            resolve(result);
            socket.off('bothPlayerSynced');
        });
    });
}

const unlink = (cardId, unlinkId) => {
    console.log(cardId, unlinkId)
    const card = allCards[cardId];
    console.log(card);
    if (unlinkId) {
        card.link = card.link.filter((id) => id != unlinkId);
    } else {
        card.link = [];
    }
    return cardId;
}

// 非公開領域の両者確認
const checkPrivateCardsBoth = async (socket, roomName, playerId, opponentPlayerId, fields, setOppoChoicing, setHoverCardId, isMobile) => {
    const checkPrivateCardsOppo = async (roomName, fields) => {
        return new Promise((resolve, reject) => {
            console.log('AWAIT checkPrivateCardsOppo')
            let newFields = { deck: fields.deck, hand: fields.hand, monsterZone: fields.monsterZone, spellTrapZone: fields.spellTrapZone };
            socket.emit('displayPrivateCards', { roomName, fields: newFields });

            const checkPrivateCards = async (result) => {
                console.log('相手プレイヤーの非公開領域確認が終わりました', result)
                resolve(result);
                socket.off('checkPrivateCards', checkPrivateCards);
                
            }
            socket.on('checkPrivateCards', checkPrivateCards);
        });
    }
    // デッキの確認
    return Promise.all([
        handleDisplayPrivateCards(playerId, opponentPlayerId, fields, setOppoChoicing, setHoverCardId, isMobile),
        checkPrivateCardsOppo(roomName, fields)
    ]).then(() => {
        // 両プレイヤーが準備完了した後の処理
        console.log('両プレイヤーの準備完了');
        setOppoChoicing(false)
        
    });
    
}

// 待機処理関数
const awaitTime = async (time) => {
    console.log('await',time,'ms...')
    const delay = async (time) => {
        return new Promise(resolve => setTimeout(resolve, time));
    }
    await delay(time)
    console.log(time, 'awaited!!')
}

// 攻撃アニメーションの待機
const attackMoveAnimation = async(socket, roomName, attackerId, targetId) => {
    return new Promise((resolve, reject) => {
        console.log('AWAIT attackMoveAnimation')
        socket.emit('cardAttackAnimation', { roomName, attackerId, targetId });

        const endCardAttackAnimation = async (result) => {
            console.log('攻撃アニメーションの終了', result)
            await awaitTime(800)
            resolve(result);
            socket.off('endCardAttackAnimation', endCardAttackAnimation);
            
        }
        socket.on('endCardAttackAnimation', endCardAttackAnimation);
    });
}

// ゲーム終了を迎えているか
const checkDecision = async (players, deck) => {
    if (players) {
        for (let id in players) {
            if (players[id].hp <= 0) {
                console.log(id ,'のLPはもうない')
                return true
            }
        }
    }
    // デッキ切れでの確認はhandleDrawで行う
    // if (deck) {
    //     for (let id in deck) {
    //         if (deck[id].length == 0) {
    //             console.log(id ,'のデッキはもうない')
    //             return true
    //         }
    //     }
    // }

    return false
}

// ファイバーポッドを使ったときにファイバーポッド以外のカード使用状況をリセット
const resetMatchDataUseEffect = async (playerId, opponentPlayerId, players) => {
    let updatePlayers = players;
    // const firstPlayerId = updatePlayers[playerId].matchData.firstPlayer
    // const secondPlayerId = updatePlayers[playerId].matchData.secondPlayer
    let matchDatas = {
        playerMatchData: updatePlayers[playerId].matchData,
        opponentPlayerlayerMatchData: updatePlayers[opponentPlayerId].matchData
    }
    console.log(matchDatas)
    for (let matchData in matchDatas) {
        matchDatas[matchData].firstPlayer_PotOfGreed = 0;
        matchDatas[matchData].firstPlayer_PotOfGreed = 0
        matchDatas[matchData].firstPlayer_theForcefulSentry = 0;
        matchDatas[matchData].firstPlayer_confiscation = 0;
        matchDatas[matchData].firstPlayer_PainfulChoice = 0;
        matchDatas[matchData].firstPlayer_changeOfHeart = 0;
        matchDatas[matchData].firstPlayer_snatchSteal = 0;
        matchDatas[matchData].firstPlayer_magicianOfFaith = 0;
        matchDatas[matchData].firstPlayer_donZaloog_hand = 0;
        matchDatas[matchData].firstPlayer_spiritReaper = 0;
        matchDatas[matchData].firstPlayer_injectionFairyLily = 0;
        matchDatas[matchData].firstPlayer_airknightParshath = 0;
        matchDatas[matchData].firstPlayer_Jinzo_summon = 0;
        matchDatas[matchData].firstPlayer_blackLusterSoldier_summon = 0

        matchDatas[matchData].secondPlayer_PotOfGreed = 0
        matchDatas[matchData].secondPlayer_theForcefulSentry = 0;
        matchDatas[matchData].secondPlayer_confiscation = 0;
        matchDatas[matchData].secondPlayer_PainfulChoice = 0;
        matchDatas[matchData].secondPlayer_changeOfHeart = 0;
        matchDatas[matchData].secondPlayer_snatchSteal = 0;
        matchDatas[matchData].secondPlayer_magicianOfFaith = 0;
        matchDatas[matchData].secondPlayer_donZaloog_hand = 0;
        matchDatas[matchData].secondPlayer_spiritReaper = 0;
        matchDatas[matchData].secondPlayer_injectionFairyLily = 0;
        matchDatas[matchData].secondPlayer_airknightParshath = 0;
        matchDatas[matchData].secondPlayer_Jinzo_summon = 0;
        matchDatas[matchData].secondPlayer_blackLusterSoldier_summon = 0
    }
    updatePlayers[playerId] = matchDatas.playerMatchData
    updatePlayers[opponentPlayerId] = matchDatas.opponentPlayerlayerMatchData

    return updatePlayers
}

// 複数枚一気に捨てる
const discardCards = async (playerId, hand, setHand, graveyard, setGraveyard, cardIds) => {
    console.log(hand, cardIds);
    let updateHand = { ...hand };
    let updateHandArray = updateHand[playerId]
    console.log(updateHand)
    for (let target of cardIds) {
        allCards[target].faceStatus = 'up';
        allCards[target].location = 'graveyard';
    }
    updateHandArray = updateHandArray.filter((handCardId) => !cardIds.includes(handCardId));
    
    updateHand[playerId] = updateHandArray
    console.log(updateHand)
    let updateGraveyard = { ...graveyard }
    let updateGraveyardPlayer = updateGraveyard[playerId];
    updateGraveyardPlayer = [...updateGraveyardPlayer, ...cardIds];
    updateGraveyard[playerId] = updateGraveyardPlayer
    console.log(updateGraveyard);
    setHand(updateHand)
    setGraveyard(updateGraveyard)
    // setGraveyard((prevState) => {
    //     let playerGrave = prevState[playerId];
    //     playerGrave = [...playerGrave, ...cardIds]
    //     prevState[playerId] = playerGrave
    //     return prevState
    // })
    return updateHand;
}

// エンドフェイズ時に手札が7枚以上あれば手札を6枚になるように捨てさせる
const adjustHand = async (socket, roomName, fields, fieldsSetter, playerId, setHoverCardId) => {
    let updatefields = fields
    let updateHand = updatefields.hand

    if (updateHand[playerId].length >= 7) {
        const discardNum = updateHand[playerId].length - 6
        const targets = await selectCards(updateHand[playerId], discardNum, setHoverCardId, 'endPhase');

        console.log(targets)
        updateHand = await discardCards(playerId, updateHand, fieldsSetter.setHand, updatefields.graveyard, fieldsSetter.setGraveyard, targets);
        socket.emit('discardCards', { roomName, playerId: playerId, targets: targets })
        return updateHand;
    }
}

// 効果発動時に対象を取る処理
// 対象取らない物や選んだ場合はtrueで通過、falseでキャンセル
const selectTargetCard = async (socket, roomName, playerId, opponentPlayerId, fields, fieldsSetter, cardId, selectTargetProps, quickEffectAndChain) => {
    // 対象を取らないカードなら即座に終了
    if (allCards[cardId].name != '聖なる魔術師'
        && allCards[cardId].name != '早すぎた埋葬'
        && allCards[cardId].name != 'リビングデッドの呼び声'
        && allCards[cardId].name != 'ならず者傭兵部隊'
        && allCards[cardId].name != 'カオス・ソルジャー －開闢の使者－'
        && allCards[cardId].name != '破壊輪'
        && allCards[cardId].name != '心変わり'
        && allCards[cardId].name != '強奪'
        && allCards[cardId].name != '抹殺の使徒'
        && allCards[cardId].name != '魔導戦士ブレイカー'
        && allCards[cardId].name != 'サイクロン'
        && allCards[cardId].name != '砂塵の大竜巻'
        && allCards[cardId].name != '同族感染ウイルス') {
        console.log('対象とらないよ')
        return true
    }
    const monsterZone = fields.monsterZone 
    const spellTrapZone = fields.spellTrapZone 
    const graveyard = fields.graveyard 

    let targets = [];
    console.log('対象とるよ～')
    // 場のカードを対象に取るもの
    if (allCards[cardId].name == 'ならず者傭兵部隊'
        || allCards[cardId].name == 'カオス・ソルジャー －開闢の使者－'
        || allCards[cardId].name == '破壊輪'
        || allCards[cardId].name == '心変わり'
        || allCards[cardId].name == '抹殺の使徒'
        || allCards[cardId].name == 'サイクロン'
        || allCards[cardId].name == '魔導戦士ブレイカー'
        || allCards[cardId].name == '砂塵の大竜巻'
    ) {
        
        // 対象可能範囲の設定
        // フィールド上の全モンスター
        if (allCards[cardId].name == 'ならず者傭兵部隊' || allCards[cardId].name == 'カオス・ソルジャー －開闢の使者－' || allCards[cardId].name == '破壊輪' || allCards[cardId].name == '抹殺の使徒') {
            
            targets = monsterZone[playerId].concat(monsterZone[opponentPlayerId]).filter((id) => id != null)
            // ならず者は自分以外
            if (allCards[cardId].name == 'ならず者傭兵部隊') {
                targets = monsterZone[playerId].concat(monsterZone[opponentPlayerId]).filter((id) => id != null && id != cardId)
            }
            // 抹殺の使徒は裏側のみ
            if (allCards[cardId].name == '抹殺の使徒') {
                targets = targets.filter((id) => allCards[id].faceStatus == 'downDef')
            }
            // 破壊輪は表側のみ
            else if (allCards[cardId].name == '破壊輪') {
                targets = targets.filter((id) => allCards[id].faceStatus != 'downDef')
            }
        }
        // 相手のモンスター
        else if (allCards[cardId].name == '心変わり') {
            targets = monsterZone[opponentPlayerId].filter((id) => id != null)
        }
        // 場の魔法罠
        else if (allCards[cardId].name == 'サイクロン' || allCards[cardId].name == '魔導戦士ブレイカー') {
            targets = spellTrapZone[playerId].concat(spellTrapZone[opponentPlayerId]).filter((id) => id != null && id != cardId)
        }
        // 相手の魔法罠
        if (allCards[cardId].name == '砂塵の大竜巻') {
            targets = spellTrapZone[opponentPlayerId].filter((id) => id != null)
        }
        console.log('対象範囲は', targets)
        const targetCardId = await asyncSelectCard(socket, cardId, targets, selectTargetProps);
        console.log('対象は', targetCardId)
        if (targetCardId == null || targetCardId == false) {
            return false
        }
        allCards[cardId].effect.target = targetCardId
        
    // 墓地のカードを対象にとるもの
    } else if (allCards[cardId].name == '聖なる魔術師' || allCards[cardId].name == 'リビングデッドの呼び声') {
        targets = graveyard[playerId];
        
        if (allCards[cardId].name == 'リビングデッドの呼び声') {
            targets = graveyard[playerId].filter((id) => allCards[id].cardtype == 'Monster' && (allCards[id].name != 'カオス・ソルジャー －開闢の使者－' || allCards[id].uuid != ''))
        } else if (allCards[cardId].name == '聖なる魔術師') {
            console.log(graveyard[playerId])
            targets = graveyard[playerId].filter((id) => allCards[id].cardtype == 'Spell');
            console.log(targets)
            // 対象がなければそのまま通す
            if (targets.length == 0) {
                return true
            }
        }
        await getPriority(fields.players, fieldsSetter.setPlayers, opponentPlayerId, playerId)
        selectTargetProps.setEffecting(true)
        const target = await selectCards(targets, 1, selectTargetProps.setHoverCardId, cardId, playerId, quickEffectAndChain);
        selectTargetProps.setEffecting(false)
        await getPriority(fields.players, fieldsSetter.setPlayers, playerId, opponentPlayerId)
        if (target == null || target == false) {
            return false
        }
        let targetCardId = null;
        if (target) {
            targetCardId = target[0]
        } else {
            return true
        }

        console.log(targetCardId);
        allCards[cardId].effect.target = targetCardId
    
    }
    // 間違えて作ってたけど結局あってた装備先選択
    else if (allCards[cardId].name == '早すぎた埋葬' || allCards[cardId].name == '強奪') {
        selectTargetProps.setEffecting(true)
        const targetCardId = await selectEquipTarget(socket, cardId, fields, fieldsSetter, playerId, opponentPlayerId, selectTargetProps)
        selectTargetProps.setEffecting(false)
        if (targetCardId == null || targetCardId == false) {
            return false
        }
        console.log(targetCardId);
        allCards[cardId].effect.target = targetCardId
    }
    // 種族選択をするもの
    else if (allCards[cardId].name == '同族感染ウイルス') {
        let targetType = false;
        await getPriority(fields.players, fieldsSetter.setPlayers, opponentPlayerId, playerId)
        if (quickEffectAndChain.quickEffectTiming) {
            console.log(quickEffectAndChain.quickEffectTiming)
            quickEffectAndChain.setQuickEffectTiming(false)
            quickEffectAndChain.setEffecting(true)
            targetType = await choice(cardId, fields);
            quickEffectAndChain.setQuickEffectTiming(true)
            quickEffectAndChain.setEffecting(false)
        } else {
            targetType = await choice(cardId, fields);
        }
        console.log(targetType)
        if (targetType) {
            allCards[cardId].effect.target = targetType
        } else {
            await getPriority(fields.players, fieldsSetter.setPlayers, playerId, opponentPlayerId)
            return false
        }

    }
    // await getPriority(fields.players, fieldsSetter.setPlayers, opponentPlayerId, playerId)
    return true;
}

const opponentCheckEffectTarget = async (socket, roomName, cardId, setOppoChoicing) => {
    return new Promise((resolve, reject) => {
        console.log('AWAIT attackMoveAnimation')
        setOppoChoicing(true)
        socket.emit('checkEffectTarget', { roomName, cardId });

        const endCheckEffectTarget = async (result) => {
            console.log('相手の効果対象確認', result, result.effectTargetCardId)
            setOppoChoicing(false)
            resolve(result.effectTargetCardId);
            socket.off('checkEffectTargetEnd', endCheckEffectTarget);

        }
        socket.on('checkEffectTargetEnd', endCheckEffectTarget);
    });
}


export {
    drawCard,
    handleDraw,
    handleDrawCards,
    drawCards,
    normalSummon,
    put,
    activate,
    change,
    reverse,
    destroy,
    searcher,
    shuffle,
    getPriority,
    makeChainBlock,
    asyncSelectCard,
    cleanUp,
    sweep,
    betray,
    effectResolution,
    returnPriority,
    payCost,
    quickEffectConfirm,
    discard,
    reduceLifePoint,
    handReturnToDeck,
    attack,
    attackIncrease,
    endTurn,
    openCards,
    salvage,
    monsterBanish,
    deckBanish,
    advanceSummon,
    reduceLifePointBoth,
    revive,
    sideEffectChain,
    summon,
    useRightOfSummon,
    graveReturnToHand,
    actionChain,
    actionChainHandle,
    deckDestruction,
    graveyardToBanish,
    fiberJar,
    fiberJarHandle,
    selectOppo,
    deckToGraveyard,
    blackLusterSummonHandle,
    blackLusterSummon,
    gameStart,
    quickEffectConfirmOppo,
    promiseDraw,
    selectEquipTarget,
    discardSelf,
    returnSnatchMonsters,
    chainSelf,
    checkCanEnable,
    quickEffectConfirmSelf,
    checkReviveAndQuickEffect,
    visualizeEffectAndWait,
    triggerEffectAndWait,
    waitBothPlayer,
    unlink,
    checkPrivateCardsBoth,
    awaitTime,
    matchDataUpdate,
    checkDecision,
    resetMatchDataUseEffect,
    discardCards,
    adjustHand,
    selectTargetCard,
};