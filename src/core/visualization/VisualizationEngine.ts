// Three.js scene manager

import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import type { SimulationEngine } from '../simulation/SimulationEngine';
import { NeuronRenderer } from './NeuronRenderer';
import { SynapseRenderer } from './SynapseRenderer';
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
    private synapseLines: Line2[];
    private synapsesByNeuron: Map<string, Line2[]>;  // Synapses grouped by source neuron
    private focusedNeuronId: string | null = null;
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
        this.cameraController.setOnFocus((neuronId) => this.onNeuronFocus(neuronId));
        
        this.neuronMeshes = new Map();
        this.synapseLines = [];
        this.synapsesByNeuron = new Map();
        this.positions = new Map();
        
        this.setupResizeHandler(canvas);
    }

    private setupResizeHandler(canvas: HTMLCanvasElement): void {
        window.addEventListener('resize', () => {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
            
            // Update line resolution for proper width rendering
            SynapseRenderer.updateResolution(width, height);
        });
    }

    public setPositions(positions: NeuronPosition[]): void {
        this.positions.clear();
        for (const p of positions) {
            this.positions.set(p.id, p.position);
        }
    }

    public initializeFromEngine(engine: SimulationEngine): void {
        // Clear existing meshes and lines
        this.neuronMeshes.forEach(mesh => this.scene.remove(mesh));
        this.neuronMeshes.clear();
        this.synapseLines.forEach(line => this.scene.remove(line));
        this.synapseLines = [];
        this.synapsesByNeuron.clear();
        this.focusedNeuronId = null;
        
        const neurons = engine.getAllNeurons();
        const neuronCount = neurons.length;
        
        // First pass: create neuron meshes and collect positions
        const resolvedPositions = new Map<string, THREE.Vector3>();
        
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
            
            resolvedPositions.set(neuron.id, position);
            
            const mesh = NeuronRenderer.createMesh(neuron, position);
            this.scene.add(mesh);
            this.neuronMeshes.set(neuron.id, mesh);
        });
        
        // Second pass: create synapse lines using resolved positions
        for (const neuron of neurons) {
            const sourcePos = resolvedPositions.get(neuron.id);
            if (!sourcePos) continue;
            
            const neuronSynapses: Line2[] = [];
            
            for (const connection of neuron.outputConnections) {
                const targetPos = resolvedPositions.get(connection.target.id);
                if (!targetPos) continue;
                
                const line = SynapseRenderer.createLine(
                    sourcePos,
                    targetPos,
                    connection.type,
                    connection.weight
                );
                // Store connection info for activity tracking
                (line as any).sourceId = neuron.id;
                (line as any).targetId = connection.target.id;
                
                // Hidden by default - shown on focus
                line.visible = false;
                
                this.scene.add(line);
                this.synapseLines.push(line);
                neuronSynapses.push(line);
            }
            
            if (neuronSynapses.length > 0) {
                this.synapsesByNeuron.set(neuron.id, neuronSynapses);
            }
        }
        
        console.log(`Visualization initialized with ${this.neuronMeshes.size} neurons, ${this.synapseLines.length} synapses`);
    }

    public updateFromEngine(engine: SimulationEngine): void {
        for (const neuron of engine.getAllNeurons()) {
            const mesh = this.neuronMeshes.get(neuron.id);
            if (mesh) {
                NeuronRenderer.updateMesh(mesh, neuron);
                
                // Flash outgoing synapses when neuron just fired (refractory timer near max)
                if (neuron.refractoryTimer > neuron.refractoryPeriod * 0.95) {
                    this.flashOutgoingSynapses(neuron.id);
                }
            }
        }
    }

    /**
     * Flash all outgoing synapses from a neuron
     */
    public flashOutgoingSynapses(neuronId: string): void {
        const synapses = this.synapsesByNeuron.get(neuronId);
        if (!synapses) return;
        
        for (const line of synapses) {
            // flashActivity stores original visibility before we set visible=true
            SynapseRenderer.flashActivity(line);
            line.visible = true;
        }
    }

    public render(): void {
        this.cameraController.update();
        
        // Update flash decay on all visible synapses
        for (const line of this.synapseLines) {
            if (line.visible || (line as any).flashTime) {
                const baseOpacity = line.visible ? 0.6 : 0;
                SynapseRenderer.updateFlashDecay(line, baseOpacity);
            }
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Called when a neuron is focused/unfocused via double-click
     */
    private onNeuronFocus(neuronId: string | null): void {
        // Hide previously focused neuron's synapses
        if (this.focusedNeuronId) {
            const oldSynapses = this.synapsesByNeuron.get(this.focusedNeuronId);
            if (oldSynapses) {
                for (const line of oldSynapses) {
                    line.visible = false;
                }
            }
        }
        
        this.focusedNeuronId = neuronId;
        
        // Show newly focused neuron's synapses
        if (neuronId) {
            const synapses = this.synapsesByNeuron.get(neuronId);
            if (synapses) {
                for (const line of synapses) {
                    line.visible = true;
                }
            }
        }
    }

    /**
     * Flash a synapse to show activity during simulation
     */
    public flashSynapse(sourceId: string, targetId: string): void {
        // Find the matching synapse line
        const synapses = this.synapsesByNeuron.get(sourceId);
        if (!synapses) return;
        
        for (const line of synapses) {
            if ((line as any).targetId === targetId) {
                // Make visible temporarily and flash
                line.visible = true;
                SynapseRenderer.flashActivity(line);
                break;
            }
        }
    }

    /**
     * Set callback for when a neuron is focused/unfocused
     */
    public setOnFocus(callback: (neuronId: string | null) => void): void {
        this.cameraController.setOnFocus((neuronId) => {
            this.onNeuronFocus(neuronId);
            callback(neuronId);
        });
    }

    /**
     * Set callback for when a neuron is clicked (for stimulation)
     */
    public setOnClick(callback: (neuronId: string) => void): void {
        this.cameraController.setOnClick(callback);
    }

    public getNeuronMesh(id: string): THREE.Mesh | undefined {
        return this.neuronMeshes.get(id);
    }
}
