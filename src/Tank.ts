import * as THREE from 'three';

import { Projectile } from './Projectile';

export class Tank {
    mesh: THREE.Group;
    body: THREE.Mesh;
    turret: THREE.Group;
    barrel: THREE.Mesh;
    speed: number = 10;
    rotateSpeed: number = 2;
    
    lastShotTime: number = 0;
    fireRate: number = 0.5;
    health: number = 100;
    maxHealth: number = 100;
    damage: number = 20;
    
    hasShield: boolean = false;
    shieldTimer: number = 0;
    damageBoostTimer: number = 0;

    constructor(color: number = 0x00ff00) {
        this.mesh = new THREE.Group();

        // Body
        const bodyGeo = new THREE.BoxGeometry(2, 1, 3);
        const bodyMat = new THREE.MeshStandardMaterial({ color });
        this.body = new THREE.Mesh(bodyGeo, bodyMat);
        this.body.position.y = 0.5;
        this.body.castShadow = true;
        this.body.receiveShadow = true;
        this.mesh.add(this.body);

        // Turret Group (to rotate independently)
        this.turret = new THREE.Group(); // Use a group for the turret assembly
        this.turret.position.y = 1.0;
        this.mesh.add(this.turret);

        // Turret Head
        const turretGeo = new THREE.BoxGeometry(1.5, 0.8, 2);
        const turretMat = new THREE.MeshStandardMaterial({ color: color }); 
        const turretMesh = new THREE.Mesh(turretGeo, turretMat);
        turretMesh.castShadow = true;
        turretMesh.receiveShadow = true;
        this.turret.add(turretMesh);

        // Barrel
        const barrelGeo = new THREE.CylinderGeometry(0.2, 0.2, 3, 8);
        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        this.barrel = new THREE.Mesh(barrelGeo, barrelMat);
        this.barrel.rotation.x = Math.PI / 2; // Cylinder is Y-up, rotate to Z
        this.barrel.position.set(0, 0, -1.5); // Pointing to -Z (Forward)
        this.turret.add(this.barrel);
    }

    move(dt: number, moveForward: boolean, moveBackward: boolean, rotateLeft: boolean, rotateRight: boolean) {
        if (moveForward) {
            this.mesh.translateZ(-this.speed * dt);
        }
        if (moveBackward) {
            this.mesh.translateZ(this.speed * dt);
        }
        if (rotateLeft) {
            this.mesh.rotateY(this.rotateSpeed * dt);
        }
        if (rotateRight) {
            this.mesh.rotateY(-this.rotateSpeed * dt);
        }
    }

    aim(targetPoint: THREE.Vector3) {
        // We want the turret to look at the target point.
        // The turret is a child of the tank mesh.
        // We can use world lookAt, but we need to ensure it only rotates around Y axis relative to the tank?
        // Actually, for a tank, the turret just rotates around Y.
        
        // Use standard lookAt logic on the turret group
        // But since turret is child of mesh, we need to compensate or just use lookAt which handles world space.
        // However, we want to restrict pitch (X rotation) to 0 usually? Or allow it?
        // Requirement says "Mouse control turret rotation". Usually just yaw.
        
        // Create a target point that is at the same height as the turret to avoid tilting
        const levelTarget = new THREE.Vector3(targetPoint.x, this.turret.getWorldPosition(new THREE.Vector3()).y, targetPoint.z);
        this.turret.lookAt(levelTarget);
    }

    shoot(): Projectile | null {
        const now = performance.now() / 1000;
        if (now - this.lastShotTime < this.fireRate) return null;
        this.lastShotTime = now;

        // Calculate barrel tip position
        // Barrel is at (0, 0, -1.5) in turret space. Length is 3 (centered). 
        // So tip is at (0, 0, -3) in turret space.
        const tipLocal = new THREE.Vector3(0, 0, -3);
        const barrelTip = tipLocal.applyMatrix4(this.turret.matrixWorld);
        
        // Direction is the forward vector of the turret
        const direction = new THREE.Vector3(0, 0, -1);
        direction.transformDirection(this.turret.matrixWorld);

        return new Projectile(barrelTip, direction, 30, this.damage);
    }

    updateEffects(dt: number) {
        if (this.hasShield) {
            this.shieldTimer -= dt;
            if (this.shieldTimer <= 0) {
                this.hasShield = false;
                // Remove visual effect if any (handled in Game or here?)
            }
        }
        
        if (this.damageBoostTimer > 0) {
            this.damageBoostTimer -= dt;
            if (this.damageBoostTimer <= 0) {
                this.damage = 20; // Reset damage
            }
        }
    }
}
