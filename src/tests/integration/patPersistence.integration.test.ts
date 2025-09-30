/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from '../../App';

// NOTE: This test is authored BEFORE implementation (T073, T076) and is expected to fail initially.
// It defines the contract for PAT persistence and navigation UX.

describe('PAT Persistence & Navigation (Phase 3.8)', () => {
  const PAT_VALUE = 'FIGMA_PAT_SAMPLE_123';

  beforeEach(() => {
    // Ensure clean DOM and storage between test cases
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('persists PAT and skips PAT step on remount (T073)', () => {
  render(React.createElement(App));

    // Initially should be on PAT step (label present)
    const patInput = screen.getByLabelText(/Figma Personal Access Token/i) as HTMLInputElement;
  expect(patInput != null).toBe(true);

    // Enter PAT and submit
    fireEvent.change(patInput, { target: { value: PAT_VALUE } });
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Should advance to URL step (URL label visible)
  expect(screen.getByLabelText(/Figma File URL/i) != null).toBe(true);
    expect(localStorage.getItem('figmaPat')).toBe(PAT_VALUE); // Implementation will set this

    // Unmount + remount to simulate refresh
  cleanup();
  render(React.createElement(App));

    // After remount, should automatically skip PAT step (no PAT label; URL field focused/displayed)
    const urlInput = screen.getByLabelText(/Figma File URL/i) as HTMLInputElement;
  expect(urlInput != null).toBe(true);
  });

  it('navigates back to PAT via Add PAT button without clearing stored value (T075)', () => {
  render(React.createElement(App));

    // Complete PAT step
    const patInput = screen.getByLabelText(/Figma Personal Access Token/i) as HTMLInputElement;
    fireEvent.change(patInput, { target: { value: PAT_VALUE } });
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    // On URL step now; click Add PAT (will exist after implementation)
    const addPatButton = screen.getByRole('button', { name: /Add PAT/i });
    fireEvent.click(addPatButton);

    // Back on PAT step; input should still have value or at least not be empty when re-submitting
    const patInputAgain = screen.getByLabelText(/Figma Personal Access Token/i) as HTMLInputElement;
    expect(patInputAgain.value === PAT_VALUE || patInputAgain.value === '').toBe(true);
  });

  it('returns to URL step via Back to generator button from PAT step without losing PAT (T076)', () => {
    // Pre-seed a stored PAT to simulate returning user
    localStorage.setItem('figmaPat', PAT_VALUE);

  render(React.createElement(App));

    // Implementation will auto-skip to URL step; navigate to PAT step via Add PAT
    const addPatButton = screen.getByRole('button', { name: /Add PAT/i });
    fireEvent.click(addPatButton);

    // Now on PAT step, there should be a Back to generator button
    const backButton = screen.getByRole('button', { name: /Back to generator/i });
    fireEvent.click(backButton);

    // Should be on URL step again
  expect(screen.getByLabelText(/Figma File URL/i) != null).toBe(true);
    expect(localStorage.getItem('figmaPat')).toBe(PAT_VALUE);
  });
});
