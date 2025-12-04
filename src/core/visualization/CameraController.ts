// OrbitControls wrapper

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type * as THREE from 'three';

export class CameraController {
    private controls: OrbitControls;

    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this.controls = new OrbitControls(camera, domElement);
        
        // Enable damping for smooth camera movement
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        this.controls.minDistance = 10;
        this.controls.maxDistance = 200;
        
        this.controls.enablePan = true;
        this.controls.panSpeed = 0.8;
        
        this.controls.rotateSpeed = 0.5;
    }

    public update(): void {
        this.controls.update();
    }

    public setTarget(x: number, y: number, z: number): void {
        this.controls.target.set(x, y, z);
    }
}
