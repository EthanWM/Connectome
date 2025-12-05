import * as THREE from 'three';
import { ConnectomeParser } from "./core/data/ConnectomeParser";
import { SimulationEngine } from "./core/simulation/SimulationEngine";
import { Neuron } from "./core/simulation/Neuron";
import { VisualizationEngine, NeuronPosition } from "./core/visualization/VisualizationEngine";

console.log('ICDS Initializing...');

let engine: SimulationEngine;
let visualization: VisualizationEngine;
let lastTime = 0;
let isRunning = true;

/**
 * Extract positions from neurons, normalize and scale for visualization
 */
function extractNormalizedPositions(neurons: Neuron[], targetRadius = 40): NeuronPosition[] {
    const withPos = neurons.filter(n => n.position);
    if (withPos.length === 0) return [];

    // Calculate centroid
    const centroid = { x: 0, y: 0, z: 0 };
    for (const n of withPos) {
        centroid.x += n.position!.x;
        centroid.y += n.position!.y;
        centroid.z += n.position!.z;
    }
    centroid.x /= withPos.length;
    centroid.y /= withPos.length;
    centroid.z /= withPos.length;

    // Find max distance from centroid for scaling
    let maxDist = 0;
    for (const n of withPos) {
        const dx = n.position!.x - centroid.x;
        const dy = n.position!.y - centroid.y;
        const dz = n.position!.z - centroid.z;
        maxDist = Math.max(maxDist, Math.sqrt(dx * dx + dy * dy + dz * dz));
    }

    const scale = maxDist > 0 ? targetRadius / maxDist : 1;

    // Transform positions: center and scale
    return withPos.map(n => ({
        id: n.id,
        position: new THREE.Vector3(
            (n.position!.x - centroid.x) * scale,
            (n.position!.y - centroid.y) * scale,
            (n.position!.z - centroid.z) * scale
        )
    }));
}

async function initialize(): Promise<void> {
    // Load connectome data
    const data = await ConnectomeParser.loadData('data/connectome.json');
    
    // Create simulation engine (includes node metadata)
    engine = ConnectomeParser.createEngine(data);
    console.log('Simulation engine initialized with', engine.getAllNeurons().length, 'neurons');
    
    // Initialize visualization
    const canvas = document.getElementById('scene') as HTMLCanvasElement;
    if (!canvas) {
        throw new Error('Canvas element #scene not found');
    }
    
    visualization = new VisualizationEngine(canvas);
    
    // Extract and normalize positions from neurons
    const positions = extractNormalizedPositions(engine.getAllNeurons());
    console.log(`Loaded ${positions.length} neuron positions`);
    visualization.setPositions(positions);
    
    visualization.initializeFromEngine(engine);
    
    // Stimulate a neuron to see activity
    const neurons = engine.getAllNeurons();
    if (neurons.length > 0) {
        engine.stimulateNeuron(neurons[0].id, 5);
        console.log(`Stimulated neuron ${neurons[0].id}`);
    }
    
    // Start animation loop
    requestAnimationFrame(animate);
}

function animate(currentTime: number): void {
    const dt = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap dt to prevent large jumps
    lastTime = currentTime;
    
    if (isRunning && dt > 0) {
        engine.step(dt);
        visualization.updateFromEngine(engine);
    }
    
    visualization.render();
    requestAnimationFrame(animate);
}

// Start the application
initialize().catch(console.error);