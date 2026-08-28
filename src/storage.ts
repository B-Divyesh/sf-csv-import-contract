import type { Project } from "./types";

const DB_NAME = "csv-import-contract";
const STORE = "projects";
export type StorageScope = "real" | "demo";

function database(scope: StorageScope = "real"): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // Demo work never opens the normal database. The explicit `demo:` name is
    // intentional: it makes the sandbox independently inspectable and erasable.
    const request = indexedDB.open(scope === "demo" ? `demo:${DB_NAME}` : DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProject(project: Project, scope: StorageScope = "real"): Promise<void> {
  const db = await database(scope);
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).put(project);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function loadProject(id = "current", scope: StorageScope = "real"): Promise<Project | undefined> {
  const db = await database(scope);
  const project = await new Promise<Project | undefined>((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(id);
    request.onsuccess = () => resolve(request.result as Project | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return project;
}

export async function clearProject(id = "current", scope: StorageScope = "real"): Promise<void> {
  const db = await database(scope);
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function listProjects(scope: StorageScope = "real"): Promise<Project[]> {
  const db = await database(scope);
  const projects = await new Promise<Project[]>((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).getAll();
    request.onsuccess = () => resolve((request.result as Project[]).filter((project) => project.id !== "current").sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    request.onerror = () => reject(request.error);
  });
  db.close();
  return projects;
}
