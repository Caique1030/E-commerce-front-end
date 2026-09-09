import type { ComponentPropsWithoutRef, ElementType } from 'react';

/**
 * Props de um componente polimórfico: as próprias, mais as do elemento escolhido em `as`
 * (ex.: `href` quando `as={Link}`), sem colisão entre as duas listas.
 */
export type PolymorphicProps<E extends ElementType, OwnProps> = OwnProps & { as?: E } & Omit<
    ComponentPropsWithoutRef<E>,
    keyof OwnProps | 'as'
  >;
