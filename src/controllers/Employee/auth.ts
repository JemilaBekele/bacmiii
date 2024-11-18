import { StatusCodes } from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';
import Client from '../../models/client';
import BadRequestError from '../../errors/bad-request';
import UnauthenticatedError from '../../errors/unauthenticated';
import asyncWrapper from '../../middleware/async';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';




// Define RequestWithFiles Interface
interface RequestWithFiles extends Request {
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined;
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, 'uploads/'); // Folder where images will be saved
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Initialize Multer with the storage configuration
const upload = multer({ storage }).fields([
  { name: 'fiydaIdImage', maxCount: 1 },
  { name: 'fiydaIdImageback', maxCount: 1 },
]);

// Register function with Multer middleware to handle file upload
const register = asyncWrapper(async (req: RequestWithFiles, res: Response): Promise<void> => {
  const { fullName, password, phoneNumber, sex, workplaceId, organization, locationStart, locationEnd } = req.body;
  console.log(fullName, password, phoneNumber, sex, workplaceId, organization, locationStart, locationEnd)
  // Ensure image files are provided
  if (
    !req.files ||
    typeof req.files !== 'object' ||
    !('fiydaIdImage' in req.files) ||
    !('fiydaIdImageback' in req.files)
  ) {
    res.status(StatusCodes.BAD_REQUEST).json({
      
      message: 'Please provide both front and back images of the Fiyda ID.',
    });
    return;
  }
  

  // Access the uploaded files
  const fiydaIdImage = req.files['fiydaIdImage']?.[0];
  console.log(fiydaIdImage)
  const fiydaIdImageback = req.files['fiydaIdImageback']?.[0];

  if (!fiydaIdImage || !fiydaIdImageback) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Both images are required.',
    });
    return;
  }

  // Get file paths
  const fiydaIdImagePath = fiydaIdImage.path;
  const fiydaIdImagebackPath = fiydaIdImageback.path;
  console.log("Front Image Path:", fiydaIdImagePath);
  console.log("Back Image Path:", fiydaIdImagebackPath);
  // Check if phone number already exists
  const existingUser = await Client.findOne({ phoneNumber });
  if (existingUser) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Phone number is already in use. Please use a different phone number.',
    });
    return;
  }

  // Create a new user
  const user = await Client.create({
    fullName,
    password,
    phoneNumber,
    sex,
    fiydaIdImage: fiydaIdImagePath,
    fiydaIdImageback: fiydaIdImagebackPath,
    workplaceId,
    organization,
    locationStart,
    locationEnd,
  });
  
  const accessToken = user.createJWT();

  // Respond with the created user and token
  res.status(StatusCodes.CREATED).json({
    user: {
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      sex: user.sex,
      fiydaIdImage: user.fiydaIdImage,
      fiydaIdImageback: user.fiydaIdImageback,
      workplaceId: user.workplaceId,
      organization: user.organization,
      locationStart: user.locationStart,
      locationEnd: user.locationEnd,
    },
    accessToken,
  });
});








// Login an existing user
const login = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { phoneNumber, password } = req.body;

  console.log(phoneNumber)
  if (!phoneNumber || !password) {
    throw new BadRequestError('Please provide phone number and password');
  }

  const user = await Client.findOne({ phoneNumber });
  if (!user || !(await user.comparePassword(password))) {
    throw new UnauthenticatedError('Invalid credentials');
  }
  const accessToken = user.createJWT();
  res.status(StatusCodes.OK).json({
    user: {
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      sex: user.sex,
      fiydaId: user.fiydaId,
      workplaceId: user.workplaceId,
      organization: user.organization,
      locationStart: user.locationStart,
      locationEnd: user.locationEnd,
    },
    accessToken,
  });
});

// Get all users with user count
const getAllUsers = asyncWrapper(async (_req: Request, res: Response): Promise<void> => {
  const users = await Client.find({});
  res.status(StatusCodes.OK).json({ users, userCount: users.length });
});

// Get a single user by ID
const getUser = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id: userID } = req.params;
  const user = await Client.findById(userID);
  if (!user) {
    res.status(StatusCodes.NOT_FOUND).json({ message: `No user with ID: ${userID}` });
    return;
  }
  res.status(StatusCodes.OK).json({ user });
});

// Delete a user by ID
const deleteUser = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id: userID } = req.params;
  const user = await Client.findByIdAndDelete(userID);
  if (!user) {
    res.status(StatusCodes.NOT_FOUND).json({ message: `No user with ID: ${userID}` });
    return;
  }
  res.status(StatusCodes.OK).json({ message: 'User deleted successfully' });
});

// Update a user by ID
const updateUser = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id: userID } = req.params;
  const user = await Client.findByIdAndUpdate(userID, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    res.status(StatusCodes.NOT_FOUND).json({ message: `No user with ID: ${userID}` });
    return;
  }
  res.status(StatusCodes.OK).json({ user });
});

// Logout user
const logout = asyncWrapper(async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(StatusCodes.OK).json({ message: 'Logout successful' });
});

// Change password
const changePassword = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id: userID } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new BadRequestError('Please provide current password and new password');
  }

  const user = await Client.findById(userID);
  if (!user) {
    res.status(StatusCodes.NOT_FOUND).json({ message: `No user with ID: ${userID}` });
    return;
  }

  const isPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({ message: 'Password updated successfully' });
});

export { register, upload,login, getAllUsers, getUser, deleteUser, updateUser, logout, changePassword };
