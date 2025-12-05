// Simulation playback controls

export type InteractionMode = 'fire' | 'lesion';

export interface SimulationControlsCallbacks {
    onPlay: () => void;
    onPause: () => void;
    onStep: () => void;
    onReset: () => void;
    onSpeedChange: (speed: number) => void;
    onModeChange?: (mode: InteractionMode) => void;
}

export class SimulationControls {
    private container: HTMLElement;
    private callbacks: SimulationControlsCallbacks;
    private isPlaying: boolean = true;
    private stepCount: number = 0;
    private mode: InteractionMode = 'fire';

    constructor(container: HTMLElement, callbacks: SimulationControlsCallbacks) {
        this.container = container;
        this.callbacks = callbacks;
        this.setupUI();
    }
    // Just creating the HTML dynamically instead of web components for now, see ActivityGraph for rationale.
    private setupUI(): void {
        this.container.className = `
            absolute top-4 left-1/2 -translate-x-1/2
            flex items-center gap-1
            rounded-lg bg-slate-900/90 backdrop-blur-sm
            border border-slate-700/50
            p-2
        `.replace(/\s+/g, ' ').trim();

        this.container.innerHTML = `
            <button id="btn-play" class="p-2 rounded-md hover:bg-slate-700 text-gray-200 transition-colors" title="Play">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </button>
            <button id="btn-pause" class="p-2 rounded-md hover:bg-slate-700 text-cyan-400 transition-colors" title="Pause">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
            </button>
            <button id="btn-step" class="p-2 rounded-md hover:bg-slate-700 text-gray-200 transition-colors" title="Step">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                </svg>
            </button>
            <button id="btn-reset" class="p-2 rounded-md hover:bg-slate-700 text-gray-200 transition-colors" title="Reset">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                </svg>
            </button>
            <div class="h-6 w-px bg-slate-700 mx-1"></div>
            <div class="flex items-center gap-1 px-1">
                <button id="btn-mode-fire" class="px-2 py-1 rounded text-xs font-medium transition-colors bg-orange-600 text-white" title="Click neurons to fire them">
                    Fire
                </button>
                <button id="btn-mode-lesion" class="px-2 py-1 rounded text-xs font-medium transition-colors bg-slate-700 text-gray-300 hover:bg-slate-600" title="Click neurons to lesion them">
                    Lesion
                </button>
            </div>
            <div class="h-6 w-px bg-slate-700 mx-1"></div>
            <div class="flex items-center gap-2 px-2">
                <span class="w-2 h-2 rounded-full bg-green-500" id="status-dot"></span>
                <span class="text-xs text-gray-200" id="step-counter">Step 0</span>
            </div>
        `;

        this.bindEvents();
        this.updatePlayPauseState();
    }

    private bindEvents(): void {
        document.getElementById('btn-play')?.addEventListener('click', () => {
            this.isPlaying = true;
            this.updatePlayPauseState();
            this.callbacks.onPlay();
        });

        document.getElementById('btn-pause')?.addEventListener('click', () => {
            this.isPlaying = false;
            this.updatePlayPauseState();
            this.callbacks.onPause();
        });

        document.getElementById('btn-step')?.addEventListener('click', () => {
            this.callbacks.onStep();
        });

        document.getElementById('btn-reset')?.addEventListener('click', () => {
            this.stepCount = 0;
            this.updateStepCounter();
            this.callbacks.onReset();
        });

        document.getElementById('btn-mode-fire')?.addEventListener('click', () => {
            this.setMode('fire');
        });

        document.getElementById('btn-mode-lesion')?.addEventListener('click', () => {
            this.setMode('lesion');
        });
    }

    private setMode(mode: InteractionMode): void {
        this.mode = mode;
        this.updateModeButtons();
        this.callbacks.onModeChange?.(mode);
    }

    private updateModeButtons(): void {
        const fireBtn = document.getElementById('btn-mode-fire');
        const lesionBtn = document.getElementById('btn-mode-lesion');

        if (this.mode === 'fire') {
            fireBtn?.classList.remove('bg-slate-700', 'text-gray-300', 'hover:bg-slate-600');
            fireBtn?.classList.add('bg-orange-600', 'text-white');
            lesionBtn?.classList.remove('bg-red-600', 'text-white');
            lesionBtn?.classList.add('bg-slate-700', 'text-gray-300', 'hover:bg-slate-600');
        } else {
            fireBtn?.classList.remove('bg-orange-600', 'text-white');
            fireBtn?.classList.add('bg-slate-700', 'text-gray-300', 'hover:bg-slate-600');
            lesionBtn?.classList.remove('bg-slate-700', 'text-gray-300', 'hover:bg-slate-600');
            lesionBtn?.classList.add('bg-red-600', 'text-white');
        }
    }

    public getMode(): InteractionMode {
        return this.mode;
    }

    private updatePlayPauseState(): void {
        const playBtn = document.getElementById('btn-play');
        const pauseBtn = document.getElementById('btn-pause');
        const statusDot = document.getElementById('status-dot');

        if (this.isPlaying) {
            playBtn?.classList.remove('text-gray-200');
            playBtn?.classList.add('text-cyan-400');
            pauseBtn?.classList.remove('text-cyan-400');
            pauseBtn?.classList.add('text-gray-200');
            statusDot?.classList.remove('bg-yellow-500');
            statusDot?.classList.add('bg-green-500');
        } else {
            playBtn?.classList.remove('text-cyan-400');
            playBtn?.classList.add('text-gray-200');
            pauseBtn?.classList.remove('text-gray-200');
            pauseBtn?.classList.add('text-cyan-400');
            statusDot?.classList.remove('bg-green-500');
            statusDot?.classList.add('bg-yellow-500');
        }
    }

    public incrementStep(): void {
        this.stepCount++;
        this.updateStepCounter();
    }

    private updateStepCounter(): void {
        const counter = document.getElementById('step-counter');
        if (counter) {
            counter.textContent = `Step ${this.stepCount}`;
        }
    }

    public setPlaying(playing: boolean): void {
        this.isPlaying = playing;
        this.updatePlayPauseState();
    }
}
