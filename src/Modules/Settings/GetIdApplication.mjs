import * as Consts from "../Consts.mjs"


export class GetIdDialog extends foundry.applications.api.DialogV2 {
    constructor(options = {}) {
        
        super({
        // Dans l'API V2, le titre se trouve dans l'objet 'window'
        window: {
            title: "Uuid Import Studio du destin",
            icon: "fas fa-gear"
        },
        content: `
            <p>Votre Uuid du module Import Studio du destin est  !</p>
            <div class="form-group">
                <input type="text" value="${game.settings.get(Consts.MODULE_ID, "apiTokenUuid")}">
            </div>
        `,
        buttons: [
            {
            action: "close",
            label: "Ok",
            icon: "fa-solid fa-vread"
            // Si aucun callback n'est fourni, le bouton ferme simplement la fenêtre
            }
        ],
        // Options de positionnement ou de comportement (ex: rendre la fenêtre modale)
        }, options);
    }
}