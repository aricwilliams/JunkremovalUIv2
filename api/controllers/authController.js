const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Generate JWT token
const generateToken = (businessId, username) => {
  return jwt.sign(
    { businessId, username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Remove sensitive data from business object
const sanitizeBusiness = (business) => {
  const { password_hash, ...sanitized } = business;
  return sanitized;
};

// Business Signup
const signup = async (req, res) => {
  try {
    const {
      business_name,
      business_phone,
      business_address,
      business_city,
      business_state,
      business_zip_code,
      owner_first_name,
      owner_last_name,
      owner_email,
      owner_phone,
      username,
      password,
      license_number,
      insurance_number,
      service_radius,
      number_of_trucks,
      years_in_business
    } = req.body;

    // Check if business already exists
    const [existingBusiness] = await pool.execute(
      'SELECT id FROM businesses WHERE username = ? OR owner_email = ?',
      [username, owner_email]
    );

    if (existingBusiness.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Business already exists with this email or username',
        error: 'BUSINESS_EXISTS'
      });
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new business
    const [result] = await pool.execute(
      `INSERT INTO businesses (
        business_name, business_phone, business_address, business_city, business_state, business_zip_code,
        owner_first_name, owner_last_name, owner_email, owner_phone,
        username, password_hash, license_number, insurance_number, service_radius, number_of_trucks, years_in_business
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        business_name, business_phone, business_address, business_city, business_state, business_zip_code,
        owner_first_name, owner_last_name, owner_email, owner_phone,
        username, password_hash, license_number || null, insurance_number || null, service_radius || null, number_of_trucks || 0, years_in_business || null
      ]
    );

    // Get the created business
    const [businessRows] = await pool.execute(
      'SELECT * FROM businesses WHERE id = ?',
      [result.insertId]
    );

    const business = businessRows[0];
    const token = generateToken(business.id, business.username);

    res.status(201).json({
      success: true,
      message: 'Business registered successfully',
      data: {
        business: sanitizeBusiness(business),
        token
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
};

// Business Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find business by username
    const [businessRows] = await pool.execute(
      'SELECT * FROM businesses WHERE username = ?',
      [username]
    );

    if (businessRows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS'
      });
    }

    const business = businessRows[0];

    // Check if business is active
    if (business.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active',
        error: 'ACCOUNT_INACTIVE'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, business.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login
    await pool.execute(
      'UPDATE businesses SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [business.id]
    );

    const token = generateToken(business.id, business.username);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        business: sanitizeBusiness(business),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
};

// Get Business Profile
const getProfile = async (req, res) => {
  try {
    const businessId = req.business.id;

    const [businessRows] = await pool.execute(
      'SELECT * FROM businesses WHERE id = ?',
      [businessId]
    );

    if (businessRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
        error: 'BUSINESS_NOT_FOUND'
      });
    }

    const business = businessRows[0];

    res.status(200).json({
      success: true,
      data: {
        business: sanitizeBusiness(business)
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
};

// Update Business Profile
const updateProfile = async (req, res) => {
  try {
    const businessId = req.business.id;
    const updateData = req.body;

    // Build dynamic update query
    const allowedFields = [
      'business_name', 'business_phone', 'business_address', 'business_city', 'business_state', 'business_zip_code',
      'owner_first_name', 'owner_last_name', 'owner_email', 'owner_phone',
      'license_number', 'insurance_number', 'service_radius', 'number_of_trucks', 'years_in_business'
    ];

    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
        error: 'NO_UPDATE_FIELDS'
      });
    }

    // Check if email is being updated and if it's already taken
    if (updateData.owner_email) {
      const [existingBusiness] = await pool.execute(
        'SELECT id FROM businesses WHERE owner_email = ? AND id != ?',
        [updateData.owner_email, businessId]
      );

      if (existingBusiness.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
          error: 'EMAIL_EXISTS'
        });
      }
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(businessId);

    const updateQuery = `UPDATE businesses SET ${updateFields.join(', ')} WHERE id = ?`;
    
    await pool.execute(updateQuery, updateValues);

    // Get updated business
    const [businessRows] = await pool.execute(
      'SELECT * FROM businesses WHERE id = ?',
      [businessId]
    );

    const business = businessRows[0];

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        business: sanitizeBusiness(business)
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile
};
