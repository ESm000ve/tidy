
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

import { ThemeProvider } from "next-themes";
import { AccessibilityProvider } from "./app/components/AccessibilityProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <AccessibilityProvider>
      <App />
    </AccessibilityProvider>
  </ThemeProvider>
);
