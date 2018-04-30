import * as tds from "tedious";
import * as express from "express";

export default abstract class Controller {
    public async abstract render(config: tds.ConnectionConfig, req: express.Request, res: express.Response): Promise<any>;
}