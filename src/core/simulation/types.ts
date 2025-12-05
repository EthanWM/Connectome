// Core types for the simulation engine

import type { Neuron } from './Neuron';

export enum SynapseType {
    Chemical = 'chemical',
    Electrical = 'electrical'
}

export interface SynapseConnection {
    target: Neuron;
    weight: number;
    type: SynapseType;
}
