import React, { useState, useEffect, Suspense } from 'react';
// import DisplayCard from './component/displayCard';
const LazyDisplayCard = React.lazy(() => import('./component/displayCard'));
import { allCards } from './models/cards';
import { handleMatchSuccess } from './socket/beforeDuel';

import './css/title.css'
import './css/qAndA.css'
import QAndA from './component/qAndA';

const Title = ({ socket, onDecideTurnClick, roomName, setRoomName, matchResult, setMatchResult, playerName, setPlayerName, setPlayerId, setOpponentPlayerId}) => {
    const [secretword, setSecretword] = useState('');
    const [isMatching, setIsMatching] = useState(false);
    // マウスが乗せられているうカード
    const [hoverCardId, setHoverCardId] = useState(null);
    // カードの説明
    const [description, setDescription] = useState('');
    // QandAの表示
    const [opneQandA, setOpneQandA] = useState(false);
    
    const handleMatchUsers = (e) => {
        e.preventDefault();
        setIsMatching(true);
        // ユーザーの入力情報を送信
        socket.emit('match', { playerName, secretword });
    };

    useEffect(() => {
        const matchSuccessHandler = (data) => handleMatchSuccess(socket, data, setMatchResult, setIsMatching, setRoomName, setPlayerId, setOpponentPlayerId);

        socket.on('matchSuccess', matchSuccessHandler);


        return () => {
            socket.off('matchSuccess', matchSuccessHandler);
        };
    }, []);

    const handleDecideTurnClick = (e) => {
        // クリックされたらこのコンポーネントを非表示にして先攻決めコンポーネントの表示
        onDecideTurnClick();
    }

    const cancelMatch = () => {
        setMatchResult('');
        socket.emit('leaveRoom', roomName);
    }
    const handleKeyPress = (event) => {
        // エンターキーが押されたかをチェック
        if (event.key === 'Enter') {
            // エンターキーのデフォルトの動作（ここではフォームの送信）を防ぐ
            event.preventDefault();
        }
    };
    let cardLists = Array.from({ length: 40 }, (_, index) => index + 1);

    const cardTypeOrder = { 'Monster': 1, 'Spell': 2, 'Trap': 3 };

    const sortedIds = cardLists.sort((a, b) => {
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
    useEffect(() => {
        if (hoverCardId !== null) {
            let cardDesc = allCards[hoverCardId].description.replace(/\n/g, '<br>')
            if (allCards[hoverCardId].name == '増援') {
                const soldiers = sortedIds.filter((cardId) => allCards[cardId].type == 'soldier' && allCards[cardId].level <= 4).sort((a, b) => a - b);

                cardDesc += '<br><br><span className=`additional-text`>サーチ出来るカード：<br>'
                if (soldiers.length != 0) {
                    for (let soldier of soldiers) {
                        cardDesc += allCards[soldier].name
                        cardDesc += '<br>'
                    }
                } else {
                    cardDesc += 'なし'
                }
                cardDesc += '</span>'
            }
            setDescription(cardDesc)
        } else {
            setDescription("")
        }
    }, [hoverCardId]);
    
    return (
        <div className='game-title-wrapper'>
            <div className='title-name'>
                <h1>04環境オンライン</h1>
            </div>
            <div className='game-title'>
                <div className='back-ground-cards'>

                    <div className='card-descriptions placeholder'>
                        <div className='card-picture big'>
                            <Suspense key={hoverCardId}>
                                {hoverCardId !== null && <LazyDisplayCard key={hoverCardId} cardId={hoverCardId} onHover={setHoverCardId} />}
                            </Suspense>
                        </div>
                        <div className='card-description'>
                            <div dangerouslySetInnerHTML={{ __html: description }} />
                        </div>
                    </div>
                    <div className='card-list'>
                        {sortedIds.map((cardId) => (
                            <Suspense key={cardId}>
                                <LazyDisplayCard key={cardId} cardId={cardId} onHover={setHoverCardId} />
                            </Suspense>
                        ))}
                    </div>
                    <div className='matching-form-wrapper'>
                        {!matchResult && (
                            // <form className='matching-form' onSubmit={handleMatchUsers}>
                            <div className='matching-form-wrapper'>
                                {/* <div className='name-input-row'> */}
                                <form className='matching-form name-input-row' onSubmit={handleMatchUsers}>
                                    <input className='player-name-input matching-form-input' type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} onKeyPress={handleKeyPress} placeholder="プレイヤーネーム" />
                                    <button className='random-matching-button matching-button' type="submit" disabled={isMatching || playerName.trim() === ''} onClick={()=>setSecretword('')}>{isMatching ? 'マッチング中...' : 'ランダムマッチ'}</button>
                                </form>
                                {/* </div> */}
                                {/* <div className='secret-word-input-row'> */}
                                <form className='matching-form name-input-row' onSubmit={handleMatchUsers}>
                                    <input className='secret-word-input matching-form-input' type="text" value={secretword} onChange={(e) => setSecretword(e.target.value)} placeholder="合言葉" />
                                    <button className='secret-word-matching-button matching-button' type="submit" disabled={isMatching || playerName.trim() === '' || secretword.trim() === ''}>{isMatching ? 'マッチング中...' : '合言葉でマッチング'}</button>
                                </form>
                            </div>
                        )}
                        {matchResult && (
                            <div className='matching-result'>
                                <h2>マッチング成功！</h2>
                                <p>対戦相手：{matchResult}</p>
                                <div className='matched-button buttons'>
                                    <button className='match-start-button' onClick={() => handleDecideTurnClick()}>対戦を開始する</button>
                                    <button className='match-cancel-button' onClick={cancelMatch}>マッチをキャンセルする</button>
                                </div>

                            </div>
                        )}
                    </div>
                </div>

            </div>
            <div className='footer'>
                <div onClick={() => setOpneQandA(true)} className="open-q-and-a">Q&amp;A</div>
                    {opneQandA && (
                        <QAndA setOpneQandA={setOpneQandA}/>
                )}
                <div>
                    <div className='version'>
                        β版
                    </div>
                    <div className='sns-account'>
                        <a href='https://twitter.com/04kankyo_Online' target="_blank" rel="noopener noreferrer" >
                        X:@04kankyo_Online
                        </a>
                    </div>

                </div>
            </div> 
        </div>
    );
}




export { Title };