'use client';

import type { ReactNode } from 'react';
import * as S from './style';

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Título de página do admin com ações à direita. */
export function AdminPageHeader({ title, description, actions, children }: AdminPageHeaderProps) {
  return (
    <S.Root>
      <S.Header>
        <div>
          <S.Title>{title}</S.Title>
          {description && <S.Description>{description}</S.Description>}
        </div>
        {actions && <S.Actions>{actions}</S.Actions>}
      </S.Header>
      {children}
    </S.Root>
  );
}
