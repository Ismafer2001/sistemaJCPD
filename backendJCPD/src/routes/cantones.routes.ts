import { Router } from 'express';
import { Canton } from '../models/cantones.models';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const cantones = await Canton.findAll();
    res.json(cantones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cantones' });
  }
});

export default router;