import React, { useState, useEffect, useRef } from 'react';
import { allCards } from '../models/cards';

import '../css/card.css'
import { createRoot } from 'react-dom/client';
import { handleDisplayCardList } from './displayCardList';

const CardInfomationDetail = ({ cardId, infomationDetailProps, mobileDisplayCardsPropsFields}) => {
    const card = allCards[cardId];
    console.log(card, infomationDetailProps)

    const playerId = infomationDetailProps.playerId;
    const phase = infomationDetailProps.phase;
    const selectTargetFlag = infomationDetailProps.selectTargetFlag;
    const player = infomationDetailProps.player;
    const spellSpeed = infomationDetailProps.spellSpeed;
    const effecting = infomationDetailProps.effecting;
    const quickEffectTiming = infomationDetailProps.quickEffectTiming;
    const chainConfirmFlag = infomationDetailProps.chainConfirmFlag;
    const animating = infomationDetailProps.animating;
    const oppoChoicing =infomationDetailProps.oppoChoicing;
    const isMounted = infomationDetailProps.isMounted;
    const isCaution = infomationDetailProps.isCaution;
    const canEnable = infomationDetailProps.canEnable;
    const blackLusterCondition = infomationDetailProps.blackLusterCondition;
    const swordOfLightFlag = infomationDetailProps.swordOfLightFlag;
    const JinzoFlag = infomationDetailProps.JinzoFlag;
    const advanceSummonCondition = infomationDetailProps.advanceSummonCondition;
    const condition = infomationDetailProps.condition;
    const monsterZoneVacant = infomationDetailProps.monsterZoneVacant;
    const spellTrapZoneVacant = infomationDetailProps.spellTrapZoneVacant;
    const handleOptionClick = infomationDetailProps.handleOptionClick
    const chainBlockCardsLength = infomationDetailProps.chainBlockCardsLength
    const handleDisplayCardListProps = infomationDetailProps.handleDisplayCardListProps

    const [isInfoMounted, setIsInfoMounted] = useState(false);

    const containerRef = useRef(null);
    console.log(
        player.turnPlayer,
        player.priority,
        card.controller == playerId,
        !effecting,
        !selectTargetFlag,
        !quickEffectTiming,
        !chainConfirmFlag,
        (phase == 'main1' || phase == 'main2'),
        spellTrapZoneVacant,
        !animating,
        !oppoChoicing,
        isMounted,
        !isCaution
    )
    const back = () => {
        console.log('back')
        infomationDetailProps.setCardInfomationDetailFlag(false)
        infomationDetailProps.setCardInfomationDetailClassName('')
    }

    useEffect(() => {
        setIsInfoMounted(true);

        return (() => {
            setIsInfoMounted(false); // コンポーネントがアンマウントされたときに更新
        })
    })
    // useEffect(() => {
    //     let timerId;

    //     const handleClickOutside = (event) => {
    //         if (containerRef.current && !containerRef.current.contains(event.target)) {
    //             back();
    //         }
    //     };

    //     // コンポーネントがマウントされた直後ではなく、少し遅延してからイベントリスナーを設定
    //     timerId = setTimeout(() => {
    //         document.addEventListener('click', handleClickOutside);
    //     }, 10); // 10ミリ秒の遅延

    //     // クリーンアップ関数でイベントリスナーを削除とタイマーをクリア
    //     return () => {
    //         clearTimeout(timerId);
    //         document.removeEventListener('click', handleClickOutside);
    //     };
    // }, [back]);

    // コンポーネント内でのクリックイベントの伝播を防止
    const handleClickInside = (e) => {
        e.stopPropagation();
    };

    return (
        <div onClick={(e)=>handleClickInside(e)} ref={containerRef}  className='card-infomation-detail'>
            <div className='action-buttons'>
                {/* 苦渋の選択用のデッキ内確認ボタン */}
                {card.name == "苦渋の選択"
                    && card.controller == playerId
                    && (card.location == "hand" || (card.location == "spellTrapZone" && card.faceStatus == "down"))
                    && (
                        <div className='put action-button'>
                            {<button onClick={() => handleDisplayCardList(...Object.values(handleDisplayCardListProps), mobileDisplayCardsPropsFields)}>山札確認</button>}
                        </div>
                    )}
                {card.cardtype === "Monster"

                    && card.controller == playerId
                    && (phase == 'main1' || phase == 'main2')
                    && !selectTargetFlag
                    && player.turnPlayer
                    && player.priority
                    && player.rightOfSummon
                    && spellSpeed == 0
                    && card.location === 'hand'
                    && !effecting
                    && !quickEffectTiming
                    && !chainConfirmFlag
                    // && !animating
                    && !oppoChoicing
                    && isMounted
                    && isInfoMounted
                    && !isCaution
                    && (
                        <div className='summons action-button'>
                            {card.level <= 4 && !player.useGoats && monsterZoneVacant && <button onClick={() => { handleOptionClick("summon"), back() }}>召喚</button>}
                            {card.level <= 4 && monsterZoneVacant && <button onClick={() => handleOptionClick("set")}>セット</button>}
                            {card.level > 4 && card.level < 8 && advanceSummonCondition() && !player.useGoats && <button onClick={() => { handleOptionClick("AdvanceSummon"), back() }}>生贄召喚</button>}
                            {card.level > 4 && card.level < 8 && advanceSummonCondition() && <button onClick={() => { handleOptionClick("AdvanceSet"), back() }}>セット</button>}
                        </div>
                    )}
                {card.name == 'カオス・ソルジャー －開闢の使者－'
                    && card.controller == playerId
                    && monsterZoneVacant
                    && (phase == 'main1' || phase == 'main2')
                    && !selectTargetFlag
                    && player.turnPlayer
                    && player.priority
                    && spellSpeed == 0
                    && card.location === 'hand'
                    && !effecting
                    && !quickEffectTiming
                    && !chainConfirmFlag
                    && canEnable
                    // && !animating
                    && !oppoChoicing
                    && isMounted
                    && isInfoMounted
                    && !isCaution
                    && (
                        <div className='special-summon action-button'>
                        {card.name == 'カオス・ソルジャー －開闢の使者－' && blackLusterCondition && !player.useGoats && <button onClick={() => { handleOptionClick("SpecialSummon"), back() }}>特殊召喚</button>}
                        </div>
                    )}



                {(card.cardtype === "Monster" || card.cardtype)
                    && card.location == 'monsterZone'
                    && card.controller == playerId
                    && card.canChange
                    && !selectTargetFlag
                    && player.turnPlayer
                    && player.priority
                    && (phase == 'main1' || phase == 'main2')
                    && spellSpeed == 0
                    && !effecting
                    && !quickEffectTiming
                    && !chainConfirmFlag
                    // && !animating
                    && !oppoChoicing
                    && isMounted
                    && isInfoMounted
                    && !isCaution
                    && (
                        <div className='change action-button'>
                        {card.faceStatus != 'downDef' && <button onClick={() => { handleOptionClick("change"), back() }}>{card.faceStatus == 'attack' ? '守備表示' : '攻撃表示'}</button>}
                        {card.faceStatus == 'downDef' && <button onClick={() => { handleOptionClick("reverse"), back() }}>リバース</button>}
                        </div>
                    )}
                {(card.cardtype === "Monster" || card.cardtype == "Token")
                    && card.location == 'monsterZone'
                    && card.controller == playerId
                    && player.turnPlayer
                    && player.priority
                    && !selectTargetFlag
                    && phase == 'battle'
                    && card.attackable
                    && spellSpeed == 0
                    && !effecting
                    && !chainConfirmFlag
                    && !quickEffectTiming
                    && card.faceStatus == 'attack'
                    && !swordOfLightFlag()
                    // && !animating
                    && !oppoChoicing
                    && isMounted
                    && isInfoMounted
                    && !isCaution
                    && (
                        <div className='attack action-button'>
                        <button onClick={() => { handleOptionClick("attack"), back() }}>攻撃</button>
                        </div>
                    )}


                {card.controller == playerId
                    && (condition)
                    && player.priority
                    // 場のスペルスピードより早く、かつスペルスピードが2以上じゃなければクイックエフェクトタイミンでは使用不可 
                    && (card.effect.spellSpeed > spellSpeed)
                    && (card.effect.spellSpeed > 1 || (phase == 'main1' || phase == 'main2'))
                    // モンスターは表側のみ使用可かつchainBlockCardが一枚以下のときのみ
                    && (card.cardtype != 'Monster' || (card.faceStatus != 'downDef' && chainBlockCardsLength < 2))
                    // スペルスピード1の魔法は伏せたターンでも使える
                    && (card.cardtype != 'Spell' || card.canChange || card.effect.spellSpeed == 1)
                    && (card.cardtype != 'Trap' || (card.canChange && !JinzoFlag()))
                    && !effecting
                    && !selectTargetFlag
                    && card.location != 'hand'
                    && card.location != 'banishZone'
                    && card.location != 'deck'
                    && card.effect.canUse
                    // 開闢は発動じゃなくて召喚canEnableでを司っている
                    && ((card.name != 'カオス・ソルジャー －開闢の使者－' && canEnable) || (card.name == 'カオス・ソルジャー －開闢の使者－' && card.attackable))
                    && (card.location != 'graveyard')
                    // && !animating
                    && !oppoChoicing
                    && !quickEffectTiming
                    && isMounted
                    && isInfoMounted
                    && !isCaution
                    && (
                        <div className='activate action-button'>
                        {chainConfirmFlag && (card.effect.spellSpeed > 1 || (card.cardtype == 'Monster' && player.turnPlayer)) && <button onClick={(event) => { handleOptionClick("chainActivate", event), back() }}>発動</button>}
                        {!chainConfirmFlag && <button onClick={(event) => { handleOptionClick("activate", event), back()}}>発動</button>}
                        </div>
                    )}


                {card.location == 'hand'
                    && player.turnPlayer
                    && player.priority
                    && card.controller == playerId
                    && !effecting
                    && !selectTargetFlag
                    && card.effect.canUse
                    && (phase == 'main1' || phase == 'main2' || card.effect.spellSpeed == 2)
                    && spellTrapZoneVacant
                    && canEnable
                    // && !animating
                    && !oppoChoicing
                    && (!quickEffectTiming || card.effect.spellSpeed == 2)
                    && isMounted
                    && isInfoMounted
                    && !isCaution
                    && (
                        <div className='hand-activate action-button'>
                        {chainConfirmFlag && card.cardtype === "Spell" && player.turnPlayer && card.effect.spellSpeed > 1 && card.category == "quick" && <button onClick={() => { handleOptionClick("chainActivateFromHand"), back() }}>発動</button>}
                        {!chainConfirmFlag && card.cardtype === "Spell" && <button onClick={() => { handleOptionClick("activateFromHand"), back() }}>発動</button>}
                        </div>
                    )}
                {card.location == 'hand'
                    && player.turnPlayer
                    && player.priority
                    && card.controller == playerId
                    && !effecting
                    && !selectTargetFlag
                    && !quickEffectTiming
                    && !chainConfirmFlag
                    && (phase == 'main1' || phase == 'main2')
                    && spellTrapZoneVacant
                    // && !animating
                    && !oppoChoicing
                    && isMounted
                    && isInfoMounted
                    && !isCaution
                    && (
                        <div className='put action-button'>
                        {(card.cardtype === "Spell" || card.cardtype === "Trap") && <button onClick={() => { handleOptionClick("put"), back() }}>セット</button>}
                        </div>
                    )}

            </div>
        </div>
    );
}


// 条件付きにしたから不要
// const handleDisplayCardInfomationDetail = async (cardId, infomationDetailProps) => {
//     console.log('open card infomation detail', cardId, infomationDetailProps)
//     return new Promise((resolve) => {
//         const handleDisplayCardInfomationDetail = () => {
//             root.unmount(); // コンポーネントのアンマウント
//             infomationDetailProps.setCardInfomationDetailFlag(false)
//             infomationDetailProps.setCardInfomationDetailClassName('')
//             console.log('unmounted')
//             resolve();
//         };
//         const displayCardListElement = document.getElementById(`card-infomation-detail-wrapper-${cardId}`);
//         // const displayCardListElement = document.createElement('div');
//         // document.body.appendChild(displayCardListElement);

//         const root = createRoot(displayCardListElement);
//         root.render(<CardInfomationDetail cardId={cardId} infomationDetailProps={infomationDetailProps} back={handleDisplayCardInfomationDetail}/>);
//     });
// }
export { CardInfomationDetail };
