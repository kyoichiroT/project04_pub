class Game {
    constructor(roomName, players, firstPlayer, area, deck, scene, prevGame) {
        this.roomName = roomName;
        this.players = players;
        this.firstPlayer = firstPlayer;
        this.area = area;
        this.deck = deck;
        this.scene = scene;
        this.prevGame = prevGame;
    }
}

class Player {
    constructor(id, name, hp, rightOfSummon, priority, turnPlayer, useGoats, useReverseAndSpecialSummon, matchData) {
        this.id = id;
        this.name = name;
        this.hp = hp;
        this.rightOfSummon = rightOfSummon;
        this.priority = priority;
        this.turnPlayer = turnPlayer;
        this.useGoats = useGoats;
        this.useReverseAndSpecialSummon = useReverseAndSpecialSummon; // 通常召喚リバース特殊召喚をしたか司る。スケゴ以外には使わない
        this.matchData = matchData;
    }
}

class Card {
    static faceDown = './04picture/face-down.jpg';

    constructor(id, name, effect, cardtype, description, picture, faceStatus, location, controller, owner, canChange, position) {
        this.id = id;
        this.name = name;
        this.effect = effect;
        this.cardtype = cardtype;
        this.description = description;
        this.picture = picture;
        this.faceStatus = faceStatus;
        this.location = location;// どのゾーンに居るか
        this.controller = controller;
        this.owner = owner
        this.canChange = canChange;// 表示形式の変更可能や伏せたターンの魔法罠制限 魔法罠に関しては伏せたターンかどうかの判別に使用
        this.position = position;// 前回のlocationとコントローラーとモンスター魔法罠であれば何番目かを保存
    }
}

// FACE_STATUS = {
//     up,
//     down,
//     downDef,
//     attack,
//     def
// }

// LOCATION = {
//     deck,
//     hand,
//     monsterZone,
//     spellTrapZone,
//     graveyard,
//     banishZone,
// }

class Field {
    constructor(name, cards) {
        this.name = name;
        this.cards = cards;
    }
}

class Phase {
    constructor(name) {
        this.name = name;
    }
}

class Scene {
    constructor(id, name, priority) {
        this.id = id;
        this.name = name;
        this.priority = priority;
    }
}

class Monster extends Card {
    constructor(
        id,
        name,
        effect,
        cardtype,
        description,
        picture,
        faceStatus,
        location,
        controller,
        owner,
        canChange,
        position,
        level,
        attack,
        defense,
        type, // 戦士族とか
        attribute, //闇属性とか
        link,
        counter,
        attackable, //攻撃できるかどうか、開闢の効果反動など
        uuid, // 召喚時に付くuuid.墓地に送られただけでは削除されずデッキに戻るときに削除される
    ) {
        super(id, name, effect, cardtype, description, picture, faceStatus, location, controller, owner, canChange, position);
        this.level = level;
        this.attack = attack;
        this.defense = defense;
        this.type = type;
        this.attribute = attribute;
        this.link = link;
        this.counter = counter;
        this.attackable = attackable;
        this.uuid = uuid;
    }
}

class Spell extends Card {
    constructor(
        id,
        name,
        effect,
        cardtype,
        description,
        picture,
        faceStatus,
        location,
        controller,
        owner,
        canChange,
        position,
        category, //装備とか永続とか
        link, //装備先のID
        counter,// 護封剣のカウンター
    ) {
        super(id, name, effect, cardtype, description, picture, faceStatus, location, controller, owner, canChange, position);
        this.category = category;
        this.link = link;
        this.counter = counter;
    }
}

// CATEGORY = {
//     normal,
//     quick,
//     equip,
//     continuous,
//     swordsOfRevealingLight,
// }

class Trap extends Card {
    constructor(
        id,
        name,
        effect,
        cardtype,
        description,
        picture,
        faceStatus,
        location,
        controller,
        owner,
        canChange, // 伏せたターンは使えない
        position,
        category, //装備とか永続とか
        link, //リビングデッドのリンク先
    ) {
        super(id, name, effect, cardtype, description, picture, faceStatus, location, controller, owner, canChange, position);
        this.category = category;
        this.link = link;
    }
}

class Effect {
    constructor(effectDetails, spellSpeed, triggerCondition, canUse, cost, costValue, target) {
        this.effectDetails = effectDetails;
        this.spellSpeed = spellSpeed;
        this.triggerCondition = triggerCondition; // 発動タイミング
        this.canUse = canUse; // モンスター効果の回数制限など
        this.cost = cost;
        this.costValue = costValue;
        this.target = target;
    }
}

// TRIGGER_CONDITON = {
//     summon, //ブレイカーの誘発
//     summoned, //召喚時　奈落
//     attack, //攻撃時　炸裂
//     battle, //イグユニ
//     battleCalc, //お注射天使リリー
//     damageConfirm, //パーシアスなど、お注射天使リリーの効果切れ
//     battleConfirm, //女戦士とリバース効果
//     ignition, //起動効果
//     normalSpell, //通常魔法
//     none, //フリーチェーン
//     reverse, //リバース
//     battleEnd, //開闢の効果確認
//     end, //心変わり、イグユニ効果切れ
//     stanby, //強奪、キラスネ
//     normalSpell, //通常魔法
// }

// COST = {
//     lifePoint,
//     discard,
//     self, // ならず者傭兵部隊
//     counter, // ブレイカー
// }

class MonsterZone extends Field {
    constructor(position, attackable) {
        this.position = position;
        this.attackable = attackable;
    }
}

class SpellTrapZone extends Field {
    constructor(position, trapActivatable, trapInvalidate) {
        this.position = position;
        this.trapActivatable = trapActivatable;
        this.trapInvalidate = trapInvalidate;
    }
}

class Graveyard extends Field {
    constructor(banishable) {
        this.banishable = banishable;
    }
}

class BanishZone extends Field {
    constructor() {
        
    }
}



export { Player, Card, Monster, Spell, Trap, Effect };
