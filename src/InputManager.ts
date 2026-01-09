import * as THREE from 'three';

export class InputManager {
    keys: { [key: string]: boolean } = {};
    mouse: THREE.Vector2 = new THREE.Vector2();
    isMouseDown: boolean = false;

    constructor() {
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
        window.addEventListener('mousemove', (e) => {
            // Normalize mouse position to -1 to 1
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
        window.addEventListener('mousedown', () => this.isMouseDown = true);
        window.addEventListener('mouseup', () => this.isMouseDown = false);
    }

    isKeyPressed(code: string): boolean {
        return !!this.keys[code];
    }
}
