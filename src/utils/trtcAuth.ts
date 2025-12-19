import { USERSIG_API_ENDPOINT, TRTC_SECRET_KEY } from "@/config/trtcConfig";
import { genTestUserSig } from "./GenerateTestUserSig";

/**
 * Fetch a TRTC UserSig for the given userId from your secure backend.
 * The backend must use the TRTC Secret Key to generate the signature.
 */
export async function fetchUserSig(userId: string): Promise<string> {
  // 1. Try Local Generation (Dev/Test)
  if (TRTC_SECRET_KEY && TRTC_SECRET_KEY !== "" && !TRTC_SECRET_KEY.includes("PLEASE_REPLACE")) {
    const sig = await genTestUserSig(userId); // Now async
    return sig.userSig;
  }

  // 2. Alert if placeholder key
  if (TRTC_SECRET_KEY && TRTC_SECRET_KEY.includes("PLEASE_REPLACE")) {
    console.error("TRTC Error: You must set the TRTC_SECRET_KEY in src/config/trtcConfig.ts to use local testing.");
    // We still fall through to try API, but likely it will fail as well.
    // Let's verify if API endpoint is valid.
  }

  // 3. Try Backend API
  if (!USERSIG_API_ENDPOINT || USERSIG_API_ENDPOINT === "" || USERSIG_API_ENDPOINT.includes("api/generate-sig")) {
    // If endpoint is empty or default non-existent one, and we didn't gen locally:
    throw new Error("TRTC Configuration Error: Please set TRTC_SECRET_KEY in src/config/trtcConfig.ts for local testing.");
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