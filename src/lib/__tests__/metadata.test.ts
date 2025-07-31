import { parseMetadata } from '../metadata';

describe('metadata', () => {
  describe('parseMetadata', () => {
    const validMetadata = {
      metadata_version: '0.0.0-alpha',
      run_timestamp: '2024-01-01T00:00:00Z',
      book_name: 'Test Book',
      author_name: 'Test Author',
      input_file: 'input.md',
      original_file: 'original.md',
      output_directory: './output',
      book_version: 'v1.0.0',
      length_reduction: [0.1, 0.2],
      phases: [
        {
          phase_name: 'test_phase',
          phase_index: 0,
          phase_type: 'modernization',
          enabled: true,
          temperature: 0.7,
          post_processors: ['test_processor'],
          post_processor_count: 1,
          completed: true,
          book_name: 'Test Book',
          author_name: 'Test Author',
          model_type: 'gpt-4',
          model: {
            id: 'gpt-4',
            name: 'GPT-4',
          },
          max_workers: 4,
          input_file: 'input.md',
          output_file: 'output.md',
          system_prompt_path: 'system.txt',
          user_prompt_path: 'user.txt',
          fully_rendered_system_prompt: 'System prompt content',
          length_reduction_parameter: [0.1],
          output_exists: true,
        },
      ],
    };

    it('should parse valid metadata successfully', () => {
      const metadataJson = JSON.stringify(validMetadata);

      const result = parseMetadata(metadataJson);

      expect(result).toEqual(validMetadata);
    });

    it('should throw error for invalid JSON', () => {
      const invalidJson = 'invalid json content';

      expect(() => parseMetadata(invalidJson)).toThrow('Failed to parse metadata JSON');
    });

    it('should throw error for missing version', () => {
      const { metadata_version, ...metadataWithoutVersion } = validMetadata;
      const metadataJson = JSON.stringify(metadataWithoutVersion);

      expect(() => parseMetadata(metadataJson)).toThrow(
        'Metadata file missing version information'
      );
    });

    it('should throw error for unsupported version', () => {
      const metadataWithUnsupportedVersion = {
        ...validMetadata,
        metadata_version: '999.0.0',
      };
      const metadataJson = JSON.stringify(metadataWithUnsupportedVersion);

      expect(() => parseMetadata(metadataJson)).toThrow('Unsupported metadata version: 999.0.0');
    });

    it('should throw error for missing required fields', () => {
      const { book_name, ...metadataWithoutBookName } = validMetadata;
      const metadataJson = JSON.stringify(metadataWithoutBookName);

      expect(() => parseMetadata(metadataJson)).toThrow(
        "Missing or invalid string field 'book_name'"
      );
    });

    it('should throw error for empty phases array', () => {
      const metadataWithEmptyPhases = {
        ...validMetadata,
        phases: [],
      };
      const metadataJson = JSON.stringify(metadataWithEmptyPhases);

      expect(() => parseMetadata(metadataJson)).toThrow("'phases' array cannot be empty");
    });

    it('should throw error for invalid phase structure', () => {
      const metadataWithInvalidPhase = {
        ...validMetadata,
        phases: [
          {
            ...validMetadata.phases[0],
            phase_index: 999, // Wrong index
          },
        ],
      };
      const metadataJson = JSON.stringify(metadataWithInvalidPhase);

      expect(() => parseMetadata(metadataJson)).toThrow(
        "'phase_index' (999) does not match array index (0)"
      );
    });

    it('should throw error for invalid model structure', () => {
      const metadataWithInvalidModel = {
        ...validMetadata,
        phases: [
          {
            ...validMetadata.phases[0],
            model: { id: 'test' }, // Missing name
          },
        ],
      };
      const metadataJson = JSON.stringify(metadataWithInvalidModel);

      expect(() => parseMetadata(metadataJson)).toThrow("model missing or invalid 'name' field");
    });
  });
});
