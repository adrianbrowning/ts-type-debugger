import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import { ToastContainer } from "./components/Toast.tsx";
import { ThemeProvider } from "./hooks/useTheme.tsx";
import { ToastProvider } from "./hooks/useToast.tsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <App />
        <ToastContainer />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
