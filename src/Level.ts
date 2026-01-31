// 敌人类型枚举
export enum EnemyType {
    NORMAL = 'normal',
    FAST = 'fast',
    HEAVY = 'heavy'
}

// 障碍物类型枚举
export enum ObstacleType {
    BRICK = 'brick',
    STEEL = 'steel',
    WATER = 'water'
}

// 敌人生成配置
export interface EnemySpawn {
    type: EnemyType;
    position: { x: number; y: number; z: number };
    delay?: number;
}

// 障碍物配置
export interface ObstacleConfig {
    type: ObstacleType;
    position: { x: number; y: number; z: number };
    size: { x: number; y: number; z: number };
}

// 道具生成配置
export interface ItemSpawn {
    type: 'shield' | 'rocket' | 'health';
    position: { x: number; y: number; z: number };
}

// 基地配置
export interface BaseConfig {
    position: { x: number; y: number; z: number };
}

// 关卡配置接口
export interface LevelConfig {
    id: string;
    name: string;
    description?: string;
    mapSize: number;
    playerStart: { x: number; y: number; z: number };
    base: BaseConfig;
    enemies: EnemySpawn[];
    obstacles: ObstacleConfig[];
    items?: ItemSpawn[];
}

// 敌人属性配置
export const ENEMY_STATS = {
    [EnemyType.NORMAL]: {
        health: 50,
        speed: 8,
        damage: 10,
        color: 0xff0000
    },
    [EnemyType.FAST]: {
        health: 30,
        speed: 15,
        damage: 8,
        color: 0xff6600
    },
    [EnemyType.HEAVY]: {
        health: 100,
        speed: 5,
        damage: 25,
        color: 0x990000
    }
};
