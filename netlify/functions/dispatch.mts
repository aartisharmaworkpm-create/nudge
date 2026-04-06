import { schedule } from "@netlify/functions";
import { dispatchDueMessages } from "../../src/lib/dispatcher";

// Runs every 10 minutes
export const handler = schedule("*/10 * * * *", async () => {
  try {
    const result = await dispatchDueMessages();
    console.log(`[dispatch] processed=${result.processed} succeeded=${result.succeeded} failed=${result.failed}`);
    return { statusCode: 200 };
  } catch (err) {
    console.error("[dispatch] error:", err);
    return { statusCode: 500 };
  }
});
