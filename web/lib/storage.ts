/**
 * Where authored compositions live.
 *
 * IndexedDB rather than localStorage, because a composition is a source file
 * and localStorage's few megabytes are shared with everything else on the
 * origin. Nothing here leaves the browser: no account, no server, no sync.
 * The way work escapes this machine is the export buttons — a .tsx file you
 * can drop into src/, or an .mp4.
 *
 * Every call resolves rather than rejects on a storage failure. A private
 * window with IndexedDB blocked should mean "saving is unavailable", not a
 * page that will not load.
 */

export type SavedComposition = {
  id: string;
  name: string;
  source: string;
  /** The prompt that produced it, so a piece can be re-generated or explained. */
  prompt: string;
  createdAt: number;
  updatedAt: number;
};

const DB_NAME = "motion-project";
const DB_VERSION = 1;
const STORE = "compositions";

let cached: Promise<IDBDatabase | null> | null = null;

const openDatabase = () => {
  if (cached) {
    return cached;
  }
  cached = new Promise<IDBDatabase | null>((resolve) => {
    let request: IDBOpenDBRequest;
    try {
      request = window.indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
  return cached;
};

const withStore = async <T,>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest,
  fallback: T,
): Promise<T> => {
  const db = await openDatabase();
  if (!db) {
    return fallback;
  }
  return new Promise<T>((resolve) => {
    let request: IDBRequest;
    try {
      request = run(db.transaction(STORE, mode).objectStore(STORE));
    } catch {
      resolve(fallback);
      return;
    }
    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () => resolve(fallback);
  });
};

export const isStorageAvailable = async () => (await openDatabase()) !== null;

export const listCompositions = async (): Promise<SavedComposition[]> => {
  const all = await withStore<SavedComposition[]>(
    "readonly",
    (store) => store.getAll(),
    [],
  );
  return [...all].sort((a, b) => b.updatedAt - a.updatedAt);
};

export const saveComposition = async (composition: SavedComposition) => {
  await withStore("readwrite", (store) => store.put(composition), undefined);
};

export const deleteComposition = async (id: string) => {
  await withStore("readwrite", (store) => store.delete(id), undefined);
};

export const newId = () =>
  `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * A filename from a title. Keeps it recognisable in a downloads folder and
 * safe on every filesystem — and never returns an empty string, which would
 * produce a file called ".tsx".
 */
export const slugify = (name: string) => {
  const slug = name
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "composition";
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  // Revoking immediately can cancel the download in some browsers.
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
};
