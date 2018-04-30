"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const fs = require("fs-extra");
class App {
    constructor() {
        this.routes = [];
        this.controllers = [];
    }
    async main() {
        await this.initConfig();
        await this.buildRoutes("./public/views");
        await this.initServer();
    }
    async initConfig() {
        const config = await fs.readFile("./config/db.json", "utf-8");
        this.config = JSON.parse(config);
    }
    async buildRoutes(dir, path) {
        if (path)
            dir += path;
        let routesMaybe = await fs.readdirSync(dir);
        routesMaybe.forEach(async (r) => {
            r = "/" + r;
            if (r.endsWith(".pug")) {
                r = r.slice(0, -4);
                if (path)
                    r = path + r;
                this.routes.push(r);
                fs.stat("./controllers/" + r + ".js", (err) => {
                    if (!!err) {
                        if (err.code !== "ENOENT")
                            console.log(err);
                    }
                    else {
                        this.controllers[r] = new (require("./controllers" + r + ".js").default)();
                    }
                });
            }
            else {
                await this.buildRoutes("./public/views", r);
            }
        });
    }
    async initServer() {
        const app = express();
        const port = 3000;
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
//# sourceMappingURL=index.js.map