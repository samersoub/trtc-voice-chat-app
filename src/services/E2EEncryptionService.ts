/**
 * End-to-End Encryption Service
 * يوفر تشفير شامل للمحادثات باستخدام Web Crypto API
 * يدعم RSA و AES-GCM
 */

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface EncryptedMessage {
  encryptedData: string; // Base64
  iv: string; // Base64
  encryptedKey: string; // Base64 (مشفر بالـ public key)
  timestamp: number;
  senderId: string;
}

export interface KeyExchange {
  userId: string;
  publicKey: string; // Base64
  timestamp: number;
}

class E2EEncryptionService {
  private static instance: E2EEncryptionService;
  private keyPair: KeyPair | null = null;
  private publicKeys: Map<string, CryptoKey> = new Map();
  private readonly STORAGE_KEY_PRIVATE = 'e2e_private_key';
  private readonly STORAGE_KEY_PUBLIC = 'e2e_public_key';

  private constructor() {}

  public static getInstance(): E2EEncryptionService {
    if (!E2EEncryptionService.instance) {
      E2EEncryptionService.instance = new E2EEncryptionService();
    }
    return E2EEncryptionService.instance;
  }

  /**
   * التحقق من دعم المتصفح
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 
           'crypto' in window && 
           'subtle' in window.crypto;
  }

  /**
   * توليد زوج مفاتيح RSA جديد
   */
  public async generateKeyPair(): Promise<KeyPair> {
    if (!this.isSupported()) {
      throw new Error('Web Crypto API not supported');
    }

    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );

    this.keyPair = keyPair;
    await this.saveKeyPairToStorage();
    return keyPair;
  }

  /**
   * حفظ المفاتيح في LocalStorage
   */
  private async saveKeyPairToStorage(): Promise<void> {
    if (!this.keyPair) return;

    try {
      // تصدير المفاتيح
      const publicKeyData = await window.crypto.subtle.exportKey(
        'spki',
        this.keyPair.publicKey
      );
      const privateKeyData = await window.crypto.subtle.exportKey(
        'pkcs8',
        this.keyPair.privateKey
      );

      // تحويل إلى Base64
      const publicKeyBase64 = this.arrayBufferToBase64(publicKeyData);
      const privateKeyBase64 = this.arrayBufferToBase64(privateKeyData);

      // حفظ في LocalStorage
      localStorage.setItem(this.STORAGE_KEY_PUBLIC, publicKeyBase64);
      localStorage.setItem(this.STORAGE_KEY_PRIVATE, privateKeyBase64);
    } catch (error) {
      console.error('Failed to save key pair:', error);
    }
  }

  /**
   * تحميل المفاتيح من LocalStorage
   */
  public async loadKeyPairFromStorage(): Promise<KeyPair | null> {
    if (!this.isSupported()) return null;

    try {
      const publicKeyBase64 = localStorage.getItem(this.STORAGE_KEY_PUBLIC);
      const privateKeyBase64 = localStorage.getItem(this.STORAGE_KEY_PRIVATE);

      if (!publicKeyBase64 || !privateKeyBase64) {
        return null;
      }

      // تحويل من Base64
      const publicKeyData = this.base64ToArrayBuffer(publicKeyBase64);
      const privateKeyData = this.base64ToArrayBuffer(privateKeyBase64);

      // استيراد المفاتيح
      const publicKey = await window.crypto.subtle.importKey(
        'spki',
        publicKeyData,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        true,
        ['encrypt']
      );

      const privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        privateKeyData,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        true,
        ['decrypt']
      );

      this.keyPair = { publicKey, privateKey };
      return this.keyPair;
    } catch (error) {
      console.error('Failed to load key pair:', error);
      return null;
    }
  }

  /**
   * الحصول على المفتاح العام الحالي
   */
  public async getPublicKey(): Promise<string | null> {
    if (!this.keyPair) {
      await this.loadKeyPairFromStorage();
    }

    if (!this.keyPair) {
      await this.generateKeyPair();
    }

    if (!this.keyPair) return null;

    try {
      const publicKeyData = await window.crypto.subtle.exportKey(
        'spki',
        this.keyPair.publicKey
      );
      return this.arrayBufferToBase64(publicKeyData);
    } catch (error) {
      console.error('Failed to export public key:', error);
      return null;
    }
  }

  /**
   * تخزين المفتاح العام لمستخدم آخر
   */
  public async storePublicKey(userId: string, publicKeyBase64: string): Promise<void> {
    try {
      const publicKeyData = this.base64ToArrayBuffer(publicKeyBase64);
      const publicKey = await window.crypto.subtle.importKey(
        'spki',
        publicKeyData,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        true,
        ['encrypt']
      );

      this.publicKeys.set(userId, publicKey);
      
      // حفظ في LocalStorage
      const storedKeys = this.getStoredPublicKeys();
      storedKeys[userId] = publicKeyBase64;
      localStorage.setItem('e2e_public_keys', JSON.stringify(storedKeys));
    } catch (error) {
      console.error('Failed to store public key:', error);
    }
  }

  /**
   * تحميل المفاتيح العامة المخزنة
   */
  private getStoredPublicKeys(): Record<string, string> {
    try {
      const data = localStorage.getItem('e2e_public_keys');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  /**
   * تشفير رسالة
   */
  public async encryptMessage(
    message: string,
    recipientUserId: string,
    senderId: string
  ): Promise<EncryptedMessage> {
    if (!this.isSupported()) {
      throw new Error('Encryption not supported');
    }

    // الحصول على المفتاح العام للمستقبل
    let recipientPublicKey = this.publicKeys.get(recipientUserId);
    
    if (!recipientPublicKey) {
      // محاولة تحميله من LocalStorage
      const storedKeys = this.getStoredPublicKeys();
      if (storedKeys[recipientUserId]) {
        await this.storePublicKey(recipientUserId, storedKeys[recipientUserId]);
        recipientPublicKey = this.publicKeys.get(recipientUserId);
      }
    }

    if (!recipientPublicKey) {
      throw new Error('Recipient public key not found');
    }

    // توليد مفتاح AES عشوائي
    const aesKey = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );

    // توليد IV عشوائي
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // تشفير الرسالة بـ AES
    const encoder = new TextEncoder();
    const messageData = encoder.encode(message);
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      aesKey,
      messageData
    );

    // تصدير مفتاح AES
    const aesKeyData = await window.crypto.subtle.exportKey('raw', aesKey);

    // تشفير مفتاح AES بالمفتاح العام للمستقبل
    const encryptedKey = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      recipientPublicKey,
      aesKeyData
    );

    return {
      encryptedData: this.arrayBufferToBase64(encryptedData),
      iv: this.arrayBufferToBase64(iv),
      encryptedKey: this.arrayBufferToBase64(encryptedKey),
      timestamp: Date.now(),
      senderId,
    };
  }

  /**
   * فك تشفير رسالة
   */
  public async decryptMessage(encrypted: EncryptedMessage): Promise<string> {
    if (!this.isSupported()) {
      throw new Error('Decryption not supported');
    }

    if (!this.keyPair) {
      await this.loadKeyPairFromStorage();
    }

    if (!this.keyPair) {
      throw new Error('Private key not found');
    }

    try {
      // فك تشفير مفتاح AES
      const encryptedKeyData = this.base64ToArrayBuffer(encrypted.encryptedKey);
      const aesKeyData = await window.crypto.subtle.decrypt(
        {
          name: 'RSA-OAEP',
        },
        this.keyPair.privateKey,
        encryptedKeyData
      );

      // استيراد مفتاح AES
      const aesKey = await window.crypto.subtle.importKey(
        'raw',
        aesKeyData,
        {
          name: 'AES-GCM',
          length: 256,
        },
        false,
        ['decrypt']
      );

      // فك تشفير الرسالة
      const encryptedData = this.base64ToArrayBuffer(encrypted.encryptedData);
      const iv = this.base64ToArrayBuffer(encrypted.iv);

      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        aesKey,
        encryptedData
      );

      // تحويل إلى نص
      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt message');
    }
  }

  /**
   * تشفير بيانات (عام)
   */
  public async encryptData(data: string, password: string): Promise<string> {
    if (!this.isSupported()) {
      throw new Error('Encryption not supported');
    }

    // توليد مفتاح من كلمة المرور
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const dataBuffer = encoder.encode(data);
    const encryptedData = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      dataBuffer
    );

    // دمج salt + iv + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

    return this.arrayBufferToBase64(combined.buffer);
  }

  /**
   * فك تشفير بيانات (عام)
   */
  public async decryptData(encryptedBase64: string, password: string): Promise<string> {
    if (!this.isSupported()) {
      throw new Error('Decryption not supported');
    }

    const combined = this.base64ToArrayBuffer(encryptedBase64);
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encryptedData = combined.slice(28);

    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decryptedData = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  }

  /**
   * مسح جميع المفاتيح
   */
  public clearAllKeys(): void {
    this.keyPair = null;
    this.publicKeys.clear();
    localStorage.removeItem(this.STORAGE_KEY_PRIVATE);
    localStorage.removeItem(this.STORAGE_KEY_PUBLIC);
    localStorage.removeItem('e2e_public_keys');
  }

  /**
   * Helper: تحويل ArrayBuffer إلى Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Helper: تحويل Base64 إلى ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

export default E2EEncryptionService.getInstance();
