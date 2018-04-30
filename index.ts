import * as express from "express";
import * as tds from "tedious";
import * as fs from "fs-extra";
import Controller from "./controllers/controller.js";

class App {
    private config: tds.ConnectionConfig;
    private routes: string[] = [];
    private controllers: {[key:string]: Controller}[] = [];

    public async main(): Promise<void> {
        await this.initConfig();
        await this.buildRoutes("./public/views");
        await this.initServer();
    }

    public async initConfig(): Promise<void> {
        const config: string = await fs.readFile("./config/db.json", "utf-8");
        this.config = JSON.parse(config);
    }

    public async buildRoutes(dir: string, path?: string) {
        if (path) dir += path;
        let routesMaybe: string[] = await fs.readdirSync(dir);
        routesMaybe.forEach(async r => {
            r = "/" + r;
            if (r.endsWith(".pug")) {
                r = r.slice(0, -4);
                if (path) r = path + r;
                this.routes.push(r);
                fs.stat("./controllers/" + r + ".js", (err) => {
                    if (!!err) {
                        if (err.code !== "ENOENT") console.log(err);
                    } else {
                        this.controllers[r] = new (require("./controllers" + r + ".js").default)();
                    }
                });
            } else {
                await this.buildRoutes("./public/views", r);
            }
        });
    }


    public async initServer(): Promise<void> {
        const app: express.Express = express();
        const port: number = 3000;
        app.listen(port);
        app.set('view engine', 'pug');
        app.set('views', './public/views');
        app.use(express.static('public'));
       
        app.get("/", (req, res) => {
            res.render("index");
        });

        app.get("/index", (req, res) => {
            res.render("index");
        });
        
        this.routes.forEach(r => {
            app.get(r, (req, res) => {
                this.controllers[r].render(this.config, req, res);
            });
        });

        console.log("[INFO] Successfully started server on port " + port);
    }
}

const app = new App();
app.main().then(() => { })
    .catch(err => console.error(err));