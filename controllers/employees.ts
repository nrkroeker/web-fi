import * as tds from "tedious";
import * as express from "express";

export default class Employees {
    public async getAll(config: tds.ConnectionConfig, res: express.Response): Promise<any> {
        const db: tds.Connection = await new tds.Connection(config);
        let employees: { [key: string]: any }[] = [];
        db.on("connect", async (err: Error) => {
            if (!!err) {
                console.log("[ERROR] " + err);
            } else {
                const req: tds.Request = new tds.Request(`
                    SELECT E.PersonID, P.FirstName, P.LastName, P.Email, E.StartDate, Pos.Title AS Position 
                    FROM Employee E
                    INNER JOIN Person P On E.PersonID = P.PersonID
                    INNER JOIN Position Pos On E.PositionID = Pos.PositionID
                    `, (err: Error) => {
                        if (!!err) {
                            console.log("[ERROR]" + err);
                        }
                        res.render("employees", { employees });
                        db.close();
                    }
                );
                req.on("row", (row) => {
                    let temp: { [key: string]: any } = {};
                    for (const key in row) {
                        if (key === "StartDate") {
                            const start = new Date(row[key].value)
                            temp[key] = start.getMonth() + "/" + start.getDate() + "/" + start.getFullYear();
                        } else {
                            temp[key] = row[key].value;
                        }
                    }
                    employees.push(temp);
                });

                db.execSql(req);
            }
        });
    }
}
