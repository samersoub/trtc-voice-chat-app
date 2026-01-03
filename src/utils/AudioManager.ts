export class AudioManager {
  static attachStream(audioEl: HTMLAudioElement, stream: MediaStream) {
    audioEl.srcObject = stream;
    audioEl.play();
  }
  static detach(audioEl: HTMLAudioElement) {
    audioEl.pause();
    audioEl.srcObject = null;
  }
}