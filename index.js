const express = require("express");
const app = express();
const port = 80;
app.listen(port);
app.set('view engine', 'pug')
app.set('views', './public/views')

app.get("/", (req, res) => {
    res.render("index");
});

const routes = ["events", "employees", "pets", "clients", "supplies", "donors"];
routes.forEach(r => {
    app.get("/" + r, (req, res) => {
        res.render(r);
    })
});
