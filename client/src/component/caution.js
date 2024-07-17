import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';


const Caution = ({ onSelect }) => {

    const message = "手札が7枚以上あります。エンドフェイズにて手札が6枚になるように捨てることになりますがエンドフェイズに移行しますか？"
    // console.log(message)
    const [isMinimized, setIsMinimized] = useState(false);

    const handleConfirmSelection = (selected) => {
        // 選択された選択肢を親コンポーネントに渡す
        // console.log(selected)
        onSelect(selected);
    };

    return (
        <div className={`card-selection-wrapper ${isMinimized ? 'minimized' : ''}`} id="caution-component">
            <div className={`card-selection ${isMinimized ? 'minimized' : ''}`}>
                <div className='minimize-button'>
                    {/* 縮小ボタン */}
                    <button onClick={() => setIsMinimized(true)}>縮小</button>
                </div>
                <div className="card-selection-header">
                    <h2>{message}</h2>
                </div>

                <div className='hand-over-flow buttons'>
                    <button onClick={() => handleConfirmSelection(true)} className='confirm-button'>エンドフェイズに進む</button>
                    <button onClick={() => handleConfirmSelection(false)} className='cancel-button'>現在のフェイズを続ける</button>
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


const useCautionSelect = () => {
    
    // console.log('waitForSelection')

    return new Promise((resolve) => {
        const handlePopUp = (value) => {
            root.unmount(); // コンポーネントのアンマウント
            console.log('unmounted')
            resolve(value);
        };

        const cautionElement = document.getElementById('cuation-select');
        // document.body.appendChild(cautionElement);
        
        const root = createRoot(cautionElement);
        root.render(<Caution onSelect={handlePopUp} />);
    });
    
    // const [isModalOpen, setIsModalOpen] = useState(false);

    // const waitForSelection = () => {
    //     console.log('waitForSelection')
    //     setIsModalOpen(true); // モーダルを開く
    //     return new Promise((resolve) => {
    //         // const modalRoot = document.getElementById('cuation-select'); // モーダルをマウントする要素
    //         const handleSelect = (value) => {
    //             setIsModalOpen(false); // ステートを更新
    //             console.log('resolve')
    //             resolve(value); // 選択結果でPromiseを解決
    //         };
    //         console.log('rendering...')

    //         // SelectionModalをPortalを使ってbody直下などにレンダリングする
    //         const modal = isModalOpen ? ReactDOM.createPortal(
    //             <Caution isOpen={true} onSelect={handleSelect} />,
    //             document.getElementById('cuation-select') // ここはマウントしたい実際のDOM要素に変更してください
    //             // document.body
    //         ) : null;
    //         return modal;
    //     });
    // };
    // return { waitForSelection };
};


export { Caution, useCautionSelect };


