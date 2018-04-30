import * as tds from "tedious";
import * as express from "express";
import { Gender } from "../../lib/enums/index.js";
import Controller from "../controller.js";

export default class Pets extends Controller {
    public async render(config: tds.ConnectionConfig, req: express.Request, res: express.Response): Promise<any> {
        const db: tds.Connection = await new tds.Connection(config);
        let pets: { [key: string]: any }[] = [];
        db.on("connect", async (err: Error) => {
            if (!!err) {
                console.log("[ERROR] " + err);
            } else {
                const req: tds.Request = new tds.Request(`
                    SELECT P.PetID AS Id, P.PetName AS Name, A.Species, A.Breed, CAST(P.Sex AS Int) AS Gender, P.AprxBDay AS Birthday, P.Availability
                    FROM Pet P
                    INNER JOIN Animal A ON P.AnimalID = A.AnimalID
                    `, (err: Error) => {
                        if (!!err) {
                            console.log("[ERROR]" + err);
                        }
                        res.render("pets/list", { pets });
                        db.close();
                    }
                );
                req.on("row", (row) => {
                    let temp: { [key: string]: any } = {};
                    for (const key in row) {
                        if (key === "Gender") {
                            temp[key] = Gender[row[key].value];
                        } else if (key === "Birthday") {
                            const birthday = new Date(row[key].value)
                            temp[key] = birthday.getMonth() + "/" + birthday.getDate() + "/" + birthday.getFullYear();
                        } else {
                            temp[key] = row[key].value;
                        }
                    }
                    pets.push(temp);
                });

                db.execSql(req);
            }
        });
    }
}
