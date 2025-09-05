const { testConnection } = require('../config/database');

// Helper function to get database connection
const getConnection = async () => {
  const connection = await testConnection();
  return connection;
};

// Helper function to create standardized response
const createResponse = (success, data = null, message = null, error = null) => {
  const response = {
    success,
    timestamp: new Date().toISOString()
  };
  
  if (data !== null) response.data = data;
  if (message !== null) response.message = message;
  if (error !== null) response.error = error;
  
  return response;
};

// Helper function to extract business_id from authenticated request
const getBusinessIdFromToken = (req) => {
  // Extract from authenticated request (set by auth middleware)
  return req.business.id;
};

// GET /jobs - List jobs with filtering and pagination
const getJobs = async (req, res) => {
  try {
    const connection = await getConnection();
    const businessId = getBusinessIdFromToken(req);
    
    // Extract query parameters
    const {
      status,
      customer_id,
      employee_id,
      date_from,
      date_to,
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;
    
    // Build WHERE clause
    let whereClause = 'WHERE j.business_id = ?';
    const queryParams = [businessId];
    
    if (status) {
      whereClause += ' AND j.status = ?';
      queryParams.push(status);
    }
    
    if (customer_id) {
      whereClause += ' AND j.customer_id = ?';
      queryParams.push(customer_id);
    }
    
    if (employee_id) {
      whereClause += ' AND j.assigned_employee_id = ?';
      queryParams.push(employee_id);
    }
    
    if (date_from) {
      whereClause += ' AND DATE(j.scheduled_date) >= ?';
      queryParams.push(date_from);
    }
    
    if (date_to) {
      whereClause += ' AND DATE(j.scheduled_date) <= ?';
      queryParams.push(date_to);
    }
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build ORDER BY clause
    const validSortFields = ['scheduled_date', 'completion_date', 'created_at', 'total_cost', 'status'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      ${whereClause}
    `;
    
    const [countResult] = await connection.execute(countQuery, queryParams);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);
    
    // Get jobs with related data
    const jobsQuery = `
      SELECT 
        j.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address,
        c.city as customer_city,
        c.state as customer_state,
        c.zip_code as customer_zip_code,
        e.first_name as employee_first_name,
        e.last_name as employee_last_name,
        e.email as employee_email,
        e.phone as employee_phone,
        e.job_title as employee_job_title,
        est.title as estimate_title,
        est.amount as estimate_amount,
        est.status as estimate_status
      FROM jobs j
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN employees e ON j.assigned_employee_id = e.id
      LEFT JOIN estimates est ON j.estimate_id = est.id
      ${whereClause}
      ORDER BY j.${sortField} ${sortDirection}
      LIMIT ? OFFSET ?
    `;
    
    const [jobs] = await connection.execute(jobsQuery, [...queryParams, parseInt(limit), offset]);
    
    // Transform jobs data
    const transformedJobs = jobs.map(job => ({
      id: job.id,
      business_id: job.business_id,
      customer_id: job.customer_id,
      estimate_id: job.estimate_id,
      assigned_employee_id: job.assigned_employee_id,
      title: job.title,
      description: job.description,
      scheduled_date: job.scheduled_date,
      completion_date: job.completion_date,
      status: job.status,
      total_cost: job.total_cost,
      created_at: job.created_at,
      updated_at: job.updated_at,
      customer: job.customer_name ? {
        id: job.customer_id,
        name: job.customer_name,
        email: job.customer_email,
        phone: job.customer_phone,
        address: job.customer_address,
        city: job.customer_city,
        state: job.customer_state,
        zip_code: job.customer_zip_code
      } : null,
      employee: job.employee_first_name ? {
        id: job.assigned_employee_id,
        first_name: job.employee_first_name,
        last_name: job.employee_last_name,
        email: job.employee_email,
        phone: job.employee_phone,
        job_title: job.employee_job_title
      } : null,
      estimate: job.estimate_title ? {
        id: job.estimate_id,
        title: job.estimate_title,
        amount: job.estimate_amount,
        status: job.estimate_status
      } : null
    }));
    
    const response = createResponse(true, {
      jobs: transformedJobs,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: totalItems,
        items_per_page: parseInt(limit)
      }
    });
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json(createResponse(false, null, 'Failed to fetch jobs', 'INTERNAL_ERROR'));
  }
};

// GET /jobs/:id - Get single job with full details
const getJob = async (req, res) => {
  try {
    const connection = await getConnection();
    const businessId = getBusinessIdFromToken(req);
    const jobId = req.params.id;
    
    // Get job with related data
    const jobQuery = `
      SELECT 
        j.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address,
        c.city as customer_city,
        c.state as customer_state,
        c.zip_code as customer_zip_code,
        e.first_name as employee_first_name,
        e.last_name as employee_last_name,
        e.email as employee_email,
        e.phone as employee_phone,
        e.job_title as employee_job_title,
        est.title as estimate_title,
        est.amount as estimate_amount,
        est.status as estimate_status
      FROM jobs j
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN employees e ON j.assigned_employee_id = e.id
      LEFT JOIN estimates est ON j.estimate_id = est.id
      WHERE j.id = ? AND j.business_id = ?
    `;
    
    const [jobs] = await connection.execute(jobQuery, [jobId, businessId]);
    
    if (jobs.length === 0) {
      return res.status(404).json(createResponse(false, null, 'Job not found', 'NOT_FOUND'));
    }
    
    const job = jobs[0];
    
    // Get job items
    const itemsQuery = `
      SELECT * FROM job_items WHERE job_id = ?
    `;
    const [items] = await connection.execute(itemsQuery, [jobId]);
    
    // Get job photos
    const photosQuery = `
      SELECT * FROM job_photos WHERE job_id = ?
    `;
    const [photos] = await connection.execute(photosQuery, [jobId]);
    
    // Get job notes
    const notesQuery = `
      SELECT 
        jn.*,
        e.first_name as employee_first_name,
        e.last_name as employee_last_name
      FROM job_notes jn
      LEFT JOIN employees e ON jn.employee_id = e.id
      WHERE jn.job_id = ?
      ORDER BY jn.created_at DESC
    `;
    const [notes] = await connection.execute(notesQuery, [jobId]);
    
    // Get status history
    const statusHistoryQuery = `
      SELECT 
        jsh.*,
        e.first_name as employee_first_name,
        e.last_name as employee_last_name
      FROM job_status_history jsh
      LEFT JOIN employees e ON jsh.changed_by = e.id
      WHERE jsh.job_id = ?
      ORDER BY jsh.changed_at DESC
    `;
    const [statusHistory] = await connection.execute(statusHistoryQuery, [jobId]);
    
    // Transform the job data
    const transformedJob = {
      id: job.id,
      business_id: job.business_id,
      customer_id: job.customer_id,
      estimate_id: job.estimate_id,
      assigned_employee_id: job.assigned_employee_id,
      title: job.title,
      description: job.description,
      scheduled_date: job.scheduled_date,
      completion_date: job.completion_date,
      status: job.status,
      total_cost: job.total_cost,
      created_at: job.created_at,
      updated_at: job.updated_at,
      customer: job.customer_name ? {
        id: job.customer_id,
        name: job.customer_name,
        email: job.customer_email,
        phone: job.customer_phone,
        address: job.customer_address,
        city: job.customer_city,
        state: job.customer_state,
        zip_code: job.customer_zip_code
      } : null,
      employee: job.employee_first_name ? {
        id: job.assigned_employee_id,
        first_name: job.employee_first_name,
        last_name: job.employee_last_name,
        email: job.employee_email,
        phone: job.employee_phone,
        job_title: job.employee_job_title
      } : null,
      estimate: job.estimate_title ? {
        id: job.estimate_id,
        title: job.estimate_title,
        amount: job.estimate_amount,
        status: job.estimate_status
      } : null,
      items: items.map(item => ({
        id: item.id,
        job_id: item.job_id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        base_price: item.base_price,
        difficulty: item.difficulty,
        estimated_time: item.estimated_time,
        created_at: item.created_at
      })),
      photos: photos.map(photo => ({
        id: photo.id,
        job_id: photo.job_id,
        photo_type: photo.photo_type,
        photo_url: photo.photo_url,
        caption: photo.caption,
        uploaded_at: photo.uploaded_at
      })),
      notes: notes.map(note => ({
        id: note.id,
        job_id: note.job_id,
        employee_id: note.employee_id,
        note_type: note.note_type,
        content: note.content,
        is_important: note.is_important,
        created_at: note.created_at,
        employee_name: note.employee_first_name ? `${note.employee_first_name} ${note.employee_last_name}` : null
      })),
      status_history: statusHistory.map(history => ({
        id: history.id,
        job_id: history.job_id,
        old_status: history.old_status,
        new_status: history.new_status,
        changed_by: history.changed_by,
        notes: history.notes,
        changed_at: history.changed_at,
        employee_name: history.employee_first_name ? `${history.employee_first_name} ${history.employee_last_name}` : null
      }))
    };
    
    const response = createResponse(true, { job: transformedJob });
    res.json(response);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json(createResponse(false, null, 'Failed to fetch job', 'INTERNAL_ERROR'));
  }
};

// POST /jobs - Create new job
const createJob = async (req, res) => {
  try {
    const connection = await getConnection();
    const businessId = getBusinessIdFromToken(req);
    
    const {
      customer_id,
      estimate_id,
      assigned_employee_id,
      title,
      description,
      scheduled_date,
      total_cost
    } = req.body;
    
    // Validate required fields
    if (!customer_id || !title || !scheduled_date) {
      return res.status(400).json(createResponse(false, null, 'Missing required fields', 'VALIDATION_ERROR'));
    }
    
    // Insert job
    const insertQuery = `
      INSERT INTO jobs (
        business_id, customer_id, estimate_id, assigned_employee_id,
        title, description, scheduled_date, total_cost, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
    `;
    
    const [result] = await connection.execute(insertQuery, [
      businessId,
      customer_id,
      estimate_id || null,
      assigned_employee_id || null,
      title,
      description || null,
      scheduled_date,
      total_cost || null
    ]);
    
    const jobId = result.insertId;
    
    // Insert initial status history
    const statusHistoryQuery = `
      INSERT INTO job_status_history (job_id, old_status, new_status, notes)
      VALUES (?, NULL, 'scheduled', 'Job created')
    `;
    await connection.execute(statusHistoryQuery, [jobId]);
    
    // Get the created job
    const getJobQuery = `
      SELECT * FROM jobs WHERE id = ?
    `;
    const [jobs] = await connection.execute(getJobQuery, [jobId]);
    
    const response = createResponse(true, { job: jobs[0] }, 'Job created successfully');
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json(createResponse(false, null, 'Failed to create job', 'INTERNAL_ERROR'));
  }
};

// PUT /jobs/:id - Update job
const updateJob = async (req, res) => {
  try {
    const connection = await getConnection();
    const businessId = getBusinessIdFromToken(req);
    const jobId = req.params.id;
    
    const {
      customer_id,
      estimate_id,
      assigned_employee_id,
      title,
      description,
      scheduled_date,
      completion_date,
      status,
      total_cost
    } = req.body;
    
    // Get current job to check if status changed
    const getCurrentJobQuery = `
      SELECT status FROM jobs WHERE id = ? AND business_id = ?
    `;
    const [currentJobs] = await connection.execute(getCurrentJobQuery, [jobId, businessId]);
    
    if (currentJobs.length === 0) {
      return res.status(404).json(createResponse(false, null, 'Job not found', 'NOT_FOUND'));
    }
    
    const currentStatus = currentJobs[0].status;
    
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    
    if (customer_id !== undefined) {
      updateFields.push('customer_id = ?');
      updateValues.push(customer_id);
    }
    if (estimate_id !== undefined) {
      updateFields.push('estimate_id = ?');
      updateValues.push(estimate_id);
    }
    if (assigned_employee_id !== undefined) {
      updateFields.push('assigned_employee_id = ?');
      updateValues.push(assigned_employee_id);
    }
    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (scheduled_date !== undefined) {
      updateFields.push('scheduled_date = ?');
      updateValues.push(scheduled_date);
    }
    if (completion_date !== undefined) {
      updateFields.push('completion_date = ?');
      updateValues.push(completion_date);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (total_cost !== undefined) {
      updateFields.push('total_cost = ?');
      updateValues.push(total_cost);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json(createResponse(false, null, 'No fields to update', 'VALIDATION_ERROR'));
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(jobId, businessId);
    
    const updateQuery = `
      UPDATE jobs 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND business_id = ?
    `;
    
    await connection.execute(updateQuery, updateValues);
    
    // If status changed, add to status history
    if (status && status !== currentStatus) {
      const statusHistoryQuery = `
        INSERT INTO job_status_history (job_id, old_status, new_status, notes)
        VALUES (?, ?, ?, 'Status updated')
      `;
      await connection.execute(statusHistoryQuery, [jobId, currentStatus, status]);
    }
    
    // Get updated job
    const getJobQuery = `
      SELECT * FROM jobs WHERE id = ? AND business_id = ?
    `;
    const [jobs] = await connection.execute(getJobQuery, [jobId, businessId]);
    
    const response = createResponse(true, { job: jobs[0] }, 'Job updated successfully');
    res.json(response);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json(createResponse(false, null, 'Failed to update job', 'INTERNAL_ERROR'));
  }
};

// DELETE /jobs/:id - Delete job
const deleteJob = async (req, res) => {
  try {
    const connection = await getConnection();
    const businessId = getBusinessIdFromToken(req);
    const jobId = req.params.id;
    
    // Check if job exists
    const checkQuery = `
      SELECT id FROM jobs WHERE id = ? AND business_id = ?
    `;
    const [jobs] = await connection.execute(checkQuery, [jobId, businessId]);
    
    if (jobs.length === 0) {
      return res.status(404).json(createResponse(false, null, 'Job not found', 'NOT_FOUND'));
    }
    
    // Delete job (cascade will handle related records)
    const deleteQuery = `
      DELETE FROM jobs WHERE id = ? AND business_id = ?
    `;
    await connection.execute(deleteQuery, [jobId, businessId]);
    
    const response = createResponse(true, null, 'Job deleted successfully');
    res.json(response);
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json(createResponse(false, null, 'Failed to delete job', 'INTERNAL_ERROR'));
  }
};

// GET /jobs/stats - Get job statistics
const getJobStats = async (req, res) => {
  try {
    const connection = await getConnection();
    const businessId = getBusinessIdFromToken(req);
    
    // Get basic job counts
    const statsQuery = `
      SELECT 
        COUNT(*) as total_jobs,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled_jobs,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_jobs,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_jobs,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_jobs,
        SUM(COALESCE(total_cost, 0)) as total_revenue,
        AVG(COALESCE(total_cost, 0)) as average_job_value,
        SUM(CASE WHEN DATE(scheduled_date) = CURDATE() THEN 1 ELSE 0 END) as jobs_today,
        SUM(CASE WHEN DATE(scheduled_date) = CURDATE() AND status = 'scheduled' THEN 1 ELSE 0 END) as scheduled_today
      FROM jobs 
      WHERE business_id = ?
    `;
    
    const [stats] = await connection.execute(statsQuery, [businessId]);
    const result = stats[0];
    
    const response = createResponse(true, {
      stats: {
        total_jobs: result.total_jobs,
        scheduled_jobs: result.scheduled_jobs,
        in_progress_jobs: result.in_progress_jobs,
        completed_jobs: result.completed_jobs,
        cancelled_jobs: result.cancelled_jobs,
        total_revenue: parseFloat(result.total_revenue) || 0,
        average_job_value: parseFloat(result.average_job_value) || 0,
        jobs_today: result.jobs_today,
        scheduled_today: result.scheduled_today
      }
    });
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json(createResponse(false, null, 'Failed to fetch job statistics', 'INTERNAL_ERROR'));
  }
};

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getJobStats
};
