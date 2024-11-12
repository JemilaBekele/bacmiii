import express from 'express';
const router = express.Router();
import { login, register, logout, getAllUsers, getUser, deleteUser, updateUser,changePassword } from '../controllers/Employee/auth';

router.route('/register').post(register);
router.route('/logout').post(logout);
router.route('/login').post(login);
router.route('/users').get(getAllUsers);
router.route('/users/:id').get(getUser).delete(deleteUser).patch(updateUser);
router.route('/users/:id/change-password').patch(changePassword);

export default router; // Use ES Module export
