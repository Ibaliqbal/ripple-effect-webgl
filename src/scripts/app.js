import "../styles/app.css";
import RippleCanvas from "./module/ripple-canvas";
import { preloadImages } from "./utils";

document.addEventListener("DOMContentLoaded", async () => {
  await preloadImages(".item img");

  new RippleCanvas();
});
