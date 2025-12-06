// Neuron mesh creation and updates

import * as THREE from 'three';
import type { Neuron } from '../simulation/Neuron';

// Color constants
const REST_COLOR = new THREE.Color(0xffff00);  // Yellow at rest
const ACTIVE_COLOR = new THREE.Color(0xff4444); // Red when active
const FIRED_COLOR = new THREE.Color(0xff6600);  // Darker orange when just fired
const LESIONED_COLOR = new THREE.Color(0x444444); // Gray when lesioned

export class NeuronRenderer {
    private static readonly BASE_RADIUS = 0.25;  // Smaller to reduce overlap in dense regions
    private static readonly SEGMENTS = 12;

    public static createMesh(neuron: Neuron, position: THREE.Vector3): THREE.Mesh {
        const geometry = new THREE.SphereGeometry(
            NeuronRenderer.BASE_RADIUS,
            NeuronRenderer.SEGMENTS,
            NeuronRenderer.SEGMENTS
        );
        const material = new THREE.MeshBasicMaterial({
            color: REST_COLOR,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.userData.neuronId = neuron.id;
        return mesh;
    }

    public static updateMesh(mesh: THREE.Mesh, neuron: Neuron): void {
        const material = mesh.material as THREE.MeshBasicMaterial;
        
        // Lesioned neurons are grayed out
        if (neuron.isLesioned) {
            material.color.copy(LESIONED_COLOR);
            mesh.scale.setScalar(0.8);  // Slightly smaller to indicate inactive
            return;
        }
        
        // Normalize voltage for color interpolation (assuming threshold around 1.0)
        const activity = Math.max(0, Math.min(1, neuron.voltage / (neuron.threshold || 1)));
        
        // Check if neuron is in refractory period (recently fired)
        if (neuron.refractoryTimer > 0) {
            // Fade from orange (just fired) to yellow (rest) over refractory period
            const refractoryProgress = neuron.refractoryTimer / neuron.refractoryPeriod;
            material.color.copy(REST_COLOR).lerp(FIRED_COLOR, refractoryProgress);
            
            // Scale pulse that decays with refractory
            const scale = 1 + refractoryProgress * 0.5;
            mesh.scale.setScalar(scale);
        } else {
            // Interpolate between rest and active color based on voltage
            material.color.copy(REST_COLOR).lerp(ACTIVE_COLOR, activity);
            
            // Scale slightly based on activity
            const scale = 1 + activity * 0.3;
            mesh.scale.setScalar(scale);
        }
    }
}
