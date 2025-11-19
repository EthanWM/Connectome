// Raycasting and click events

import * as THREE from 'three';
import type { SimulationEngine } from '../core/simulation/SimulationEngine';
import type { ControlPanel } from './ControlPanel';

export class InteractionHandler {
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;

    constructor(
        private canvas: HTMLCanvasElement,
        private camera: THREE.Camera,
        private scene: THREE.Scene,
        private engine: SimulationEngine,
        private controlPanel: ControlPanel
    ) {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // TODO: Add click and hover event listeners
    }

    private handleClick(event: MouseEvent): void {
        // TODO: Perform raycasting
        // TODO: Get clicked neuron
        // TODO: Call appropriate engine method based on mode
    }

    private handleHover(event: MouseEvent): void {
        // TODO: Update info box with hovered neuron
    }
}
