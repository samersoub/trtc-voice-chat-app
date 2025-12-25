// api/generate-sig.js - الإصدار الصحيح
import crypto from 'crypto';

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
    
    // 2. إعداد معلمات التوقيع
    const currTime = Math.floor(Date.now() / 1000);
    const expire = 604800; // 7 أيام بالثواني
    
    // 3. إنشاء مستند التوقيع بالصيغة الصحيحة
    const sigDoc = {
      "TLS.ver": "2.0",
      "TLS.identifier": String(userId),
      "TLS.sdkappid": Number(SDK_APP_ID),
      "TLS.time": currTime,
      "TLS.expire": expire
    };
    
    // 4. تحويل إلى JSON وحساب التوقيع
    const sigContent = JSON.stringify(sigDoc);
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(sigContent);
    const base64Sig = hmac.digest('base64');
    
    // 5. إرجاع النتيجة
    return res.status(200).json({
      userSig: base64Sig,
      sdkAppID: SDK_APP_ID,
      userId: userId,
      expireTime: currTime + expire
    });
    
  } catch (error) {
    console.error('❌ خطأ في توليد UserSig:', error);
    return res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
}