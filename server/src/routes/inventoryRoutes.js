import express from 'express';
import { getSmartReorder } from '../controllers/inventoryController.js';



const router = express.Router();




router.get('/smart-reorder', getSmartReorder);

export default router;
