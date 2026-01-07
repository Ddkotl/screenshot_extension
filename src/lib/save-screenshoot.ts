import type { StoredScreenshot } from "@/types";

export async function saveScreenshot(dataUrl: string) {
    const { screenshots = [] } = await chrome.storage.local.get("screenshots");

    const newScreenshot: StoredScreenshot = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        mime: "image/png",
        dataUrl,
    };

    const updated: StoredScreenshot[] = [
        newScreenshot,
        ...(screenshots as StoredScreenshot[]),
    ].slice(0, 5);

    await chrome.storage.local.set({ screenshots: updated });
}
