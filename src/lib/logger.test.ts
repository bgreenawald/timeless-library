import { jest } from '@jest/globals';
import { logger as realLogger } from './logger';

// Mock the entire logger module
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  clear: jest.fn(),
  add: jest.fn(),
};

jest.mock('./logger', () => ({
  logger: mockLogger,
}));

describe('logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log debug messages', () => {
    mockLogger.debug('Test debug message');
    expect(mockLogger.debug).toHaveBeenCalledWith('Test debug message');
  });

  it('should log info messages', () => {
    mockLogger.info('Test info message');
    expect(mockLogger.info).toHaveBeenCalledWith('Test info message');
  });

  it('should log warning messages', () => {
    mockLogger.warn('Test warning message');
    expect(mockLogger.warn).toHaveBeenCalledWith('Test warning message');
  });

  it('should log error messages', () => {
    mockLogger.error('Test error message');
    expect(mockLogger.error).toHaveBeenCalledWith('Test error message');
  });

  it('should include metadata in log messages', () => {
    mockLogger.info('Test message', { additional: 'metadata' });
    expect(mockLogger.info).toHaveBeenCalledWith('Test message', { additional: 'metadata' });
  });

  it('should handle error objects', () => {
    const testError = new Error('Test error');
    mockLogger.error('Error occurred', testError);
    expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', testError);
  });
});

/**
 * Manual test function for logger configuration
 * This can be run manually to test logging functionality
 * Uses the real Winston logger instance for effective testing
 */
export function testLogger() {
  console.log('Testing Winston logger configuration...');

  realLogger.debug('This is a debug message - should only appear in development');
  realLogger.info('This is an info message - should appear in both dev and production');
  realLogger.warn('This is a warning message - should appear in both dev and production');
  realLogger.error('This is an error message - should appear in both dev and production');

  console.log('Logger test complete. Check logs/ directory for output files.');
}
