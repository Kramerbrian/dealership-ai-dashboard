const Joi = require('joi');

/**
 * Validation schemas
 */
const schemas = {
  dealershipId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Dealership ID must be a valid ObjectId'
    }),

  analyticsQuery: Joi.object({
    startDate: Joi.date()
      .iso()
      .messages({
        'date.format': 'Start date must be in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)'
      }),
    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .messages({
        'date.format': 'End date must be in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)',
        'date.min': 'End date must be after start date'
      }),
    metrics: Joi.array()
      .items(Joi.string().valid('visibility', 'reviews', 'competitors', 'revenue'))
      .default(['visibility', 'reviews']),
    platforms: Joi.array()
      .items(Joi.string().valid('Google', 'ChatGPT', 'Perplexity', 'Gemini', 'Yelp', 'DealerRater'))
      .default(['Google', 'ChatGPT', 'Perplexity'])
  }),

  reportRequest: Joi.object({
    dealershipIds: Joi.array()
      .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one dealership ID is required',
        'string.pattern.base': 'Each dealership ID must be a valid ObjectId'
      }),
    reportType: Joi.string()
      .valid('summary', 'detailed', 'competitor', 'review')
      .default('summary'),
    format: Joi.string()
      .valid('json', 'csv', 'pdf')
      .default('json'),
    includeCharts: Joi.boolean().default(false)
  })
};

/**
 * Middleware to validate analytics request parameters
 */
const validateAnalyticsRequest = (req, res, next) => {
  const { error, value } = schemas.analyticsQuery.validate(req.query);

  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Add validated and sanitized values to request
  req.query = value;
  next();
};

/**
 * Middleware to validate dealership ID parameter
 */
const validateDealershipId = (req, res, next) => {
  const { error, value } = schemas.dealershipId.validate(req.params.dealershipId);

  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  req.params.dealershipId = value;
  next();
};

/**
 * Middleware to validate report generation request
 */
const validateReportRequest = (req, res, next) => {
  const { error, value } = schemas.reportRequest.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  req.body = value;
  next();
};

/**
 * Sanitize and validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.min': 'Page must be greater than 0'
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .messages({
        'number.min': 'Limit must be greater than 0',
        'number.max': 'Limit cannot exceed 100'
      }),
    sortBy: Joi.string()
      .valid('date', 'score', 'revenue', 'rating')
      .default('date'),
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
  });

  const { error, value } = schema.validate(req.query);

  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  req.query = { ...req.query, ...value };
  next();
};

module.exports = {
  validateAnalyticsRequest,
  validateDealershipId,
  validateReportRequest,
  validatePagination,
  schemas
};