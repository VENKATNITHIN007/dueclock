// global.d.ts
import type { Connection } from 'mongoose';

declare global {
  // store a cached mongoose connection in the global scope (Next.js hot-reload safe)
  var mongoose: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
}


export {};
