

// 関数使いまわしによりドロー以外不要。ドローも適切な場所で定義されれば不要。削除予定


// 相手がドローしたときの処理
const handleDraw = (socket, deck, opponentPlayerId, setHand, setDeck) => {
    // deckからカードを一枚取り出す
    const drawnCard = deck[opponentPlayerId][0];

    // handにカードを追加する
    setHand((prevHand) => {
        const updatedHand = { ...prevHand };
        updatedHand[opponentPlayerId] = [...updatedHand[opponentPlayerId], drawnCard];
        return updatedHand;
    });
    // deckから取り出したカードを削除する
    setDeck((prevDeck) => {
        const updatedDeck = { ...prevDeck };
        updatedDeck[opponentPlayerId] = updatedDeck[opponentPlayerId].slice(1);
        return updatedDeck;
    });
    
}

// モンスターゾーンから指定したカードの削除
const removeFromMonsterZone = (monsterZone, setMonsterZone, playerId, card) => {
    const updatedMonsterZone = monsterZone[playerId].filter((targetCard) => targetCard.id !== card.id);
    setMonsterZone((prevMonsterZone) => {
        const updatedMonsterArray = { ...prevMonsterZone };
        updatedMonsterArray[playerId] = updatedMonsterZone;
        return updatedMonsterArray;
    });
}


const addSpellTrapZone = (setSpellTrapZone, playerId, card) => {
    setSpellTrapZone((prevSpellTrapZone) => {
        const updateSpellTrapZone = { ...prevSpellTrapZone };
        updateSpellTrapZone[playerId] = [...updateSpellTrapZone[playerId], card];
        return updateSpellTrapZone;
    });
}

const addGraveyard = (setGraveyard, playerId, card) => {
    setGraveyard((prevGraveyard) => {
        const updateGraveyard = { ...prevGraveyard };
        updateGraveyard[playerId] = [...updateGraveyard[playerId], card];
        return updateGraveyard;
    });
}

// 召喚権の使用
const useRightOfSummon = (setPlayers, playerId) => {
    setPlayers((prevPlayers) => {
        const updatedPlayers = { ...prevPlayers }; // 配列としてコピーする
        const playerToUpdate = { ...updatedPlayers[playerId] }; // playerIdの要素をコピーする
        playerToUpdate.rightOfSummon = false;
        playerToUpdate.summonable = false;
        updatedPlayers[playerId] = playerToUpdate; // 更新した要素を配列にセットする
        return updatedPlayers;
    });
}






const summon = (card, setMonsterZone, opponentPlayerId) => {
    // monsterZoneにカードを追加する
    setMonsterZone((prevMonsterZone) => {
        const updatedMonsterZone = { ...prevMonsterZone };
        updatedMonsterZone[opponentPlayerId] = [...updatedMonsterZone[opponentPlayerId], card];
        return updatedMonsterZone;
    });

    // cardにpositionとfaceStatusが含まれているのでここで更新する必要はない

}


// 相手が召喚したときの処理
const handleNormalSummon = (socket, card, hand, opponentPlayerId, setHand, setMonsterZone, setPlayers) => {
    // monsterZoneにカードを追加する
    summon(card, setMonsterZone, opponentPlayerId)
    removeFromHnad(hand, setHand, opponentPlayerId, card);
    useRightOfSummon(setPlayers, opponentPlayerId);
}

const handlePut = (socket, card, hand, opponentPlayerId, setHand, setSpellTrapZone) => {


    addSpellTrapZone(setSpellTrapZone, opponentPlayerId, card);

    removeFromHnad(hand, setHand, opponentPlayerId, card);
}

const activate = (socket, roomName, card, opponentPlayerId, hand, setHand, deck, setDeck, monsterZone, setMonsterZone, spellTrapZone, setSpellTrapZone, graveyard, setGraveyard, banishZone, setBanishZone) => {

    // effectの処理

    if (card.location == 'monsterZone') {
        // removeFromMonsterZone(monsterZone, setMonsterZone, playerId, card);
    }
    if (card.location == 'spellTrapZone') {
        removeFromSpellTrapZone(spellTrapZone, setSpellTrapZone, opponentPlayerId, card);
        addGraveyard(setGraveyard, opponentPlayerId, card);
    }
}



export { handleDraw, handleNormalSummon, handlePut, activate };