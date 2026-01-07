import { ModeToggle } from "./components/mode-toggle";
import { ThemeProvider } from "./components/theme-provider";
import { Button } from "./components/ui/button";
import { Title } from "./components/app-title";
import { useEffect, useState } from "react";
import type { StoredScreenshot } from "./types";
import { Download } from "lucide-react";

export default function App() {
  const [screenshots, setScreenshots] = useState<StoredScreenshot[]>([]);
  useEffect(() => {
    const loadScreenshots = async () => {
      const { screenshots = [] } = await chrome.storage.local.get("screenshots");
      setScreenshots(screenshots as StoredScreenshot[]);
    };

    loadScreenshots();
  }, []);
  async function handleClick() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id || !tab.url) return;


    if (tab.url.startsWith("chrome://") ||
      tab.url.startsWith("edge://") ||
      tab.url.startsWith("about:") || tab.url.startsWith("chrome-extension://")) {
      alert(chrome.i18n.getMessage("unsupported_page"));
      return;
    }
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
    chrome.tabs.sendMessage(tab.id, { action: "start-selection" });
  }
  function download(s: StoredScreenshot) {
    const a = document.createElement("a");
    a.href = s.dataUrl;
    a.download = `screenshot-${s.createdAt}.png`;
    a.click();
  }
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="p-4 mx-auto text-center flex flex-col gap-4 justify-center min-w-50">
        <div className="flex items-center justify-between gap-2">
          <Title
            text={chrome.i18n.getMessage("extension_name")}
            align="left"
            size="lg"
          />
          <ModeToggle />{" "}
        </div>
        <Button onClick={handleClick}>
          {chrome.i18n.getMessage("make_screenshot")}
        </Button>
      </div>
      {!screenshots.length && (
        <div className="text-sm text-center text-muted-foreground">
          {chrome.i18n.getMessage("no_screenshots")}
        </div>
      )}
      {screenshots.length > 0 && screenshots.map((s) => (
        <div key={s.id} className="flex items-center gap-2">
          <img
            src={s.dataUrl}
            className="w-20 h-12 object-cover rounded"
          />

          <Button
            size="sm"
            onClick={() => download(s)}
          >
            <Download className="mr-2 h-4 w-4" />
          </Button>
        </div>
      ))}
    </ThemeProvider>
  );
}
