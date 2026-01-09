import * as THREE from 'three';
import { InputManager } from './InputManager';
import { Tank } from './Tank';
import { Projectile } from './Projectile';
import { NPC } from './NPC';
import { Item, ItemType } from './Item';
import { SoundManager } from './SoundManager';
import { ParticleSystem } from './ParticleSystem';
import { Obstacle } from './Obstacle';

export enum GameState {
    START,
    PLAYING,
    PAUSED,
    GAMEOVER
}

export class Game {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    inputManager: InputManager;
    clock: THREE.Clock;
    soundManager: SoundManager;
    particleSystem: ParticleSystem;

    state: GameState = GameState.START;
    player: Tank;
    npcs: NPC[] = [];
    items: Item[] = [];
    projectiles: Projectile[] = [];
    obstacles: Obstacle[] = [];
    ground!: THREE.Mesh;
    raycaster: THREE.Raycaster;
    mousePlane: THREE.Plane;
    
    score: number = 0;
    npcSpawnTimer: number = 0;
    maxNPCs: number = 5;
    itemSpawnTimer: number = 0;
    highScore: number = 0;

    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 20, 150);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 10, 10);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('app')!.appendChild(this.renderer.domElement);

        this.inputManager = new InputManager();
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mousePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        this.soundManager = new SoundManager();
        this.particleSystem = new ParticleSystem(this.scene);

        this.setupLights();
        this.setupGround();
        this.setupObstacles();
        
        this.player = new Tank(0x00ff00);
        this.scene.add(this.player.mesh);

        window.addEventListener('resize', () => this.onWindowResize(), false);

        // UI Event Listeners
        document.getElementById('start-btn')!.addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn')!.addEventListener('click', () => this.resetGame());
        
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                if (this.state === GameState.PLAYING) {
                    this.pauseGame();
                } else if (this.state === GameState.PAUSED) {
                    this.resumeGame();
                }
            }
        });

        this.animate();
    }

    startGame() {
        this.state = GameState.PLAYING;
        document.getElementById('start-screen')!.style.display = 'none';
        document.getElementById('hud')!.style.display = 'block';
        this.clock.start();
        this.soundManager.ctx.resume(); // Ensure AudioContext is resumed
        
        // Spawn one NPC immediately visible
        const npc = new NPC(new THREE.Vector3(0, 0, -20));
        this.scene.add(npc.tank.mesh);
        this.npcs.push(npc);
    }

    pauseGame() {
        this.state = GameState.PAUSED;
        document.getElementById('pause-screen')!.style.display = 'flex';
        this.clock.stop();
    }

    resumeGame() {
        this.state = GameState.PLAYING;
        document.getElementById('pause-screen')!.style.display = 'none';
        this.clock.start();
    }

    gameOver() {
        this.state = GameState.GAMEOVER;
        document.getElementById('game-over-screen')!.style.display = 'flex';
        document.getElementById('hud')!.style.display = 'none';
        document.getElementById('final-score')!.innerText = this.score.toString();
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            document.getElementById('highscore')!.innerText = this.highScore.toString();
        }
    }

    resetGame() {
        // Clear NPCs
        for (const npc of this.npcs) {
            this.scene.remove(npc.tank.mesh);
        }
        this.npcs = [];
        
        // Clear Items
        for (const item of this.items) {
            this.scene.remove(item.mesh);
        }
        this.items = [];
        
        // Clear Projectiles
        for (const p of this.projectiles) {
            this.scene.remove(p.mesh);
        }
        this.projectiles = [];
        
        // Clear Obstacles (optional, but good for random generation)
        for (const obs of this.obstacles) {
            this.scene.remove(obs.mesh);
        }
        this.obstacles = [];
        this.setupObstacles();

        // Reset Player
        this.scene.remove(this.player.mesh);
        this.player = new Tank(0x00ff00);
        this.scene.add(this.player.mesh);
        
        // Reset Game State
        this.score = 0;
        this.npcSpawnTimer = 0;
        this.itemSpawnTimer = 0;
        
        document.getElementById('game-over-screen')!.style.display = 'none';
        document.getElementById('hud')!.style.display = 'block';
        
        this.state = GameState.PLAYING;
        this.clock.start();
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(20, 30, 20);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 30;
        dirLight.shadow.camera.bottom = -30;
        dirLight.shadow.camera.left = -30;
        dirLight.shadow.camera.right = 30;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);
    }

    setupGround() {
        const geometry = new THREE.PlaneGeometry(200, 200);
        const material = new THREE.MeshStandardMaterial({ color: 0x556b2f }); // Darker green
        this.ground = new THREE.Mesh(geometry, material);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        // Grid helper
        const gridHelper = new THREE.GridHelper(200, 40);
        this.scene.add(gridHelper);
    }

    setupObstacles() {
        // Add random obstacles
        for (let i = 0; i < 30; i++) {
            const width = 2 + Math.random() * 5;
            const depth = 2 + Math.random() * 5;
            const height = 2 + Math.random() * 4;
            
            let x, z;
            // Ensure obstacles don't spawn too close to center (player start)
            do {
                x = (Math.random() - 0.5) * 180;
                z = (Math.random() - 0.5) * 180;
            } while (Math.abs(x) < 10 && Math.abs(z) < 10);

            const obs = new Obstacle(
                new THREE.Vector3(x, height / 2, z),
                new THREE.Vector3(width, height, depth)
            );
            this.obstacles.push(obs);
            this.scene.add(obs.mesh);
        }
    }

    spawnNPC() {
        let x, z;
        let validPosition = false;
        
        // Try to find a valid position away from obstacles
        for (let i = 0; i < 10; i++) {
            x = (Math.random() - 0.5) * 180;
            z = (Math.random() - 0.5) * 180;
            
            // Check obstacle collision
            const npcBox = new THREE.Box3().setFromCenterAndSize(
                new THREE.Vector3(x, 0.5, z), 
                new THREE.Vector3(3, 2, 4) // Approx tank size
            );
            
            let collision = false;
            for (const obs of this.obstacles) {
                if (npcBox.intersectsBox(obs.boundingBox)) {
                    collision = true;
                    break;
                }
            }
            
            if (!collision) {
                validPosition = true;
                break;
            }
        }
        
        if (validPosition) {
            const npc = new NPC(new THREE.Vector3(x!, 0, z!));
            this.scene.add(npc.tank.mesh);
            this.npcs.push(npc);
            console.log("NPC Spawned at", x, z);
        }
    }

    spawnItem() {
        const x = (Math.random() - 0.5) * 180;
        const z = (Math.random() - 0.5) * 180;
        const types = [ItemType.SHIELD, ItemType.ROCKET, ItemType.HEALTH];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const item = new Item(new THREE.Vector3(x, 0, z), type);
        this.scene.add(item.mesh);
        this.items.push(item);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    update(dt: number) {
        if (this.state !== GameState.PLAYING) return;

        // Player Movement
        if (this.player.health > 0) {
            const oldPos = this.player.mesh.position.clone();

            const moveForward = this.inputManager.isKeyPressed('KeyW') || this.inputManager.isKeyPressed('ArrowUp');
            const moveBackward = this.inputManager.isKeyPressed('KeyS') || this.inputManager.isKeyPressed('ArrowDown');
            const rotateLeft = this.inputManager.isKeyPressed('KeyA') || this.inputManager.isKeyPressed('ArrowLeft');
            const rotateRight = this.inputManager.isKeyPressed('KeyD') || this.inputManager.isKeyPressed('ArrowRight');

            this.player.move(dt, moveForward, moveBackward, rotateLeft, rotateRight);
            
            // Player Obstacle Collision
            const playerBox = new THREE.Box3().setFromObject(this.player.body);
            // We use player.body for collision box as mesh is group
            
            for (const obs of this.obstacles) {
                if (playerBox.intersectsBox(obs.boundingBox)) {
                    this.player.mesh.position.copy(oldPos);
                    break;
                }
            }
            
            // Boundary Check
            if (this.player.mesh.position.x > 95 || this.player.mesh.position.x < -95 ||
                this.player.mesh.position.z > 95 || this.player.mesh.position.z < -95) {
                this.player.mesh.position.copy(oldPos);
            }
            
            // Turret Rotation (Mouse Aim)
            this.raycaster.setFromCamera(this.inputManager.mouse, this.camera);
            const intersects = this.raycaster.intersectObject(this.ground);
            
            if (intersects.length > 0) {
                const point = intersects[0].point;
                this.player.aim(point);
            }

            // Shooting
            if (this.inputManager.isMouseDown) {
                const projectile = this.player.shoot();
                if (projectile) {
                    this.scene.add(projectile.mesh);
                    this.projectiles.push(projectile);
                }
            }
        }

        // NPC Spawning
        this.npcSpawnTimer -= dt;
        if (this.npcs.length < this.maxNPCs && this.npcSpawnTimer <= 0) {
            this.spawnNPC();
            this.npcSpawnTimer = 3.0; // Spawn every 3 seconds
        }

        // Item Spawning
        this.itemSpawnTimer -= dt;
        if (this.items.length < 5 && this.itemSpawnTimer <= 0) {
            this.spawnItem();
            this.itemSpawnTimer = 10.0;
        }

        // Item Update
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.update(dt);
            
            if (this.player.mesh.position.distanceTo(item.mesh.position) < 2) {
                switch (item.type) {
                    case ItemType.SHIELD:
                        this.player.hasShield = true;
                        this.player.shieldTimer = 10.0;
                        console.log("Picked up SHIELD");
                        break;
                    case ItemType.ROCKET:
                        this.player.damage = 50;
                        this.player.damageBoostTimer = 15.0;
                        console.log("Picked up ROCKET");
                        break;
                    case ItemType.HEALTH:
                        this.player.health = Math.min(this.player.health + 30, this.player.maxHealth);
                        console.log("Picked up HEALTH");
                        break;
                }
                
                this.soundManager.playPickup();
                this.scene.remove(item.mesh);
                this.items.splice(i, 1);
            }
        }
        
        this.particleSystem.update(dt);

        // NPC Update
        for (let i = this.npcs.length - 1; i >= 0; i--) {
            const npc = this.npcs[i];
            const projectile = npc.update(dt, this.player);
            if (projectile) {
                this.scene.add(projectile.mesh);
                this.projectiles.push(projectile);
                // Optional: Sound for NPC shoot (maybe quieter?)
            }
        }

        // Update Projectiles and Collision
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(dt);
            
            let hit = false;
            
            // Check collision with Player
            if (this.player.health > 0 && p.mesh.position.distanceTo(this.player.mesh.position) < 2) {
                if (!this.player.hasShield) {
                    this.player.health -= 10;
                    console.log("Player Hit! Health:", this.player.health);
                } else {
                    console.log("Player Shielded!");
                }
                hit = true;
            }

            // Check collision with NPCs
            for (let j = this.npcs.length - 1; j >= 0; j--) {
                if (p.mesh.position.distanceTo(this.npcs[j].tank.mesh.position) < 2) {
                    this.npcs[j].tank.health -= p.damage;
                    hit = true;
                    this.particleSystem.createExplosion(p.mesh.position, 0xffaa00, 5);
                    if (this.npcs[j].tank.health <= 0) {
                        // NPC Dead
                        this.scene.remove(this.npcs[j].tank.mesh);
                        this.npcs.splice(j, 1);
                        this.score += 100;
                        console.log("NPC Destroyed! Score:", this.score);
                        this.particleSystem.createExplosion(p.mesh.position, 0xffaa00, 30);
                        this.soundManager.playExplosion();
                    }
                    break;
                }
            }
            
            // Check collision with Obstacles
            for (const obs of this.obstacles) {
                if (obs.boundingBox.containsPoint(p.mesh.position)) {
                    hit = true;
                    this.particleSystem.createExplosion(p.mesh.position, 0xcccccc, 5); // Grey spark
                    break;
                }
            }

            if (p.isDead || hit) {
                this.scene.remove(p.mesh);
                this.projectiles.splice(i, 1);
            }
        }

        // Camera follow
        const relativeCameraOffset = new THREE.Vector3(0, 10, 15);
        const cameraOffset = relativeCameraOffset.applyMatrix4(this.player.mesh.matrixWorld);
        
        this.camera.position.lerp(cameraOffset, 0.1);
        this.camera.lookAt(this.player.mesh.position);

        this.updateUI();
    }

    updateUI() {
        document.getElementById('score')!.innerText = this.score.toString();
        document.getElementById('health')!.innerText = Math.max(0, this.player.health).toString();
        
        const shieldInd = document.getElementById('shield-indicator')!;
        const rocketInd = document.getElementById('rocket-indicator')!;
        
        shieldInd.style.opacity = this.player.hasShield ? '1' : '0.3';
        rocketInd.style.opacity = this.player.damage > 20 ? '1' : '0.3';
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const dt = this.clock.getDelta();
        this.update(dt);
        this.renderer.render(this.scene, this.camera);
    }
}
