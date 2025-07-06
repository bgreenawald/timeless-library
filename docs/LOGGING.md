# Logging Configuration

This project uses Winston for structured logging with different configurations for development and production environments.

## Configuration

The logging is configured in `src/lib/logger.ts` with the following setup:

### Development Environment
- **Log Level**: `debug` (shows all logs including debug messages)
- **Output**: Console (colored) + File logs
- **Files**: 
  - `logs/error.log` - Error level logs only
  - `logs/combined.log` - All logs (debug, info, warn, error)

### Production Environment  
- **Log Level**: `info` (debug logs are disabled)
- **Output**: File logs only (no console output)
- **Files**:
  - `logs/error.log` - Error level logs only
  - `logs/combined.log` - Info, warn, and error logs

## Usage

```typescript
import { logger } from './logger';

// Debug logs (only shown in development)
logger.debug('Debug information');

// Info logs (shown in both development and production)
logger.info('General information');

// Warning logs
logger.warn('Warning message');

// Error logs
logger.error('Error message', { additional: 'context' });
```

## Log Files

- **`logs/error.log`**: Contains only error-level logs for quick error monitoring
- **`logs/combined.log`**: Contains all logs for comprehensive debugging

## Environment Variables

The log level is automatically determined based on `NODE_ENV`:
- `NODE_ENV=development` → Debug level logging
- `NODE_ENV=production` → Info level logging

## File Rotation

For production deployments, consider adding log rotation using Winston's built-in rotation or external tools like `logrotate`.

## Migration from console.log

All `console.log` and `console.error` statements in the codebase have been replaced with appropriate Winston logger calls:

- `console.log()` → `logger.debug()` or `logger.info()`
- `console.error()` → `logger.error()`
- `console.warn()` → `logger.warn()`

This ensures consistent logging across the application and proper log level management in different environments. 