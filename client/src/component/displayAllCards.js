import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { allCards } from '../models/cards';

import '../css/displayCards.css';
import DisplayCard from './displayCard';

const DisplayAllCards = (props) => {
    // 0~39までの配列を作る
    // const cardLists = [12, 13, 24, 29, 28, 1, 32, 31, 14, 0, 26, 30, 33, 36, 25, 27, 38, 39, 34, 10, 2, 5, 7, 18, 8, 9, 35, 3, 11, 17, 23, 4, 6, 22, 16, 15, 20, 21, 19, 37];
    let cardLists = Array.from({ length: 40 }, (_, index) => index + 1);
    const mobileDisplayCardsPropsFields = props.mobileDisplayCardsPropsFields;

    const playerId = mobileDisplayCardsPropsFields.playerId
    const opponentPlayerId = mobileDisplayCardsPropsFields.opponentPlayerId
    const players = mobileDisplayCardsPropsFields.players
    const deck = mobileDisplayCardsPropsFields.deck
    const monsterZone = mobileDisplayCardsPropsFields.monsterZone



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

    console.log(sortedIds);
    const [mobilesHoverCardId, setMobilesHoverCardId] = useState(null);
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (mobilesHoverCardId !== null) {
            let cardDesc = allCards[mobilesHoverCardId].description.replace(/\n/g, '<br>')
            // 増援のサーチ可能カードの表示
            if (allCards[mobilesHoverCardId].name == '増援') {
                const soldiers = deck[playerId].filter((cardId) => allCards[cardId].type == 'soldier' && allCards[cardId].level <= 4).sort((a, b) => a - b);

                cardDesc += '<br><br><span className=`additional-text`>現在デッキ内からサーチ出来るカード：<br>'
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
            // スケゴの使用不可警告
            if (allCards[mobilesHoverCardId].name == 'スケープゴート') {
                if (players[playerId].useReverseAndSpecialSummon) {
                    cardDesc += '<br><br><span className=`additional-text`>このターン既に召喚・反転召喚・特殊召喚、又は特殊召喚するカードを発動しているため使用できません<br>'
                }
                if (monsterZone[playerId].filter((id) => id != null).length >= 2) {
                    cardDesc += '<br><br><span className=`additional-text`>場にモンスターが2体以上いるため発動できません<br>'
                }
                cardDesc += '</span>'
            }
            // スケゴによる召喚/反転召喚/特殊召喚の不可警告
            if (players[playerId].useGoats) {
                if (allCards[mobilesHoverCardId].cardtype == "Monster") {
                    cardDesc += '<br><br><span className=`additional-text`>このターン既にスケープゴートを使用しているため召喚・反転召喚・特殊召喚することはできません<br>'
                } else if (allCards[mobilesHoverCardId].name == "スケープゴート" || allCards[mobilesHoverCardId].name == "早すぎた埋葬" || allCards[mobilesHoverCardId].name == "リビングデッドの呼び声") {
                    cardDesc += '<br><br><span className=`additional-text`>このターン既にスケープゴートを使用しているため特殊召喚するカードを発動することはできません<br>'
                }
                cardDesc += '</span>'
            }
            // カイクウによる開闢召喚不可の警告
            if (allCards[mobilesHoverCardId].name == "カオス・ソルジャー －開闢の使者－") {
                if (monsterZone[opponentPlayerId].some((id) => id != null && allCards[id].name == "霊滅術師カイクウ" && allCards[id].faceStatus != "downDef") && (allCards[hoverCardId].location == "deck" || allCards[hoverCardId].location == "hand")) {
                    cardDesc += '<br><br><span className=`additional-text`>相手の場に霊滅術師カイクウが存在するため正規の方法で特殊召喚することはできません<br>'
                }
                if (allCards[mobilesHoverCardId].uuid == "" && allCards[hoverCardId].location != "banishZone") {
                    cardDesc += '<br><br><span className=`additional-text`>一度正規の方法で特殊召喚していないため墓地から特殊召喚することはできません<br>'
                }
                cardDesc += '</span>'
            }
            // ショッカーによる罠封じ
            if (allCards[mobilesHoverCardId].cardtype == "Trap" && monsterZone[playerId].concat(monsterZone[opponentPlayerId]).some((id) => id != null && allCards[id].name == "人造人間－サイコ・ショッカー" && allCards[id].faceStatus != "downDef")) {
                cardDesc += '<br><br><span className=`additional-text`>場に人造人間－サイコ・ショッカーが存在するため罠カードは発動できず、効果は無効にされています<br></span>'
            }
            setDescription(cardDesc)
        } else {
            setDescription("")
        }
    }, [mobilesHoverCardId, players, deck, monsterZone]);

    const handleBack = () => {
        props.back();
    };
    const handleBackBody = () => {
        console.log(props.isMobile, 'back')
        if (!props.isMobile) {
            props.back();
        }
    };

    return (
        <div className='display-card-wrapper' onClick={handleBackBody}>
            <div>
                <button onClick={handleBack} className='back-button'>やめる</button>
            </div>
            <div className='card-list-wrapper'>
                {!props.isMobile && (
                    <div className='card-list'>
                        {sortedIds.map((cardId) => (
                            <DisplayCard key={cardId} cardId={cardId} onHover={props.setHoverCardId} />
                            ))}
                    </div>
                )}
                {props.isMobile && (
                    <div className='card-list'>
                        {sortedIds.map((cardId) => (
                            <DisplayCard key={cardId} cardId={cardId} onHover={setMobilesHoverCardId} />
                            ))}
                    </div>
                )}
                {/* {!props.isMobile && (
                    <div className='card-list'>
                        {sortedIds.map((cardId) => (
                            <DisplayCard key={cardId} cardId={cardId} onHover={props.setHoverCardId} />
                            ))}
                    </div>
                )}
                */}            
                {/* <div className='card-list'>
                    {sortedIds.map((cardId) => (
                        <DisplayCard key={cardId} cardId={cardId} onHover={setMobilesHoverCardId} />
                        ))}
                </div> */}
                
            </div>
            {/* <div className='card-desc'> */}
            <div className='mobile-only card-desc'>
                <div className='card-picture big'>
                    {mobilesHoverCardId !== null && <DisplayCard key={mobilesHoverCardId} cardId={mobilesHoverCardId} onHover={setMobilesHoverCardId} />}
                </div>
                <div className='card-description'>
                    <div dangerouslySetInnerHTML={{ __html: description }} />
                </div>
            </div>

        </div>
    )
}

const handleDisplayAllCards = (setHoverCardId, isMobile, mobileDisplayCardsPropsFields) => {
    console.log('viewing...')
    return new Promise((resolve) => {
        const handleDisplayCard = () => {
            root.unmount(); // コンポーネントのアンマウント
            console.log('unmounted')
            resolve();
        };

        const displayCardListElement = document.getElementById('display-all-card');
        // document.body.appendChild(displayCardListElement);

        const root = createRoot(displayCardListElement);
        root.render(<DisplayAllCards back={handleDisplayCard} setHoverCardId={setHoverCardId} isMobile={isMobile} mobileDisplayCardsPropsFields={mobileDisplayCardsPropsFields}/>);
    });
}

export { DisplayAllCards, handleDisplayAllCards };