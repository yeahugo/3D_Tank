import * as THREE from 'three';
import { Tank } from './Tank';
import { Projectile } from './Projectile';
import { EnemyType, ENEMY_STATS } from './Level';
import { Base } from './Base';

export enum NPCState {
    PATROL,
    CHASE,
    ATTACK
}

export class NPC {
    tank: Tank;
    state: NPCState = NPCState.PATROL;
    changeStateTimer: number = 0;
    moveForward: boolean = false;
    enemyType: EnemyType;
    targetBase: boolean = false; // 是否优先攻击基地

    constructor(position: THREE.Vector3, type: EnemyType = EnemyType.NORMAL) {
        this.enemyType = type;
        const stats = ENEMY_STATS[type];
        
        this.tank = new Tank(stats.color);
        this.tank.mesh.position.copy(position);
        this.tank.health = stats.health;
        this.tank.maxHealth = stats.health;
        this.tank.speed = stats.speed;
        this.tank.damage = stats.damage;
        
        // Rotate randomly initially
        this.tank.mesh.rotation.y = Math.random() * Math.PI * 2;
        
        // 30% 概率优先攻击基地
        this.targetBase = Math.random() < 0.3;
    }

    update(dt: number, player: Tank, base?: Base): Projectile | null {
        const distToPlayer = this.tank.mesh.position.distanceTo(player.mesh.position);
        let distToBase = Infinity;
        
        if (base && !base.isDestroyed) {
            distToBase = this.tank.mesh.position.distanceTo(base.mesh.position);
        }
        
        // 决定目标：玩家或基地
        const targetIsBase = this.targetBase && base && !base.isDestroyed && distToBase < 60;
        const targetPos = targetIsBase ? base!.mesh.position.clone() : player.mesh.position.clone();
        const dist = targetIsBase ? distToBase : distToPlayer;
        
        // Simple State Machine
        if (dist < 20) {
            this.state = NPCState.ATTACK;
        } else if (dist < 40) {
            this.state = NPCState.CHASE;
        } else {
            this.state = NPCState.PATROL;
        }

        let shootProjectile: Projectile | null = null;

        if (this.state === NPCState.CHASE || this.state === NPCState.ATTACK) {
            // Aim at target
            this.tank.aim(targetPos);

            // Move towards target
            const moveTarget = targetPos.clone();
            moveTarget.y = this.tank.mesh.position.y;
            
            this.tank.mesh.lookAt(moveTarget);
            
            if (dist > 10) {
                this.tank.move(dt, true, false, false, false);
            }

            if (this.state === NPCState.ATTACK) {
                 // Shoot with some randomness
                 if (Math.random() < 0.02) {
                     shootProjectile = this.tank.shoot();
                 }
            }
        } else {
            // Patrol
            this.changeStateTimer -= dt;
            if (this.changeStateTimer <= 0) {
                this.changeStateTimer = 2 + Math.random() * 3;
                this.moveForward = Math.random() < 0.7;
                // Pick a random direction
                this.tank.mesh.rotation.y = Math.random() * Math.PI * 2;
            }
            
            if (this.moveForward) {
                this.tank.move(dt, true, false, false, false);
            }
            
            // Keep turret forward
            this.tank.turret.rotation.y = 0;
        }
        
        // Boundary check - 强制限制在边界内
        const boundary = 45;
        if (this.tank.mesh.position.x > boundary) {
            this.tank.mesh.position.x = boundary;
            this.tank.mesh.lookAt(0, 0, 0);
        }
        if (this.tank.mesh.position.x < -boundary) {
            this.tank.mesh.position.x = -boundary;
            this.tank.mesh.lookAt(0, 0, 0);
        }
        if (this.tank.mesh.position.z > boundary) {
            this.tank.mesh.position.z = boundary;
            this.tank.mesh.lookAt(0, 0, 0);
        }
        if (this.tank.mesh.position.z < -boundary) {
            this.tank.mesh.position.z = -boundary;
            this.tank.mesh.lookAt(0, 0, 0);
        }

        return shootProjectile;
    }
}
