import 'framer-motion';

declare module 'framer-motion' {
  import { ComponentPropsWithoutRef } from 'react';

  export interface HTMLMotionProps<T extends keyof JSX.IntrinsicElements>
    extends ComponentPropsWithoutRef<T> {
    initial?: any;
    animate?: any;
    exit?: any;
    whileHover?: any;
    whileTap?: any;
    whileInView?: any;
    transition?: any;
    variants?: any;
    layout?: boolean | 'position' | 'size';
  }
}

