// Mode toggle and info box logic

export type InteractionMode = 'stimulate' | 'lesion';

export class ControlPanel {
    private mode: InteractionMode;

    constructor(_container: HTMLElement) {
        this.mode = 'stimulate';
        // TODO: Create UI elements
    }

    public getMode(): InteractionMode {
        return this.mode;
    }

    public setMode(mode: InteractionMode): void {
        this.mode = mode;
        // TODO: Update UI to reflect mode change
    }

    public updateInfoBox(_neuronId: string | null): void {
        // TODO: Display neuron info or hide if null
    }
}
