import React, { useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import { allCards } from '../models/cards';
import '../css/goats.css'

const ExtinctionGoats = (props) => {
    console.log(props)
    const cardId = props.cardId;
    const card = allCards[cardId];
    const extinctionGoats = props.extinctionGoats
    const setExtinctionGoats = props.setExtinctionGoats
    const playerId = props.playerId
    console.log(card);
    // console.log(card)
    const [isUnmount, setIsUnmount] = useState(false);
    console.log(props);
    const extinctionAnimation = useSpring({
        to: {
            opacity: 0, // 縮小して消えるアニメーション
            transform: 'scale(0)'
        },
        from: { opacity: 1, transform: 'scale(1)' },
        config: { duration: 500 },
        onRest: () => {
            setIsUnmount(true)
            card.position.prevLocation == null
            console.log('extinctionAnimation end')
            let newGoats = extinctionGoats;
            // アニメーションが終わったらトークン消滅用配列から外す
            const index = newGoats[playerId].indexOf(cardId);
            console.log(index);
            if (index !== -1) {
                newGoats[playerId][index] = null;
            }
            setExtinctionGoats(newGoats);
        }
    });
    if (!isUnmount) {
        return (
            <animated.div className='card-component' style={{...extinctionAnimation}}>
                <div className='card'>
                    <div className='card-img-wrapper'>
                        {(card.faceStatus == "attack") ?
                            <img src={card.picture} alt={card.name} className='card-pic attack' />
                            :   <img src={card.picture} alt={card.name} className='card-pic def' />
                        }
                    </div>
                </div>
            </animated.div >
    
            // <div className='display-card-picture' onClick={() => handleClick()} onMouseEnter={() => props.onHover(props.cardId)} onMouseLeave={() => props.onHover(null)}>
            //     < img src={card.picture} alt='card' className='card-pic' />
            // </div>
        )
    } else {
        return null
    }
}

export default ExtinctionGoats;