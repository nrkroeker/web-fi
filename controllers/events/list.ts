import * as tds from "tedious";
import * as express from "express";
import Controller from "../controller.js";

export default class Events extends Controller {
    public async render(config: tds.ConnectionConfig, req: express.Request, res: express.Response): Promise<void> {
        const db: tds.Connection = await new tds.Connection(config);
        let events: { [key: string]: any }[] = [];
        db.on("connect", async (err: Error) => {
            if (!!err) {
                console.log("[ERROR] " + err);
            } else {
                const req: tds.Request = new tds.Request(`
                    SELECT E.EventID, E.Name, E.Type, E.Location, E.StartTime
                    FROM Event E
                    `, (err: Error) => {
                        if (!!err) {
                            console.log("[ERROR]" + err);
                        }
                        res.render("events/list", { events });
                        db.close();
                    }
                );
                req.on("row", (row) => {
                    let temp: { [key: string]: any } = {};
                    for (const key in row) {
                        temp[key] = row[key].value;
                    }
                    events.push(temp);
                });

                db.execSql(req);
            }
        });
    }
}
