import * as tds from "tedious";
import * as express from "express";
import Controller from "../controller.js";

export default class Supplies extends Controller {
    public async render(config: tds.ConnectionConfig, req: express.Request, res: express.Response): Promise<void> {
        const db: tds.Connection = await new tds.Connection(config);
        let supplies: { [key: string]: any }[] = [];
        db.on("connect", async (err: Error) => {
            if (!!err) {
                console.log("[ERROR] " + err);
            } else {
                const req: tds.Request = new tds.Request(`
                    SELECT S.SupplyID, S.name, S.CurrentAmt, S.NeededAmt, COALESCE(CAST(S.CostPerUnit AS VARCHAR), 'N/A') AS Cost
                    FROM Supply S
                    `, (err: Error) => {
                        if (!!err) {
                            console.log("[ERROR]" + err);
                        }
                        res.render("supplies/list", { supplies });
                        db.close();
                    }
                );
                req.on("row", (row) => {
                    let temp: { [key: string]: any } = {};
                    for (const key in row) {
                        temp[key] = row[key].value; 
                    }
                    supplies.push(temp);
                });

                db.execSql(req);
            }
        });
    }
}
