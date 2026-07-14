const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;
const collectionName = 'contacts';

const getContactFromBody = (body = {}) => ({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    favoriteColor: body.favoriteColor,
    birthday: body.birthday
});

const validateContact = (contact) => Object.entries(contact)
    .filter(([, value]) => value === undefined || value === null || value === '')
    .map(([field]) => field);

const getAll = async (req, res) => {
    //#swagger.tags = ['Contacts']
    try {
        const contacts = await mongodb.getDatabase()
            .collection(collectionName)
            .find()
            .toArray();

        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving contacts', error: error.message });
    }
};

const getSingle = async (req, res) => {
    //#swagger.tags = ['Contacts']
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid contact id' });
    }

    try {
        const contact = await mongodb.getDatabase()
            .collection(collectionName)
            .findOne({ _id: new ObjectId(req.params.id) });

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.status(200).json(contact);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving contact', error: error.message });
    }
};

const createContact = async (req, res) => {
    //#swagger.tags = ['Contacts']
    const contact = getContactFromBody(req.body);
    const missingFields = validateContact(contact);

    if (missingFields.length > 0) {
        return res.status(400).json({ message: 'All contact fields are required', missingFields });
    }

    try {
        const response = await mongodb.getDatabase()
            .collection(collectionName)
            .insertOne(contact);

        res.status(201).json({ id: response.insertedId });
    } catch (error) {
        res.status(500).json({ message: 'Error creating contact', error: error.message });
    }
};

const updateContact = async (req, res) => {
    //#swagger.tags = ['Contacts']
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid contact id' });
    }

    const contact = getContactFromBody(req.body);
    const missingFields = validateContact(contact);

    if (missingFields.length > 0) {
        return res.status(400).json({ message: 'All contact fields are required', missingFields });
    }

    try {
        const response = await mongodb.getDatabase()
            .collection(collectionName)
            .replaceOne({ _id: new ObjectId(req.params.id) }, contact);

        if (response.matchedCount === 0) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error updating contact', error: error.message });
    }
};

const deleteContact = async (req, res) => {
    //#swagger.tags = ['Contacts']
    const contactId = new ObjectId(req.params.id);
    const response = await mongodb.getDatabase().db().collection('contacts').deleteOne({ _id: contactId });
    if (response.deletedCount === 0) {
        return res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Some error occurred while deleting the contact');
    }
};
module.exports = {
    getAll,
    getSingle,
    createContact,
    updateContact,
    deleteContact
};
