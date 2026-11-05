import type { InitialContentSnapshot } from "./content-types";
import {
  ContentConflictError,
  validateReferences,
  type ContentTransactionRepository,
  type RequireAdmin,
} from "./content-service";
import { validateManagedPage, validateManagedPost, validateManagedProject } from "./validation";
import { validateSiteSettings } from "./site-settings";

export interface VersionedSnapshot {
  revision: string;
  content: InitialContentSnapshot;
}
/** The provider must implement both writes as atomic database operations. */
export interface VersionedSnapshotStore {
  load(): Promise<VersionedSnapshot | null>;
  insertIfAbsent(content: InitialContentSnapshot): Promise<boolean>;
  compareAndSwap(
    expectedRevision: string,
    content: InitialContentSnapshot,
  ): Promise<boolean>;
}
export class ContentNotInitializedError extends Error {
  constructor() {
    super("CMS content has not been initialized.");
    this.name = "ContentNotInitializedError";
  }
}
function unique(values: string[], label: string) {
  if (new Set(values).size !== values.length)
    throw new Error(`Duplicate ${label} identifiers.`);
}
/** Validate the migration before passing any content to a real database. */
export function validateInitialSnapshot(
  input: InitialContentSnapshot,
): InitialContentSnapshot {
  if (
    !input ||
    typeof input !== "object" ||
    !Array.isArray(input.posts) ||
    !Array.isArray(input.projects)
  )
    throw new Error("Invalid initial content snapshot.");
  if (input.settings !== undefined) validateSiteSettings(input.settings);
  input.posts.forEach(validateManagedPost);
  input.projects.forEach(validateManagedProject);
  const pages = input.pages ?? [];
  if (!Array.isArray(pages)) throw new Error("Invalid custom pages.");
  pages.forEach(validateManagedPage);
  unique(
    input.posts.map((item) => item.slug),
    "post",
  );
  unique(
    input.projects.map((item) => item.slug),
    "project",
  );
  unique(pages.map((item) => item.slug), "page");
  validateReferences(input);
  return { ...input, pages };
}
/** Uses optimistic concurrency to make a full content mutation atomic without lost updates. */
export class VersionedContentRepository
  implements ContentTransactionRepository
{
  constructor(
    private readonly store: VersionedSnapshotStore,
    private readonly attempts = 5,
  ) {
    if (!Number.isInteger(attempts) || attempts < 1 || attempts > 10)
      throw new Error("Invalid transaction retry limit.");
  }
  async read(): Promise<InitialContentSnapshot> {
    const value = await this.store.load();
    if (!value) throw new ContentNotInitializedError();
    return structuredClone(value.content);
  }
  async initialize(
    input: InitialContentSnapshot,
    requireAdmin: RequireAdmin,
  ): Promise<boolean> {
    await requireAdmin();
    return this.store.insertIfAbsent(
      structuredClone(validateInitialSnapshot(input)),
    );
  }
  async transact<T>(
    operation: (snapshot: InitialContentSnapshot) => {
      snapshot: InitialContentSnapshot;
      result: T;
    },
  ): Promise<T> {
    for (let attempt = 0; attempt < this.attempts; attempt++) {
      const current = await this.store.load();
      if (!current) throw new ContentNotInitializedError();
      if (!current.revision)
        throw new Error("Storage returned an invalid revision.");
      const { snapshot, result } = operation(structuredClone(current.content));
      if (
        await this.store.compareAndSwap(
          current.revision,
          structuredClone(snapshot),
        )
      )
        return result;
    }
    throw new ContentConflictError(
      "Content changed while saving. Reload and try again.",
    );
  }
}
