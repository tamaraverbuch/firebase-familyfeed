import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";


const linkElement = document.createElement('link');
linkElement.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
linkElement.rel = "stylesheet";
document.head.appendChild(linkElement);

const titleElement = document.createElement('title');
titleElement.textContent = "Family Feed";
document.head.appendChild(titleElement);

createRoot(document.getElementById("root")!).render(<App />);
