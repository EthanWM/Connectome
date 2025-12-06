/**
 * Manages multiple ActivityGraph instances
 * - One "focused" graph that follows neuron selection
 * - Multiple "pinned" graphs that persist independently
 */

import type { Neuron } from '../core/simulation/Neuron';
import { ActivityGraph } from './ActivityGraph';

const MAX_PINNED_GRAPHS = 8;
const GRAPH_HEIGHT = 160; // Height of a graph container including padding
const GRAPH_SPACING = 12;  // Gap between stacked graphs

export class GraphManager {
    private parentContainer: HTMLElement;
    private focusedGraph: ActivityGraph | null = null;
    private pinnedGraphs: Map<string, ActivityGraph> = new Map(); // keyed by neuronId
    
    constructor(parentContainer: HTMLElement) {
        this.parentContainer = parentContainer;
    }
    
    /**
     * Show/update the focused graph for a neuron
     */
    public setFocus(neuron: Neuron): void {
        // If this neuron is already pinned, don't create a focused graph
        if (this.pinnedGraphs.has(neuron.id)) {
            this.clearFocus();
            return;
        }
        
        // Create focused graph if needed
        if (!this.focusedGraph) {
            const container = this.createGraphContainer();
            this.focusedGraph = new ActivityGraph(container, {
                onPin: (graph) => this.pinGraph(graph),
                onClose: (graph) => this.closeGraph(graph)
            });
        }
        
        this.focusedGraph.show(neuron);
        this.updatePositions();
    }
    
    /**
     * Hide the focused graph (pinned graphs remain)
     */
    public clearFocus(): void {
        if (this.focusedGraph) {
            this.focusedGraph.hide();
        }
    }
    
    /**
     * Pin the currently focused graph
     */
    private pinGraph(graph: ActivityGraph): void {
        const neuronId = graph.getNeuronId();
        if (!neuronId) return;
        
        // Check if already pinned or at max
        if (this.pinnedGraphs.has(neuronId)) return;
        if (this.pinnedGraphs.size >= MAX_PINNED_GRAPHS) {
            console.warn(`Maximum of ${MAX_PINNED_GRAPHS} pinned graphs reached`);
            return;
        }
        
        // If this is the focused graph, transfer ownership to pinned
        if (graph === this.focusedGraph) {
            this.focusedGraph = null;
        }
        
        graph.pin();
        this.pinnedGraphs.set(neuronId, graph);
        this.updatePositions();
    }
    
    /**
     * Close/remove a pinned graph
     */
    private closeGraph(graph: ActivityGraph): void {
        const neuronId = graph.getNeuronId();
        if (neuronId && this.pinnedGraphs.has(neuronId)) {
            this.pinnedGraphs.delete(neuronId);
        }
        graph.destroy();
        this.updatePositions();
    }
    
    /**
     * Update all graphs (called each frame)
     */
    public updateAll(): void {
        this.focusedGraph?.update();
        for (const graph of this.pinnedGraphs.values()) {
            graph.update();
        }
    }
    
    /**
     * Create a new container element for a graph
     */
    private createGraphContainer(): HTMLElement {
        const container = document.createElement('div');
        this.parentContainer.appendChild(container);
        return container;
    }
    
    /**
     * Update vertical positions of all graphs (stacked from bottom)
     */
    private updatePositions(): void {
        let bottomOffset = 16; // Initial bottom padding (matches Tailwind bottom-4)
        
        // Position focused graph at bottom
        if (this.focusedGraph) {
            const container = this.focusedGraph['container'] as HTMLElement;
            container.style.bottom = `${bottomOffset}px`;
            bottomOffset += GRAPH_HEIGHT + GRAPH_SPACING;
        }
        
        // Stack pinned graphs above focused
        for (const graph of this.pinnedGraphs.values()) {
            const container = graph['container'] as HTMLElement;
            container.style.bottom = `${bottomOffset}px`;
            bottomOffset += GRAPH_HEIGHT + GRAPH_SPACING;
        }
    }
    
    /**
     * Get count of pinned graphs
     */
    public getPinnedCount(): number {
        return this.pinnedGraphs.size;
    }
}
