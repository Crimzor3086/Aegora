/**
 * Error types for different scenarios
 */
export const ErrorType = {
  NETWORK: 'NETWORK_ERROR',
  API: 'API_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTH_ERROR',
  SMART_CONTRACT: 'CONTRACT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * Maps HTTP status codes to user-friendly messages
 */
const statusMessages = {
  400: 'Invalid request. Please check your input.',
  401: 'Please login to continue.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  422: 'Invalid input data.',
  429: 'Too many requests. Please try again later.',
  500: 'Server error. Please try again later.',
  502: 'Service temporarily unavailable.',
  503: 'Service unavailable. Please try again later.'
};

/**
 * Handles API response errors and returns appropriate error message and type
 * @param {Error|Response} error - The error object from catch block or Response object
 * @returns {{ message: string, type: string, details?: any }}
 */
export const handleApiError = async (error) => {
  // Handle network errors (no response)
  if (error instanceof Error && !('status' in error)) {
    return {
      type: ErrorType.NETWORK,
      message: 'Unable to connect to the server. Please check your internet connection.',
      details: error.message
    };
  }

  try {
    // Handle API errors with response
    if (error instanceof Response) {
      const contentType = error.headers.get('content-type');
      let errorData = {};

      // Parse response body based on content type
      if (contentType?.includes('application/json')) {
        errorData = await error.json();
      } else {
        errorData = { message: await error.text() };
      }

      return {
        type: ErrorType.API,
        message: errorData.message || statusMessages[error.status] || 'An unexpected error occurred.',
        details: errorData
      };
    }
  } catch (e) {
    // Handle parse errors
    return {
      type: ErrorType.UNKNOWN,
      message: 'An unexpected error occurred while processing the response.',
      details: e.message
    };
  }

  // Fallback for unknown errors
  return {
    type: ErrorType.UNKNOWN,
    message: 'An unexpected error occurred.',
    details: error
  };
};

/**
 * Validates smart contract interaction errors
 * @param {Error} error - The error from contract interaction
 * @returns {{ message: string, type: string, details?: any }}
 */
export const handleContractError = (error) => {
  // Common MetaMask/web3 error messages
  if (error.code === 4001) {
    return {
      type: ErrorType.SMART_CONTRACT,
      message: 'Transaction rejected. Please confirm the transaction in your wallet.',
      details: error
    };
  }

  if (error.message?.includes('insufficient funds')) {
    return {
      type: ErrorType.SMART_CONTRACT,
      message: 'Insufficient funds to complete this transaction.',
      details: error
    };
  }

  // Handle other contract errors
  return {
    type: ErrorType.SMART_CONTRACT,
    message: 'Failed to interact with the smart contract. Please try again.',
    details: error
  };
};

/**
 * Validates form input and returns validation errors
 * @param {Object} data - The form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result
 */
export const validateFormInput = (data, rules) => {
  const errors = {};

  for (const [field, value] of Object.entries(data)) {
    if (rules[field]?.required && !value) {
      errors[field] = `${field} is required`;
    }
    
    if (rules[field]?.min && value < rules[field].min) {
      errors[field] = `${field} must be at least ${rules[field].min}`;
    }

    if (rules[field]?.max && value > rules[field].max) {
      errors[field] = `${field} must be less than ${rules[field].max}`;
    }

    if (rules[field]?.pattern && !rules[field].pattern.test(value)) {
      errors[field] = `${field} format is invalid`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};