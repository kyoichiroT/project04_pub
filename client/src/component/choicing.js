import React, { useState, useEffect } from 'react';

const LoadingComponent = () => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(dots => {
                // 現在のドットの数に応じて次のドットの数を設定
                return dots.length < 3 ? dots + '.' : '';
            });
        }, 500); // 0.5秒ごとに更新

        // コンポーネントがアンマウントされたときにインターバルをクリア
        return () => clearInterval(interval);
    }, []);

    return <div style={{ textAlign: 'center' }}>相手が選択中です{dots}</div>;
}

export default LoadingComponent;