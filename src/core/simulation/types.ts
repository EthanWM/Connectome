// Core types for the simulation engine

import type { Neuron } from './Neuron';

export interface NeuronState {
    id: string;
    voltage: number;
    isLesioned: boolean;
    refractoryTimer: number;
}

export enum SynapseType {
    Chemical = 'chemical',
    Electrical = 'electrical'
}

export interface SynapseConnection {
    target: Neuron;
    weight: number;
    type: SynapseType;
}
