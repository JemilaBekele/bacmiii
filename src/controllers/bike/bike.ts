import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Bicycle from '../../models/Bicycle';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import QRCode from 'qrcode';
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    firstname: string;
    role: string;
  };
}

// Create a new bicycle
const createBicycle = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { bicycleId, batteryId, location, status } = req.body;

  const createdBy = {
    id: req.user?.userId || '',
  };

  // Check for existing bicycle with the same ID
  const existingBicycle = await Bicycle.findOne({ bicycleId });
  if (existingBicycle) {
    throw new BadRequestError('Bicycle ID already exists. Please use a unique bicycle ID.');
  }

  // Generate QR Code for the bicycle
  const qrCodeData = `Bicycle:${bicycleId}`;
  const qrCode = await QRCode.toDataURL(qrCodeData);

  // Create a new bicycle with QR code
  const bicycle = await Bicycle.create({
    bicycleId,
    batteryId,
    location,
    status,
    qrCode, // Add the generated QR code to the database
    createdBy,
  });

  res.status(StatusCodes.CREATED).json({ 
    message: 'Bicycle created successfully', 
    success: true, 
    data: bicycle 
  });
});


// Get a single bicycle by ID
const getBicycle = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id :bicycleId} = req.params;

  if (!bicycleId) {
    throw new BadRequestError('Bicycle ID is required');
  }

  // Pass the ObjectId directly to findById
  const bicycle = await Bicycle.findById({_id: bicycleId});
  if (!bicycle) {
    throw new NotFoundError(`No bicycle found with ID: ${bicycleId}`);
  }

  res.status(StatusCodes.OK).json({ bicycle });
});

// Get all bicycles
const getAllBicycles = asyncWrapper(async (_req: Request, res: Response): Promise<void> => {
  const bicycles = await Bicycle.find({});
  res.status(StatusCodes.OK).json({ bicycles, count: bicycles.length });
});

// Delete a bicycle by ID
const deleteBicycle = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id: bicycleId } = req.params;

  if (!bicycleId) {
    throw new BadRequestError('Bicycle ID is required');
  }

  // Pass the ObjectId directly to findByIdAndDelete
  const bicycle = await Bicycle.findByIdAndDelete({_id: bicycleId});
  if (!bicycle) {
    throw new NotFoundError(`No bicycle found with ID: ${bicycleId}`);
  }

  res.status(StatusCodes.OK).json({ message: 'Bicycle deleted successfully' });
});


const updateBicycle = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id: bicycleId } = req.params;

  if (!bicycleId) {
    throw new BadRequestError('Bicycle ID is required');
  }

  const updatedBicycle = await Bicycle.findByIdAndUpdate(
    bicycleId,
    req.body, // Update with the fields provided in the request body
    {
      new: true, // Return the updated document
      runValidators: true, // Ensure the update adheres to schema validation
    }
  );

  if (!updatedBicycle) {
    throw new NotFoundError(`No bicycle found with ID: ${bicycleId}`);
  }

  res.status(StatusCodes.OK).json({ message: 'Bicycle updated successfully', bicycle: updatedBicycle });
});



export { createBicycle, getBicycle,updateBicycle, getAllBicycles, deleteBicycle };
