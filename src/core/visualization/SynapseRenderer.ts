// Synapse line rendering with width support

import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { SynapseType } from '../simulation/types';

// Colors for different synapse types
const CHEMICAL_COLOR = new THREE.Color(0x88aaff);  // Blue for chemical
const ELECTRICAL_COLOR = new THREE.Color(0xffaa44); // Orange for gap junctions

export class SynapseRenderer {
    private static resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

    /**
     * Create a wide line between two points
     */
    public static createLine(
        start: THREE.Vector3, 
        end: THREE.Vector3, 
        type: SynapseType = SynapseType.Chemical,
        weight: number = 1
    ): Line2 {
        const geometry = new LineGeometry();
        geometry.setPositions([
            start.x, start.y, start.z,
            end.x, end.y, end.z
        ]);

        const color = type === SynapseType.Chemical ? CHEMICAL_COLOR : ELECTRICAL_COLOR;
        
        // Line width scales with weight, clamped to reasonable range
        const lineWidth = Math.max(0.5, Math.min(3, weight * 0.5 + 0.5));

        const material = new LineMaterial({
            color: color.getHex(),
            linewidth: lineWidth,
            transparent: true,
            opacity: 0.4,
            resolution: this.resolution
        });

        const line = new Line2(geometry, material);
        line.computeLineDistances();
        
        return line;
    }

    /**
     * Update resolution for proper line width rendering
     */
    public static updateResolution(width: number, height: number): void {
        this.resolution.set(width, height);
    }

    /**
     * Set line visibility (for selection-based display)
     */
    public static setLineVisible(line: Line2, visible: boolean): void {
        line.visible = visible;
    }

    /**
     * Flash line to indicate activity (returns to base opacity over time)
     */
    public static flashActivity(line: Line2): void {
        const material = line.material as LineMaterial;
        material.opacity = 1.0;
        // Store flash timestamp for decay
        (line as any).flashTime = performance.now();
    }

    /**
     * Update line opacity decay after flash
     * @param baseOpacity - opacity when not flashing (visible) or 0 if hidden
     */
    public static updateFlashDecay(line: Line2, baseOpacity: number): void {
        const flashTime = (line as any).flashTime as number | undefined;
        if (!flashTime) return;
        
        const elapsed = performance.now() - flashTime;
        const flashDuration = 500; // ms
        
        if (elapsed >= flashDuration) {
            // Flash complete
            const material = line.material as LineMaterial;
            material.opacity = baseOpacity;
            delete (line as any).flashTime;
        } else {
            // Fade from 1.0 to baseOpacity
            const t = elapsed / flashDuration;
            const material = line.material as LineMaterial;
            material.opacity = 1.0 - (1.0 - baseOpacity) * t;
        }
    }
}
