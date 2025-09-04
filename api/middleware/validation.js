const Joi = require('joi');

// Password validation schema
const passwordSchema = Joi.string()
  .min(8)
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
  .required()
  .messages({
    'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)',
    'string.min': 'Password must be at least 8 characters long'
  });

// Business signup validation schema
const businessSignupSchema = Joi.object({
  business_name: Joi.string().min(2).max(255).required(),
  business_phone: Joi.string().min(10).max(20).required(),
  business_address: Joi.string().min(5).max(255).required(),
  business_city: Joi.string().min(2).max(100).required(),
  business_state: Joi.string().length(2).uppercase().required(),
  business_zip_code: Joi.string().min(5).max(10).required(),
  owner_first_name: Joi.string().min(2).max(100).required(),
  owner_last_name: Joi.string().min(2).max(100).required(),
  owner_email: Joi.string().email().required(),
  owner_phone: Joi.string().min(10).max(20).required(),
  username: Joi.string().alphanum().min(3).max(50).required(),
  password: passwordSchema,
  license_number: Joi.string().max(100).optional().allow(''),
  insurance_number: Joi.string().max(100).optional().allow(''),
  service_radius: Joi.number().integer().min(1).max(500).optional(),
  number_of_trucks: Joi.number().integer().min(0).max(100).optional(),
  years_in_business: Joi.number().integer().min(0).max(100).optional()
});

// Business login validation schema
const businessLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

// Business profile update validation schema
const businessUpdateSchema = Joi.object({
  business_name: Joi.string().min(2).max(255).optional(),
  business_phone: Joi.string().min(10).max(20).optional(),
  business_address: Joi.string().min(5).max(255).optional(),
  business_city: Joi.string().min(2).max(100).optional(),
  business_state: Joi.string().length(2).uppercase().optional(),
  business_zip_code: Joi.string().min(5).max(10).optional(),
  owner_first_name: Joi.string().min(2).max(100).optional(),
  owner_last_name: Joi.string().min(2).max(100).optional(),
  owner_email: Joi.string().email().optional(),
  owner_phone: Joi.string().min(10).max(20).optional(),
  license_number: Joi.string().max(100).optional().allow(''),
  insurance_number: Joi.string().max(100).optional().allow(''),
  service_radius: Joi.number().integer().min(1).max(500).optional(),
  number_of_trucks: Joi.number().integer().min(0).max(100).optional(),
  years_in_business: Joi.number().integer().min(0).max(100).optional()
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    req.body = value;
    next();
  };
};

module.exports = {
  validate,
  businessSignupSchema,
  businessLoginSchema,
  businessUpdateSchema
};
