// OrbitControls wrapper with focus-on-click

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';

export class CameraController {
    private controls: OrbitControls;
    private camera: THREE.Camera;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private scene?: THREE.Scene;
    private focusIndicator: THREE.Mesh;
    private isAnimating: boolean = false;

    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this.camera = camera;
        this.controls = new OrbitControls(camera, domElement);
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Create focus indicator (wireframe torus as a ring around target)
        const torusGeometry = new THREE.TorusGeometry(1.5, 0.08, 8, 24);
        const torusMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff, 
            transparent: true, 
            opacity: 0.7 
        });
        this.focusIndicator = new THREE.Mesh(torusGeometry, torusMaterial);
        this.focusIndicator.visible = false;
        
        // Enable damping for smooth camera movement
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        this.controls.minDistance = 10;
        this.controls.maxDistance = 300;
        
        this.controls.enablePan = true;
        this.controls.panSpeed = 0.8;
        
        this.controls.rotateSpeed = 0.5;

        // Double-click to focus on a point
        domElement.addEventListener('dblclick', (event) => this.onDoubleClick(event, domElement));
        
        // Hide focus indicator when user pans manually (not during animation)
        this.controls.addEventListener('change', () => {
            if (this.focusIndicator.visible && !this.isAnimating) {
                // Check if target moved away from indicator position
                const distance = this.focusIndicator.position.distanceTo(this.controls.target);
                if (distance > 0.5) {
                    this.focusIndicator.visible = false;
                }
            }
        });
    }

    public setScene(scene: THREE.Scene): void {
        this.scene = scene;
        scene.add(this.focusIndicator);
    }

    private onDoubleClick(event: MouseEvent, domElement: HTMLElement): void {
        if (!this.scene) return;

        // Calculate mouse position in normalized device coordinates
        const rect = domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Raycast to find intersected objects (exclude the focus indicator)
        this.raycaster.setFromCamera(this.mouse, this.camera as THREE.PerspectiveCamera);
        const objects = this.scene.children.filter(obj => obj !== this.focusIndicator);
        const intersects = this.raycaster.intersectObjects(objects, false);

        if (intersects.length > 0) {
            // Focus on the clicked object
            const point = intersects[0].point;
            this.animateTargetTo(point.x, point.y, point.z);
            
            // Show and position focus indicator
            this.focusIndicator.position.copy(point);
            this.focusIndicator.visible = true;
        }
    }

    private animateTargetTo(x: number, y: number, z: number): void {
        // Smoothly animate to new target
        const startTarget = this.controls.target.clone();
        const endTarget = new THREE.Vector3(x, y, z);
        const duration = 300; // ms
        const startTime = performance.now();
        
        this.isAnimating = true;

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const t = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - t, 3);
            
            this.controls.target.lerpVectors(startTarget, endTarget, eased);
            
            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
            }
        };
        animate();
    }

    public update(): void {
        this.controls.update();
        
        // Make focus indicator face the camera
        if (this.focusIndicator.visible) {
            this.focusIndicator.lookAt(this.camera.position);
        }
    }

    public setTarget(x: number, y: number, z: number): void {
        this.controls.target.set(x, y, z);
    }

    public getTarget(): THREE.Vector3 {
        return this.controls.target.clone();
    }
}
