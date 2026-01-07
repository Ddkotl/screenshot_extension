/// <reference lib="webworker" />

import type { CaptureMessage } from "./types";

chrome.runtime.onMessage.addListener((msg: CaptureMessage): void => {
  if (msg.action === "capture") {
    void handleCapture(msg);
  }
});

async function handleCapture(msg: CaptureMessage): Promise<void> {
  const { rect } = msg;

  // Делает скриншот текущей видимой вкладки (PNG base64)
  const imageBase64: string = await chrome.tabs.captureVisibleTab();
  // Обрезаем по координатам
  const croppedBlob: Blob | undefined = await cropImage(imageBase64, rect);
  // Копируем в буфер
  if (!croppedBlob) return
  await copyToClipboard(croppedBlob);
}

/**
 * Обрезка base64 PNG по координатам
 */
async function cropImage(
  base64: string,
  rect: { x: number; y: number; width: number; height: number, devicePixelRatio?: number },
) {
  const dpr = rect.devicePixelRatio || 1;
  const response = await fetch(base64);
  const blob = await response.blob();
  const bitmap: ImageBitmap = await createImageBitmap(blob);

  if (rect.width <= 0 || rect.height <= 0) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: "show-toast",
        message: chrome.i18n.getMessage("invalid_selection"), 
        icon: "⚠️"
      });
    }

    return;
  }
  // Умножаем координаты на dpr
  const canvas = new OffscreenCanvas(
    Math.round(rect.width * dpr),
    Math.round(rect.height * dpr),
  );

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context not available");

  ctx.drawImage(
    bitmap,
    rect.x * dpr,
    rect.y * dpr,
    rect.width * dpr,
    rect.height * dpr,
    0,
    0,
    rect.width * dpr,
    rect.height * dpr,
  );
  return canvas.convertToBlob({ type: "image/png" });
}

/**
 * Копирование изображения в буфер обмена
 */
async function copyToClipboard(blob: Blob): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onloadend = async () => {
    if (!tab.id) {
      throw new Error("No active tab found");
    }
    const base64data = reader.result;
    await chrome.tabs.sendMessage(tab.id, {
      action: "copy-image",
      base64: base64data,
    });
  };
}
