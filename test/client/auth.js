import { discordSdk } from "./discord";

export async function authenticateDiscord() {
  await discordSdk.ready();

  // STEP 1: authorize
  const auth = await discordSdk.commands.authorize({
    client_id: "1435704621229146184",
    response_type: "code",
    scope: ["identify"]
  });

  // STEP 2: send code to backend
  const tokenRes = await fetch("/api/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: auth.code })
  });

  const { access_token } = await tokenRes.json();

  if (!access_token) {
    throw new Error("No access token received from backend");
  }

  // STEP 3: authenticate in Discord SDK
  const user = await discordSdk.commands.authenticate({
    access_token
  });

  return user.user; // { id, username, global_name }
}
