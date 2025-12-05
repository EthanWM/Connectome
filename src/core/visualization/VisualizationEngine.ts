// Three.js scene manager

import * as THREE from 'three';
import type { SimulationEngine } from '../simulation/SimulationEngine';
import { NeuronRenderer } from './NeuronRenderer';
import { CameraController } from './CameraController';

export interface NeuronPosition {
    id: string;
    position: THREE.Vector3;
}

export class VisualizationEngine {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private neuronMeshes: Map<string, THREE.Mesh>;
    private cameraController: CameraController;
    private positions: Map<string, THREE.Vector3>;

    constructor(canvas: HTMLCanvasElement) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111122);
        
        // Get canvas dimensions (fallback to window size if not yet laid out)
        const width = canvas.clientWidth || window.innerWidth;
        const height = canvas.clientHeight || window.innerHeight;
        
        // Camera setup - positioned to view elongated worm body
        const aspect = width / height;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(100, 0, 50);  // Side view
        this.camera.lookAt(0, 0, 0);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Camera controls
        this.cameraController = new CameraController(this.camera, canvas);
        this.cameraController.setScene(this.scene);
        
        this.neuronMeshes = new Map();
        this.positions = new Map();
        
        this.setupLights();
        this.setupResizeHandler(canvas);
    }

    private setupLights(): void {
        // Ambient light for base illumination
        const ambient = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambient);
        
        // Main directional light
        const directional = new THREE.DirectionalLight(0xffffff, 1);
        directional.position.set(50, 50, 50);
        this.scene.add(directional);
        
        // Fill light from opposite side
        const fill = new THREE.DirectionalLight(0x4488ff, 0.3);
        fill.position.set(-50, -50, -50);
        this.scene.add(fill);
    }

    private setupResizeHandler(canvas: HTMLCanvasElement): void {
        window.addEventListener('resize', () => {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        });
    }

    public setPositions(positions: NeuronPosition[]): void {
        this.positions.clear();
        for (const p of positions) {
            this.positions.set(p.id, p.position);
        }
    }

    public initializeFromEngine(engine: SimulationEngine): void {
        // Clear existing meshes
        this.neuronMeshes.forEach(mesh => this.scene.remove(mesh));
        this.neuronMeshes.clear();
        
        const neurons = engine.getAllNeurons();
        const neuronCount = neurons.length;
        
        neurons.forEach((neuron, index) => {
            // Use provided position or generate spherical layout
            let position = this.positions.get(neuron.id);
            
            if (!position) {
                // Generate position on a sphere
                const phi = Math.acos(-1 + (2 * index) / neuronCount);
                const theta = Math.sqrt(neuronCount * Math.PI) * phi;
                const radius = 30;
                
                position = new THREE.Vector3(
                    radius * Math.cos(theta) * Math.sin(phi),
                    radius * Math.sin(theta) * Math.sin(phi),
                    radius * Math.cos(phi)
                );
            }
            
            const mesh = NeuronRenderer.createMesh(neuron, position);
            this.scene.add(mesh);
            this.neuronMeshes.set(neuron.id, mesh);
        });
        
        console.log(`Visualization initialized with ${this.neuronMeshes.size} neuron meshes`);
    }

    public updateFromEngine(engine: SimulationEngine): void {
        for (const neuron of engine.getAllNeurons()) {
            const mesh = this.neuronMeshes.get(neuron.id);
            if (mesh) {
                NeuronRenderer.updateMesh(mesh, neuron);
            }
        }
    }

    public render(): void {
        this.cameraController.update();
        this.renderer.render(this.scene, this.camera);
    }

    public getNeuronMesh(id: string): THREE.Mesh | undefined {
        return this.neuronMeshes.get(id);
    }
}
