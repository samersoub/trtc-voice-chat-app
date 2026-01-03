export class WebRTCService {
  private stream: MediaStream | null = null;

  async getMicStream(): Promise<MediaStream> {
    if (this.stream) return this.stream;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.stream = stream;
    return stream;
  }

  stopMic() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  createPeerConnection(): RTCPeerConnection {
    return new RTCPeerConnection({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    });
  }
}