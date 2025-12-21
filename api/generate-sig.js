// api/generate-sig.js
const crypto = require('crypto');
const zlib = require('zlib');

export default function handler(req, res) {
    // إعدادات CORS للسماح بالاتصال
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // المفاتيح الصحيحة مباشرة لضمان العمل
    const SDK_APP_ID = 20031795;
    const SECRET_KEY = "17fd0c3daf9ec5b966c1946854683bd77bf2bf303dbc25d902464f2528dbffb";

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "userId is required" });
    }

    try {
        const currTime = Math.floor(Date.now() / 1000);
        const expire = 604800;
        let sigContent = `TLS.identifier:${userId}\nTLS.sdkappid:${SDK_APP_ID}\nTLS.time:${currTime}\nTLS.expire:${expire}\n`;

        const hmac = crypto.createHmac('sha256', SECRET_KEY);
        const sig = hmac.update(sigContent).digest('base64');

        const sigDoc = {
            'TLS.ver': '2.0',
            'TLS.identifier': String(userId),
            'TLS.sdkappid': Number(SDK_APP_ID),
            'TLS.expire': Number(expire),
            'TLS.time': Number(currTime),
            'TLS.sig': sig
        };

        const jsonStr = JSON.stringify(sigDoc);
        const compressed = zlib.deflateSync(Buffer.from(jsonStr));
        const userSig = compressed.toString('base64');

        return res.status(200).json({ userSig, sdkAppID: SDK_APP_ID });
    } catch (e) {
        return res.status(500).json({ error: "Server Error", details: e.message });
    }
}