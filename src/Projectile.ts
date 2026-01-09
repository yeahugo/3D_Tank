import * as THREE from 'three';

export class Projectile {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    isDead: boolean = false;
    lifeTime: number = 3.0; // seconds
    damage: number;

    constructor(position: THREE.Vector3, direction: THREE.Vector3, speed: number = 30, damage: number = 20) {
        const geometry = new THREE.SphereGeometry(0.2, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        
        this.velocity = direction.clone().normalize().multiplyScalar(speed);
        this.damage = damage;
    }

    update(dt: number) {
        this.mesh.position.add(this.velocity.clone().multiplyScalar(dt));
        this.lifeTime -= dt;
        if (this.lifeTime <= 0) {
            this.isDead = true;
        }
        
        // Simple ground collision
        if (this.mesh.position.y < 0) {
            this.isDead = true;
        }
    }
}
