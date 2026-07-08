const dotenv = require('dotenv');
dotenv.config({ quiet: true });

const MongoClient = require('mongodb').MongoClient;

let database;
const databaseName = process.env.MONGODB_DATABASE || process.env.DB_NAME || 'project1';

const initDb = (callback) => {
    if (database) {
        console.log('Db is already initialized!');
        return callback(null, database);
    }
    const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URL;

    if (!mongoUrl) {
        return callback(new Error('Missing MONGODB_URL environment variable.'));
    }

    MongoClient.connect(mongoUrl, {
        serverSelectionTimeoutMS: 10000,
    })
        .then((client) => {
            database = client;
            callback(null, database);
        })
        .catch((err) => {
            if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEOUT') {
                return callback(new Error(
                    `Could not resolve MongoDB Atlas host. Check your internet/DNS connection and Atlas Network Access. Original error: ${err.message}`
                ));
            }

            callback(err);
        });
};

const getDatabase = () => {
    if (!database) {
        throw Error('Database not initialized!');
    }
    return database.db(databaseName);
};

module.exports = {
    initDb,
    getDatabase,
};
