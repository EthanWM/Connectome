// Neuron mesh creation and updates

import * as THREE from 'three';
import type { Neuron } from '../simulation/Neuron';

export class NeuronRenderer {
    public static createMesh(neuron: Neuron, position: THREE.Vector3): THREE.Mesh {
        // TODO: Create sphere geometry for neuron
        const geometry = new THREE.SphereGeometry(1, 16, 16);
        const material = new THREE.MeshStandardMaterial();
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        return mesh;
    }

    public static updateMesh(mesh: THREE.Mesh, neuron: Neuron): void {
        // TODO: Update color and scale based on neuron state
    }
}
