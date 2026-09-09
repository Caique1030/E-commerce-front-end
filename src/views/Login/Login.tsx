import { Suspense } from 'react';
import { LoginForm } from '@/components/conta/LoginForm/LoginForm';
import { Skeleton } from '@/components/ui/Skeleton';
import * as S from './style';

/** Entrar. O formulário lê `?voltar=` com useSearchParams, por isso o Suspense. */
export function Login() {
  return (
    <S.Root>
      <Suspense fallback={<Skeleton className="h-80 w-full" />}>
        <LoginForm />
      </Suspense>
    </S.Root>
  );
}
