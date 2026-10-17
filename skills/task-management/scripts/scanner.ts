/// <reference types="node" />
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";

export interface FileMetadata {
  path: string;
  hash: string;
  size: number;
  lastModified: number;
  type: string;
  dependencies: string[];
}

export interface ProjectSnapshot {
  timestamp: string;
  files: Record<string, FileMetadata>;
  techStack: {
    languages: string[];
    frameworks: string[];
    database: string | null;
  };
}

export class RepositoryScanner {
  private rootDir: string;
  private ignorePatterns: string[];

  constructor(rootDir: string, ignorePatterns: string[] = []) {
    this.rootDir = rootDir;
    this.ignorePatterns = ignorePatterns;
  }

  private shouldIgnore(filePath: string): boolean {
    const relative = path.relative(this.rootDir, filePath);
    const parts = relative.split(path.sep);
    const ignoreNames = [
      'node_modules', '.git', 'dist', 'build', '.tmp', 'vendor', 
      '.fallow', 'storage', '.svelte-kit', '.next', '.nuxt', 
      'backup', 'db-backups', 'supabase_db_backups', '.npm-cache',
      '.cache', '__pycache__', '.venv', 'venv'
    ];
    if (parts.some((part) => ignoreNames.includes(part))) {
      return true;
    }
    const ext = path.extname(filePath).toLowerCase();
    const ignoredExtensions = [
      '.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', 
      '.tar', '.gz', '.db', '.sqlite', '.docx', '.xls', '.xlsx', 
      '.sql', '.exe', '.dll', '.so', '.dylib', '.woff', '.woff2', 
      '.ttf', '.eot', '.mp4', '.mp3', '.wav', '.avi', '.mov'
    ];
    if (ignoredExtensions.includes(ext)) {
      return true;
    }
    
    // Skip very large files (> 1MB) to prevent execution blocking
    try {
      const stat = fs.statSync(filePath);
      if (stat.isFile() && stat.size > 1024 * 1024) {
        return true;
      }
    } catch {
      // Ignore errors
    }
    return false;
  }

  private getFileHash(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  private detectDependencies(filePath: string, content: string): string[] {
    const ext = path.extname(filePath);
    const deps: string[] = [];
    if (ext === ".ts" || ext === ".tsx" || ext === ".js" || ext === ".jsx") {
      const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        deps.push(match[1]);
      }
    } else if (ext === ".php") {
      const useRegex = /use\s+([^;]+);/g;
      let match;
      while ((match = useRegex.exec(content)) !== null) {
        deps.push(match[1].trim());
      }
    }
    return deps;
  }

  public scan(incremental: boolean = true): ProjectSnapshot {
    const snapshotPath = path.join(this.rootDir, ".tmp", "memory", "project-intelligence.json");
    let existingSnapshot: ProjectSnapshot | null = null;

    if (incremental && fs.existsSync(snapshotPath)) {
      try {
        existingSnapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf-8"));
      } catch {
        existingSnapshot = null;
      }
    }

    const files: Record<string, FileMetadata> = existingSnapshot?.files || {};
    const languages = new Set<string>();
    const frameworks = new Set<string>();
    let database: string | null = null;

    let count = 0;
    const traverse = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (this.shouldIgnore(fullPath)) continue;

        if (entry.isDirectory()) {
          traverse(fullPath);
        } else if (entry.isFile()) {
          count++;
          const relativePath = path.relative(this.rootDir, fullPath);
          if (count % 500 === 0) {
            process.stderr.write(`  Scanned ${count} files...\n`);
          }
          const stat = fs.statSync(fullPath);
          const lastModified = stat.mtimeMs;

          if (existingSnapshot && existingSnapshot.files[relativePath]) {
            const oldFile = existingSnapshot.files[relativePath];
            if (oldFile.lastModified === lastModified) {
              // Skip reading since it hasn't changed
              continue;
            }
          }

          const ext = path.extname(entry.name);
          if (ext === ".ts" || ext === ".tsx" || ext === ".js" || ext === ".jsx") languages.add("TypeScript/JavaScript");
          if (ext === ".php") languages.add("PHP");
          if (ext === ".go") languages.add("Go");
          if (ext === ".py") languages.add("Python");

          const buffer = fs.readFileSync(fullPath);
          const hash = crypto.createHash("sha256").update(buffer).digest("hex");

          let content = "";
          const textExtensions = ['.ts', '.tsx', '.js', '.jsx', '.php', '.go', '.py', '.json', '.yml', '.yaml', '.md', '.html', '.css', '.sh', '.jsonc'];
          if (textExtensions.includes(ext.toLowerCase())) {
            content = buffer.toString("utf-8");
          }

          if (content) {
            if (content.includes("laravel") || entry.name === "artisan") frameworks.add("Laravel");
            if (content.includes("react") || entry.name.endsWith(".tsx")) frameworks.add("React");
            if (content.includes("next")) frameworks.add("Next.js");

            if (content.includes("postgres") || content.includes("pg")) database = "PostgreSQL";
            else if (content.includes("mysql")) database = "MySQL";
          }

          const dependencies = this.detectDependencies(fullPath, content);

          files[relativePath] = {
            path: relativePath,
            hash,
            size: stat.size,
            lastModified,
            type: ext,
            dependencies,
          };
        }
      }
    };

    traverse(this.rootDir);

    const memoryDir = path.dirname(snapshotPath);
    if (!fs.existsSync(memoryDir)) {
      fs.mkdirSync(memoryDir, { recursive: true });
    }

    const newSnapshot: ProjectSnapshot = {
      timestamp: new Date().toISOString(),
      files,
      techStack: {
        languages: Array.from(languages),
        frameworks: Array.from(frameworks),
        database,
      },
    };

    fs.writeFileSync(snapshotPath, JSON.stringify(newSnapshot, null, 2), "utf-8");
    return newSnapshot;
  }
}
