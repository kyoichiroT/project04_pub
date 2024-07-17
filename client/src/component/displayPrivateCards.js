import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { allCards } from '../models/cards';

import '../css/displayCards.css';
import DisplayCard from './displayCard';

const DisplayPrivateCards = (props) => {
    const deck = props.deck
    const privateCards = props.privateCards
    const setHoverCardId = props.setHoverCardId
    const isMobile = props.isMobile;
    // const [hoverCardId, setHoverCardId] = useState(null);
    const [description, setDescription] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const [mobilesHoverCardId, setMobilesHoverCardId] = useState(null);

    console.log(props)
    useEffect(() => {
        if (mobilesHoverCardId !== null) {
            setDescription(allCards[mobilesHoverCardId].description.replace(/\n/g, '<br>'))
        } else {
            setDescription("")
        }
    }, [mobilesHoverCardId]);

    const handleBack = () => {
        // 選択されたカードを親コンポーネントに渡す
        props.back();
    };


    return (
        <div className={`display-card-wrapper ${isMinimized ? 'minimized' : ''}`}>
            <div className={`card-selection ${isMinimized ? 'minimized' : ''}`}>

                <div className='display-private-cards-header'>
                    <button onClick={handleBack} className='back-button'>閉じる</button>
                    <div className='minimize-button'>
                        {/* 縮小ボタン */}
                        <button onClick={() => setIsMinimized(true)}>縮小</button>
                    </div>
                </div>
                <div className='display-private-cards sentence'>
                    <h2>抹殺の使徒によりお互いのデッキ(それに伴って非公開領域)を確認します</h2>
                </div>
                <div>
                    <h3 className='display-private-cards sentence'>相手のデッキ</h3>
                </div>
                {!isMobile && (
                    <div className='card-list-wrapper'>
                        <div className='card-list'>
                            {deck.map((cardId) => (
                                <DisplayCard key={cardId} cardId={cardId} onHover={setHoverCardId} />
                            ))}
                        </div>
                    </div>
                )}
                {isMobile && (
                    <div className='card-list-wrapper'>
                        <div className='card-list'>
                            {deck.map((cardId) => (
                                <DisplayCard key={cardId} cardId={cardId} onHover={setMobilesHoverCardId} />
                            ))}
                        </div>
                    </div>
                )}
                <div className='display-private-cards sentence'>
                    <h3>相手の非公開領域のカード</h3>
                </div>
                {!isMobile && (
                    <div className='card-list-wrapper'>
                        <div className='card-list'>
                            {privateCards.map((cardId) => (
                                <DisplayCard key={cardId} cardId={cardId} onHover={setHoverCardId} />
                            ))}
                        </div>
                    </div>
                )}
                {isMobile && (
                    <div className='card-list-wrapper'>
                        <div className='card-list'>
                            {privateCards.map((cardId) => (
                                <DisplayCard key={cardId} cardId={cardId} onHover={setMobilesHoverCardId} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className='mobile-only card-desc'>
                <div className='card-picture big'>
                    {mobilesHoverCardId !== null && <DisplayCard key={mobilesHoverCardId} cardId={mobilesHoverCardId} onHover={setMobilesHoverCardId} />}
                </div>
                <div className='card-description'>
                    <div dangerouslySetInnerHTML={{ __html: description }} />
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
    )
}

const handleDisplayPrivateCards = (playerId, opponentPlayerId, fields, setOppoChoicing, setHoverCardId, isMobile) => {
    console.log('private Cards viewing...', fields)
    const cardTypeOrder = { 'Monster': 1, 'Spell': 2, 'Trap': 3 };
    let sortedDeck = [...fields.deck[opponentPlayerId]];
    sortedDeck.sort((a, b) => {
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
    // for (let i = shuffeledDeck.length - 1; i > 0; i--) {
    //     const j = Math.floor(Math.random() * (i + 1));
    //     [shuffeledDeck[i], shuffeledDeck[j]] = [shuffeledDeck[j], shuffeledDeck[i]];
    // }
    // 相手フィールド上の裏向きの魔法罠と裏側守備表示モンスターと手札
    let privateCards = fields.spellTrapZone[opponentPlayerId].filter((cardId) => cardId != null && allCards[cardId].faceStatus == "down")
        .concat(fields.monsterZone[opponentPlayerId].filter((cardId) => cardId != null && allCards[cardId].faceStatus == "downDef"))
        .concat([...fields.hand[opponentPlayerId]]);
    console.log(privateCards)
    // // シャッフルする
    // for (let i = privateCards.length - 1; i > 0; i--) {
    //     const j = Math.floor(Math.random() * (i + 1));
    //     [privateCards[i], privateCards[j]] = [privateCards[j], privateCards[i]];
    // }
    console.log(privateCards)
    privateCards.sort((a, b) => {
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

    console.log(privateCards)

    for (let id of privateCards) {
        console.log(allCards[id].cardtype, allCards[id].name);
    }
    console.log(privateCards)

    return new Promise((resolve) => {
        setOppoChoicing(false)
        const handleDisplayCard = () => {
            root.unmount(); // コンポーネントのアンマウント
            console.log('unmounted')
            setOppoChoicing(true);
            resolve();
        };

        const displayCardListElement = document.getElementById('display-private-cards');
        // document.body.appendChild(displayCardListElement);

        const root = createRoot(displayCardListElement);
        root.render(<DisplayPrivateCards deck={sortedDeck} privateCards={privateCards} back={handleDisplayCard} setHoverCardId={setHoverCardId} isMobile={isMobile}/>);
    });
}

export { DisplayPrivateCards, handleDisplayPrivateCards };