import { ModeToggle } from "./components/mode-toggle";
import { ThemeProvider } from "./components/theme-provider";
import { Button } from "./components/ui/button";
import { Title } from "./components/app-title";
import { Card, CardContent } from "./components/ui/card";
import { useEffect, useState } from "react";
import type { StoredScreenshot } from "./types";
import { Download, Image } from "lucide-react";

export default function App() {
  const [screenshots, setScreenshots] = useState<StoredScreenshot[]>([]);

  useEffect(() => {
    const loadScreenshots = async () => {
      const { screenshots = [] } =
        await chrome.storage.local.get("screenshots");
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

    if (
      tab.url.startsWith("chrome://") ||
      tab.url.startsWith("edge://") ||
      tab.url.startsWith("about:") ||
      tab.url.startsWith("chrome-extension://")
    ) {
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
      <div className="p-4 w-85 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Title
            text={chrome.i18n.getMessage("extension_name")}
            align="left"
            size="lg"
          />
          <ModeToggle />
        </div>

        {/* Main action */}
        <Button onClick={handleClick} className="w-full">
          {chrome.i18n.getMessage("make_screenshot")}
        </Button>

        {/* Section title */}
        <div className="flex items-center gap-2 text-sm font-medium">
          <Image className="w-4 h-4" />
          {chrome.i18n.getMessage("last_screenshots")}
        </div>

        {/* Empty state */}
        {!screenshots.length && (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              {chrome.i18n.getMessage("no_screenshots")}
            </CardContent>
          </Card>
        )}

        {/* List */}
        {screenshots.length > 0 && (
          <div className="flex flex-col gap-2">
            {screenshots.map((s) => {
              const formattedDate = new Date(
                s.createdAt,
              ).toLocaleString();

              return (
                <Card key={s.id} className="hover:bg-muted/50 transition">
                  <CardContent className="p-3 flex items-center gap-3">
                    <img
                      src={s.dataUrl}
                      className="w-20 h-12 rounded object-cover border"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground truncate">
                        {formattedDate}
                      </div>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => download(s)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
