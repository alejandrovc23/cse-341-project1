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
    //#swagger.summary = 'Get all contacts'
    //#swagger.description = 'Returns every contact stored in the contacts collection.'
    /* #swagger.responses[200] = {
        description: 'Contacts retrieved successfully.',
        schema: [{ $ref: '#/definitions/Contact' }]
    } */
    /* #swagger.responses[500] = {
        description: 'The contacts could not be retrieved.',
        schema: { $ref: '#/definitions/Error' }
    } */
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
    //#swagger.summary = 'Get a contact by ID'
    //#swagger.description = 'Returns the contact whose MongoDB ObjectId matches the URL parameter.'
    /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'MongoDB ObjectId of the contact.',
        required: true,
        type: 'string',
        example: '6a4c660864282d23d377e557'
    } */
    /* #swagger.responses[200] = {
        description: 'Contact retrieved successfully.',
        schema: { $ref: '#/definitions/Contact' }
    } */
    /* #swagger.responses[400] = {
        description: 'The supplied contact ID is invalid.',
        schema: { $ref: '#/definitions/Error' }
    } */
    /* #swagger.responses[404] = {
        description: 'No contact exists with the supplied ID.',
        schema: { $ref: '#/definitions/Error' }
    } */
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
    //#swagger.summary = 'Create a contact'
    //#swagger.description = 'Creates a contact. All five fields are required and the new contact ID is returned.'
    /* #swagger.parameters['contact'] = {
        in: 'body',
        description: 'Contact to create.',
        required: true,
        schema: { $ref: '#/definitions/ContactInput' }
    } */
    /* #swagger.responses[201] = {
        description: 'Contact created successfully.',
        schema: { $ref: '#/definitions/CreatedContact' }
    } */
    /* #swagger.responses[400] = {
        description: 'One or more required fields are missing.',
        schema: { $ref: '#/definitions/Error' }
    } */
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
    //#swagger.summary = 'Update a contact'
    //#swagger.description = 'Replaces the five fields of an existing contact. The contact ID is not modified.'
    /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'MongoDB ObjectId of the contact to update.',
        required: true,
        type: 'string',
        example: '6a4c660864282d23d377e557'
    } */
    /* #swagger.parameters['contact'] = {
        in: 'body',
        description: 'Complete replacement contact. All fields are required.',
        required: true,
        schema: { $ref: '#/definitions/ContactInput' }
    } */
    /* #swagger.responses[204] = {
        description: 'Contact updated successfully.'
    } */
    /* #swagger.responses[400] = {
        description: 'The ID is invalid or a required field is missing.',
        schema: { $ref: '#/definitions/Error' }
    } */
    /* #swagger.responses[404] = {
        description: 'No contact exists with the supplied ID.',
        schema: { $ref: '#/definitions/Error' }
    } */
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
    //#swagger.summary = 'Delete a contact'
    //#swagger.description = 'Permanently deletes the contact whose MongoDB ObjectId matches the URL parameter.'
    /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'MongoDB ObjectId of the contact to delete.',
        required: true,
        type: 'string',
        example: '6a4c660864282d23d377e557'
    } */
    /* #swagger.responses[204] = {
        description: 'Contact deleted successfully.'
    } */
    /* #swagger.responses[400] = {
        description: 'The supplied contact ID is invalid.',
        schema: { $ref: '#/definitions/Error' }
    } */
    /* #swagger.responses[404] = {
        description: 'No contact exists with the supplied ID.',
        schema: { $ref: '#/definitions/Error' }
    } */
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid contact id' });
    }

    try {
        const response = await mongodb.getDatabase()
            .collection(collectionName)
            .deleteOne({ _id: new ObjectId(req.params.id) });

        if (response.deletedCount === 0) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting contact', error: error.message });
    }
};
module.exports = {
    getAll,
    getSingle,
    createContact,
    updateContact,
    deleteContact
};
