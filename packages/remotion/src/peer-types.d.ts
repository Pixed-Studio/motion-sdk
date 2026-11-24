declare module "react" {
  export type ReactNode = unknown;
  export interface ReactElement<P = Record<string, unknown>> {
    type: string | ((props: P) => ReactElement | null);
    props: P & { children?: ReactNode };
    key: string | null;
  }
  export type FC<P = Record<string, unknown>> = (props: P) => ReactElement | null;
  export type CSSProperties = Record<string, string | number | undefined>;
  export function createElement(
    type: any,
    props?: Record<string, unknown> | null,
    ...children: any[]
  ): ReactElement;
  export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T;
}

declare module "remotion" {
  import type { CSSProperties, FC, ReactNode } from "react";
  export function useCurrentFrame(): number;
  export const AbsoluteFill: FC<{ style?: CSSProperties; children?: ReactNode }>;
}
