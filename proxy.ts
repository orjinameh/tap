import { paymentProxy, x402ResourceServer } from "@x402/next";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

const payTo = process.env.PAYMENT_RECIPIENT_ADDRESS!;
const facilitatorUrl = process.env.NEXT_PUBLIC_FACILITATOR_URL || "https://facilitator.x402.org";

const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });
const resourceServer = new x402ResourceServer(facilitatorClient)
  .register("eip155:84532", new ExactEvmScheme());

export default paymentProxy(
  {
    "/api/ai/summarize": {
      accepts: { scheme: "exact", price: "$0.01", network: "eip155:84532", payTo },
      description: "AI Text Summarization",
    },
    "/api/ai/translate": {
      accepts: { scheme: "exact", price: "$0.01", network: "eip155:84532", payTo },
      description: "AI Translation",
    },
    "/api/ai/code-review": {
      accepts: { scheme: "exact", price: "$0.05", network: "eip155:84532", payTo },
      description: "AI Code Review",
    },
    "/api/ai/generate": {
      accepts: { scheme: "exact", price: "$0.02", network: "eip155:84532", payTo },
      description: "AI Content Generation",
    },
    "/api/ai/explain": {
      accepts: { scheme: "exact", price: "$0.01", network: "eip155:84532", payTo },
      description: "AI Code/Text Explanation",
    },
    "/api/ai/classify": {
      accepts: { scheme: "exact", price: "$0.005", network: "eip155:84532", payTo },
      description: "AI Text Classification",
    },
  },
  resourceServer,
);

export const config = {
  matcher: ["/api/ai/:path*"],
};
