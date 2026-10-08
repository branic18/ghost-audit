/// <reference types="vite/client" />

import 'react';

declare module 'react' {
  interface HTMLAttributes<T> {
    inert?: boolean;
  }
}
