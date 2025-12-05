// Neuron info display panel

import type { Neuron } from '../core/simulation/Neuron';
import { ActivityGraph } from './ActivityGraph';

export class InfoBox {
    private container: HTMLElement;
    private currentNeuron: Neuron | null = null;

    constructor(container: HTMLElement) {
        this.container = container;
        this.setupUI();
    }
    // Just creating the HTML dynamically instead of web components for now, see ActivityGraph for rationale.
    private setupUI(): void {
        this.container.className = `
            absolute top-4 right-4 w-64
            rounded-lg bg-slate-900/90 backdrop-blur-sm
            border border-slate-700/50
            text-sm text-gray-200
            transition-opacity duration-200
            opacity-0 pointer-events-none
        `.replace(/\s+/g, ' ').trim();

        this.container.innerHTML = `
            <div class="p-4">
                <h4 class="font-bold text-white mb-3 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span id="info-neuron-name">Neuron</span>
                </h4>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-gray-400">Type</span>
                        <span id="info-type" class="font-mono text-gray-200">—</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Voltage</span>
                        <span id="info-voltage" class="font-mono text-gray-200">0.00</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Threshold</span>
                        <span id="info-threshold" class="font-mono text-gray-200">0.00</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Connections</span>
                        <span id="info-connections" class="font-mono text-gray-200">0</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">State</span>
                        <span id="info-state" class="font-mono">—</span>
                    </div>
                </div>
            </div>
        `;
    }

    public show(neuron: Neuron): void {
        this.currentNeuron = neuron;
        this.container.classList.remove('opacity-0', 'pointer-events-none');
        this.container.classList.add('opacity-100');
        this.update();
    }

    public hide(): void {
        this.currentNeuron = null;
        this.container.classList.remove('opacity-100');
        this.container.classList.add('opacity-0', 'pointer-events-none');
    }

    public update(): void {
        if (!this.currentNeuron) return;

        const neuron = this.currentNeuron;
        
        const nameEl = document.getElementById('info-neuron-name');
        const typeEl = document.getElementById('info-type');
        const voltageEl = document.getElementById('info-voltage');
        const thresholdEl = document.getElementById('info-threshold');
        const connectionsEl = document.getElementById('info-connections');
        const stateEl = document.getElementById('info-state');

        if (nameEl) nameEl.textContent = neuron.name;
        if (typeEl) typeEl.textContent = neuron.type || '—';
        if (voltageEl) voltageEl.textContent = neuron.voltage.toFixed(3);
        if (thresholdEl) thresholdEl.textContent = neuron.threshold.toFixed(2);
        if (connectionsEl) connectionsEl.textContent = String(neuron.outputConnections.length);
        
        if (stateEl) {
            if (neuron.isLesioned) {
                stateEl.textContent = 'Lesioned';
                stateEl.className = 'font-mono text-red-400';
            } else if (neuron.refractoryTimer > 0) {
                stateEl.textContent = 'Refractory';
                stateEl.className = 'font-mono text-yellow-400';
            } else if (neuron.voltage >= neuron.threshold * 0.8) {
                stateEl.textContent = 'Active';
                stateEl.className = 'font-mono text-green-400';
            } else {
                stateEl.textContent = 'Resting';
                stateEl.className = 'font-mono text-gray-400';
            }
        }
    }
}
