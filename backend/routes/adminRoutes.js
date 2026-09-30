const express = require('express');
const {
  getDashboard, getUsers, deleteUser, getAllDoctors, getAllAppointments,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/doctors', getAllDoctors);
router.get('/appointments', getAllAppointments);

module.exports = router;