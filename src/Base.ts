import * as THREE from 'three';

export class Base {
    mesh: THREE.Group;
    boundingBox: THREE.Box3;
    health: number = 1;
    maxHealth: number = 1;
    isDestroyed: boolean = false;

    constructor(position: THREE.Vector3 = new THREE.Vector3(0, 0, 40)) {
        this.mesh = new THREE.Group();
        this.mesh.position.copy(position);

        // 创建基地主体 - 老鹰造型简化版
        this.createEagleModel();

        // 创建防护墙
        this.createProtectionWalls();

        // 计算碰撞盒
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    }

    private createEagleModel() {
        // 基座
        const baseGeo = new THREE.BoxGeometry(3, 0.5, 3);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.y = 0.25;
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;
        this.mesh.add(baseMesh);

        // 老鹰身体 (金色)
        const bodyGeo = new THREE.ConeGeometry(1.2, 2.5, 4);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFD700,
            metalness: 0.6,
            roughness: 0.3
        });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        bodyMesh.position.y = 1.75;
        bodyMesh.castShadow = true;
        this.mesh.add(bodyMesh);

        // 老鹰头部
        const headGeo = new THREE.SphereGeometry(0.6, 8, 8);
        const headMesh = new THREE.Mesh(headGeo, bodyMat);
        headMesh.position.y = 3.2;
        headMesh.castShadow = true;
        this.mesh.add(headMesh);

        // 翅膀
        const wingGeo = new THREE.BoxGeometry(3, 0.2, 1);
        const wingMesh = new THREE.Mesh(wingGeo, bodyMat);
        wingMesh.position.y = 2;
        wingMesh.castShadow = true;
        this.mesh.add(wingMesh);
    }

    private createProtectionWalls() {
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        
        // 左墙
        const leftWallGeo = new THREE.BoxGeometry(0.5, 2, 4);
        const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
        leftWall.position.set(-2.25, 1, 0);
        leftWall.castShadow = true;
        leftWall.receiveShadow = true;
        this.mesh.add(leftWall);

        // 右墙
        const rightWall = new THREE.Mesh(leftWallGeo, wallMat);
        rightWall.position.set(2.25, 1, 0);
        rightWall.castShadow = true;
        rightWall.receiveShadow = true;
        this.mesh.add(rightWall);

        // 前墙 (带缺口)
        const frontWallGeo = new THREE.BoxGeometry(1.5, 2, 0.5);
        const frontWallLeft = new THREE.Mesh(frontWallGeo, wallMat);
        frontWallLeft.position.set(-1.25, 1, -2);
        frontWallLeft.castShadow = true;
        this.mesh.add(frontWallLeft);

        const frontWallRight = new THREE.Mesh(frontWallGeo, wallMat);
        frontWallRight.position.set(1.25, 1, -2);
        frontWallRight.castShadow = true;
        this.mesh.add(frontWallRight);
    }

    takeDamage(damage: number): boolean {
        if (this.isDestroyed) return false;
        
        this.health -= damage;
        
        if (this.health <= 0) {
            this.destroy();
            return true;
        }
        return false;
    }

    destroy() {
        this.isDestroyed = true;
        
        // 改变颜色表示被摧毁
        this.mesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const mat = child.material as THREE.MeshStandardMaterial;
                mat.color.setHex(0x333333);
                mat.emissive.setHex(0x330000);
                mat.emissiveIntensity = 0.5;
            }
        });
    }

    updateBoundingBox() {
        this.boundingBox.setFromObject(this.mesh);
    }
}
