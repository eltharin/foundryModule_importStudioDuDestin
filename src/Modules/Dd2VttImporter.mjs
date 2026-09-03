



export class Dd2VttImporter 
{

    static convertData(dd2vttData, imgPath, sceneName) 
    {
        const ppg = dd2vttData.resolution.pixels_per_grid || 100;
        const width = Math.round(dd2vttData.resolution.map_size.x * ppg);
        const height = Math.round(dd2vttData.resolution.map_size.y * ppg);

        const walls = [];

        if (dd2vttData.line_of_sight) 
            {
            for (const path of dd2vttData.line_of_sight) 
                {
                for (let i = 0; i < path.length - 1; i++) 
                    {
                    walls.push({
                        c: [Math.round(path[i].x * ppg), Math.round(path[i].y * ppg), Math.round(path[i+1].x * ppg), Math.round(path[i+1].y * ppg)],
                        door: 0, ds: 0, move: 20, sense: 20, sight: 20, light: 20
                    });
                }
            }   
        }

        /*if (dd2vttData.objects_line_of_sight) 
        {
            for (const path of dd2vttData.objects_line_of_sight) 
            {
                for (let i = 0; i < path.length - 1; i++) 
                {
                    walls.push({
                        c: [Math.round(path[i].x * ppg), Math.round(path[i].y * ppg), Math.round(path[i+1].x * ppg), Math.round(path[i+1].y * ppg)],
                        door: 0, ds: 0, move: 20, sense: 0, sight: 0, light: 20 // Bloque mouvement (move 20) mais pas vision (sight 0)
                    });
                }
            }
        }*/

        // 3. Les Portes (Portals)
        if (dd2vttData.portals) 
        {
            for (const portal of dd2vttData.portals) 
            {
                if (portal.bounds && portal.bounds.length >= 2) 
                {
                    walls.push({
                        c: [Math.round(portal.bounds[0].x * ppg), Math.round(portal.bounds[0].y * ppg), Math.round(portal.bounds[1].x * ppg), Math.round(portal.bounds[1].y * ppg)],
                        door: portal.secret == true ? 2 : 1,
                        ds: portal.locked == true ? 2 : (portal.closed ? 0 : 1),
                        move: 20, sense: 20, sight: 20, light: 20
                    });
                }
            }
        }

        const lights = [];
        if (dd2vttData.lights) 
        {
            for (const light of dd2vttData.lights) 
            {
                const range = light.range * ppg;
                lights.push({
                    x: Math.round(light.position.x * ppg),
                    y: Math.round(light.position.y * ppg),
                    config: {
                        dim: range,
                        bright: range / 2,
                        alpha: light.intensity || 0.5,
                        animation: { type: "torch", speed: 2, intensity: 2 }
                    }
                });
            }
        }

        return {
            name: sceneName,
            width: width,
            height: height,
            padding: 0.0,
            grid: {
                size: ppg,
                type: 1, 
            },
            background: { 
                src: imgPath 
            },
            levels: [
                {
                    name: "0",
                    elevation: { 
                        bottom: 0, 
                        top: 10 
                    },
                    background: {
                        src: imgPath
                    }
                }
            ],
            walls: walls,
            lights: lights
        };
    }

}