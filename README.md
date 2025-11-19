# Interactive Connectome Dynamics Simulator (ICDS)

An interactive, web-based 3D visualization tool for simulating and displaying real-time neural activity on connectomes.

## Project Structure

```
connectome/
├── public/              # Static assets
│   ├── index.html
│   ├── data/           # Connectome JSON files
│   └── assets/         # Styles and icons
├── src/
│   ├── main.ts         # Entry point
│   ├── core/
│   │   ├── simulation/ # Physics and neuron models
│   │   ├── data/       # Data parsing
│   │   └── visualization/ # Three.js rendering
│   ├── ui/             # User interface components
│   ├── config/         # Constants and configuration
│   └── utils/          # Helper utilities
└── tests/              # Unit tests
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Features (Planned)

- 3D visualization of neural connectomes
- Real-time simulation of neural activity
- Interactive neuron stimulation and lesioning
- Activity monitoring and graphing

## Tech Stack

- TypeScript
- Three.js
- Vite

## License

MIT
