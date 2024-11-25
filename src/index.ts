import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import bikeRoutes from './routes/bike';
import WalletRoutes from './routes/Wallet'
import auth from './middleware/authentication';
import qrcodeRoutes from './routes/qrcode'
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || "")
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(`MongoDB connection error: ${err}`));
  

app.use(cors());
app.use(express.json());
app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));



app.use('/api/mobile', authRoutes);
app.use('/api/mobile/bike', auth, bikeRoutes);
app.use('/api/mobile/Wallet', auth, WalletRoutes);
app.use('/api/mobile/qrcode', auth, qrcodeRoutes);

// Global Error-Handling Middleware
// Global Error-Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ error: message });
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
