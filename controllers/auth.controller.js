require('dotenv').config();
const db = require("../models/db");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { sendResponse } = require('../utils/response.util');

const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({
            status: 400,
            message: "Data belum lengkap"
        });
    };

    const sql = "SELECT * FROM user where email = ?";
    db.query(sql, email, (error, success) => {
        if (error) {
            console.log(error);
            res.status(500).json({
                status: 500,
                message: "Server Error"
            });
        };

        if (success) {
            if (success.length === 0) {
                res.status(400).json({
                    status: 400,
                    message: "Username atau kata sandi tidak sesuai!"
                });
            } else {
                const data = success[0];
                const hash = data.password;

                const isMatch = bcrypt.compareSync(password, hash);

                if (isMatch) {
                    const token = jwt.sign(
                        { 
                            id: data.id,
                            role: data.role,
                            username: data.email
                        }, 
                        process.env.JWT_SECRET
                    );
                    const datas = {
                        token,
                        role: data.role,
                        username: data.email
                    };
                    return sendResponse(res, 200, "Berhasil masuk", datas);
                } else {
                    res.status(400).json({
                        status: 400,
                        message: "Email atau kata sandi tidak sesuai!"
                    });
                };
            };
        };
    });
};

const getUserData = (req, res) => {
    const {token} = req.body;

    if (!token) return sendResponse(res, 401, "User tidak ter autorisasi", null);

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (decodedToken) {
        return sendResponse(res, 200, "Berhasil mengambil data", {...decodedToken});
    } else {
        return sendResponse(res, 401, "User tidak ter autorisasi", null);
    };
}

module.exports = {
    login,
    getUserData
};