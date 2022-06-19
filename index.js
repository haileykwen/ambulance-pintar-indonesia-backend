const express = require('express');
const port = process.env.PORT || 3001;
const cors = require('cors');
require('dotenv').config();
const app = express();

app.use(cors());
app.use((req, res, next) => { // Handle error CORS policy
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Method', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const authRoute = require("./routes/auth.route.js");
const itemRoute = require("./routes/item.route.js");

app.use('/v1/auth', authRoute);
app.use('/v1/item', itemRoute);

app.listen(port, () => {
    console.log(`server running on port ${port}`);
});