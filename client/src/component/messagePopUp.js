import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { allCards } from '../models/cards';

import '../css/popMessage.css';


const MessagePopUp = (props) => {
    console.log(props)
    const message = props.message
    const handleBack = () => {
        props.back();
    };

    return (
        <div className='pop-message' onClick={handleBack}>
            <div>
                <button onClick={handleBack} className='back-button'>閉じる</button>
            </div>
            <h3>{message}</h3>
        </div>
    )
}

const handleMessagePopUp = (message) => {
    console.log('message viewing...')
    return new Promise((resolve) => {
        const handlePopUp = () => {
            root.unmount(); // コンポーネントのアンマウント
            console.log('unmounted')
            resolve();
        };

        const messagePopUplement = document.createElement('div');
        document.body.appendChild(messagePopUplement);

        const root = createRoot(messagePopUplement);
        root.render(<MessagePopUp message={message} back={handlePopUp} />);
    });
}

export { MessagePopUp, handleMessagePopUp };