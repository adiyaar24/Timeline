import { formatTime, processAuditData } from './timeUtils';

describe('timeUtils', () => {
  beforeEach(() => {
    // Mock Date.now to return a consistent timestamp for testing
    jest.spyOn(Date, 'now').mockReturnValue(1764700000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('formatTime', () => {
    it('should format time correctly for recent timestamps', () => {
      const result = formatTime(1764699940000); // 1 minute ago
      expect(result.relative).toBe('1m ago');
      expect(result.date).toBeDefined();
      expect(result.time).toBeDefined();
    });

    it('should format time for hours ago', () => {
      const result = formatTime(1764696400000); // 1 hour ago  
      expect(result.relative).toBe('1h ago');
    });

    it('should format time for days ago', () => {
      const result = formatTime(1764613600000); // 1 day ago
      expect(result.relative).toBe('1d ago');
    });

    it('should format time for seconds ago', () => {
      const result = formatTime(1764699970000); // 30 seconds ago
      expect(result.relative).toBe('30s ago');
    });

    it('should handle zero difference', () => {
      const result = formatTime(1764700000000); // exactly now
      expect(result.relative).toBe('0s ago');
    });
  });

  describe('processAuditData', () => {
    it('should process valid audit data', () => {
      const auditData = {
        "1764697221059": {
          action: 'create',
          config: {
            resource_name: 'test-resource',
            type: 's3'
          }
        },
        "1764698174772": {
          action: 'update',
          config: {
            resource_name: 'test-resource',
            type: 's3'
          }
        }
      };

      const result = processAuditData(auditData);
      
      expect(result).toHaveLength(2);
      expect(result[0].action).toBe('update'); // newest first
      expect(result[1].action).toBe('create'); // oldest last
      expect(result[0].timestampMs).toBeGreaterThan(result[1].timestampMs);
    });

    it('should return empty array for null data', () => {
      expect(processAuditData(null)).toEqual([]);
    });

    it('should return empty array for undefined data', () => {
      expect(processAuditData(undefined)).toEqual([]);
    });

    it('should return empty array for empty object', () => {
      expect(processAuditData({})).toEqual([]);
    });

    it('should return empty array for non-object data', () => {
      expect(processAuditData('string')).toEqual([]);
      expect(processAuditData(123)).toEqual([]);
      expect(processAuditData([])).toEqual([]);
    });

    it('should handle single audit entry', () => {
      const auditData = {
        "1764697221059": {
          action: 'create',
          config: {
            resource_name: 'single-resource'
          }
        }
      };

      const result = processAuditData(auditData);
      
      expect(result).toHaveLength(1);
      expect(result[0].action).toBe('create');
      expect(result[0].config.resource_name).toBe('single-resource');
      expect(result[0].formattedDate).toBeDefined();
      expect(result[0].relativeTime).toBeDefined();
    });
  });
});