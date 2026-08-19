import type { PaymentMethod, PaymentStatus } from './types';
import { sleep } from './utils';

/**
 * Local mock payment processor.
 * No real payments are processed. Simulates realistic outcomes.
 */

type PaymentResult = {
  status: PaymentStatus;
  reference: string;
  message: string;
  rawStatus: PaymentStatus;
};

const SUCCESS_RATES: Record<PaymentMethod, number> = {
  card: 0.85,
  mobile_money: 0.78,
  paypal: 0.9,
};

const FAILURE_STATUSES: PaymentStatus[] = ['failed', 'declined', 'timeout', 'insufficient_funds'];

export async function processPayment(
  method: PaymentMethod,
  amountCents: number,
  simulate: 'random' | 'success' | 'fail' = 'random'
): Promise<PaymentResult> {
  await sleep(1200 + Math.random() * 800);

  const reference = `MOCK-${method.toUpperCase().slice(0, 4)}-${Date.now().toString(36).toUpperCase()}`;

  let status: PaymentStatus;

  if (simulate === 'success') {
    status = 'success';
  } else if (simulate === 'fail') {
    const idx = Math.floor(Math.random() * FAILURE_STATUSES.length);
    status = FAILURE_STATUSES[idx];
  } else {
    const successRate = SUCCESS_RATES[method];
    const roll = Math.random();
    if (roll < successRate) {
      status = 'success';
    } else if (roll < successRate + 0.05) {
      status = 'timeout';
    } else if (roll < successRate + 0.1) {
      status = 'cancelled';
    } else if (roll < successRate + 0.18) {
      status = 'declined';
    } else if (roll < successRate + 0.25) {
      status = 'insufficient_funds';
    } else {
      status = 'failed';
    }
  }

  const messages: Record<PaymentStatus, string> = {
    success: 'Paiement accepté avec succès',
    pending: 'Paiement en attente',
    failed: 'Échec du traitement du paiement',
    declined: 'Carte refusée',
    timeout: 'Délai dépassé pour la demande de paiement',
    cancelled: 'Paiement annulé',
    refunded: 'Paiement remboursé',
    insufficient_funds: 'Fonds insuffisants',
  };

  return {
    status,
    reference,
    message: messages[status],
    rawStatus: status,
  };
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: 'Carte',
  mobile_money: 'Mobile Money',
  paypal: 'PayPal',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  success: 'Réussi',
  pending: 'En attente',
  failed: 'Échoué',
  declined: 'Refusé',
  timeout: 'Délai dépassé',
  cancelled: 'Annulé',
  refunded: 'Remboursé',
  insufficient_funds: 'Fonds insuffisants',
};

export function paymentStatusLabel(status: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status] || status.replace(/_/g, ' ');
}

export function paymentMethodLabel(method?: PaymentMethod): string {
  if (!method) return '—';
  return PAYMENT_METHOD_LABELS[method] || method.replace(/_/g, ' ');
}

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  success: 'badge-success',
  pending: 'badge-warning',
  failed: 'badge-danger',
  declined: 'badge-danger',
  timeout: 'badge-warning',
  cancelled: 'badge-slate',
  refunded: 'badge-sky',
  insufficient_funds: 'badge-danger',
};
