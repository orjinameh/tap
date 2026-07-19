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
    "/api/auth/session": {
      accepts: { scheme: "exact", price: "$0.05", network: "eip155:84532", payTo },
      description: "30 minutes unlimited API access",
    },
  },
  resourceServer,
);

export const config = {
  matcher: ["/api/auth/session"],
};
