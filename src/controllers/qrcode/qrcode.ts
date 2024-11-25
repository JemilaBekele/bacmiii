import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Client from '../../models/client';
import asyncWrapper from '../../middleware/async';
import NotFoundError from '../../errors/not-found';

// Get QR Code for a client
const getQrCode = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { clientId } = req.params;


  // Fetch client by ID
  const client = await Client.findById(clientId).exec();
  if (!client) {
    throw new NotFoundError('Client not found');
  }

  // Check if the client has a QR code
  if (!client.qrCode) {
    res.status(StatusCodes.NOT_FOUND).json({
      message: 'QR Code not generated for this client.',
    });
    return;
  }

  // Respond with the QR code
  res.status(StatusCodes.OK).json({
    message: 'QR Code retrieved successfully.',
    success: true,
    qrCode: client.qrCode, // Base64 encoded QR code string
  });
});

export { getQrCode };
