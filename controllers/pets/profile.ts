import Controller from "../controller.js";
import * as tds from "tedious";
import * as express from "express";
import { Gender } from "../../lib/enums/index.js";

export default class Profile extends Controller {
    public async render(config: tds.ConnectionConfig, req: express.Request, res: express.Response) {
        const db: tds.Connection = await new tds.Connection(config);
        let pet: {[key: string]: any} = {};
        const petId: string = req.query.petId;
        db.on("connect", async (err: Error) => {
            if (!!err) {
                console.log("[ERROR] " + err);
            } else {
                const req: tds.Request = new tds.Request(`
                    SELECT P.PetID, P.PetName, P.ArrivalDate, A.Breed, A.Species,
                    A.Coloring, CAST(P.Sex AS INT) AS Sex, P.Weight, P.AprxBDay AS Birthday, P.SpecialNeeds,
                    P.SpayNeuter, P.Availability, P.Description
                    FROM Pet P
                    INNER JOIN Animal A On P.AnimalID = A.AnimalID
                    WHERE P.PetID = @petId
                    `, (err: Error) => {
                        if (!!err) {
                            console.log("[ERROR]" + err);
                        }
                        res.render("pets/profile", pet);
                        db.close();
                    }
                );
                req.addParameter('petId', tds.TYPES.VarChar, petId);
                req.on("row", (row) => {
                    let temp: { [key: string]: any } = {};
                    for (const key in row) {
                        if (key === "ArrivalDate") {
                            const arrDate: Date = new Date(row[key].value);
                            temp[key] = arrDate.getMonth() + "/" + arrDate.getDate() + "/" + arrDate.getFullYear();
                        } else if (key === "Sex") {
                            temp[key] = Gender[row[key].value];
                        } else if (key === "Birthday") {
                            const arrDate: Date = new Date(row[key].value);
                            temp[key] = arrDate.getMonth() + "/" + arrDate.getDate() + "/" + arrDate.getFullYear();
                        } else {
                            temp[key] = row[key].value;
                        }
                    }
                    pet = temp;
                });

                db.execSql(req);
            }
        });
    }
}