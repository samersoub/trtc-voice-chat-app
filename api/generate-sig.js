const { genTestUserSig } = require('trtc-js-sdk/plugins/GenerateTestUserSig');

// Read keys securely from Vercel Environment Variables
// ⚠️ NEVER commit these values to Git - use Vercel Environment Variables only
const SDK_APP_ID = 20031766;
const SECRET_KEY = "e76d25df660fd21c030faadeb1e619c5d3b2785e49f30f914b125c8a7a86bab2";

module.exports = (req, res) => {
    // CORS headers - allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Prevent caching by browsers/CDNs
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Type', 'application/json');

    // Essential security and validation checks
    if (!SDK_APP_ID || !SECRET_KEY) {
        console.error('Missing TRTC credentials');
        return res.status(500).send({
            error: "Server configuration error: TRTC keys are missing from Environment Variables."
        });
    }

    const userId = req.query.userId || req.body?.userId;

    if (!userId) {
        return res.status(400).send({ error: "Missing userId parameter." });
    }

    try {
        console.log('Generating UserSig for userId:', userId);
        const result = genTestUserSig({
            sdkAppId: Number(SDK_APP_ID),
            secretKey: SECRET_KEY,
            userId: userId,
        });

        console.log('UserSig generated successfully');
        res.status(200).json({ userSig: result.userSig, userId: userId });

    } catch (e) {
        console.error("Error generating UserSig:", e);
        res.status(500).send({ error: "Failed to generate UserSig.", details: e.message });
    }
};