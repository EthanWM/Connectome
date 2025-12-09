/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Neuron } from '../../src/core/simulation/Neuron';
import { GraphManager } from '../../src/ui/GraphManager';

// Mock the ActivityGraph class so tests don't depend on canvas/ResizeObserver
vi.mock('../../src/ui/ActivityGraph', async () => {
    // Instances array for tests to introspect
    const instances: any[] = [];

    class MockActivityGraph {
        container: HTMLElement;
        callbacks: any;
        neuron: Neuron | null = null;
        isPinned = false;
        update = vi.fn();
        destroy = vi.fn();
        show = vi.fn((neuron: Neuron) => { this.neuron = neuron; });
        hide = vi.fn();
        pin = vi.fn(() => { this.isPinned = true; });
        getNeuronId = vi.fn(() => this.neuron ? this.neuron.id : null);
        getIsPinned = vi.fn(() => this.isPinned);

        constructor(container: HTMLElement, callbacks: any) {
            this.container = container;
            this.callbacks = callbacks;
            instances.push(this);
        }
    }

    return { ActivityGraph: MockActivityGraph, __esModule: true, _instances: instances } as any;
});

import * as AGModule from '../../src/ui/ActivityGraph';

describe('GraphManager', () => {
    let parent: HTMLElement;
    let manager: GraphManager;

    beforeEach(() => {
        // Reset DOM and mock instances between tests
        document.body.innerHTML = '';
        parent = document.createElement('div');
        document.body.appendChild(parent);

        // Clear instances array from mock module
        (AGModule as any)._instances.length = 0;

        manager = new GraphManager(parent);
    });

    it('creates a focused graph when setFocus is called', () => {
        const neuron = new Neuron('n1');
        manager.setFocus(neuron);

        // One ActivityGraph instance should have been created
        expect((AGModule as any)._instances).toHaveLength(1);
        const inst = (AGModule as any)._instances[0];

        // show() should have been called with the neuron
        expect(inst.show).toHaveBeenCalledWith(neuron);

        // There should be one element appended to the parent
        expect(parent.children.length).toBe(1);
    });

    it('pins a focused graph when the onPin callback is invoked', () => {
        const neuron = new Neuron('n2');
        manager.setFocus(neuron);
        const inst = (AGModule as any)._instances[0];

        // Trigger the onPin callback to simulate user pin action
        inst.callbacks.onPin(inst);

        expect(manager.getPinnedCount()).toBe(1);
        // The pinned graph should have been told to pin
        expect(inst.pin).toHaveBeenCalled();
    });

    it('does not create a focused graph for an already pinned neuron', () => {
        const neuron = new Neuron('n3');
        manager.setFocus(neuron);
        const inst = (AGModule as any)._instances[0];
        // Pin it
        inst.callbacks.onPin(inst);

        // Now focus same neuron again
        manager.setFocus(neuron);
        // Should not create additional focused graph
        expect((AGModule as any)._instances).toHaveLength(1);
    });

    it('enforces a maximum number of pinned graphs', () => {
        // Pin up to the max
        const max = GraphManager.DEFAULT_MAX_PINNED; // Use implementation value
        for (let i = 0; i < max; i++) {
            const n = new Neuron(`p${i}`);
            manager.setFocus(n);
            const inst = (AGModule as any)._instances[i];
            inst.callbacks.onPin(inst);
            expect(manager.getPinnedCount()).toBe(i + 1);
        }

        // Attempt to pin one more
        const extra = new Neuron('p-extra');
        manager.setFocus(extra);
        const instExtra = (AGModule as any)._instances[max];

        // Spy on console.warn to assert the limit branch
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        instExtra.callbacks.onPin(instExtra);
        expect(manager.getPinnedCount()).toBe(max);
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it('updateAll calls update on focused and pinned graphs', () => {
        // Focus 1 neuron and keep pinned 1
        const n1 = new Neuron('u1');
        manager.setFocus(n1);
        const focusedInst = (AGModule as any)._instances[0];

        // Pin it
        focusedInst.callbacks.onPin(focusedInst);

        // Focus another neuron
        const n2 = new Neuron('u2');
        manager.setFocus(n2);
        const newFocusedInst = (AGModule as any)._instances[1];

        // Call updateAll
        manager.updateAll();

        // Both instances should have update called
        expect(focusedInst.update).toHaveBeenCalled();
        expect(newFocusedInst.update).toHaveBeenCalled();
    });

    it('updatePositions sets bottom style on graph containers', () => {
        // Focus and pin two graphs and check style.bottom values
        const n1 = new Neuron('b1');
        manager.setFocus(n1);
        const inst1 = (AGModule as any)._instances[0];
        inst1.callbacks.onPin(inst1); // pin

        const n2 = new Neuron('b2');
        manager.setFocus(n2);
        const inst2 = (AGModule as any)._instances[1];
        inst2.callbacks.onPin(inst2); // pin second

        // Focus another to sit below pinned graphs
        const nf = new Neuron('b3');
        manager.setFocus(nf);
        const inst3 = (AGModule as any)._instances[2];

        // Check bottom style is set (not empty)
        expect(inst3.container.style.bottom).not.toBe('');
        expect(inst1.container.style.bottom).not.toBe('');
        expect(inst2.container.style.bottom).not.toBe('');

        // The focused graph should be at bottom (lowest value)
        function parseBottomStyle(style: string): number {
            return Number((style || '0').replace('px', ''));
        }
        const bottoms = [
            parseBottomStyle(inst3.container.style.bottom),
            parseBottomStyle(inst1.container.style.bottom),
            parseBottomStyle(inst2.container.style.bottom)
        ];
        // The first value should be 16 (base) and then increasing
        expect(bottoms[0]).toBe(16);
        expect(bottoms[1]).toBeGreaterThan(bottoms[0]);
        expect(bottoms[2]).toBeGreaterThan(bottoms[1]);
    });
});
