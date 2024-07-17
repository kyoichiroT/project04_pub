import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import '../css/arrow.css';
import { allCards } from '../models/cards';

const ArrowComponent = ({ playerId, monsterZone, fromCardId, toCardId }) => {
    const [arrowStyle, setArrowStyle] = useState({});

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

    const calucPosition = () => {
        
        let allMonsters = Object.keys(monsterZone)[0] == playerId ? [...Object.values(monsterZone)[1], null, ...Object.values(monsterZone)[0], null] : [...Object.values(monsterZone)[0], null, ...Object.values(monsterZone)[1], null];
        // console.log(allMonsters)
        fromIndex = allMonsters.findIndex(cardId => cardId === fromCardId);
        toIndex = allMonsters.findIndex(cardId => cardId === toCardId);
    
        // 攻撃モンスターのインデックス
        const monsterElement = document.querySelectorAll('.monster-zone > div')
        // console.log('monsterElement', monsterElement.length , monsterElement )
        fromElement = monsterElement[fromIndex]
        // toElement = monsterElement[toIndex]
        if (toCardId != '') {
            toElement = monsterElement[toIndex]
        } else if (allCards[fromCardId].controller == playerId){
            toElement = document.querySelectorAll('.hand-wrapper')[0]
        } else {
            toElement = document.querySelectorAll('.hand-wrapper')[1]            
        }  
        // console.log(toElement)
        if (!fromElement) {
            console.log(allMonsters, fromCardId, toCardId, fromIndex, toIndex, fromElement, toElement)
        }
        if (!toElement) {
            console.log(allMonsters, fromCardId, toCardId, fromIndex, toIndex, fromElement, toElement)
        }
        
    
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        fromX = fromRect.left + window.scrollX + fromRect.width / 2;
        fromY = fromRect.top + window.scrollY + fromRect.height / 2;
        toX = toRect.left + window.scrollX + toRect.width / 2;
        toY = toRect.top + window.scrollY + toRect.height / 2;
        // console.log(fromX, fromY, toX, toY);
    
        // 角度（ラジアン）を計算
        angle = Math.atan2(toY - fromY, toX - fromX);
    
        // 距離（矢印の長さ）を計算
        distance = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2)
    }
    calucPosition()

    useEffect(() => {
        console.log('arrow rerendering')
        let start = null;
        const maxDuration = 400; // 1フェーズあたりの持続時間

        function animateArrow(timestamp) {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const totalProgress = elapsed / maxDuration;
            const progress = totalProgress % 1; // 0から1の間をループ

            const isExpanding = Math.floor(totalProgress) % 2 === 0; // 偶数フェーズは拡張、奇数フェーズは縮小

            let arrowWidth, arrowLeft, arrowTop;
            if (isExpanding) {
                // 拡張フェーズ: 矢印が伸びる
                arrowWidth = distance * progress;
                arrowLeft = fromX;
                arrowTop = fromY;
            } else {
                // 縮小フェーズ: 矢印が縮む
                arrowWidth = distance * (1 - progress);
                arrowLeft = fromX + (toX - fromX) * progress;
                arrowTop = fromY + (toY - fromY) * progress;
            }

            setArrowStyle({
                left: `${arrowLeft}px`,
                top: `${arrowTop}px`,
                width: `${arrowWidth}px`,
                transform: `rotate(${angle}rad)`,
                transformOrigin: 'left center',
                position: 'absolute',
                zIndex: 2

            });

            requestAnimationFrame(animateArrow);
        }

        const animId = requestAnimationFrame(animateArrow);
        return () => cancelAnimationFrame(animId);
    }, [fromX, fromY, angle, distance]);




    return <div className="arrow" style={arrowStyle} />;

}

// ダイレクトアタック時はtargetCardId = ''
const displayArrow = async (playerId, monsterZone, attackCardId, targetCardId) => {
    console.log('arrowing...', attackCardId, targetCardId)
    const arrowElement = document.getElementById('attack-arrow');
    // document.body.appendChild(cardSelectionElement);

    const root = createRoot(arrowElement);
    root.render(<ArrowComponent playerId={playerId} monsterZone={monsterZone} fromCardId={attackCardId} toCardId={targetCardId} />);
    return root;
};


export default displayArrow;
