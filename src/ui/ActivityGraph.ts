/**
 * Real-time voltage chart for focused neuron
 * 
 * Using plain typescript and dynamic HTML rather than web components
 * - Simpler (no Shadow DOM/template complexity)
 * - Better Tailwind integration (utility classes work in light DOM)
 * - Not shipping as reusable library (no CSS isolation needed)
 * - Faster development and iteration
 * - Less boilerplate for a single-use visualization component
 * 
 * Alternative considered: Web Components with Shadow DOM
 * - Slightly less ugly
 * - Would provide style encapsulation
 * - Would add ~50% more code (setupTemplate, lifecycle hooks)
 * - Would break Tailwind integration (need manual CSS)
 * - Overkill for project-internal component
 */

import type { Neuron } from '../core/simulation/Neuron';

interface DataSeries {
    label: string;
    color: string;
    data: number[];
}

export interface ActivityGraphCallbacks {
    onPin?: (graph: ActivityGraph) => void;
    onClose?: (graph: ActivityGraph) => void;
}

let graphInstanceCounter = 0;

export class ActivityGraph {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private series: DataSeries;
    private thresholdValue: number = 1;
    private maxPoints: number = 200;
    private currentNeuron: Neuron | null = null;
    private isPinned: boolean = false;
    private callbacks: ActivityGraphCallbacks;
    
    // Scoped element references (no global IDs)
    private neuronLabelEl: HTMLElement | null = null;
    private yAxisEl: HTMLElement | null = null;
    private pinBtn: HTMLButtonElement | null = null;
    private closeBtn: HTMLButtonElement | null = null;
    
    public readonly instanceId: number;

    constructor(container: HTMLElement, callbacks: ActivityGraphCallbacks = {}) {
        this.instanceId = ++graphInstanceCounter;
        this.container = container;
        this.callbacks = callbacks;
        this.setupUI();
        
        this.canvas = container.querySelector('canvas')!;
        this.ctx = this.canvas.getContext('2d')!;
        
        // Cache element references (scoped to container)
        this.neuronLabelEl = container.querySelector('[data-graph-neuron]');
        this.yAxisEl = container.querySelector('[data-y-axis]');
        this.pinBtn = container.querySelector('[data-btn-pin]');
        this.closeBtn = container.querySelector('[data-btn-close]');
        
        this.series = {
            label: 'Voltage',
            color: '#22d3ee', // cyan-400
            data: []
        };

        this.setupResizeObserver();
        this.bindEvents();
    }
    
    private bindEvents(): void {
        this.pinBtn?.addEventListener('click', () => {
            if (!this.isPinned) {
                this.callbacks.onPin?.(this);
            }
        });
        
        this.closeBtn?.addEventListener('click', () => {
            this.callbacks.onClose?.(this);
        });
    }

    private setupUI(): void {
        this.container.className = `
            absolute bottom-4 right-4 w-80
            rounded-lg bg-slate-900/90 backdrop-blur-sm
            border border-slate-700/50
            text-sm text-gray-200
            transition-opacity duration-200
            opacity-0 pointer-events-none
        `.replace(/\s+/g, ' ').trim();

        this.container.innerHTML = `
            <div class="p-3">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="font-bold text-white text-xs" data-graph-title>Voltage</h4>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-400" data-graph-neuron>—</span>
                        <button data-btn-pin class="text-gray-400 hover:text-cyan-400 transition-colors" title="Pin this graph">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A6 6 0 0 1 5 6.708V2.277a3 3 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354m1.58 1.408-.002-.001zm-.002-.001.002.001A.5.5 0 0 1 6 2v5a.5.5 0 0 1-.276.447h-.002l-.012.007-.054.03a5 5 0 0 0-.827.58c-.318.278-.585.596-.725.936h7.792c-.14-.34-.407-.658-.725-.936a5 5 0 0 0-.881-.61l-.012-.006h-.002A.5.5 0 0 1 10 7V2a.5.5 0 0 1 .295-.458 1.8 1.8 0 0 0 .351-.271c.08-.08.155-.17.214-.271H5.14q.091.15.214.271a1.8 1.8 0 0 0 .37.282"/>
                            </svg>
                        </button>
                        <button data-btn-close class="text-gray-400 hover:text-red-400 transition-colors hidden" title="Close graph">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="flex gap-1">
                    <div data-y-axis class="flex flex-col justify-between text-xs text-gray-500 w-8 text-right pr-1"></div>
                    <canvas class="flex-1 h-24 rounded bg-slate-800/50"></canvas>
                </div>
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>-${this.maxPoints} steps</span>
                    <span>now</span>
                </div>
            </div>
        `;
    }

    private setupResizeObserver(): void {
        // Set canvas resolution to match display size
        const resizeCanvas = () => {
            const rect = this.canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
            this.render();
        };

        // Initial size
        setTimeout(resizeCanvas, 0);
        
        // Observe container resize
        const observer = new ResizeObserver(resizeCanvas);
        observer.observe(this.canvas);
    }

    public show(neuron: Neuron): void {
        this.currentNeuron = neuron;
        this.thresholdValue = neuron.threshold;
        this.series.data = []; // Reset data for new neuron
        
        if (this.neuronLabelEl) this.neuronLabelEl.textContent = neuron.name;
        
        this.container.classList.remove('opacity-0', 'pointer-events-none');
        this.container.classList.add('opacity-100');
    }

    public hide(): void {
        this.currentNeuron = null;
        this.container.classList.remove('opacity-100');
        this.container.classList.add('opacity-0', 'pointer-events-none');
    }
    
    /**
     * Mark this graph as pinned (persistent, shows close button)
     */
    public pin(): void {
        this.isPinned = true;
        this.pinBtn?.classList.add('hidden');
        this.closeBtn?.classList.remove('hidden');
        // Add visual indicator for pinned state
        this.container.classList.add('border-cyan-500/50');
    }
    
    /**
     * Get the neuron ID this graph is tracking
     */
    public getNeuronId(): string | null {
        return this.currentNeuron?.id ?? null;
    }
    
    /**
     * Check if this graph is pinned
     */
    public getIsPinned(): boolean {
        return this.isPinned;
    }
    
    /**
     * Remove this graph from the DOM
     */
    public destroy(): void {
        this.container.remove();
    }

    public update(): void {
        if (!this.currentNeuron) return;
        
        this.series.data.push(this.currentNeuron.voltage);
        
        // Limit data points
        if (this.series.data.length > this.maxPoints) {
            this.series.data.shift();
        }
        
        this.render();
    }

    private updateYAxis(minVal: number, maxVal: number): void {
        if (!this.yAxisEl) return;

        // Show 3 tick marks: min, middle, max
        const midVal = (minVal + maxVal) / 2;
        const ticks = [maxVal, midVal, minVal];

        this.yAxisEl.innerHTML = ticks
            .map(val => `<div>${val.toFixed(1)}</div>`)
            .join('');
    }

    private render(): void {
        const width = this.canvas.getBoundingClientRect().width;
        const height = this.canvas.getBoundingClientRect().height;
        
        if (width === 0 || height === 0) return;
        
        const data = this.series.data;
        if (data.length < 2) {
            // Don't render until we have enough data points
            // Prevents initial spike from incomplete dataset
            this.ctx.clearRect(0, 0, width, height);
            return;
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Calculate Y scale based on data range and threshold
        // Always include range from 0 to (threshold * 1.2) for stable axis
        const dataMin = Math.min(...data);
        const dataMax = Math.max(...data);
        const minVal = Math.min(0, dataMin);
        const maxVal = Math.max(this.thresholdValue * 1.2, dataMax);
        const range = maxVal - minVal || 1;
        
        // Update Y-axis labels
        this.updateYAxis(minVal, maxVal);
        
        const padding = 4;
        const graphWidth = width - padding * 2;
        const graphHeight = height - padding * 2;
        
        // Draw threshold line
        const thresholdY = padding + graphHeight - ((this.thresholdValue - minVal) / range) * graphHeight;
        this.ctx.strokeStyle = '#ef4444'; // red-500
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([4, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(padding, thresholdY);
        this.ctx.lineTo(width - padding, thresholdY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw zero line
        const zeroY = padding + graphHeight - ((0 - minVal) / range) * graphHeight;
        this.ctx.strokeStyle = '#475569'; // slate-600
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(padding, zeroY);
        this.ctx.lineTo(width - padding, zeroY);
        this.ctx.stroke();
        
        // Draw voltage line
        this.ctx.strokeStyle = this.series.color;
        this.ctx.lineWidth = 2;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        
        const stepX = graphWidth / (this.maxPoints - 1);
        const startX = padding + (this.maxPoints - data.length) * stepX;
        
        for (let i = 0; i < data.length; i++) {
            const x = startX + i * stepX;
            const y = padding + graphHeight - ((data[i] - minVal) / range) * graphHeight;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.stroke();
        
        // Draw current value dot
        if (data.length > 0) {
            const lastX = startX + (data.length - 1) * stepX;
            const lastY = padding + graphHeight - ((data[data.length - 1] - minVal) / range) * graphHeight;
            
            this.ctx.fillStyle = this.series.color;
            this.ctx.beginPath();
            this.ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}

