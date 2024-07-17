import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import CardComponent from './gameUtil';
import { CardSelection } from './selectCard'
import { ChainConfirm } from './chainConfirm';
import { SelectTarget } from './selectTarget';
import { QuickEffect } from './quickEffect';

import '../css/GameBord.css';
import { handleDisplayCardList } from './displayCardList';
import { allCards } from '../models/cards';
import LoadingComponent from './choicing';
import ArrowComponent from './arrow';
import '../css/card.css';
import DamageDisplay from './damageDeiplay';
import ExtinctionGoats from './extinctionGoats';

const BoardComponent = ({ socket, roomName, boardData, playerId, opponentPlayerId, cardProps, fields, fieldsSetter, props, setHoverCardId, visualizeEffect }) => {
    // const [showCardSelection, setShowCardSelection] = useState(true);
    // console.log(boardData);
    // console.log(boardData.hand);
    // console.log(boardData.deck);
    // console.log(boardData.hand[opponentPlayerId]);
    // console.log(opponentPlayerId);
    // console.log(playerId);
    const players = fields.players;
    const setPlayers = props.setPlayers;
    const chainProps = props.chainProps;
    const selectTargetProps = props.selectTargetProps;
    const chainConfirmFlag = chainProps.chainConfirmFlag;
    const setChainConfirmFlag = chainProps.setChainConfirmFlag;
    const chainBlockCards = chainProps.chainBlockCards;
    const eventName = chainProps.eventName
    const selectTargetFlag = selectTargetProps.selectTargetFlag;
    const effectingCard = selectTargetProps.effectingCard;
    const setSpellSpeed = cardProps.setSpellSpeed
    const quickEffectStack = props.quickEffectStack
    const setQuickEffectStack = props.setQuickEffectStack
    const effectVisible = visualizeEffect.effectVisible
    const visualizeCardId = visualizeEffect.visualizeCardId
    const setEffecting = cardProps.setEffecting;

    const otherProps = props.otherProps

    const playerDamageValue = otherProps.playerDamageValue;
    const setPlayerDamageValue = otherProps.setPlayerDamageValue;
    const opponentPlayerDamageValue = otherProps.opponentPlayerDamageValue;
    const setOpponentPlayerDamageValue = otherProps.setOpponentPlayerDamageValue;
    const extinctionGoats = cardProps.extinctionGoats
    const setExtinctionGoats = cardProps.setExtinctionGoats

    const isMobile = otherProps.isMobile;

    const mobileDisplayCardsPropsFields = otherProps.mobileDisplayCardsPropsFields

    // // 破壊された羊トークンの監視
    // // const extinctionGoats = [41, 42, 43, 44, 91, 92, 93, 94];
    // const [extinctionGoats, setExtinctionGoats] = useState([41, 42, 43, 44, 91, 92, 93, 94]);
    // // const playersExtinctionGoats = [null, null, null, null, null];
    // const [playersExtinctionGoats, setPlayersExtinctionGoats] = useState([null, null, null, null, null]);
    // // const opponentPlayersExtinctionGoats = [null, null, null, null, null];
    // const [opponentPlayersExtinctionGoats, setOpponentPlayersExtinctionGoats] = useState([null, null, null, null, null]);
    // let newPlayersExtinctionGoats = [null, null, null, null, null];
    // let newOpponentPlayersExtinctionGoats = [null, null, null, null, null];
    // for (let goat of extinctionGoats) {
    //     // すべての羊トークンから前の位置がモンスターゾーンで現在の位置がモンスターゾーンじゃない物
    //     if (allCards[goat].position.prevLocation == 'monsterZone' && allCards[goat].location != 'monsterZone') {
    //         if (allCards[goat].position.prevController == playerId) {
    //             newPlayersExtinctionGoats[allCards[goat].position.prevNum] = goat + 1
    //         } else {
    //             newOpponentPlayersExtinctionGoats[allCards[goat].position.prevNum] = goat + 1
    //         }
    //         console.log(playersExtinctionGoats, JSON.stringify(playersExtinctionGoats))
    //         console.log(opponentPlayersExtinctionGoats, JSON.stringify(opponentPlayersExtinctionGoats))
    //     }
    // }
    // if (JSON.stringify(playersExtinctionGoats) != JSON.stringify(newPlayersExtinctionGoats)) {
    //     console.log(JSON.stringify(playersExtinctionGoats) != JSON.stringify(newPlayersExtinctionGoats))
    //     setPlayersExtinctionGoats(newPlayersExtinctionGoats)
    // }
    // // setPlayersExtinctionGoats(newPlayersExtinctionGoats)
    // if (JSON.stringify(opponentPlayersExtinctionGoats) != JSON.stringify(newOpponentPlayersExtinctionGoats)) {
    //     console.log(JSON.stringify(opponentPlayersExtinctionGoats) != JSON.stringify(newOpponentPlayersExtinctionGoats))

    //     setOpponentPlayersExtinctionGoats(newOpponentPlayersExtinctionGoats)
    // }
    // // setOpponentPlayersExtinctionGoats(newOpponentPlayersExtinctionGoats)

    // console.log('ExtinctionGoats', playersExtinctionGoats, opponentPlayersExtinctionGoats)
    // 自分の場から壊された羊トークン
    // const playersExtinctionGoats = [41, 42, 43, 44, 91, 92, 93, 94].filter((id) => allCards[id].position.prevLocation == 'monsterZone' && allCards[id].position.prevLocation == playerId && allCards[id].location != 'monsterZone')
    // 相手の場から壊された羊トークン
    // const opponentPlayersExtinctionGoats = [41, 42, 43, 44, 91, 92, 93, 94].filter((id) => allCards[id].position.prevLocation == 'monsterZone' && allCards[id].position.prevLocation == opponentPlayerId && allCards[id].location != 'monsterZone')

    const arrowview = () => {
        socket.emit('displayArrow', { roomName, attackerId: 1, targetId: 51 });

    }

    const handleClickSelect = () => {
        console.log('カード選択ハンドラ', selectTargetProps.targetCards)
        console.log(fields,JSON.stringify(fields))
        console.log(extinctionGoats, JSON.stringify(extinctionGoats))

        console.log(JSON.stringify(selectTargetProps.targetCards) == JSON.stringify([999]))
        console.log(selectTargetProps.targetCards == [999])

        if (JSON.stringify(selectTargetProps.targetCards) == JSON.stringify([999])) {
            console.log('ダイレクト！！！！')
            selectTargetProps.setSelectTarget('');
            selectTargetProps.setSelectTargetFlag(false);
            socket.emit('selectCard', { cardId:'' });
        }
    }


    return (
        <div className='game-board' id='game-board'>
            <div className='field opponent'>
                <div className='row hand-row opponent'>
                    <div className={`hand-wrapper wrapper ${JSON.stringify(selectTargetProps.targetCards) == JSON.stringify([999]) ? 'card-glow' : ''}`} id='oppo-hand' onClick={() => handleClickSelect()}>
                        <div className='hand zone'>
                            {/* 手札の表示 */}
                            {boardData.hand[opponentPlayerId].map((cardId) => (
                                <CardComponent key={cardId} cardId={cardId} cardProps={cardProps} fields={fields} fieldsSetter={fieldsSetter} props={props} onHover={setHoverCardId} visualizeEffect={visualizeEffect}/>
                                ))}
                        </div>
                    </div>
                </div>
                {(props.otherProps.oppoChoicing) && (
                    <div className='choicing'>
                        <LoadingComponent />
                    </div>
                )}
                {opponentPlayerDamageValue !== 0 && (
                    <DamageDisplay
                        players={players}
                        playerId={playerId}
                        damagePlayer={opponentPlayerId}
                        damageValue={opponentPlayerDamageValue}
                        onClose={() => setOpponentPlayerDamageValue(0)}
                    />
                )}
                {/* {!isMobile && (
                    <div className='opponent-life-point life-point'>
                        {players[opponentPlayerId].hp}
                    </div>
                )} */}
                <div className='row spel-trap-row opponent'>
                    {!isMobile && (
                        <div className="spacer"></div>
                    )}
                    <div className='deck-wrapper wrapper' onClick={() => handleDisplayCardList(boardData.deck[opponentPlayerId], playerId, opponentPlayerId, "deck", setHoverCardId, isMobile, boardData, mobileDisplayCardsPropsFields)}>
                        <div className='deck zone'>
                            {[...boardData.deck[opponentPlayerId]].reverse().map((cardId, index) => (
                                <CardComponent key={cardId} cardId={cardId} cardProps={cardProps} fields={fields} fieldsSetter={fieldsSetter} props={props} onHover={setHoverCardId} visualizeEffect={visualizeEffect}/>
                            ))}
                            <div className='card-overlay counter'>
                                {boardData.deck[opponentPlayerId].length}
                            </div>
                        </div>
                        <div className={`opponent-life-point life-point ${isMobile ?'mobile':''} `}>
                            {players[opponentPlayerId].hp}
                        </div>
                    </div>
                    <div className='spel-trap-zone-wrapper wrapper'>
                        <div className='spel-trap-zone zone'>
                            {boardData.spellTrapZone[opponentPlayerId].map((cardId, index) => (
                                cardId != null ? 
                                <CardComponent key={cardId} cardId={cardId} cardProps={cardProps} fields={fields} fieldsSetter={fieldsSetter} props={props} onHover={setHoverCardId} visualizeEffect={visualizeEffect}/>
                                    : <div className='card blank' key={index + 100} ></div>
                            ))}
                            <div className='background-text'>魔法・罠ゾーン</div>
                        </div>
                    </div>
                    <div className="spacer"></div>
                    {!isMobile && (
                        <div className="spacer"></div>
                    )}
                </div>
                <div className='row monster-row opponent'>
                    {!isMobile && (
                        <div className='banish-zone-wrapper wrapper' onClick={() => handleDisplayCardList(boardData.banishZone[opponentPlayerId], playerId, opponentPlayerId, "banishZone", setHoverCardId, isMobile, boardData, mobileDisplayCardsPropsFields)}>
                            <div className='banish-zone zone'>
                                {boardData.banishZone[opponentPlayerId].map((cardId, index) => (
                                    <CardComponent key={cardId} cardId={cardId} cardProps={cardProps} fields={fields} fieldsSetter={fieldsSetter} props={props} onHover={setHoverCardId} visualizeEffect={visualizeEffect}/>
                                ))}
                                <div className='background-text'>除</div>
                            </div>
                        </div>
                    )}
                    <div className='graveyard-wrapper wrapper'>
                        <div className='graveyard zone' onClick={() => handleDisplayCardList(boardData.graveyard[opponentPlayerId], playerId, opponentPlayerId, "graveyard", setHoverCardId, isMobile, boardData, mobileDisplayCardsPropsFields)}>
                            {boardData.graveyard[opponentPlayerId].map((cardId, index) => (
                                <CardComponent key={cardId} cardId={cardId} cardProps={cardProps} fields={fields} fieldsSetter={fieldsSetter} props={props} onHover={setHoverCardId} visualizeEffect={visualizeEffect}/>
                            ))}
                            <div className='background-text'>墓</div>
                        </div>
                        {isMobile && (
                            <div className='banish-zone-mobile-wrapper opponent-player'>
                                <div className='banish-zone-mobile opponent-player mobile'>
                                    <button onClick={() => handleDisplayCardList(boardData.banishZone[opponentPlayerId], playerId, opponentPlayerId, "banishZone", setHoverCardId, isMobile, boardData, mobileDisplayCardsPropsFields)}><span className='banish-span-first'>除外</span><span className='banish-span-second'>ゾーン</span></button>
                                    <div className='banish-zone zone'>
                                        {boardData.banishZone[opponentPlayerId].map((cardId, index) => (
                                            <CardComponent key={cardId} cardId={cardId} cardProps={cardProps} fields={fields} fieldsSetter={fieldsSetter} props={props} onHover={setHoverCardId} visualizeEffect={visualizeEffect} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* <div className='graveyard-wrapper wrapper'>
                        <div className='graveyard zone' onClick={() => handleDisplayCardList(boardData.graveyard[playerId], playerId, playerId, "graveyard", setHoverCardId, isMobile)}>
                            {boardData.graveyard[playerId].map((cardId, index) => (
                                <CardComponent key={cardId} cardId={cardId} cardProps={cardProps} fields={fields} fieldsSetter={fieldsSetter} props={props} onHover={setHoverCardId} visualizeEffect={visualizeEffect} />
                            ))}
                            <div className='background-text'>墓</div>
                        </div>
                        {isMobile && (
                            <div className='banish-zone-mobile player mobile'>
                                <button onClick={() => handleDisplayCardList(boardData.banishZone[playerId], playerId, playerId, "banishZone", setHoverCardId, isMobile)}>除外ゾーン</button>
                            </div>
                        )}
                    </div> */}
                    <div className='monster-zone-wrapper wrapper'>
                        <div className='monster-zone zone'>
                            {boardData.monsterZone[opponentPlayerId].map((cardId, index) => (
                                cardId != null ?
                                    <CardComponent key={cardId} cardId={cardId} cardProps={cardProps} fields={fields} fieldsSetter={fieldsSetter} props={props} onHover={setHoverCardId} visualizeEffect={visualizeEffect} />
                                    : <div className='card blank' key={index + 100} ></div>
                            ))}
                            <div className='background-text'>モンスターゾーン</div>
                        </div>
                        {/* 羊トークンが破壊された時用の背景位置 */}
                        <div className='only-goats-zone zone'>
                            {extinctionGoats[opponentPlayerId].map((cardId, index) => (
                                (cardId != null && cardId != undefined) ?
                                    <ExtinctionGoats key={cardId} cardId={cardId} playerId={opponentPlayerId} extinctionGoats={extinctionGoats} setExtinctionGoats={setExtinctionGoats} />
                                    : <div className='card blank' key={index + 100} ></div>
                            ))}
                        </div>
                    </div>
                    <div className="spacer"></div>
                    {!isMobile && (
                        <div className="spacer"></div>
                    )}
                </div>
            </div>
            <div>


            </div>
            <div className='field you'>
                <div className='row monster-row you'>
                    {!isMobile && (
                        <div className="spacer"></div>
                    )}
                    <div className="spacer"></div>
                    <div className='monster-zone-wrapper wrapper'>
                        <div className='monster-zone zone'>
                            {boardData.monsterZone[playerId].map((cardId, index) => (
                                cardId != null ?
                                    <CardComponent key={cardId} cardId={cardId} cardProps={cardProps} fields={fields} fieldsSetter={fieldsSetter} props={props} onHover={setHoverCardId} visualizeEffect={visualizeEffect} />
                                    : <div className='card blank' key={index + 100} ></div>
                            ))}
                            <div className='background-text'>モンスターゾーン</div>
                        </div>
                        {/* 羊トークンが破壊された時用の背景位置 */}
                        <div className='only-goats-zone zone'>
                            {extinctionGoats[playerId].map((cardId, index) => (
                                (cardId != null && cardId != undefined) ?
                                    <ExtinctionGoats key={cardId} cardId={cardId} playerId={playerId} extinctionGoats={extinctionGoats} setExtinctionGoats={setExtinctionGoats} />
                                : <div className='card blank' key={index + 100} ></div>
                            ))}
                        </div>
                    </div>
                    <div className='graveyard-wrapper wrapper'>
                        <div className='graveyard zone' onClick={() => handleDisplayCardList(boardData.graveyard[playerId], playerId, playerId, "graveyard", setHoverCardId, isMobile, boardData, mobileDisplayCardsPropsFields)}>
                            {boardData.graveyard[playerId].map((cardId, index) => (
                                <CardComponent key={cardId} cardId={cardId} cardProps={cardProps} props={props} onHover={setHoverCardId} visualizeEffect={visualizeEffect}/>
                            ))}
                            <div className='background-text'>墓</div>
                        </div>
                        {isMobile && (
                            <div className='banish-zone-mobile-wrapper player'>
                                <div className='banish-zone-mobile player mobile'>
                                    <button onClick={() => handleDisplayCardList(boardData.banishZone[playerId], playerId, playerId, "banishZone", setHoverCardId, isMobile, boardData, mobileDisplayCardsPropsFields)}><span className='banish-span-first'>除外</span><span className='banish-span-second'>ゾーン</span></button>
                                    <div className='banish-zone zone'>
                                        {boardData.banishZone[playerId].map((cardId, index) => (
                                            <CardComponent key={cardId} cardId={cardId} cardProps={cardProps} props={props} onHover={setHoverCardId} visualizeEffect={visualizeEffect} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                        )}
                    </div>
                    {!isMobile && (
                        <div className='banish-zone-wrapper wrapper' onClick={() => handleDisplayCardList(boardData.banishZone[playerId], playerId, playerId, "banishZone", setHoverCardId, isMobile, boardData, mobileDisplayCardsPropsFields)}>
                            <div className='banish-zone zone'>
                                {boardData.banishZone[playerId].map((cardId, index) => (
                                    <CardComponent key={cardId} cardId={cardId} cardProps={cardProps} props={props} onHover={setHoverCardId} visualizeEffect={visualizeEffect}/>
                                ))}
                                <div className='background-text'>除</div>
                            </div>
                        </div>
                    )}
                </div>
                <div className='row spel-trap-row you'>
                    {!isMobile && (
                        <div className="spacer"></div>
                    )}
                    <div className="spacer"></div>
                    <div className='spel-trap-zone-wrapper wrapper'>
                        <div className='spel-trap-zone zone'>
                            {boardData.spellTrapZone[playerId].map((cardId, index) => (
                                cardId != null ?
                                    <CardComponent key={cardId} cardId={cardId} cardProps={cardProps} fields={fields} fieldsSetter={fieldsSetter} props={props} onHover={setHoverCardId} visualizeEffect={visualizeEffect} />
                                    : <div className='card blank' key={index + 100} ></div>
                            ))}
                            <div className='background-text'>魔法・罠ゾーン</div>
                        </div>
                    </div>
                    <div className='deck-wrapper wrapper' onClick={() => handleDisplayCardList(boardData.deck[playerId], playerId, playerId, "deck", setHoverCardId, isMobile, boardData, mobileDisplayCardsPropsFields)}>
                        <div className='deck zone'>
                            {[...boardData.deck[playerId]].reverse().map((cardId, index) => (
                                <CardComponent key={cardId} cardId={cardId} cardProps={cardProps} props={props} onHover={setHoverCardId} visualizeEffect={visualizeEffect}/>
                            ))}
                            <div className='card-overlay counter'>
                                {boardData.deck[playerId].length}
                            </div>
                        </div>
                        <div className={`player-life-point life-point mobile ${isMobile ? 'mobile' : ''} `}>
                            {players[playerId].hp}
                        </div>
                    </div>
                    {!isMobile && (
                        <div className="spacer"></div>
                    )}
                </div>
                {playerDamageValue !== 0 && (
                    <DamageDisplay
                        players={players}
                        playerId={playerId}
                        damagePlayer={playerId}
                        damageValue={playerDamageValue}
                        onClose={() => setPlayerDamageValue(0)}
                    />
                )}
                {/* {!isMobile && (
                    <div className='player-life-point life-point'>
                        {players[playerId].hp}
                    </div>
                )} */}
                <div className='row hand-row you'>
                    <div className='hand-wrapper wrapper'>
                        <div className='hand zone'>
                            {/* 手札の表示 */}
                            {boardData.hand[playerId].map((cardId) => (
                                <CardComponent key={cardId} cardId={cardId} cardProps={cardProps} props={props} onHover={setHoverCardId} visualizeEffect={visualizeEffect}/>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* 効果解決時のカードエフェクト */}
            <div className='effect-resolution-effect'>
                {effectVisible && (
                    <img
                        src={allCards[visualizeCardId].picture} // エフェクトに使用するカード画像
                        className="card-animation"
                    />
                )}
            </div>
            {chainConfirmFlag && !selectTargetFlag && (
                <div className='chain-component'>
                    <ChainConfirm
                        socket={socket}
                        roomName={roomName}
                        fields={fields}
                        players={players}
                        setPlayers={setPlayers}
                        chainProps={chainProps}
                        playerId={playerId}
                        opponentPlayerId={opponentPlayerId}
                        setChainConfirmFlag={setChainConfirmFlag}
                        chainBlockCards={chainBlockCards}
                        eventName={eventName}
                        setActionMonster={chainProps.setActionMonster}
                        conditions={cardProps.conditions}
                        setConditions={cardProps.setConditions}
                        otherProps={props.otherProps}
                        setEffecting={setEffecting}
                    />
                </div>
            )}
            {selectTargetFlag && (
                <div className='select-tager-component'>
                    <SelectTarget socket={socket} card={effectingCard} selectTargetProps={selectTargetProps} effecting={cardProps.effecting} conditions={cardProps.conditions} attackOption={selectTargetProps.attackOption}/>
                </div>
            )}
            {/* 対象選択しているときは非表示 */}
            {props.quickEffectTiming && !selectTargetFlag && (
                <div className='select-tager-component'>
                    <QuickEffect
                        socket={socket}
                        roomName={roomName}
                        players={players}
                        setPlayers={setPlayers}
                        playerId={playerId}
                        opponentPlayerId={opponentPlayerId}
                        setQuickEffectTiming={props.setQuickEffectTiming}
                        conditions={cardProps.conditions}
                        setConditions={cardProps.setConditions}
                        setSpellSpeed={setSpellSpeed}
                        phase={cardProps.phase}
                        chainProps={chainProps}
                        eventName={eventName}
                        quickEffectStack={quickEffectStack}
                        fields={fields}
                        oppoChoicing={props.otherProps.oppoChoicing}
                        setOppoChoicing={props.otherProps.setOppoChoicing}
                        setEffecting={setEffecting}
                    />
                </div>
            )}
            <div id='select-cards'>

            </div>
            <div id='choice'>

            </div>
            <div id='display-all-card'>

            </div>
            <div id='display-zone-card'>

            </div>
            <div id='display-private-cards'>

            </div>
            <div id='cuation-select'>

            </div>
            

            {/* <button onClick={()=>arrowview(true)}> trigger </button> */}
            <div id='attack-arrow'>
            </div>
        </div>
    );
};

export { BoardComponent };