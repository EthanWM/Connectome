// Simulation playback controls

export interface SimulationControlsCallbacks {
    onPlay: () => void;
    onPause: () => void;
    onStep: () => void;
    onReset: () => void;
    onSpeedChange: (speed: number) => void;
}

export class SimulationControls {
    private container: HTMLElement;
    private callbacks: SimulationControlsCallbacks;
    private isPlaying: boolean = true;
    private speed: number = 1;
    private stepCount: number = 0;

    constructor(container: HTMLElement, callbacks: SimulationControlsCallbacks) {
        this.container = container;
        this.callbacks = callbacks;
        this.setupUI();
    }

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
            <div class="flex items-center gap-2 px-2">
                <span class="text-xs text-gray-400">Speed</span>
                <input id="speed-slider" type="range" min="0.1" max="3" step="0.1" value="1"
                    class="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400">
                <span id="speed-value" class="text-xs text-gray-200 w-8">1.0x</span>
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

        document.getElementById('speed-slider')?.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            this.speed = parseFloat(target.value);
            this.updateSpeedDisplay();
            this.callbacks.onSpeedChange(this.speed);
        });
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

    private updateSpeedDisplay(): void {
        const speedValue = document.getElementById('speed-value');
        if (speedValue) {
            speedValue.textContent = `${this.speed.toFixed(1)}x`;
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
