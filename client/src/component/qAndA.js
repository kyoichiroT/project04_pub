import React, { useState, useEffect, useRef } from 'react';
import { searcher } from '../gamePlayLogic';
import { allCards } from '../models/cards';

// import '../css/messageLog.css'

// QandAのコンポーネント
const QAndA = ({ setOpneQandA }) => {

    return (
        <div className='q-and-a-component'>
            <div className='q-and-a-header'>
                <div onClick={() => setOpneQandA(false)} className="close-button">
                    閉じる
                </div>
                <h1 className='q-and-a-title title-name'>
                    Q&amp;A
                </h1>
            </div>
            <div className='what-this-game'>
                <div className='question important-sentence'>
                    このゲームは何？
                </div>
                <div className='answer important-sentence'>
                    2004年環境で遊ぶカードゲームです。カードやルールは2004年11月時点(新エキスパートルール)になります。<br />
                    タイトルに表示されている【スタンダード】統一デッキを使用するミラーマッチです。<br />
                    現行のルールとは効果やルールが一部違う箇所があります。
                </div>
                <div className='answer'>
                    代表的な物は先行ドローあり<br />
                    キラースネークや破壊輪の効果がエラッタ前の効果<br />
                    召喚時にモンスターの起動効果を使えるなどです<br />
                    詳しくは以下をご確認ください
                </div>
            </div>
            <div className='question-and-answer'>
                <div className='question'>
                    Q.アプリケーションが動かなくなった(ボタンも何も動かない)
                </div>
                <div className='answer'>
                    A.申し訳ありません。おそらくアプリケーションエラーが起きています<br />
                    お手数ですが詳細な情報やスクリーンショットを添えて連絡お願いいたします。早急に修正いたします<br />
                </div>
            </div>
            <div className='question-and-answer'>
                <div className='question'>
                    Q.レイアウトが崩れる
                </div>
                <div className='answer'>
                    A.申し訳ありません。開発者の技術不足です。<br />
                      一部の画面サイズによっては一部箇所が見切れたりする場合があります<br />
                      申し訳ありませんが適宜画面サイズを調整してプレイいただくようよろしくお願いいたします。<br />
                      レイアウト等の最適化については現在開発中です。
                </div>
            </div>
            <div className='question-and-answer'>
                <div className='question'>
                    Q.先行1ターン目なのにドローしている
                </div>
                <div className='answer'>
                    A.新エキスパートルールでは先行1ターン目でもドローする事が出来ます
                </div>
            </div>
            <div className='question-and-answer'>
                <div className='question'>
                    Q.相手が同族感染ウイルスなどの起動効果を持つモンスターを召喚した時に<br />
                      自分が奈落の落とし穴を発動しようとしたが相手が先に同族感染ウイルスの効果を発動した
                </div>
                <div className='answer'>
                    A.モンスターの召喚は優先権を渡さない行為です。<br />
                      そして新エキスパートルールではターンプレイヤーはモンスターの召喚時に<br />
                      スペルスピード2のカードと同様にモンスターの起動効果を使えます。
                </div>
            </div>
            <div className='question-and-answer'>
                <div className='question'>
                    Q.自分が魔導戦士ブレイカーを召喚した時、<br />
                      相手プレイヤーがカードを発動する前にモンスターの起動効果が使えない
                </div>
                <div className='answer'>
                    A.魔導戦士ブレイカーは召喚時にカウンターを乗せる誘発効果が発動します。<br />
                    そのため誘発効果が発動した時点で相手に優先権が移ります。<br />
                    そしてモンスターの起動効果は魔導戦士ブレイカーの誘発効果にチェーンして発動することは出来ません。
                </div>
            </div>
            <div className='question-and-answer'>
                <div className='question'>
                    Q.戦闘時にファイバーポッドのリバース効果が発動し、戦闘破壊が確定しているのにファイバーポッド自身がデッキに戻っている
                </div>
                <div className='answer'>
                    A.当時の裁定では戦闘破壊が確定していてもファイバーポッドの効果が発動した場合ファイバーポッド自身もデッキに戻ります
                </div>
            </div>
            <div className='question-and-answer'>
                <div className='question'>
                    Q.キラースネーク/破壊輪の効果が違う
                </div>
                <div className='answer'>
                    A.2004年当時のエラッタ前のカード効果になります
                </div>
            </div>
            <div className='question-and-answer'>
                <div className='question'>
                    Q.抹殺の使徒でリバース効果モンスターを破壊した際に相手のデッキ確認と非公開カードの確認が出る
                </div>
                <div className='answer'>
                    A.抹殺の使徒でリバース効果モンスターを破壊した場合、お互いのデッキを確認して同名カードを全て除外します。<br />
                      そのためデッキ内容がわかっている04環境において現在の相手のデッキが分かる事により手札と場の非公開カードが判明します。<br />
                      プレイヤーの手間を省くためお互いの手札と場の非公開カードを一覧として表示しております。<br />
                      デッキ及び非公開カードはカードリストと同様にソートされて表示されています
                </div>
            </div>
            <div className='question-and-answer'>
                <div className='question'>
                    Q.カオス・ソルジャー －開闢の使者－を蘇生出来ない
                </div>
                <div className='answer'>
                    A.カオス・ソルジャー －開闢の使者－は特殊召喚モンスターであるため一度正規に特殊召喚しない限り墓地から蘇生させる事はできません。<br />
                    また一度召喚していたとしてもファイバーポッドで一度正規に特殊召喚したカオス・ソルジャー －開闢の使者－がデッキに戻った場合、再度正規に特殊召喚しなければ墓地から蘇生させる事は出来ません
                </div>
            </div>
            <div className='question-and-answer'>
                <div className='question'>
                    Q.リビングデッドの呼び声が自身の効果によって破壊されない
                </div>
                <div className='answer'>
                    A.リビングデッドの呼び声が自壊するのは「対象のモンスターが"破壊"された時」になります。<br />
                      カオス・ソルジャー －開闢の使者－と異次元の女戦士の効果は破壊せずに除外するためリビングデッドの呼び声はフィールドに残り続けます。<br />
                      しかし奈落の落とし穴は"破壊し、除外する"ためリビングデッドの呼び声で特殊召喚したモンスターを奈落の落とし穴で除外する場合はリビングデッドの呼び声は自身の効果で破壊されます
                </div>
            </div>
            <div className='question-and-answer'>
                <div className='question'>
                    Q.モンスターを召喚/反転召喚/特殊召喚が出来ない。スケープゴートが使えない。特殊召喚を行うカードの発動が出来ない
                </div>
                <div className='answer'>
                    A.スケープゴートを使用した場合、そのターン中に召喚/反転召喚/特殊召喚を行う事とモンスターを特殊召喚するカードの発動は<br />
                      同一チェーン上であっても出来ません。(ただし裏側守備表示でモンスターをセットする事は可能です)<br />
                      同様に既にモンスターを召喚/反転召喚/特殊召喚している場合や特殊召喚をするカードを発動している場合は同一チェーン上であったとしてもスケープゴートは発動する事が出来ません

                </div>
            </div>
            <div className='question-and-answer'>
                <div className='question'>
                    Qカオス・ソルジャー －開闢の使者－が特殊召喚出来ない/霊滅術師カイクウの戦闘ダメージを与えた時の効果が発動出来ない
                </div>
                <div className='answer'>
                    A.霊滅術師カイクウは「相手はお互いの墓地のカードを除外できない」常在効果があります。<br />
                      そのため相手フィールドに霊滅術師カイクウがいる場合<br />
                      カオス・ソルジャー －開闢の使者－の召喚と霊滅術師カイクウの戦闘ダメージを与えた時の効果は発動できません
                </div>
            </div>
            <div className='question-and-answer'>
                <div className='question'>
                    Q.裏側守備表示のリバース効果モンスターが戦闘によって表側になったがリバース効果が発動しない
                </div>
                <div className='answer'>
                    A.ブレイドナイトは「自分フィールド上にこのカード以外のモンスターが存在しない場合、破壊したリバースモンスターのリバース効果を無効にする」効果があります
                </div>
            </div>
            <div className='question-and-answer'>
                <div className='question'>
                    Q.効果発動して攻撃力が3400になっているお注射天使リリーに破壊輪を使いたい
                </div>
                <div className='answer'>
                    A.お注射天使リリーの効果はダメージ計算時にのみ適応されます。ダメージ計算時には破壊輪を発動する事は出来ません
                </div>
            </div>
            <div className='question-and-answer'>
                <div className='question'>
                    Q.激流葬/奈落の落とし穴が発動出来ない
                </div>
                <div className='answer'>
                    A.激流葬と奈落の落とし穴は召喚した"時"に発動出来るカードです。<br />
                      そのためチェーン2以降でスケープゴートやリビングデッドの呼び声を発動した場合にはタイミングを逃し発動出来ません
                </div>
            </div>
            <div className='question-and-answer'>
                <div className='question'>
                    Q.効果処理や裁定に間違いがある
                </div>
                <div className='answer'>
                    A.至急連絡願います
                </div>
            </div>
            {/* <div className='question-and-answer'>
                <div className='question'>
                    Q.先行1ターン目の強引な番兵/押収が強過ぎる
                </div>
                <div className='answer'>
                    A.相手が該当カードを引いていない事を祈りましょう
                </div>
            </div> */}
            <div onClick={() => setOpneQandA(false)} className="close-button bottom">
                閉じる
            </div>
        </div>
    );
}

export default QAndA;