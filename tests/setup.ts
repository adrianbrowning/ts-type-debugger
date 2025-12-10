import { beforeEach, afterEach } from 'vitest';

// Track pending RAF callbacks for cleanup
const pendingRafs = new Set<number>();
const originalRAF = typeof window !== 'undefined' ? window.requestAnimationFrame : undefined;
const originalCAF = typeof window !== 'undefined' ? window.cancelAnimationFrame : undefined;

beforeEach(() => {
  pendingRafs.clear();

  // Only mock in browser environment
  if (typeof window !== 'undefined' && originalRAF) {
    // Wrap RAF to track pending callbacks
    window.requestAnimationFrame = (cb: FrameRequestCallback): number => {
      const id = originalRAF.call(window, (timestamp) => {
        pendingRafs.delete(id);
        cb(timestamp);
      });
      pendingRafs.add(id);
      return id;
    };

    window.cancelAnimationFrame = (id: number) => {
      pendingRafs.delete(id);
      originalCAF?.call(window, id);
    };
  }
});

afterEach(() => {
  // Cancel all pending RAF callbacks to prevent hangs
  if (typeof window !== 'undefined' && originalCAF) {
    pendingRafs.forEach(id => {
      originalCAF.call(window, id);
    });
    pendingRafs.clear();

    // Restore original functions
    if (originalRAF) window.requestAnimationFrame = originalRAF;
    if (originalCAF) window.cancelAnimationFrame = originalCAF;
  }
});
