const express = require('express');
const mongodb = require('./data/database');
const app = express();

const port = process.env.PORT || 3000;
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Z-Key'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    next();
});

app.use('/', require('./routes'));


mongodb.initDb((err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    else {
        app.listen(port, () => { console.log(`Database is listening and node Running on port ${port}`); });
    }
});


