import React, { useState } from 'react';
import { allCards } from '../models/cards';

let targetCardId = '';

const SelectTarget = ({ socket, cardId, selectTargetProps, effecting, conditions, attackOption}) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const card = allCards[targetCardId];
    let popUpOption = ''
    console.log(card)
    console.log('chain confirm chain block cards is', targetCardId, conditions, attackOption)
    console.log(attackOption)
    let attackMessage = ''
    if (attackOption != undefined) {
        attackMessage = card.name + 'で攻撃する攻撃対象を選択してください'
        if (attackOption == 'reSelect') {
            attackMessage = '相手フィールドが変化しました。\n攻撃対象を再選択するか攻撃の中止をしてください'
        } else if (attackOption == 'reAttack') {
            attackMessage = 'カオス・ソルジャー －開闢の使者－ の効果が発動しました。攻撃対象を選択してください'

        }
    }
    // アタック時はポップアップを下げる
    if (attackOption == "attack" || attackOption == "reSelect" || attackOption == "reAttack") {
        popUpOption = 'attack-message-pop-up'
    }
    if ((card.name == '砂塵の大竜巻' && card.effect.costValue != 1) || card.name == 'サイクロン' || card.name == '魔導戦士ブレイカー') {
        popUpOption = 'destroy-spell-trap-message-pop-up'
    }
    // やっぱやめる用。
    const handleCancel = () => {
        socket.emit('selectCard', { cardId: null });
        selectTargetProps.setSelectTargetFlag(false);
    };

    return (
        <div className={`card-selection-wrapper ${isMinimized ? 'minimized' : ''} ${popUpOption == 'attack-message-pop-up' ? 'attack-message-pop-up' : popUpOption == 'destroy-spell-trap-message-pop-up' ? 'destroy-spell-trap-message-pop-up' :''} `}>
            <div className={`card-selection ${isMinimized ? 'minimized' : ''}`}>
                <div className='minimize-button'>
                    {/* 縮小ボタン */}
                    <button onClick={() => setIsMinimized(true)}>縮小</button>
                </div>
                {!effecting && card.effect.cost == 'discard' && !conditions.includes('attack') && attackOption != 'reSelect' && (
                    <div className='message'>
                        {card.name}の効果を発動するための<br />
                        捨てるカードを選択してください
                    </div>
                )}
                {effecting && ((card.name != '砂塵の大竜巻' || card.effect.costValue == 0) && card.name != '強奪') && (
                    <div className='message'>
                        {card.name}の効果が発動しました。対象を選択してください
                    </div>
                )}
                {effecting && (card.name == '砂塵の大竜巻' && card.effect.costValue == 1) && (
                    <div className='message'>
                        {card.name}の追加効果が発動しました。セットするカードを選択してください
                    </div>
                )}
                {/* { card.name == '強奪' && (
                    <div className='message'>
                        {card.name}の装備対象を選択してください
                    </div>
                )} */}
                {!effecting && (attackOption == "attack" || attackOption == "reSelect" || attackOption == "reAttack") && (
                    <div className='message'>
                        {attackMessage}
                    </div>
                )}
                {!effecting && card.cardtype == 'Monster' && (conditions.includes('main1') || conditions.includes('main2')) &&
                    card.level > 4 && card.level != 8 &&(
                    <div className='message'>
                        {card.name}を召喚するための生贄を選択してください
                    </div>
                    )}
                {!(attackOption == "attack" || attackOption == "reSelect" || attackOption == "reAttack") && 
                    (card.name == "強奪" || card.name == "ならず者傭兵部隊" || card.name == "カオス・ソルジャー －開闢の使者－" || card.name == "破壊輪" || card.name == "抹殺の使徒" || card.name == "心変わり" || card.name == "サイクロン" || card.name == "魔導戦士ブレイカー" || card.name == "砂塵の大竜巻") &&
                    (
                    <div className='message'>
                        {card.name}の対象を選択してください
                    </div>
                    )}
                <div className='buttons'>
                    <div className='confirm-button'>
                        <button onClick={() => setIsMinimized(true)} className='confirm-button'>選択する</button>
                    </div>
                    {/* 効果対象の選択以外はキャンセルできるようにする */}
                    {(!effecting || card.name == "強奪") && (((card.cardtype == 'Monster' && card.level > 4 && card.level != 8) || conditions.includes('attack') || (attackOption != undefined)
                        || (card.name == "強奪" || card.name == "ならず者傭兵部隊" || card.name == "カオス・ソルジャー －開闢の使者－" || card.name == "破壊輪" || card.name == "抹殺の使徒" || card.name == "心変わり" || card.name == "サイクロン" || card.name == "魔導戦士ブレイカー" || card.name == "砂塵の大竜巻")))
                        &&(
                        <div className='select-target cancel-button'>
                            <button onClick={handleCancel}>やめる</button>
                        </div>
                    )}
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

const handleSelectTarget = async (cardId, selectTargetProps ) => {

    targetCardId = cardId;
    selectTargetProps.setEffectingCard(cardId);
    selectTargetProps.setSelectTargetFlag(true);

}

export { SelectTarget, handleSelectTarget }