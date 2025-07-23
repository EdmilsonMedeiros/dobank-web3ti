type Transaction = {
  id: number;
  amount: string;
  charge: string;
  post_balance: string;
  trx_type: "+" | "-";
  trx: string;
  details: string;
  created_at: string;
};

export const recentTransactions: Transaction[] = [
  {
    id: 1,
    amount: "150.00",
    charge: "0.00",
    post_balance: "1500.00",
    trx_type: "+",
    trx: "PIX123456",
    details: "Recebimento PIX - João Silva",
    created_at: "2024-03-20T10:30:00Z"
  },
  {
    id: 2,
    amount: "50.00",
    charge: "0.00",
    post_balance: "1450.00",
    trx_type: "-",
    trx: "TRF789012",
    details: "Transferência para Maria Santos",
    created_at: "2024-03-20T11:15:00Z"
  },
  {
    id: 3,
    amount: "200.00",
    charge: "0.00",
    post_balance: "1650.00",
    trx_type: "+",
    trx: "PIX345678",
    details: "Recebimento PIX - Carlos Oliveira",
    created_at: "2024-03-20T14:20:00Z"
  },
  {
    id: 4,
    amount: "75.00",
    charge: "0.00",
    post_balance: "1575.00",
    trx_type: "-",
    trx: "TRF901234",
    details: "Pagamento de conta - Energia",
    created_at: "2024-03-20T16:45:00Z"
  },
  {
    id: 5,
    amount: "300.00",
    charge: "0.00",
    post_balance: "1875.00",
    trx_type: "+",
    trx: "PIX567890",
    details: "Recebimento PIX - Ana Paula",
    created_at: "2024-03-20T18:30:00Z"
  }
]; 