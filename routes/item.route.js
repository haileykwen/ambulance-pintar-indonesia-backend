const express = require('express');
const router = express.Router();
const { createItem, restock, spend, getItems, deleteItem, getRestocks, getSpends, getLogs } = require("../controllers/item.controller.js");

router.get('/', getItems);
router.post('/', createItem);
router.delete('/:id', deleteItem);

router.post('/in', restock);
router.get('/in', getRestocks);

router.post('/out', spend);
router.get('/out', getSpends);

router.get('/log', getLogs);

module.exports = router;