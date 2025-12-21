// api/generate-sig.js
import crypto from 'crypto';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    const SDK_APP_ID = 20031795;
    // المفتاح الجديد الذي أرسلته الآن (تأكد من مطابقته تماماً)
    const SECRET_KEY = "17fd0c3daf9ec5b966c1946854683bd77bf2b2f303dbc25d902464f2528dbffb";

    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    try {
        const currTime = Math.floor(Date.now() / 1000);
        const expire = 604800;
        let sigContent = `TLS.identifier:${userId}\nTLS.sdkappid:${SDK_APP_ID}\nTLS.time:${currTime}\nTLS.expire:${expire}\n`;

        const hmac = crypto.createHmac('sha256', SECRET_KEY);
        const sig = hmac.update(sigContent).digest('base64');

        res.status(200).json({ 
            userSig: sig,
            sdkAppID: SDK_APP_ID
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}