const express = require('express');

const mongodb = require('./data/database');
const app = express();

const port = process.env.PORT || 3000;

app.set('json spaces', 2);

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


