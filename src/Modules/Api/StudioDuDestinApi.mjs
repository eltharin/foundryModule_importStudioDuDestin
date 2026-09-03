import * as Consts from "./../Consts.mjs"
import { ApiRequester } from "./ApiRequester.mjs";

export class StudioDuDestinApi {
        static async whoami(me)
        {
            try{
                let data = await ApiRequester.queryAuth(me, {url: Consts.whoami_api});

                if(game.settings.get(Consts.MODULE_ID, 'apiTokenUuid') !== data.uuid) 
                {
                    game.settings.set(Consts.MODULE_ID, 'apiTokenUuid', data.uuid);
                }

                return data;
            }
            catch(e){
                console.error(e);
                throw new Error(game.i18n.localize(Consts.MODULE_ID + ".errorApi.cantConnectToServer"));
            }
        }

    static async disconnect(me)
    {
        try{
            await ApiRequester.queryAuth(me, {url: Consts.disconnect_api});
        }
        catch(e){
            console.error(e);
            throw new Error(game.i18n.localize(Consts.MODULE_ID + ".errorApi.cantDisconnectFromServer"));
        }
    }

    static async getTags(me)
    {
        try{
            return await ApiRequester.query({url: Consts.getTags_api, params: {lang: me.lang}});
        }
        catch(e){
            console.error(e);
            throw new Error(game.i18n.localize(Consts.MODULE_ID + ".errorApi.cantrecuptags"));
        }
    }

    static async getNiveaux(me)
    {
        try{
            return await ApiRequester.query({url: Consts.getNiveaux_api, params: {lang: me.lang}}); 
        }
        catch(e){
            console.error(e);
            throw new Error(game.i18n.localize(Consts.MODULE_ID + ".errorApi.cantrecupniveaux"));
        }
    }

    static async getMaps(me, params)
    {
        try{
            return await ApiRequester.queryAuth(me, {url: Consts.getMaps_api, params: params}); 
        }
        catch(e){
            console.error(e);
            throw new Error(game.i18n.localize(Consts.MODULE_ID + ".errorApi.cantrecupmaps"));
        }
    }

    static async getMapData(me, mapId, variantes)
    {
        try {
            return await ApiRequester.queryAuth(me, {url: Consts.getMap_api + mapId, params: variantes});
        }
        catch(e)
        {
            console.error(e);
            throw new Error(game.i18n.localize(Consts.MODULE_ID + ".errorApi.cantrecupmapdata"));
        }
    }

    static async downloadImage(me, image)
    {
        try {
            return await ApiRequester.queryAuth(me, {url: image, params: {}});
        }
        catch(e)
        {
            console.error(e);
            throw new Error(game.i18n.localize(Consts.MODULE_ID + ".errorApi.cantrecupimage"));
        }
        
    }

            

}