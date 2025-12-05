import { ConnectomeParser } from "./core/data/ConnectomeParser";
import { SimulationEngine } from "./core/simulation/SimulationEngine";

console.log('ICDS Initializing...');

let engine: SimulationEngine;
let lastTime = 0;

async function initializeSimulationEngine(): Promise<SimulationEngine> {
    const loadedEngine = await ConnectomeParser.loadFromFile('data/connectome.json');
    return loadedEngine;
}

initializeSimulationEngine().then((loadedEngine) => {
    engine = loadedEngine;
    console.log('Simulation engine initialized with', engine.getAllNeurons().length, 'neurons');
    // Start your simulation/visualization
});

function animate(currentTime: number) {
    const dt = (currentTime - lastTime) / 1000
    engine.step(dt);

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);