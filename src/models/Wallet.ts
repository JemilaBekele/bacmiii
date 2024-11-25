import mongoose from 'mongoose';

interface WalletDocument extends mongoose.Document {
  clientId: mongoose.Types.ObjectId; // Reference to the Client schema
  balance: number; // Current balance in the wallet
  transactions: {
    type: 'Deposit' | 'Payment';
    amount: number;
    date: Date;
    description?: string;
  }[];
  deposit: (amount: number, description?: string) => void; // Method to add balance
  makePayment: (amount: number, description?: string) => boolean; // Method to deduct balance
}

const WalletSchema = new mongoose.Schema<WalletDocument>({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 0, // New wallets start with a 0 balance
  },
  transactions: [
    {
      type: {
        type: String,
        enum: ['Deposit', 'Payment'],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      description: {
        type: String,
      },
    },
  ],
});

// Method to deposit money
WalletSchema.methods.deposit = function (amount: number, description = 'Deposit') {
  if (amount <= 0) throw new Error('Deposit amount must be greater than zero');
  this.balance += amount;
  this.transactions.push({ type: 'Deposit', amount, description });
};

// Method to make a payment
WalletSchema.methods.makePayment = function (amount: number, description = 'Payment') {
  if (amount > this.balance) throw new Error('Insufficient balance');
  this.balance -= amount;
  this.transactions.push({ type: 'Payment', amount, description });
  return true;
};

// Create the Wallet model
const Wallet = mongoose.model<WalletDocument>('Wallet', WalletSchema);

export default Wallet;
