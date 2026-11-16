import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ExportMenu } from './ExportMenu';
import { ThemeProvider } from '../context/ThemeContext';

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

const noop = async () => '<p>rendered</p>';

function renderMenu(props: Partial<Parameters<typeof ExportMenu>[0]> = {}) {
    return render(
        <ThemeProvider>
            <ExportMenu fileName="note.md" getExportHtml={noop} {...props} />
        </ThemeProvider>
    );
}

describe('Export menu (PERF-03)', () => {
    it('opens the format list when there is a rendered document', () => {
        renderMenu();
        fireEvent.click(screen.getByRole('button', { name: 'Export document' }));
        expect(screen.getByRole('menu', { name: 'Export formats' })).toBeTruthy();
        expect(screen.getByRole('menuitem', { name: 'HTML' })).toBeTruthy();
        expect(screen.getByRole('menuitem', { name: 'PDF' })).toBeTruthy();
    });

    it('stays shut and explains why when the note has no rendered document', () => {
        renderMenu({ disabled: true, disabledReason: '先渲染预览，才能导出这篇笔记' });
        const trigger = screen.getByRole('button', { name: 'Export document' }) as HTMLButtonElement;
        expect(trigger.disabled).toBe(true);
        expect(trigger.title).toBe('先渲染预览，才能导出这篇笔记');
        fireEvent.click(trigger);
        expect(screen.queryByRole('menu')).toBeNull();
    });

    it('reports an empty capture instead of exporting nothing', async () => {
        const onError = vi.fn();
        renderMenu({ getExportHtml: async () => '', onError });
        fireEvent.click(screen.getByRole('button', { name: 'Export document' }));
        fireEvent.click(screen.getByRole('menuitem', { name: 'HTML' }));
        await waitFor(() => expect(onError).toHaveBeenCalledWith('Nothing to export yet'));
        expect(screen.queryByRole('menu')).toBeNull();
    });
});
