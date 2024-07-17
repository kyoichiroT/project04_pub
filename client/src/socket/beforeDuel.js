const { Player } = require("../models/models");

// socket.on('matchSuccess')の処理
const handleMatchSuccess = (socket, data, setMatchResult, setIsMatching, setRoomName, setPlayerId, setOpponentPlayerId) => {
    // マッチング成功時の処理をここに記述
    console.log('マッチング成功:', data.playerName);
    socket.emit('joinRoom', data.roomName);
    setRoomName(data.roomName);
    setMatchResult(data.playerName);
    setPlayerId(data.playerId);
    setIsMatching(false);
    console.log('oppID',data.matchedPlayerId)
    setOpponentPlayerId(data.matchedPlayerId);
};

const handleTurnDecision = (socket, data, setFirstPlayer, setSecondPlayer, setPlayers) => {
    setFirstPlayer(data.firstPlayer);
    setSecondPlayer(data.secondPlayer)
    if (socket.id == data.firstPlayer) {
        console.log('you are first')
    } else {
        console.log('you are second')
    }
    // 集計用のマッチデータ
    // const matchData = {}
    console.log(data)
    const matchData = {
        matchNumber: data.matchCount,
        firstPlayer: data.firstPlayer,
        firstPlayer_isMobile: null,
        firstPlayerLP: '',
        secondPlayer: data.secondPlayer,
        secondPlayer_isMobile: null,
        secondPlayerLP: '',
        winner:'',
        cause: '',
        turn_count: '',
        date: null,

        firstPlayer_PotOfGreed: 0,
        firstPlayer_theForcefulSentry: 0,
        firstPlayer_confiscation: 0,
        firstPlayer_PainfulChoice: 0,
        firstPlayer_changeOfHeart: 0,
        firstPlayer_snatchSteal: 0,
        firstPlayer_magicianOfFaith: 0,
        firstPlayer_donZaloog_hand: 0,
        firstPlayer_spiritReaper: 0,
        firstPlayer_injectionFairyLily: 0,
        firstPlayer_fiberJar: 0,
        firstPlayer_airknightParshath: 0,
        firstPlayer_airknightParshath_summon: 0,
        firstPlayer_Jinzo_summon: 0,
        firstPlayer_blackLusterSoldier_summon: 0,

        firstPlayer_monster_length: null,
        firstPlayer_monster1: null,
        firstPlayer_monster2: null,
        firstPlayer_monster3: null,
        firstPlayer_monster4: null,
        firstPlayer_monster5: null,
        firstPlayer_spell_trap_length: null,
        firstPlayer_spell_trap1: null,
        firstPlayer_spell_trap2: null,
        firstPlayer_spell_trap3: null,
        firstPlayer_spell_trap4: null,
        firstPlayer_spell_trap5: null,
        firstPlayer_hand_length: null,
        firstPlayer_hand_json: null,
        firstPlayer_grave_length: null,
        firstPlayer_grave_json: null,
        firstPlayer_banish_length: null,
        firstPlayer_banish_json: null,

        secondPlayer_PotOfGreed: 0,
        secondPlayer_theForcefulSentry: 0,
        secondPlayer_confiscation: 0,
        secondPlayer_PainfulChoice: 0,
        secondPlayer_changeOfHeart: 0,
        secondPlayer_snatchSteal: 0,
        secondPlayer_magicianOfFaith: 0,
        secondPlayer_donZaloog_hand: 0,
        secondPlayer_spiritReaper: 0,
        secondPlayer_injectionFairyLily: 0,
        secondPlayer_fiberJar: 0,
        secondPlayer_airknightParshath: 0,
        secondPlayer_airknightParshath_summon: 0,
        secondPlayer_Jinzo_summon: 0,
        secondPlayer_blackLusterSoldier_summon: 0,

        secondPlayer_monster_length: null,
        secondPlayer_monster1: null,
        secondPlayer_monster2: null,
        secondPlayer_monster3: null,
        secondPlayer_monster4: null,
        secondPlayer_monster5: null,
        secondPlayer_spell_trap_length: null,
        secondPlayer_spell_trap1: null,
        secondPlayer_spell_trap2: null,
        secondPlayer_spell_trap3: null,
        secondPlayer_spell_trap4: null,
        secondPlayer_spell_trap5: null,
        secondPlayer_hand_length: null,
        secondPlayer_hand_json: null,
        secondPlayer_grave_length: null,
        secondPlayer_grave_json: null,
        secondPlayer_banish_length: null,
        secondPlayer_banish_json: null,
    }
    const player1 = new Player(data.firstPlayer, data.firstPlayerName, 8000, true, true, true, false, false, matchData);
    const player2 = new Player(data.secondPlayer, data.secondPlayerName, 8000, true, false, false, false, false, matchData);
    // const player1 = new Player(data.firstPlayer, data.firstPlayerName, 8000, true, true, true, false, false);
    // const player2 = new Player(data.secondPlayer, data.secondPlayerName, 8000, true, false, false, false, false);

    const players = {
        [data.firstPlayer]: player1,
        [data.secondPlayer]: player2,
    };
    console.log(players);
    setPlayers(players);
}

module.exports = { handleMatchSuccess, handleTurnDecision };