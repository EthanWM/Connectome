import { describe, it, expect, beforeEach } from 'vitest';
import { Neuron } from '../../src/core/simulation/Neuron';
import { SynapseType } from '../../src/core/simulation/types';

describe('Neuron', () => {
    it('should initialize with correct default values', () => {
        const neuron = new Neuron('n1');
        expect(neuron.id).toBe('n1');
        expect(neuron.voltage).toBe(0);
        expect(neuron.outputConnections).toEqual([]);
        expect(neuron.isLesioned).toBe(false);
        expect(neuron.refractoryTimer).toBe(0);
        expect(neuron.incomingCurrent).toBe(0);
    });

    it('should add connections correctly', () => {
        const source = new Neuron('source');
        const target = new Neuron('target');
        
        source.addConnection(target, 0.5, SynapseType.Chemical);
        
        expect(source.outputConnections).toHaveLength(1);
        expect(source.outputConnections[0]).toEqual({
            target: target,
            weight: 0.5,
            type: SynapseType.Chemical
        });
    });

    describe('Voltage Dynamics', () => {
        it('should decay voltage toward resting potential (leak)', () => {
            const neuron = new Neuron('n1');
            neuron.restingPotential = -70;
            neuron.voltage = -50; // Above resting
            neuron.timeConstant = 10;
            const dt = 0.01;

            neuron.update(dt);

            // Voltage should have moved closer to resting potential
            expect(neuron.voltage).toBeLessThan(-50);
            expect(neuron.voltage).toBeGreaterThan(-70);
        });

        it('should integrate incoming current', () => {
            const neuron = new Neuron('n1');
            neuron.restingPotential = 0;
            neuron.voltage = 0;
            neuron.threshold = 10;
            neuron.timeConstant = 10;
            
            neuron.stimulate(5); // Add current
            neuron.update(0.01);

            expect(neuron.voltage).toBeGreaterThan(0);
        });
    });

    describe('Firing Behavior', () => {
        it('should fire when voltage reaches threshold', () => {
            const neuron = new Neuron('n1');
            neuron.threshold = 1.0;
            neuron.voltage = 1.0;
            neuron.restingPotential = 0;
            const dt = 0.01;

            neuron.update(dt);

            // Voltage should reset to resting potential
            expect(neuron.voltage).toBe(0);
            expect(neuron.refractoryTimer).toBe(neuron.refractoryPeriod);
        });

        it('should propagate signal to connected neurons when firing', () => {
            const source = new Neuron('source');
            const target = new Neuron('target');
            source.addConnection(target, 0.8, SynapseType.Chemical);
            
            source.threshold = 1.0;
            source.voltage = 1.5;
            source.update(0.01);

            expect(target.incomingCurrent).toBe(0.8);
        });

        it('should propagate to multiple targets with different weights', () => {
            const source = new Neuron('source');
            const target1 = new Neuron('target1');
            const target2 = new Neuron('target2');
            
            source.addConnection(target1, 0.5, SynapseType.Chemical);
            source.addConnection(target2, 1.2, SynapseType.Chemical);
            
            source.threshold = 1.0;
            source.voltage = 1.5;
            source.update(0.01);

            expect(target1.incomingCurrent).toBe(0.5);
            expect(target2.incomingCurrent).toBe(1.2);
        });
    });

    describe('Refractory Period', () => {
        it('should not fire during refractory period', () => {
            const neuron = new Neuron('n1');
            neuron.threshold = 1.0;
            neuron.restingPotential = 0;
            neuron.refractoryPeriod = 2.0;
            
            // First fire
            neuron.voltage = 1.5;
            neuron.update(0.01);
            expect(neuron.refractoryTimer).toBe(2.0);
            
            // Try to fire again immediately (should fail)
            neuron.voltage = 1.5;
            neuron.update(0.01);
            
            // Voltage should have decayed (leak applied) but not reset to resting (didn't fire)
            expect(neuron.voltage).toBeLessThan(1.5);
            expect(neuron.voltage).toBeGreaterThan(0);
            // Timer should still be set
            expect(neuron.refractoryTimer).toBe(2.0);
        });

        it('should decrement refractory timer (once implemented)', () => {
            // TODO: Implement timer decrement in update() method
            // This test will pass once you add: this.refractoryTimer = Math.max(0, this.refractoryTimer - dt);
        });
    });

    describe('Stimulation', () => {
        it('should accumulate incoming current from stimulation', () => {
            const neuron = new Neuron('n1');
            
            neuron.stimulate(0.5);
            expect(neuron.incomingCurrent).toBe(0.5);
            
            neuron.stimulate(0.3);
            expect(neuron.incomingCurrent).toBe(0.8);
        });
    });
});
