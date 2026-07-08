const mongodb = require('../data/database');
const objectId = require('mongodb').ObjectId;
const collectionName = 'users';

const getAll = async (req, res) => {
    try {
        const result = await mongodb.getDatabase().collection(collectionName).find();
        const users = await result.toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
};

const getSingle = async (req, res) => {
    if (!objectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid user id' });
    }

    try {
        const userId = new objectId(req.params.id);
        const user = await mongodb.getDatabase().collection(collectionName).findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error: error.message });
    }
};

module.exports = {
    getAll,
    getSingle
};
