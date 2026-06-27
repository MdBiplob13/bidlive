import { PaymentProvider } from "../paymentProvider";

export class SSLCommerzProvider extends PaymentProvider {
  async initiatePayment({ transactionId, amount, customerName, customerPhone, redirectUrl, webhookUrl }) {
    // Generate a redirect URL to our simulated interactive checkout page on the frontend
    const gatewayUrl = `/dashboard/wallet?mockGateway=true&provider=sslcommerz&txnId=${transactionId}&amount=${amount}&customerName=${encodeURIComponent(customerName)}&customerPhone=${customerPhone}`;
    return {
      gatewayUrl,
      gatewayTxnId: `SSLC-${transactionId}-${Date.now().toString().slice(-4)}`,
    };
  }

  async verifyPayment(payload) {
    const { status, amount, txnId, gatewayTxnId } = payload;
    if (status === "success") {
      return {
        success: true,
        amount: Number(amount),
        gatewayTxnId: gatewayTxnId || `SSLC-VERIFIED-${txnId}`,
        raw: payload,
      };
    }
    return {
      success: false,
      amount: Number(amount || 0),
      gatewayTxnId: null,
      raw: payload,
    };
  }

  async refundPayment(gatewayTxnId, amount) {
    return {
      success: true,
      refundTxnId: `SSLC-REF-${gatewayTxnId.slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`,
    };
  }
}

export default SSLCommerzProvider;
