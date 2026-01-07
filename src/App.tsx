import { ModeToggle } from "./components/mode-toggle";
import { ThemeProvider } from "./components/theme-provider";
import { Button } from "./components/ui/button";
import { Title } from "./components/app-title";

export default function App() {
  async function handleClick() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id || !tab.url) return;


    if (tab.url.startsWith("chrome://") ||
      tab.url.startsWith("edge://") ||
      tab.url.startsWith("about:") || tab.url.startsWith("chrome-extension://")) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: chrome.i18n.getMessage("extension_name"),
        message: chrome.i18n.getMessage("unsupported_page"),
      });
      return;
    }
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
    chrome.tabs.sendMessage(tab.id, { action: "start-selection" });
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
    </ThemeProvider>
  );
}
