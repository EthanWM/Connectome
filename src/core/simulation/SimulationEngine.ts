// Main simulation orchestrator

import { Neuron } from './Neuron';

export class SimulationEngine {
    private neurons: Map<string, Neuron>;

    constructor() {
        this.neurons = new Map();
    }

    public addNeuron(neuron: Neuron): void {
        this.neurons.set(neuron.id, neuron);
    }

    public step(): void {
        // TODO: Execute one simulation frame for all neurons
    }

    public stimulateNeuron(id: string, strength: number): void {
        // TODO: Add voltage to specified neuron
    }

    public lesionNeuron(id: string): void {
        // TODO: Mark neuron as lesioned
    }

    public getGlobalActivity(): number {
        // TODO: Return sum of all neuron voltages
        return 0;
    }

    public getNeuron(id: string): Neuron | undefined {
        return this.neurons.get(id);
    }

    public getAllNeurons(): Neuron[] {
        return Array.from(this.neurons.values());
    }
}
