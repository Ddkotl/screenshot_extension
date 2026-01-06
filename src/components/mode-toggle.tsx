import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  function hanleClick() {
    if (theme === "light" || theme === "system") {
      setTheme("dark");
    }
    if (theme === "dark") {
      setTheme("light");
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={() => hanleClick()}>
      <Sun className="text-fio h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="text-fio absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
