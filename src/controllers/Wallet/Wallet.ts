import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Wallet from '../../models/Wallet';
import Client from '../../models/client';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';

const createWallet = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    
    const { clientId} = req.params;
    // Validate client ID
    if (!clientId) {
      throw new BadRequestError('Client ID is required');
    }
  
    // Check if the client exists
    const client = await Client.findById(clientId).exec();
    if (!client) {
      throw new NotFoundError('Client not found');
    }
  
    // Check if the wallet already exists
    const existingWallet = await Wallet.findOne({ clientId }).exec();
    if (existingWallet) {
      throw new BadRequestError('Wallet already exists for this client');
    }
  
    // Create the wallet
    const wallet = new Wallet({ clientId });
    await wallet.save();
  
    res.status(StatusCodes.CREATED).json({
      message: 'Wallet created successfully',
      success: true,
      data: wallet,
    });
  });

const depositMoney = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { clientId, amount, description } = req.body;
  
    // Validate input
    if (!clientId || amount === undefined) {
      throw new BadRequestError('Client ID and deposit amount are required');
    }
  
    // Check if the wallet exists
    const wallet = await Wallet.findOne({ clientId }).exec();
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }
  
    // Deposit money
    wallet.deposit(amount, description || 'Deposit');
    await wallet.save();
  
    res.status(StatusCodes.OK).json({
      message: 'Deposit successful',
      success: true,
      data: wallet,
    });
  });

  
const makePayment = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { clientId, amount, description } = req.body;
  
    // Validate input
    if (!clientId || amount === undefined) {
      throw new BadRequestError('Client ID and payment amount are required');
    }
  
    // Check if the wallet exists
    const wallet = await Wallet.findOne({ clientId }).exec();
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }
  
    // Make payment
    wallet.makePayment(amount, description || 'Payment');
    await wallet.save();
  
    res.status(StatusCodes.OK).json({
      message: 'Payment successful',
      success: true,
      data: wallet,
    });
  });

const getWalletDetails = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { clientId } = req.params;
  
    // Validate input
    if (!clientId) {
      throw new BadRequestError('Client ID is required');
    }
  
    // Check if the wallet exists
    const wallet = await Wallet.findOne({ clientId }).exec();
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }
  
    res.status(StatusCodes.OK).json({
      message: 'Wallet retrieved successfully',
      success: true,
      data: wallet,
    });
  });

const deleteWallet = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { clientId } = req.params;
  
    // Validate input
    if (!clientId) {
      throw new BadRequestError('Client ID is required');
    }
  
    // Find and delete the wallet
    const wallet = await Wallet.findOneAndDelete({ clientId }).exec();
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }
  
    res.status(StatusCodes.OK).json({
      message: 'Wallet deleted successfully',
      success: true,
    });
  });

const getTransactions = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { clientId } = req.params;
  
    // Validate input
    if (!clientId) {
      throw new BadRequestError('Client ID is required');
    }
  
    // Find the wallet and return transactions
    const wallet = await Wallet.findOne({ clientId }).exec();
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }
  
    res.status(StatusCodes.OK).json({
      message: 'Transactions retrieved successfully',
      success: true,
      data: wallet.transactions,
    });
  });

export {
    createWallet,
    depositMoney,
    makePayment,
    getWalletDetails,
    deleteWallet,
    getTransactions,
  };
  