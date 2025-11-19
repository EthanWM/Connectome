// Parses JSON connectome data and creates Neuron/Synapse objects

import type { ConnectomeData } from './schemas';
import { Neuron } from '../simulation/Neuron';
import { SimulationEngine } from '../simulation/SimulationEngine';
import { SynapseType } from '../simulation/types';

export class ConnectomeParser {
    public static async loadFromFile(filePath: string): Promise<SimulationEngine> {
        const response = await fetch(filePath)
            .catch((error) => {
                throw new Error(`Failed to load connectome file: ${error}`);
            });

        const data: ConnectomeData = await response.json();

        return this.parseConnectome(data);
    }

    public static parseConnectome(data: ConnectomeData): SimulationEngine {
        const engine = new SimulationEngine();
        const neuronMap = new Map<string, Neuron>();

        // 1. Create all neurons
        for (const node of data.nodes) {
            const neuron = new Neuron(node.id);
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
