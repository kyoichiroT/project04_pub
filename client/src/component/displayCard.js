import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { allCards } from '../models/cards';

import '../css/selectCard.css';

const DisplayCard = (props) => {
    // console.log(props)
    const card = allCards[props.cardId];
    // console.log(card)
    const handleClick = () => {
        console.log('カード選択ハンドラ', card)
    }
    return (
        <div className='display-card-picture' onClick={() => handleClick()} onMouseEnter={() => props.onHover(props.cardId)} onMouseLeave={() => props.onHover(null)}>
            < img src={card.picture} alt='card' className='card-pic' />
        </div>
    )
}

export default DisplayCard ;