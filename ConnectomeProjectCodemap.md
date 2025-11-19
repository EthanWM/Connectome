## Interactive Connectome Dynamics Simulator - Architecture & Planned Functions
This codemap traces the architecture and planned functions of the Interactive Connectome Dynamics Simulator, covering data loading [2a], neural simulation [3a], 3D visualization [4b], user interaction [5b], and activity monitoring [6a]. The system uses a modular design with three main components: Simulation Engine for neural dynamics, Visualization Engine for Three.js rendering, and UI/Control Layer for user interactions.
### 1. Application Initialization Flow
Main entry point and system bootstrap sequence
### 1a. Application Entry Point (`main.ts:3`)
Main.ts serves as the bootstrap point for the entire simulator
```text
console.log('ICDS Initializing...');
```
### 1b. Simulation Engine Setup (`main.ts:5`)
Planned initialization of the neural simulation orchestrator
```text
// TODO: Initialize SimulationEngine
```
### 1c. Visualization Engine Setup (`main.ts:6`)
Planned initialization of Three.js 3D rendering system
```text
// TODO: Initialize VisualizationEngine
```
### 1d. Animation Loop Start (`main.ts:8`)
Planned start of the main render/simulation loop
```text
// TODO: Start animation loop
```
### 2. Data Loading and Connectome Parsing
JSON data ingestion and neural network construction
### 2a. Connectome Data Loading (`ConnectomeParser.ts:8`)
Async method to fetch and parse connectome JSON files
```text
public static async loadFromFile(filePath: string): Promise<SimulationEngine> {
```
### 2b. Simulation Engine Creation (`ConnectomeParser.ts:12`)
Instantiate new simulation engine for the loaded data
```text
const engine = new SimulationEngine();
```
### 2c. Data Parsing Logic (`ConnectomeParser.ts:16`)
Parse JSON structure into neuron and synapse objects
```text
public static parseConnectome(data: ConnectomeData): SimulationEngine {
```
### 2d. Data Schema Definition (`schemas.ts:15`)
Type definitions for connectome JSON structure
```text
export interface ConnectomeData {
```
### 3. Neural Simulation Core Loop
Leaky-Integrate-and-Fire model implementation and execution
### 3a. Simulation Step Execution (`SimulationEngine.ts:16`)
Main simulation loop that updates all neurons each frame
```text
public step(): void {
```
### 3b. Neuron State Update (`Neuron.ts:20`)
Individual neuron logic for leak, fire, and propagation
```text
public update(): void {
```
### 3c. Neural Activation Threshold (`constants.ts:4`)
Voltage threshold that triggers neuron firing
```text
FIRE_THRESHOLD: 1.0,
```
### 3d. Voltage Decay Rate (`constants.ts:5`)
Rate at which neuron voltage decays over time
```text
LEAK_RATE: 0.95,
```
### 4. 3D Visualization Pipeline
Three.js rendering system for neural network visualization
### 4a. Visualization Engine Init (`VisualizationEngine.ts:12`)
Initialize Three.js scene, camera, and renderer
```text
constructor(canvas: HTMLCanvasElement) {
```
### 4b. Scene Population (`VisualizationEngine.ts:21`)
Create 3D meshes for neurons and synapses from simulation data
```text
public initializeFromEngine(engine: SimulationEngine): void {
```
### 4c. Visual State Updates (`VisualizationEngine.ts:25`)
Update mesh colors and scales based on neuron voltages
```text
public updateFromEngine(engine: SimulationEngine): void {
```
### 4d. Neuron Mesh Creation (`NeuronRenderer.ts:7`)
Create sphere geometry for individual neuron visualization
```text
public static createMesh(neuron: Neuron, position: THREE.Vector3): THREE.Mesh {
```
### 5. User Interaction System
Mouse-based neuron manipulation and mode switching
### 5a. Interaction Modes (`ControlPanel.ts:3`)
Define available user interaction modes
```text
export type InteractionMode = 'stimulate' | 'lesion';
```
### 5b. Click Event Processing (`InteractionHandler.ts:27`)
Handle mouse clicks on neurons for stimulation/lesioning
```text
private handleClick(event: MouseEvent): void {
```
### 5c. Neuron Stimulation (`SimulationEngine.ts:20`)
Add voltage to specific neuron for activation
```text
public stimulateNeuron(id: string, strength: number): void {
```
### 5d. Neuron Lesioning (`SimulationEngine.ts:24`)
Disable specific neuron from simulation
```text
public lesionNeuron(id: string): void {
```
### 6. Real-time Activity Monitoring
Activity graph rendering and global network metrics
### 6a. Activity Calculation (`SimulationEngine.ts:28`)
Calculate sum of all neuron voltages for monitoring
```text
public getGlobalActivity(): number {
```
### 6b. Graph Data Update (`ActivityGraph.ts:16`)
Add new activity data point to real-time chart
```text
public addDataPoint(value: number): void {
```
### 6c. Chart Rendering (`ActivityGraph.ts:22`)
Draw line chart showing network activity over time
```text
private render(): void {
```
### 7. System Communication Architecture
Event-driven communication between system components
### 7a. Event Emission (`EventBus.ts:19`)
Broadcast events to decoupled system components
```text
public emit(event: string, ...args: any[]): void {
```
### 7b. Event Subscription (`EventBus.ts:12`)
Register listeners for system events
```text
public on(event: string, callback: EventCallback): void {
```
### 7c. System Logging (`Logger.ts:6`)
Centralized logging for debugging and monitoring
```text
public static info(message: string, ...args: any[]): void {
```