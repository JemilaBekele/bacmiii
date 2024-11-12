import express from 'express';
import { createBicycle, getBicycle, getAllBicycles, deleteBicycle,updateBicycle } from '../controllers/bike/bike';

const router = express.Router();

// Define routes for Bicycle
router.route('/add').post(createBicycle);               // Create a new bicycle
router.route('/:id').get(getBicycle);                   // Get a single bicycle by ID
router.route('/').get(getAllBicycles);                  // Get all bicycles
router.route('/:id').delete(deleteBicycle);
router.route('/:id').patch(updateBicycle);           // Delete a bicycle by ID

export default router;
