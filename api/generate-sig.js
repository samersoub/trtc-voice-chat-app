const crypto = require('crypto');
const zlib = require('zlib');

// Hardcoded for immediate fix
const SDK_APP_ID = 20031766;
const SECRET_KEY = "e76d25df660fd21c030faadeb1e619c5d3b2785e49f30f914b125c8a7a86bab2";

/**
 * Generate UserSig using Node.js built-in modules
 * Algorithm: HMAC-SHA256 + Base64 + Zlib
 */
function genUserSig(userId, expire = 604800) {
    const currTime = Math.floor(Date.now() / 1000);

    // 1. Create the content to be signed
    let sigContent = '';
    sigContent += 'TLS.identifier:' + userId + '\n';
    sigContent += 'TLS.sdkappid:' + SDK_APP_ID + '\n';
    sigContent += 'TLS.time:' + currTime + '\n';
    sigContent += 'TLS.expire:' + expire + '\n';

    // 2. Generate HMAC-SHA256 signature
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    const sig = hmac.update(sigContent).digest('base64');

    // 3. Construct the JSON object
    const sigDoc = {
        'TLS.ver': '2.0',
        'TLS.identifier': String(userId),
        'TLS.sdkappid': Number(SDK_APP_ID),
        'TLS.expire': Number(expire),
        'TLS.time': Number(currTime),
        'TLS.sig': sig
    };

    // 4. Compress using Zlib and encode to Base64
    const jsonStr = JSON.stringify(sigDoc);
    const compressed = zlib.deflateSync(Buffer.from(jsonStr));
    return compressed.toString('base64');
}

module.exports = (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Content-Type', 'application/json');

    const userId = req.query.userId || req.body?.userId;

    if (!userId) {
        return res.status(400).send({ error: "Missing userId parameter." });
    }

    try {
        const userSig = genUserSig(userId);
        res.status(200).json({ userSig, userId });
    } catch (e) {
        console.error("Error generating UserSig:", e);
        res.status(500).send({ error: "Failed to generate UserSig.", details: e.message });
    }
};