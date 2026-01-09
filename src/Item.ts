import * as THREE from 'three';

export enum ItemType {
    SHIELD,
    ROCKET,
    HEALTH
}

export class Item {
    mesh: THREE.Mesh;
    type: ItemType;
    active: boolean = true;

    constructor(position: THREE.Vector3, type: ItemType) {
        this.type = type;
        
        let geometry: THREE.BufferGeometry;
        let color: number;

        switch (type) {
            case ItemType.SHIELD:
                geometry = new THREE.IcosahedronGeometry(1, 0);
                color = 0x00ffff; // Cyan
                break;
            case ItemType.ROCKET:
                geometry = new THREE.OctahedronGeometry(1, 0);
                color = 0xff0000; // Red
                break;
            case ItemType.HEALTH:
                geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
                color = 0x00ff00; // Green
                break;
        }

        const material = new THREE.MeshStandardMaterial({ 
            color: color, 
            emissive: color,
            emissiveIntensity: 0.5
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.position.y = 1;
        this.mesh.castShadow = true;
    }

    update(dt: number) {
        this.mesh.rotation.y += dt;
        this.mesh.rotation.x += dt * 0.5;
        this.mesh.position.y = 1 + Math.sin(performance.now() / 500) * 0.2;
    }
}
