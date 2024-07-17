import React, { useState, useEffect, useReducer, useLayoutEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { allCards, cardEffects, heavyStormEffectDetail, torrentialTributeEffectDetail } from './models/cards';
import { BoardComponent } from './component/board';
import { Card, Player } from './models/models';
import {
    drawCard, handleDraw, normalSummon, put, activate, change, reverse, destroy, cleanUp, sweep, betray, effectResolution, getPriority, quickEffectConfirm, drawCards, discard, reduceLifePoint,
    handReturnToDeck, endTurn, openCards, salvage, reduceLifePointBoth, revive, handleDrawCards, actionChain, monsterBanish, deckBanish, deckDestruction, graveyardToBanish, attackIncrease, searcher,
    shuffle, deckToGraveyard, blackLusterSummon, gameStart, quickEffectConfirmOppo, fiberJar, discardSelf, returnSnatchMonsters, chainSelf, quickEffectConfirmSelf, triggerEffectAndWait, waitBothPlayer, visualizeEffectAndWait, unlink, awaitTime, sideEffectChain, matchDataUpdate, resetMatchDataUseEffect, checkDecision, adjustHand, discardCards, selectTargetCard,
} from './gamePlayLogic';
import { CardSelectionComponent, selectCards } from './component/selectCard'
import { confirmChain, handleChain } from './component/chainConfirm';
import { handleQuickEffect } from './component/quickEffect';
import { choice } from './component/choice';
import { handleDisplayAllCards } from './component/displayAllCards';
import { handleMessagePopUp } from './component/messagePopUp';
import DisplayCard from './component/displayCard';
import { castImmutable } from '@reduxjs/toolkit/node_modules/immer';
import MessageLog from './component/messageLog';
import './css/slideTextAnimation.css';
import { handleDisplayPrivateCards } from './component/displayPrivateCards';
import displayArrow from './component/arrow';
import Result from './component/result';
import { useCautionSelect } from './component/caution';

import '../src/css/qAndA.css'
import QAndA from './component/qAndA';

export let root = null;

const Duel = ({ socket, roomName, players, setPlayers, playerId, opponentPlayerId, firstPlayer, secondPlayer, endGame }) => {
    // カードの情報が参照型なので分ける

    // 0から49までのインデックスのカードを更新
    if (allCards[1].owner === '') {
        for (let i = 1; i < 50; i++) {
            let card = allCards[i];
            if (card) {
                card.owner = firstPlayer;
                card.controller = firstPlayer;
                card.position = {
                    prevController: card.controller,
                    prevLocation: card.location,
                    prevNum: null
                }
            }
        }
    
        // 50から99までのインデックスのカードを更新
        for (let i = 51; i < 100; i++) {
            let card = allCards[i];
            if (card) {
                card.owner = secondPlayer;
                card.controller = secondPlayer;
                card.position = {
                    prevController: card.controller,
                    prevLocation: card.location,
                    prevNum: null
                }
            }
        }
    }

    const array1 = Array.from({ length: 40 }, (_, i) => i + 1);
    const array2 = Array.from({ length: 40 }, (_, i) => i + 51);

    const [deck, setDeck] = useState({
        [firstPlayer]: array1,
        [secondPlayer]: array2,
    });
    const [hand, setHand] = useState({
        [firstPlayer]: [],
        [secondPlayer]: [],
    });
    const [graveyard, setGraveyard] = useState({
        [firstPlayer]: [],
        [secondPlayer]: [],
    });
    const [monsterZone, setMonsterZone] = useState({
        [firstPlayer]: [null, null, null, null, null],
        [secondPlayer]: [null, null, null, null, null],
    });
    const [spellTrapZone, setSpellTrapZone] = useState({
        [firstPlayer]: [null, null, null, null, null],
        [secondPlayer]: [null, null, null, null, null],
    });
    const [banishZone, setBanishZone] = useState({
        [firstPlayer]: [],
        [secondPlayer]: [],
    });
    const [extinctionGoats, setExtinctionGoats] = useState({
        [firstPlayer]: [null, null, null, null, null],
        [secondPlayer]: [null, null, null, null, null],
    });
    useEffect(() => {
        console.log(extinctionGoats)
    }, [extinctionGoats])
    const turnCountReducer = (state, action) => {
        switch (action.type) {
            case 'INCREMENT':
                return state + 1;
            default:
                return state;
        }
    };
    // ターン数
    const [turnCount, dispatchTurnCount] = useReducer(turnCountReducer, 1);
    // ターン移行用関数
    const handleNextTurn = () => {
        dispatchTurnCount({ type: 'INCREMENT' });
    };
    // 現在の状態。triggerConditionと比較する,複数の状態を保持し、そのうちのどれかと合致するか
    const [conditions, setConditions] = useState(['draw']);


    const initialPhase = 'draw';

    const phaseReducer = (state, action) => {
        switch (action.type) {
            case 'NEXT_PHASE':
                if (state === 'draw') {
                    console.log('now draw')
                    setConditions(['stanby']);
                    return 'stanby';
                } else if (state === 'stanby') {
                    setConditions(['main1', 'normalSpell', 'ignition']);
                    return 'main1';
                } else if (state === 'main1') {
                    setConditions(['battle']);
                    return 'battle';
                } else if (state === 'battle') {
                    setConditions(['main2', 'normalSpell', 'ignition']);
                    return 'main2';
                } else if (state === 'main2') {
                    setConditions(['end']);
                    return 'end';
                } else if (state === 'end') {
                    setConditions(['change']);
                    return 'change';
                } else if (state === 'change') {
                    setConditions(['draw']);
                    handleNextTurn()
                    return 'draw';
                }
                return state;
            case 'TO_END':
                setConditions(['end']);
                return 'end'
            case 'TO_DRAW':
                // handleNextTurn()
                setConditions(['draw']);
                return 'draw'
            default:
                return state;
        }
    };
    // 現在のフェイズ
    const [phase, dispatchPhase] = useReducer(phaseReducer, initialPhase);

    const initialStep = 'start';

    const stepReducer = (state, action) => {
        switch (action.type) {
            case 'NEXT_STEP':
                if (state === 'start') {// スタートステップ
                    return 'battle';
                } else if (state === 'battle') {// バトルステップ開始
                    return 'damage';
                } else if (state === 'damage') {// ダメージステップ開始時、ダメージ計算前
                    return 'damageCalc';
                } else if (state === 'damageCalc') {// ダメージ計算時
                    return 'damageConfirm';
                } else if (state === 'damageConfirm') {// ダメージ計算後
                    return 'battleConfirm';
                } else if (state === 'battleConfirm') {// 戦闘結果解決時
                    return 'battleEnd';
                } else if (state === 'battleEnd') {// ダメステ終了
                    return 'end';
                } else if (state === 'end') {// エンドステップ(バトルステップ終了)
                    return 'battle';
                }
                return state;
            case 'TO_END':
                return 'end'
            case 'TO_START':
                return 'start'
            default:
                return state;
        }
    };
    // バトルフェイズ内の現在のステップ
    const [step, dispatchStep] = useReducer(stepReducer, initialStep);
    // 現在のスペルスピード
    const [spellSpeed, setSpellSpeed] = useState(0);
    // 効果処理中か否か
    const [effecting, setEffecting] = useState(false);
    // チェーン中で効果発動出来るか否か
    const [chainConfirmFlag, setChainConfirmFlag] = useState(false);
    // カードの効果発動者
    const [activater, setActivater] = useState('');
    // 発動したカード
    const [activateCard, setActivateCard] = useState('');
    // 現在のチェーンブロック内のカード
    const [chainBlockCards, setChainBlockCards] = useState([]);
    // 現在チェーン中の返しイベント名、カード名+プレイヤーID
    const [eventName, setEventName] = useState('');
    // 効果の対象として選択したカード
    const [selectTarget, setSelectTarget] = useState('');
    // 現在が効果対象として選択している状態か否か
    const [selectTargetFlag, setSelectTargetFlag] = useState(false);
    // 現在効果処理をしているカード
    const [effectingCard, setEffectingCard] = useState('');
    // 効果処理時に選択可能なカードの配列
    const [targetCards, setTargetCards] = useState([]);
    // クイックエフェクトの発動確認フラグ
    const [quickEffectFlag, setQuickEffectFlag] = useState(false);
    // クイックエフェクトタイミングか否か、コンポーネントの表示
    const [quickEffectTiming, setQuickEffectTiming] = useState(false);
    // クイックエフェクト時に何をしたかを表す変数
    const [action, setAction] = useState('');
    // 攻撃モンスターや召喚したモンスター
    const [actionMonster, setActionMonster] = useState('');
    // 攻撃時のオプション。再選択や連続攻撃の情報
    const [attackOption, setAttackOption] = useState('');
    // マウスが乗せられているうカード
    const [hoverCardId, setHoverCardId] = useState(null);
    // カードの説明
    const [description, setDescription] = useState('');
    // 攻撃先
    const [attackedTargetId, setAttackedTargetId] = useState('')
    // クイックエフェクトのスタック数(クイックエフェクトの何層目か)
    const [quickEffectStack, setQuickEffectStack] = useState(0);
    // 効果解決時のカードエフェクト
    const [effectVisible, setEffectVisible] = useState(false);
    // カードエフェクトのカードID
    const [visualizeCardId, setVisualizeCardId] = useState('');
    // カードの発動時のエフェクト
    const [triggeredCardId, setTriggeredCardId] = useState(null);
    // フェイズ開始アニメーションの実行フラグ
    const [showPhase, setShowPhase] = useState(false);
    // 相手が選択中の旨を表示する管理変数
    const [oppoChoicing, setOppoChoicing] = useState(false);
    // 攻撃時回転管理変数
    const [animationSpinFlag, setAnimationSpinFlag] = useState(false);
    // アニメーション中かどうかの管理変数。trueならカード使用不可
    const [animating, setAnimating] = useState(false);
    // キラースネークの自動発動オプション
    const [sinisterSerpentOption, setSinisterSerpentOption] = useState('check')
    // 勝敗管理変数 勝者のIDが入る
    const [decisionDuel, setDecisionDuel] = useState('');
    // マウントされているか確認。レンダリング直後に一瞬表示されちゃうやつの防止
    const [isMounted, setIsMounted] = useState(false);
    // 回復やダメージを受けたときの値
    const [playerDamageValue, setPlayerDamageValue] = useState(0);
    const [opponentPlayerDamageValue, setOpponentPlayerDamageValue] = useState(0);
    // 手札が溢れてい警告などの警告系の表示フラグ
    const [isCaution, setIsCaution] = useState(false)
    // スマホかどうかの判別
    const [isMobile, setIsMobile] = useState(window.matchMedia("(max-width: 1200px)").matches);
    // QandAを開いているか
    const [opneQandA, setOpneQandA] = useState(false);
    // なんの端末で開いているか
    const [userAgent, setUserAgent] = useState(navigator.userAgent);
    // 効果対象
    const [effectTarget, setEffectTarget] = useState(null);
    
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
                if (monsterZone[opponentPlayerId].some((id) => id != null && (allCards[id].name == "霊滅術師カイクウ" && allCards[id].faceStatus != "downDef") && (allCards[hoverCardId].location == "deck" || allCards[hoverCardId].location == "hand"))) {
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

    const effectVisualize = (cardId) => {
        console.log('効果処理エフェクト！',cardId)
        setEffectVisible(true);
        setVisualizeCardId(cardId)
        setTimeout(() => {
            setEffectVisible(false)
            setAnimating(false)
        }, 999); // アニメーション時間に合わせる 
    };
    const effectTrigger = (cardId) => {
        console.log('効果発動エフェクト！', cardId)
        const card = allCards[cardId];
        const cardName = card.name
        const cardController = card.controller;
        // 効果発動時に発動したカードを記録
        switch (cardName) {
            case '強欲な壺':
                if (cardController == players[playerId].matchData.firstPlayer) {
                    players[playerId].matchData.firstPlayer_PotOfGreed += 1;
                } else {
                    players[playerId].matchData.secondPlayer_PotOfGreed += 1;
                }
                break;
            case '強引な番兵':
                if (cardController == players[playerId].matchData.firstPlayer) {
                    players[playerId].matchData.firstPlayer_theForcefulSentry += 1;
                } else {
                    players[playerId].matchData.secondPlayer_theForcefulSentry += 1;
                }
                break;
            case '押収':
                if (cardController == players[playerId].matchData.firstPlayer) {
                    players[playerId].matchData.firstPlayer_confiscation += 1;
                } else {
                    players[playerId].matchData.secondPlayer_confiscation += 1;
                }
                break;
            case '苦渋の選択':
                if (cardController == players[playerId].matchData.firstPlayer) {
                    players[playerId].matchData.firstPlayer_PainfulChoice += 1;
                } else {
                    players[playerId].matchData.secondPlayer_PainfulChoice += 1;
                }
                break;
            case '心変わり':
                if (cardController == players[playerId].matchData.firstPlayer) {
                    players[playerId].matchData.firstPlayer_changeOfHeart += 1;
                } else {
                    players[playerId].matchData.secondPlayer_changeOfHeart += 1;
                }
                break;
            case '強奪':
                if (cardController == players[playerId].matchData.firstPlayer) {
                    players[playerId].matchData.firstPlayer_snatchSteal += 1;
                } else {
                    players[playerId].matchData.secondPlayer_snatchSteal += 1;
                }
                break;
            case '聖なる魔術師':
                // 効果発動した時点で使用済みにする
                card.effect.canUse == false
                if (cardController == players[playerId].matchData.firstPlayer) {
                    players[playerId].matchData.firstPlayer_magicianOfFaith += 1;
                } else {
                    players[playerId].matchData.secondPlayer_magicianOfFaith += 1;
                }
                break;
            case 'お注射天使リリー':
                if (cardController == players[playerId].matchData.firstPlayer) {
                    players[playerId].matchData.firstPlayer_injectionFairyLily += 1;
                } else {
                    players[playerId].matchData.secondPlayer_injectionFairyLily += 1;
                }
                break;
            case 'ファイバーポッド':
                if (cardController == players[playerId].matchData.firstPlayer) {
                    players[playerId].matchData.firstPlayer_fiberJar += 1;
                } else {
                    players[playerId].matchData.secondPlayer_fiberJar += 1;
                }
                break;
            case '天空騎士パーシアス':
                if (cardController == players[playerId].matchData.firstPlayer) {
                    players[playerId].matchData.firstPlayer_airknightParshath += 1;
                } else {
                    players[playerId].matchData.secondPlayer_airknightParshath += 1;
                }
                break;
            default:
                break;
        }
        // setTimeout((console.log('wait...')), 999); // アニメーション時間に合わせる
        setTriggeredCardId(cardId)
        setTimeout(() => {
            setTriggeredCardId(null)
            setAnimating(false)
        }, 999); // アニメーション時間に合わせる
    };
    const triggerShowPhaseAnimation = async () => {
        setShowPhase(true);
        // return
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                setShowPhase(false)
                resolve()
            }, 1500); // 1.5秒後に非表示 
        })
    };

    useEffect(() => {
        console.log('actionMonster', actionMonster)
    }, [actionMonster]);
    // とりあえず要らなさそう
    // const [game, setGame] = useState({
    //     players: players,
    //     deck: deck,
    //     hand: hand,
    //     graveyard: graveyard,
    //     monsterZone: monsterZone,
    //     spellTrapZone: spellTrapZone,
    //     banishZone: banishZone,
    //     phase:phase,
    // });

    const gameState = {
        players: players,
        deck: deck,
        hand: hand,
        graveyard: graveyard,
        monsterZone: monsterZone,
        spellTrapZone: spellTrapZone,
        banishZone: banishZone,
        phase: phase,
    }
    
    const cardProps = {
        socket: socket,
        roomName:roomName,
        hand: hand,
        setHand: setHand,
        deck: deck,
        setDeck: setDeck,
        monsterZone: monsterZone,
        setMonsterZone: setMonsterZone,
        spellTrapZone: spellTrapZone,
        setSpellTrapZone: setSpellTrapZone,
        graveyard: graveyard,
        setGraveyard: setGraveyard,
        banishZone: banishZone,
        setBanishZone: setBanishZone,
        game: gameState,
        playerId: playerId,
        players: players,
        setPlayers: setPlayers,
        opponentPlayerId: opponentPlayerId,
        phase: phase,
        step: step,
        spellSpeed: spellSpeed,
        setSpellSpeed: setSpellSpeed,
        effecting: effecting,
        setEffecting: setEffecting,
        conditions: conditions,
        setConditions: setConditions,
        extinctionGoats: extinctionGoats,
        setExtinctionGoats: setExtinctionGoats,
    }
    // const fields = {
    //     hand: hand,
    //     setHand: setHand,
    //     deck: deck,
    //     setDeck: setDeck,
    //     monsterZone: monsterZone,
    //     setMonsterZone: setMonsterZone,
    //     spellTrapZone: spellTrapZone,
    //     setSpellTrapZone: setSpellTrapZone,
    //     graveyard: graveyard,
    //     setGraveyard: setGraveyard,
    //     banishZone: banishZone,
    //     setBanishZone: setBanishZone,
    // }
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

    const chainProps = {
        chainConfirmFlag: chainConfirmFlag,
        setChainConfirmFlag: setChainConfirmFlag,
        activater: activater,
        setActivater: setActivater,
        activateCard:activateCard,
        setActivateCard: setActivateCard,
        chainBlockCards: chainBlockCards,
        setChainBlockCards: setChainBlockCards,
        eventName: eventName,
        setEventName: setEventName,
        setEffecting: setEffecting,
        action: action,
        setAction: setAction,
        phase: phase,
        dispatchPhase: dispatchPhase,
        actionMonster: actionMonster,
        setActionMonster: setActionMonster,
        conditions: conditions,
        setConditions: setConditions,
        setSpellSpeed: setSpellSpeed,
        attackedTargetId: attackedTargetId,
        setAttackedTargetId: setAttackedTargetId,
        effectTarget: effectTarget,
        setEffectTarget: setEffectTarget,
    }

    const selectTargetProps = {
        selectTarget: selectTarget,
        setSelectTarget: setSelectTarget,
        selectTargetFlag: selectTargetFlag,
        setSelectTargetFlag: setSelectTargetFlag,
        effectingCard: effectingCard,
        setEffectingCard: setEffectingCard,
        targetCards: targetCards,
        setTargetCards: setTargetCards,
        actionMonster: actionMonster,
        attackOption: attackOption,
        setAttackOption: setAttackOption,
        setHoverCardId: setHoverCardId,
        setActionMonster: setActionMonster,
        chainBlockCards: chainBlockCards,
        setOppoChoicing: setOppoChoicing,
        turnCount: turnCount,
        setPlayerDamageValue: setPlayerDamageValue,
        setOpponentPlayerDamageValue: setOpponentPlayerDamageValue,
        isMobile: isMobile,
        setExtinctionGoats: setExtinctionGoats,
        setEffecting: setEffecting,
    }
    const mobileDisplayCardsPropsFields = {
        playerId: playerId,
        opponentPlayerId: opponentPlayerId,
        players: players,
        deck: deck,
        monsterZone: monsterZone,
    }
    const otherProps = {
        oppoChoicing: oppoChoicing,
        setOppoChoicing: setOppoChoicing,
        animationSpinFlag: animationSpinFlag,
        animating: animating,
        setAnimating: setAnimating,
        setDecisionDuel: setDecisionDuel,
        turnCount: turnCount,
        playerDamageValue: playerDamageValue,
        setPlayerDamageValue: setPlayerDamageValue,
        opponentPlayerDamageValue: opponentPlayerDamageValue,
        setOpponentPlayerDamageValue: setOpponentPlayerDamageValue,
        isCaution: isCaution,
        isMobile: isMobile,
        extinctionGoats: extinctionGoats,
        mobileDisplayCardsPropsFields: mobileDisplayCardsPropsFields
    }

    const props = {
        setPlayers: setPlayers,
        chainProps: chainProps,
        selectTargetProps: selectTargetProps,
        quickEffectTiming: quickEffectTiming,
        setQuickEffectTiming: setQuickEffectTiming,
        quickEffectStack: quickEffectStack,
        setQuickEffectStack: setQuickEffectStack,
        otherProps: otherProps,
    }

    const visualizeEffect = {
        effectVisible: effectVisible,
        setEffectVisible: setEffectVisible,
        visualizeCardId: visualizeCardId,
        setVisualizeCardId: setVisualizeCardId,
        effectVisualize: effectVisualize,
        triggeredCardId: triggeredCardId,
    }




    // フェイズ移行用関数
    const handleNextPhase = async (quickEffectStack) => {
        let oppoQuickeffect = false;
        let updatefields = fields;
        console.log(conditions)
        console.log(JSON.stringify(conditions))

        updatefields.players = await getPriority(players, setPlayers, opponentPlayerId, playerId);
        socket.emit('addActionMonster', { roomName, actionMonster: '', action: '' });
        let eventName = "phaseEnd"
        setOppoChoicing(true)
        switch (phase) {
            case 'draw':
                oppoQuickeffect = await quickEffectConfirmOppo(socket, roomName, [...conditions, 'phaseEnd'], updatefields, fieldsSetter, playerId, opponentPlayerId, eventName, quickEffectStack);
                console.log(oppoQuickeffect)
                break;
            case 'stanby':
                oppoQuickeffect = await quickEffectConfirmOppo(socket, roomName, [...conditions, 'phaseEnd'], updatefields, fieldsSetter, playerId, opponentPlayerId, eventName, quickEffectStack);
                console.log(oppoQuickeffect)
                break;
            case 'main1':
                oppoQuickeffect = await quickEffectConfirmOppo(socket, roomName, [...conditions, 'phaseEnd'], updatefields, fieldsSetter, playerId, opponentPlayerId, eventName, quickEffectStack);
                console.log(oppoQuickeffect)
                break;
            case 'battle':
                oppoQuickeffect = await quickEffectConfirmOppo(socket, roomName, [...conditions, 'phaseEnd'], updatefields, fieldsSetter, playerId, opponentPlayerId, eventName, quickEffectStack);
                console.log(oppoQuickeffect)
                break;
            case 'main2':
                oppoQuickeffect = await quickEffectConfirmOppo(socket, roomName, [...conditions, 'phaseEnd'], updatefields, fieldsSetter, playerId, opponentPlayerId, eventName, quickEffectStack);
                console.log(oppoQuickeffect)
                break;
            case 'end':
                oppoQuickeffect = await quickEffectConfirmOppo(socket, roomName, [...conditions, 'phaseEnd'], updatefields, fieldsSetter, playerId, opponentPlayerId, eventName, quickEffectStack);
                console.log(oppoQuickeffect)
                break;
        }
        if (await checkDecision(oppoQuickeffect.fields.players, oppoQuickeffect.fields.deck)) {
            setEffecting(true)
            return true;
        }
        const action = { type: 'NEXT_PHASE' }
        if (!oppoQuickeffect.status) {
            setEffecting(true)
            setOppoChoicing(false);
            dispatchPhase(action);
            socket.emit('changePhase', { roomName, changePhase: 'NEXT_PHASE', phase: phase })
            return true
        }
        setOppoChoicing(false)
        return false
    };
    // エンドフェイズ移行用関数
    const handleEndPhase = async () => {
        let updatefields = fields
        if (updatefields.hand[playerId].length >= 7) {
            setIsCaution(true)
            // 手札が7枚以上あればエンドフェイズに移行していいか聞く
            const cautionResult = await useCautionSelect();
            setIsCaution(false)
            if (!cautionResult) {
                // ダメなら矯正終了
                return
            }
        }

        let eventName = "phaseEnd"
        updatefields.players = await getPriority(players, setPlayers, opponentPlayerId, playerId);
        console.log(conditions)
        socket.emit('addActionMonster', { roomName, actionMonster: '', action: '' });
        setOppoChoicing(true)
        let oppoQuickeffect = await quickEffectConfirmOppo(socket, roomName, [...conditions, 'phaseEnd'], updatefields, fieldsSetter, playerId, opponentPlayerId, eventName, quickEffectStack);
        console.log(oppoQuickeffect)

        if (!oppoQuickeffect.status) {
            setEffecting(true)
            setOppoChoicing(false);
            dispatchPhase({ type: 'TO_END' });
            socket.emit('changePhase', { roomName, changePhase: 'TO_END', phase: phase })
        }

    };


    // バトルフェイズ時ステップ以降用関数
    const handleNextStep = () => {
        dispatchStep({ type: 'NEXT_STEP' });
    };
    // バトルフェイズ時関数
    const handleBattleEnd = () => {
        dispatchStep({ type: 'TO_END' });// バトル終了時(他のモンスター攻撃用)
    };
    // バトルフェイズ時関数
    const handleBattlePhaseEnd = () => {
        dispatchStep({ type: 'TO_START' });// バトルフェイズ終了時
    };
    
    
    useEffect(() => {
        setIsMounted(true);
        // 画面の幅に基づいてisMobileの状態を更新
        function handleResize() {
            setIsMobile(window.matchMedia("(max-width: 1200px)").matches);
        }
        window.addEventListener('resize', handleResize);
        handleResize(); // 初期ロード時にもチェック
        // 中央合わせはモバイル関係なしに行ってもいいかも？
        // document.getElementById('oppo-hand').scrollIntoView({
        //     behavior: "instant", // アニメーション効果を"smooth"に設定
        //     block: "start", // 垂直方向の位置合わせ
        //     inline: "center" // 水平方向の位置合わせ
        // });
        const attackIncreaseHandler = async (data) => {
            await attackIncrease(data.cardId, data.value);
        }
        const selectOppoHandler = async (data) => {
            setOppoChoicing(false);
            const cardId = await selectCards(data.selectArray, 1, setHoverCardId, data.cardId, playerId);
            setOppoChoicing(true);
            socket.emit('selectOppoEnd', { roomName, cardId });

        }
        const putCounterHandler = async (data) => {
            allCards[data.cardId].counter = 1;
            allCards[data.cardId].effect.canUse = true;
        }
        const removeCounterHandler = async (data) => {
            allCards[data.cardId].counter = -1;
            allCards[data.cardId].effect.canUse = false;
        }

        const startUpHandler = async (data) => {
            await gameStart(socket, roomName, data.updatefields, fieldsSetter, playerId, opponentPlayerId);

        }

        const messagePopUpHandler = async (data) => {
            handleMessagePopUp(data.message);
        }
        const effectUseHandler = (data) => {
            allCards[data.cardId].effect.canUse = false
        }

        const setAttackedTargetIdHandler = (data) => {
            console.log('setAttackedTargetIdHandler', setAttackedTargetIdHandler)
            setAttackedTargetId(data.targetCardId)
        }
        const effectVisualizeHandler = (data) => {
            effectVisualize(data.cardId);
        }
        const effectTriggerHandler = (data) => {
            effectTrigger(data.cardId);
        }
        const linkHandler = async (data) => {
            console.log(data)
            console.log(allCards[data.linkCardId])
            allCards[data.linkCardId].link = [...allCards[data.linkCardId].link, data.targetCardId]

            console.log(data.linkCardId, 'のリンク先は', data.targetCardId, allCards[data.linkCardId])
        }
        const unlinkHandler = (data) => {
            unlink(data.cardId, data.unlinkCardId);
        }
        const displayPrivateCardsHandler = async (data) => {
            await handleDisplayPrivateCards(playerId, opponentPlayerId, data.fields, setOppoChoicing, setHoverCardId, isMobile);
            socket.emit('checkPrivateCards', { roomName });
        }
        let timerId = null; // タイマーIDを保持する変数
        const handleAnimating = () => {
            console.log('animating...')
            setAnimating(true)
            // setTimeoutを設定し、タイマーIDを保存
            timerId = setTimeout(() => {
                setAnimating(false);
            }, 999); // アニメーション時間に合わせる
        }
        const handleDecision = (data) => {
            setDecisionDuel(data.decisionObj.winner);
        }
        const handleNowChoicing = () => {
            setOppoChoicing(true);
        }
        const handleUsedEffect = (data) => {
            allCards[data.effectUsedCardId].effect.canUse = false;
        }
        
        socket.on('attackIncrease', attackIncreaseHandler)
        socket.on('selectOppo', selectOppoHandler)
        socket.on('putCounter', putCounterHandler)
        socket.on('removeCounter', removeCounterHandler)
        socket.on('startUp', startUpHandler);
        socket.on('messagePopUp', messagePopUpHandler)
        socket.on('effectUse', effectUseHandler)
        socket.on('setAttackedTargetId', setAttackedTargetIdHandler)
        socket.on('effectVisualize', effectVisualizeHandler)
        socket.on('effectTrigger', effectTriggerHandler)
        socket.on('link', linkHandler);
        socket.on('unlink', unlinkHandler)
        socket.on('displayPrivateCards', displayPrivateCardsHandler)
        socket.on('animating', handleAnimating)
        socket.on('decision', handleDecision)
        socket.on('nowChoicing', handleNowChoicing)
        socket.on('usedEffect', handleUsedEffect)
        
        return () => {
            setIsMounted(false); // コンポーネントがアンマウントされたときに更新

            socket.off('attackIncrease', attackIncreaseHandler)
            socket.off('selectOppo', selectOppoHandler)
            socket.off('putCounter', putCounterHandler)
            socket.off('startUp', startUpHandler);
            socket.off('removeCounter', removeCounterHandler)
            socket.off('messagePopUp', messagePopUpHandler)
            socket.off('effectUse', effectUseHandler)
            socket.off('setAttackedTargetId', setAttackedTargetIdHandler)
            socket.off('effectVisualize', effectVisualizeHandler)
            socket.off('effectTrigger', effectTriggerHandler);
            socket.off('link', linkHandler);
            socket.off('unlink', unlinkHandler);
            socket.off('displayPrivateCards', displayPrivateCardsHandler);
            socket.off('animating', handleAnimating)
            socket.off('decision', handleDecision)
            socket.off('nowChoicing', handleNowChoicing)
            socket.off('usedEffect', handleUsedEffect)


            window.removeEventListener('resize', handleResize);
            if (timerId !== null) {
                clearTimeout(timerId);
            }
            
        }
    }, []);

    useLayoutEffect(() => {
        // document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=0.5');
        // document.querySelector('.board-wrapper-wrapper').style.zoom = '0.5'; // 0.5は縮小レベルです
        // console.log(document.getElementById('oppo-hand'))
        // document.getElementById('oppo-hand').scrollIntoView({
        //     behavior: "block", // アニメーション効果を"smooth"に設定
        //     block: "center", // 垂直方向の位置合わせ
        //     inline: "center" // 水平方向の位置合わせ
        // });
        return () => {};
    }, []);



    useEffect(() => {


        // 既に含まれている場合のことを考慮していない
        const conditionAddHandler = async (data) => {
            const newConditions = [...conditions, ...data.condition];
            setConditions(newConditions);
        }
        // 一個だけ外す
        const conditionRemoveHandler = async (data) => {
            console.log(conditions, data);
            const newConditions = conditions.filter(condition => !data.condition.includes(condition));
            console.log(newConditions);
            setConditions(newConditions);
        }
        socket.on('conditionAdd', conditionAddHandler);
        socket.on('conditionRemove', conditionRemoveHandler);
        
        return () => {
            socket.off('conditionAdd', conditionAddHandler);
            socket.off('conditionRemove', conditionRemoveHandler);
        };
    }, [conditions]);

    useEffect(() => {
        const reduceLifePointHandler = async (data) => {
            if (data.playerId == playerId) {
                console.log('player reduce LP',data.value)
                await reduceLifePoint(players, setPlayers, data.playerId, data.value, setPlayerDamageValue);
            } else {
                console.log('opponentPlayer reduce LP', data.value)
                await reduceLifePoint(players, setPlayers, data.playerId, data.value, setOpponentPlayerDamageValue);
            }
        }
        const reduceLifePointBothHandler = async (data) => {
            await reduceLifePointBoth(players, setPlayers, playerId, opponentPlayerId, data.value, setPlayerDamageValue, setOpponentPlayerDamageValue);
        }

        const useCardDataHandle = (data) => {
            // console.log('players updated', players)

            const cardId = data.cardId
            const cardName = allCards[data.cardId].name
            const cardController = allCards[data.cardId].controller
            console.log(cardController, players[playerId].matchData.firstPlayer, (cardController == players[playerId].matchData.firstPlayer))
            switch (cardName) {
                // 手札破壊のみをカウント
                case '首領・ザルーグ':
                    if (cardController == players[playerId].matchData.firstPlayer) {
                        players[playerId].matchData.firstPlayer_donZaloog_hand += 1;
                    } else {
                        players[playerId].matchData.secondPlayer_donZaloog_hand += 1;
                    }
                    break;
                // たけしは誘発効果もあるからここで
                case '魂を削る死霊':
                    if (cardController == players[playerId].matchData.firstPlayer) {
                        players[playerId].matchData.firstPlayer_spiritReaper += 1;
                    } else {
                        players[playerId].matchData.secondPlayer_spiritReaper += 1;
                    }
                    break;
                // 以下は召喚カウント
                case '天空騎士パーシアス':
                    if (cardController == players[playerId].matchData.firstPlayer) {
                        players[playerId].matchData.firstPlayer_airknightParshath_summon += 1;
                    } else {
                        players[playerId].matchData.secondPlayer_airknightParshath_summon += 1;
                    }
                    break;
                case '人造人間－サイコ・ショッカー':
                    if (cardController == players[playerId].matchData.firstPlayer) {
                        players[playerId].matchData.firstPlayer_Jinzo_summon += 1;
                    } else {
                        players[playerId].matchData.secondPlayer_Jinzo_summon += 1;
                    }
                    break;
                case 'カオス・ソルジャー －開闢の使者－':
                    if (cardController == players[playerId].matchData.firstPlayer) {
                        players[playerId].matchData.firstPlayer_blackLusterSoldier_summon += 1;
                    } else {
                        players[playerId].matchData.secondPlayer_blackLusterSoldier_summon += 1;
                    }
                    break;
                default:
                    break;
            }
        }

        socket.on('reduceLP', reduceLifePointHandler)
        socket.on('reduceLPBoth', reduceLifePointBothHandler)
        socket.on('useCardData', useCardDataHandle)
        
        
        
        return () => {
            socket.off('reduceLP', reduceLifePointHandler)
            socket.off('reduceLPBoth', reduceLifePointBothHandler)
            socket.off('useCardData', useCardDataHandle)

        }
    }, [players]);


    useEffect(() => {
        const quickEffectHandler = async (data) => {
            console.log('quickEffectHandler', data, oppoChoicing)
            console.log(data)
            setSpellSpeed(1);
            console.log(data, quickEffectStack)
            setQuickEffectStack(data.quickEffectStack);
            
            await getPriority(players, setPlayers, playerId, opponentPlayerId);
            // クイックエフェクト中は起動効果を使えないようにする
            setConditions(data.conditions.filter(condition => condition != "ignition"));
            setOppoChoicing(false);
            if (players[playerId].turnPlayer || fields.spellTrapZone[playerId].some(id => id != null && allCards[id].faceStatus == "down") || (phase == "stanby" && fields.monsterZone[playerId].includes((cardId) => cardId != null && allCards[cardId].name == "キラースネーク"))) {
                console.log('quick effect spell trap is exist', fields.spellTrapZone[playerId], fields.spellTrapZone[playerId].length)
                setQuickEffectTiming(true);
            } else {
                // setQuickEffectTiming(true);
                console.log('quick effect spell trap is none')
                if (players[playerId].turnPlayer) {
                    console.log('quickEffectSelf', data.quickEffectStack)
                    if ((phase == "main1" || phase == "main2") && !data.conditions.includes("ignition")) {
                        // 起動効果が使えるタイミングならクイックエフェクト終了時に戻す
                        setConditions([...data.conditions, "ignition"]);
                    } else {
                        // 使えないタイミングなら元に戻す
                        setConditions(data.conditions);
                    }
                    socket.emit('quickEffectSelf', { roomName, status: false, fields: fields, quickEffectStack: data.quickEffectStack });
                } else {
                    let eventName = "";
                    if (data.conditions.includes('phaseEnd')) {
                        eventName = "phaseEnd";
                    }
                    console.log('quickEffectConfirm', data.quickEffectStack)
                    socket.emit('quickEffectConfirm', { roomName, status: false, eventName: eventName, fields: fields, quickEffectStack: data.quickEffectStack });
                    setOppoChoicing(true);
                    // フェイズ終了のときはフェイズ終了タイミングを削除
                    if (data.conditions.includes('phaseEnd')) {
                        setConditions(data.conditions.filter((condition) => condition != 'phaseEnd'))
                    }
                }
                await getPriority(players, setPlayers, opponentPlayerId, playerId);
                setQuickEffectTiming(false);
                setSpellSpeed(0)
            }

        }
       
        socket.on('quickEffect', quickEffectHandler);        
        return () => {
            socket.off('quickEffect', quickEffectHandler);
        }
    }, [players, spellTrapZone, monsterZone, quickEffectStack, extinctionGoats]);

    useEffect(() => {
        // 相手がシャッフルしたときは自分側でシャッフルせずに相手のを受け取る
        const deckShuffledHandler = async (data) => {
            console.log(data)
            setDeck(data.updateDeck);
        }
        socket.on('deckShuffled', deckShuffledHandler)
        return () => {
            socket.off('deckShuffled', deckShuffledHandler)
        }
    }, [deck]);

    useEffect(() => {
        const drawHandler = () => drawCard(fields, fieldsSetter, opponentPlayerId);
        const drawCardsHandler = async (num) => await drawCards(socket, roomName, deck, hand, setHand, setDeck, opponentPlayerId, num)
        const promiseDrawHandler = async (data) => {
            console.log('promise drowa', data)
            await resetMatchDataUseEffect(playerId, opponentPlayerId, data.updatefields.players);
            await awaitTime(2000)
            console.log("After 2 seconds");
            let updatefields = data.updatefields
            
            let drawObj = await drawCards(socket, roomName, updatefields.deck, updatefields.hand, setHand, setDeck, playerId, data.num);
            drawObj = await drawCards(socket, roomName, drawObj.updatedDeck, drawObj.updatedHand, setHand, setDeck, opponentPlayerId, data.num);
            
            updatefields.deck = drawObj.updatedDeck
            updatefields.hand = drawObj.updatedHand


            console.log('promiseDrawEnd', { roomName, updatefields, eventName: data.eventName })
            if (!(data.eventName.includes(playerId))) {
                console.log('not includes id')
                socket.emit('promiseDrawEnd', { roomName, updatefields, eventName:data.eventName });
            }
        }
        const searchHandler = async (data) => {
            await searcher(data.playerId, fields, fieldsSetter, data.cardId);
        }

        const deckToGraveyardHandler = async (data) => {
            await deckToGraveyard(fields, fieldsSetter, data.targets);
        }

        socket.on('draw', drawHandler);
        socket.on('drawCards', drawCardsHandler);
        socket.on('promiseDraw', promiseDrawHandler);
        socket.on('search', searchHandler);
        socket.on('deckToGraveyard', deckToGraveyardHandler);
        
        return () => {
            socket.off('draw', drawHandler);
            socket.off('drawCards', drawCardsHandler);
            socket.off('promiseDraw', promiseDrawHandler);
            socket.off('search', searchHandler);
            socket.off('deckToGraveyard', deckToGraveyardHandler);
        };
    }, [deck, hand]);
    
    useEffect(() => {
        console.log('updated monsterZone', monsterZone);
        if (Object.values(monsterZone).flat().length != 10) {
            console.log('モンスターゾーンの長さがおかしい!!')
        }
        const betrayHandler = async (data) => {
            console.log('betray data',data)
            const updateMonsterZone = await betray(data.steeler, data.victim, fields, fieldsSetter, data.targetCardId)
            console.log(playerId,'betray monsterzone',updateMonsterZone)
        }

        const lilyHandler = async (data) => {
            const lilyEffectChoice = await choice(data.cardId, data.fields);
            if (lilyEffectChoice) {
                await triggerEffectAndWait(socket, roomName, data.cardId)
            }
            // 効果発動のみを聞き、攻撃側で効果処理
            // let updateFields = data.fields
            // if (lilyEffectChoice) {
            //     const card = allCards[data.cardId]
            //     await triggerEffectAndWait(socket, roomName, data.cardId)
            //     updateFields = await cardEffects[card.effect.effectDetails[0]](socket, roomName, data.cardId, playerId, opponentPlayerId, data.fields, fieldsSetter, selectTargetProps);
            // }
            // 使ったかどうかを返す
            socket.emit('lilyEnd', { roomName, eventName: data.eventName, updateFields: lilyEffectChoice });
        }
        const goatsHandler = async (data) => {
            console.log("goats",data)
            let updateMonsterZone = data.updateMonsterZone
            let goatsNumber = data.goatsNumber
            const activatePlayerId = data.activatePlayerId
            console.log(fields.monsterZone, JSON.stringify(fields.monsterZone))
            console.log(monsterZone,JSON.stringify(monsterZone))
            // 場の羊トークンを取得
            const allMonster = updateMonsterZone[playerId].concat(updateMonsterZone[opponentPlayerId]).filter((id) => id != null);
            const existGoats = allMonster.filter((id) => id != null && allCards[id].name == "羊トークン");
            let goatsCount = 0
            for (let i = 0; i < updateMonsterZone[activatePlayerId].length; i++) {
                // 空きスロットに要素を追加
                if (updateMonsterZone[activatePlayerId][i] === null) {
                    while (existGoats.includes(goatsNumber)) {
                        console.log(goatsNumber, 'はすでにあるよ')
                        goatsNumber++; // 次の要素の値を更新
                    }
                    console.log(goatsNumber)
                    updateMonsterZone[activatePlayerId][i] = goatsNumber;
                    allCards[goatsNumber].location = 'monsterZone';
                    allCards[goatsNumber].faceStatus = 'def';
                    allCards[goatsNumber].controller = activatePlayerId;
                    goatsCount++;
                    if (goatsCount == 4) {
                        break
                    }
                    goatsNumber++; // 次の要素の値を更新
                }
            }
            // updateMonsterZone[activatePlayerId] = [...updateMonsterZone[activatePlayerId], goatsNumber, goatsNumber + 1, goatsNumber + 2, goatsNumber + 3];
            console.log(updateMonsterZone, JSON.stringify(updateMonsterZone))

            fieldsSetter.setMonsterZone(updateMonsterZone);
        }
        const displayArrowHandler = async (data) => {
            const root = await displayArrow(playerId, monsterZone, data.attackCardId, data.targetCardId);
            socket.on('offArrow', () => {
                root.unmount()
                socket.off('offArrow');
            })
        }

        socket.on('betray', betrayHandler);
        socket.on('lily', lilyHandler)
        socket.on('goats', goatsHandler)
        socket.on('displayArrow', displayArrowHandler)
        
        
        return () => {
            socket.off('betray', betrayHandler);
            socket.off('lily', lilyHandler)
            socket.off('goats', goatsHandler)
            socket.off('displayArrow', displayArrowHandler)

        };
    }, [monsterZone]);
    
    useEffect(() => {
        if (Object.values(spellTrapZone).flat().length != 10) {
            console.log('魔法罠ゾーンがおかしい!!')
        }
        const openCardsHandler = async (data) => {
            // if (allCards[data.useCardId].name == "光の護封剣") {
            //     allCards[data.useCardId].counter = 1;
            // }
            await openCards(data.cardIds)
            console.log('open', data.cardIds)
        }
        socket.on('openCards', openCardsHandler);
        
        
        return () => {
            socket.off('openCards', openCardsHandler);
        };
    }, [spellTrapZone]);
    
    useEffect(() => {
        const discardHandler = async (data) => {
            // const card = await findCard(null, gameState, data.discardCardId, 'hand');
            await discard(data.playerId, data.discardCardId, fields, hand, setHand, graveyard, setGraveyard);
        }
        const discardCardsHandler = async (data) => {
            await discardCards(data.playerId, hand, setHand, graveyard, setGraveyard, data.targets);
        }
        const handReturnToDeckHandler = async (data) => {
            // const card = await findCard(playerId, gameState, data.cardId, 'hand');
            await handReturnToDeck(data.playerId, data.cardId, fields, hand, setHand, deck, setDeck);
        }
        socket.on('discard', discardHandler);
        socket.on('discardCards', discardCardsHandler);
        socket.on('handReturnToDeck', handReturnToDeckHandler);
        
        return () => {
            socket.off('discard', discardHandler);
            socket.off('discardCards', discardCardsHandler);
            socket.off('handReturnToDeck', handReturnToDeckHandler);
        };
    }, [hand, graveyard]);
    
    useEffect(() => {
        console.log('graveUpdated', graveyard)
        const salvageHandler = async (data) => {
            allCards[data.cardId].faceStatus = 'none';
            await salvage(data.playerId, fields, fieldsSetter, data.cardId);
        }
        socket.on('salvage', salvageHandler);

        return () => {
            socket.off('salvage', salvageHandler);
        };
    }, [graveyard, hand]);

    useEffect(() => {
        
        const voltexActivateHandler = async (data) => {
            let updatefields = fields
            console.log('voltexActivate', data)
            const voltexId = data.voltexId;
            const discardCardId = data.discardCardId;

            updatefields = await put(voltexId, updatefields, fieldsSetter, opponentPlayerId, "up");
            updatefields = await discard(opponentPlayerId, discardCardId, updatefields, updatefields.hand, setHand, updatefields.graveyard, setGraveyard)
        }
        socket.on('voltexActivate', voltexActivateHandler);

        return () => {
            socket.off('voltexActivate', voltexActivateHandler);
        };
    }, [hand, spellTrapZone, graveyard]);
    
    useEffect(() => {
        const deckDestructionHandler = async (data) => {
            await deckDestruction(playerId, fields, fieldsSetter, data.num);
        }
        socket.on('deckDestruction', deckDestructionHandler);

        return () => {
            socket.off('deckDestruction', deckDestructionHandler);
        };
    }, [graveyard, deck]);

    useEffect(() => {
        const reviveHandler = async (data) => {

            await revive(socket, roomName, data.playerId, fields, fieldsSetter, data.cardId);
        }
        socket.on('revive', reviveHandler);

        return () => {
            socket.off('revive', reviveHandler);
        };
    }, [graveyard, monsterZone]);
    
    useEffect(() => {
        const normalSummonHandler = async (playerId, cardId, face) => {
            await normalSummon(socket, roomName, cardId, fields, fieldsSetter, playerId, setPlayers, face);
        }
        const advanceSummonHandler = async (playerId, cardId, tribute, face) => {
            const updatefields = await destroy(playerId, fields, fieldsSetter, tribute)
            await normalSummon(socket, roomName, cardId, updatefields, fieldsSetter, playerId, setPlayers, face);
        }
        socket.on('normalSummon', normalSummonHandler);
        socket.on('advanceSummon', advanceSummonHandler);
        
        return () => {
            socket.off('normalSummon', normalSummonHandler);
            socket.off('advanceSummon', advanceSummonHandler);
        };
    }, [monsterZone, hand, players, extinctionGoats]);
    
    useEffect(() => {
        const putHandler = async (cardId, face) => {
            // const card = await findCard(opponentPlayerId, gameState, cardId, 'hand');
            await put(cardId, fields, fieldsSetter, opponentPlayerId, face);
        }
        socket.on('put', putHandler);
        
        return () => {
            socket.off('put', putHandler);
        };
    }, [spellTrapZone, hand]);
    
    useEffect(() => {
        console.log('monsterZone was chainged',monsterZone)
        const changeHandler = async (cardId) => {
            // const card = await findCard(opponentPlayerId, gameState, cardId, 'monsterZone');
            await change(opponentPlayerId, monsterZone, setMonsterZone, cardId);
        }
        
        const reverseHandler = async (cardId, face) => {
            await reverse(cardId, face);
            if (allCards[cardId].cardtype == "Monster") {
                allCards[cardId].canChange = false;
            }
            // モンスターゾーンを同値で設定することにより再レンダリングを起こす
            // ↑レンダリングするっけ？
            setMonsterZone(monsterZone);
        }
        
        const monsterBanishHandler = async (data) => {
            await monsterBanish(fields, fieldsSetter, data.cardId);
        }

        const deckBanishHandler = async (data) => {
            await deckBanish(playerId, opponentPlayerId, fields, fieldsSetter, data.cardId);
        }

        const returnSnatchMonstersHandler = async (data) => {
            await returnSnatchMonsters(playerId, opponentPlayerId, data.snatchSteals, fields, fieldsSetter);
        }
        
        socket.on('change', changeHandler);
        socket.on('reverse', reverseHandler);
        socket.on('monsterBanish', monsterBanishHandler);
        socket.on('deckBanish', deckBanishHandler);
        socket.on('returnSnatchMonsters', returnSnatchMonstersHandler);
        
        console.log(monsterZone)
        return () => {
            socket.off('change', changeHandler);
            socket.off('reverse', reverseHandler);
            socket.off('monsterBanish', monsterBanishHandler);
            socket.off('deckBanish', deckBanishHandler);
            socket.off('returnSnatchMonsters', returnSnatchMonstersHandler);
        };
    
    }, [deck, monsterZone, banishZone, extinctionGoats]);


    useEffect(() => {
        const kycooHandler = async (data) => {
            await graveyardToBanish(playerId, fields, fieldsSetter, data.cardIds);
        }
        const blackLusterSummonHandler = async (data) => {
            await blackLusterSummon(socket, roomName, data.playerId, fields, fieldsSetter, data.cardId, data.tributeCardIds, data.faceStatus);
        }

        socket.on('kycoo', kycooHandler);
        socket.on('blackLusterSummon', blackLusterSummonHandler);


        return () => {
            socket.off('kycoo', kycooHandler);
            socket.off('blackLusterSummon', blackLusterSummonHandler);
        };
        
    }, [hand, monsterZone, graveyard, banishZone]);

    useEffect(() => {
        console.log('destroyHandler')
        const destroyHandler = async (fields, targetPlayerId, cardId) => {
            // const card = await findCard(null, gameState, cardId, null);
            await destroy(targetPlayerId, fields, fieldsSetter, cardId);
        }
        // const sweepHandler = async (cardsId, location) => {
        //     // sweepされるカードが複数のlocationであれば全フィールドからfindする関数作成も視野
        //     const target = await findCards(opponentPlayerId, gameState, cardsId, location);
        //     await sweep(playerId, opponentPlayerId, fields, fieldsSetter, target)
        // }
        const sweepHandler = async (data) => {
            await sweep(playerId, opponentPlayerId, data.fields, fieldsSetter, data.target)
        }


        socket.on('destroy', destroyHandler);
        socket.on('sweep', sweepHandler);

        return () => {
            socket.off('destroy', destroyHandler);
            socket.off('sweep', sweepHandler);
        };

    }, [monsterZone, spellTrapZone, graveyard, extinctionGoats]);


    useEffect(() => {
        const enforceActivateHandler = async (data) => {
            // await triggerEffectAndWait(socket, roomName, data.cardId)
            await visualizeEffectAndWait(socket, roomName, data.cardId)
            setOppoChoicing(false)
            // const card = allCards[data.cardId]
            // if (card.name == '聖なる魔術師') {
            //     const targets = graveyard[playerId].filter((id) => allCards[id].cardtype == 'Spell')

            //     if (targets.length == 0) {
            //         card.effect.canUse = false;
            //         setOppoChoicing(true);
            //         socket.emit('enforceActivateEnd', { roomName, eventName: data.eventName, fields });
            //         setEffecting(false)
            //         return
            //     }
            //     const target = await selectCards(targets, 1, selectTargetProps.setHoverCardId, data.cardId);
            //     const targetCardId = target[0]
            //     console.log(targetCardId);
            //     allCards[data.cardId].effect.target = targetCardId
            // }
            let updateFields = await cardEffects[allCards[data.cardId].effect.effectDetails[0]](socket, roomName, data.cardId, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps);
            setOppoChoicing(true);
            setEffectTarget(null)
            console.log('enforceActivateEnd')
            socket.emit('enforceActivateEnd', { roomName, eventName: data.eventName, updateFields });
        }
        const fiberJarHandler = async (data) => {
            const updatefields = await fiberJar(socket, roomName, playerId, opponentPlayerId, data.updatefields, fieldsSetter);
            if (data.playerId != playerId) {
                socket.emit('fiberJarEnd', { roomName, updatefields });
            }
        }
        const opponentMonsterEffectHandler = async (data) => {
            const cardId = data.cardId;
            const card = allCards[cardId];
            let updateFields = fields
            let EffectChoice = false
            setEffecting(true)
            setOppoChoicing(false)

            // 戦闘時関連
            if (card.name == '霊滅術師カイクウ' || card.name == '首領・ザルーグ' || card.name == '異次元の女戦士') {
                EffectChoice = await choice(cardId, fields);
                console.log('EffectChoice', EffectChoice)
            } else if (card.name == '天空騎士パーシアス') {
                EffectChoice = true;
                await triggerEffectAndWait(socket, roomName, cardId)
            }
            if (EffectChoice) {
                // await triggerEffectAndWait(socket, roomName, cardId)
                await visualizeEffectAndWait(socket, roomName, cardId)
                updateFields = await cardEffects[card.effect.effectDetails[0]](socket, roomName, data.cardId, playerId, opponentPlayerId, updateFields, fieldsSetter, selectTargetProps, data.targetId);
            }
            
            // リバース時
            if (card.effect.triggerCondition == 'reverse') {
                // await triggerEffectAndWait(socket, roomName, cardId)
                // セイマジは対象の選択や不発処理
                // if (card.name == '聖なる魔術師') {
                //     const targets = graveyard[playerId].filter((id) => allCards[id].cardtype == 'Spell')
    
                //     if (targets.length == 0) {
                //         card.effect.canUse = false;
                //         setOppoChoicing(true);
                //         socket.emit('opponentMonsterEffectEnd', { roomName, eventName: data.eventName, updateFields, DDEffectChoice: EffectChoice });
                //         setEffecting(false)
                //         return
                //     }
                //     const target = await selectCards(targets, 1, selectTargetProps.setHoverCardId, cardId);
                //     const targetCardId = target[0]
                //     console.log(targetCardId);
                //     allCards[cardId].effect.target = targetCardId                    
                // }
                await visualizeEffectAndWait(socket, roomName, cardId)
                updateFields = await cardEffects[card.effect.effectDetails[0]](socket, roomName, data.cardId, playerId, opponentPlayerId, updateFields, fieldsSetter, selectTargetProps);
                card.effect.canUse = false;
            }
            setOppoChoicing(true);
            socket.emit('opponentMonsterEffectEnd', { roomName, eventName: data.eventName, updateFields, DDEffectChoice: EffectChoice });
            setEffecting(false)
        }

        socket.on('enforceActivate', enforceActivateHandler);
        socket.on('fiberJar', fiberJarHandler);
        socket.on('opponentMonsterEffect', opponentMonsterEffectHandler);
        
        return () => {
            socket.off('enforceActivate', enforceActivateHandler);
            socket.off('fiberJar', fiberJarHandler);
            socket.off('opponentMonsterEffect', opponentMonsterEffectHandler);
        };
    }, [monsterZone, spellTrapZone, hand, deck, graveyard, extinctionGoats]);

    useEffect(() => {
        const chainHandler = async (effectProps, activatePlayer, chainBlockCards, eventName, action, fields, target) => {
            setOppoChoicing(false);
            setChainBlockCards(chainBlockCards);
            console.log(conditions);
            if (action == "attack" ) {
                setAttackedTargetId(effectProps.attackedTarget)
            }
            // 召喚じゃない時や召喚しててもチェーンしてたら場のスペルスピード1
            if (action != "summon" || chainBlockCards.length > 1) {
                setSpellSpeed(1);
            }
            console.log('chain confirm ', effectProps, eventName, action, chainBlockCards, fields)
            if (allCards[effectProps.cardId] && allCards[effectProps.cardId].cardtype == "Monster") {
                setActionMonster(effectProps.cardId)
            }
            await getPriority(players, setPlayers, playerId, opponentPlayerId);

            // if (fields.spellTrapZone[playerId].some(id => id != null && allCards[id].faceStatus == "down")) {
            if (fields.spellTrapZone[playerId].some(id => id != null && allCards[id].faceStatus == "down") || players[playerId].turnPlayer) {
                // 裏向きの魔法罠があればチェーン確認
                setChainConfirmFlag(true);
                setEventName(eventName);
                setAction(action)
                // チェーンブロックカードのケツが使用カード
                console.log('chain confirm ', effectProps, eventName, action, chainBlockCards)
                setActivateCard(chainBlockCards[chainBlockCards.length - 1])
                console.log(target)
                setEffectTarget(target);
                await handleChain(
                    effectProps,
                    activatePlayer,
                    playerId,
                    setChainConfirmFlag,
                    setActivater,
                    setActivateCard,
                    chainBlockCards,
                    setChainBlockCards,
                );
            } else {
                if (playerId != activatePlayer) {
                    // 非発動者がチェーンしない場合優先権を返す
                    await getPriority(players, setPlayers, opponentPlayerId, playerId);
                    otherProps.setOppoChoicing(true)
                    console.log('emit chainConfirmResult', chainBlockCards, 'event name ', eventName, fields)
                    socket.emit('chainConfirmResult', { roomName, chainBlockCards, eventName, updateFields: fields });
                } else {
                    // 発動者がチェーンしない場合でも優先権を返す
                    await getPriority(players, setPlayers, opponentPlayerId, playerId);
                    console.log('emit chainConfirmSelf', chainBlockCards, 'event name ', eventName)
                    socket.emit('chainConfirmResultSelf', { roomName, chainBlockCards, eventName, updateFields: fields });
                }
            }
        }

        const endTurnHandler = async () => {
            const action = { type: 'TO_DRAW' }
            setEffecting(true)
            setOppoChoicing(false);
            dispatchPhase(action);
        }
        const quickEffectStartHandler = async (data) => {
            let updatefields = data.fields
            setOppoChoicing(false)
            // 自身の召喚時は
            if (data.action != 'summon' && players[playerId].turnPlayer) {
                setSpellSpeed(1);
            }
            // 通常魔法の使用を禁止
            let nowConditions = conditions;
            if (nowConditions.includes('normalSpell')) {
                setConditions(nowConditions.filter((condition) => condition != 'normalSpell'));
            }
            setQuickEffectStack(data.quickEffectStack)
            setChainBlockCards(data.chainCards);
            updatefields.players = await getPriority(players, setPlayers, playerId, opponentPlayerId,);
            console.log(data);
            const quickEffectResult = await quickEffectConfirm(socket, roomName, setQuickEffectTiming, setChainBlockCards, nowConditions, setConditions, updatefields, fieldsSetter, playerId, opponentPlayerId, data.action, setAction, data.actionMonster, setActionMonster, data.quickEffectStack, setQuickEffectStack, otherProps);
            console.log('startQuickEffectResult', quickEffectResult)
            // await actionChain(socket, roomName, data.effectProps, playerId, opponentPlayerId, data.cardId, updatefields, fieldsSetter, data.chainCards, setChainConfirmFlag, chainProps, data.action, setSpellSpeed, setQuickEffectTiming);
            await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);
            // socket.emit('actionChainEnd', { roomName, status: true });
            // メインに戻されたときはnormalSpellが使えるように戻す
            if ((nowConditions.includes('main1') || nowConditions.includes('main2')) && !nowConditions.includes('normalSpell')) {
                setConditions([...nowConditions, 'normalSpell']);
            }
            setSpellSpeed(0);
            setOppoChoicing(false)
            console.log('quickEffectEnd', { roomName, quickEffectResult, quickEffectStack: data.quickEffectStack });
            socket.emit('quickEffectEnd', { roomName, quickEffectResult, quickEffectStack: data.quickEffectStack });
        }

        socket.on('confirmChain', chainHandler);
        socket.on('endTurn', endTurnHandler);
        socket.on('quickEffectStart', quickEffectStartHandler);
        
        
        return () => {
            socket.off('confirmChain', chainHandler);
            socket.off('endTurn', endTurnHandler);
            socket.off('quickEffectStart', quickEffectStartHandler);
        };

    }, [monsterZone, spellTrapZone, hand, deck, graveyard, banishZone, players, conditions, quickEffectStack]);

    // useEffect(() => {
    //     gameステートの更新例
    //     setGame((prevGame) => ({
    //         ...prevGame,
    //         hand: hand,
    //         deck: deck,
    //         graveyard: graveyard,
    //         monsterZone: monsterZone,
    //         spellTrapZone: spellTrapZone,
    //         banishZone: banishZone,
    //     }));
    // }, [deck, hand, graveyard, monsterZone, spellTrapZone, banishZone]);


    useEffect(() => {
        console.log('chainConfirmFlagが', chainConfirmFlag, 'に変更されました')
    }, [chainConfirmFlag]);
    
    useEffect(() => {
        const addActionMonsterHandler = async (data) => {
            setActionMonster(data.actionMonster);
            setAction(data.action)
        }
        socket.on('addActionMonster', addActionMonsterHandler);
        return () => {
            socket.off('addActionMonster', addActionMonsterHandler);
        };
    }, [actionMonster]);


    // useEffect(() => {
    //     console.log('effecting', effecting,'に変更されました')
    //     if (!effecting) {
    //         effectResolution(socket, roomName, playerId, opponentPlayerId, fields, chainProps, chainBlockCards, setSpellSpeed, setQuickEffectTiming);
    //     }

    // }, [effecting]);
    

    useEffect(() => {
        console.log('chainBlockCards', chainBlockCards,'に変更されました')
        const cleanUpHandler = async (data) => {
            setEffecting(false);
            await cleanUp(socket, roomName, playerId, opponentPlayerId, data.fields, fieldsSetter, chainProps, data.useCardIds, setSpellSpeed);
        }
        const actionChainStartHandler = async (data) => {
            let updatefields = fields
            // 自身の召喚時は
            if (data.action != 'summon' && players[playerId].turnPlayer) {
                setSpellSpeed(1);
            }
            // 通常魔法の使用を禁止
            let nowConditions = conditions;
            if (nowConditions.includes('normalSpell')) {
                setConditions(nowConditions.filter((condition) => condition != 'normalSpell'));
            }
            setChainBlockCards(data.chainCards);
            updatefields.players = await getPriority(players, setPlayers, playerId, opponentPlayerId,);
            await actionChain(socket, roomName, data.effectProps, playerId, opponentPlayerId, data.cardId, updatefields, fieldsSetter, data.chainCards, setChainConfirmFlag, chainProps, data.action, setSpellSpeed, setQuickEffectTiming);
            await getPriority(updatefields.players, setPlayers, opponentPlayerId, playerId);
            socket.emit('actionChainEnd', { roomName, status: true });
            if (!nowConditions.includes('normalSpell')) {
                setConditions([...nowConditions, 'normalSpell']);
            }
        }

        socket.on('cleanUp', cleanUpHandler);
        socket.on('actionChainStart', actionChainStartHandler);

        return () => {
            socket.off('cleanUp', cleanUpHandler);
            socket.off('actionChainStart', actionChainStartHandler);

        };
    }, [chainBlockCards, monsterZone, spellTrapZone, graveyard, extinctionGoats]);

    useEffect(() => {
        // 相手の効果によってセイマジが矯正発動したときに効果対象を渡す
        const checkEffectTargetHandler = async (data) => {
            console.log(data)
            const card = allCards[data.cardId]
            if (card.name == '聖なる魔術師') {
                const targets = graveyard[playerId].filter((id) => allCards[id].cardtype == 'Spell')

                if (targets.length == 0) {
                    setOppoChoicing(true);
                    card.effect.canUse = false;
                    socket.emit('checkEffectTargetEnd', { roomName, effectTargetcardId: null });
                    // setEffecting(false)
                    return
                }
                setOppoChoicing(false);
                const target = await selectCards(targets, 1, selectTargetProps.setHoverCardId, data.cardId, playerId, null, 'enforce');
                const targetCardId = target[0]
                console.log(targetCardId);
                allCards[data.cardId].effect.target = targetCardId
                setEffectTarget(targetCardId)
                setOppoChoicing(true);
                socket.emit('checkEffectTargetEnd', { roomName, effectTargetcardId: targetCardId });
            }

        }
        socket.on('checkEffectTarget', checkEffectTargetHandler)
        return () => {
            socket.off('checkEffectTarget', checkEffectTargetHandler)
        }
    }, [graveyard, effectTarget]);


    const handleSerpentOptionChange = (event) => {
        setSinisterSerpentOption(event.target.value);
    };
    
    const changedPhase = async (option) => {
        console.log(socket,socket.id)
        // フェイズ移行時は両者優先権を剥奪
        await getPriority(players, setPlayers, opponentPlayerId, playerId);
        if (phase != 'change') {
            // await awaitTime(500);
        }
        if (turnCount == 1 && phase == 'draw') {
            setOppoChoicing(true)
            console.log(userAgent)
            // ユーザーエージェントの,区切りをパイプに変換して渡す
            const isMobileCheckObj = await waitBothPlayer(socket, roomName, playerId, userAgent.replace(/,/g, '|'));
            console.log(isMobileCheckObj)
            const matchData = players[playerId].matchData;
            console.log(players[playerId].matchData,matchData)
            // 多分これでお互いがモバイルか確認できるはず
            if (matchData.firstPlayer == playerId) {
                matchData.firstPlayer_isMobile = isMobileCheckObj[playerId]
                matchData.secondPlayer_isMobile = isMobileCheckObj[opponentPlayerId]
            } else {
                matchData.firstPlayer_isMobile = isMobileCheckObj[opponentPlayerId]
                matchData.secondPlayer_isMobile = isMobileCheckObj[playerId]
            }

            if (players[playerId].turnPlayer) {
                setOppoChoicing(false)
            }
            // await awaitTime(1500);
        }
        if (phase == 'draw') {
            console.log('draw')
            // setQuickEffectStack(0)addActionMonster
            let updatefields = fields
            if (option != 'retry') {
                const allSpellTrap = spellTrapZone[playerId].concat(spellTrapZone[opponentPlayerId])
                console.log('護封剣の確認', allSpellTrap, spellTrapZone[playerId], spellTrapZone[opponentPlayerId], JSON.stringify(allSpellTrap), JSON.stringify(spellTrapZone[playerId]), JSON.stringify(spellTrapZone[opponentPlayerId]))
                const swordOfLightIds = allSpellTrap.filter((id) => id != null && allCards[id].name == "光の護封剣")
                console.log('swordOfLightIds', swordOfLightIds, JSON.stringify(swordOfLightIds))
                console.log('swordOfLight players', players, JSON.stringify(players))
                for (const swordOfLightId of swordOfLightIds) {
                    const swordOfLight = allCards[swordOfLightId];
                    console.log(swordOfLight, JSON.stringify(swordOfLight))
                    if (!players[swordOfLight.controller].turnPlayer && swordOfLight.faceStatus == "up") {
                        console.log('護封剣カウント+1', JSON.stringify(swordOfLight))
                        swordOfLight.counter += 1;
                    }
                }
            }
            // 1ターン目なら後攻プレイヤーや何も行わず先行プレイヤー主導ですべて行う
            if (turnCount == 1 && players[playerId].turnPlayer) {
                // 自分と相手でシャッフルすると整合性が取れないのでシャッフルした物を相手に渡してシャッフルした風にする
                updatefields.deck = await shuffle(playerId, updatefields, fieldsSetter);
                updatefields.deck = await shuffle(opponentPlayerId, updatefields, fieldsSetter);
                socket.emit('deckShuffled', { roomName, playerId: playerId, updateDeck: updatefields.deck });
                await awaitTime(1000)
                socket.emit('shuffleAnimation', { roomName, playerId: playerId })
                socket.emit('shuffleAnimation', { roomName, playerId: opponentPlayerId })
                await awaitTime(1800)

                socket.emit('startUp', { roomName, updatefields });
                updatefields = await gameStart(socket, roomName, updatefields, fieldsSetter, playerId, opponentPlayerId);
                // await awaitTime(1500);
                await triggerShowPhaseAnimation()
                await handleDraw(socket, roomName, updatefields, fieldsSetter, playerId, opponentPlayerId, turnCount);
            }
            setOppoChoicing(false)
            // 後攻の1ターン目のみ遅延
            if ((turnCount == 1 && !players[playerId].turnPlayer)) {
                await awaitTime(3300)
            }
            // 初回のみ行う
            if (option != 'retry' && (turnCount != 1 || !players[playerId].turnPlayer)) {
                await triggerShowPhaseAnimation()
            }
            if (turnCount != 1 && players[playerId].turnPlayer) {
                if (deck[playerId].length <= 0) {
                    const decisionObj = { decision: true, winner: opponentPlayerId }
                    socket.emit('decision', { roomName, decisionObj })
                    return 
                } else {
                    // await handleDraw(socket, roomName, updatefields, fieldsSetter, playerId, opponentPlayerId);
                    // ドロー時はターンプレイヤーが引くように各自処理
                    if (option != 'retry') {
                        await drawCard(fields, fieldsSetter, playerId);
                    }
                    // await awaitTime(500);
                }
            } else if (turnCount != 1 && players[opponentPlayerId].turnPlayer) {
                // ドロー時はターンプレイヤーが引くように各自処理
                if (option != 'retry') {
                    await drawCard(fields, fieldsSetter, opponentPlayerId);
                }
            }
            if (await checkDecision(players, deck)) {
                return;
            }
            setEffecting(false)
            if (players[playerId].turnPlayer) {
                let changed = false
                setOppoChoicing(false);
                setConditions([...conditions, "phaseEnd"]);
                // if (fields.spellTrapZone[playerId].some(id => id != null && allCards[id].faceStatus == "down" && allCards[id].canChange)) {
                if (true) {
                    // クイックエフェクトを行うときは相手に選択中を表示
                    socket.emit('nowChoicing', { roomName });
                    await getPriority(players, setPlayers, playerId, opponentPlayerId);
                    console.log('conditions', conditions)
                    const quickEfected = await quickEffectConfirmSelf(socket, setQuickEffectTiming, quickEffectStack, setQuickEffectStack, setConditions, 'phaseEnd');
                    console.log(quickEfected)
                    if (!quickEfected.status) {
                        setConditions([...conditions, "phaseEnd"]);
                        console.log([...conditions, "phaseEnd"])
                        changed = await handleNextPhase(0)
                    }
                } else {
                    // await awaitTime(100);
                    changed = await handleNextPhase(0)
                }
                if (!changed) {
                    console.log('retry', changed)
                    await getPriority(players, setPlayers, opponentPlayerId, playerId);
                    await changedPhase('retry');
                }
            } else {
                // // ターンプレイヤーがクイックエフェクト発動できないときは非ターンプレイヤーにすぐにクイックエフェクトが来るからoppoChoicingはfalseのままにする
                // if (fields.spellTrapZone[opponentPlayerId].some(id => id != null && allCards[id].faceStatus == "down")) {
                //     setOppoChoicing(true);
                // }
            }

            // if (!players[playerId].turnPlayer) {
            //     setOppoChoicing(true);
            // } else {
            //     setConditions([...conditions, "phaseEnd"]);
            //     let changedPhase = false
            //     setOppoChoicing(false);
            //     while (!changedPhase) {
            //         if (fields.spellTrapZone[playerId].length != 0) {
            //             // if (true) {
            //             const quickEfected = await quickEffectConfirmSelf(socket, setQuickEffectTiming, quickEffectStack, setQuickEffectStack);
            //             console.log(quickEfected)
            //             if (!quickEfected.status) {
            //                 changedPhase = await handleNextPhase()
            //             }
            //         } else {
            //             changedPhase = await handleNextPhase()
            //         }
            //     }

            // }
        }
        if (phase == 'stanby') {
            // setQuickEffectStack(0)

            setOppoChoicing(false)
            if (option != 'retry') {
                await triggerShowPhaseAnimation()
                const fieldsSpell = fields.spellTrapZone[playerId].concat(fields.spellTrapZone[opponentPlayerId]).filter(id => id != null);
                // 強奪あればHP回復
                // 強奪が表向きでかつ、相手のターン(強奪のコントローラーのターンではない)
                let snatchSteals = fieldsSpell.filter((cardId) => allCards[cardId].name == '強奪' && allCards[cardId].faceStatus == "up" && !players[allCards[cardId].controller].turnPlayer)
                console.log(snatchSteals)
                if (snatchSteals.length != 0) {

                    // ターンプレイヤー側から誘発効果として起動
                    if (players[playerId].turnPlayer) {

                        const sideEffect = await sideEffectChain(socket,
                            roomName,
                            playerId,
                            opponentPlayerId,
                            fields,
                            fieldsSetter,
                            { cardId: snatchSteals[snatchSteals.length - 1], playerId, opponentPlayerId },
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
                            otherProps,
                            snatchSteals
                        );
                    }
                    // if (allCards[snatchSteal].controller == opponentPlayerId && players[playerId].turnPlayer) {
                    //     const sideEffect = await sideEffectChain(socket,
                    //         roomName,
                    //         playerId,
                    //         opponentPlayerId,
                    //         fields,
                    //         fieldsSetter,
                    //         { cardId: snatchSteal, playerId, opponentPlayerId },
                    //         chainProps,
                    //         chainConfirmFlag,
                    //         setChainConfirmFlag,
                    //         chainBlockCards,
                    //         selectTargetProps,
                    //         setEffecting,
                    //         setSpellSpeed,
                    //         setQuickEffectTiming,
                    //         quickEffectStack,
                    //         setQuickEffectStack,
                    //         otherProps,
                    //         snatchSteal
                    //     );
                    // }
                }
                // setEffecting(true)
                if (await checkDecision(players, deck)) {
                    return;
                }
            }
            if (players[playerId].turnPlayer) {
                if (sinisterSerpentOption != 'none' && option != 'retry') {
                    // オプションがcheckかautoならキラスネ取得
                    const sinisterSerpent = fields.graveyard[playerId].find((cardId) => allCards[cardId].name == "キラースネーク")
                    if (sinisterSerpent) {
                        // キラスネが居たらcheckかautoか判断。チェックなら判断を待つ
                        const sinisterSerpentChoice = sinisterSerpentOption == 'check' ? await choice(sinisterSerpent, fields) : true;
                        if (sinisterSerpentChoice) {
                            const sideEffect = await sideEffectChain(socket,
                                roomName,
                                playerId,
                                opponentPlayerId,
                                fields,
                                fieldsSetter,
                                { cardId: sinisterSerpent, playerId, opponentPlayerId },
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
                                otherProps,
                                [sinisterSerpent]
                            );
                            console.log('end serpent')
                            if (await checkDecision(sideEffect.updatefields.players, sideEffect.updatefields.deck)) {
                                return;
                            }
                        }
                    }
                }
                setEffecting(false)

                setConditions([...conditions, "phaseEnd"]);
                let changed = false
                // console.log('クイックエフェクトチェック',monsterZone)
                setOppoChoicing(false);
                // 自身に発動できるカードがあればクイックエフェクト
                // await getPriority(players, setPlayers, playerId, opponentPlayerId);
                // if (fields.spellTrapZone[playerId].some(id => id != null && allCards[id].faceStatus == "down" && allCards[id].canChange || (fields.graveyard[playerId].some(id => id != null && allCards[id].name == "キラースネーク")))) {
                if (true) {
                    // クイックエフェクトを行うときは相手に選択中を表示
                    socket.emit('nowChoicing', { roomName });
                    const quickEfected = await quickEffectConfirmSelf(socket, setQuickEffectTiming, quickEffectStack, setQuickEffectStack);
                    console.log(quickEfected)
                    if (!quickEfected.status) {
                        changed = await handleNextPhase(0)
                    }
                } else {
                    // await awaitTime(100);
                    changed = await handleNextPhase(0)
                }
                if (!changed) {
                    await getPriority(players, setPlayers, opponentPlayerId, playerId);
                    await changedPhase('retry');
                }


            } else {
                // ターンプレイヤーがクイックエフェクト発動できないときは非ターンプレイヤーにすぐにクイックエフェクトが来るからoppoChoicingはfalseのままにする
                // if (fields.spellTrapZone[opponentPlayerId].some(id => id != null && allCards[id].faceStatus == "down") || (fields.monsterZone[opponentPlayerId].includes((cardId) => cardId != null && allCards[cardId].name == "キラースネーク"))) {
                //     setOppoChoicing(true);
                // }
                setEffecting(false)
            }

            console.log('stanby')
        }
        if (phase == 'main1') {
            setOppoChoicing(false)
            await triggerShowPhaseAnimation()
            setEffecting(false)
            // setQuickEffectStack(0)
            setSpellSpeed(0);
            if (players[playerId].turnPlayer) {
                await getPriority(players, setPlayers, playerId, opponentPlayerId)
                setOppoChoicing(false);
            } else {
                setOppoChoicing(true);
            }
            console.log('main1')
        }
        if (phase == 'battle') {
            setOppoChoicing(false)
            await triggerShowPhaseAnimation()
            setEffecting(false)
            // setQuickEffectStack(0)
            setSpellSpeed(0);
            if (players[playerId].turnPlayer) {
                await getPriority(players, setPlayers, playerId, opponentPlayerId)
                setOppoChoicing(false);
            } else {
                setOppoChoicing(true);
            }
            console.log('battle')
        }
        if (phase == 'main2') {
            setOppoChoicing(false)
            await triggerShowPhaseAnimation()
            setEffecting(false)
            // setQuickEffectStack(0)
            setSpellSpeed(0);
            setAttackOption("");
            if (players[playerId].turnPlayer) {
                await getPriority(players, setPlayers, playerId, opponentPlayerId)
                setOppoChoicing(false);
            } else {
                setOppoChoicing(true);
            }
            console.log('main2')
        }
        if (phase == 'end') {
            setQuickEffectStack(0)
            setOppoChoicing(false)
            if (option != "retry") {
                await triggerShowPhaseAnimation()
                setEffecting(false)
            }
            // setQuickEffectStack(0)
            setSpellSpeed(0);
            setAttackOption("");
            // if (players[playerId].turnPlayer) {
            //     await getPriority(players, setPlayers, playerId, opponentPlayerId)
            // }
            if (players[playerId].turnPlayer) {
                console.log(conditions)
                let changed = false
                setConditions(["end","phaseEnd"]);
                // if (fields.spellTrapZone[playerId].some(id => id != null && allCards[id].faceStatus == "down" && allCards[id].canChange)) {
                if (true) {
                    setOppoChoicing(false);
                    // クイックエフェクトを行うときは相手に選択中を表示
                    socket.emit('nowChoicing', { roomName });
                    const quickEfected = await quickEffectConfirmSelf(socket, setQuickEffectTiming, 0, setQuickEffectStack);
                    console.log(quickEfected)
                    if (!quickEfected.status) {
                        changed = await handleNextPhase(0)
                    }
                } else {
                    changed = await handleNextPhase(0)
                }
                if (!changed) {
                    await getPriority(players, setPlayers, opponentPlayerId, playerId);
                    await changedPhase('retry');
                }
            } else {
                // ターンプレイヤーがクイックエフェクト発動できないときは非ターンプレイヤーにすぐにクイックエフェクトが来るからoppoChoicingはfalseのままにする
                // if (fields.spellTrapZone[opponentPlayerId].some(id => id != null && allCards[id].faceStatus == "down")) {
                //     setOppoChoicing(true);
                // }
                // setOppoChoicing(true);
            }
            console.log('end')
        }
        if (phase == 'change') {
            console.log('endTurn')
            await getPriority(players, setPlayers, opponentPlayerId, playerId);

            // 自身が手札7枚以上なら6枚になるように捨てる捨てたあとに自身と相手のフェイズを進める
            if (players[playerId].turnPlayer && hand[playerId].length >= 7) {
                setOppoChoicing(false);
                await adjustHand(socket, roomName, fields, fieldsSetter, playerId, setHoverCardId)
                await endTurn(socket, roomName, players, playerId, opponentPlayerId, fields, fieldsSetter);
                socket.emit('changePhase', { roomName, changePhase: 'NEXT_PHASE', phase: phase })
                setQuickEffectStack(0)
                setEffecting(true)
                const action = { type: 'NEXT_PHASE' }
                dispatchPhase(action);
                
            } else if (!(players[playerId].turnPlayer) && hand[opponentPlayerId].length >= 7) {
                // 相手の手札が7枚以上あればフェイズを進めずに相手のフェイズ進行を待つ
                setQuickEffectStack(0)
                setEffecting(true)
            } else {
                // 何もないときは普通に両者フェイズを進める
                await endTurn(socket, roomName, players, playerId, opponentPlayerId, fields, fieldsSetter);
                console.log('quickEffect stack = 0');
                setQuickEffectStack(0)
                setEffecting(true)
                const action = { type: 'NEXT_PHASE' }
                dispatchPhase(action);
            }

        }
    }

    // フェイズ移行時にフェイズ移行時関数を呼び出す
    useEffect(() => {
        changedPhase();

    }, [phase]);
    
    useEffect(() => {

        const changePhaseHandler = async (data) => {
            setEffecting(true)
            if (phase == "change" && !players[playerId].turnPlayer) {
                await endTurn(socket, roomName, players, playerId, opponentPlayerId, fields, fieldsSetter);
            }
            dispatchPhase({ type: data.changePhase });
        }
        socket.on('changePhase', changePhaseHandler);
        return () => {
            socket.off('changePhase', changePhaseHandler);
            
        }

    }, [players, hand, monsterZone, spellTrapZone, graveyard, phase]);


    const result = async () => {
        let updatefields = fields;

        updatefields.players = await matchDataUpdate(playerId, opponentPlayerId, fields, turnCount);
        // setDecisionDuel(playerId)
        const decisionObj = {
            decision: true,
            winner: playerId
        };

        // decisionObj.decision = true;
        // decisionObj.winner = playerId;

        updatefields.players[playerId].matchData.winner = playerId;

        socket.emit('decision', { roomName, decisionObj, result: updatefields.players[playerId].matchData })

    }

    const shuffleAnimation = async () => {


        socket.emit('shuffleAnimation', { roomName, playerId })

    }


    return (
        <div className='board-wrapper-wrapper'>

            <div className='board-wrapper' id='game-board'>
                {!isMobile && (
                    <div className='card-descriptions placeholder'>
                        <div className='card-picture big'>
                            {hoverCardId !== null && <DisplayCard key={hoverCardId} cardId={hoverCardId} onHover={setHoverCardId} />}
                        </div>
                        <div className='card-description'>
                            <div dangerouslySetInnerHTML={{ __html: description }} />
                        </div>
                    </div>
                )}
                {isMobile && (
                    <div className='mobile-header mobile mobile-only'>
                        <button onClick={() => handleDisplayAllCards(setHoverCardId, isMobile, mobileDisplayCardsPropsFields)}>カード一覧</button>
                        <div className='game-info'>
                            {turnCount}ターン目
                            <div className={`phase-display ${players[playerId].turnPlayer ? 'phase-player' : 'phase-opponent'}`}>
                                {phase == 'draw' ? "ドローフェイズ" :
                                    phase == 'stanby' ? 'スタンバイフェイズ' :
                                        phase == 'main1' ? 'メインフェイズ1' :
                                            phase == 'battle' ? 'バトルフェイズ' :
                                                phase == 'main2' ? 'メインフェイズ2' :
                                                    (phase == 'end' || phase == 'change') ? 'エンドフェイズ' : ''}
                            </div>
                        </div>
                    </div>
                )}
                <BoardComponent
                    socket={socket}
                    roomName={roomName}
                    boardData={gameState}
                    playerId={playerId}
                    opponentPlayerId={opponentPlayerId}
                    cardProps={cardProps}
                    fields={fields}
                    fieldsSetter={fieldsSetter}
                    props={props}
                    setHoverCardId={setHoverCardId}
                    visualizeEffect={visualizeEffect}
                />
                {!isMobile && (
                    <div className='board-options'>
                        <button onClick={() => handleDisplayAllCards(setHoverCardId, isMobile, mobileDisplayCardsPropsFields)}>カード一覧</button>
                        <div className='game-info'>
                            {turnCount}ターン目
                            <div className={`phase-display ${players[playerId].turnPlayer ? 'phase-player' : 'phase-opponent'}`}>
                                {phase == 'draw' ? "ドローフェイズ" :
                                    phase == 'stanby' ? 'スタンバイフェイズ' :
                                        phase == 'main1' ? 'メインフェイズ1' :
                                            phase == 'battle' ? 'バトルフェイズ' :
                                                phase == 'main2' ? 'メインフェイズ2' :
                                                    (phase == 'end' || phase == 'change') ? 'エンドフェイズ' : ''}
                            </div>
                            {/* あなたのLP:{players[playerId].hp}<br />
                    相手のLP:{players[opponentPlayerId].hp}<br /> */}
                            <div className='changes-phase'>
                                {players[playerId].turnPlayer == true &&
                                    players[playerId].priority == true &&
                                    !effecting &&
                                    !quickEffectTiming &&
                                    !chainConfirmFlag &&
                                    !oppoChoicing &&
                                    isMounted &&
                                    !isCaution &&
                                    phase != 'draw' &&
                                    phase != 'stanby' &&
                                    phase != 'end' &&
                                    !selectTargetFlag &&
                                    <div className='phase-change-buttons'>
                                        {(turnCount != 1 || phase != 'main1') && phase != 'main2' && <button className='go-next-phase phase-change-button' onClick={() => handleNextPhase(quickEffectStack)}>
                                            {phase == 'draw' ? 'スタンバイフェイズに進む' :
                                                phase == 'stanby' ? 'メインフェイズ1に進む' :
                                                    phase == 'main1' ? 'バトルフェイズに進む' :
                                                        phase == 'battle' ? 'メインフェイズ2に進む' : '次のフェイズに進む'
                                            }
                                        </button>}
                                        {phase != "end" && <button className='go-end-phase phase-change-button' onClick={() => handleEndPhase()}>エンドフェイズに進む</button>}
                                    </div>}
                            </div>
                        </div>
                        <div className='messageLog-component'>
                            <MessageLog socket={socket} roomName={roomName} playerId={playerId} opponentPlayerId={opponentPlayerId} fields={fields} fieldsSetter={fieldsSetter} chainBlockCards={chainBlockCards} />
                        </div>
                        {/* <button onClick={() => setAnimationSpinFlag(!animationSpinFlag)}>
                    {animationSpinFlag ? '攻撃時に回転をオフにする' : '攻撃時に回転をオンにする'}
                </button> */}
                        <div>
                            スタンバイフェイズ時のキラースネーク
                            <form>
                                <label>
                                    <input
                                        type="radio"
                                        value="none"
                                        checked={sinisterSerpentOption === 'none'}
                                        onChange={handleSerpentOptionChange}
                                    />
                                    確認しない
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="check"
                                        checked={sinisterSerpentOption === 'check'}
                                        onChange={handleSerpentOptionChange}
                                    />
                                    確認する
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="auto"
                                        checked={sinisterSerpentOption === 'auto'}
                                        onChange={handleSerpentOptionChange}
                                    />
                                    自動で発動する
                                </label>
                            </form>
                            {/* <p>選択されたオプション: {sinisterSerpentOption}</p> */}
                        </div>
                    </div>
                )}
                {isMobile && (
                    <div className='board-options mobile-footer mobile mobile-only'>
                        <div className='game-info'>
                            <div className='changes-phase'>
                                {players[playerId].turnPlayer == true &&
                                    players[playerId].priority == true &&
                                    !effecting &&
                                    !quickEffectTiming &&
                                    !chainConfirmFlag &&
                                    !oppoChoicing &&
                                    isMounted &&
                                    !isCaution &&
                                    phase != 'draw' &&
                                    phase != 'stanby' &&
                                    phase != 'end' &&
                                    !selectTargetFlag &&
                                    <div className='phase-change-buttons'>
                                        {(turnCount != 1 || phase != 'main1') && phase != 'main2' && <button className='go-next-phase phase-change-button' onClick={() => handleNextPhase(quickEffectStack)}>次のフェイズに進む</button>}
                                        {phase != "end" && <button className='go-end-phase phase-change-button' onClick={() => handleEndPhase()}>エンドフェイズに進む</button>}
                                    </div>}
                            </div>
                        </div>
                        <div className='card-descriptions placeholder'>
                            <div className='card-picture big'>
                                {hoverCardId !== null && <DisplayCard key={hoverCardId} cardId={hoverCardId} onHover={setHoverCardId} />}
                            </div>
                            <div className='card-description'>
                                <div dangerouslySetInnerHTML={{ __html: description }} />
                            </div>
                        </div>
                        <div className='messageLog-component'>
                            <MessageLog socket={socket} roomName={roomName} playerId={playerId} opponentPlayerId={opponentPlayerId} fields={fields} fieldsSetter={fieldsSetter} chainBlockCards={chainBlockCards} />
                        </div>
                        {/* <button onClick={() => setAnimationSpinFlag(!animationSpinFlag)}>
                        {animationSpinFlag ? '攻撃時に回転をオフにする' : '攻撃時に回転をオンにする'}
                    </button> */}
                        <div className='sinisterSSerpent-option'>
                            スタンバイフェイズ時のキラースネーク
                            <form>
                                <label>
                                    <input
                                        type="radio"
                                        value="none"
                                        checked={sinisterSerpentOption === 'none'}
                                        onChange={handleSerpentOptionChange}
                                    />
                                    確認しない
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="check"
                                        checked={sinisterSerpentOption === 'check'}
                                        onChange={handleSerpentOptionChange}
                                    />
                                    確認する
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="auto"
                                        checked={sinisterSerpentOption === 'auto'}
                                        onChange={handleSerpentOptionChange}
                                    />
                                    自動で発動する
                                </label>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <div className='slide-text-wrapper'>
                {showPhase && <div className={`sliding-text ${players[playerId].turnPlayer ? 'player-color' : 'opponentplayer-color'}`}>
                    {phase == 'draw' ? "ドローフェイズ" :
                        phase == 'stanby' ? "スタンバイフェイズ" :
                            phase == 'main1' ? "メインフェイズ1" :
                                phase == 'battle' ? "バトルフェイズ" :
                                    phase == 'main2' ? "メインフェイズ2" :
                                        phase == 'end' || phase == 'change' ? "エンドフェイズ" : '???' }
                </div>}
            </div>
            <div onClick={() => setOpneQandA(true)} className="open-q-and-a">Q&amp;A</div>
            {opneQandA && (
                <QAndA setOpneQandA={setOpneQandA} />
            )}
            {/* <div>
                <button onClick={() => handleDraw(socket, roomName, fields, fieldsSetter, playerId, opponentPlayerId, turnCount)}>Draw Card</button>
                <button onClick={() => handleDrawCards(socket, opponentPlayerId, roomName, deck, hand, setHand, setDeck, playerId, 5)}>Draw 5Cards</button>
                <button onClick={() => discardSelf(socket, roomName, 1, playerId, fields, fieldsSetter, selectTargetProps)}>discard</button>
                <button onClick={() => heavyStormEffectDetail(socket, roomName, 7, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps)}>大嵐</button>
                <button onClick={() => torrentialTributeEffectDetail(socket, roomName, 20, playerId, opponentPlayerId, fields, fieldsSetter, selectTargetProps)}>激流葬</button>
            </div> */}
            {decisionDuel && (
                <Result socket={socket} roomName={roomName} playerId={playerId} opponentPlayerId={opponentPlayerId} players={players} winner={decisionDuel} endGame={endGame} />
            )}
            {/* <div>
                <button onClick={shuffleAnimation}> shuffleAnimation </button>
            </div>
            <div>
                <button onClick={result}> result </button>
            </div>
            <div>
                <button onClick={() => setPlayerDamageValue(500)}> damage </button>
            </div>
            <div>
                <button onClick={() => setPlayerDamageValue(-500)}> heal </button>
            </div>
            <div>
                <button onClick={() => setOpponentPlayerDamageValue(500)}> damage </button>
            </div>
            <div>
                <button onClick={() => setOpponentPlayerDamageValue(-500)}> heal </button>
            </div>
            <div>
                <div>
                    chainBlockCards:{chainBlockCards}<br />
                    chainConfirmFlag:{chainConfirmFlag && (<div>true</div>)}<br />
                    あなた:{playerId}:{players[playerId].hp}<br />
                    turnPlayer:{players[playerId].turnPlayer && (<div>あなたのターンです</div>)}<br />
                    priority:{players[playerId].priority && (<div>あなたが優先権を持っています</div>)}<br />
                    useGoats:{players[playerId].useGoats && (<div>あなたはスケープゴート使用済み</div>)}<br />
                    相手:{opponentPlayerId}:::{players[opponentPlayerId].hp}<br />
                    turnPlayer:{players[opponentPlayerId].turnPlayer && (<div>相手のターンです</div>)}<br />
                    priority:{players[opponentPlayerId].priority && (<div>相手が優先権を持っています</div>)}<br />
                    useGoats:{players[opponentPlayerId].useGoats && (<div>相手はスケープゴート使用済み</div>)}<br />
                    effecting:{effecting && (<div>true</div>)}<br />
                    chainConfirmFlag:{chainConfirmFlag && (<div>true</div>)}<br />
                    quickEffectTiming:{quickEffectTiming && (<div>true</div>)}<br />
                    selectTargetFlag:{selectTargetFlag && (<div>true</div>)}<br />
                    conditions:
                    {conditions.map((item, index) => (
                        <div key={index}>{item}</div>
                    ))}<br />
                    spellSpeed:{spellSpeed}<br />
                    actionMonster:{actionMonster}<br />
                    activateCard:{activateCard}<br />
                    targetCards:{targetCards}<br />
                    action:{action}<br />
                    quickEffectStack:{quickEffectStack}<br />
                    oppoChoicing:{oppoChoicing && "oppoChoicing"}<br/>
                    isCaution:{isCaution && "isCaution"}<br/>

                    <button onClick={() => handleDraw(socket, roomName, fields, fieldsSetter, playerId, opponentPlayerId, turnCount)}>Draw Card</button>
                    <button onClick={() => handleDrawCards(socket, opponentPlayerId, roomName, deck, hand, setHand, setDeck, playerId, 5)}>Draw 5Cards</button>
                    <button onClick={() => discardSelf(socket, roomName, 1, playerId, fields, fieldsSetter, selectTargetProps)}>discard</button>
                    <button onClick={() => heavyStormEffectDetail(socket,roomName,7,playerId,opponentPlayerId,fields,fieldsSetter,selectTargetProps)}>大嵐</button>
                    <button onClick={() => torrentialTributeEffectDetail(socket,roomName,20,playerId,opponentPlayerId,fields,fieldsSetter,selectTargetProps)}>激流葬</button>
                </div>
            </div> */}

        </div>
    );
}




export { Duel };