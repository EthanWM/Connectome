// OrbitControls wrapper

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type * as THREE from 'three';

export class CameraController {
    private controls: OrbitControls;

    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this.controls = new OrbitControls(camera, domElement);
        // TODO: Configure controls (damping, limits, etc.)
    }

    public update(): void {
        this.controls.update();
    }
}
