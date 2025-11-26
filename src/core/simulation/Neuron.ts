// Neuron class implementing Leaky-Integrate-and-Fire model

import type { SynapseConnection, SynapseType } from './types';

export class Neuron {
    public id: string;
    public voltage: number;
    public threshold: number;
    public restingPotential: number;
    public presynapticConnections: SynapseConnection[];
    public postsynapticConnections: SynapseConnection[];
    public refractoryTimer: number;
    public isLesioned: boolean;

    constructor(id: string) {
        this.id = id;
        this.voltage = 0;
        this.threshold = 0;
        this.restingPotential = 0;
        this.presynapticConnections = [];
        this.postsynapticConnections = [];
        this.refractoryTimer = 0;
        this.isLesioned = false;
    }

    public update(dt: number): void {
        //Leak
        let voltageLeakAtTimestep = (this.voltage - this.restingPotential)
        //Integrate
        //Fire
    }

    public addConnection(target: Neuron, weight: number, type: SynapseType): void {
        this.presynapticConnections.push({ target, weight, type });
    }
}
