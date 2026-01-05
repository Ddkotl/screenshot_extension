import { ModeToggle } from "./components/mode-toggle";
import { ThemeProvider } from "./components/theme-provider";
import { Button } from "./components/ui/button";

export default function App() {
    async function handleClick() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log(tab)
        if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: "start-selection" });
        }
    }
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className="p-2 mx-auto text-center flex flex-col justify-center max-w-md">
                <div className="flex items-center justify-center gap-2"><ModeToggle />{chrome.i18n.getMessage("extension_name")} </div>
                <Button onClick={handleClick}>{chrome.i18n.getMessage("make_screenshot")}</Button>
            </div>
        </ThemeProvider>
    );
}