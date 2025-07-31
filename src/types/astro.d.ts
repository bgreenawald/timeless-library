declare module '*.astro' {
  import type { ComponentInstance } from 'astro';
  const Component: ComponentInstance;
  export default Component;
    } 