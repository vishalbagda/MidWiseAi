declare module 'ui-neumorphism' {
  import { ComponentType, HTMLAttributes } from 'react';

  export interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
    dark?: boolean;
    disabled?: boolean;
    active?: boolean;
    bordered?: boolean;
    rounded?: boolean;
    circle?: boolean;
    block?: boolean;
    color?: string;
    text?: boolean;
    flat?: boolean;
    depressed?: boolean;
    inset?: boolean;
    size?: 'small' | 'medium' | 'large';
  }

  export const Button: ComponentType<ButtonProps>;
  export const Card: ComponentType<any>;
  export const CardContent: ComponentType<any>;
  export const CardHeader: ComponentType<any>;
  export const Typography: ComponentType<any>;
}
