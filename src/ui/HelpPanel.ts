// Instructions/help panel

export class HelpPanel {
    private container: HTMLElement;
    private isVisible: boolean = true;

    constructor(container: HTMLElement) {
        this.container = container;
        this.setupUI();
    }

    private setupUI(): void {
        this.container.className = `
            absolute bottom-4 left-4 w-72
            rounded-lg bg-slate-900/90 backdrop-blur-sm
            border border-slate-700/50
            text-sm text-gray-200
            transition-all duration-200
        `.replace(/\s+/g, ' ').trim();

        this.container.innerHTML = `
            <div class="p-4">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-bold text-white flex items-center gap-2">
                        <span class="text-cyan-400">?</span>
                        Controls
                    </h4>
                    <button id="btn-toggle-help" class="text-gray-400 hover:text-white text-xs transition-colors">
                        Hide
                    </button>
                </div>
                <div id="help-content" class="space-y-2 text-xs">
                    <div class="flex items-start gap-2">
                        <span class="text-cyan-400 font-mono w-24 shrink-0">Left-drag</span>
                        <span class="text-gray-300">Rotate camera</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="text-cyan-400 font-mono w-24 shrink-0">Right-drag</span>
                        <span class="text-gray-300">Pan camera</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="text-cyan-400 font-mono w-24 shrink-0">Scroll</span>
                        <span class="text-gray-300">Zoom in/out</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="text-cyan-400 font-mono w-24 shrink-0">Double-click</span>
                        <span class="text-gray-300">Focus on neuron</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="text-cyan-400 font-mono w-24 shrink-0">Escape</span>
                        <span class="text-gray-300">Deselect neuron</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="text-cyan-400 font-mono w-24 shrink-0">Space</span>
                        <span class="text-gray-300">Play/pause simulation</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="text-cyan-400 font-mono w-24 shrink-0">.</span>
                        <span class="text-gray-300">Step forward (when paused)</span>
                    </div>
                    <div class="border-t border-slate-700/50 my-2 pt-2">
                        <p class="text-gray-400">Use the info panel to <span class="text-orange-400">Fire</span> or <span class="text-red-400">Lesion</span> selected neurons.</p>
                    </div>
                </div>
            </div>
            <div id="tutorial-hint" class="absolute top-1/2 -translate-y-1/2 left-full ml-4 flex items-center pointer-events-none opacity-0 transition-opacity duration-300">
                <div class="bg-slate-900/95 border-2 border-blue-400 text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg animate-pulse flex items-center gap-3">
                    <span>🎬 <span class="text-blue-400 font-bold">Pause</span> → <span class="text-orange-400 font-bold">Fire</span> → <span class="text-cyan-400 font-bold">Step (.)</span> to see signal propagate!</span>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    private bindEvents(): void {
        document.getElementById('btn-toggle-help')?.addEventListener('click', () => {
            this.toggle();
        });
        
        // Show tutorial hint after a delay
        setTimeout(() => {
            const hint = document.getElementById('tutorial-hint');
            if (hint) {
                hint.classList.remove('opacity-0');
                hint.classList.add('opacity-100');
            }
        }, 1500);
    }

    public toggle(): void {
        this.isVisible = !this.isVisible;
        const content = document.getElementById('help-content');
        const btn = document.getElementById('btn-toggle-help');
        
        if (content && btn) {
            if (this.isVisible) {
                content.classList.remove('hidden');
                btn.textContent = 'Hide';
            } else {
                content.classList.add('hidden');
                btn.textContent = 'Show';
            }
        }
    }

    public show(): void {
        this.isVisible = true;
        const content = document.getElementById('help-content');
        const btn = document.getElementById('btn-toggle-help');
        if (content) content.classList.remove('hidden');
        if (btn) btn.textContent = 'Hide';
    }

    public hide(): void {
        this.isVisible = false;
        const content = document.getElementById('help-content');
        const btn = document.getElementById('btn-toggle-help');
        if (content) content.classList.add('hidden');
        if (btn) btn.textContent = 'Show';
    }
}
