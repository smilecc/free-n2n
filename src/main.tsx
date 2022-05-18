import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { getStores, StoreContext } from "@/stores";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { TRANS_ZH_CN } from "@/locales";

const stores = getStores();

i18n.use(initReactI18next).init({
  resources: {
    zhCN: TRANS_ZH_CN,
  },
  lng: "zhCN",
  fallbackLng: "zhCN",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StoreContext.Provider value={stores}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StoreContext.Provider>
  </React.StrictMode>
);
