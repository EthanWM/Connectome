import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConnectomeParser } from '../../src/core/data/ConnectomeParser';
import type { ConnectomeData } from '../../src/core/data/schemas';
import { SynapseType } from '../../src/core/simulation/types';

describe('ConnectomeParser', () => {
    const mockData: ConnectomeData = {
        nodes: [
            { id: 'N1', name: 'Neuron 1' },
            { id: 'N2', name: 'Neuron 2' },
            { id: 'N3', name: 'Neuron 3' }
        ],
        edges: [
            { source: 'N1', target: 'N2', weight: 0.5 },
            { source: 'N2', target: 'N3', weight: 0.8 }
        ]
    };

    describe('parseConnectome', () => {
        it('should correctly parse nodes into neurons', () => {
            const engine = ConnectomeParser.parseConnectome(mockData);
            const neurons = engine.getAllNeurons();

            expect(neurons).toHaveLength(3);
            expect(engine.getNeuron('N1')).toBeDefined();
            expect(engine.getNeuron('N2')).toBeDefined();
            expect(engine.getNeuron('N3')).toBeDefined();
        });

        it('should correctly create connections between neurons', () => {
            const engine = ConnectomeParser.parseConnectome(mockData);
            
            const n1 = engine.getNeuron('N1');
            const n2 = engine.getNeuron('N2');
            const n3 = engine.getNeuron('N3');

            expect(n1?.outputConnections).toHaveLength(1);
            expect(n1?.outputConnections[0]).toEqual({
                target: n2,
                weight: 0.5,
                type: SynapseType.Chemical
            });

            expect(n2?.outputConnections).toHaveLength(1);
            expect(n2?.outputConnections[0]).toEqual({
                target: n3,
                weight: 0.8,
                type: SynapseType.Chemical
            });

            expect(n3?.outputConnections).toHaveLength(0);
        });

        it('should handle missing source or target neurons gracefully', () => {
            const badData: ConnectomeData = {
                nodes: [{ id: 'N1', name: 'Neuron 1' }],
                edges: [{ source: 'N1', target: 'MISSING', weight: 1.0 }]
            };

            const engine = ConnectomeParser.parseConnectome(badData);
            const n1 = engine.getNeuron('N1');

            expect(n1?.outputConnections).toHaveLength(0);
        });
    });

    describe('loadFromFile', () => {
        // Mock global fetch
        const originalFetch = globalThis.fetch;

        beforeEach(() => {
            globalThis.fetch = vi.fn();
        });

        afterEach(() => {
            globalThis.fetch = originalFetch;
        });

        it('should fetch data and parse it', async () => {
            const mockResponse = {
                json: async () => mockData
            };
            (globalThis.fetch as any).mockResolvedValue(mockResponse);

            const engine = await ConnectomeParser.loadFromFile('test.json');

            expect(globalThis.fetch).toHaveBeenCalledWith('test.json');
            expect(engine.getAllNeurons()).toHaveLength(3);
        });

        it('should throw an error if fetch fails', async () => {
            (globalThis.fetch as any).mockRejectedValue(new Error('Network error'));

            await expect(ConnectomeParser.loadFromFile('test.json'))
                .rejects
                .toThrow('Failed to load connectome file: Error: Network error');
        });
    });
});
