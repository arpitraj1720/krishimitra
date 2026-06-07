import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider
  clientId="166415397509-khmruk0tur3ttgbsdp34ht7fd2062bl7.apps.googleusercontent.com"
>
  <App />
</GoogleOAuthProvider>
  </StrictMode>
);