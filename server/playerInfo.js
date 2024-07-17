
// プレイヤーの情報をセッションに保存する関数
function savePlayerInfo(req, playerName, secretword) {
    req.session.playerInfo = {
        playerName,
        secretword
    };
}

// セッションからプレイヤーの情報を取得する関数
function getPlayerInfo(req) {
    return req.session.playerInfo;    
}
// その他のプレイヤー情報に関する処理やユーティリティ関数を定義します

module.exports = {
    savePlayerInfo,
    getPlayerInfo
};