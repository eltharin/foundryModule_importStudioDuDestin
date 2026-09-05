import { ApiRequester } from "./Api/ApiRequester.mjs";
import { Dd2VttImporter } from "./Dd2VttImporter.mjs";

import * as Consts from "./Consts.mjs"
import { StudioDuDestinApi } from "./Api/StudioDuDestinApi.mjs";


export class MapImporter
{
    static async importMap(me, mapUuid, variantes, taillemap)
    {
        let data = await StudioDuDestinApi.getMapData(me, mapUuid, {"variantes": variantes })
        console.log(data);
        if(data.messages.length > 0)
        {
            data.messages.forEach(m => {
                if(m[0] == "ERROR")
                {
                    ui.notifications.error(game.i18n.format(Consts.MODULE_ID + "." + m[2], m[3]));
                }
                else if(m[0] == "WARN")
                {
                    ui.notifications.warn(game.i18n.format(Consts.MODULE_ID + "." + m[2], m[3]));
                }
                else
                {
                    console.log(m);
                }
                
            });
        }

        if(data.total > 0)
        {
            data.results.forEach(map => this.create_scene_from_map(map, me, taillemap));
        }
    }

    static async create_scene_from_map(map, me, taillemap)
    {
        const sceneName = map.scene.name != '' ? map.scene.name : "Scene Import";

        ui.notifications.info(game.i18n.format(Consts.MODULE_ID + ".createSceneFromMap", {"mapName": sceneName}));

        let sceneFlags = {}
        sceneFlags[Consts.MODULE_ID] = {
            "uuid": foundry.utils.randomID(),
            "mapUuid" : map.scene.id,
            "variantes" : { }
        }

        let targetFolder = Consts.map_assets_folder + map.scene.id + "/" + sceneFlags[Consts.MODULE_ID].uuid + "/";
        let imagesPromises = [];

        if(map.images)
        {
            map.images.forEach(i => {
                imagesPromises.push(this.download_image(me, i, targetFolder));
            
                sceneFlags[Consts.MODULE_ID]["variantes"][i.uuid] = {"name": i.name, "imgName": targetFolder + "/" + i.uuid + ".jpg"};
            });
        }
        
        await Promise.all(imagesPromises);
        
        let sceneData = Dd2VttImporter.convertData(map.content, targetFolder + "/" + map.images[0].uuid + ".jpg", sceneName, taillemap);
        sceneData.flags = sceneFlags;
        sceneData.grid = { distance: taillemap };

        const newScene = await Scene.create(sceneData);

        newScene.createThumbnail().then(thumb => {
            newScene.update({ "thumb": thumb.thumb });
        })
    }

    static async download_image(me, image, targetFolder)
    {

        try {
            const blob = await StudioDuDestinApi.downloadImage(me, image.path);
            
            const filename = image.uuid + ".jpg";
            const file = new File([blob], filename, { type: blob.type });

            await this.createRecursiveDirectory("data", targetFolder);

            const result = await foundry.applications.apps.FilePicker.implementation.upload("data", targetFolder, file);
            
            ui.notifications.info(`Image enregistrée : ${result.path}`);
            return result.path;
        } catch (err) {
            console.error(err);
            ui.notifications.error("Erreur lors de l'upload de l'image.");
        }

        return result;
    }

    static async createRecursiveDirectory(source, targetPath) 
    {
        const parts = targetPath.split("/");
        let currentPath = "";
        for (const part of parts) 
        {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            try {
                await foundry.applications.apps.FilePicker.implementation.createDirectory(source, currentPath);
            } catch (err) {
                // Ignore l'erreur si le dossier existe déjà
            }
        }
    }

}