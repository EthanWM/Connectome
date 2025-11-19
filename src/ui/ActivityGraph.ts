// Real-time chart renderer

export class ActivityGraph {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private dataPoints: number[];

    constructor(container: HTMLElement) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d')!;
        this.dataPoints = [];
        container.appendChild(this.canvas);
        // TODO: Initialize canvas size
    }

    public addDataPoint(value: number): void {
        this.dataPoints.push(value);
        // TODO: Limit array size for performance
        this.render();
    }

    private render(): void {
        // TODO: Draw line chart
    }
}
