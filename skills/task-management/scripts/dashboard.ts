/// <reference types="node" />
import * as fs from "node:fs";
import * as path from "node:path";

export class ObservabilityDashboard {
  private memoryDir: string;

  constructor(rootDir: string) {
    this.memoryDir = path.join(rootDir, ".tmp", "memory");
  }

  public render(): void {
    console.log("=========================================================");
    console.log("   QOREBAN SWARM ORCHESTRATION OBSERVABILITY DASHBOARD   ");
    console.log("=========================================================");

    const snapshotPath = path.join(this.memoryDir, "project-intelligence.json");
    const eventsPath = path.join(this.memoryDir, "events.json");
    const graphPath = path.join(this.memoryDir, "knowledge-graph.json");

    if (fs.existsSync(snapshotPath)) {
      const snap = JSON.parse(fs.readFileSync(snapshotPath, "utf-8"));
      console.log(`\n[Project Snapshot]`);
      console.log(`  Last Scanned:  ${snap.timestamp}`);
      console.log(`  Indexed Files: ${Object.keys(snap.files).length}`);
      console.log(`  Languages:     ${snap.techStack.languages.join(", ")}`);
      console.log(`  Frameworks:    ${snap.techStack.frameworks.join(", ")}`);
      console.log(`  Database:      ${snap.techStack.database || "Unknown"}`);
    } else {
      console.log("\n[Project Snapshot] No index found. Please run 'scan'.");
    }

    if (fs.existsSync(graphPath)) {
      const graph = JSON.parse(fs.readFileSync(graphPath, "utf-8"));
      console.log(`\n[Semantic Knowledge Graph]`);
      console.log(`  Nodes Count:   ${Object.keys(graph.nodes).length}`);
      console.log(`  Edges Count:   ${graph.edges.length}`);
    }

    if (fs.existsSync(eventsPath)) {
      const events = JSON.parse(fs.readFileSync(eventsPath, "utf-8"));
      console.log(`\n[System Events Log]`);
      console.log(`  Total Events:  ${events.length}`);
      console.log(`  Recent Activity:`);
      const recent = events.slice(-5).reverse();
      for (const e of recent) {
        console.log(`    - [${e.timestamp}] ${e.sourceAgent}: ${e.eventType}`);
      }
    } else {
      console.log(`\n[System Events Log] No events logged yet.`);
    }

    console.log("\n=========================================================");
  }
}
