// Shared by lib/hadith/service.ts and lib/hadeethenc/client.ts.

/**
 * A small in-process cache of loaded data (files of the hadith source, HadeethEnc responses). Least recently used
 * entries go first. No expiry by time: the data changes rarely and every deploy starts a new process (and Date.now()
 * is not allowed while Next.js prerenders a page).
 */
export class Memo<T> {
  private entries = new Map<string, Promise<T>>();
  constructor(private readonly max: number) {}

  get(key: string, load: () => Promise<T>): Promise<T> {
    const hit = this.entries.get(key);
    if (hit) {
      this.entries.delete(key);
      this.entries.set(key, hit);
      return hit;
    }
    const value = load();
    // A failed load is not kept: the next request tries again.
    value.catch(() => this.entries.delete(key));
    this.entries.set(key, value);
    if (this.entries.size > this.max) this.entries.delete(this.entries.keys().next().value!);
    return value;
  }
}
