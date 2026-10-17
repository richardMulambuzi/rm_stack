/// <reference types="node" />
import * as fs from "node:fs";
import * as path from "node:path";

export interface GraphNode {
  id: string;
  name: string;
  type: "module" | "service" | "api" | "component" | "database_table" | "route";
  properties: Record<string, any>;
}

export interface GraphEdge {
  from: string;
  to: string;
  relationship: string;
}

export interface SemanticGraph {
  nodes: Record<string, GraphNode>;
  edges: GraphEdge[];
}

export class SemanticKnowledgeGraph {
  private graphPath: string;

  constructor(rootDir: string) {
    this.graphPath = path.join(rootDir, ".tmp", "memory", "knowledge-graph.json");
  }

  private loadGraph(): SemanticGraph {
    if (fs.existsSync(this.graphPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.graphPath, "utf-8"));
      } catch {
        // Fallback
      }
    }
    return { nodes: {}, edges: [] };
  }

  private saveGraph(graph: SemanticGraph): void {
    const dir = path.dirname(this.graphPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.graphPath, JSON.stringify(graph, null, 2), "utf-8");
  }

  public addNode(node: GraphNode): void {
    const graph = this.loadGraph();
    graph.nodes[node.id] = node;
    this.saveGraph(graph);
  }

  public addEdge(edge: GraphEdge): void {
    const graph = this.loadGraph();
    // Avoid duplicates
    const exists = graph.edges.some(
      (e) => e.from === edge.from && e.to === edge.to && e.relationship === edge.relationship
    );
    if (!exists) {
      graph.edges.push(edge);
    }
    this.saveGraph(graph);
  }

  public queryRelations(nodeId: string): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const graph = this.loadGraph();
    const relatedEdges = graph.edges.filter((e) => e.from === nodeId || e.to === nodeId);
    const relatedNodeIds = new Set<string>([nodeId]);
    for (const edge of relatedEdges) {
      relatedNodeIds.add(edge.from);
      relatedNodeIds.add(edge.to);
    }

    const relatedNodes: GraphNode[] = [];
    for (const id of relatedNodeIds) {
      if (graph.nodes[id]) {
        relatedNodes.push(graph.nodes[id]);
      }
    }

    return { nodes: relatedNodes, edges: relatedEdges };
  }
}
