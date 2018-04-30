import * as tds from "tedious";
import * as express from "express";
import { ClientStatus } from "../../lib/enums/ClientStatus.js";
import Controller from "../controller.js";

export default class Clients extends Controller {
    public async render(config: tds.ConnectionConfig, req: express.Request, res: express.Response): Promise<any> {
        const db: tds.Connection = await new tds.Connection(config);
        let clients: { [key: string]: any }[] = [];
        db.on("connect", async (err: Error) => {
            if (!!err) {
                console.log("[ERROR] " + err);
            } else {
                const req: tds.Request = new tds.Request(`
                    SELECT Par.PersonID, P.FirstName, P.LastName, P.Phone,
                    P.Email, CAST(Par.BackgroundCheck AS Int) AS BackgroundCheck, CAST(Par.Application AS Int) AS Application
                    FROM Parent Par
                    INNER JOIN Person P On Par.PersonID = P.PersonID
                    `, (err: Error) => {
                        if (!!err) {
                            console.log("[ERROR]" + err);
                        }
                        res.render("clients/list", { clients });
                        db.close();
                    }
                );
                req.on("row", (row) => {
                    let temp: { [key: string]: any } = {};
                    for (const key in row) {
                        if (key === "BackgroundCheck" || key === "Application") {
                            temp[key] = ClientStatus[row[key].value];
                        } else {
                            temp[key] = row[key].value;
                        }
                    }
                    clients.push(temp);
                });

                db.execSql(req);
            }
        });
    }
}
