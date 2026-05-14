import { DiscordSDK } from "@discord/embedded-app-sdk";

const isDiscordActivity =
  window.location.hostname.includes("discordsays.com");
let discordSdk = null;
if (isDiscordActivity) {
     discordSdk = new DiscordSDK("1435704621229146184");
}

export { discordSdk};
