"use client";

export function validateUsername(username: string): string | null {
  if (!username || username.trim().length < 3) return "اسم المستخدم يجب أن يكون 3 أحرف على الأقل";
  const re = /^[a-zA-Z0-9_]{3,20}$/;
  if (!re.test(username)) return "اسم المستخدم يجب أن يحتوي على أحرف/أرقام/شرطة سفلية فقط وبطول 3-20";
  return null;
}

export function validateEmail(email: string): string | null {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !re.test(email)) return "صيغة البريد غير صحيحة";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password || password.length < 6) return "كلمة المرور 6 أحرف على الأقل";
  const re = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
  if (!re.test(password)) return "كلمة المرور يجب أن تحتوي على أحرف وأرقام";
  return null;
}

export function validatePhone(phone: string): string | null {
  const re = /^\+?[1-9]\d{7,14}$/; // E.164 تقريبًا
  if (!phone || !re.test(phone)) return "رقم الهاتف يجب أن يكون بصيغة دولية مثل +9665XXXXXXX";
  return null;
}