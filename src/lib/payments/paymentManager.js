import { SSLCommerzProvider } from "./providers/sslcommerz";
import { CardPaymentProvider } from "./providers/card";
import { ManualPaymentProvider } from "./providers/manual";

class PaymentManagerClass {
  constructor() {
    this.providers = new Map();
  }

  registerProvider(name, providerInstance) {
    this.providers.set(name.toLowerCase(), providerInstance);
  }

  getProvider(name) {
    const provider = this.providers.get(name.toLowerCase());
    if (!provider) {
      throw new Error(`Payment provider '${name}' is not registered/supported.`);
    }
    return provider;
  }
}

export const PaymentManager = new PaymentManagerClass();

// Auto-register built-in providers
PaymentManager.registerProvider("sslcommerz", new SSLCommerzProvider());
PaymentManager.registerProvider("card", new CardPaymentProvider());
PaymentManager.registerProvider("manual", new ManualPaymentProvider());

export default PaymentManager;

