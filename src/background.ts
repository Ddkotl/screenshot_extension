/// <reference lib="webworker" />

import type { CaptureMessage } from "./types";

console.log("BACKGROUND SCRIPT LOADED");

chrome.runtime.onMessage.addListener(
  (msg: CaptureMessage): void => {
    console.log(msg);
    if (msg.action === "capture") {
      void handleCapture(msg);
    }
  }
);

async function handleCapture(msg: CaptureMessage): Promise<void> {
  const { rect } = msg;

  // Делает скриншот текущей видимой вкладки (PNG base64)
  const imageBase64: string = await chrome.tabs.captureVisibleTab();

  // Обрезаем по координатам
  const croppedBlob: Blob = await cropImage(imageBase64, rect);

  // Копируем в буфер
  await copyToClipboard(croppedBlob);
}

/**
 * Обрезка base64 PNG по координатам
 */
async function cropImage(
  base64: string,
  rect: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const response = await fetch(base64);
  const blob = await response.blob();
  const bitmap: ImageBitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(Math.round(rect.width), Math.round(rect.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2d context not available");
  }
  ctx.drawImage(
    bitmap, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height
  );
  return canvas.convertToBlob({ type: "image/png" });
}

/**
 * Копирование изображения в буфер обмена
 */
async function copyToClipboard(blob: Blob): Promise<void> {
  const clipboardItem: ClipboardItem = new ClipboardItem({
    "image/png": blob
  });

  await navigator.clipboard.write([clipboardItem]);
}
