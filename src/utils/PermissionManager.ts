export class PermissionManager {
  static async ensureMicPermission(): Promise<boolean> {
    if (typeof navigator === "undefined") return false;

    const nav: any = navigator;

    const requestMic = async (): Promise<boolean> => {
      const getUserMedia = nav?.mediaDevices?.getUserMedia;
      if (!getUserMedia) return false;
      try {
        await getUserMedia.call(nav.mediaDevices, { audio: true });
        return true;
      } catch {
        return false;
      }
    };

    if (!nav.permissions?.query) {
      return requestMic();
    }

    try {
      const status = await nav.permissions.query({ name: "microphone" as any });
      if (status.state === "granted") return true;
      if (status.state === "prompt") {
        return requestMic();
      }
      return false;
    } catch {
      return requestMic();
    }
  }
}