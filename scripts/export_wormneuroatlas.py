"""
Export connectome data from WormNeuroAtlas.

This script extracts neuron IDs, 3D positions, and synaptic connections
(both chemical and electrical) from the wormneuroatlas package and saves
them to JSON files for use by the visualization.

Run from the project root:
    python scripts/export_wormneuroatlas.py
"""

import json
import os

import wormneuroatlas as wa


def export_connectome_data():
    print("Loading WormNeuroAtlas...")
    atlas = wa.NeuroAtlas()
    
    # Get neuron IDs
    neuron_ids = atlas.neuron_ids.tolist()
    print(f"Found {len(neuron_ids)} neurons")
    
    # Get connectome matrices
    chemical_synapses = atlas.get_chemical_synapses()
    electrical_synapses = atlas.get_electrical_synapses()
    
    # Load neuron positions from the atlas data files
    wormneuroatlas_path = os.path.dirname(wa.__file__)
    positions_file = os.path.join(wormneuroatlas_path, 'data', 'anatlas_neuron_positions.txt')
    
    positions = {}
    if os.path.exists(positions_file):
        with open(positions_file, 'r') as f:
            lines = f.readlines()
            
            # First line contains neuron IDs (may start with #)
            header = lines[0].strip()
            if header.startswith('#'):
                header = header[1:]
            position_neuron_ids = header.split()
            
            # Subsequent lines contain x, y, z coordinates (tab-separated)
            for i, line in enumerate(lines[1:]):
                line = line.strip()
                if line and i < len(position_neuron_ids):
                    parts = line.split('\t')
                    if len(parts) >= 3:
                        try:
                            positions[position_neuron_ids[i]] = {
                                'x': float(parts[0]),
                                'y': float(parts[1]),
                                'z': float(parts[2])
                            }
                        except ValueError:
                            pass
        print(f"Loaded positions for {len(positions)} neurons")
    else:
        print(f"Warning: Positions file not found at {positions_file}")
    
    # Build nodes list
    nodes = []
    for nid in neuron_ids:
        node = {
            'id': nid,
            'name': nid,
            'type': 'neuron'
        }
        if nid in positions:
            node['position'] = positions[nid]
        nodes.append(node)
    
    # Build edges list from chemical synapses
    # Matrix is [target][source] based on atlas.plot_matrix conventions
    edges = []
    num_neurons = len(neuron_ids)
    
    for target_idx in range(num_neurons):
        for source_idx in range(num_neurons):
            chem_weight = chemical_synapses[target_idx][source_idx]
            elec_weight = electrical_synapses[target_idx][source_idx]
            
            if chem_weight > 0:
                edges.append({
                    'source': neuron_ids[source_idx],
                    'target': neuron_ids[target_idx],
                    'weight': float(chem_weight),
                    'type': 'chemical'
                })
            
            # Electrical synapses (gap junctions) - only add once per pair
            # Since they're bidirectional, only add when source_idx < target_idx
            if elec_weight > 0 and source_idx < target_idx:
                edges.append({
                    'source': neuron_ids[source_idx],
                    'target': neuron_ids[target_idx],
                    'weight': float(elec_weight),
                    'type': 'electrical'
                })
    
    print(f"Created {len(edges)} edges (chemical + electrical)")
    
    # Create output data
    output_data = {
        'nodes': nodes,
        'edges': edges
    }
    
    # Ensure output directory exists
    output_path = 'public/data/connectome.json'
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Save to file
    with open(output_path, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"Saved to {output_path}")
    
    # Print summary
    nodes_with_positions = sum(1 for n in nodes if 'position' in n)
    chemical_edges = sum(1 for e in edges if e['type'] == 'chemical')
    electrical_edges = sum(1 for e in edges if e['type'] == 'electrical')
    
    print(f"\nSummary:")
    print(f"  Neurons: {len(nodes)} ({nodes_with_positions} with positions)")
    print(f"  Chemical synapses: {chemical_edges}")
    print(f"  Electrical synapses (gap junctions): {electrical_edges}")


if __name__ == '__main__':
    export_connectome_data()
