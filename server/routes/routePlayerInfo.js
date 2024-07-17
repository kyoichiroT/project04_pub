const express = require('express');
const router = express.Router();


const playerInfo = require('../playerInfo');
const { savePlayerInfo, getPlayerInfo } = playerInfo;


// セッションを利用するためのミドルウェアの設定
router.post('/savePlayerInfo', (req, res) => {
    console.log('req body=',req.body)
    const { playerName, secretword } = req.body;

    // savePlayerInfo関数を呼び出してセッションに値を保存する
    savePlayerInfo(req, playerName, secretword);
    // レスポンスを返す
    res.json({ success: true });
});
router.get('/getPlayerInfo', (req, res) => {
    playerData = getPlayerInfo(req)
    const playerName = req.session.playerInfo.playerName;
    const secretword = req.session.playerInfo.secretword;
    res.json({ playerName, secretword });
});
module.exports = router;