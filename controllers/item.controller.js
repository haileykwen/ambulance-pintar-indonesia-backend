require('dotenv').config();
const db = require("../models/db");
const util = require('util');
const { sendResponse } = require('../utils/response.util.js');

const createItem = (req, res) => {
    const { name } = req.body;

    if (!name) return sendResponse(res, 400, "Data belum lengkap", null)

    const sql = "INSERT INTO item (name) VALUES (?)";
    db.query(sql, [name], (error, success) => {
        if (error) return sendResponse(res, 500, "Server error", null)
        if (success) return sendResponse(res, 200, "Berhasil menambah barang", null)
    });
};

const restock = (req, res) => {
    const { item_id, qty, timestamp } = req.body;
    const query = util.promisify(db.query).bind(db);
    console.log(req.body);

    if (!item_id || !qty || !timestamp) return sendResponse(res, 400, "Data belum lengkap", null);

    (async () => {
        try {
            await query(`INSERT INTO item_in (item_id, qty, timestamp) VALUES (${item_id}, ${qty}, ${timestamp})`);
            await query(`INSERT INTO item_log (item_id, qty, log_type, timestamp) VALUES (${item_id}, ${qty}, 1, ${timestamp})`);
            sendResponse(res, 200, "Restock barang berhasil", null);
        } catch(error) {
            console.log(error);
            return sendResponse(res, 500, "Server error", null);
        };
    })();
};

const spend = (req, res) => {
    const query = util.promisify(db.query).bind(db);
    let { item_id, qty, timestamp } = req.body;
    let requestQty = qty;
    let totalQty;

    if (!item_id || !qty || !timestamp) return sendResponse(res, 400, "Data belum lengkap", null);

    (async () => {
        try {
            const rowsTotalQty = await query(`SELECT SUM(qty) AS total_qty FROM item_in where item_id = ${item_id}`);
            totalQty = rowsTotalQty[0].total_qty;

            if (!totalQty) return sendResponse(res, 400, "Barang tidak ditemukan", null);
            if (qty > totalQty) return sendResponse(res, 400, "Stock barang tidak mencukupi", null);

            const rowsItem = await query(`SELECT * FROM item_in WHERE item_id = ${item_id} AND qty != 0 ORDER BY timestamp ASC`);
            
            let values = [];
            rowsItem.every((item, index) => {
                if (qty <= 0) {
                    return false;
                };

                values.push({
                    id: item.id,
                    qty: item.qty <= qty 
                            ?   0
                            :   item.qty - qty
                });
                
                if (item.qty >= qty) {
                    qty = 0;
                } else {
                    qty = qty - item.qty;
                };
                return true;
            });

            values.forEach(async function(item) {
                await query(`UPDATE item_in SET qty = ${item.qty} WHERE id = ${item.id}`);
            });

            await query(`INSERT INTO item_out (item_id, qty, timestamp) VALUES (${item_id}, ${requestQty}, ${Date.now()})`);
            await query(`INSERT INTO item_log (item_id, qty, log_type, timestamp) VALUES (${item_id}, ${requestQty}, 2, ${Date.now()})`);
            
            return sendResponse(res, 200, "Spend berhasil", null);
        } catch(error) {
            console.log(error);
            return sendResponse(res, 500, "Server error", null);
        };
    })();
};

const getItems = (req, res) => {
    const query = util.promisify(db.query).bind(db);

    (async () => {
        try {
            const items = await query(`SELECT * FROM item ORDER BY name ASC`);
            return sendResponse(res, 200, "Ambil data barang berhasil", items);
        } catch(error) {
            console.log(error);
            return sendResponse(res, 500, "Server error", null);
        };
    })();
};

const deleteItem = (req, res) => {
    const query = util.promisify(db.query).bind(db);

    (async () => {
        try {
            await query(`DELETE FROM item WHERE id = ${req.body.id}`);
            return sendResponse(res, 200, "Hapus data barang berhasil", null);
        } catch(error) {
            console.log(error);
            return sendResponse(res, 500, "Server error", null);
        };
    })();
};

const getRestocks = (req, res) => {
    const query = util.promisify(db.query).bind(db);

    (async () => {
        try {
            const items = await query("SELECT *, item.name AS item_name FROM item_in JOIN item on item_in.item_id = item.id");
            return sendResponse(res, 200, "Ambil data barang masuk berhasil", items);
        } catch(error) {
            console.log(error);
            return sendResponse(res, 500, "Server error", null);
        };
    })();
};

const getSpends = (req, res) => {
    const query = util.promisify(db.query).bind(db);

    (async () => {
        try {
            const items = await query("SELECT *, item.name AS item_name FROM item_out JOIN item on item_out.item_id = item.id");
            return sendResponse(res, 200, "Ambil data barang masuk berhasil", items);
        } catch(error) {
            console.log(error);
            return sendResponse(res, 500, "Server error", null);
        };
    })();
};

const getLogs = (req, res) => {
    const query = util.promisify(db.query).bind(db);

    (async () => {
        try {
            // const items = await query("SELECT *, item.name AS item_name FROM item_in JOIN item on item_in.item_id = item.id");

            // const items = await query(`SELECT * FROM item_log ORDER BY timestamp ASC`);

            const items = await query("SELECT *, item.name AS item_name FROM item_log JOIN item on item_log.item_id = item.id");

            return sendResponse(res, 200, "Ambil data barang masuk berhasil", items);
        } catch(error) {
            console.log(error);
            return sendResponse(res, 500, "Server error", null);
        };
    })();
};

module.exports = {
    createItem,
    restock,
    spend,
    getItems,
    deleteItem,
    getRestocks,
    getSpends,
    getLogs
};