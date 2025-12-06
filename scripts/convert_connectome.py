import json
import os

def convert_connectome():
    # Paths
    input_path = 'connectome_data.json'
    output_path = 'public/data/connectome.json'

    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found. Please run the notebook or provide the data file.")
        return

    # Load raw data
    with open(input_path, 'r') as f:
        data = json.load(f)

    neuron_ids = data['neuron_ids']
    # Based on notebook analysis: matrix[target][source]
    # labelx="upstream" (source/col), labely="downstream" (target/row)
    chemical_matrix = data['chemical_connectome']
    
    # Create Nodes
    # Try to load neuron positions if available
    positions = {}
    try:
        import wormneuroatlas as wa
        wormneuroatlas_path = os.path.dirname(wa.__file__)
        positions_file = os.path.join(wormneuroatlas_path, 'data', 'anatlas_neuron_positions.txt')
        if os.path.exists(positions_file):
            with open(positions_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        parts = line.split()
                        if len(parts) >= 4:
                            neuron_id = parts[0]
                            try:
                                positions[neuron_id] = {
                                    "x": float(parts[1]),
                                    "y": float(parts[2]),
                                    "z": float(parts[3])
                                }
                            except ValueError:
                                pass
    except ImportError:
        pass
    
    nodes = []
    for nid in neuron_ids:
        node = {
            "id": nid,
            "name": nid,
            "type": "neuron"
        }
        # Add position if available
        if nid in positions:
            node["position"] = positions[nid]
        nodes.append(node)

    # Create Edges
    edges = []
    num_neurons = len(neuron_ids)
    
    for target_idx in range(num_neurons):
        for source_idx in range(num_neurons):
            # matrix[row][col] -> matrix[target][source]
            weight = chemical_matrix[target_idx][source_idx]
            if weight > 0:
                edges.append({
                    "source": neuron_ids[source_idx],
                    "target": neuron_ids[target_idx],
                    "weight": weight
                })

    # Construct final object
    output_data = {
        "nodes": nodes,
        "edges": edges
    }

    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Save
    with open(output_path, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"Converted {len(nodes)} nodes and {len(edges)} edges.")
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    convert_connectome()
