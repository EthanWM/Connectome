// Configuration constants for the simulation

export const SIMULATION = {
    FIRE_THRESHOLD: 1.0,
    LEAK_RATE: 0.95,
    REFRACTORY_PERIOD: 10, // frames
    STIMULATION_STRENGTH: 1.0,
} as const;

export const COLORS = {
    NEURON_DEFAULT: 0x888888,
    NEURON_ACTIVE: 0x00ffff,
    NEURON_LESIONED: 0xff0000,
    SYNAPSE_DEFAULT: 0x444444,
    BACKGROUND: 0x000000,
} as const;

export const VISUALIZATION = {
    NEURON_RADIUS: 1.0,
    NEURON_ACTIVE_SCALE: 1.5,
    SYNAPSE_OPACITY: 0.3,
} as const;
