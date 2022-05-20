const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const routes = require("./src/routes/index");

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 1000000 }));
app.use(routes);

app.listen(process.env.PORT || 3000, () => {
	console.log(`server is on ${port}`);
});

app.get("/", (req, res) => {
	res.send("Welcome to Lead Management Bot");
});



module.exports = app;
