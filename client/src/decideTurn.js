import React, { useState, useEffect } from 'react';

import { handleTurnDecision } from './socket/beforeDuel';

const DecideTurn = ({ socket, onDuelStartClick, roomName, firstPlayer, setFirstPlayer, setSecondPlayer, playerId, setPlayers, playerName }) => {
    const [choice, setChoice] = useState('random');
    const [sended, setSended] = useState(false);
    const [starting, setStarting] = useState(false);
    const [startingText, setStartingText] = useState('ゲームを始める');

    const handleRandomClick = () => {
        setChoice('random');
    };

    const handleGiveClick = () => {
        setChoice('give');
    };

    const handleSubmit = () => {
        // サーバーにデータを送信する
        socket.emit('decideTurn', choice, roomName, playerName);
        setSended(true)
    };
    const handleDuelStart = () => {
        setStarting(true)
        setStartingText('間もなく始まります')
        // クリックされたらこのコンポーネントを非表示にしてDuelコンポーネントを表示
        setTimeout(() => {
            // ここに重い処理を非同期で実行
            onDuelStartClick()
        }, 100); // setTimeoutを0ミリ秒で使用して、次のイベントループで処理を実行
    }


    useEffect(() => {
        const turnDecisionHandler = (data) => handleTurnDecision(socket, data, setFirstPlayer, setSecondPlayer, setPlayers);
        socket.on('turnDecision', turnDecisionHandler);

        return () => {
            socket.off('turnDecision', turnDecisionHandler);
        };
    }, []);

    if (!firstPlayer) {
        return (
            <div className='decide-turn-choice'>
                <h2>先行後攻を決める</h2>
                <p>現在の選択:{choice == 'random' ? 'ランダム' : choice == 'give' ? '相手に先行を譲る' : ''}</p>
                <div className='turn-decide-buttons'>
                    <div className='turn-choice-buttons'>
                        <button className='rondom-choice-button turn-choice button' onClick={handleRandomClick} disabled={sended}>ランダム</button>
                        <button className='give-button turn-choice button' onClick={handleGiveClick} disabled={sended}>先行を譲る</button>
                    </div>
                    {/* <button onClick={handleSubmit}>送信</button> */}
                    <button className='turn-decide-submit-button button' type="submit" onClick={handleSubmit} disabled={sended}>{sended ? '相手を待っています...' : '送信'}</button>

                </div>
            </div>
        );
    } else {
        return (
            <div className='decided-turn'>
                {firstPlayer === playerId ? <h2>あなたは先攻です</h2> : <h2>あなたは後攻です</h2>}
                <button className='start-game-button button' onClick={handleDuelStart}>{startingText}</button>
            </div>
        );
    }
}



export { DecideTurn };



