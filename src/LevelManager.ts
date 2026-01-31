import { LevelConfig, EnemyType, ObstacleType } from './Level';
import { Base } from './Base';

// 内置关卡数据
const LEVELS: LevelConfig[] = [
    {
        id: 'level_1',
        name: '新手训练',
        description: '消灭所有敌人，保护基地',
        mapSize: 100,
        playerStart: { x: 0, y: 0, z: 30 },
        base: { position: { x: 0, y: 0, z: 40 } },
        enemies: [
            { type: EnemyType.NORMAL, position: { x: -10, y: 0, z: -10 }, delay: 0 },
            { type: EnemyType.NORMAL, position: { x: 10, y: 0, z: -10 }, delay: 2 },
            { type: EnemyType.NORMAL, position: { x: 0, y: 0, z: -20 }, delay: 4 }
        ],
        obstacles: [
            { type: ObstacleType.BRICK, position: { x: -15, y: 1.5, z: 0 }, size: { x: 4, y: 3, z: 4 } },
            { type: ObstacleType.BRICK, position: { x: 15, y: 1.5, z: 0 }, size: { x: 4, y: 3, z: 4 } },
            { type: ObstacleType.STEEL, position: { x: 0, y: 1.5, z: 10 }, size: { x: 6, y: 3, z: 2 } }
        ]
    },
    {
        id: 'level_2',
        name: '正面交锋',
        description: '敌人更多，注意防守',
        mapSize: 100,
        playerStart: { x: 0, y: 0, z: 30 },
        base: { position: { x: 0, y: 0, z: 40 } },
        enemies: [
            { type: EnemyType.NORMAL, position: { x: -15, y: 0, z: -15 }, delay: 0 },
            { type: EnemyType.NORMAL, position: { x: 15, y: 0, z: -15 }, delay: 2 },
            { type: EnemyType.FAST, position: { x: 0, y: 0, z: -20 }, delay: 4 },
            { type: EnemyType.NORMAL, position: { x: -10, y: 0, z: -25 }, delay: 6 },
            { type: EnemyType.NORMAL, position: { x: 10, y: 0, z: -25 }, delay: 8 }
        ],
        obstacles: [
            { type: ObstacleType.BRICK, position: { x: -20, y: 1.5, z: 5 }, size: { x: 4, y: 3, z: 6 } },
            { type: ObstacleType.BRICK, position: { x: 20, y: 1.5, z: 5 }, size: { x: 4, y: 3, z: 6 } },
            { type: ObstacleType.STEEL, position: { x: -10, y: 1.5, z: 20 }, size: { x: 3, y: 3, z: 3 } },
            { type: ObstacleType.STEEL, position: { x: 10, y: 1.5, z: 20 }, size: { x: 3, y: 3, z: 3 } },
            { type: ObstacleType.BRICK, position: { x: 0, y: 1.5, z: -5 }, size: { x: 6, y: 3, z: 4 } }
        ]
    },
    {
        id: 'level_3',
        name: '重重包围',
        description: '重型坦克出现，小心应对',
        mapSize: 100,
        playerStart: { x: 0, y: 0, z: 30 },
        base: { position: { x: 0, y: 0, z: 40 } },
        enemies: [
            { type: EnemyType.NORMAL, position: { x: -20, y: 0, z: -10 }, delay: 0 },
            { type: EnemyType.NORMAL, position: { x: 20, y: 0, z: -10 }, delay: 0 },
            { type: EnemyType.FAST, position: { x: -15, y: 0, z: -20 }, delay: 4 },
            { type: EnemyType.FAST, position: { x: 15, y: 0, z: -20 }, delay: 4 },
            { type: EnemyType.HEAVY, position: { x: 0, y: 0, z: -25 }, delay: 8 },
            { type: EnemyType.NORMAL, position: { x: -10, y: 0, z: -30 }, delay: 12 },
            { type: EnemyType.NORMAL, position: { x: 10, y: 0, z: -30 }, delay: 12 },
            { type: EnemyType.HEAVY, position: { x: 0, y: 0, z: -35 }, delay: 16 }
        ],
        obstacles: [
            { type: ObstacleType.BRICK, position: { x: -20, y: 1.5, z: 10 }, size: { x: 6, y: 3, z: 4 } },
            { type: ObstacleType.BRICK, position: { x: 20, y: 1.5, z: 10 }, size: { x: 6, y: 3, z: 4 } },
            { type: ObstacleType.STEEL, position: { x: 0, y: 1.5, z: 0 }, size: { x: 4, y: 3, z: 4 } },
            { type: ObstacleType.BRICK, position: { x: -30, y: 1.5, z: -5 }, size: { x: 4, y: 3, z: 6 } },
            { type: ObstacleType.BRICK, position: { x: 30, y: 1.5, z: -5 }, size: { x: 4, y: 3, z: 6 } }
        ],
        items: [
            { type: 'health', position: { x: -15, y: 0, z: 20 } },
            { type: 'rocket', position: { x: 15, y: 0, z: 20 } }
        ]
    }
];

export class LevelManager {
    currentLevelIndex: number = 0;
    currentLevel: LevelConfig | null = null;
    base: Base | null = null;
    pendingEnemies: { spawn: any; timer: number }[] = [];
    
    constructor() {}

    getLevels(): LevelConfig[] {
        return LEVELS;
    }

    getLevelById(id: string): LevelConfig | undefined {
        return LEVELS.find(l => l.id === id);
    }

    setCurrentLevel(index: number) {
        if (index >= 0 && index < LEVELS.length) {
            this.currentLevelIndex = index;
            this.currentLevel = LEVELS[index];
        }
    }

    getCurrentLevel(): LevelConfig | null {
        return this.currentLevel;
    }

    hasNextLevel(): boolean {
        return this.currentLevelIndex < LEVELS.length - 1;
    }

    nextLevel(): boolean {
        if (this.hasNextLevel()) {
            this.currentLevelIndex++;
            this.currentLevel = LEVELS[this.currentLevelIndex];
            return true;
        }
        return false;
    }
}
