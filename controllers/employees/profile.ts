import Controller from "../controller.js";
import * as tds from "tedious";
import * as express from "express";

export default class Profile extends Controller {
    public async render(config: tds.ConnectionConfig, req: express.Request, res: express.Response) {
        const db: tds.Connection = await new tds.Connection(config);
        let employee: { [key: string]: any } = {};
        const employeeId: string = req.query.employeeId;
        db.on("connect", async (err: Error) => {
            if (!!err) {
                console.log("[ERROR] " + err);
            } else {
                const req: tds.Request = new tds.Request(`
                    SELECT E.PersonID, P.FirstName, P.LastName, Pos.Title, P.Email, P.Phone, E.StartDate, COALESCE(CAST(E.EndDate AS VARCHAR), 'N/A') AS EndDate, Pos.Salary,
                    Pos.Benefits, A.StreetAddr, A.City, A.State, A.ZipCode
                    From Employee E
                    INNER JOIN Person P On E.PersonID = P.PersonID
                    INNER JOIN Position Pos On E.PositionID = Pos.PositionID
                    Inner Join Address A On P.AddrID = A.AddrID
                    WHERE E.PersonID = @employeeId
                    `, (err: Error) => {
                        if (!!err) {
                            console.log("[ERROR]" + err);
                        }
                        res.render("employees/profile", employee);
                        db.close();
                    }
                );
                req.addParameter('employeeId', tds.TYPES.VarChar, employeeId);
                req.on("row", (row) => {
                    let temp: { [key: string]: any } = {};
                    for (const key in row) {
                        if (key === "StartDate" || key === "EndDate") {
                            if(row[key].value !== "N/A") {
                                const arrDate: Date = new Date(row[key].value);
                                temp[key] = arrDate.getMonth() + "/" + arrDate.getDate() + "/" + arrDate.getFullYear();
                            } else {
                                temp[key] = row[key].value;
                            }
                        } else {
                            temp[key] = row[key].value;
                        }
                    }
                    console.log(temp);
                    employee = temp;
                });

                db.execSql(req);
            }
        });
    }
}