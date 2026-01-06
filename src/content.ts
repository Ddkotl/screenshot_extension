import "./content.css";
import type { CaptureMessage, StartSelectionMessage } from "./types";
declare global {
    interface Window {
        __screenshotExtensionContentScriptLoaded?: boolean;
    }
}
if (window.__screenshotExtensionContentScriptLoaded) {
    console.log("Content script already loaded, skipping initialization.");
} else {
    window.__screenshotExtensionContentScriptLoaded = true;
    console.log("CONTENT SCRIPT LOADED");
    let isSelecting: boolean = false;

    let startX: number = 0;
    let startY: number = 0;
    let currentX: number = 0;
    let currentY: number = 0;

    let overlay: HTMLDivElement | null = null;
    let box: HTMLDivElement | null = null;


    chrome.runtime.onMessage.addListener(
        (msg: StartSelectionMessage, _sender, _sendResponse) => {
            if (msg.action === "start-selection") {
                startSelectionMode();
            }
        }
    );
    chrome.runtime.onMessage.addListener(
        async (msg) => {
            if (msg.action === "copy-image") {
                const blob: Blob = msg.blob
                const item = new ClipboardItem({
                    "image/png": blob
                })
                await navigator.clipboard.write([item])
            }
        }
    )
    function startSelectionMode(): void {
        if (overlay) return;

        overlay = document.createElement("div");
        overlay.id = "screenshot-overlay";

        box = document.createElement("div");
        box.id = "selection";

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        overlay.addEventListener("mousedown", onMouseDown);
        overlay.addEventListener("mousemove", onMouseMove);
        overlay.addEventListener("mouseup", onMouseUp);
    }

    function onMouseDown(event: MouseEvent): void {
        isSelecting = true;
        startX = event.clientX;
        startY = event.clientY;
    }

    function onMouseMove(event: MouseEvent): void {
        if (!isSelecting || !box) return;

        currentX = event.clientX;
        currentY = event.clientY;

        const x: number = Math.min(startX, currentX);
        const y: number = Math.min(startY, currentY);
        const width: number = Math.abs(startX - currentX);
        const height: number = Math.abs(startY - currentY);

        box.style.left = `${x}px`;
        box.style.top = `${y}px`;
        box.style.width = `${width}px`;
        box.style.height = `${height}px`;
    }

    function onMouseUp(): void {
        if (!box) return;

        isSelecting = false;

        const rect: DOMRect = box.getBoundingClientRect();

        const message: CaptureMessage = {
            action: "capture",
            rect: {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height
            }
        };

        chrome.runtime.sendMessage(message);

        cleanup();
    }

    function cleanup(): void {
        if (overlay) {
            overlay.remove();
        }

        overlay = null;
        box = null;
    }

}
