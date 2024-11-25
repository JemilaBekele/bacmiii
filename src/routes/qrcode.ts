import express from 'express';
const router = express.Router();
import { getQrCode } from '../controllers/qrcode/qrcode';


router.route('/:clientId').get(getQrCode)

export default router; // Use ES Module export
