import { StatusCodes } from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';
import Employee from '../../models/Employee';
import BadRequestError from '../../errors/bad-request';
import UnauthenticatedError from '../../errors/unauthenticated';
import asyncWrapper from '../../middleware/async';

// Define valid user roles
type UserRole = 'Employee' | 'Admin';

// Register a new user
const register = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { firstname, lastname, password, role, phoneNumber, sex } = req.body;

    // Check if phone number already exists
    const existingUser = await Employee.findOne({ phoneNumber });
    if (existingUser) {
        res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Phone number is already in use. Please use a different phone number.',
        });
        return; // Explicitly return after sending a response
    }

    // Create a new user
    const user = await Employee.create({ firstname, lastname, password, role, phoneNumber, sex });
    const accessToken = user.createJWT(); // Ensure createJWT is defined in Employee model

    // Respond with the created user and token
    res.status(StatusCodes.CREATED).json({
        user: {
            firstname: user.firstname,
            lastname: user.lastname, // Add lastname to match schema
            role: user.role,
            phoneNumber: user.phoneNumber, // Align naming with schema
        },
        accessToken,
    });
});

// Login an existing user
const login = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
        throw new BadRequestError('Please provide phone number and password');
    }
    const user = await Employee.findOne({ phoneNumber });
    if (!user || !(await user.comparePassword(password))) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    const accessToken = user.createJWT();
    res.status(StatusCodes.OK).json({
        user: {
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role,
            phoneNumber: user.phoneNumber,
        },
        accessToken,
    });
});

// Get all users with role counts
const getAllUsers = asyncWrapper(async (_req: Request, res: Response): Promise<void> => {
    const users = await Employee.find({});
    const roleCounts: Record<UserRole, number> = {
        Employee: 0,
        Admin: 0,
    };

    users.forEach((user) => {
        // Use type assertion to inform TypeScript that user.role is of type UserRole
        const role = user.role as UserRole; // Ensure user.role is correctly typed
        if (roleCounts.hasOwnProperty(role)) {
            roleCounts[role]++;
        }
    });

    res.status(StatusCodes.OK).json({ users, userCount: users.length, roleCounts });
});

// Get a single user by ID
const getUser = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id: userID } = req.params;
    const user = await Employee.findById(userID);
    if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({ message: `No user with ID: ${userID}` });
        return; // Explicitly return after sending a response
    }
    res.status(StatusCodes.OK).json({ user });
});

// Delete a user by ID
const deleteUser = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id: userID } = req.params;
    const user = await Employee.findByIdAndDelete(userID);
    if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({ message: `No user with ID: ${userID}` });
        return; // Explicitly return after sending a response
    }
    res.status(StatusCodes.OK).json({ message: 'User deleted successfully' });
});

// Update a user by ID
const updateUser = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id: userID } = req.params;
    const user = await Employee.findByIdAndUpdate(userID, req.body, {
        new: true,
        runValidators: true,
    });
    if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({ message: `No user with ID: ${userID}` });
        return; // Explicitly return after sending a response
    }
    res.status(StatusCodes.OK).json({ user });
});

const logout = asyncWrapper(async (_req: Request, res: Response): Promise<void> => {
    // If using cookies, clear the JWT cookie (if token is stored there)
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Ensure secure flag is set in production
        sameSite: 'strict', // Helps prevent CSRF
    });

    res.status(StatusCodes.OK).json({ message: 'Logout successful' });
});


const changePassword = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id: userID } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Check if currentPassword and newPassword are provided
    if (!currentPassword || !newPassword) {
        throw new BadRequestError('Please provide current password and new password');
    }

    // Find the user by ID
    const user = await Employee.findById(userID);
    if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({ message: `No user with ID: ${userID}` });
        return;
    }

    // Verify the current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Current password is incorrect');
    }

    // Update to the new password
    user.password = newPassword;
    await user.save();

    res.status(StatusCodes.OK).json({ message: 'Password updated successfully' });
});


export { register, login, getAllUsers, getUser, deleteUser, updateUser, logout,changePassword };
