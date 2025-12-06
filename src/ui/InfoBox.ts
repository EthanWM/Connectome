// Neuron info display panel

import type { Neuron } from '../core/simulation/Neuron';

export interface InfoBoxCallbacks {
    onFire?: (neuron: Neuron) => void;
    onLesion?: (neuron: Neuron) => void;
}

export class InfoBox {
    private container: HTMLElement;
    private currentNeuron: Neuron | null = null;
    private callbacks: InfoBoxCallbacks;
    private hintShown: boolean = false;

    constructor(container: HTMLElement, callbacks: InfoBoxCallbacks = {}) {
        this.container = container;
        this.callbacks = callbacks;
        this.setupUI();
        this.bindEvents();
    }
    // Just creating the HTML dynamically instead of web components for now, see ActivityGraph for rationale.
    private setupUI(): void {
        this.container.className = `
            absolute top-4 right-4 w-68
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
                <div class="flex gap-2 mt-4 pt-3 border-t border-slate-700/50">
                    <button id="btn-fire-neuron" class="flex-1 px-3 py-1.5 rounded text-xs font-medium bg-orange-600 hover:bg-orange-500 text-white transition-colors" title="Fire this neuron">
                        ⚡ Fire
                    </button>
                    <button id="btn-lesion-neuron" class="flex-1 px-3 py-1.5 rounded text-xs font-medium bg-red-600 hover:bg-red-500 text-white transition-colors" title="Lesion this neuron">
                        ✕ Lesion
                    </button>
                </div>
                <div id="fire-hint" class="mt-3 pt-3 border-t border-slate-700/50 pointer-events-none opacity-0 transition-opacity duration-300">
                    <div class="bg-slate-800/70 border border-yellow-400 text-white text-xs px-3 py-2 rounded animate-pulse">
                        <span>👆 Try clicking <span class="text-yellow-300 font-bold">Fire</span> to stimulate a neuron!</span>
                    </div>
                </div>
                <div id="tutorial-hint" class="mt-3 pt-3 border-t border-slate-700/50 pointer-events-none opacity-0 transition-opacity duration-300">
                    <div class="bg-slate-800/70 border border-blue-400 text-white text-xs px-3 py-2 rounded animate-pulse">
                        <span>To better see the chain of signals, <span class="text-blue-300 font-bold">pause</span>, then <span class="text-yellow-300 font-bold">fire</span> a neuron, and <span class="text-cyan-300 font-bold">step</span> <svg class="w-3 h-3 inline fill-cyan-300" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg> <span class="text-gray-400 text-xs">(press <span class="font-mono text-cyan-300">.</span>)</span> frame-by-frame!</span>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    private bindEvents(): void {
        document.getElementById('btn-fire-neuron')?.addEventListener('click', () => {
            if (this.currentNeuron && !this.currentNeuron.isLesioned) {
                this.dismissHint();
                this.callbacks.onFire?.(this.currentNeuron);
            }
        });

        document.getElementById('btn-lesion-neuron')?.addEventListener('click', () => {
            if (this.currentNeuron && !this.currentNeuron.isLesioned) {
                this.dismissHint();
                this.callbacks.onLesion?.(this.currentNeuron);
                this.update();  // Update state display
            }
        });
    }

    private showHint(): void {
        if (this.hintShown) return;
        const hint = document.getElementById('fire-hint');
        if (hint) {
            // Delay slightly so user sees the panel first
            setTimeout(() => {
                hint.classList.remove('opacity-0');
                hint.classList.add('opacity-100');
            }, 500);
        }
    }

    private dismissHint(): void {
        this.hintShown = true;
        const hint = document.getElementById('fire-hint');
        if (hint) {
            hint.classList.remove('opacity-100');
            hint.classList.add('opacity-0');
        }
        // Also hide the tutorial hint once user takes action
        this.dismissTutorialHint();
    }

    private showTutorialHint(): void {
        if (this.hintShown) return;
        const hint = document.getElementById('tutorial-hint');
        if (hint) {
            // Delay slightly so user sees the panel first
            setTimeout(() => {
                hint.classList.remove('opacity-0');
                hint.classList.add('opacity-100');
            }, 500);
        }
    }

    private dismissTutorialHint(): void {
        const hint = document.getElementById('tutorial-hint');
        if (hint) {
            hint.classList.remove('opacity-100');
            hint.classList.add('opacity-0');
        }
    }

    public show(neuron: Neuron): void {
        this.currentNeuron = neuron;
        this.container.classList.remove('opacity-0', 'pointer-events-none');
        this.container.classList.add('opacity-100');
        this.update();
        this.showHint();
        this.showTutorialHint();
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

        // Disable action buttons if neuron is lesioned
        const fireBtn = document.getElementById('btn-fire-neuron') as HTMLButtonElement;
        const lesionBtn = document.getElementById('btn-lesion-neuron') as HTMLButtonElement;
        
        if (fireBtn) {
            fireBtn.disabled = neuron.isLesioned;
            if (neuron.isLesioned) {
                fireBtn.classList.add('opacity-50', 'cursor-not-allowed');
                fireBtn.classList.remove('hover:bg-orange-500');
            } else {
                fireBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                fireBtn.classList.add('hover:bg-orange-500');
            }
        }
        
        if (lesionBtn) {
            lesionBtn.disabled = neuron.isLesioned;
            if (neuron.isLesioned) {
                lesionBtn.classList.add('opacity-50', 'cursor-not-allowed');
                lesionBtn.classList.remove('hover:bg-red-500');
            } else {
                lesionBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                lesionBtn.classList.add('hover:bg-red-500');
            }
        }
    }
}
