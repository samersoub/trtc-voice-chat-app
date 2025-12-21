const crypto = require('crypto');
const zlib = require('zlib');

function genUserSig(userId, sdkAppId, secretKey, expire = 604800) {
    const currTime = Math.floor(Date.now() / 1000);
    let sigContent = `TLS.identifier:${userId}\nTLS.sdkappid:${sdkAppId}\nTLS.time:${currTime}\nTLS.expire:${expire}\n`;

    const hmac = crypto.createHmac('sha256', secretKey);
    const sig = hmac.update(sigContent).digest('base64');

    const sigDoc = {
        'TLS.ver': '2.0',
        'TLS.identifier': String(userId),
        'TLS.sdkappid': Number(sdkAppId),
        'TLS.expire': Number(expire),
        'TLS.time': Number(currTime),
        'TLS.sig': sig
    };

    const jsonStr = JSON.stringify(sigDoc);
    const compressed = zlib.deflateSync(Buffer.from(jsonStr));
    return compressed.toString('base64');
}

module.exports = (req, res) => {
    // إعدادات الوصول (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // القيم الجديدة الصحيحة (تم وضعها كاحتياط مباشر هنا)
    const SDK_APP_ID = 20031795;
    const SECRET_KEY = "17fd0c3daf9ec5b966c1946854683bd77bf2bf303dbc25d902464f2528dbffb";

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "userId is required" });
    }

    try {
        const userSig = genUserSig(userId, SDK_APP_ID, SECRET_KEY);
        res.status(200).json({ userSig, sdkAppID: SDK_APP_ID });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}