export interface CaptureMessage {
  action: "capture";
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface StartSelectionMessage {
  action: "start-selection";
}
