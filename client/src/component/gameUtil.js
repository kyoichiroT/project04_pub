import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { allCards, cardEffects } from '../models/cards';
import {
    activate, normalSummon, put, change, reverse, destroy, makeChainBlock, checkChainFlag, sweep, effectResolution, payCost, attack, advanceSummon, sideEffectChain,
    actionChain, actionChainHandle, blackLusterSummonHandle, getPriority, selectEquipTarget, checkCanEnable, quickEffectConfirm, asyncSelectCard, triggerEffectAndWait, discard, awaitTime, selectTargetCard
} from '../gamePlayLogic';
import { Card as cardModel } from '../models/models';
import { ChainConfirm, handleChain } from './chainConfirm';
import { useSelector, useDispatch } from 'react-redux';
import { useSpring, animated } from 'react-spring';
import { setCardPosition } from '../actions';
// import { checkQuickEffect } from '../gamePlayLogic';

import '../css/GameBord.css';
import '../css/effect.css';
import '../css/card.css';
import { handleDisplayCardList } from './displayCardList';
import { CardInfomationDetail, handleDisplayCardInfomationDetail } from './cardInfomationDetail';


const Card = ({ cardId, cardProps, props, onHover, visualizeEffect }) => {
    const card = allCards[cardId];


    const chainProps = props.chainProps;
    const selectTargetProps = props.selectTargetProps;
    
    const socket = cardProps.socket;
    const roomName = cardProps.roomName;
    const hand = cardProps.hand;
    const setHand = cardProps.setHand;
    const deck = cardProps.deck;
    const setDeck = cardProps.setDeck;
    const monsterZone = cardProps.monsterZone;
    const setMonsterZone = cardProps.setMonsterZone;
    const spellTrapZone = cardProps.spellTrapZone;
    const setSpellTrapZone = cardProps.setSpellTrapZone;
    const graveyard = cardProps.graveyard;
    const setGraveyard = cardProps.setGraveyard;
    const banishZone = cardProps.banishZone;
    const setBanishZone = cardProps.setBanishZone;
    const game = cardProps.game;
    const playerId = cardProps.playerId;
    const opponentPlayerId = cardProps.opponentPlayerId;
    const players = cardProps.players;
    const player = players[playerId]
    const setPlayers = cardProps.setPlayers;
    const phase = cardProps.phase;
    const step = cardProps.step;
    const spellSpeed = cardProps.spellSpeed;
    const setSpellSpeed = cardProps.setSpellSpeed;
    const effecting = cardProps.effecting;
    const setEffecting = cardProps.setEffecting;
    const conditions = cardProps.conditions;
    const setConditions = cardProps.setConditions;
    const condition = card.effect.triggerCondition.split(',').some((condi) => conditions.includes(condi)) || card.effect.triggerCondition.includes('none') || (chainProps.action == "battleStep" && card.effect.triggerCondition.includes('battle'));
    const chainConfirmFlag = chainProps.chainConfirmFlag;
    const setChainConfirmFlag = chainProps.setChainConfirmFlag;
    let chainBlockCards = chainProps.chainBlockCards;
    const targetCards = selectTargetProps.targetCards;
    const setSelectTarget = selectTargetProps.setSelectTarget;
    const selectTarget = selectTargetProps.selectTarget
    const selectTargetFlag = selectTargetProps.selectTargetFlag;
    const setSelectTargetFlag = selectTargetProps.setSelectTargetFlag;
    const quickEffectTiming = props.quickEffectTiming;
    const setQuickEffectTiming = props.setQuickEffectTiming;
    const quickEffectStack = props.quickEffectStack;
    const setQuickEffectStack = props.setQuickEffectStack;
    const triggeredCardId = visualizeEffect.triggeredCardId
    // 発動したカードはデカくなる
    const isTriggered = triggeredCardId === cardId;
    const otherProps = props.otherProps
    const setPlayerDamageValue = otherProps.setPlayerDamageValue
    // 相手の選択中
    const oppoChoicing = otherProps.oppoChoicing
    const isCaution = otherProps.isCaution
    const isMobile = otherProps.isMobile
    const extinctionGoats = cardProps.extinctionGoats;
    const setExtinctionGoats = cardProps.setExtinctionGoats;
    const quickEffectAndChain = {
        chainConfirmFlag: chainConfirmFlag,
        setChainConfirmFlag: setChainConfirmFlag,
        quickEffectTiming: quickEffectTiming,
        setQuickEffectTiming: setQuickEffectTiming,
        setEffecting: setEffecting
    }
    const effectTarget = chainProps.effectTarget


    // カード攻撃用のスタイル
    const [cardStyles, setCardStyles] = useState({});
    const [trollStyles, setTrollStyles] = useState({});
    // 裏向きフェードアニメーション用のスタイル
    // let fadeStyles = { animationDelay: `-2s`};
    const [fadeDelay, setFadeDelay] = useState({});

    // シャッフル用のスタイル
    const [shuffleClassName, setShuffleClassName] = useState('');
    // カードホバー時のクラス名
    const [cardInfomationDetailClassName, setCardInfomationDetailClassName] = useState('');
    // カードホバー時のアクションボタンを表示しているかのフラグ
    const [cardInfomationDetailFlag, setCardInfomationDetailFlag] = useState(false);

    // マウントされているか確認。レンダリング直後に一瞬表示されちゃうやつの防止
    const [isMounted, setIsMounted] = useState(false);
    
    const [blackLusterCondition, setBlackLusterCondition] = useState(false);

    const [canEnable, setCanEnable] = useState(false);
    // カードの情報が変わったときに再レンダリングするため
    const [cardState, setCardState] = useState(card);


    useEffect(() => {
        setIsMounted(true);


        return () => {
            setIsMounted(false); // コンポーネントがアンマウントされたときに更新
        };
    }, []);


    const fields = {
        players: players,
        hand: hand,
        deck: deck,
        monsterZone: monsterZone,
        spellTrapZone: spellTrapZone,
        graveyard: graveyard,
        banishZone: banishZone,
        extinctionGoats: extinctionGoats,
    }
    // 護封剣があるかどうか
    const swordOfLightFlag = () => {
        return spellTrapZone[opponentPlayerId].some((cardId) => {
            if (cardId != null && allCards[cardId].name == "光の護封剣") {
                return allCards[cardId].faceStatus == 'up'
            }
            return false
        });
    }
    // サイコショッカーがあるか
    const JinzoFlag = () => {
        return monsterZone[opponentPlayerId].concat(monsterZone[playerId]).some((cardId) => {
            if (cardId != null) {
                const card = allCards[cardId];
                // if (cardId == 29 || cardId == 79) {
                if (card.name == "人造人間－サイコ・ショッカー" && card.faceStatus != "downDef") {
                    return allCards[cardId].location == 'monsterZone' && (allCards[cardId].faceStatus == 'attack' ||
                        allCards[cardId].faceStatus == 'def')
                }
            }
            return false;
        });
    }

    useEffect(() => {

        const currentTime = Date.now();
        const delay = (currentTime - socket.baseTimeStamp) / 1000 % 4; // 4秒のアニメーションサイクルで計算
        // console.log(cardId, currentTime, socket.baseTimeStamp, delay)
        setFadeDelay({ animationDelay: `-${delay}s` })
        // const waitTime = 4 - delay;
        // setTimeout(() => {
        //     setFadeDelay({
        //         animationDelay: `0s`, // アニメーション開始後は遅延なしで実行
        //     });
        // }, waitTime * 1000); // ミリ秒単位で待機時間を設定
    }, [])



    // // 非同期じゃないけど多分大丈夫・・・？
    // let canEnable = checkCanEnable(cardId, playerId, opponentPlayerId, fields, selectTargetProps.actionMonster, player.useGoats);
    // 自身がブレイドナイトの場合
    if (card.name == 'ブレイドナイト') {
        if (card.location == 'monsterZone' && fields.hand[card.controller].length <= 1) {
            card.attack = 2000;
        } else {
            card.attack = 1600;
        }
    }
    // 魔導戦士ブレイカーの攻撃力上昇処理
    if (card.name == '魔導戦士ブレイカー') {
        if (card.location == 'monsterZone' && card.counter == 1) {
            card.attack = 1900;
        } else {
            card.attack = 1600;
        }
        // カウンターがモンスターゾーン以外で乗ってるときに外す
        if (card.location != "monsterZone" && card.counter != 0) {
            card.counter = -1
        }
    }
    // キラスネは墓地にいるときは効果発動可能
    if (card.name == 'キラースネーク') {
        if (card.location == 'graveyard') {
            card.effect.canUse = true
        }
    }
    const fieldsSetter = {
        setPlayers: setPlayers,
        setHand: setHand,
        setDeck: setDeck,
        setMonsterZone: setMonsterZone,
        setSpellTrapZone: setSpellTrapZone,
        setGraveyard: setGraveyard,
        setBanishZone: setBanishZone,
        setExtinctionGoats: setExtinctionGoats,
    }

    const quickEffectProps = {
        players: players,
        playerId: playerId,
        opponentPlayerId: opponentPlayerId
    }

    // 生贄召喚できるかどうか。すべてがトークンのとき生贄召喚不可
    const advanceSummonCondition = () => {
        return monsterZone[playerId].some(id => allCards[id] && allCards[id].cardtype !== 'Token')
    }



    useEffect(() => {
        if (card.name == 'カオス・ソルジャー －開闢の使者－') {
            const lightMonster = graveyard[playerId].some((cardId) => { return (allCards[cardId].cardtype == 'Monster' && allCards[cardId].attribute == 'light') });
            const darkMonster = graveyard[playerId].some((cardId) => { return (allCards[cardId].cardtype == 'Monster' && allCards[cardId].attribute == 'dark') });
            console.log(lightMonster, darkMonster)
            if (darkMonster && lightMonster) {
                setBlackLusterCondition(true)
                console.log('setBlackLusterCondition')
            } else {
                setBlackLusterCondition(false)
            }
        }
    }, [graveyard]);

    useEffect(() => {
        // 自身がブレイドナイトの場合
        if (card.name == 'ブレイドナイト') {
            if (card.location == 'monsterZone' && fields.hand[card.controller].length == 1) {
                card.attack = 2000;
            } else {
                card.attack = 1600;
            }
        }
    }, [monsterZone]);

    useEffect(() => {
        // 使えるかどうかをplayer(useGoats)とactiomMonster(奈落とか)で監視する
        setCanEnable(checkCanEnable(cardId, playerId, opponentPlayerId, fields, chainProps.action, selectTargetProps.actionMonster, player.useGoats, conditions));

    }, [player, deck, hand, monsterZone, spellTrapZone, graveyard, chainProps.action, selectTargetProps.actionMonster])
    // // 攻撃時アタックアニメーション
    // const cardAttackAnimation = (data) => {
    //     // dataから攻撃するカードと攻撃対象のカードのIDを取得
    //     const { attackerId, targetId } = data;

    //     // allCardsオブジェクトからカードの位置を取得
    //     const attackerPosition = allCards[attackerId].position;
    //     const targetPosition = allCards[targetId].position;

    //     // 移動距離の計算
    //     const translateX = targetPosition.left - attackerPosition.left;
    //     const translateY = targetPosition.top - attackerPosition.top;
    //     // 攻撃先への角度の計算
    //     const angleRad = Math.atan2(targetPosition.top - attackerPosition.top, targetPosition.left - attackerPosition.left);
    //     const angleDeg = angleRad * 180 / Math.PI; // ラジアンから度に変換


    //     // 行きカードのアニメーションを設定（Reactのステートを使用）
    //     setCardStyles(prevStyles => ({
    //         ...prevStyles,
    //         [attackerId]: {
    //             ...prevStyles[attackerId],
    //             transform: `translate(${translateX}px, ${translateY}px) rotate(${angleDeg}deg)`,
    //             transition: 'transform 0.35s ease-out' // 行きのアニメーション
    //         }
    //     }));

    //     // 帰りのアニメーション
    //     setTimeout(() => {
    //         setCardStyles(prevStyles => ({
    //             ...prevStyles,
    //             [attackerId]: {
    //                 ...prevStyles[attackerId],
    //                 transform: '',
    //                 transition: 'transform 0.5s ease-in-out' // 帰りのアニメーション
    //             }
    //         }));
    //     }, 350); // 行きのアニメーションの持続時間に合わせる
    // };

    // カードの向きを合わせるアニメーション
    const cardAttackAnimation = async (data) => {
        const { attackerId, targetId } = data;
        let attackerPosition = {};
        let targetPosition = {}
        let adjustedAngle = {};

        attackerPosition = allCards[attackerId].position;

        if (targetId != '') {
            // モンスターへの攻撃時
            let allMonsters = Object.keys(monsterZone)[0] == playerId ? [...Object.values(monsterZone)[1], null, ...Object.values(monsterZone)[0], null] : [...Object.values(monsterZone)[0], null, ...Object.values(monsterZone)[1], null];
            const fromIndex = allMonsters.findIndex(cardId => cardId === attackerId);
            const toIndex = allMonsters.findIndex(cardId => cardId === targetId);

            // 攻撃モンスターのインデックス
            const monsterElement = document.querySelectorAll('.monster-zone > div')
            const fromElement = monsterElement[fromIndex]
            const toElement = monsterElement[toIndex]

            const fromRect = fromElement.getBoundingClientRect();
            const toRect = toElement.getBoundingClientRect();
            console.log(fromIndex, toIndex, fromElement, toElement, fromRect, toRect)
            const angleRad = Math.atan2(toRect.top - fromRect.top, toRect.left - fromRect.left);
            const angleDeg = angleRad * 180 / Math.PI;

            // targetPosition = allCards[targetId].position;
    
            // // 角度の計算
            // const angleRad = Math.atan2(targetPosition.top - attackerPosition.top, targetPosition.left - attackerPosition.left);
            // const angleDeg = angleRad * 180 / Math.PI;
    
            // adjustedAngle = angleDeg + 90;
            // if (allCards[attackerId].controller != playerId) {
            //     adjustedAngle = angleDeg - 90;
            // }
            if (allCards[attackerId].controller == playerId) {
                adjustedAngle = angleDeg + 90;
            } else {
                adjustedAngle = angleDeg - 90;
            }
            // 回転のためのスタイルを設定
            setCardStyles(prevStyles => ({
                ...prevStyles,
                [attackerId]: {
                    ...prevStyles[attackerId],
                    transform: `rotate(${adjustedAngle}deg)`,
                    transition: 'transform 0.2s ease-out' // 回転のアニメーション
                }
            }));
            
        } else {
            // ダイレクトアタック時
            let targetRect = document.querySelectorAll('.hand-wrapper');
            console.log(targetRect)
            const attackCard = allCards[attackerId];
            // 攻撃者なら
            let playerRect = {}
            if (attackCard.controller == playerId) {
                playerRect = targetRect[0].getBoundingClientRect();
            } else {
                playerRect = targetRect[1].getBoundingClientRect();
            }
            // allMonstersは長さ12
            let allMonsters = Object.keys(monsterZone)[0] == playerId ? [...Object.values(monsterZone)[1], null, ...Object.values(monsterZone)[0], null] : [...Object.values(monsterZone)[0], null, ...Object.values(monsterZone)[1], null];
            console.log(allMonsters)
            const fromIndex = allMonsters.findIndex(cardId => cardId === attackerId);
            console.log(fromIndex)
            // monsterElementは長さ12(背景文字含めて)
            const monsterElement = document.querySelectorAll('.monster-zone > div')
            console.log(monsterElement)
            const fromElement = monsterElement[fromIndex]

            console.log(playerRect)
            console.log(fromElement)
            const fromRect = fromElement.getBoundingClientRect();
            targetPosition = { top: playerRect.top, left: playerRect.left }
            const angleRad = Math.atan2(playerRect.top - fromRect.top, playerRect.left - fromRect.left + playerRect.width / 2);
            console.log(angleRad)
            let angleDeg = angleRad * 180 / Math.PI;
            console.log(angleDeg)
            // adjustedAngle = angleDeg;
            // 真ん中のやつがダイレクトするときは強制で角度0に
            if (fromIndex == 0 || fromIndex == 6) {
                if (attackCard.controller != playerId) {
                    angleDeg = 90;
                    
                } else {
                    angleDeg = -90;
                }
            }
            console.log(angleDeg)
            if (attackCard.controller == playerId) {
                adjustedAngle = angleDeg + 90;
            } else {
                adjustedAngle = angleDeg - 90;
            }
            // 回転のためのスタイルを設定
            setCardStyles(prevStyles => ({
                ...prevStyles,
                [attackerId]: {
                    ...prevStyles[attackerId],
                    transform: `rotate(${adjustedAngle}deg)`,
                    transition: 'transform 0.2s ease-out' // 回転のアニメーション
                }
            }));
        }
        
        // adjustedAngle += 3600
        console.log('rotate end')
        // 次のステップへ進むためのタイムアウト
        setTimeout(() => {
            moveToTarget(attackerId, attackerPosition, targetPosition, adjustedAngle, targetId);
        }, 200); // 回転のアニメーションの持続時間に合わせる
    };

    // カードを移動するアニメーション
    const moveToTarget = (attackerId, attackerPosition, targetPosition, adjustedAngle, targetId) => {
        console.log('moveToTarget')
        const fromCardId = attackerId
        const toCardId = targetId;

        let fromX = 0;
        let fromY = 0;
        let toX = 0;
        let toY = 0;

        let fromIndex = 0
        let toIndex = 0
        let fromElement = null
        let toElement = null

        let angle = 0
        let distance = 0


        // if (toCardId != '') {
        // モンスターに攻撃するとき
        // 先手と後手でそれぞれ別のインデックス番号を取れるようにモンスターゾーンの配列連結を調整
        // let allMonsters = Object.keys(monsterZone)[0] == playerId ? [...Object.values(monsterZone)[1], ...Object.values(monsterZone)[0]] : [...Object.values(monsterZone)[0], ...Object.values(monsterZone)[1]];
        let allMonsters = Object.keys(monsterZone)[0] == playerId ? [...Object.values(monsterZone)[1], null, ...Object.values(monsterZone)[0], null] : [...Object.values(monsterZone)[0], null, ...Object.values(monsterZone)[1], null];
        // console.log(allMonsters)
        // if (allCards[fromCardId].controller == playerId) {
        fromIndex = allMonsters.findIndex(cardId => cardId === fromCardId);
        toIndex = allMonsters.findIndex(cardId => cardId === toCardId);

        // 攻撃モンスターのインデックス
        const monsterElement = document.querySelectorAll('.monster-zone > div')
        fromElement = monsterElement[fromIndex]
        // toElement = monsterElement[toIndex]
        if (toCardId != '') {
            toElement = monsterElement[toIndex]
        } else if (allCards[fromCardId].controller == playerId) {
            toElement = document.querySelectorAll('.hand-wrapper')[0]
        } else {
            toElement = document.querySelectorAll('.hand-wrapper')[1]
        }
        // console.log(toElement)
        if (!fromElement) {
            console.log('FROM ELEMENT', allMonsters, fromCardId, toCardId, fromIndex, toIndex, fromElement, toElement)
        }
        if (!toElement) {
            console.log('TO ELEMENT', allMonsters, fromCardId, toCardId, fromIndex, toIndex, fromElement, toElement)
        }
        console.log(fromElement, toElement)

        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        fromX = fromRect.left + fromRect.width / 2;
        fromY = fromRect.top + fromRect.height / 2;
        toX = toRect.left + toRect.width / 2;
        toY = toRect.top + toRect.height / 2;

        let translateX = toX - fromX
        let translateY = toY - fromY
        console.log(translateX, translateY)
        console.log(fromRect, toRect)
        console.log('攻撃移動するよ')
        setCardStyles(prevStyles => ({
            ...prevStyles,
            [attackerId]: {
                ...prevStyles[attackerId],
                transform: `translate(${translateX}px, ${translateY}px) rotate(${adjustedAngle}deg)`,
                transition: 'transform 0.35s ease-out' // 移動のアニメーション
            }
        }));
        // // カードの大きさを取得
        // let targetRect = "";
        // let cardRect = {};
        // if (targetId != '') {
        //     // console.log(targetId, allCards[targetId]);
        //     if (allCards[targetId].faceStatus == "attack") {
        //         console.log("attack")
        //         targetRect = document.querySelectorAll('.attack');
        //     } else if (allCards[targetId].faceStatus == "def" || allCards[targetId].faceStatus == "downDef") {
        //         console.log("def")
        //         targetRect = document.querySelectorAll('.def');
        //     } else if (allCards[targetId].faceStatus == "down" || allCards[targetId].faceStatus == "none") {
        //         console.log('down')
        //         targetRect = document.querySelectorAll('.faceDown');
        //     } else if (allCards[targetId].faceStatus == "up") {
        //         console.log('up')
        //         targetRect = document.querySelectorAll('.faceUp');
        //     }
        //     // console.log(targetRect)
        //     cardRect = targetRect[0].getBoundingClientRect();
        // } else {
        //     // ダイレクトアタック時
        //     let targetRect = document.querySelectorAll('.hand-wrapper');
        //     console.log(targetRect)
        //     const attackCard = allCards[attackerId];
        //     // 攻撃者なら
        //     if (attackCard.controller == playerId) {
        //         cardRect = targetRect[0].getBoundingClientRect();
        //     } else {
        //         cardRect = targetRect[1].getBoundingClientRect();
        //     }
        // }

        // let translateX = 0;
        // let translateY = 0;
        // // 移動距離の計算
        // if (targetId != '') {
        //     // モンスターへ攻撃時
        //     translateX = targetPosition.left - attackerPosition.left;
        //     translateY = targetPosition.top - attackerPosition.top;
        // } else {
        //     // ダイレクトアタック時
        //     translateX = targetPosition.left - attackerPosition.left + cardRect.width /2;
        //     translateY = targetPosition.top - attackerPosition.top + cardRect.height / 2;
        // }
        // // adjustedAngle += 3600

        // // 移動のためのスタイルを設定
        // setCardStyles(prevStyles => ({
        //     ...prevStyles,
        //     [attackerId]: {
        //         ...prevStyles[attackerId],
        //         transform: `translate(${translateX}px, ${translateY}px) rotate(${adjustedAngle}deg)`,
        //         transition: 'transform 0.35s ease-out' // 移動のアニメーション
        //     }
        // }));
        if (otherProps.animationSpinFlag) {
            console.log('animation on SPIN!')
            setTrollStyles(prevStyles => ({
                animation: 'continuous-rotate 2s linear infinite'
            }));
        } else {
            setTrollStyles({});
        }
        // 移動完了後の処理
        console.log('アタックでの移動完了')
        setTimeout(() => {
            resetCardPosition(attackerId);
        }, 350);
    };
    // 元の位置に戻るアニメーション
    const resetCardPosition = (attackerId) => {
        setCardStyles(prevStyles => ({
            ...prevStyles,
            [attackerId]: {
                ...prevStyles[attackerId],
                transform: '',
                transition: 'transform 0.5s ease-in-out'
            }
        }));
        if (otherProps.animationSpinFlag) {
            setTrollStyles({});
        }
    };
    // useEffect(() => {
    //     // console.log(cardStyles)
    // }, [cardStyles])

    const style = cardStyles[cardId] || {};
    // カード攻撃時の攻撃先への移動アニメーション設定
    useEffect(() => {
        const cardAttackAnimationHandler = async (data) => {
            console.log('攻撃アニメーションの開始！', data)
            await cardAttackAnimation(data);
            // 攻撃を食らったら完了通知
            if (allCards[data.attackerId].controller != playerId) {
                socket.emit('endCardAttackAnimation', { roomName });
                console.log('攻撃アニメーション終了!')
                props.otherProps.setAnimating(false)
            }
        }
        // if (card.location == "monsterZone") {
        socket.on('cardAttackAnimation' + cardId, cardAttackAnimationHandler)
        // }

        return () => {
            socket.off('cardAttackAnimation' + cardId, cardAttackAnimationHandler)
        }
    }, [card.location, monsterZone, otherProps.animationSpinFlag]);

    // シャッフル用のアニメーション
    // もしこのカードがデッキトップまたは2枚目の場合に動かす
    useEffect(() => {
        // このカードが両プレイヤーどちらかのデッキの1枚目または2枚目であるかをチェック
        const isTopTwo = (deck[playerId].length >= 2 && (deck[playerId][0] === cardId || deck[playerId][1] === cardId)) || (deck[opponentPlayerId].length >= 2 && (deck[opponentPlayerId][0] === cardId || deck[opponentPlayerId][1] === cardId));

        if (isTopTwo) {
            // イベントリスナーを設定
            const handleShuffle = (data) => {
                console.log(cardId, data, deck)
                if (deck[data.playerId][0] === cardId) {
                    setShuffleClassName('shuffle-top');
                    console.log('shuffle-top')
                } else if (deck[data.playerId][1] === cardId) {
                    setShuffleClassName('shuffle-second');
                    console.log('shuffle-second')
                }
                setTimeout(() => {
                    setShuffleClassName('');
                }, 1000); // ここではアニメーションの持続時間を1秒(1000ミリ秒)と仮定
            };

            socket.on("shuffleAnimation", handleShuffle);

            // コンポーネントのアンマウント時、またはデッキの状態が変更されたときにリスナーを削除
            return () => {
                socket.off("shuffleAnimation", handleShuffle);
            };
        }
    }, [deck[playerId]?.[0], deck[playerId]?.[1], deck[playerId].length, deck[opponentPlayerId]?.[0], deck[opponentPlayerId]?.[1], deck[opponentPlayerId].length]);

    const handleOptionClick = async (option, event) => {
        if (card.name == "キラースネーク" && (option == 'activate' || option == 'chainActivate')) {
            event.stopPropagation();
        }
        if ((card.name == "炸裂装甲" || card.name == "奈落の落とし穴") && (option == 'activate' || option == 'chainActivate')) {
            console.log(selectTargetProps.actionMonster)
            card.link = [...card.link, selectTargetProps.actionMonster]
        }
        let updatefields = fields
        // 選択されたオプションに基づいて処理を行う
        if (option == 'summon') {
            const face = 'attack'
            let newConditions = conditions;
            chainProps.setActionMonster(cardId);
            // 通常召喚した場合はスケゴ用通常召喚フラグをオンにする。このあとsetされる
            updatefields.players[playerId].useReverseAndSpecialSummon = true;
            updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);
            console.log(updatefields.players, JSON.stringify(updatefields.players));
            // 初期値-1のカウンターを0にすることにより誘発効果を発動させる
            if (card.name == "魔導戦士ブレイカー") {
                card.counter = 0;
            }
            updatefields = await normalSummon(socket, roomName, cardId, updatefields, fieldsSetter, playerId, setPlayers, face);
            console.log(updatefields.players, JSON.stringify(updatefields.players));
            // 相手に通常召喚したことを通知
            console.log(roomName, playerId, cardId, face);
            socket.emit('normalSummon', { roomName, playerId, cardId: cardId, face });
            // socket.emit('messageLog', { roomName: roomName, type: 'battleLog', action: 'summon', playerId: card.controller, message: message })
            console.log([...conditions, 'summoned']);
            if (!conditions.includes('summoned')) {
                newConditions = conditions.filter((condition) => condition != 'normalSpell');
                newConditions = [...conditions, 'summoned']
                setConditions(newConditions);
            }
            socket.emit('addActionMonster', { roomName, actionMonster: cardId, action: 'summon' });
            socket.emit('conditionAdd', { roomName, condition: ['summoned'] });
            card.canChange = false;
            const effectProps = {
                cardId: cardId,
                playerId: playerId,
                opponentPlayerId: opponentPlayerId,
            };
            const sideEffect = await sideEffectChain(socket, roomName, playerId, opponentPlayerId, updatefields, fieldsSetter, effectProps, chainProps, chainConfirmFlag, setChainConfirmFlag, chainBlockCards, selectTargetProps, setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps);
            if (!sideEffect.result) {
                console.log('クイックエフェクト');
                await quickEffectConfirm(socket, roomName, setQuickEffectTiming, chainProps.setChainBlockCards, newConditions, setConditions, updatefields, fieldsSetter, playerId, opponentPlayerId, 'summon', chainProps.setAction, cardId, chainProps.setActionMonster, quickEffectStack, setQuickEffectStack, otherProps);
                // await actionChainHandle(socket, roomName, playerId, opponentPlayerId, cardId, updatefields, fieldsSetter, [cardId], setChainConfirmFlag, chainProps, 'summon', setSpellSpeed, setQuickEffectTiming)
            }
            socket.emit('chainCountMsgReset', { roomName });
            await getPriority(updatefields.players, setPlayers, playerId, opponentPlayerId);
            newConditions = conditions.filter((condition) => condition != "summoned");
            setConditions(newConditions);
            socket.emit('conditionRemove', { roomName, condition: ["summoned"] });
            console.log('召喚終了！')
        }

        if (option == 'AdvanceSummon') {
            const face = 'attack'
            // 通常召喚した場合はスケゴ用通常召喚フラグをオンにする。このあとsetされる
            updatefields.players[playerId].useReverseAndSpecialSummon = true;
            updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);

            const tributeCardId = await advanceSummon(socket, roomName, cardId, fields, fieldsSetter, playerId, setPlayers, selectTargetProps, face)
            if (tributeCardId == null) {
                updatefields.players = await getPriority(updatefields.players, setPlayers, playerId, opponentPlayerId);
                console.log('生贄召喚のキャンセル')
                return
            }
            socket.emit('advanceSummon', { roomName, playerId, cardId: cardId, tribute: tributeCardId, face });
            socket.emit('addActionMonster', { roomName, actionMonster: cardId, action: 'summon' });
            socket.emit('conditionAdd', { roomName, condition: ['summoned'] });
            let newConditions = conditions;
            if (!conditions.includes('summoned')) {
                newConditions = conditions.filter((condition) => condition != 'normalSpell');
                newConditions = [...conditions, 'summoned']
                setConditions(newConditions);
            }
            card.canChange = false;
            await quickEffectConfirm(socket, roomName, setQuickEffectTiming, chainProps.setChainBlockCards, newConditions, setConditions, updatefields, fieldsSetter, playerId, opponentPlayerId, 'summon', chainProps.setAction, cardId, chainProps.setActionMonster, quickEffectStack, setQuickEffectStack, otherProps);
            // await actionChainHandle(socket, roomName, playerId, opponentPlayerId, cardId, fields, fieldsSetter, [cardId], setChainConfirmFlag, chainProps, 'summon', setSpellSpeed, setQuickEffectTiming)
            await getPriority(updatefields.players, setPlayers, playerId, opponentPlayerId);
            socket.emit('chainCountMsgReset', { roomName });
            newConditions = conditions.filter((condition) => condition != "summoned" && condition != "attack");
            setConditions(newConditions);
            socket.emit('conditionRemove', { roomName, condition: ["summoned", "attack"] });
        }
        
        if (option == 'set') {
            const face = 'downDef'
            console.log(updatefields)
            updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);

            await normalSummon(socket, roomName, cardId, fields, fieldsSetter, playerId, setPlayers, face);
            // 相手に通常召喚したことを通知
            console.log('location is ', card.location)
            socket.emit('normalSummon', { roomName, playerId, cardId: cardId, face });
            socket.emit('addActionMonster', { roomName, actionMonster: cardId, action: 'set' });
            chainProps.setActionMonster(cardId);
            card.canChange = false;
            // await actionChainHandle(socket, roomName, playerId, opponentPlayerId, cardId, fields, fieldsSetter, [cardId], setChainConfirmFlag, chainProps, 'set', setSpellSpeed, setQuickEffectTiming)
            console.log(updatefields)
            await quickEffectConfirm(socket, roomName, setQuickEffectTiming, chainProps.setChainBlockCards, conditions, setConditions, updatefields, fieldsSetter, playerId, opponentPlayerId, 'set', chainProps.setAction, cardId, chainProps.setActionMonster, quickEffectStack, setQuickEffectStack, otherProps);
            socket.emit('chainCountMsgReset', { roomName });
            console.log(updatefields)
            await getPriority(updatefields.players, setPlayers, playerId, opponentPlayerId);
        }

        if (option == 'AdvanceSet') {
            const face = 'downDef'
            updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);

            const tributeCardId = await advanceSummon(socket, roomName, cardId, fields, fieldsSetter, playerId, setPlayers, selectTargetProps, face)
            if (tributeCardId == null) {
                updatefields.players = await getPriority(updatefields.players, setPlayers, playerId, opponentPlayerId);
                console.log('生贄召喚のキャンセル')
                return
            }
            socket.emit('advanceSummon', { roomName, playerId, cardId: cardId, tribute: tributeCardId, face });
            socket.emit('addActionMonster', { roomName, actionMonster: cardId, action: 'set' });
            chainProps.setActionMonster(cardId);
            card.canChange = false;
            // await actionChainHandle(socket, roomName, playerId, opponentPlayerId, cardId, fields, fieldsSetter, [cardId], setChainConfirmFlag, chainProps, 'set', setSpellSpeed, setQuickEffectTiming)
            await quickEffectConfirm(socket, roomName, setQuickEffectTiming, chainProps.setChainBlockCards, conditions, setConditions, updatefields, fieldsSetter, playerId, opponentPlayerId, 'set', chainProps.setAction, cardId, chainProps.setActionMonster, quickEffectStack, setQuickEffectStack, otherProps);
            socket.emit('chainCountMsgReset', { roomName });
            await getPriority(updatefields.players, setPlayers, playerId, opponentPlayerId);
        }
        if (option == 'change') {
            console.log('change');
            updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);

            change(playerId, monsterZone, setMonsterZone, cardId);
            // 相手に表示形式の変更をしたことを通知
            socket.emit('change', { roomName, cardId: cardId });
            socket.emit('addActionMonster', { roomName, actionMonster: cardId, action: 'change' });
            chainProps.setActionMonster(cardId);
            card.canChange = false;
            // await actionChainHandle(socket, roomName, playerId, opponentPlayerId, cardId, fields, fieldsSetter, [cardId], setChainConfirmFlag, chainProps, 'change', setSpellSpeed, setQuickEffectTiming)
            await quickEffectConfirm(socket, roomName, setQuickEffectTiming, chainProps.setChainBlockCards, conditions, setConditions, updatefields, fieldsSetter, playerId, opponentPlayerId, 'change', chainProps.setAction, cardId, chainProps.setActionMonster, quickEffectStack, setQuickEffectStack, otherProps);
            socket.emit('chainCountMsgReset', { roomName });
            await getPriority(updatefields.players, setPlayers, playerId, opponentPlayerId);

        }
        if (option == 'reverse') {
            if (card.name === '聖なる魔術師') {
                // 発動前に対象の選択
                const selectTargetCardId = await selectTargetCard(socket, roomName, playerId, opponentPlayerId, fields, fieldsSetter, cardId, selectTargetProps, quickEffectAndChain)
                // 選ばなかったら辞める
                if (!selectTargetCardId) {
                    return
                }
            }
            // 相手にリバースしたことを通知
            socket.emit('reverse', { roomName, cardId: cardId, face: 'attack' });
            await reverse(cardId, 'attack');
            // スケゴ用に反転召喚を使ったことにする
            updatefields.players[playerId].useReverseAndSpecialSummon = true;
            updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);

            let newConditions = conditions
            if (!conditions.includes('summoned')) {
                newConditions = conditions.filter((condition) => condition != 'normalSpell');
                newConditions = [...conditions, 'summoned']
                setConditions(newConditions);
            }
            socket.emit('addActionMonster', { roomName, actionMonster: cardId, action: 'reverse' });
            chainProps.setActionMonster(cardId);
            socket.emit('conditionAdd', { roomName, condition: ['summoned'] });
            card.canChange = false;
            if (card.effect.triggerCondition == "reverse") {
                card.effect.canUse = false;
                socket.emit('effectUse', { roomName, cardId });
            }
            console.log(allCards[cardId])
            // セイマジは魔法が墓地に一枚もないとき発動しない
            if (card.effect.triggerCondition === 'reverse' && (card.name != '聖なる魔術師' || updatefields.graveyard[playerId].some((id) => id != null && allCards[id].cardtype == 'Spell'))) {
                setChainConfirmFlag(false);
                // 相手が使うために自分と相手のIDを変える
                const effectProps = {
                    cardId: cardId,
                    playerId: opponentPlayerId,
                    opponentPlayerId: playerId,
                };
                console.log('select props', selectTargetProps)
                await triggerEffectAndWait(socket, roomName, cardId);
                const obj = await makeChainBlock(
                    socket,
                    roomName,
                    cardId,
                    playerId,
                    opponentPlayerId,
                    fields,
                    fieldsSetter,
                    effectProps,
                    chainProps,
                    chainConfirmFlag,
                    setChainConfirmFlag,
                    chainBlockCards,
                    selectTargetProps,
                    setEffecting,
                    setSpellSpeed,
                    setQuickEffectTiming,
                    quickEffectStack,
                    setQuickEffectStack,
                    otherProps
                );
                console.log('チェーンブロック内のカード', chainProps.chainBlockCards)
                await sideEffectChain(socket, roomName, playerId, opponentPlayerId, obj.updateFields, fieldsSetter, effectProps, chainProps, chainConfirmFlag, setChainConfirmFlag, chainBlockCards, selectTargetProps, setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps)

                chainProps.setChainBlockCards([])
            } else {
                await quickEffectConfirm(socket, roomName, setQuickEffectTiming, chainProps.setChainBlockCards, newConditions, setConditions, updatefields, fieldsSetter, playerId, opponentPlayerId, 'reverse', chainProps.setAction, cardId, chainProps.setActionMonster, quickEffectStack, setQuickEffectStack, otherProps);
                // await actionChainHandle(socket, roomName, playerId, opponentPlayerId, cardId, fields, fieldsSetter, [cardId], setChainConfirmFlag, chainProps, 'reverse', setSpellSpeed, setQuickEffectTiming)
            }
            socket.emit('chainCountMsgReset', { roomName });
            newConditions = conditions.filter((condition) => condition != "summoned");
            setConditions(newConditions);
            socket.emit('conditionRemove', { roomName, condition: ["summoned"] });
            console.log('priority', JSON.stringify(updatefields.players[playerId]))
            await getPriority(updatefields.players, setPlayers, playerId, opponentPlayerId);
            console.log('priority', JSON.stringify(updatefields.players[playerId]))
        }
        if (option == 'activate') {
            if (card.name == "スケープゴート") {
                console.log('goats')
                updatefields.players[playerId].useGoats = true;
                setPlayers(updatefields.players);
            }
            // 発動前に対象の選択
            const selectTargetCardId = await selectTargetCard(socket, roomName, playerId, opponentPlayerId, fields, fieldsSetter, cardId, selectTargetProps, quickEffectAndChain)
            // 選ばなかったら辞める
            if (!selectTargetCardId) {
                return
            }

            let newConditions = conditions
            if (conditions.includes('phaseEnd')) {
                socket.emit('conditionRemove', { roomName, condition: ['phaseEnd'] });
                newConditions = conditions.filter((condition) => condition != 'phaseEnd');
                setConditions(newConditions);
                chainProps.conditions = newConditions;
                cardProps.conditions = newConditions;
                console.log('quickEffectConfirm', true);
            }
            // await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);
            // let updateFields = fields;
            const prevActMonster = chainProps.actionMonster
            let effectProps = {
                cardId: prevActMonster,
                playerId: playerId,
                opponentPlayerId: opponentPlayerId,
            };
            console.log('effectProps', effectProps)
            // 装備カードも処理時に対象選択
            // 装備カードなら先に装備先を選択
            // if (card.category == 'equip') {
            //     updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);
            //     const equipCardId = await selectEquipTarget(socket, cardId, updateFields, fieldsSetter, playerId, opponentPlayerId, selectTargetProps);
            //     console.log("装備対象は", equipCardId)
            //     if (equipCardId == null) {
            //         updatefields.players = await getPriority(updatefields.players, setPlayers, playerId, opponentPlayerId);
            //         return
            //     }
            //     // effectPropsに入れて相手チェーン時に使う
            //     effectProps.attackedTarget = equipCardId
            //     // 装備先を先にリンクとして保存し効果処理時に使用する
            //     card.link = [...card.link, equipCardId];
            //     socket.emit('link', { roomName, linkCardId: cardId, targetCardId: equipCardId });
            //     setEffecting(false)
            // }
            let discardCardId = ''
            if (card.effect.cost == 'discard') {
                let targets = fields.hand[playerId];
                // ライトニング・ボルテックスの場合自身をコストにできないようにする
                if (card.name == "ライトニング・ボルテックス") {
                    targets = targets.filter((id) => id != cardId);
                }
                updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);
                discardCardId = await asyncSelectCard(socket, cardId, targets, selectTargetProps);
                if (discardCardId == null) {
                    updatefields.players = await getPriority(updatefields.players, setPlayers, playerId, opponentPlayerId);
                    return
                }
            }
            updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);
            setQuickEffectTiming(false);
            if (card.cardtype == 'Spell' || card.cardtype == 'Trap') {
                await reverse(cardId, 'up');
                socket.emit('reverse', { roomName, cardId: cardId, face: 'up' });
            }
            if (card.name == "早すぎた埋葬" || card.name == "リビングデッドの呼び声") {
                // スケゴ用に反転召喚を使ったことにする
                updatefields.players[playerId].useReverseAndSpecialSummon = true;
                setPlayers(updatefields.players)
            }
            updatefields = await payCost(socket, roomName, cardId, playerId, updatefields, fieldsSetter, discardCardId, setPlayerDamageValue)
            updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);

            // コストを払って初めて効果発動をチェック入れる
            // 同族感染ウイルスは何度でも使える
            if (card.name != "同族感染ウイルス") {
                card.effect.canUse = false;
            }
            setChainConfirmFlag(false);
            chainProps.setEffectTarget(null)
            console.log('activate   chainprops', chainProps)
            await triggerEffectAndWait(socket, roomName, cardId);
            const obj = await makeChainBlock(socket,
                roomName,
                cardId,
                playerId,
                opponentPlayerId,
                updatefields,
                fieldsSetter,
                effectProps,
                chainProps,
                chainConfirmFlag,
                setChainConfirmFlag,
                chainBlockCards,
                selectTargetProps,
                setEffecting,
                setSpellSpeed,
                setQuickEffectTiming,
                quickEffectStack,
                setQuickEffectStack,
                otherProps
            );
            // await effectResolution(socket, roomName, playerId, opponentPlayerId, fields, chainProps, useCards, setSpellSpeed, setQuickEffectTiming)
            // await sideEffectChain(socket, roomName, playerId, opponentPlayerId, obj.updateFields, fieldsSetter, effectProps, chainProps, chainConfirmFlag, setChainConfirmFlag, chainBlockCards, selectTargetProps, setEffecting, setSpellSpeed, setQuickEffectTiming)
            chainProps.setChainBlockCards([])
            newConditions = conditions.filter((condition) => condition != "summoned" && condition != "attack");
            setConditions(newConditions);
            socket.emit('conditionRemove', { roomName, condition: ["summoned", "attack"] });
            console.log('make chained', obj, quickEffectStack)
            // クイックエフェクトの終了を通知
            if (players[playerId].turnPlayer) {
                console.log('quickEffectSelf' + quickEffectStack, true, obj.updateFields);
                socket.emit('quickEffectSelf', { roomName, fields: obj.updateFields, chainBlockCards: obj.useCardIds, status: true, quickEffectStack: quickEffectStack });
                setQuickEffectTiming(false);

            } else {
                let eventName = ""
                if (conditions.includes("phaseEnd")) {
                    eventName = "phaseEnd"
                }
                console.log('quickEffectConfirm' + quickEffectStack, true, obj.updateFields);
                socket.emit('quickEffectConfirm', { roomName, fields: obj.updateFields, chainBlockCards: obj.useCardIds, status: true, eventName: eventName, quickEffectStack: quickEffectStack });
            }
            socket.emit('chainCountMsgReset', { roomName });
 
            console.log('場からの効果処理が終了しました。')
            console.log(obj)
            updatefields = obj.updateFields
            console.log(updatefields)
            updatefields.players = await getPriority(updatefields.players, setPlayers, playerId, opponentPlayerId);
            // handleChain(fields.spellTrapZone, effectProps, setPlayers, playerId, socket, roomName, fields);

        }
        if (option == 'put') {
            const face = 'down'
            put(cardId, fields, fieldsSetter, playerId, face);
            // 相手にセットしたことを通知
            socket.emit('put', { roomName, cardId: cardId, face });
            card.canChange = false;
            // canChangeは伏せたターンかどうかの判別に使う
            // if (card.effect.spellSpeed == 2) {
            //     card.canChange = false;
            // } else {
            //     card.canChange = true;
            // }
        }
        if (option == 'activateFromHand') {
            let updateFields = fields
            //スケープゴートなら使用をセット
            console.log('goats')
            if (card.name == "スケープゴート") {
                console.log('goats')
                updateFields.players[playerId].useGoats = true;
                setPlayers(updateFields.players);
            }

            let effectProps = {
                cardId: cardId,
                playerId: opponentPlayerId,
                opponentPlayerId: playerId,
            };
            // if (card.category == 'equip') {
            //     updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);
            //     const equipCardId = await selectEquipTarget(socket, cardId, updateFields, fieldsSetter, playerId, opponentPlayerId, selectTargetProps);
            //     console.log("装備対象は", equipCardId)
            //     if (equipCardId == null) {
            //         updatefields.players = await getPriority(updatefields.players, setPlayers, playerId, opponentPlayerId);
            //         return;
            //     }
            //     // 装備先を先にリンクとして保存し効果処理時に使用する
            //     card.link = [...card.link, equipCardId];
            //     socket.emit('link', { roomName, linkCardId: cardId, targetCardId: equipCardId });
            //     // effectPropsに入れて相手チェーン時に使う
            //     effectProps.attackedTarget = equipCardId
            // }
            // 発動前に対象の選択
            const selectTargetCardId = await selectTargetCard(socket, roomName, playerId, opponentPlayerId, fields, fieldsSetter, cardId, selectTargetProps, quickEffectAndChain)
            // 選ばなかったら辞める
            if (!selectTargetCardId) {
                return
            }
            
            let discardCardId = ''
            if (card.effect.cost == 'discard') {
                let targets = fields.hand[playerId];
                // ライトニング・ボルテックスの場合自身をコストにできないようにする
                if (card.name == "ライトニング・ボルテックス") {
                    targets = targets.filter((id) => id != cardId);
                }
                updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);
                discardCardId = await asyncSelectCard(socket, cardId, targets, selectTargetProps);
                if (discardCardId == null) {
                    updatefields.players = await getPriority(updatefields.players, setPlayers, playerId, opponentPlayerId);
                    return
                }
            }
            if (conditions.includes('phaseEnd')) {
                socket.emit('conditionRemove', { roomName, condition: ['phaseEnd'] });
                let newConditions = conditions.filter((condition) => condition != 'phaseEnd');
                setConditions(newConditions);
                chainProps.conditions = newConditions;
                cardProps.conditions = newConditions;
                console.log('quickEffectConfirm', true);
            }
            setQuickEffectTiming(false);
            setChainConfirmFlag(false);
            // 置いてから発動する
            if (card.name == "ライトニング・ボルテックス") {
                const face = 'up'
                updateFields = await put(cardId, updateFields, fieldsSetter, playerId, face);
                updateFields = await discard(playerId, discardCardId, updateFields, updateFields.hand, fieldsSetter.setHand, updateFields.graveyard, fieldsSetter.setGraveyard)
                socket.emit('voltexActivate', { roomName, voltexId: cardId, discardCardId: discardCardId });
            } else {
                const face = 'up'
                updateFields = await put(cardId, updateFields, fieldsSetter, playerId, face);
                socket.emit('put', { roomName, cardId: cardId, face });
                updateFields = await payCost(socket, roomName, cardId, playerId, updateFields, fieldsSetter, discardCardId, setPlayerDamageValue)
            }
            if (card.name == "早すぎた埋葬" || card.name == "スケープゴート") {
                // スケゴ用に特殊召喚を使ったことにする
                updatefields.players[playerId].useReverseAndSpecialSummon = true;
                setPlayers(updateFields.players);

            }
            updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);
            await triggerEffectAndWait(socket, roomName, cardId);
            chainProps.setEffectTarget(null)
            card.effect.canUse = false;
            console.log('select props', selectTargetProps)
            const obj = await makeChainBlock(
                socket,
                roomName,
                cardId,
                playerId,
                opponentPlayerId,
                updateFields,
                fieldsSetter,
                effectProps,
                chainProps,
                chainConfirmFlag,
                setChainConfirmFlag,
                chainBlockCards,
                selectTargetProps,
                setEffecting,
                setSpellSpeed,
                setQuickEffectTiming,
                quickEffectStack,
                setQuickEffectStack,
                otherProps
            );
            // await sweep(socket, roomName, playerId, opponentPlayerId, fields, useCards);
            // console.log('usecards is ',useCards)
            // await effectResolution(socket, roomName, playerId, opponentPlayerId, fields, chainProps, useCards, setSpellSpeed, setQuickEffectTiming)
            console.log('チェーンブロック内のカード', chainProps.chainBlockCards)
            console.log(obj)
            // makeChainBlock内でチェックしてるからいらない
            // await sideEffectChain(socket, roomName, playerId, opponentPlayerId, obj.updateFields, fieldsSetter, effectProps, chainProps, chainConfirmFlag, setChainConfirmFlag, chainBlockCards, selectTargetProps, setEffecting, setSpellSpeed, setQuickEffectTiming)

            chainProps.setChainBlockCards([])
            let newConditions = conditions.filter((condition) => condition != "summoned" && condition != "attack");
            setConditions(newConditions);
            socket.emit('conditionRemove', { roomName, condition: ["summoned", "attack"] });
            // 一連の処理終了後に効果の発動があるか確認
            // await checkChainFlag(chainConfirmFlag);
            // クイックエフェクトの終了を通知
            if (players[playerId].turnPlayer) {
                console.log('quickEffectSelf' + quickEffectStack, true, obj.updateFields);
                socket.emit('quickEffectSelf', { roomName, fields: obj.updateFields, chainBlockCards: obj.useCardIds, status: true, quickEffectStack: quickEffectStack });
                setQuickEffectTiming(false);

            } else {
                let eventName = ""
                if (conditions.includes("phaseEnd")) {
                    eventName = "phaseEnd"
                }
                console.log('quickEffectConfirm' + quickEffectStack, true, obj.updateFields);
                socket.emit('quickEffectConfirm', { roomName, fields: obj.updateFields, chainBlockCards: obj.useCardIds, status: true, eventName: eventName, quickEffectStack: quickEffectStack });
            }
            socket.emit('chainCountMsgReset', { roomName });
 
            await getPriority(updateFields.players, setPlayers, playerId, opponentPlayerId);
            console.log('ハンドからの効果処理が終了しました。効果解決のあとの効果の発動をしますか', updateFields, fields)
            // await checkQuickEffect(spellTrapZone[playerId], quickEffectProps, setPlayers, socket, roomName, fields)
        }
        if (option == 'chainActivate') {
            if (card.name == "スケープゴート") {
                console.log('goats')
                updatefields.players[playerId].useGoats = true;
                setPlayers(updatefields.players);
            }
            // 発動前に対象の選択
            const selectTargetCardId = await selectTargetCard(socket, roomName, playerId, opponentPlayerId, fields, fieldsSetter, cardId, selectTargetProps, quickEffectAndChain)
            // 選ばなかったら辞める
            if (!selectTargetCardId) {
                return
            }
            await reverse(cardId, 'up');
            socket.emit('reverse', { roomName, cardId: cardId, face: 'up' });
            // if (conditions.includes('attack')) {
            //     setConditions(conditions.filter((condition) => condition != 'attack'))
            //     socket.emit('conditionRemove', { roomName, condition: ['attack'] });
            // }
            setChainConfirmFlag(false);
            chainProps.setEffectTarget(null)
            setSpellSpeed(1);
            let discardCardId = ''
            if (card.effect.cost == 'discard') {
                let targets = fields.hand[playerId];
                // ライトニング・ボルテックスの場合自身をコストにできないようにする
                if (card.name == "ライトニング・ボルテックス") {
                    targets = targets.filter((id) => id != cardId);
                }
                discardCardId = await asyncSelectCard(socket, cardId, targets, selectTargetProps);
                if (discardCardId == null) {
                    return
                }
            }
            updatefields = await payCost(socket, roomName, cardId, playerId, fields, fieldsSetter, discardCardId, setPlayerDamageValue)
            if (card.name == "早すぎた埋葬" || card.name == "リビングデッドの呼び声") {
                // スケゴ用に反転召喚を使ったことにする
                updatefields.players[playerId].useReverseAndSpecialSummon = true;
                setPlayers(updatefields.players)
            }
            updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);

            // 同族感染ウイルスは何度でも使える
            if (card.name != "同族感染ウイルス") {
                card.effect.canUse = false;
            }
            const effectProps = {
                cardId: cardId,
                players,
                setPlayers,
                playerId: playerId,
                opponentPlayerId: opponentPlayerId,
            };
            console.log('activate   chainprops', chainProps)
            await triggerEffectAndWait(socket, roomName, cardId);
            const activateObj = await activate(socket,
                roomName,
                cardId,
                playerId,
                opponentPlayerId,
                updatefields,
                fieldsSetter,
                effectProps,
                chainProps,
                chainConfirmFlag,
                setChainConfirmFlag,
                chainBlockCards,
                selectTargetProps,
                otherProps,
            );
            updatefields = activateObj.updateFields;
            updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);
            console.log('場からの効果処理が終了しました。効果解決のあとの効果の発動をしますか')
            // handleChain(fields.spellTrapZone, effectProps, setPlayers, playerId, socket, roomName, fields);

        }
        // 手札から速攻魔法でチェーンするとき用
        if (option == 'chainActivateFromHand') {
            if (card.name == "スケープゴート") {
                console.log('goats')
                updatefields.players[playerId].useGoats = true;
                setPlayers(updatefields.players);
            }
            // 発動前に対象の選択
            const selectTargetCardId = await selectTargetCard(socket, roomName, playerId, opponentPlayerId, fields, fieldsSetter, cardId, selectTargetProps, quickEffectAndChain)
            // 選ばなかったら辞める
            if (!selectTargetCardId) {
                return
            }
            // if (conditions.includes('attack')) {
            //     setConditions(conditions.filter((condition) => condition != 'attack'))
            //     socket.emit('conditionRemove', { roomName, condition: ['attack'] });
            // }
            setQuickEffectTiming(false);
            setChainConfirmFlag(false);
            chainProps.setEffectTarget(null)
            setSpellSpeed(1);
            const face = 'up'
            updatefields = await put(cardId, updatefields, fieldsSetter, playerId, face);
            socket.emit('put', { roomName, cardId: cardId, face });

            updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);
            
            card.effect.canUse = false;
            const effectProps = {
                cardId: cardId,
                players,
                setPlayers,
                playerId: playerId,
                opponentPlayerId: opponentPlayerId,
            };
            console.log('activate   chainprops', chainProps)
            await triggerEffectAndWait(socket, roomName, cardId);
            const activateObj = await activate(socket,
                roomName,
                cardId,
                playerId,
                opponentPlayerId,
                updatefields,
                fieldsSetter,
                effectProps,
                chainProps,
                chainConfirmFlag,
                setChainConfirmFlag,
                chainBlockCards,
                selectTargetProps,
                otherProps,
            );
            updatefields = activateObj.updateFields;
            updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);
            console.log('場からの効果処理が終了しました。効果解決のあとの効果の発動をしますか')
            // handleChain(fields.spellTrapZone, effectProps, setPlayers, playerId, socket, roomName, fields);

        }
        if (option == 'attack') {
            console.log('attack!!', cardId)
            // 自身の攻撃に対して状況限定で使う罠は無いから要らないかも
            let nowCondition = conditions;
            nowCondition.push('attack');
            chainProps.setActionMonster(cardId)
            const effectProps = {
                cardId: cardId,
                players,
                setPlayers,
                playerId: playerId,
                opponentPlayerId: opponentPlayerId,
            };
            // 相手にもconditionsの更新を通知
            setConditions(nowCondition);
            chainProps.conditions = nowCondition;
            let chainCards = [];
            updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);

            // イグユニの時は効果発動の確認
            updatefields = await attack(socket, roomName, cardId, players, setPlayers, playerId, opponentPlayerId, fields, fieldsSetter, chainProps, chainCards, setChainConfirmFlag, selectTargetProps, effectProps, 'attack', setEffecting, setSpellSpeed, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, otherProps);
            if (updatefields.decision) {
                // 勝敗が決していれば即座に返す 実際はdecisionObjが返される
                console.log('勝者は！！！', updatefields.winner)
                otherProps.setDecisionDuel(updatefields.winner);
                return updatefields;
            }
            socket.emit('chainCountMsgReset', { roomName });
            // 攻撃が終わったら戻す
            nowCondition = nowCondition.filter((condition) => condition != 'attack')
            setConditions(nowCondition);
            socket.emit('conditionRemove', { roomName, condition: ["attack"] });
            await getPriority(updatefields.players, setPlayers, playerId, opponentPlayerId);
            chainProps.setActionMonster('')
            chainProps.setAction('')
            console.log('あたっく終了')
        }
        if (option == 'SpecialSummon') {
            console.log('SpecialSummon')

            updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);
            let blackLusterChoice =  await blackLusterSummonHandle(socket, roomName, cardId, playerId, fields, fieldsSetter, selectTargetProps.setHoverCardId);
            if (blackLusterChoice == null) {
                await getPriority(updatefields.players, setPlayers, playerId, opponentPlayerId);
                return
            }
            // スケゴ用に反転召喚を使ったことにする
            updatefields.players[playerId].useReverseAndSpecialSummon = true;
            updatefields.players = await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);
            card.canChange = false;
            // await actionChainHandle(socket, roomName, playerId, opponentPlayerId, cardId, fields, fieldsSetter, [cardId], setChainConfirmFlag, chainProps, 'summon', setSpellSpeed, setQuickEffectTiming)
            await quickEffectConfirm(socket, roomName, setQuickEffectTiming, chainProps.setChainBlockCards, conditions, setConditions, updatefields, fieldsSetter, playerId, opponentPlayerId, 'summon', chainProps.setAction, cardId, chainProps.setActionMonster, quickEffectStack, setQuickEffectStack, otherProps);
            await getPriority(updatefields.players, setPlayers, playerId, opponentPlayerId);
            socket.emit('chainCountMsgReset', { roomName });
            let newConditions = conditions.filter((condition) => condition != "summoned");
            setConditions(newConditions);
            socket.emit('conditionRemove', { roomName, condition: ["summoned"] });
        }
        console.log(updatefields)
        // console.log(updatefields, JSON.stringify(updatefields))
        // if (players[playerId].turnPlayer) {
        //     await getPriority(updatefields.players, setPlayers, playerId, opponentPlayerId);
        // }
        chainProps.setActionMonster("");
        chainProps.setAction("");
        chainProps.setActivateCard("");
        setSpellSpeed(0);
    };


    const handleClickSelect = async (e) => {

        console.log('カード選択ハンドラ', selectTarget, playerId, allCards[cardId], targetCards, conditions)
        // console.log(card.controller ,playerId,
        //     phase,
        //     selectTargetFlag,
        //     player,
        //     spellSpeed,
        //     card.location,
        //     effecting,
        //     quickEffectTiming,
        //     chainConfirmFlag)
        // console.log(condition,
        //     player,
        //     card.effect.spellSpeed,spellSpeed,quickEffectTiming,
        //     card,
        //     (card.cardtype != 'Monster' || card.faceStatus != 'downDef'),
        //     (card.cardtype != 'Spell' || card.canChange),
        //     (card.cardtype != 'Trap' || (card.canChange && !JinzoFlag)),
        //     !effecting,
        //     !selectTargetFlag,
        //     card.location != 'hand',
        //     card.location != 'banishZone',
        //     card.location != 'deck',
        //     card.effect.canUse,
        //     canEnable,
        //     (card.location != 'graveyard' || card.name == 'キラースネーク'))
        console.log(players)
        console.log((card.effect.spellSpeed > spellSpeed && (card.effect.spellSpeed == 2 || !quickEffectTiming)))
        console.log(card.effect.spellSpeed, spellSpeed, card.effect.spellSpeed, quickEffectTiming, effecting, JSON.stringify(effecting), oppoChoicing, JSON.stringify(oppoChoicing))
        console.log(selectTargetFlag, JSON.stringify(conditions), condition);
        console.log(canEnable)
        console.log(typeof cardId)
        console.log(cardId)
        console.log(card.link.length > 0)
        console.log(card.link.some((cardId) => allCards[cardId].category == 'equip'));
        console.log(props.otherProps.animating)
        console.log(blackLusterCondition)
        console.log(
            (condition),
            player.priority,
            // 場のスペルスピードより早く、かつスペルスピードが2以上じゃなければクイックエフェクトタイミンでは使用不可 
            (card.effect.spellSpeed > spellSpeed || card.effect.triggerCondition == "battle"),
            (card.effect.spellSpeed > 1 || (phase == 'main1' || phase == 'main2') || card.effect.triggerCondition == "battle"),
            // モンスターは表側のみ使用可かつchainBlockCardが一枚以下のときのみ
            (card.cardtype != 'Monster' || (card.faceStatus != 'downDef' && chainBlockCards.length < 2)),
            // スペルスピード1の魔法は伏せたターンでも使える
            (card.cardtype != 'Spell' || card.canChange || card.effect.spellSpeed == 1),
            (card.cardtype != 'Trap' || (card.canChange && !JinzoFlag())),
            !effecting,
            !selectTargetFlag,
            card.location != 'hand',
            card.location != 'banishZone',
            card.location != 'deck',
            card.effect.canUse,
            // 開闢は発動じゃなくて召喚canEnableでを司っている
            ((card.name != 'カオス・ソルジャー －開闢の使者－' && canEnable) || (card.name == 'カオス・ソルジャー －開闢の使者－' && card.attackable)),
            (card.location != 'graveyard'),
            !props.otherProps.animating,
            !oppoChoicing,
            isMounted,
            !isCaution)
        
        console.log(player.turnPlayer,
            player.priority,
            card.controller == playerId,
            !effecting,
            !quickEffectTiming,
            !selectTargetFlag,
            !chainConfirmFlag,
            card.effect.canUse,
            (phase == 'main1' || phase == 'main2' || card.effect.spellSpeed == 2),
            canEnable,
            // && !animating
            !oppoChoicing,
            isMounted,
            !isCaution)
        
        console.log(chainConfirmFlag,
            card.cardtype === "Spell",
            player.turnPlayer,
            card.effect.spellSpeed > 1,
            card.category == "quick")
        console.log(chainProps.attackedTargetId != '' && allCards[chainProps.attackedTargetId] && allCards[chainProps.attackedTargetId].faceStatus != 'attack')
        console.log(chainProps.attackedTargetId != '' )
        console.log(allCards[chainProps.attackedTargetId])
        if (allCards[chainProps.attackedTargetId]) {
            console.log(allCards[chainProps.attackedTargetId].faceStatus != 'attack')
        }
        // console.log('root=',root)
        // カード選択時は選択されたこのカードをemit
        if (targetCards && targetCards.some(targetId => targetId == cardId)) {
            let updatePlayers = fields.players;
            updatePlayers[opponentPlayerId].priority = true;
            updatePlayers[playerId].priority = false;
            fieldsSetter.setPlayers(updatePlayers)

            console.log('たーげっとは', targetCards)
            setSelectTarget(cardId);
            setSelectTargetFlag(false);
            // await getPriority(fields.players, fieldsSetter.setPlayers, opponentPlayerId, playerId)
            socket.emit('selectCard', { cardId });
            setQuickEffectTiming(false);
            setChainConfirmFlag(false)
        }
        console.log('prevCardPosition', prevCardPosition, 'relativePrevPosition', relativePrevPosition, 'newCardPosition', newCardPosition)
    }
    // ホバー時
    const handleMouseEnter = () => {

        if ((allCards[cardId].controller == playerId && allCards[cardId].location != "deck") || (allCards[cardId].controller == opponentPlayerId && (allCards[cardId].faceStatus == "up" || allCards[cardId].faceStatus == "def" || allCards[cardId].faceStatus == "attack"))) {
            onHover(cardId);
        }
        // 手札などのアクティブ可能なカードの場合
        // クイックエフェクトタイミングまたはチェーン時は表示しない(直接表示)
        if (card.controller == playerId && (card.location == "hand" || card.location == "monsterZone" || (card.location == "spellTrapZone" && (!quickEffectTiming && !chainConfirmFlag)))) {
            // e.stopPropagation();
            // すでに選択されていれば再選択しない
            if (!cardInfomationDetailFlag) {
                if (card.location == "hand") {
                    // 専用のクラスをつける
                    // カードクリック時に上にみょこっと出す
                    setCardInfomationDetailClassName('open-card-infomation-detail');
                }
                // // ボタン表示コンポーネントを出現
                // handleDisplayCardInfomationDetail(cardId, infomationDetailProps);
                setCardInfomationDetailFlag(true)
            }
        }
    }
    // ホバー解除時
    const handleMouseLeave = () => {
        setCardInfomationDetailFlag(false)
        setCardInfomationDetailClassName('')
    }

    const cardRef = useRef(null);
    // console.log(card.id,'~~~~')
    // const prevCardPosition = card.position;

    // const newPosition = {
    //     prevController: card.controller,
    //     prevLocation: card.location
    // };
    // if (card.location == "monsterZone") {
    //     newPosition.prevNum = monsterZone[card.controller].findIndex(id => id == cardId);
    // } else if (card.location == "spellTrapZone") {
    //     newPosition.prevNum = spellTrapZone[card.controller].findIndex(id => id == cardId);
    // } else {
    //     newPosition.prevNum = null;
    // }
    const [prevCardPosition, setPrevCardPosition] = useState(card.position);
    const [relativePrevPosition, setRelativePrevPosition] = useState({ left: 0, top: 0 });
    const [newCardPosition, setNewCardPosition] = useState(null);
    // console.log(card.id, 'prevPosition', prevCardPosition)

    // スマホ時に除外ゾーンボタン上で消滅するアニメーションフラグ
    const [isExtinctionAnimation, setIsExtinctionAnimation] = useState(false);
    // スマホ用除外モンスターがアニメーション終了時にアンマウントするフラグ
    const [isUnMount, setIsUnMount] = useState(false); 

    // 位置変換関数の定義
    function viewportToRelative(prevCardPosition, elementRef) {
        // console.log('viewportToRelative!!!', prevCardPosition, elementRef.current)
        if (elementRef.current) {
            if (cardId == 1) {
                // console.log('viewportToRelative!!!', elementRef.current)
            }
            const rect = elementRef.current.getBoundingClientRect();
            // console.log(card.id, 'prevposition', viewportPosition, rect,card)
            // console.log('viewportToRelative', {
            //     left: viewportPosition.left - rect.left,
            //     top: viewportPosition.top - rect.top
            // }, rect)

            if (cardId == 1) {
                // console.log('viewportPosition', viewportPosition)
            }
            if (card.position == null || prevCardPosition == null) {
                // viewportPosition = {}
                // console.log(card.position, prevCardPosition)
                return {
                    left: 0,
                    top: 0
                };
            }
            // let relativeLeft = viewportPosition.left > rect.left ? viewportPosition.left - rect.left : rect.left - viewportPosition.left 
            // let relativeTop = viewportPosition.top > rect.top ? viewportPosition.top - rect.top : rect.top - viewportPosition.top 
            // return {
            //     left: relativeLeft,
            //     top: relativeTop
            // };

            // 前回の要素位置から現在の座標までの相対位置を計算
            let Elements = null;
            let fromRect = null;
            let fromElement = null;

            if (cardId == 1) {
                // console.log()
                // console.log('prevCardPosition', prevCardPosition, 'elementRef', elementRef, 'card.position', card.position);
            }
            if (prevCardPosition.prevLocation == "monsterZone" || prevCardPosition.prevLocation == "spellTrapZone") {
                // console.log('モンスターか魔法罠')
                // 要素番号から要素の何番目かを取得
                let elemetnNum = prevCardPosition.prevNum;
                // 前回のコントローラーが自分なら要素数+6相手なら+0
                let adjustNum = prevCardPosition.prevController == playerId ? 6 : 0
                // すべてのモンスターまたは魔法要素を取得
                Elements = prevCardPosition.prevLocation == "monsterZone" ? document.querySelectorAll('.monster-zone > div') : document.querySelectorAll('.spel-trap-zone > div')
                // console.log('モンスターか罠エレメント', Elements)
                // それぞれのゾーンの位置から正確な要素を取得
                fromElement = Elements[elemetnNum + adjustNum]
                // console.log('from element',fromElement)
                if (!fromElement) {
                    // console.log('要素がない！！！')
                    return {
                        left: 0,
                        top: 0
                    };
                }
                fromRect = fromElement.getBoundingClientRect();
            } else if (prevCardPosition.prevLocation == "deck") {
                Elements = document.querySelectorAll('.deck')
                fromElement = prevCardPosition.prevController == playerId ? Elements[1] : Elements[0];
                // console.log(Elements)
            } else if (prevCardPosition.prevLocation == "hand") {
                Elements = document.querySelectorAll('.hand')
                fromElement = prevCardPosition.prevController == playerId ? Elements[1] : Elements[0];
                // console.log(Elements)
            } else if (prevCardPosition.prevLocation == "graveyard") {
                Elements = document.querySelectorAll('.graveyard')
                fromElement = prevCardPosition.prevController == playerId ? Elements[1] : Elements[0];
                // console.log(Elements)
            } else if (prevCardPosition.prevLocation == "banishZone") {
                Elements = document.querySelectorAll('.banish-zone')
                fromElement = prevCardPosition.prevController == playerId ? Elements[1] : Elements[0];
                // console.log(Elements)
            } else {
                return {
                    left: 0,
                    top: 0
                };
            }
            if (cardId == 1) {
                // console.log(Elements)
            }
            // IDから自分か相手のものかを判断する
            // console.log(prevCardPosition.prevController, prevCardPosition, JSON.stringify(prevCardPosition), playerId, Elements.length, Elements)
            // fromElement = prevCardPosition.prevController == playerId ? Elements[1] : Elements[0];
            if (cardId == 1) {
                // console.log(fromElement)
            }
            if (!fromElement) {
                // console.log('要素がない！！！')

                return {
                    left: 0,
                    top: 0
                };
            }
            // 要素情報を取得
            fromRect = fromElement.getBoundingClientRect();

            // 要素の真ん中の座標を取得
            // const fromX = fromRect.left + fromRect.width / 2;
            // const fromY = fromRect.top + fromRect.height / 2;
            const fromX = fromRect.left + fromRect.width / 4;
            const fromY = fromRect.top;
            // console.log('viewportToRelative計算したよ!', fromX, fromY)
            // console.log('viewportToRelative計算したよ!', fromX - rect.left, fromY - rect.top)
            if ((fromX - rect.left >= -20 && fromX - rect.left <= 20) && (fromY - rect.top >= -20 && fromY - rect.top <= 20)) {
                // 初回時はや横向きでは多少のズレが発生するのでその場合は抑制
                return {
                    left: 0,
                    top: 0
                };
            }
            return {
                left: fromX - rect.left,
                top: fromY - rect.top
            };
            // return {
            //     left: viewportPosition.left - rect.left,
            //     top: viewportPosition.top - rect.top
            // };
        }
        // console.log('cardref.current is not exist')
        return { left: 0, top: 0 };
    }
    // newCardPositionが変更された時、それをprevCardPositionにセットする
    useEffect(() => {
        if (cardId == 1) {
            // console.log('newCardPosition is set', newCardPosition)
        }
        if (newCardPosition != null) {
            // console.log('newCardPositionが変更', newCardPosition)
            setPrevCardPosition(newCardPosition);
            card.position = newCardPosition;
        } else {
            setPrevCardPosition(card.position);
            // card.position = newCardPosition;
        }
    }, [newCardPosition]);

    // prevCardPositionの変換
    useLayoutEffect(() => {
        if (cardRef.current) {
            const newPosition = viewportToRelative(prevCardPosition, cardRef);
            if (cardId == 1) {
                // console.log()
                // console.log('prevCardPosition', prevCardPosition, 'cardRef', cardRef, 'rect', cardRef.current.getBoundingClientRect(), 'newPosition', newPosition)
            }
            if (card.position != null && newPosition != null) {
                // console.log('prevCardPosition', prevCardPosition, 'cardRef', cardRef, 'rect', cardRef.current.getBoundingClientRect(), 'newPosition', newPosition)
                setRelativePrevPosition(newPosition);
            } else {
                saveCardPosition()
            }
        }
        // console.log('[prevCardPosition, cardRef.current]')
    }, [prevCardPosition]);
    if (cardId == 1) {
        // console.log(relativePrevPosition)
    }
    // const isValidPosition = relativePrevPosition && !isNaN(relativePrevPosition.left) && !isNaN(relativePrevPosition.top) && card.position != null;

    // アニメーションの設定
    // const springProps = []
    const springProps = useSpring({
        from: card.position ? relativePrevPosition : { left: 0, top: 0 },
        to: { left: 0, top: 0 },
        config: {
            duration: 500,
            tension: 170,
            friction: 26
        },
        // アニメーションが終わったらこの関数を呼び出す
        onRest: () => {
            saveCardPosition()
            if (isMobile && card.location == "banishZone") {
                setIsExtinctionAnimation(true)
            }
        }
    });
    const extinctionAnimation = useSpring({
        to: {
            opacity: isExtinctionAnimation ? 0 : 1, // 縮小して消えるアニメーション
            transform: isExtinctionAnimation ? 'scale(0)' : 'scale(1)'
        },
        from: { opacity: 1, transform: 'scale(1)' },
        config: { duration: 500 },
        onRest: () => {
            setIsUnMount(true)
        }
    });
    const appearanceAnimation = useSpring({
        to: {
            opacity: 1, // 縮小して消えるアニメーション
            transform: 'scale(1)'
        },
        from: { opacity: 0, transform: 'scale(0)' },
        config: { duration: 500 },
        onRest: () => {
            console.log('Current card state at onRest:', card,JSON.stringify(card));
            if (card.name == "羊トークン" && card.location == 'monsterZone' && card.position.prevLocation != 'monsterZone') {
                console.log('appearanceAnimation end', card, JSON.stringify(card));
                card.position.prevController = card.controller
                card.position.prevLocation = card.location
                console.log(monsterZone, JSON.stringify(monsterZone), monsterZone[card.controller].findIndex(id => id == cardId))
                card.position.prevNum = monsterZone[card.controller].findIndex(id => id == cardId);
            }
        }
    });
    
    // const springProps = isValidPosition
    //     ? useSpring({
    //         from: relativePrevPosition,
    //         to: { left: 0, top: 0 },
    //         config: {
    //             duration: 500,
    //             tension: 170,
    //             friction: 26
    //         },
    //         onRest: saveCardPosition
    //     })
    //     : useSpring({
    //         opacity:1,
    //         config: {
    //             duration: 0
    //         },
    //         onRest: saveCardPosition
    //     });

    // // コンポーネントの初回レンダリング時に実行
    // useEffect(() => {
    //     console.log('rendering saveCardPosition')
    //     saveCardPosition();
    // }, []); 

    // カードの現在の位置を取得して、card.position に保存する関数
    function saveCardPosition() {
        if (cardRef.current) {
            // カードの位置が前回と変わったら位置を更新してアニメーション開始
            if (card.position != null && (card.position.prevLocation != card.location || card.position.prevController != card.controller)) {
                // カードの位置情報を更新
                // カードのコントローラーとどのゾーンにいたか保存
                card.position.prevController = card.controller
                card.position.prevLocation = card.location
                // モンスター魔法罠であればどの位置にいたかも保存
                if (card.location == "monsterZone") {
                    card.position.prevNum = monsterZone[card.controller].findIndex(id => id == cardId);
                } else if (card.location == "spellTrapZone") {
                    console.log(card, JSON.stringify(card), spellTrapZone, JSON.stringify(spellTrapZone), spellTrapZone[card.controller], JSON.stringify(spellTrapZone[card.controller]))
                    card.position.prevNum = spellTrapZone[card.controller].findIndex(id => id == cardId);
                } else {
                    // それ以外はnull
                    card.position.prevNum = null;
                }
                if (cardId == 1) {
                    // console.log('Saved position:', card.position);
                }

                // もし現在の位置と違うのであればアニメーションが必要
                // setPrevCardPosition(newPosition);
                const newPosition = viewportToRelative(card.position, cardRef);
                setRelativePrevPosition(newPosition);
            }

            // const ref = cardRef.current.getBoundingClientRect();
            // const newPosition = {
            //     left: ref.left,
            //     top: ref.top
            // };
            // if (cardId == 1) {
                
            //     // console.log(newPosition, card.position)
            // }
            // if (card.position == null || newPosition.left !== card.position.left || newPosition.top !== card.position.top) {
            //     card.position = newPosition;
            //     if (cardId == 1) {
            //         console.log('Saved position:', card.position);
            //     }
            //     // ここでuseStateを使ってprevCardPositionを更新
            //     setPrevCardPosition(newPosition);
            //     // card.position = newCardPosition;
                
            // }
        }
    }
    useEffect(() => {
        const cardElement = cardRef.current;
        const parentElement = cardElement?.parentElement;  // カードの親要素を取得

        if (parentElement) {
            // 変更を検知するコールバック
            const mutationCallback = (mutationsList) => {
                for (let mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        // 子要素の追加や削除が検知された場合

                        const cardRect = cardElement.getBoundingClientRect();
                        const newPosition = {
                            prevController: card.controller,
                            prevLocation: card.location
                        };
                        if (card.location == "monsterZone") {
                            newPosition.prevNum = monsterZone[card.controller].findIndex(id => id == cardId);
                        } else if (card.location == "spellTrapZone") {
                            newPosition.prevNum = spellTrapZone[card.controller].findIndex(id => id == cardId);
                        } else {
                            newPosition.prevNum = null;
                        }

                        if (cardId == 1) {
                            // console.log('card position 1', newCardPosition, newPosition, card.position)
                        }
                        // console.log('card position ', newCardPosition, newPosition, card.position)
                        // 前回の位置と異なる場合はアニメーションをトリガー
                        // 多分ここが一番最初
                        if (card.position != null && (newPosition.prevController !== card.position.prevController || newPosition.prevLocation !== card.position.prevLocation || newPosition.prevNum != card.position.prevNum)) {
                            if (cardId == 1) {
                                // console.log('set prevposition...', newPosition, card.position)
                            }
                            // console.log('set prevposition...', newPosition, card.position)
                            setNewCardPosition(newPosition);
                        } else {
                            if (cardId == 1) {
                                // console.log('save position...', newPosition)
                            }
                            // console.log('save position...', newPosition)
                            card.position = newPosition
                        }
                    }
                }
            };

            // MutationObserverの初期化
            const observer = new MutationObserver(mutationCallback);

            // 親要素の子リストの変更を監視
            observer.observe(parentElement, { childList: true });

            // コンポーネントのアンマウント時に監視を停止
            return () => {
                observer.disconnect();
            };
        }
    }, [cardRef.current, card.location, card.controller]);

    // useEffect(() => {
    //     console.log('ポジション更新～')
    //     if (cardRef.current) {
    //         const newPosition = viewportToRelative(card.position, cardRef);
    //         console.log('新しいポジションは',newPosition)
    //         setRelativePrevPosition(newPosition);
    //     }
    //     // if (card.position == null) {
    //     //     card.position = {
    //     //         prevController: card.controller,
    //     //         prevLocation: card.location,
    //     //         prevNum: null
    //     //     }
    //     // }
    // }, [card.location, card.controller]);
    const handleDisplayCardListProps = {
        deck: deck[playerId],
        playerId: playerId,
        owner: playerId,
        locate: "deck",
        setHoverCardId: selectTargetProps.setHoverCardId,
        isMobile: otherProps.isMobile,
        fields: fields,
    }
    // アクションボタン用コンポーネント用のプロップス
    const infomationDetailProps = {
        playerId: playerId,
        phase: phase,
        selectTargetFlag: selectTargetFlag,
        player: player,
        spellSpeed: spellSpeed,
        effecting: effecting,
        quickEffectTiming: quickEffectTiming,
        chainConfirmFlag: chainConfirmFlag,
        animating: props.otherProps.animating,
        oppoChoicing: oppoChoicing,
        isMounted: isMounted,
        isCaution: isCaution,
        monsterZoneVacant: monsterZone[playerId].some(id => id == null),
        canEnable: canEnable,
        blackLusterCondition: blackLusterCondition,
        swordOfLightFlag: swordOfLightFlag,
        JinzoFlag: JinzoFlag,
        advanceSummonCondition: advanceSummonCondition,
        condition: condition,
        spellTrapZoneVacant: spellTrapZone[playerId].some(id => id == null),
        setCardInfomationDetailFlag: setCardInfomationDetailFlag,
        setCardInfomationDetailClassName: setCardInfomationDetailClassName,
        handleOptionClick: handleOptionClick,
        chainBlockCardsLength: chainBlockCards.length,
        handleDisplayCardListProps: handleDisplayCardListProps,
    }
    // モバイルのカード効果文の追加メッセに必要なprops
    const mobileDisplayCardsPropsFields = {
        playerId: playerId,
        opponentPlayerId: opponentPlayerId,
        players: players,
        deck: deck,
        monsterZone: monsterZone,
    }
    // スマホ時に除外用アニメーションを行ったらアンマウント
    if (isUnMount) {
        return null;
    }

    return (
        <animated.div
            className='card-component'
            style={{ ...extinctionAnimation }}
            onClick={() => handleClickSelect()}
            onMouseEnter={() => {
                handleMouseEnter()
            }}
            onMouseLeave={() => { onHover(null), handleMouseLeave() }}
        >
            <animated.div
                ref={cardRef}
                className={`card ${shuffleClassName} ${cardInfomationDetailClassName}`}
                style={(card.name == "羊トークン" && card.position.prevLocation != 'monsterZone') ? { ...appearanceAnimation } : { position: 'relative', ...springProps, ...style }}
                onMouseEnter={() => {
                    handleMouseEnter()
                }}
                onMouseLeave={() => { onHover(null), handleMouseLeave() }}
            >
            {/* {card.controller == playerId && (card.location == "spellTrapZone" || card.location == "MonsterZone") && (card.faceStatus == "down" || card.faceStatus == "downDef") && <p>{card.name}</p>} */}
                {/* カードの表示 */}
                <div className='card-infomation-detail-wrapper' id={`card-infomation-detail-wrapper-${cardId}`}>
                    {cardInfomationDetailFlag && (
                        <CardInfomationDetail cardId={cardId} infomationDetailProps={infomationDetailProps} mobileDisplayCardsPropsFields={mobileDisplayCardsPropsFields}/>
                    )}
                </div>
            <div className={`card-img-wrapper ${isTriggered ? 'card-scale-animation' : ''}`} style={trollStyles}>
                {/* 墓地と除外ゾーンのカードはもう全部表側表示 */}
                    {(card.faceStatus == "up" || (card.location == 'hand' && card.controller == playerId) || card.location == 'graveyard' || card.location == 'banishZone' || graveyard[playerId].includes(cardId) || banishZone[playerId].includes(cardId)) ?
                        <img src={card.picture} alt={card.name} className={`card-pic faceUp ${targetCards.includes(cardId) ? 'card-glow' : ''} ${(effectTarget == cardId && card.location != 'graveyard') ? 'effect-targeted' : ''}`} />
                : (card.faceStatus == "downDef") ?
                    <div className='card-down-def card-down-fade'>
                                < img src={cardModel.faceDown} alt='card' className={`card-pic faceDown def ${targetCards.includes(cardId) ? 'card-glow' : ''} ${card.controller == playerId ? 'fade-pic' : ''} ${effectTarget == cardId ? 'effect-targeted' : ''}`} />
                        {/* 自分のカードなら表面とフェード */}
                        {card.controller == playerId && (
                            < img src={card.picture} alt={card.name} className={`card-pic def fade-pic fade-pic-up`} style={fadeDelay}/>
                        )}
                    </div>
                : (card.faceStatus == "down") ?
                    <div className='card-down'>
                            < img src={cardModel.faceDown} alt='card' className={`card-pic faceDown ${targetCards.includes(cardId) ? 'card-glow' : ''} ${card.controller == playerId ? 'fade-pic' : ''} ${effectTarget == cardId ? 'effect-targeted' : ''}`} />
                        {/* 自分のカードなら表面とフェード */}
                        {card.controller == playerId && (
                            < img src={card.picture} alt={card.name} className={`card-pic fade-pic fade-pic-up`} style={fadeDelay}/>
                        )}
                    </div>
                : (card.faceStatus == "attack") ?
                        <img src={card.picture} alt={card.name} className={`card-pic attack ${targetCards.includes(cardId) ? 'card-glow' : ''} ${effectTarget == cardId ? 'effect-targeted' : ''}`} />
                : (card.faceStatus == "def") ?
                        <img src={card.picture} alt={card.name} className={`card-pic def ${targetCards.includes(cardId) ? 'card-glow' : ''} ${effectTarget == cardId ? 'effect-targeted' : ''}`} />
                        : < img src={cardModel.faceDown} alt='card' className={`card-pic faceDown ${targetCards.includes(cardId) ? 'card-glow' : ''} ${effectTarget == cardId ? 'effect-targeted' : ''}`} />
                    }
                {/* リンクしているカードがあり、かつそれが表向きスペルトラップでかつ、自身がモンスターゾーンまたわモンスターゾーンにいたらカウンター表示 */}
                {(card.link.length > 0 && card.link.some((cardId) => allCards[cardId].category == 'equip' && allCards[cardId].location == "spellTrapZone" && allCards[cardId].faceStatus == "up") && (monsterZone[opponentPlayerId].concat(monsterZone[playerId]).includes(cardId) || spellTrapZone[opponentPlayerId].concat(spellTrapZone[playerId]).includes(cardId))) ? (
                    <div className='card-overlay counter'>
                        ⊕
                    </div>
                ) : card.counter == 1 ? (
                    <div className='card-overlay counter' >
                        ①
                    </div>
                ) : card.counter == 2 ? (
                    <div className='card-overlay counter' >
                        ②
                    </div>
                ) : card.counter == 3 ? (
                    <div className='card-overlay counter' >
                        ③
                    </div>
                ) : null

                }
            </div>

            {card.location == "monsterZone" && (card.controller == playerId || card.faceStatus != 'downDef') && (
                <div className='battle-status'>
                    {card.faceStatus == "attack" && (
                        <div className='attack-status'>
                            攻{card.attack}
                        </div>
                    )}
                    {(card.faceStatus == "def" || card.faceStatus == "downDef") && (
                        <div className='defense-status'>
                            守{card.defense}
                        </div>
                    )}
                </div>
                )}
                {/* キラスネは墓地からはみ出すようにボタン表示 */}
                {card.controller == playerId
                    && (condition)
                    && player.priority
                    // 場のスペルスピードより早く、かつスペルスピードが2以上じゃなければクイックエフェクトタイミンでは使用不可 
                    && (card.effect.spellSpeed > spellSpeed && (card.effect.spellSpeed == 2 || !quickEffectTiming || card.effect.triggerCondition == "ignition" || card.name == 'キラースネーク'))
                    && (card.name == 'キラースネーク' && phase == 'stanby')
                    && (card.location == "graveyard")
                    && !effecting
                    && !selectTargetFlag
                    && card.effect.canUse
                    // 開闢は発動じゃなくて召喚canEnableでを司っている
                    && !props.otherProps.animating
                    && !oppoChoicing
                    && isMounted
                    && !isCaution
                    && (
                        <div className='activate action-button sinister-SSerpent'>
                            {!chainConfirmFlag && <button className='sinister-SSerpent-activate' onClick={(event) => handleOptionClick("activate", event)}>発動</button>}
                        </div>
                        )
                }


            {/* <div className='action-buttons'>
                        
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
                    && !props.otherProps.animating
                    && !oppoChoicing
                    && isMounted
                    && !isCaution
                    && (
                    <div className='summons action-button'>
                        {card.level <= 4 && !player.useGoats && monsterZone[playerId].some(id => id == null) &&  <button onClick={() => handleOptionClick("summon")}>Summon</button>}
                        {card.level <= 4 && monsterZone[playerId].some(id => id == null) && <button onClick={() => handleOptionClick("set")}>Set</button>}
                        {card.level > 4 && card.level < 8 && advanceSummonCondition() && !player.useGoats && monsterZone[playerId].some(id => id == null) && <button onClick={() => handleOptionClick("AdvanceSummon")}>Advance Summon</button>}
                        {card.level > 4 && card.level < 8 && advanceSummonCondition() && monsterZone[playerId].some(id => id == null) && <button onClick={() => handleOptionClick("AdvanceSet")}>Advance Set</button>}
                    </div>
                    )}
                {card.name == 'カオス・ソルジャー －開闢の使者－'
                    && card.controller == playerId
                    && monsterZone[playerId].some(id => id == null)
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
                    && !props.otherProps.animating
                    && !oppoChoicing
                    && isMounted
                    && !isCaution
                    && (
                        <div className='special-summon action-button'>
                        {card.name == 'カオス・ソルジャー －開闢の使者－' && blackLusterCondition && !player.useGoats && <button onClick={() => handleOptionClick("SpecialSummon")}>Special Summon</button>}
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
                    && !props.otherProps.animating
                    && !oppoChoicing
                    && isMounted
                    && !isCaution
                    && (
                        <div className='change action-button'>
                        {card.faceStatus != 'downDef' && <button onClick={() => handleOptionClick("change")}>change</button>}
                        {card.faceStatus == 'downDef' && <button onClick={() => handleOptionClick("reverse")}>reverse</button>}
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
                    && !props.otherProps.animating
                    && !oppoChoicing
                    && isMounted
                    && !isCaution
                    && (
                        <div className='attack action-button'>
                            <button onClick={() => handleOptionClick("attack")}>attack</button>
                        </div>
                    )*/}

                {/* クイックエフェクトのときはカードに重なるように発動ボタンを表示 */}
                {card.controller == playerId
                    && (condition)
                    && player.priority
                    // 場のスペルスピードより早く、かつスペルスピードが2以上じゃなければクイックエフェクトタイミンでは使用不可 
                    && (card.effect.spellSpeed > spellSpeed && (card.effect.spellSpeed == 2 || !quickEffectTiming || card.effect.triggerCondition == "ignition"))
                    && (card.effect.spellSpeed > 1 || (phase == 'main1' || phase == 'main2'))
                    // モンスターは表側のみ使用可かつchainBlockCardが一枚以下のときのみ
                    && (card.cardtype != 'Monster' || (card.faceStatus != 'downDef' && chainBlockCards.length < 2))
                    && (card.cardtype != 'Spell' || card.canChange || card.effect.spellSpeed == 1)
                    && (card.cardtype != 'Trap' || (card.canChange && !JinzoFlag()))
                    && !effecting
                    && !selectTargetFlag
                    && card.location != 'hand'
                    && card.location != 'banishZone'
                    && card.location != 'deck'
                    && card.effect.canUse
                    // 開闢は発動じゃなくて召喚canEnableでを司っている
                    && (canEnable || card.name == 'カオス・ソルジャー －開闢の使者－')
                    && (card.location != 'graveyard')
                    && !props.otherProps.animating
                    && !oppoChoicing
                    && isMounted
                    && !isCaution
                    && (
                        <div className='activate absolute-action-button'>
                        {chainConfirmFlag && (card.effect.spellSpeed > 1 || (card.cardtype == 'Monster' && player.turnPlayer)) && <button className='chain-avtivate quick-effect-activate' onClick={(event) => handleOptionClick("chainActivate", event)}>発動</button>}
                        {!chainConfirmFlag && quickEffectTiming && <button className='activate quick-effect-activate' onClick={(event) => handleOptionClick("activate", event)}>発動</button>}
                    </div>
                    )}
                {/* イグユニ専用 */}
                {card.controller == playerId
                    && player.priority
                    && card.name == "イグザリオン・ユニバース"
                    && (chainProps.action == "battleStep" || conditions.includes('battleStep'))
                    // 守備限定
                    && (chainProps.attackedTargetId != '' && allCards[chainProps.attackedTargetId] && (allCards[chainProps.attackedTargetId].faceStatus == 'def' || allCards[chainProps.attackedTargetId].faceStatus == 'downDef'))
                    && (card.faceStatus != 'downDef' && chainBlockCards.length < 2)
                    && !effecting
                    && !selectTargetFlag
                    && card.location == 'monsterZone'
                    && card.effect.canUse
                    && chainProps.activateCard == cardId
                    && !props.otherProps.animating
                    && !oppoChoicing
                    && isMounted
                    && !isCaution
                    && (
                        <div className='activate absolute-action-button'>
                        {!chainConfirmFlag && quickEffectTiming && <button className='activate quick-effect-activate' onClick={(event) => handleOptionClick("activate", event)}>発動</button>}
                    </div>
                    )}
                    
                {/*card.location == 'hand'
                    && player.turnPlayer
                    && player.priority
                    && card.controller == playerId
                    && !effecting
                    && !quickEffectTiming
                    && !selectTargetFlag
                    && !chainConfirmFlag
                    && card.effect.canUse
                    && (phase == 'main1' || phase == 'main2')
                    && spellTrapZone[playerId].some(id => id == null)
                    && canEnable
                    && !props.otherProps.animating
                    && !oppoChoicing
                    && isMounted
                    && !isCaution
                    && (
                        <div className='hand-activate action-button'>
                        {card.cardtype === "Spell" && <button onClick={() => handleOptionClick("activateFromHand")}>Activate</button>}
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
                    && spellTrapZone[playerId].some(id => id == null)
                    && !props.otherProps.animating
                    && !oppoChoicing
                    && isMounted
                    && !isCaution
                    && (
                        <div className='put action-button'>
                        {(card.cardtype === "Spell" || card.cardtype === "Trap") && <button onClick={() => handleOptionClick("put")}>Put</button>}
                    </div>
                        )}
                </div> */}

            </animated.div>
        </animated.div>
    );
};

export default Card;