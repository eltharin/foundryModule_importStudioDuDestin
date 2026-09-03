import * as Consts from "../Consts.mjs"
import { GetIdDialog } from "./GetIdApplication.mjs";


export function registerSettings() {
    game.settings.registerMenu(Consts.MODULE_ID, "getIdButton", {
        name: "Get Id",
        label: "Cliquez ici pour avoir votre ID de debug",
        hint: "Ce bouton ouvre la fenêtre de configuration personnalisée.",
        icon: "fas fa-bars",               // Icône FontAwesome du bouton
        type: GetIdDialog, // Classe à appeler (définie ci-dessous)
        restricted: true                  // true = MJ uniquement, false = tous
    });

    game.settings.register(Consts.MODULE_ID, "apiTokenUuid", {
        name: "apiTokenUuid",
        scope: "world",
        config: false,
        type: String,
        default: ""
    });

    game.settings.register(Consts.MODULE_ID, "lang", {
        name: "lang",
        scope: "world",
        config: false,
        type: String,
        default: ""
    });

    game.settings.register(Consts.MODULE_ID, "storageSource", {
        name: "Source de stockage",
        hint: "Choisissez l'emplacement où le module va lire et écrire les fichiers.",
        scope: "world",
        config: true,
        type: String,
        choices: {
            "data": "Données locales (User Data)",
            "core": "Données core (User Data)",
            "public": "Dossier Public",
            "s3": "Amazon S3 (Si configuré)"
        },
        default: "data"
    });

    // 2. Paramètre pour choisir le dossier cible (basePath) avec le FilePicker natif
    game.settings.register(Consts.MODULE_ID, "storageBasePath", {
        name: "Dossier racine du module",
        hint: "Sélectionnez le dossier parent qui contiendra vos créations.",
        scope: "world",
        source: "core",
        config: true,
        type: String,
        default: "assets/maps",
        // Active l'icône de dossier cliquable dans les options du module
        filePicker: "folder",
        onChange: (value, v2, v3) => { // value is the new value of the setting
            console.log(value, v2, v3)
        },
    });
}