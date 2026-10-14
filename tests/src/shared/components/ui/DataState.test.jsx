import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DataState } from '@/shared/components/ui/DataState.jsx';

describe('DataState', () => {
  it('affiche le spinner quand loading', () => {
    const html = renderToStaticMarkup(<DataState loading error={null}>x</DataState>);
    expect(html).toContain('animate');
    expect(html).not.toContain('>x<');
  });

  it('affiche l erreur quand error', () => {
    const html = renderToStaticMarkup(
      <DataState loading={false} error={new Error('boom')}>x</DataState>,
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain('boom');
  });

  it('rend les enfants quand ok', () => {
    const html = renderToStaticMarkup(<DataState loading={false} error={null}>ok-content</DataState>);
    expect(html).toContain('ok-content');
  });
});
