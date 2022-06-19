function sendResponse(res, code, message, data) {
    return res.status(code).json({
        error: code == 201 || code == 200 ? false : true,
        status: code,
        message: message,
        data: data
    });
};

module.exports = {
    sendResponse
};