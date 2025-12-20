const crypto = require('crypto');

// This webhook handles callbacks from Tencent RTC
// Documentation: https://cloud.tencent.com/document/product/647/34293

module.exports = (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Basic logging of the event
    console.log('[TRTC Webhook] Received event:', req.body?.EventType);

    // In a real app, you would verify the signature here if 'Enable authentication' is on.
    // For now, we just acknowledge receipt to keep TRTC happy.

    // Return 200 OK
    res.status(200).json({ code: 0 });
};
