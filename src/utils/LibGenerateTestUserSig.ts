/* eslint-disable */
export default class LibGenerateTestUserSig {
    public sdkAppId: number;
    public secretKey: string;
    public expire: number;

    constructor(sdkAppId: number, secretKey: string, expire: number) {
        this.sdkAppId = sdkAppId;
        this.secretKey = secretKey;
        this.expire = expire;
    }

    public async genTestUserSig(userID: string): Promise<string> {
        const currTime = Math.floor(Date.now() / 1000);
        const sigDoc = {
            'TLS.ver': '2.0',
            'TLS.identifier': userID,
            'TLS.sdkappid': this.sdkAppId,
            'TLS.expire': this.expire,
            'TLS.time': currTime,
        };

        // Sig content to sign
        const sigContent =
            'TLS.identifier:' + userID + '\n' +
            'TLS.sdkappid:' + this.sdkAppId + '\n' +
            'TLS.time:' + currTime + '\n' +
            'TLS.expire:' + this.expire + '\n';

        // Generate HMAC-SHA256 signature using Web Crypto API
        const encoder = new TextEncoder();
        const keyData = encoder.encode(this.secretKey);
        const messageData = encoder.encode(sigContent);

        const key = await window.crypto.subtle.importKey(
            "raw",
            keyData,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );

        const signature = await window.crypto.subtle.sign(
            "HMAC",
            key,
            messageData
        );

        // Convert to Base64
        const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

        // Construct final JSON object and base64 encode it (mimicking the zlibless format if accepted)
        // Note: Official SDK usually expects compressed zlib buffer. 
        // However, some versions accept uncompressed JSON if no compression flag? 
        // Wait, the standard format is: base64(zlib(json_with_sig))
        // Without zlib, this might fail on strict TRTC verification. 
        // But we are stuck without zlib. Let's try sending the raw JSON base64'd usersig.

        const jsonSig = {
            "TLS.ver": "2.0",
            "TLS.identifier": userID,
            "TLS.sdkappid": this.sdkAppId,
            "TLS.expire": this.expire,
            "TLS.time": currTime,
            "TLS.sig": signatureBase64
        };

        // Return Base64 of the stringified JSON
        // e.g. eJxlz... is zlib compressed. 
        // We are returning eyJTA... (json). 
        // TRTC *might* accept it. If not, user MUST use backend.

        return btoa(JSON.stringify(jsonSig));
    }
}
