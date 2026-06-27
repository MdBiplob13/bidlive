import { PaymentProvider } from "../paymentProvider";

export class ManualPaymentProvider extends PaymentProvider {
  async initiatePayment({ transactionId, amount }) {
    // Manual payments do not have a gateway URL; they are processed inside the local application
    return {
      gatewayUrl: null,
      gatewayTxnId: `MANUAL-${transactionId}`,
    };
  }

  async verifyPayment(payload) {
    // Verified manually by the administrator
    return {
      success: false, // will require admin approval action to mark completed
      amount: Number(payload.amount),
      gatewayTxnId: payload.gatewayTxnId,
      raw: payload,
    };
  }

  async refundPayment(gatewayTxnId, amount) {
    return {
      success: true,
      refundTxnId: `MANUAL-REF-${gatewayTxnId.slice(-8)}`,
    };
  }
}

export default ManualPaymentProvider;
