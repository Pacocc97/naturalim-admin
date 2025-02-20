// interfaces.ts

// Interface para BankAccount
export interface BankAccount {
  id: string;
  holder_name: string;
  alias: string;
  clabe: string;
  bank_name: string;
  bank_code: string;
  creation_date: Date;
}

// Interface para CardPoints
export interface CardPoints {
  used: number;
  remaining: number;
  amount: number;
  caption?: string;
}

// Interface para Address
export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

// Interface para Card
export interface Card {
  id: string;
  creation_date: Date;
  holder_name: string;
  card_number: number;
  cvv2: string;
  expiration_month: number;
  expiration_year: number;
  address: Address;
  allows_charges: boolean;
  allows_payouts: boolean;
  brand: string;
  type: string;
  bank_name: string;
  bank_code: string;
  customer_id: string | null;
  points_card: boolean;
}

// Interface para Transaction
export interface Transaction {
  id: string;
  authorization: string;
  transaction_type: 'fee' | 'charge' | 'payout' | 'transfer';
  operation_type: 'in' | 'out';
  method: 'card' | 'bank' | 'customer';
  creation_date: Date;
  order_id: string;
  status: 'completed' | 'in_progress' | 'failed';
  amount: number;
  description: string;
  error_message?: string;
  customer_id: string | null;
  currency: string;
  bank_account: BankAccount;
  card: Card;
  card_points?: CardPoints;
}
