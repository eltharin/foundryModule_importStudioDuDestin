


export class ApiRequester
{
    static async query({url = "", params = {}, method = "GET", headers = {}} = {})
    {
        const urlObj = new URL(url);
        let myparams = new URLSearchParams(params);

        urlObj.search = myparams;

        let reponse = await fetch( urlObj, { method: method, headers: headers } );
        
        if(reponse.ok != true)
        {
            console.error(reponse.status + " - " +await reponse.text());
            return;     
        }

        if(reponse.headers.get("content-type")?.includes("application/json"))
        {
            let data = await reponse.json();
            return data;
        }

        return reponse.blob();
    }

    static async queryAuth(me, {url = "", params = {}, method = "GET", headers = {}} = {})
    {
        headers["Authorization"] = `ApiToken ${me.uuid}-${me.sessionId}`;
        headers["Lang"] = me.lang;

        return await this.query({url, params, method, headers});
    }
}