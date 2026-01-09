import * as THREE from 'three';

class Particle {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;

    constructor(mesh: THREE.Mesh, velocity: THREE.Vector3, life: number) {
        this.mesh = mesh;
        this.velocity = velocity;
        this.life = life;
        this.maxLife = life;
    }
}

export class ParticleSystem {
    particles: Particle[] = [];
    scene: THREE.Scene;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    createExplosion(position: THREE.Vector3, color: number = 0xffaa00, count: number = 20) {
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshBasicMaterial({ color: color });

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(geometry, material.clone());
            mesh.position.copy(position);
            
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );
            
            this.scene.add(mesh);
            this.particles.push(new Particle(mesh, velocity, 0.5 + Math.random() * 0.5));
        }
    }

    update(dt: number) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            
            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
            } else {
                p.mesh.position.add(p.velocity.clone().multiplyScalar(dt));
                p.mesh.rotation.x += dt * 2;
                p.mesh.rotation.y += dt * 2;
                (p.mesh.material as THREE.MeshBasicMaterial).opacity = p.life / p.maxLife;
                (p.mesh.material as THREE.MeshBasicMaterial).transparent = true;
            }
        }
    }
}
