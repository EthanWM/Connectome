// Neuron mesh creation and updates

import * as THREE from 'three';
import type { Neuron } from '../simulation/Neuron';

// Color constants
const REST_COLOR = new THREE.Color(0x4488ff);  // Blue at rest
const ACTIVE_COLOR = new THREE.Color(0xff4444); // Red when active
const FIRED_COLOR = new THREE.Color(0xffff00);  // Yellow when just fired

export class NeuronRenderer {
    private static readonly BASE_RADIUS = 0.25;  // Smaller to reduce overlap in dense regions
    private static readonly SEGMENTS = 12;

    public static createMesh(neuron: Neuron, position: THREE.Vector3): THREE.Mesh {
        const geometry = new THREE.SphereGeometry(
            NeuronRenderer.BASE_RADIUS,
            NeuronRenderer.SEGMENTS,
            NeuronRenderer.SEGMENTS
        );
        const material = new THREE.MeshStandardMaterial({
            color: REST_COLOR,
            emissive: new THREE.Color(0x000000),
            emissiveIntensity: 0,
            metalness: 0.3,
            roughness: 0.7,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.userData.neuronId = neuron.id;
        return mesh;
    }

    public static updateMesh(mesh: THREE.Mesh, neuron: Neuron): void {
        const material = mesh.material as THREE.MeshStandardMaterial;
        
        // Normalize voltage for color interpolation (assuming threshold around 1.0)
        const activity = Math.max(0, Math.min(1, neuron.voltage / (neuron.threshold || 1)));
        
        // Check if neuron just fired (in refractory period)
        if (neuron.refractoryTimer > 0) {
            material.color.copy(FIRED_COLOR);
            material.emissive.copy(FIRED_COLOR);
            material.emissiveIntensity = 0.5;
        } else {
            // Interpolate between rest and active color based on voltage
            material.color.copy(REST_COLOR).lerp(ACTIVE_COLOR, activity);
            material.emissive.copy(ACTIVE_COLOR);
            material.emissiveIntensity = activity * 0.3;
        }
        
        // Scale slightly based on activity
        const scale = 1 + activity * 0.3;
        mesh.scale.setScalar(scale);
    }
}
