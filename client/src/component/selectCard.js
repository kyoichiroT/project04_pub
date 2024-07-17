import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { allCards } from '../models/cards';

import '../css/selectCard.css';

const CardSelection = ({ onSelect, cardLists, selectNum, onHover, cardId, playerId, quickEffectAndChain, option}) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [selectedCards, setSelectedCards] = useState([]);
    const [blackLusterCondition, setBlackLusterCondition] = useState(false);
    console.log(cardLists, selectNum, cardId)
    // cardListsは複数のリストを保つ場合もある←？
    const card = allCards[cardId];
    let cardName = ''
    if (card) {
        cardName = card.name
    }
    console.log(card, cardName)
    // クイックエフェクト時に対象選択で開いていたらクイックエフェクトを閉じる
    if (quickEffectAndChain) {
        if (quickEffectAndChain.quickEffectTiming) {
            console.log(quickEffectAndChain.quickEffectTiming)
            quickEffectAndChain.setQuickEffectTiming(false)
        }
        if (quickEffectAndChain.chainConfirmFlag) {
            console.log(quickEffectAndChain.chainConfirmFlag)
            quickEffectAndChain.setChainConfirmFlag(false)
        }
        
    }

    const handleCardSelect = (cardId) => {
        // カードを選択・選択解除する処理
        let nowSelectCards = []
        if (selectedCards.includes(cardId)) {
            nowSelectCards = selectedCards.filter((c) => c !== cardId)
            setSelectedCards(nowSelectCards);
        } else {
            if (selectNum == 1) {
                nowSelectCards = [cardId];
                setSelectedCards(nowSelectCards);
            } else {
                nowSelectCards = [...selectedCards, cardId];
                setSelectedCards(nowSelectCards);
            }
        }
        // 開闢用
        if (selectNum == 'blackLuster') {
            selectNum = 2
            let graveyardLightMonster = cardLists.filter((cardId) => allCards[cardId].attribute == 'light')
            let graveyardDarkMonster = cardLists.filter((cardId) => allCards[cardId].attribute == 'dark')
            console.log(graveyardLightMonster, graveyardDarkMonster, nowSelectCards)
            const isAllIncluded = nowSelectCards.some((element) => {
                return graveyardLightMonster.includes(element);
            }) && nowSelectCards.some((element) => {
                return graveyardDarkMonster.includes(element);
            });
            console.log(isAllIncluded, nowSelectCards.length, (nowSelectCards.length == 2 && isAllIncluded))
            setBlackLusterCondition(nowSelectCards.length == 2 && isAllIncluded)
        }
    };
    const handleConfirmSelection = () => {
        // 選択されたカードを親コンポーネントに渡す
        onSelect(selectedCards);
    };
    const handleCancel = () => {
        // クイックエフェクト時に対象選択で開いていたらクイックエフェクトを開く
        if (quickEffectAndChain) {
            if (quickEffectAndChain.quickEffectTiming) {
                console.log(quickEffectAndChain.quickEffectTiming)
                quickEffectAndChain.setQuickEffectTiming(true)
            }
            if (quickEffectAndChain.chainConfirmFlag) {
                console.log(quickEffectAndChain.chainConfirmFlag)
                quickEffectAndChain.setChainConfirmFlag(true)
            }

        }
        // nullで返して返却先でキャンセルする
        onSelect(null);
    }

    return (
        
        <div className={`selecting-card ${isMinimized ? 'minimized' : ''}`}>
            <div className={`card-selection ${isMinimized ? 'minimized' : ''}`}>
                <div className='minimize-button'>
                    {/* 縮小ボタン */}
                    <button onClick={() => setIsMinimized(true)}>縮小</button>
                        {/* 早すぎた埋葬のときは縮小できると効果発動等ができちゃうので縮小禁止
                        {cardName != "早すぎた埋葬" && (
                        )} */}
                </div>

                {/* ウィンドウのヘッダ */}
                <div className="card-selection-header">
                    {cardId == 'endPhase' && (
                        <h2>
                            手札が7枚以上です。6枚になるように捨てるカードを選択してください
                        </h2>
                    )}
                    {cardName == '苦渋の選択' && card.controller == playerId && (
                        <h2>
                            相手に選ばせる5枚を選択してください
                        </h2>
                    )}
                    {cardName == '苦渋の選択' && card.controller != playerId && (
                        <h2>
                            相手の手札に加えるカードを選択してください
                        </h2>
                    )}
                    {cardName == 'カオス・ソルジャー －開闢の使者－'&& (
                        <h2>
                            除外するモンスターを光属性と闇属性をそれぞれ一体ずつ選択してください
                        </h2>
                    )}
                    {(cardName == '早すぎた埋葬' || cardName == 'リビングデッドの呼び声') && (
                        <h2>
                            墓地から特殊召喚するカードを選択してください
                        </h2>
                    )}
                    {(cardName == '増援' || cardName == '聖なる魔術師')&& (
                        <h2>
                            手札に加えるカードを選択してください
                        </h2>
                    )}
                    {cardName == '押収'&& (
                        <h2>
                            墓地に送るカードを選択してください
                        </h2>
                    )}
                    {cardName == '強引な番兵'&& (
                        <h2>
                            デッキに戻すカードを選択してください
                        </h2>
                    )}
                    {/* <h2>カード選択</h2> */}
                </div>

                {/* カード一覧 */}
                <div className="card-list flex-item">
                    <div className='oppo-Cards'>
                        {cardLists.map((cardId) => (
                            <div key={cardId} className={`card ${selectedCards.includes(cardId) ? 'selected' : ''}`} onClick={() => handleCardSelect(cardId)} onMouseEnter={() => onHover(cardId)} onMouseLeave={() => onHover(null)}>
                                {/* {card.name} */}
                                <img src={allCards[cardId].picture} alt={allCards[cardId].name} className='card-pic faceUp opp' />
                            </div>
                        ))}
                    </div>
                </div>

                <h3>選択済み</h3>
                <div className="selected-cards flex-item">
                    {selectedCards.map((cardId) => (
                        <div key={cardId} className={`card ${selectedCards.includes(cardId) ? 'selecting' : ''}`} onClick={() => handleCardSelect(cardId)} onMouseEnter={() => onHover(cardId)} onMouseLeave={() => onHover(null)}>
                            {/* {card.name} */}
                            <img src={allCards[cardId].picture} alt={allCards[cardId].name} className='card-pic faceUp' />
                        </div>
                    ))}
                </div>
                {((selectedCards.length == selectNum || (selectNum == 'kycoo' && selectedCards.length <= 2)) || (selectNum == 'blackLuster' && blackLusterCondition)) && (
                    <button onClick={handleConfirmSelection} className='confirm-button decide-button'>確認</button>
                )}
                {(cardName && option != 'enforce' && (selectedCards.length == 0 && (cardName == 'カオス・ソルジャー －開闢の使者－' || cardName == '早すぎた埋葬' || cardName == 'リビングデッドの呼び声' || cardName == '聖なる魔術師' ) )) && (
                    <button onClick={handleCancel} className='confirm-button decide-button'>キャンセル</button>
                )}

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
// 複数選択する場合もあるため必ず配列でカードが返される
const selectCards = async (cardLists, selectNum, setHoverCardId, cardId, playerId, quickEffectAndChain, option) => {
    console.log('selecting...')
    return new Promise((resolve) => {
        const handleCardSelection = (selectedCard) => {
            root.unmount(); // コンポーネントのアンマウント
            console.log('unmounted', selectedCard)
            resolve(selectedCard);
        };

        const cardSelectionElement = document.getElementById('select-cards');
        // document.body.appendChild(cardSelectionElement);

        const root = createRoot(cardSelectionElement);
        root.render(<CardSelection cardLists={cardLists.filter(id => id != null)} onSelect={handleCardSelection} selectNum={selectNum} onHover={setHoverCardId} cardId={cardId} playerId={playerId} quickEffectAndChain={quickEffectAndChain} option={option}/>);
    });
};



export { CardSelection, selectCards };


