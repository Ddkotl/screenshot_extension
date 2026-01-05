/// <reference lib="webworker" />

/**
 * Сообщение от content script
 */
interface CaptureMessage {
  action: "capture";
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

chrome.runtime.onMessage.addListener(
  (msg: CaptureMessage): void => {
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
  return new Promise<Blob>((resolve, reject) => {
    const img: HTMLImageElement = new Image();
    img.src = base64;

    img.onload = () => {
      const canvas: OffscreenCanvas = new OffscreenCanvas(
        Math.round(rect.width),
        Math.round(rect.height)
      );

      const ctx: OffscreenCanvasRenderingContext2D | null =
        canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Cannot get 2D context"));
        return;
      }

      ctx.drawImage(
        img,
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        0,
        0,
        rect.width,
        rect.height
      );

      canvas
        .convertToBlob({ type: "image/png" })
        .then(resolve)
        .catch(reject);
    };

    img.onerror = () => reject(new Error("Failed to load image"));
  });
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
