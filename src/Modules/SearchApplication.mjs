import * as Consts from "./Consts.mjs"

import { MapImporter } from "./MapImporter.mjs";
import { StudioDuDestinApi } from "./Api/StudioDuDestinApi.mjs";
import { ApiRequester } from "./Api/ApiRequester.mjs";

export class SearchApplication extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

    static PARTS = {
        template: {
            template: "modules/import-studio-du-destin/templates/search/main.hbs",
            templates: [
                "modules/import-studio-du-destin/templates/search/sidebar.hbs",
                "modules/import-studio-du-destin/templates/search/listePack.hbs",
                "modules/import-studio-du-destin/templates/search/listeMap.hbs",
                "modules/import-studio-du-destin/templates/search/detailMap.hbs"
            ]
        }
    };


    constructor(scene, options = {}) {
        super(options);


        this._searchTimeout = null;


        this.tags = {};
        this.selectedTags = {};
        this.searchTerm = '';


        this.niveaux = [];
        this.maps = [];

        this.debug = [];

        this.selectedMap = null;

        this.me = {};

        this.me.uuid = game.settings.get(Consts.MODULE_ID, 'apiTokenUuid') ?? '';
        this.me.lang = game.settings.get(Consts.MODULE_ID, 'lang');

        if (this.me.lang == '') {
            this.me.lang = game.i18n.lang;
        }
        if (this.me.lang != 'en') {
            this.me.lang = 'fr';
        }
    }

    async load() {

        try{
            this.me = await StudioDuDestinApi.whoami(this.me);
            this.tags = (await StudioDuDestinApi.getTags(this.me)).results;
            this.niveaux = (await StudioDuDestinApi.getNiveaux(this.me)).results;

            await this.getMaps();

            await this.changeLang();
        }
        catch(e){
            ui.notifications.error(e.message);
        }
    }


    async getMaps()
    {
        let params = {
            lang: this.me.lang,
            searchTerm: this.searchTerm
        };

        let tags = [];


        if (Object.keys(this.selectedTags).length) {

            Object.keys(this.selectedTags).forEach(t => tags.push(this.tags[t].id))
        }

        if (tags.length > 0) {
            params.tags = tags;
        }

        this.maps = await StudioDuDestinApi.getMaps(this.me,params);
        this.maps = this.maps.results;

        this.render(true);
    }

    static DEFAULT_OPTIONS = {
        tag: 'div',
        id: "search",
        actions: {
            clickTag: this._onClickTag,
            clickPack: this._onClickPack,
            clearPack: this._onClearPack,
            clickMap: this._onClickMap,
            clearMap: this._onClearMap,
            clickDownload: this._onClickDownload,
            clickChangeLang: this._onClickChangeLang,
            supprTag: this._onSupprTag,
            deconnexion: this._onDeconnexion,
        },
        position: {
            width: 1000,
            height: 600,
            left: 10,
            top: 10,
        },
        classes: [Consts.MODULE_ID + "_searchwindow"],
        window: {
            resizable: true,
            controls: [
            ]
        },
    }

    static async _onClickTag(event, target) {

        if (target.dataset.id in this.selectedTags) {
            delete this.selectedTags[target.dataset.id];
            target.classList.remove("selected");
        }
        else {
            this.selectedTags[target.dataset.id] = 1;
            target.classList.add("selected");
        }
        //game.echoMj[target.closest('.echo_mj').dataset.scene].incValue(-1);
        await this.getMaps();
    }

    static async _onSupprTag(event, target) {

        delete this.selectedTags[target.dataset.tagid];
        await this.getMaps();
    }

    static _onClickPack(event, target) {
        this.selectedPack = target.dataset.id;

        if (this.selectedPack.isPack == false) {
            this.selectedMap = 0;
        }
        this.render(true);
    }

    static _onClearPack(event, target) {
        this.selectedPack = null;
        this.render(true);
    }

    static _onClickMap(event, target) {
        this.selectedMap = target.dataset.id;
        this.render(true);
    }

    static _onClearMap(event, target) {
        this.selectedMap = null;
        if (this.selectedPack.isPack == false) {
            this.selectedPack = null;
        }
        this.render(true);
    }

    static async _onDeconnexion(event, target) {
        await StudioDuDestinApi.disconnect(this.me);
        this.me = await StudioDuDestinApi.whoami(this.me);
        this.render(true);
    }

    static async _onClickDownload(event, target) {
        const dialogData = await foundry.applications.api.DialogV2.input({
            title: Consts.MODULE_ID + ".changeVariante",
            content: await foundry.applications.handlebars.renderTemplate("modules/import-studio-du-destin/templates/downloadMap.hbs", { 
                map: this.maps[this.selectedPack].maps.find(m => m.uuid === this.selectedMap),
                taillemap: CONFIG.Scene.documentClass.schema.fields.grid.fields.distance.initial(),
            }),
            classes: ['import-studio-du-destin-downloadvariantedialog']
        });

        if (dialogData == null) { return; }

        MapImporter.importMap(this.me, dialogData.map, dialogData['variante[]'], dialogData.taillemap).catch(e => ui.notifications.error(e.message));
    }

    static async _onClickChangeLang(event, target) {
        this.me.lang = this.me.lang == 'fr' ? 'en' : 'fr';
        game.settings.set(Consts.MODULE_ID, 'lang', this.me.lang);
        await this.changeLang();
        await this.getMaps();
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        context.lang = this.me.lang;
        context.tags = Object.values(this.tags).map(t => { t.selected = (t.id in this.selectedTags); return t; });
        context.selectedTags = Object.values(this.tags).filter(t => t.id in this.selectedTags);
        context.searchTerm = this.searchTerm;

        context.niveaux = this.niveaux;
        context.packs = this.maps;

        context.mode = this.selectedMap != null ? 'detailMap' : (this.selectedPack != null ? 'listeMap' : 'listePack');
        context.hasSidebar = context.mode == 'listePack';

        context.pack = this.selectedPack ? this.maps[this.selectedPack] : null;
        context.map = this.selectedMap ? this.maps[this.selectedPack].maps.find(m => m.uuid === this.selectedMap) : null;

        context.me = this.me;

        context.myurl = window.location.href;

        return context;
    }



    _onRender(context, options) {
        super._onRender(context, options);

        const templatePath = "modules/import-studio-du-destin/templates/search/header.hbs";
        const renderedHtml = foundry.applications.handlebars.renderTemplate(templatePath, context).then(html => {
            divfullheader.innerHTML = html;
            divfullheader.querySelector('.boutontestopen')?.addEventListener('click', (e) => {
                this.siteExterne = window.open(e.target.dataset.url, "Fenêtre externe", "width=500,height=800");
            });
        });

        let divfullheader = this.window.header.querySelector('.fullheader');

        if (divfullheader == null) {
            divfullheader = document.createElement("div");
            divfullheader.classList.add('fullheader');
            this.window.header.appendChild(divfullheader);
        }

        // 2. Ajouter l'événement visuel
        this.element.querySelectorAll('.imgChanger').forEach(e => e.addEventListener("click", (event) => {
            if (event.target.closest('.imgChangeParent').querySelector('.imgChange')) {
                event.target.closest('.imgChangeParent').querySelector('.imgChange').src = event.target.src;
            }
        }));

        this.element.querySelector('#map_search_by_name')?.addEventListener('input', (event) => {
            clearTimeout(this._searchTimeout);
            this.searchTerm = event.target.value;
            this._searchTimeout = setTimeout(() => {
                this.getMaps(true);
            }, 500);
        });

        this.element.querySelector('#map_search_by_name')?.setSelectionRange(this.searchTerm.length, this.searchTerm.length);
                
        window.addEventListener('message', (event) => {
            if(event.data?.statut !== 'success') { return; }

            this.load();

            if (this.siteExterne) this.siteExterne.close();
        });


    }

    async changeLang()
    {
        try {
            const reponse = await fetch(`modules/${Consts.MODULE_ID}/lang/${this.me.lang}.json`);

            if (!reponse.ok) throw new Error(`Fichier introuvable ou erreur HTTP: ${reponse.status}`);
            
            const trads = await reponse.json();
            
            foundry.utils.mergeObject(game.i18n.translations, trads);
        } 
        catch (err) 
        {
            console.error(`Can't load lang file`, err);
        }

    }
}