// Core types for the simulation engine

export interface NeuronState {
    id: string;
    voltage: number;
    isLesioned: boolean;
    refractoryTimer: number;
}

export interface SynapseConnection {
    targetId: string;
    weight: number;
}
