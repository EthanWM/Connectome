import { describe, it, expect } from 'vitest';
import { Neuron } from '../../src/core/simulation/Neuron';
import { SynapseType } from '../../src/core/simulation/types';

describe('Neuron', () => {
    it('should initialize with correct default values', () => {
        const neuron = new Neuron('n1');
        expect(neuron.id).toBe('n1');
        expect(neuron.voltage).toBe(0);
        expect(neuron.connections).toEqual([]);
        expect(neuron.isLesioned).toBe(false);
    });

    it('should add connections correctly', () => {
        const source = new Neuron('source');
        const target = new Neuron('target');
        
        source.addConnection(target, 0.5, SynapseType.Chemical);
        
        expect(source.connections).toHaveLength(1);
        expect(source.connections[0]).toEqual({
            target: target,
            weight: 0.5,
            type: SynapseType.Chemical
        });
    });
});
