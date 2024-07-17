import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Title } from './title';
import { DecideTurn } from './decideTurn';
import { Duel } from './Duel';
import { useSpring, animated } from 'react-spring';
import { Disconnect } from './component/disconnect';
import Announce from './component/announce';


// const serverPath = 'http://localhost:8080/';
const serverPath = process.env.REACT_APP_SERVER_URL;
console.log(serverPath)
const socket = io(serverPath, {
    withCredentials: false,
    // extraHeaders is secret
    transports: ['websocket', 'polling'], // 優先順位を指定
});
// socket.baseTimeStamp = Date.now();
// console.log(socket)
// socket.connect()
// // ソケット接続が成功した際の処理
// socket.on('connect', () => {
//     console.log('ソケット接続が確立されました');
// });


const Game = () => {
    const [showTitle, setShowTitle] = useState(true);
    const [matchResult, setMatchResult] = useState('');
    const [showDecideTurn, setShowDecideTurn] = useState(false);
    const [showDuel, setShowDuel] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [playerName, setPlayerName] = useState('player');
    const [playerId, setPlayerId] = useState('');
    const [firstPlayer, setFirstPlayer] = useState('');
    const [secondPlayer, setSecondPlayer] = useState('');
    const [players, setPlayers] = useState([]); // 常に[先行,後攻]の順で入る
    const [opponentPlayerId, setOpponentPlayerId] = useState('');
    const endGame = {
        setShowTitle: setShowTitle,
        setShowDecideTurn: setShowDecideTurn,
        setShowDuel: setShowDuel,
        setFirstPlayer: setFirstPlayer,
        setRoomName: setRoomName,
        setMatchResult: setMatchResult,
    }

    // ユーザー切断時の表示メッセージ
    const [disconnectedMessage, setDisconnectedMessage] = useState("");
    useEffect(() => {

        socket.baseTimeStamp = Date.now();
        console.log(socket)
        socket.connect()
        // ソケット接続が成功した際の処理
        socket.on('connect', () => {
            console.log('ソケット接続が確立されました');
        });

        const userDisconnectedHandler = (data) => {
            console.log('disconected')
            setDisconnectedMessage(data.userId)
        }
        socket.on('disconnect', (reason) => {
            console.log('接続が切れました:', reason);
            setDisconnectedMessage(true);
        });
        socket.on('userDisconnected', userDisconnectedHandler)

        return () => {
            socket.off('connect')
            socket.off('userDisconnected', userDisconnectedHandler)
            socket.off('disconnect');
            socket.close();
        }
    }, []);
    
    return (
            <div className='project-04'>
                {showTitle && (
                    <Title
                        socket={socket}
                        onDecideTurnClick={() => {
                            setShowTitle(false);
                            setShowDecideTurn(true)
                        }}
                        roomName={roomName}
                        setRoomName={setRoomName}
                        matchResult={matchResult}
                        setMatchResult={setMatchResult}
                        playerName={playerName}
                        setPlayerName={setPlayerName}
                        setPlayerId={setPlayerId}
                        setOpponentPlayerId={setOpponentPlayerId}
                    />
                )}
                {showDecideTurn && (
                    <DecideTurn
                        socket={socket}
                        onDuelStartClick={() => {
                            setShowDecideTurn(false);
                            setShowDuel(true)
                        }}
                        roomName={roomName}
                        firstPlayer={firstPlayer}
                        setFirstPlayer={setFirstPlayer}
                        setSecondPlayer={setSecondPlayer}
                        playerId={playerId}
                        setPlayers={setPlayers}
                        playerName={playerName}
                    />
                )}
                {showDuel && (
                    <Duel
                    socket={socket}
                    roomName={roomName}
                    players={players}
                    setPlayers={setPlayers}
                    playerId={playerId}
                    opponentPlayerId={opponentPlayerId}
                    firstPlayer={firstPlayer}
                    secondPlayer={secondPlayer}
                    endGame={endGame}
                    //     roomName={roomName}
                    //     firstPlayer={firstPlayer}
                    //     setFirstPlayer={setFirstPlayer}
                    />
            )}
            {disconnectedMessage && (
                <Disconnect socket={socket} roomName={roomName} setFirstPlayer={setFirstPlayer} setShowDuel={setShowDuel} setShowDecideTurn={setShowDecideTurn} setShowTitle={setShowTitle} disconnectedMessage={disconnectedMessage} setDisconnectedMessage={setDisconnectedMessage} setMatchResult={setMatchResult}/>
            )}
            <Announce socket={socket} />
            </div>
    );
}

export default Game;