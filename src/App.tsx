import { ModeToggle } from "./components/mode-toggle";
import { ThemeProvider } from "./components/theme-provider";
import { Button } from "./components/ui/button";
import { Title } from "./components/app-title";
import { Card, CardContent, CardHeader } from "./components/ui/card";
import { useEffect, useState } from "react";
import type { StoredScreenshot } from "./types";
import { Download, Image } from "lucide-react";
import { ScrollArea } from "./components/ui/scroll-area";
import { getLocalFormattedDate } from "./lib/format-date";

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
    await new Promise<void>((resolve) => {
      const listener = (msg: any, sender: chrome.runtime.MessageSender) => {
        if (msg.action === "content-ready" && sender.tab?.id === tab.id) {
          chrome.runtime.onMessage.removeListener(listener);
          resolve();
        }
      };
    })
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
      <div className="p-4 w-85 flex flex-col gap-4 bg-radial-primary">
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
          <Image className="w-4 h-4 text-primary" />
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
          <ScrollArea className="h-60 pr-4">
            <div className="flex flex-col gap-2">
              {screenshots.map((s) => {
                const formattedDate = getLocalFormattedDate(new Date(s.createdAt))

                return (
                  <Card key={s.id} className="p-0 gap-1" >
                    <CardHeader className="p-1">
                      <div className="text-xs text-center truncate text-primary">
                        {formattedDate}
                      </div>
                    </CardHeader>
                    <CardContent className="p-1 flex items-center justify-around gap-3">
                      <img
                        src={s.dataUrl}
                        className="w-40 h-20 rounded object-cover border border-primary"
                      />


                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => download(s)}
                      >
                        <Download className="w-4 h-4 text-primary" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div></ScrollArea>
        )}
      </div>
    </ThemeProvider>
  );
}
