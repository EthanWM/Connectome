import { ConnectomeParser } from "./core/data/ConnectomeParser";
import { SimulationEngine } from "./core/simulation/SimulationEngine";
import { VisualizationEngine } from "./core/visualization/VisualizationEngine";

console.log('ICDS Initializing...');

let engine: SimulationEngine;
let visualization: VisualizationEngine;
let lastTime = 0;
let isRunning = true;

async function initialize(): Promise<void> {
    // Initialize simulation engine
    engine = await ConnectomeParser.loadFromFile('data/connectome.json');
    console.log('Simulation engine initialized with', engine.getAllNeurons().length, 'neurons');
    
    // Initialize visualization
    const canvas = document.getElementById('scene') as HTMLCanvasElement;
    if (!canvas) {
        throw new Error('Canvas element #scene not found');
    }
    
    visualization = new VisualizationEngine(canvas);
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