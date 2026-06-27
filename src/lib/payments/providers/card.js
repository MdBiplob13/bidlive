import { PaymentProvider } from "../paymentManager";

export class CardPaymentProvider extends PaymentProvider {
  async initiatePayment({ transactionId, amount, customerName, customerPhone, redirectUrl, webhookUrl }) {
    const gatewayUrl = `/dashboard/wallet?mockGateway=true&provider=card&txnId=${transactionId}&amount=${amount}&customerName=${encodeURIComponent(customerName)}`;
    return {
      gatewayUrl,
      gatewayTxnId: `CARD-${transactionId}-${Date.now().toString().slice(-4)}`,
    };
  }

  async verifyPayment(payload) {
    const { status, amount, txnId, gatewayTxnId } = payload;
    if (status === "success") {
      return {
        success: true,
        amount: Number(amount),
        gatewayTxnId: gatewayTxnId || `CARD-VERIFIED-${txnId}`,
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
      refundTxnId: `CARD-REF-${gatewayTxnId.slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`,
    };
  }
}

export default CardPaymentProvider;
