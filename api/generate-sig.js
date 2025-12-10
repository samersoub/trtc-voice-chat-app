const { genTestUserSig } = require('trtc-js-sdk/plugins/GenerateTestUserSig'); 

// Read keys securely from Vercel Environment Variables
const SDK_APP_ID = process.env.TRTC_SDK_APP_ID;
const SECRET_KEY = process.env.TRTC_SECRET_KEY; 

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
        return res.status(500).send({ 
            error: "Server configuration error: TRTC keys are missing from Environment Variables." 
        });
    }
    
    const userId = req.query.userId || req.body?.userId;

    if (!userId) {
        return res.status(400).send({ error: "Missing userId parameter." });
    }

    try {
        const { genTestUserSig } = require('trtc-js-sdk/plugins/GenerateTestUserSig');
        const userSig = genTestUserSig({
            sdkAppId: Number(SDK_APP_ID),
            secretKey: SECRET_KEY,
            userId: userId,
        }).userSig;

        res.status(200).json({ userSig: userSig, userId: userId });

    } catch (e) {
        console.error("Error generating UserSig:", e);
        res.status(500).send({ error: "Failed to generate UserSig.", details: e.message });
    }
};