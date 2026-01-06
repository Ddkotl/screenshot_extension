/// <reference lib="webworker" />

import type { CaptureMessage } from "./types";

console.log("BACKGROUND SCRIPT LOADED");
console.log("SW ENV CHECK", {
  hasImage: typeof (globalThis as any).Image,
  hasWindow: typeof (globalThis as any).window,
  hasDocument: typeof (globalThis as any).document
});
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
  console.log("Captured image base64 length:", imageBase64.length);
  // Обрезаем по координатам
  const croppedBlob: Blob = await cropImage(imageBase64, rect);
  console.log("Cropped image blob size:", croppedBlob.size);
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
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if(!tab.id){
    throw new Error("No active tab found");
  }

  await chrome.tabs.sendMessage(tab.id , {
    action: "copy-image",
    blob: blob
  });
}

