import * as THREE from 'three';
import { Tank } from './Tank';
import { Projectile } from './Projectile';

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

    constructor(position: THREE.Vector3) {
        this.tank = new Tank(0xff0000); // Red tank
        this.tank.mesh.position.copy(position);
        // Rotate randomly initially
        this.tank.mesh.rotation.y = Math.random() * Math.PI * 2;
    }

    update(dt: number, player: Tank): Projectile | null {
        const dist = this.tank.mesh.position.distanceTo(player.mesh.position);
        
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
            // Aim at player
            this.tank.aim(player.mesh.position);

            // Move towards player
            // Calculate angle to player
            const targetPos = player.mesh.position.clone();
            targetPos.y = this.tank.mesh.position.y;
            
            this.tank.mesh.lookAt(targetPos);
            // Since model faces -Z, lookAt works if we move forward
            
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
        
        // Boundary check (simple)
        if (this.tank.mesh.position.x > 45 || this.tank.mesh.position.x < -45 ||
            this.tank.mesh.position.z > 45 || this.tank.mesh.position.z < -45) {
            this.tank.mesh.lookAt(0, 0, 0); // Turn back to center
        }

        return shootProjectile;
    }
}
