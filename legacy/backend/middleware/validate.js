/**
 * Validation Middleware
 * Uses Zod schemas to validate request data
 */

const { ZodError } = require('zod');

/**
 * Middleware factory for validating request body
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 */
function validateBody(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          message: error.errors[0].message,
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
}

/**
 * Middleware factory for validating query parameters
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 */
function validateQuery(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          message: error.errors[0].message,
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
}

/**
 * Middleware factory for validating URL parameters
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 */
function validateParams(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          message: error.errors[0].message,
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
}

module.exports = {
  validateBody,
  validateQuery,
  validateParams
};
