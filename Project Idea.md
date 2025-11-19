## 1. Project Overview

### 1.1 Project Name
Interactive Connectome Dynamics Simulator (ICDS)

### 1.2 Executive Summary
ICDS is an interactive, web-based 3D visualization tool designed to simulate and display real-time neural activity on a given connectome. Users will load a brain graph (e.g., *C. elegans*), observe the baseline and propagating activity of its neurons, and interact with the network by stimulating or "lesioning" individual neurons. This project is intended as a high-impact portfolio piece to demonstrate deep understanding of computational neuroscience principles, data visualization, and software engineering.

### 1.3 Target Audience
* **Primary:** Hiring managers and principal investigators in computational neuroscience labs.
* **Secondary:** Students and researchers interested in an intuitive, educational tool for exploring connectome dynamics.

---

## 2. Goals & Objectives

### 2.1 Primary Goals
* **Demonstrate Hirable Skills:** Create a compelling, interactive project that showcases proficiency in:
    * **Computational Modeling:** Implementing a dynamic system (neuron model).
    * **Data Visualization:** Rendering complex, 3D network data in real-time.
    * **Neuroscience Concepts:** Applying principles of connectomics, neural firing, and experimental manipulation (stimulation/lesioning).
    * **Software Engineering:** Building a robust, well-structured application.
* **Create a Novel Tool:** Develop a tool that is not commonly available as a simple, open-source web application, bridging the gap between static graph visualizations and non-visual simulation scripts.

### 2.2 Core Objectives (MVP)
* Successfully parse and load a known connectome dataset (e.g., *C. elegans*).
* Render the connectome as an interactive 3D graph.
* Implement a simple neuron model (e.g., Leaky-Integrate-and-Fire or a simplified version).
* Run a real-time simulation of activity propagating through the network.
* Allow users to "stimulate" and "lesion" individual neurons via mouse click.
* Display a real-time graph of global network activity.

---

## 3. System Architecture & Tech Stack

### 3.1 Architecture
The application will be a client-side, single-page application (SPA) with three primary, decoupled modules:

1.  **Simulation Engine:** A pure JavaScript/TypeScript module responsible for all calculations. It holds the "state" of the connectome (neuron voltages, connections, etc.) and runs the core simulation loop (`step()`). It knows nothing about visualization.
2.  **Visualization Engine:** A **Three.js** module that reads the state from the Simulation Engine on every frame and updates the 3D scene (neuron colors, positions, scales). It knows nothing about the simulation *logic*.
3.  **UI/Control Layer:** The HTML/CSS/JS layer that provides user controls (buttons, sliders) and handles user input (mouse clicks, camera controls). It sends commands to the Simulation Engine (e.g., `stimulateNeuron(id)`) and the Visualization Engine (e.g., `setCameraMode()`).

### 3.2 Tech Stack
* **Language:** **TypeScript**. (Highly recommended over JavaScript for a project of this complexity to ensure type safety for data structures like `Neuron` and `Synapse`).
* **3D Rendering:** **Three.js**. (The industry standard for web-based 3D).
* **UI Framework:** (Optional) **React**, **Vue**, or **Svelte**. For the MVP, plain **HTML/CSS/JS** is sufficient to avoid over-engineering.
* **Charting:** **Chart.js**, **D3.js**, or a custom HTML Canvas renderer (as seen in the mock-up) for the real-time activity graph.
* **Data Format:** **JSON** or **CSV** for connectome data. JSON is preferred for its simple parse-ability.

---

## 4. Core Requirements & Specifications

### 4.1 Data Core
* **Requirement:** The system must load connectome data from a static file.
* **Specification:**
    * **Input Format (JSON):** The app will fetch a `connectome.json` file.
    * **`nodes` array:** `[{ "id": "ADAL", "name": "Neuron Name", "type": "Interneuron" }, ...]`
    * **`edges` array:** `[{ "source": "ADAL", "target": "AVAR", "weight": 5 }, ...]` (Weight represents synapse strength/type).
    * **Parser:** A `ConnectomeParser` class will ingest this file and instantiate `Neuron` and `Synapse` objects for the Simulation Engine.

### 4.2 Simulation Core
* **Requirement:** The system must model neural activity over time.
* **Specification:**
    * **`Neuron` Class:**
        * `id`: string
        * `voltage`: number (current "charge")
        * `connections`: `Array<{ target: Neuron, weight: number }>`
        * `refractoryTimer`: integer (frames to wait after firing)
        * `isLesioned`: boolean
        * `update()`: Method called by the simulation loop.
    * **Simulation Logic (per frame):**
        1.  Loop through all neurons.
        2.  If neuron is lesioned or in refractory period, skip.
        3.  **Leak:** Decrease voltage by a decay factor (e.g., `voltage *= 0.95`).
        4.  **Fire Check:** If `voltage > FIRE_THRESHOLD`:
            * Trigger a "fire" event.
            * Set `refractoryTimer` to (e.g.) `10` frames.
            * **Propagate:** Loop through all `connections` and add `connection.weight` to the `target.voltage`.
            * Reset `voltage` to 0 (or a negative "hyperpolarization" value).
    * **`SimulationEngine` Class:**
        * `neurons`: `Map<string, Neuron>`
        * `step()`: Method that executes one frame of the simulation logic for all neurons.
        * `stimulateNeuron(id, strength)`: Public method to add `strength` to a neuron's voltage.
        * `lesionNeuron(id)`: Public method to set `isLesioned = true` on a neuron.
        * `getGlobalActivity()`: Method that returns the sum of all neuron voltages.

### 4.3 Visualization Core
* **Requirement:** The system must render the connectome and its activity in 3D.
* **Specification:**
    * **Scene:** A Three.js `Scene` object.
    * **Neurons:** Each `Neuron` will be represented by a `THREE.Mesh` (e.g., a `SphereGeometry`).
    * **Synapses:** Each `Synapse` will be represented by a `THREE.Line` (or `TubeGeometry` for stretch goals).
    * **Data Binding:** The `VisualizationEngine` will hold a map linking `Neuron.id` to `THREE.Mesh`.
    * **Render Loop (`animate()`):**
        1.  Call `SimulationEngine.step()`.
        2.  Get updated state from the `SimulationEngine`.
        3.  Loop through all neuron meshes:
            * If `neuron.isLesioned`, set color to **Red**.
            * If `neuron.voltage > FIRE_THRESHOLD`, set emissive color to **Bright Teal** and scale up.
            s* Else, lerp emissive color back to **Black** and scale back to 1.
    * **Controls:** `OrbitControls` will be used for camera pan, zoom, and rotate.

### 4.4 User Interface (UI)
* **Requirement:** The user must have controls to interact with the simulation.
* **Specification:**
    * **Main Viewport:** Full-screen Three.js canvas.
    * **Control Panel (HTML/CSS):**
        * **Mode Toggle:** Buttons to switch between "Stimulate" and "Lesion" modes.
        * **Info Box:** Displays info about the currently hovered neuron (e.g., `ID: ADAL`).
    * **Activity Graph (HTML Canvas):**
        * A real-time line chart graphing the output of `SimulationEngine.getGlobalActivity()`.
    * **Interaction:**
        * **Mouse Click:** Use **Raycasting** to find the clicked neuron.
        * If `mode == "stimulate"`, call `SimulationEngine.stimulateNeuron(clicked_id, 1.0)`.
        * If `mode == "lesion"`, call `SimulationEngine.lesionNeuron(clicked_id)`.

---

## 5. Milestones (MVP Development Plan)

1.  **Milestone 1: Data & Scene Setup**
    * Find and format *C. elegans* connectome data into `connectome.json`.
    * Write `ConnectomeParser` to load the data.
    * Set up a basic Three.js scene.
    * Render all neurons as spheres and all synapses as static lines.
    * Implement `OrbitControls`.

2.  **Milestone 2: Simulation Core**
    * Create the `Neuron` and `SimulationEngine` classes in a separate `.ts` file.
    * Implement the `step()` logic (leak, fire, propagate).
    * *Test:* Manually stimulate a neuron in the console and log its connections firing.

3.  **Milestone 3: Data Binding**
    * Connect the `SimulationEngine` to the `VisualizationEngine`.
    * In the `animate` loop, update neuron mesh colors based on their `voltage` state.
    * Add the real-time activity graph and hook it up.

4.  **Milestone 4: Interaction**
    * Implement the "Stimulate" / "Lesion" UI buttons.
    * Implement mouse-click raycasting.
    * Hook up the click events to call the correct `SimulationEngine` methods.

---

## 6. Stretch Goals (Post-MVP)

* **📈 Advanced Models:** Allow the user to swap the simple model for a more biologically accurate one (e.g., Izhikevich model).
* **💾 Data & State:**
    * Allow loading of *other* connectomes (e.g., *Drosophila* hemi-brain).
    * "Save State" button to export a JSON file of the current network state (including lesions).
* **🎨 Visual Polish:**
    * Represent synapses as `TubeGeometry` with a "pulse" animation on firing.
    * Use different colors/shapes for different neuron types (e.g., motor, sensory).
    * Add post-processing effects (e.g., "bloom" on firing neurons).
* **🔬 Analysis Tools:**
    * A "Search" bar to find and fly the camera to a specific neuron by name.
    * A panel to plot the voltage of a *single* clicked neuron over time.
* **📦 Packaging:** Package the final web app as a desktop application using **Electron**.