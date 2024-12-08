const express = require('express');
const router = express.Router();

// Import controllers
const { createUser, getAllUsers, getUserById, updateUser, deleteUser, signin } = require('../controllers/users/users.js');
const { fetchChangeTrackerData } = require('../controllers/changeTrackerData/fetchChangeTrackerData.js');
const { requestData } = require('../controllers/requestData/requestData.js');
const { table } = require('../controllers/table/table.js');
const { approve } = require('../controllers/approve/approve.js');
const { reject } = require('../controllers/reject/reject.js');
const { tableData } = require('../controllers/tableData/tableData.js');

// Authentication routes
router.post('/signin', signin);
router.post('/signup', createUser);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Data routes
router.get('/fetchchangetrackerdata', fetchChangeTrackerData);
router.post('/requestdata', requestData);
router.get('/table', table);
router.get('/tableData/:name', tableData);

// Request management routes
router.post('/approve', approve);
router.post('/reject', reject);

module.exports = router;