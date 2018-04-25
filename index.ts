import * as express from "express";
import * as bodyParser from "bodyParser";
import * as tds from "tedious";
import * as fs from "fs-extra";
import Pets from "./controllers/pets.js";

class App {
    private config: tds.ConnectionConfig;

    public async main(): Promise<void> {
        await this.initConfig();
        await this.initServer();
    }

    public async initConfig(): Promise<void> {
        const config: string = await fs.readFile("./config/db.json", "utf-8");
        this.config = JSON.parse(config);
    }

    
    public async initServer(): Promise<void> {
        const app: express.Express = express();
        const port: number = 3000;
        app.listen(port);
        app.set('view engine', 'pug');
        app.set('views', './public/views');
        app.use(express.static('public'));
        
        
        const routes: string[] = ["/employees", "/events", "/index", "/clients", "/donors", "/pets", "/supplies"];
        const controllers: {[key: string]: any} = {};
        routes.forEach(async r => {
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
        
        const petsController = new Pets();
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
});