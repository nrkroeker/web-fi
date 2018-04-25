"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const fs = require("fs-extra");
const pets_js_1 = require("./controllers/pets.js");
class App {
    async main() {
        await this.initConfig();
        await this.initServer();
    }
    async initConfig() {
        const config = await fs.readFile("./config/db.json", "utf-8");
        this.config = JSON.parse(config);
    }
    async initServer() {
        const app = express();
        const port = 3000;
        app.listen(port);
        app.set('view engine', 'pug');
        app.set('views', './public/views');
        app.use(express.static('public'));
        const routes = ["/employees", "/events", "/index", "/clients", "/donors", "/pets", "/supplies"];
        const controllers = {};
        routes.forEach(async (r) => {
            controllers[r] = new (require("./controllers" + r + ".js").default)();
        });
        // Middleware function to get controller data
        // app.use(async (req, res, next) => {
        //     if (controllers[req.originalUrl]) {
        //         const data: any = await controllers[req.originalUrl].getAll(this.db);
        //         req.data = data;
        //     }
        //     next();
        // });
        app.get("/", (req, res) => {
            res.render("index");
        });
        const petsController = new pets_js_1.default();
        routes.forEach(r => {
            app.get(r, (req, res) => {
                // res.render(r, req.data);
                petsController.getAll(this.config, res);
            });
        });
        console.log("[INFO] Successfully started server on port " + port);
    }
}
const app = new App();
app.main().then(() => { })
    .catch(err => console.error(err));
;
//# sourceMappingURL=index.js.map