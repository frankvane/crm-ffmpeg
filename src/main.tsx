import App from "./App.tsx";
import ReactDOM from "react-dom/client";
// Import StagewiseToolbar for development
import { StagewiseToolbar } from "@stagewise/toolbar-react";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

// Initialize Stagewise Toolbar only in development
if (process.env.NODE_ENV === "development") {
  // Define Stagewise config
  const stagewiseConfig = {
    plugins: [],
  };

  // Create a separate root for the toolbar
  const toolbarRootElement = document.createElement("div");
  document.body.appendChild(toolbarRootElement);
  const toolbarRoot = ReactDOM.createRoot(toolbarRootElement);

  // Render the toolbar
  toolbarRoot.render(<StagewiseToolbar config={stagewiseConfig} />);
}
