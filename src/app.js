const express = require('express');

const app = express();

app.use("/hello", (req, res) => {
    console.log(`${req.method} ${req.url}`);
    res.send("Hello hello hello....");
});

app.use("/test", (req, res) => {
    console.log(`${req.method} ${req.url}`);
    res.send("Hello from server");
});

app.use("/", (req, res) => {
    res.send("Namasthe World!!");
});

app.listen(3000, () => {
    console.log('http server listening on port 3000');
});
