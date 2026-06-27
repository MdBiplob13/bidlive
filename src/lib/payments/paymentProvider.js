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
