import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { allCards, cleanUpAllCards } from '../models/cards';
import { activate, getPriority } from '../gamePlayLogic';





const Result = ({ socket, roomName, playerId, opponentPlayerId, players, winner, endGame }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const setShowTitle = endGame.setShowTitle
    const setShowDecideTurn = endGame.setShowDecideTurn
    const setShowDuel = endGame.setShowDuel
    const setFirstPlayer = endGame.setFirstPlayer
    const setoppoName = endGame.setMatchResult
    const setRoomName = endGame.setRoomName


    let message = ""
    if (winner == playerId) {
        message = "勝利"
    } else if (winner == opponentPlayerId) {
        message = "敗北"
    } else {
        message = "引き分け"
    }
    const rematch = () => {
        // allCards[1].owner = ''
        setFirstPlayer('')
        setShowDuel(false)
        setShowDecideTurn(true)
        cleanUpAllCards();
    }
    
    const returnTitle = () => {
        // allCards[1].owner = ''
        setFirstPlayer('')
        setShowDuel(false);
        setShowDecideTurn(false);
        setShowTitle(true);
        cleanUpAllCards();
        setoppoName('')
        setRoomName('')
        socket.emit('leaveRoom', roomName);
    }
    return (
        <div className={`battle-result card-selection-wrapper ${isMinimized ? 'minimized' : ''}`}>
            <div className={`card-selection ${isMinimized ? 'minimized' : ''}`}>
                <div className='minimize-button'>
                    {/* 縮小ボタン */}
                    <button onClick={() => setIsMinimized(true)}>縮小</button>
                </div>
                <div>
                    {message}
                </div>

                {/* カード一覧 */}

                <div>
                    <button onClick={rematch} className='confirm-button'>再戦する</button>
                    <button onClick={returnTitle} className='cancel-button'>タイトルに戻る</button>
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
export default Result;