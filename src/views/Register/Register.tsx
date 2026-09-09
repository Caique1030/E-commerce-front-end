import { Suspense } from 'react';
import { RegisterForm } from '@/components/conta/RegisterForm/RegisterForm';
import { Skeleton } from '@/components/ui/Skeleton';
import * as S from './style';

/** Criar conta. O formulário lê `?voltar=` com useSearchParams, por isso o Suspense. */
export function Register() {
  return (
    <S.Root>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <RegisterForm />
      </Suspense>
    </S.Root>
  );
}
