import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { allCards, cleanUpAllCards } from '../models/cards';

// import '../css/displayCards.css';
// import { DisplayCard } from './displayCard';

const Disconnect = ({ socket, roomName, setFirstPlayer, setShowDuel, setShowDecideTurn, setShowTitle, disconnectedMessage, setDisconnectedMessage, setMatchResult }) => {


    let message = disconnectedMessage === true ? "サーバーとの接続が切れました" : "対戦相手との接続が切れました。"

    const returnTitle = () => {
        // allCards[1].owner = ''
        console.log('対戦相手との接続が切れました。タイトルに戻ります')
        setFirstPlayer('')
        setShowDuel(false);
        setShowDecideTurn(false);
        setShowTitle(true);
        cleanUpAllCards();
        setDisconnectedMessage("");
        setMatchResult("")
        socket.emit('leaveRoom', roomName);
    }
    return (
        <div className='disconnected'>

            <div>
                <h3>{message}</h3>
            </div>
            <button onClick={returnTitle} className='cancel-button'>タイトルに戻る</button>

        </div>

    )
}



export { Disconnect };