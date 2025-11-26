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

    public step(dt: number): void {
        this.neurons.forEach((neuron) => {
            neuron.update(dt);
        });
    }

    public stimulateNeuron(id: string, currentStrength: number): void {
        const neuron = this.getNeuron(id);
        if (neuron) {
            neuron.stimulate(currentStrength);
        }
    }

    public lesionNeuron(id: string): void {
        const neuron = this.getNeuron(id)
        if (neuron) {
            const neuron = this.getNeuron(id);
        }
    }

    public getGlobalActivity(): number {
        // TODO: Return sum of all neuron voltages
        let totalVoltage = 0;
        this.neurons.forEach((neuron) => {
            totalVoltage += neuron.voltage;
        });
        return totalVoltage;
    }

    public getNeuron(id: string): Neuron | undefined {
        return this.neurons.get(id);
    }

    public getAllNeurons(): Neuron[] {
        return Array.from(this.neurons.values());
    }
}
