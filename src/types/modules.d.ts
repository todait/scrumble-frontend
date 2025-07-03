declare module '@remixicon/react' {
  import * as React from 'react';
  export type IconProps = React.SVGProps<SVGSVGElement> & { size?: string | number };
  export const RiSettings6Line: React.ComponentType<IconProps>;
  export const RiArrowDownSFill: React.ComponentType<IconProps>;
  export const RiFlashlightFill: React.ComponentType<IconProps>;
  const IconComponent: React.ComponentType<IconProps>;
  export default IconComponent;
}

declare module 'date-fns' {
  export * from 'date-fns/esm';
}

declare module 'next/navigation';

declare module 'react' {
  import * as ReactNamespace from 'react';
  export = ReactNamespace;
}
