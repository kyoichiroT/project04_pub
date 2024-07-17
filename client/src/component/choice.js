import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { allCards } from '../models/cards';


const SelectChoice = ({ cardId, fields, onSelect, targetingCardId, effectTargetCardId }) => {
    const monsterZone = fields.monsterZone;
    
    console.log(cardId, allCards[cardId],allCards)
    const [isMinimized, setIsMinimized] = useState(false);
    // choiceで選ばれる選択肢は同族感染ウィルスや効果発動の可否などで様々
    const [selectedChoice, setSelectedChoice] = useState('');
    const handleChoiceSelect = (choice) => {
        setSelectedChoice([choice]);
    };
    const handleConfirmSelection = (selected) => {
        // 選択された選択肢を親コンポーネントに渡す
        console.log(selected)
        onSelect(selected);
    };

    if (allCards[cardId].name == '同族感染ウイルス') {
        // 同族感染ウイルスの場合は種族選択
        const allMonsters = Object.values(monsterZone).flat().filter(cardId => cardId != null && allCards[cardId].faceStatus != "downDef");
        // 相手フィールドのモンスターが左に来るようにソート
        allMonsters.sort((a, b) => {
            if (a.controller === allCards[cardId].controller) return 1;   // 'A'を後ろに移動
            if (b.controller === allCards[cardId].controller) return -1;  // 'A'を後ろに移動
            return 0;
        });
        console.log(allMonsters)

        // let typeList = allMonsters.map()
        // const uniqueTypes = Array.from(new Set(allMonsters.map(id => allCards[id].type)));
        let typeArray = Array.from(new Set(allMonsters.map(id => allCards[id].type)));

        let typeList = {
            water: '水族',
            soldier: '戦士族',
            beastWarrior: '獣戦士族',
            wizard: '魔法使い族',
            fairy: '天使族',
            plant: '植物族',
            repyile: '爬虫類族',
            zombie: 'アンデッド族',
            machine: '機械族',
            beast: '獣族',
        }

        const filteredTypeList = typeArray.reduce((acc, type) => {
            if (typeList[type]) {
                acc[type] = typeList[type];
            }
            return acc;
        }, {});
        console.log(filteredTypeList)
    
        return (
            <div className={`card-choice-wrapper virus ${isMinimized ? 'minimized' : ''}`}>
                <div className={`card-selection ${isMinimized ? 'minimized' : ''}`}>
                    <div className='minimize-button'>
                        {/* 縮小ボタン */}
                        <button onClick={() => setIsMinimized(true)}>縮小</button>
                    </div>
                    {/* ウィンドウのヘッダ */}
                    <div className="card-selection-header">
                        <h2>種族を選択してください</h2>
                    </div>

                    <ul className='virus-type-list'>
                        {Object.entries(filteredTypeList).map(([key, value]) => (
                            <li key={key}>
                                <button onClick={() => setSelectedChoice(key)}>{value}</button>
                            </li>
                        ))}
                    </ul>

                    <h3>破壊されるカード</h3>
                    <div className="selected-cards flex-item">

                        {allMonsters.map(cardId => {
                            if (allCards[cardId].faceStatus != 'downDef' && (allCards[cardId].type === selectedChoice)) {
                                return <img src={allCards[cardId].picture} alt={allCards[cardId].name} className='card-pic' />
                            }
                        })}
                    </div>
                    <div className='confirm-buttons'>
                        {selectedChoice != '' && (
                            <button onClick={() => handleConfirmSelection(selectedChoice)} className='confirm-button'>確認</button>
                        )}
                        <button onClick={() => handleConfirmSelection(false)} className='cancel-button confirm-button'>やめる</button>
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
    // ザルーグの効果を使っている時は効果の選択 
    } else if (allCards[cardId].name == '首領・ザルーグ' && allCards[cardId].effect.canUse == false) {
        const keys = Object.keys(fields.hand);
        const opponentPlayerId = keys.find(key => key != allCards[cardId].controller);
        const handExist = fields.hand[opponentPlayerId].length != 0;
        const deckExist = fields.deck[opponentPlayerId].length > 1;
        // もし万が一両方選べないのにここに来てしまったら
        if (!handExist && !deckExist) {
            handleConfirmSelection(true)
        }
        return (
            <div className={`card-choice-wrapper ${isMinimized ? 'minimized' : ''}`}>
                <div className={`card-selection ${isMinimized ? 'minimized' : ''}`}>
                    <div className='minimize-button'>
                        {/* 縮小ボタン */}
                        <button onClick={() => setIsMinimized(true)}>縮小</button>
                    </div>
                    {/* ウィンドウのヘッダ */}
                    <div className="card-selection-header">
                        <h2>使用する効果を選択してください</h2>
                    </div>

                    {/* カード一覧 */}
                    <div className='buttons'>
                        {handExist && <button onClick={() => handleConfirmSelection(true)} className='confirm-button donZaloog-choice'>相手の手札をランダムで1枚捨てる</button>}
                        {deckExist && <button onClick={() => handleConfirmSelection(false)} className='cancel-button donZaloog-choice'>相手のデッキの上から2枚を墓地へ送る</button>}
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
    // 開闢の特殊召喚時の表示形式選択専用
    } else if (targetingCardId == "bluckLusterSS") {
        let message = '召喚する表示形式を選択してください'


        return (
            <div className={`card-choice-wrapper ${isMinimized ? 'minimized' : ''}`} id="choice-component">
                <div className={`card-selection ${isMinimized ? 'minimized' : ''}`}>
                    <div className='minimize-button'>
                        {/* 縮小ボタン */}
                        <button onClick={() => setIsMinimized(true)}>縮小</button>
                    </div>
                    {/* ウィンドウのヘッダ */}
                    <div className="card-selection-header">
                        <h2>{message}</h2>
                    </div>

                    {/* カード一覧 */}
                    <div className='buttons'>
                        <button onClick={() => handleConfirmSelection('attack')} className='confirm-button'>攻撃表示</button>
                        <button onClick={() => handleConfirmSelection('def')} className='cancel-button'>守備表示</button>
                    </div>
                    <button onClick={() => handleConfirmSelection(false)} className='cancel-button confirm-button balckLusterSS'>やめる</button>

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
    } else {
        let message = ''
        if (allCards[cardId].name == '砂塵の大竜巻') {
            message = '手札から魔法・罠カードをセットしますか？'
        } else {
            console.log(targetingCardId, effectTargetCardId)
            console.log(allCards[targetingCardId], allCards[effectTargetCardId])
            if (targetingCardId && effectTargetCardId && allCards[targetingCardId].name == '聖なる魔術師') {
                console.log('セイマジ使ってる')
                message = allCards[targetingCardId].name + 'が' + allCards[effectTargetCardId].name + 'を対象に効果を発動しました' + allCards[cardId].name + 'の効果を発動しますか？'
            } else {
                message = allCards[cardId].name + 'の効果を発動しますか？'
            }
        }


        return (
            <div className={`card-choice-wrapper ${isMinimized ? 'minimized' : ''}`} id="choice-component">
                <div className={`card-selection ${isMinimized ? 'minimized' : ''}`}>
                    <div className='minimize-button'>
                        {/* 縮小ボタン */}
                        <button onClick={() => setIsMinimized(true)}>縮小</button>
                    </div>
                    {/* ウィンドウのヘッダ */}
                    <div className="card-selection-header">
                        <h2>{message}</h2>
                    </div>

                    {/* カード一覧 */}
                    <div className='buttons'>
                        <button onClick={() => handleConfirmSelection(true)} className='confirm-button'>はい</button>
                        <button onClick={() => handleConfirmSelection(false)} className='cancel-button'>いいえ</button>
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
    }

};
// 複数選択する場合もあるため必ず配列でカードが返される
const choice = async (cardId, fields, targetingCardId, effectTargetCardId) => {
    console.log('choicing...')
    return new Promise((resolve) => {
        const handleChoice = (selectedChoice) => {
            root.unmount(); // コンポーネントのアンマウント
            console.log('unmounted')
            resolve(selectedChoice);
        };

        // const choiceElement = document.createElement('div');
        const choiceElement = document.getElementById('choice');
        // document.body.appendChild(choiceElement);

        const root = createRoot(choiceElement);
        root.render(<SelectChoice cardId={cardId} fields={fields} onSelect={handleChoice} targetingCardId={targetingCardId} effectTargetCardId={effectTargetCardId}/>);
    });
};



export { choice, SelectChoice };


