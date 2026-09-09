import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

beforeAll(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api/v1';

  // Componentes de layout consultam APIs que o jsdom não implementa.
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
  }
  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  // <dialog> nativo: o jsdom não implementa showModal/close. O polyfill só liga e desliga o
  // atributo `open`; foco preso e retorno do foco são do navegador e ficam para o Playwright.
  if (!window.HTMLDialogElement.prototype.showModal) {
    window.HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
  }
  if (!window.HTMLDialogElement.prototype.close) {
    window.HTMLDialogElement.prototype.close = function (
      this: HTMLDialogElement,
      returnValue?: string,
    ) {
      const estavaAberto = this.hasAttribute('open');
      this.removeAttribute('open');
      if (returnValue !== undefined) this.returnValue = returnValue;
      if (estavaAberto) this.dispatchEvent(new Event('close'));
    };
  }
});

afterEach(() => {
  cleanup();
});
