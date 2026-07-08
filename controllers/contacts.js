const mongodb = require('../data/database');
const objectId = require('mongodb').ObjectId;
const collectionName = 'contacts';

const getAll = async (req, res) => {
    try {
        const result = await mongodb.getDatabase().collection(collectionName).find();
        const contacts = await result.toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving contacts', error: error.message });
    }
};

const getSingle = async (req, res) => {
    if (!objectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid contact id' });
    }

    try {
        const contactId = new objectId(req.params.id);
        const contact = await mongodb.getDatabase().collection(collectionName).findOne({ _id: contactId });

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(contact);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving contact', error: error.message });
    }
};

module.exports = {
    getAll,
    getSingle
};
