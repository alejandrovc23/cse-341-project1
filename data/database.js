const dotenv = require('dotenv');
dotenv.config({ quiet: true });

const MongoClient = require('mongodb').MongoClient;
const ConnectionString = require('mongodb-connection-string-url').default;

let database;
const databaseName = process.env.MONGODB_DATABASE || process.env.DB_NAME || 'project1';

const getMongoUrl = () => {
    const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URL;

    if (!mongoUrl) {
        throw new Error('Missing MONGODB_URL environment variable.');
    }

    try {
        const parsedUrl = new ConnectionString(mongoUrl);

        if (!parsedUrl.pathname || parsedUrl.pathname === '/') {
            parsedUrl.pathname = `/${databaseName}`;
        }

        return parsedUrl.toString();
    } catch {
        return mongoUrl;
    }
};

const initDb = (callback) => {
    if (database) {
        console.log('Db is already initialized!');
        return callback(null, database);
    }

    let mongoUrl;
    try {
        mongoUrl = getMongoUrl();
    } catch (error) {
        return callback(error);
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

            if (err.message && err.message.includes('tlsv1 alert internal error')) {
                return callback(new Error(
                    'MongoDB Atlas rejected the TLS connection. Use the Atlas driver connection string, include the database name, and allow Render in Atlas Network Access. Original error: ' + err.message
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
