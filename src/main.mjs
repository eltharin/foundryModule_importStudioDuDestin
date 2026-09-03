
import { SearchApplication } from "./Modules/SearchApplication.mjs";
import * as Settings from "./Modules/Settings/Settings.mjs";
import * as Consts from "./Modules/Consts.mjs"


Hooks.on("init", () => {

    Settings.registerSettings();
    
    Hooks.on("renderSceneDirectory", async (_app, html) => {
        html = html instanceof HTMLElement ? html : html[0];

        const importBtn = document.createElement("button");
        importBtn.type = "button";
        importBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 100 100"><use href="modules/import-studio-du-destin/assets/Icone-Studio-DeStin.svg#icon"/></svg>${game.i18n.localize(Consts.MODULE_ID + ".importBtn")}`;
        importBtn.classList.add("import-studio-du-destin_buttonsearch");
        importBtn.addEventListener("click", () => {
            let app = new SearchApplication(canvas.scene);
            app.load();
        });

        let headerActions = html.querySelector(".header-actions");
        headerActions.append(importBtn);
    });
});
  

