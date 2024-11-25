import { StatusCodes } from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';
import Client from '../../models/client';
import BadRequestError from '../../errors/bad-request';
import UnauthenticatedError from '../../errors/unauthenticated';
import asyncWrapper from '../../middleware/async';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import QRCode from 'qrcode';
import { uploadImage } from '../../helpers/uploadImage';





// Define RequestWithFiles Interface
interface RequestWithFiles extends Request {
  files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[] | undefined;
}

const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage for testing
}).fields([
  { name: 'fiydaIdImage', maxCount: 1 },
  { name: 'fiydaIdImageback', maxCount: 1 },
]);
// Register function with the updated image upload system
const register = asyncWrapper(async (req: RequestWithFiles, res: Response): Promise<void> => {

  console.log("Received Body:", req.body);  // Log text fields
  console.log("Received Files:", req.files);

  const { fullName, password, phoneNumber, sex, workplaceId, organization, locationStart, locationEnd } = req.body;

  // Validate input fields
  if (!fullName || !password || !phoneNumber || !sex) {
    throw new BadRequestError('All required fields (fullName, password, phoneNumber, sex) must be provided.');
  }

  // Ensure image files are provided
  if (
    !req.files ||
    typeof req.files !== 'object' ||
    !('fiydaIdImage' in req.files) ||
    !('fiydaIdImageback' in req.files)
  ) {
    throw new BadRequestError('Please provide both front and back images of the Fiyda ID.');
  }

  // Access uploaded files
  const fiydaIdImage = req.files['fiydaIdImage']?.[0];
  const fiydaIdImageback = req.files['fiydaIdImageback']?.[0];

  if (!fiydaIdImage || !fiydaIdImageback) {
    throw new BadRequestError('Both images are required.');
  }

  // Upload images and get their paths
  const fiydaIdImagePath = await uploadImage(fiydaIdImage);
  const fiydaIdImagebackPath = await uploadImage(fiydaIdImageback);

  const existingUser = await Client.findOne({ phoneNumber });
  if (existingUser) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Phone number is already in use. Please use a different phone number.',
    });
    return;
  }

  // Generate QR Code
  const qrCodeData = `Client:${phoneNumber}`; // You can customize the data encoded in the QR code
  const qrCode = await QRCode.toDataURL(qrCodeData);

  // Create a new user
  const user = await Client.create({
    fullName,
    password,
    phoneNumber,
    sex,
    fiydaIdImage: fiydaIdImagePath,
    fiydaIdImageback: fiydaIdImagebackPath,
    workplaceId: workplaceId || '',
    organization: organization || '',
    locationStart,
    locationEnd,
    qrCode,
  });

  // Generate JWT
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
      qrCode: user.qrCode
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
      id:user._id,
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

  res.status(StatusCodes.OK).json({
    user: {
      id: user._id, // Include the ID in the response
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
  });
 
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
