import "./content.css";
import { saveScreenshot } from "./lib/save-screenshoot";
import { showToast } from "./lib/show-toast";
import type { CaptureMessage } from "./types";
declare global {
    interface Window {
        __screenshotExtensionContentScriptLoaded?: boolean;
    }
}
if (window.__screenshotExtensionContentScriptLoaded) {
} else {
    window.__screenshotExtensionContentScriptLoaded = true;
    let isSelecting: boolean = false;

    let startX: number = 0;
    let startY: number = 0;
    let currentX: number = 0;
    let currentY: number = 0;

    let overlay: HTMLDivElement | null = null;
    let box: HTMLDivElement | null = null;

    chrome.runtime.onMessage.addListener(async (msg) => {
        if (msg.action === "show-toast") {
            showToast(msg.message, msg.icon);
        }
        if (msg.action === "start-selection") {
            startSelectionMode();
        }
        if (msg.action === "copy-image") {
            await saveScreenshot(msg.base64);
            const response = await fetch(msg.base64);
            const blob = await response.blob();
            const item = new ClipboardItem({
                [blob.type]: blob,
            });
            await navigator.clipboard.write([item]);

        }
    });
    function startSelectionMode(): void {
        if (overlay) return;
        document.body.style.overflow = "hidden"

        overlay = document.createElement("div");
        overlay.id = "screenshot-overlay";

        box = document.createElement("div");
        box.id = "selection";

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        overlay.addEventListener("mousedown", onMouseDown);
        overlay.addEventListener("mousemove", onMouseMove);
        overlay.addEventListener("mouseup", onMouseUp);
        overlay.addEventListener("keydown", onKeyDown);
    }
    function onKeyDown(e: KeyboardEvent) {
        if (!overlay) return;
        overlay.tabIndex = -1;
        overlay.focus();
        if (e.key === "Escape") cleanup();
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
        if (!box || !overlay) return;

        isSelecting = false;
        const rect: DOMRect = box.getBoundingClientRect();

        // 1. Полностью удаляем оверлей из DOM сразу
        cleanup();

        // 2. Даем браузеру время (requestAnimationFrame) перерисовать страницу без оверлея
        requestAnimationFrame(() => {
            // Дополнительная задержка в 50-100мс гарантирует, что "черная тень" исчезла
            setTimeout(() => {
                const message: CaptureMessage = {
                    action: "capture",
                    rect: {
                        x: rect.left,
                        y: rect.top,
                        width: rect.width,
                        height: rect.height,
                        // Передаем devicePixelRatio, так как captureVisibleTab 
                        // делает скриншот в физических пикселях
                        devicePixelRatio: window.devicePixelRatio
                    },
                };
                chrome.runtime.sendMessage(message);
                showToast(chrome.i18n.getMessage("successful_screenshot",), "✓");
            }, 50);
        });
    }

    function cleanup(): void {
        document.body.style.overflow = "";
        overlay?.remove();
        overlay = null;
        box = null;

    }
}
