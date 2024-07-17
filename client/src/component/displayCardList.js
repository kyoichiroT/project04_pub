import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { allCards } from '../models/cards';

import '../css/displayCards.css';
import DisplayCard from './displayCard';

const DisplayCardList = (props) => {
    console.log(props)
    let cardLists = props.cardLists;
    const playerId = props.playerId;
    const owner = props.owner;
    const zone = props.zone;
    const isMobile = props.isMobile;
    const fields = props.fields;
    const monsterZone = fields.monsterZone
    const deck = fields.deck
    const mobileDisplayCardsPropsFields = props.mobileDisplayCardsPropsFields
    const opponentPlayerId = mobileDisplayCardsPropsFields.opponentPlayerId
    const players = mobileDisplayCardsPropsFields.players

    const [hoverCardId, setHoverCardId] = useState(null);
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (hoverCardId !== null) {
            let cardDesc = allCards[hoverCardId].description.replace(/\n/g, '<br>')
            // 増援のサーチ可能カードの表示
            if (allCards[hoverCardId].name == '増援' && allCards[hoverCardId].controller == playerId) {
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
            if (allCards[hoverCardId].name == 'スケープゴート' && allCards[hoverCardId].controller == playerId) {
                if (players[playerId].useReverseAndSpecialSummon) {
                    cardDesc += '<br><br><span className=`additional-text`>このターン既に召喚・反転召喚・特殊召喚、又は特殊召喚するカードを発動しているため使用できません<br>'
                }
                if (monsterZone[playerId].filter((id) => id != null).length >= 2) {
                    cardDesc += '<br><br><span className=`additional-text`>場にモンスターが2体以上いるため発動できません<br>'
                }
                cardDesc += '</span>'
            }
            // スケゴによる召喚/反転召喚/特殊召喚の不可警告
            if (players[playerId].useGoats && allCards[hoverCardId].controller == playerId) {
                if (allCards[hoverCardId].cardtype == "Monster") {
                    cardDesc += '<br><br><span className=`additional-text`>このターン既にスケープゴートを使用しているため召喚・反転召喚・特殊召喚することはできません<br>'
                } else if (allCards[hoverCardId].name == "スケープゴート" || allCards[hoverCardId].name == "早すぎた埋葬" || allCards[hoverCardId].name == "リビングデッドの呼び声") {
                    cardDesc += '<br><br><span className=`additional-text`>このターン既にスケープゴートを使用しているため特殊召喚するカードを発動することはできません<br>'
                }
                cardDesc += '</span>'
            }
            // カイクウによる開闢召喚不可の警告
            if (allCards[hoverCardId].name == "カオス・ソルジャー －開闢の使者－" && allCards[hoverCardId].controller == playerId) {
                if (monsterZone[opponentPlayerId].some((id) => id != null && allCards[id].name == "霊滅術師カイクウ" && allCards[id].faceStatus != "downDef") && (allCards[hoverCardId].location == "deck" || allCards[hoverCardId].location == "hand")) {
                    cardDesc += '<br><br><span className=`additional-text`>相手の場に霊滅術師カイクウが存在するため正規の方法で特殊召喚することはできません<br>'
                }
                if (allCards[hoverCardId].uuid == "" && allCards[hoverCardId].location != "banishZone") {
                    cardDesc += '<br><br><span className=`additional-text`>一度正規の方法で特殊召喚していないため墓地から特殊召喚することはできません<br>'
                }
                cardDesc += '</span>'
            }
            // ショッカーによる罠封じ
            if (allCards[hoverCardId].cardtype == "Trap" && monsterZone[playerId].concat(monsterZone[opponentPlayerId]).some((id) => id != null && allCards[id].name == "人造人間－サイコ・ショッカー" && allCards[id].faceStatus != "downDef") && allCards[hoverCardId].controller == playerId) {
                cardDesc += '<br><br><span className=`additional-text`>場に人造人間－サイコ・ショッカーが存在するため罠カードは発動できず、効果は無効にされています<br></span>'
            }
            setDescription(cardDesc)
        } else {
            setDescription("")
        }
    }, [hoverCardId, players, deck, monsterZone]);

    console.log(cardLists)
    const handleBack = () => {
        // 選択されたカードを親コンポーネントに渡す
        props.back();
    };
    const handleBackBody = () => {
        if (!isMobile) {
            props.back();
        }
        console.log(isMobile)
    };

    let message = ""

    if (playerId == owner) {
        message += "あなたの";
    } else {
        message += "相手の";
    }
    if (zone == "graveyard") {
        message += "墓地";
    } else if (zone == "banishZone") {
        message += "除外ゾーン";
    } else if (zone == "deck") {
        message += "デッキ";
        const cardTypeOrder = { 'Monster': 1, 'Spell': 2, 'Trap': 3 };

        cardLists = [...cardLists].sort((a, b) => {
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
    }
    // return (
    //     <div className='display-card-wrapper' onClick={handleBackBody}>
    //         <div>
    //             <button onClick={handleBack} className='back-button'>やめる</button>
    //         </div>
    //         <div>
    //             <h3>{message}</h3>
    //         </div>
    //         <div className='card-list-wrapper'>
    //             <div className='card-list'>
    //                 {cardLists.map((cardId) => (
    //                     <DisplayCard key={cardId} cardId={cardId} onHover={props.setHoverCardId} />
    //                 ))}
    //             </div>
    //         </div>
    //     </div>
    // )

    // 通常状態
    if (zone != "deck") {
        return (
            <div className='display-card-wrapper' onClick={handleBackBody}>
                <div>
                    <button onClick={handleBack} className='back-button'>やめる</button>
                </div>
                <div>
                    <h3>{message}</h3>
                </div>
                <div className='card-list-wrapper'>
                    <div className='card-list'>
                        {cardLists.map((cardId) => (
                            !isMobile ? <DisplayCard key={cardId} cardId={cardId} onHover={props.setHoverCardId} /> : <DisplayCard key={cardId} cardId={cardId} onHover={setHoverCardId} />
                        ))}
                    </div>
                </div>
                <div className='mobile-only card-desc'>
                    <div className='card-picture big'>
                        {hoverCardId !== null && <DisplayCard key={hoverCardId} cardId={hoverCardId} onHover={setHoverCardId} />}
                    </div>
                    <div className='card-description'>
                        <div dangerouslySetInnerHTML={{ __html: description }} />
                    </div>
                </div>
            </div>
        )
    } else {
        // 先行なら1~後攻なら51~
        let firstPlayer = fields.players[playerId].matchData.firstPlayer
        let firstPlayerAllcardLists = Array.from({ length: 40 }, (_, index) => index + 1);
        let secondPlayerAllcardLists = Array.from({ length: 40 }, (_, index) => index + 51);
        const cardTypeOrder = { 'Monster': 1, 'Spell': 2, 'Trap': 3 };

        firstPlayerAllcardLists = firstPlayerAllcardLists.sort((a, b) => {
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
        secondPlayerAllcardLists = secondPlayerAllcardLists.sort((a, b) => {
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
        //デッキ表示の場合は表示内容を変える
        // 自分のデッキの場合はデッキの内容のみ表示
        let shadowCardIds = []
        if (playerId == owner) {
            message = "あなたの山札(既に引いたカードは暗く表示されています)";
            // 手札、モンスターゾーン、魔法罠、墓地、除外
            shadowCardIds = [...fields.hand[owner], ...fields.monsterZone[owner].filter((id) => id != null), ...fields.spellTrapZone[owner].filter((id) => id != null), ...fields.graveyard[owner], ...fields.banishZone[owner]];
        } else {
            // 自身のモンスターゾーンにある相手カードも表示
            message = "相手の山札(場に表側で出ているカードは暗く表示されています)";
            shadowCardIds = [...fields.monsterZone[owner].filter((id) => id != null && allCards[id].faceStatus != "downDef"),
                ...fields.monsterZone[playerId].filter((id) => id != null && allCards[id].owner == owner),
                ...fields.spellTrapZone[owner].filter((id) => id != null && allCards[id].faceStatus != "down"),
                ...fields.graveyard[owner],
                ...fields.banishZone[owner]];
        }
        console.log(firstPlayerAllcardLists,secondPlayerAllcardLists)

        return (
            <div className='display-card-wrapper' onClick={handleBackBody}>
                <div>
                    <button onClick={handleBack} className='back-button'>やめる</button>
                </div>
                <div>
                    <h3>{message}</h3>
                </div>
                <div className='card-list-wrapper'>
                    <div className='card-list'>
                        {owner == firstPlayer ?
                            firstPlayerAllcardLists.map((cardId, index) => (
                                <div key={index} className={`${shadowCardIds.includes(cardId) ? 'selected' : ''}`}>
                                    {/* <DisplayCard key={cardId} cardId={cardId} onHover={props.setHoverCardId} /> */}
                                    {!isMobile ? <DisplayCard key={cardId} cardId={cardId} onHover={props.setHoverCardId} /> : <DisplayCard key={cardId} cardId={cardId} onHover={setHoverCardId} />}
                                </div>
                            ))
                            : secondPlayerAllcardLists.map((cardId, index) => (
                                <div key={index}  className={`${shadowCardIds.includes(cardId) ? 'selected' : ''}`}>
                                    {/* <DisplayCard key={cardId} cardId={cardId} onHover={props.setHoverCardId} /> */}
                                    {!isMobile ? <DisplayCard key={cardId} cardId={cardId} onHover={props.setHoverCardId} /> : <DisplayCard key={cardId} cardId={cardId} onHover={setHoverCardId} />}
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className='mobile-only card-desc'>
                    <div className='card-picture big'>
                        {hoverCardId !== null && <DisplayCard key={hoverCardId} cardId={hoverCardId} onHover={setHoverCardId} />}
                    </div>
                    <div className='card-description'>
                        <div dangerouslySetInnerHTML={{ __html: description }} />
                    </div>
                </div>
            </div>
        )
    }
    
}

const handleDisplayCardList = (cardLists, playerId, owner, zone, setHoverCardId, isMobile, fields, mobileDisplayCardsPropsFields) => {
    console.log('selecting...')
    console.log(cardLists, playerId, owner, zone, setHoverCardId, isMobile, fields)
    return new Promise((resolve) => {
        const handleDisplayCard = () => {
            root.unmount(); // コンポーネントのアンマウント
            console.log('unmounted')
            resolve();
        };
        const displayCardListElement = document.getElementById('display-zone-card');
        // const displayCardListElement = document.createElement('div');
        // document.body.appendChild(displayCardListElement);

        const root = createRoot(displayCardListElement);
        root.render(<DisplayCardList cardLists={cardLists} playerId={playerId} owner={owner} zone={zone} back={handleDisplayCard} setHoverCardId={setHoverCardId} isMobile={isMobile} fields={fields} mobileDisplayCardsPropsFields={mobileDisplayCardsPropsFields} />);
    });
}

export { DisplayCardList, handleDisplayCardList };