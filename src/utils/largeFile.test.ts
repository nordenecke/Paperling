import { describe, it, expect } from "vitest";
import { PREVIEW_SIZE_LIMIT_BYTES, exceedsPreviewLimit, formatBytes } from "./largeFile";

describe("exceedsPreviewLimit (PERF-03)", () => {
    it("passes documents up to and including the limit", () => {
        expect(exceedsPreviewLimit(0)).toBe(false);
        expect(exceedsPreviewLimit(40_000)).toBe(false);
        expect(exceedsPreviewLimit(PREVIEW_SIZE_LIMIT_BYTES)).toBe(false);
    });

    it("flags documents one byte past the limit", () => {
        expect(exceedsPreviewLimit(PREVIEW_SIZE_LIMIT_BYTES + 1)).toBe(true);
        expect(exceedsPreviewLimit(6 * 1024 * 1024)).toBe(true);
    });

    it("treats missing or nonsense sizes as small (never blocks the preview)", () => {
        expect(exceedsPreviewLimit(Number.NaN)).toBe(false);
        expect(exceedsPreviewLimit(Number.POSITIVE_INFINITY)).toBe(false);
        expect(exceedsPreviewLimit(-1)).toBe(false);
    });
});

describe("formatBytes (PERF-03)", () => {
    it("uses the same binary units as a file manager", () => {
        expect(formatBytes(0)).toBe("0 B");
        expect(formatBytes(512)).toBe("512 B");
        expect(formatBytes(1024)).toBe("1.0 KB");
        expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
        expect(formatBytes(15_896_576)).toBe("15.2 MB");
        expect(formatBytes(6 * 1024 * 1024)).toBe("6.0 MB");
    });

    it("keeps a decimal for fractional units so sizes stay distinguishable", () => {
        expect(formatBytes(1_468_006)).toBe("1.4 MB");
        expect(formatBytes(62_914_560)).toBe("60.0 MB");
        expect(formatBytes(999)).toBe("999 B");
    });

    it("falls back to 0 B for invalid sizes", () => {
        expect(formatBytes(Number.NaN)).toBe("0 B");
        expect(formatBytes(-5)).toBe("0 B");
    });
});
