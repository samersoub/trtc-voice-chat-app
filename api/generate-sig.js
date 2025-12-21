const crypto = require('crypto');
const zlib = require('zlib');

/**
 * توليد UserSig باستخدام القيم من بيئة العمل لضمان المطابقة
 */
function genUserSig(userId, expire = 604800) {
    // سحب القيم من Vercel أو استخدام الجديدة كاحتياط
    const SDK_APP_ID = Number(process.env.VITE_TRTC_SDK_APP_ID) || 20031795;
    const SECRET_KEY = process.env.VITE_TRTC_SECRET_KEY || "17fd0c3daf9ec5b966c1946854683bd77bf2bf303dbc25d902464f2528dbffb";

    const currTime = Math.floor(Date.now() / 1000);

    let sigContent = '';
    sigContent += 'TLS.identifier:' + userId + '\n';
    sigContent += 'TLS.sdkappid:' + SDK_APP_ID + '\n';
    sigContent += 'TLS.time:' + currTime + '\n';
    sigContent += 'TLS.expire:' + expire + '\n';

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
    return compressed.toString('base64');
}

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

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