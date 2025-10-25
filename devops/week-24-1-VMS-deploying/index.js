const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Hello week - 24.1");
})

app.listen(3000);