/// <reference types="node" />
import * as fs from "node:fs";
import * as path from "node:path";

export interface SystemEvent {
  id: string;
  timestamp: string;
  sourceAgent: string;
  eventType: "file_change" | "task_completed" | "architecture_update" | "schema_change" | "security_finding";
  payload: Record<string, any>;
}

export class EventSyncManager {
  private eventsPath: string;

  constructor(rootDir: string) {
    this.eventsPath = path.join(rootDir, ".tmp", "memory", "events.json");
  }

  private loadEvents(): SystemEvent[] {
    if (fs.existsSync(this.eventsPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.eventsPath, "utf-8"));
      } catch {
        // Fallback
      }
    }
    return [];
  }

  public publish(event: Omit<SystemEvent, "id" | "timestamp">): void {
    const events = this.loadEvents();
    const newEvent: SystemEvent = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      ...event,
    };
    events.push(newEvent);

    const dir = path.dirname(this.eventsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.eventsPath, JSON.stringify(events, null, 2), "utf-8");
  }

  public getEvents(sinceTimestamp?: string): SystemEvent[] {
    const events = this.loadEvents();
    if (!sinceTimestamp) return events;
    return events.filter((e) => new Date(e.timestamp) > new Date(sinceTimestamp));
  }
}
