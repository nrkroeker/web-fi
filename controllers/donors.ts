import * as tds from "tedious";
import * as express from "express";

export default class Donors {
    public async getAll(config: tds.ConnectionConfig, res: express.Response): Promise<any> {
        const db: tds.Connection = await new tds.Connection(config);
        let donors: { [key: string]: any }[] = [];
        db.on("connect", async (err: Error) => {
            if (!!err) {
                console.log("[ERROR] " + err);
            } else {
                const req: tds.Request = new tds.Request(`
                    SELECT D.PersonID, P.FirstName, P.LastName, D.BusinessName
                    FROM Donor D
                    INNER JOIN Person P On D.PersonID = P.PersonID
                    `, (err: Error) => {
                        if (!!err) {
                            console.log("[ERROR]" + err);
                        }
                        res.render("donors", { donors });
                        db.close();
                    }
                );
                req.on("row", (row) => {
                    let temp: { [key: string]: any } = {};
                    for (const key in row) {
                        temp[key] = row[key].value;
                    }
                    donors.push(temp);
                });

                db.execSql(req);
            }
        });
    }
}
