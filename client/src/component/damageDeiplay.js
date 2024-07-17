import React, { useState, useEffect } from 'react';

import { allCards } from '../models/cards';

import '../css/damageDisplay.css'

const DamageDisplay = ({ players, playerId, damagePlayer, damageValue, onClose }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(onClose, 1000); // コンポーネントをアンマウントする前に2秒待つ
        }, 1000);

        return () => clearTimeout(timer);
    }, [onClose]);

    let target = '';
    if (playerId == damagePlayer) {
        target = 'player'
    } else {
        target = 'opponent'        
    }

    const displayClass = `damage-display ${target} ${damageValue > 0 ? 'damage' : 'heal'} ${fadeOut ? 'fade-out' : ''}`;



    return (
        <div className={displayClass}>
            <div>{damageValue > 0 ? `-${damageValue}` : `+${-damageValue}`}</div>
        </div>
    );
}


export default DamageDisplay;
