// Synapse line rendering

import * as THREE from 'three';

export class SynapseRenderer {
    public static createLine(start: THREE.Vector3, end: THREE.Vector3): THREE.Line {
        // TODO: Create line geometry for synapse
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial();
        const line = new THREE.Line(geometry, material);
        return line;
    }
}
