import { Router } from 'express';
const router = Router();

import weatherRoutes from './weatherRoutes.js';

router.use('/weather', weatherRoutes);

router.get('/', (_req, res) => {
  res.send('API is working');
});

export default router;
