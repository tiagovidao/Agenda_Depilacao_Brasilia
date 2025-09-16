import { Router } from 'express';
import { AppointmentController } from '../controllers/appointmentController';
import { authenticate } from '../middleware/auth';
import { appointmentValidation } from '../middleware/validation';

const router = Router();
const appointmentController = new AppointmentController();

router.use(authenticate);

router.get('/', appointmentController.list);

router.post('/', appointmentValidation, appointmentController.create);

router.put('/:id', appointmentValidation, appointmentController.update);

router.delete('/:id', appointmentController.delete);

export default router;