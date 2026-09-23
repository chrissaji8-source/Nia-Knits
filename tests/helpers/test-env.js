/**
 * Test Environment & Vite SSR Helper for Nia Knits
 * Provides isolated mock browser objects (window, localStorage, navigator, document)
 * and loads React JSX components dynamically using Vite ssrLoadModule.
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const PROJECT_ROOT = resolve(__dirname, '../..');

/**
 * In-memory Storage polyfill for window.localStorage
 */
export class MemoryStorage {
  constructor(initialData = {}) {
    this.store = new Map(Object.entries(initialData));
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  key(index) {
    return Array.from(this.store.keys())[index] || null;
  }

  get length() {
    return this.store.size;
  }
}

/**
 * Setup a mock browser environment in global scope
 */
export function setupMockBrowser(initialStorage = {}) {
  const storage = new MemoryStorage(initialStorage);
  let clipboardText = '';
  const listeners = new Map();

  const mockWindow = {
    localStorage: storage,
    addEventListener(event, handler) {
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event).push(handler);
    },
    removeEventListener(event, handler) {
      if (!listeners.has(event)) return;
      listeners.set(event, listeners.get(event).filter(h => h !== handler));
    },
    dispatchEvent(event) {
      const handlers = listeners.get(event.type) || [];
      handlers.forEach(h => h(event));
    },
    open(url, target, features) {
      mockWindow.lastOpenedUrl = url;
      mockWindow.lastOpenedTarget = target;
      mockWindow.lastOpenedFeatures = features;
      return { closed: false };
    },
    scrollTo(options) {
      mockWindow.lastScrollTo = options;
    },
    location: {
      href: 'https://niaknits.netlify.app/',
      hash: '',
    },
    lastOpenedUrl: null,
    lastOpenedTarget: null,
    lastOpenedFeatures: null,
    lastScrollTo: null,
  };

  const mockNavigator = {
    clipboard: {
      writeText: async (text) => {
        clipboardText = text;
        return true;
      },
      readText: async () => clipboardText,
    },
  };

  const mockDocument = {
    createElement(tag) {
      return {
        tag,
        value: '',
        style: {},
        setAttribute() {},
        focus() {},
        select() {},
      };
    },
    body: {
      appendChild() {},
      removeChild() {},
    },
    execCommand(command) {
      if (command === 'copy') return true;
      return false;
    },
    activeElement: null,
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
  };

  try {
    Object.defineProperty(globalThis, 'window', {
      value: mockWindow,
      configurable: true,
      writable: true,
    });
  } catch {
    globalThis.window = mockWindow;
  }

  try {
    Object.defineProperty(globalThis, 'navigator', {
      value: mockNavigator,
      configurable: true,
      writable: true,
    });
  } catch {
    globalThis.navigator = mockNavigator;
  }

  try {
    Object.defineProperty(globalThis, 'document', {
      value: mockDocument,
      configurable: true,
      writable: true,
    });
  } catch {
    globalThis.document = mockDocument;
  }

  return {
    window: mockWindow,
    storage,
    navigator: mockNavigator,
    getClipboardText: () => clipboardText,
    setClipboardText: (txt) => { clipboardText = txt; },
  };
}

let sharedViteServer = null;

/**
 * Obtains or creates a shared Vite server for SSR loading
 */
export async function getViteServer() {
  if (!sharedViteServer) {
    const { createServer } = await import('vite');
    sharedViteServer = await createServer({
      root: PROJECT_ROOT,
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: 'custom',
    });
  }
  return sharedViteServer;
}

/**
 * Closes the shared Vite server
 */
export async function closeViteServer() {
  if (sharedViteServer) {
    await sharedViteServer.close();
    sharedViteServer = null;
  }
}

/**
 * Safely loads a module via Vite SSR
 */
export async function loadModule(relativePath) {
  const fullPath = resolve(PROJECT_ROOT, relativePath);
  if (!existsSync(fullPath)) {
    return null;
  }
  const server = await getViteServer();
  return await server.ssrLoadModule(relativePath);
}

/**
 * Renders a React component to an HTML string
 */
export function renderComponent(Component, props = {}, children = null) {
  return ReactDOMServer.renderToString(
    React.createElement(Component, props, children)
  );
}

/**
 * Checks if a relative file exists
 */
export function fileExists(relativePath) {
  return existsSync(resolve(PROJECT_ROOT, relativePath));
}

/**
 * Reads a JSON file directly
 */
export function readJson(relativePath) {
  const fullPath = resolve(PROJECT_ROOT, relativePath);
  return JSON.parse(readFileSync(fullPath, 'utf8'));
}
