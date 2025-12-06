// Parses JSON connectome data and creates Neuron/Synapse objects

import type { ConnectomeData } from './schemas';
import { Neuron } from '../simulation/Neuron';
import { SimulationEngine } from '../simulation/SimulationEngine';
import { SynapseType } from '../simulation/types';

export class ConnectomeParser {
    /**
     * Load raw connectome data from a JSON file
     */
    public static async loadData(filePath: string): Promise<ConnectomeData> {
        const response = await fetch(filePath)
            .catch((error) => {
                throw new Error(`Failed to load connectome file: ${error}`);
            });

        return response.json();
    }

    /**
     * Create a SimulationEngine from connectome data
     */
    public static createEngine(data: ConnectomeData): SimulationEngine {
        const engine = new SimulationEngine();
        const neuronMap = new Map<string, Neuron>();

        // 1. Create all neurons with their data
        for (const node of data.nodes) {
            const neuron = new Neuron(node.id, node.name);
            neuron.type = node.type;
            neuron.position = node.position;
            // Initialize simulation parameters (Leaky-Integrate-and-Fire model)
            neuron.restingPotential = 0;      // Resting voltage
            neuron.threshold = 1;              // Spike threshold
            neuron.voltage = neuron.restingPotential; // Start at rest
            neuron.timeConstant = 10;         // Membrane time constant (ms)
            neuronMap.set(node.id, neuron);
            engine.addNeuron(neuron);
        }

        // 2. Create connections (Hydration)
        for (const edge of data.edges) {
            const source = neuronMap.get(edge.source);
            const target = neuronMap.get(edge.target);

            if (source && target) {
                // TODO: Add gap junctions
                source.addConnection(target, edge.weight, SynapseType.Chemical);
            }
        }

        return engine;
    }
}
