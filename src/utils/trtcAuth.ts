import { USERSIG_API_ENDPOINT } from "@/config/trtcConfig";

/**
 * Fetch a TRTC UserSig for the given userId from your secure backend.
 * The backend must use the TRTC Secret Key to generate the signature.
 */
export async function fetchUserSig(userId: string): Promise<string> {
  if (!USERSIG_API_ENDPOINT || USERSIG_API_ENDPOINT.includes("PASTE")) {
    throw new Error("USERSIG_API_ENDPOINT is not configured. Please set it in src/config/trtcConfig.ts");
  }

  const url = `${USERSIG_API_ENDPOINT}?userId=${encodeURIComponent(userId)}&ts=${Date.now()}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch UserSig (${res.status}): ${text}`);
  }

  const data = await res.json() as any;

  // Try common response shapes: { userSig }, { data: { userSig } }, or case variations
  const userSig =
    data?.userSig ??
    data?.data?.userSig ??
    data?.UserSig ??
    data?.data?.UserSig;

  if (!userSig || typeof userSig !== "string") {
    throw new Error("UserSig missing in response");
  }

  return userSig;
}