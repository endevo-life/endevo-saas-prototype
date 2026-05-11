'use client';

import { useEffect, useState } from 'react';

export type DemoMode = 'focus' | 'full';

const DEMO_MODE_KEY = 'lr_demo_mode';
const DEMO_MODE_EVENT = 'lr-demo-mode-change';

function isDemoMode(value: string | null): value is DemoMode {
  return value === 'focus' || value === 'full';
}

function readStoredDemoMode(): DemoMode {
  if (typeof window === 'undefined') return 'focus';
  const value = localStorage.getItem(DEMO_MODE_KEY);
  return isDemoMode(value) ? value : 'focus';
}

function applyBodyDemoMode(mode: DemoMode) {
  if (typeof document === 'undefined') return;
  document.body.setAttribute('data-demo-mode', mode);
}

function emitDemoModeChange(mode: DemoMode) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<DemoMode>(DEMO_MODE_EVENT, { detail: mode }));
}

export function useDemoMode() {
  const [mode, setMode] = useState<DemoMode>('focus');

  useEffect(() => {
    const initial = readStoredDemoMode();
    setMode(initial);
    applyBodyDemoMode(initial);

    const onDemoModeChange = (event: Event) => {
      const customEvent = event as CustomEvent<DemoMode>;
      const nextMode = customEvent.detail;
      if (isDemoMode(nextMode)) {
        setMode(nextMode);
        applyBodyDemoMode(nextMode);
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== DEMO_MODE_KEY) return;
      const nextMode = isDemoMode(event.newValue) ? event.newValue : 'focus';
      setMode(nextMode);
      applyBodyDemoMode(nextMode);
    };

    window.addEventListener(DEMO_MODE_EVENT, onDemoModeChange as EventListener);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(DEMO_MODE_EVENT, onDemoModeChange as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const setDemoMode = (nextMode: DemoMode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEMO_MODE_KEY, nextMode);
    }
    setMode(nextMode);
    applyBodyDemoMode(nextMode);
    emitDemoModeChange(nextMode);
  };

  const toggleDemoMode = () => {
    setDemoMode(mode === 'focus' ? 'full' : 'focus');
  };

  return {
    demoMode: mode,
    isDemoFocusMode: mode === 'focus',
    setDemoMode,
    toggleDemoMode,
  };
}
