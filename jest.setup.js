// Extend Jest's expect with @testing-library/jest-dom matchers
// (e.g., toBeInTheDocument, toHaveClass, toHaveTextContent, etc.)
import '@testing-library/jest-dom';

// ---------------------------------------------------------------------------
// Global mocks
// ---------------------------------------------------------------------------

// Mock window.matchMedia — not implemented in jsdom but required by many
// UI libraries and responsive hooks.
if (typeof window !== 'undefined') Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),   // deprecated but kept for compatibility
    removeListener: jest.fn(), // deprecated but kept for compatibility
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock the global fetch API so tests don't make real HTTP requests.
// Individual tests can override this with jest.spyOn(global, 'fetch').
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: new Headers(),
  })
);

// Reset the fetch mock between tests to avoid cross-test contamination.
beforeEach(() => {
  fetch.mockClear();
});
