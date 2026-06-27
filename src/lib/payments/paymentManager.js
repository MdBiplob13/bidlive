import { SSLCommerzProvider } from "./providers/sslcommerz";
import { CardPaymentProvider } from "./providers/card";
import { ManualPaymentProvider } from "./providers/manual";

export class PaymentProvider {
  /**
   * Initiate a payment session.
   * @param {object} params { transactionId, amount, customerName, customerPhone, redirectUrl, webhookUrl }
   * @returns {Promise<{ gatewayUrl: string, gatewayTxnId: string }>}
   */
  async initiatePayment(params) {
    throw new Error("initiatePayment must be implemented by the provider");
  }

  /**
   * Verify a callback payload.
   * @param {object} payload Gateway callback payload (query parameters or POST body)
   * @returns {Promise<{ success: boolean, amount: number, gatewayTxnId: string, raw: object }>}
   */
  async verifyPayment(payload) {
    throw new Error("verifyPayment must be implemented by the provider");
  }

  /**
   * Refund a transaction.
   * @param {string} gatewayTxnId Gateway transaction reference
   * @param {number} amount Amount to refund
   * @returns {Promise<{ success: boolean, refundTxnId: string }>}
   */
  async refundPayment(gatewayTxnId, amount) {
    throw new Error("refundPayment must be implemented by the provider");
  }
}

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

