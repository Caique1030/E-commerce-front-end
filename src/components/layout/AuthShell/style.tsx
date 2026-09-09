'use client';

import styled from 'styled-components';
import { media } from '@/styles/mixins';
import { Container } from '@/styles/primitives';
import { color, shadow } from '@/styles/tokens';

export const Root = styled.div`
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
`;

export const Header = styled.header`
  background-color: ${color.amarelo};
  box-shadow: ${shadow.barra};
`;

export const Bar = styled(Container)`
  display: flex;
  align-items: center;
  height: 3.5rem;
`;

export const Main = styled.main`
  display: flex;
  flex: 1 1 0%;
  align-items: flex-start;
  justify-content: center;
  padding: 1.5rem 1rem 4rem;
  ${media.sm`
    padding-top: 3rem;
  `}
`;

export const Box = styled.div`
  width: 100%;
  max-width: 28rem;
`;
