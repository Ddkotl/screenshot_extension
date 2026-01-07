export interface ScreenshotRect {
  x: number;
  y: number;
  width: number;
  height: number;
  devicePixelRatio: number; // Обязательно для точности
}

export interface CaptureMessage {
  action: "capture";
  rect: ScreenshotRect;
}

export interface StartSelectionMessage {
  action: "start-selection";
}
export type StoredScreenshot = {
  id: string;
  createdAt: number;
  mime: "image/png";
  dataUrl: string; // base64
};