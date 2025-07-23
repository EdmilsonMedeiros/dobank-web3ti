export type OrdersDataType = {
  id: number;
  date: string;
  reference: string;
  details: string;
  amount: string;
  postBalance: string;
  status: string;
};

export type Transaction = {
  id: number;
  amount: string;
  charge: string;
  post_balance: string;
  trx_type: '+' | '-';
  trx: string;
  details: string;
  created_at: string;
}; 