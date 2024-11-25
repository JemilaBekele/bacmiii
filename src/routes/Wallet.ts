import express from 'express';
import {
  createWallet,
  depositMoney,
  makePayment,
  getWalletDetails,
  deleteWallet,
  getTransactions,
} from '../controllers/Wallet/Wallet'; // Adjust the path based on your folder structure

const router = express.Router();

// Define routes for Wallet
router.route('/add').post(createWallet);                // Create a new wallet
router.route('/:clientId').get(getWalletDetails);       // Get wallet details by Client ID
router.route('/:clientId/transactions').get(getTransactions); // Get transactions for a specific wallet
router.route('/deposit').post(depositMoney);           // Deposit money to a wallet
router.route('/payment').post(makePayment);            // Make payment from a wallet
router.route('/:clientId').delete(deleteWallet);       // Delete a wallet by Client ID

export default router;
