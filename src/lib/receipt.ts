export function createReceiptNumber() {
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RCT-${stamp}-${suffix}`;
}

export function createExitQrPayload(transactionId: string, receiptNumber: string) {
  return JSON.stringify({
    type: "SELF_CHECKOUT_EXIT",
    transactionId,
    receiptNumber,
    issuedAt: new Date().toISOString()
  });
}
