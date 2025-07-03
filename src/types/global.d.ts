declare module '*.css';

// Minimal types for @remixicon/react icons
// The actual library provides React components for SVG icons.
// We declare them as generic React components accepting `className` prop.
declare module '@remixicon/react' {
  import * as React from 'react';
  export type IconProps = React.SVGProps<SVGSVGElement> & { className?: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: Record<string, React.ComponentType<IconProps>> & any;
  export = content;
}
