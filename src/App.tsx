import { Toaster } from "sonner";
import { ModeToggle } from "./components/mode-toggle";
import { ThemeProvider } from "./components/theme-provider";
import { Button } from "./components/ui/button";
import { Title } from "./components/app-title";

export default function App() {
  async function handleClick() {
    console.log("Button clicked");
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    console.log(tab);
    if (tab.id) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });
      chrome.tabs.sendMessage(tab.id, { action: "start-selection" });
    }
  }
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="p-2 mx-auto text-center flex flex-col justify-center min-w-50">
        <div className="flex items-center justify-between gap-2">
          <Title
            text={chrome.i18n.getMessage("extension_name")}
            align="left"
            size="xl"
          />
          <ModeToggle />{" "}
        </div>
        <Button onClick={handleClick}>
          {chrome.i18n.getMessage("make_screenshot")}
        </Button>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
