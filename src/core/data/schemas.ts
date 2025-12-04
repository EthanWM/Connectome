// JSON schema types for connectome data

export interface ConnectomeNode {
    id: string;
    name: string;
    type?: string;
    position?: {
        x: number;
        y: number;
        z: number;
    };
}

export interface ConnectomeEdge {
    source: string;
    target: string;
    weight: number;
}

export interface ConnectomeData {
    nodes: ConnectomeNode[];
    edges: ConnectomeEdge[];
}
