const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getJobStats
} = require('../controllers/jobsController');

// Import auth middleware
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /jobs - List jobs with filtering and pagination
router.get('/', getJobs);

// GET /jobs/stats - Get job statistics
router.get('/stats', getJobStats);

// GET /jobs/:id - Get single job with full details
router.get('/:id', getJob);

// POST /jobs - Create new job
router.post('/', createJob);

// PUT /jobs/:id - Update job
router.put('/:id', updateJob);

// DELETE /jobs/:id - Delete job
router.delete('/:id', deleteJob);

module.exports = router;
