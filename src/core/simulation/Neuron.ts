// Neuron class implementing Leaky-Integrate-and-Fire model

import type { SynapseConnection, SynapseType } from './types';

export interface NeuronPosition {
    x: number;
    y: number;
    z: number;
}

export class Neuron {
    // Identity
    public id: string;
    public name: string;
    public type?: string;
    public position?: NeuronPosition;

    // Simulation state
    public voltage: number;
    public threshold: number;
    public restingPotential: number;
    public timeConstant: number;
    public incomingCurrent: number;
    public outputConnections: SynapseConnection[];
    public refractoryTimer: number;
    public refractoryPeriod: number;
    public isLesioned: boolean;

    constructor(id: string, name?: string) {
        // Identity
        this.id = id;
        this.name = name ?? id;
        
        // Simulation state
        this.voltage = 0;
        this.threshold = 0;
        this.restingPotential = 0;
        this.timeConstant = 10;
        this.incomingCurrent = 0;
        this.outputConnections = [];
        this.refractoryTimer = 0;
        this.refractoryPeriod = 2;
        this.isLesioned = false;
    }

    public update(dt: number): void {
        // Lesioned neurons do not update
        if (this.isLesioned) {
            return;
        }
        
        // Decrement refractory timer based on elapsed time
        if (this.refractoryTimer > 0) {
            this.refractoryTimer -= dt;
        }

        // Check threshold first (spike initiation is instantaneous)
        if (this.voltage >= this.threshold && this.refractoryTimer <= 0) {
            this.fire();
        }

        // deltaV = 1/tau[RI(t)-leak]dt
        const leak = -(this.voltage - this.restingPotential);
        const totalVoltageChange = (leak + this.incomingCurrent) / this.timeConstant;
        this.voltage += totalVoltageChange;

        // Reset incoming current after integration
        this.incomingCurrent = 0;
    }

    public lesion() {
        this.isLesioned = true;
    }

    public stimulate(currentStrength: number): void {
        this.incomingCurrent += currentStrength;
    }

    public fire(): void {
        // Lesioned neurons cannot fire
        if (this.isLesioned) {
            return;
        }
        
        this.voltage = this.restingPotential;
        this.refractoryTimer = this.refractoryPeriod;
        // Propagate to connected neurons
        console.log(`${this.name} fired! Propagating to ${this.outputConnections.length} connections`);
        this.outputConnections.forEach((connection) => {
            connection.target.stimulate(connection.weight);
        });
    }
    public addConnection(target: Neuron, weight: number, type: SynapseType): void {
        this.outputConnections.push({ target, weight, type });
    }
}
