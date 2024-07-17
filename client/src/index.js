import React from 'react';
import ReactDOM from 'react-dom/client';
import Game from './Game';
import { Provider } from 'react-redux';
import store from './store';

import './css/index.css'
// ルートエレメントの取得
const rootElement = document.getElementById('root');

// createRootでルートを作成
const root = ReactDOM.createRoot(rootElement);

// アプリケーションのレンダリング
root.render(
    <Provider store={store}>
      <Game />
    </Provider>
);
// ReactDOM.render(<App />, document.getElementById("root"));