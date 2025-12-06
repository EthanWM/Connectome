// Frequently asked questions panel

export class FAQPanel {
    private container: HTMLElement;
    private isVisible: boolean = false;

    constructor(container: HTMLElement) {
        this.container = container;
        this.setupUI();
    }

    private setupUI(): void {
        this.container.className = `
            absolute top-4 left-4 w-80
            rounded-lg bg-slate-900/90 backdrop-blur-sm
            border border-slate-700/50
            text-sm text-gray-200
            transition-all duration-200
            max-h-96 overflow-y-auto
        `.replace(/\s+/g, ' ').trim();

        this.container.innerHTML = `
            <div class="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors" id="faq-header">
                <div class="flex items-center justify-between">
                    <h4 class="font-bold text-white flex items-center gap-2">
                        <span class="text-yellow-400">?</span>
                        FAQ
                    </h4>
                    <button id="btn-toggle-faq" class="text-gray-400 hover:text-white text-xs transition-colors">
                        ${this.isVisible ? 'Hide' : 'Show'}
                    </button>
                </div>
                <div id="faq-content" class="space-y-3 text-xs mt-3 ${this.isVisible ? '' : 'hidden'}">
                    <div>
                        <h5 class="font-semibold text-cyan-400 mb-1">Why doesn't the signal always propagate?</h5>
                        <p class="text-gray-300">Neurons enter a <span class="text-yellow-400 font-semibold">refractory period</span> after firing. During this time, they cannot fire again, even if they receive signals. This models real neural behavior and prevents infinite loops.</p>
                    </div>
                    
                    <div>
                        <h5 class="font-semibold text-cyan-400 mb-1">What does "Lesion" do?</h5>
                        <p class="text-gray-300">Lesioning a neuron permanently disables it—it can no longer fire or transmit signals. This simulates neural damage or ablation.</p>
                    </div>
                    
                    <div>
                        <h5 class="font-semibold text-cyan-400 mb-1">What are those yellow dots?</h5>
                        <p class="text-gray-300">Yellow dots represent <span class="text-yellow-400 font-semibold">neurons</span>, which the cyan edges represent <span class="text-cyan-400 font-semibold">synapses</span>—connections between neurons where signals are transmitted.</p>
                    </div>
                    
                    <div>
                        <h5 class="font-semibold text-cyan-400 mb-1">How do I track multiple neurons?</h5>
                        <p class="text-gray-300">Click the <span class="text-cyan-400 font-semibold">pin icon</span> on any activity graph to pin it. You can have up to 8 pinned graphs visible at once to compare activity across neurons.</p>
                    </div>
                    
                    <div>
                        <h5 class="font-semibold text-cyan-400 mb-1">What's that blue line in the graph?</h5>
                        <p class="text-gray-300">The dashed <span class="text-red-400 font-semibold">red line</span> shows the firing threshold. When voltage crosses above it, the neuron fires.</p>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    private bindEvents(): void {
        const toggleBtn = document.getElementById('btn-toggle-faq');
        const headerDiv = document.getElementById('faq-header');

        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent double toggle
            this.toggle();
        });

        headerDiv?.addEventListener('click', () => {
            this.toggle();
        });
    }

    public toggle(): void {
        this.isVisible = !this.isVisible;
        const content = document.getElementById('faq-content');
        const btn = document.getElementById('btn-toggle-faq');
        
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
        const content = document.getElementById('faq-content');
        const btn = document.getElementById('btn-toggle-faq');
        if (content) content.classList.remove('hidden');
        if (btn) btn.textContent = 'Hide';
    }

    public hide(): void {
        this.isVisible = false;
        const content = document.getElementById('faq-content');
        const btn = document.getElementById('btn-toggle-faq');
        if (content) content.classList.add('hidden');
        if (btn) btn.textContent = 'Show';
    }
}
