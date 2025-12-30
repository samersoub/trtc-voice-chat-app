// api/generate-sig.js - الإصدار الصحيح
import crypto from 'crypto';

function tlsEncode(str) {
  return Buffer.from(str).toString('base64').replace(/\+/g, '*').replace(/\//g, '-').replace(/=/g, '_');
}

function hmacsha256(identifier, sdkAppId, currTime, expire, secretKey) {
  const contentToBeSigned =
    'TLS.identifier:' + identifier + '\n' +
    'TLS.sdkappid:' + sdkAppId + '\n' +
    'TLS.time:' + currTime + '\n' +
    'TLS.expire:' + expire + '\n';
  return crypto.createHmac('sha256', secretKey).update(contentToBeSigned).digest('base64');
}

function genUserSig(identifier, sdkAppId, secretKey, expire) {
  const currTime = Math.floor(Date.now() / 1000);
  const sig = {
    'TLS.ver': '2.0',
    'TLS.identifier': identifier,
    'TLS.sdkappid': sdkAppId,
    'TLS.time': currTime,
    'TLS.expire': expire,
    'TLS.sig': hmacsha256(identifier, sdkAppId, currTime, expire, secretKey)
  };
  const json = JSON.stringify(sig);
  return tlsEncode(json);
}

export default async function handler(req, res) {
  // تمكين CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // معالجة طلبات OPTIONS لـ CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // السماح فقط بطلبات GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ 
      error: "userId is required",
      example: "/api/generate-sig?userId=test123"
    });
  }

  try {
    // 1. القيم من لوحة تحكم Tencent Cloud - تأكد من صحتها!
    const SDK_APP_ID = 20031795;
    const SECRET_KEY = process.env.TRTC_SECRET_KEY || "17fd0c3daf9ec5b966c1946854683bd77bf2b2f303dbc25d902464f2528dbffb";
    const EXPIRE = 604800; // 7 أيام
    const userSig = genUserSig(userId, SDK_APP_ID, SECRET_KEY, EXPIRE);
    
    // 5. إرجاع النتيجة
    return res.status(200).json({
      userSig,
      sdkAppID: SDK_APP_ID,
      userId,
      expireTime: Math.floor(Date.now() / 1000) + EXPIRE
    });
    
  } catch (error) {
    console.error('❌ خطأ في توليد UserSig:', error);
    return res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
}