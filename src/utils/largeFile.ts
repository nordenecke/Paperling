/**
 * Reader size guard (PERF-03).
 *
 * The Reader converts the entire document to DOM in one synchronous pass:
 * measured on a 6 MB note, that is ~56 s of blocked main thread, ~350k DOM
 * nodes and ~460 MB of JS heap. The window stops pumping messages during it,
 * so the title bar's close button does nothing and the process has to be
 * killed. Below the limit the pass is fast enough to stay a normal render;
 * above it the preview explains the cost first and offers the source view.
 *
 * This is deliberately a document-size threshold rather than a time budget:
 * the freeze is linear in bytes, so the number is the same story on every
 * machine (a slower machine is proportionally slower, not less frozen).
 */
export const PREVIEW_SIZE_LIMIT_BYTES = 1024 * 1024;

/** True when a document of `bytes` is big enough for the Reader to freeze. */
export function exceedsPreviewLimit(bytes: number): boolean {
    return Number.isFinite(bytes) && bytes > PREVIEW_SIZE_LIMIT_BYTES;
}

const UNITS = ["B", "KB", "MB", "GB"] as const;

/**
 * "512 B", "976.6 KB", "6.0 MB" — binary units, matching what Explorer and
 * Finder show for the same file. One decimal above bytes: the fraction is
 * what tells 15.1 MB from 15.9 MB, and a file manager shows it too.
 */
export function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < UNITS.length - 1) {
        value /= 1024;
        unit += 1;
    }
    return `${value.toFixed(unit === 0 ? 0 : 1)} ${UNITS[unit]}`;
}
