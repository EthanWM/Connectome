// Neuron class implementing Leaky-Integrate-and-Fire model

import type { SynapseConnection, SynapseType } from './types';

export class Neuron {
    public id: string;
    public voltage: number;
    public connections: SynapseConnection[];
    public refractoryTimer: number;
    public isLesioned: boolean;

    constructor(id: string) {
        this.id = id;
        this.voltage = 0;
        this.connections = [];
        this.refractoryTimer = 0;
        this.isLesioned = false;
    }

    public update(): void {
        // TODO: Implement leak, fire, and propagation logic
    }

    public addConnection(target: Neuron, weight: number, type: SynapseType): void {
        this.connections.push({ target, weight, type });
    }
}
