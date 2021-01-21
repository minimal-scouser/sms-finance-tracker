export interface BankAccount {
  acNo: string;
  names: string[];
  balance: string;
  image: string;
  allMessages: {
    message: string;
    dateSent: string;
    id: string;
    trn?: {amount: number; type: 'debited' | 'credited' | 'balance'};
  }[];
}
