const express = require('express');
const {
  createAppointment, getAppointments, getAppointmentById,
  updateAppointmentStatus, deleteAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', authorizeRoles('patient'), createAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id/status', updateAppointmentStatus);
router.delete('/:id', authorizeRoles('admin'), deleteAppointment);

module.exports = router;