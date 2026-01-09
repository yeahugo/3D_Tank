import * as THREE from 'three';

export class Obstacle {
    mesh: THREE.Mesh;
    boundingBox: THREE.Box3;

    constructor(position: THREE.Vector3, size: THREE.Vector3, color: number = 0x808080) {
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const material = new THREE.MeshStandardMaterial({ color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    }
}
