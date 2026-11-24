import "./style.css";

const app = document.querySelector<HTMLElement>("#app");

if (!app) {
  throw new Error("Application root element #app was not found.");
}

app.dataset.ready = "true";
