import { parseMetadata } from '../metadata';

describe('metadata', () => {
  describe('parseMetadata', () => {
    const validMetadata = {
      metadata_version: '0.0',
      run_timestamp: '2024-01-01T00:00:00Z',
      book_name: 'Test Book',
      author_name: 'Test Author',
      input_file: 'input.md',
      original_file: 'original.md',
      output_directory: './output',
      book_version: 'v1.0.0',
      phases: [
        {
          phase_name: 'test_phase',
          phase_index: 0,
          phase_type: 'modernization',
          enabled: true,
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

      expect(() => parseMetadata(metadataJson)).toThrow('book_name: Required');
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
        "Phase 'phase_index' must match array index"
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

      expect(() => parseMetadata(metadataJson)).toThrow('phases.0.model.name: Required');
    });
  });

  describe('parseMetadata - v1.0', () => {
    const validMetadataV1WithRegularPhases = {
      metadata_version: '1.0',
      run_timestamp: '2024-01-01T00:00:00Z',
      book_id: 'test_book',
      book_name: 'Test Book',
      author_name: 'Test Author',
      input_file: 'input.md',
      original_file: 'original.md',
      output_directory: './output',
      book_version: 'v1.0.0',
      phases: [
        {
          phase_name: 'test_phase',
          phase_index: 0,
          phase_type: 'modernization',
          enabled: true,
          post_processors: ['test_processor'],
          post_processor_count: 1,
          completed: true,
          book_id: 'test_book',
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
          system_prompt_path: null,
          user_prompt_path: null,
          fully_rendered_system_prompt: 'System prompt content',
          output_exists: true,
        },
      ],
    };

    const validMetadataV1WithTwoStagePhase = {
      metadata_version: '1.0',
      run_timestamp: '2024-01-01T00:00:00Z',
      book_id: 'test_book',
      book_name: 'Test Book',
      author_name: 'Test Author',
      input_file: 'input.md',
      original_file: 'original.md',
      output_directory: './output',
      book_version: 'v1.0.0',
      phases: [
        {
          phase_name: 'final_two_stage',
          phase_index: 0,
          phase_type: 'FINAL_TWO_STAGE',
          enabled: true,
          post_processors: ['validate_non_empty_section'],
          post_processor_count: 1,
          completed: true,
          book_id: 'test_book',
          book_name: 'Test Book',
          author_name: 'Test Author',
          identify_model_type: 'gemini-3-flash-preview',
          identify_provider: 'gemini',
          identify_provider_model_name: 'gemini-3-flash-preview',
          identify_model: {
            id: 'gemini-3-flash-preview',
            name: 'gemini-3-flash-preview',
          },
          implement_model_type: 'gemini-3-flash-preview',
          implement_provider: 'gemini',
          implement_provider_model_name: 'gemini-3-flash-preview',
          implement_model: {
            id: 'gemini-3-flash-preview',
            name: 'gemini-3-flash-preview',
          },
          max_workers: 3,
          input_file: 'input.md',
          output_file: 'output.md',
          system_prompt_path: null,
          user_prompt_path: null,
          fully_rendered_system_prompt:
            '[IDENTIFY STAGE]\n# Final Identify\n\n[IMPLEMENT STAGE]\n# Final Implement',
          output_exists: true,
        },
      ],
    };

    it('should parse valid v1.0 metadata with regular phases successfully', () => {
      const metadataJson = JSON.stringify(validMetadataV1WithRegularPhases);

      const result = parseMetadata(metadataJson);

      expect(result).toEqual(validMetadataV1WithRegularPhases);
      expect(result.metadata_version).toBe('1.0');
    });

    it('should parse valid v1.0 metadata with two-stage final phase successfully', () => {
      const metadataJson = JSON.stringify(validMetadataV1WithTwoStagePhase);

      const result = parseMetadata(metadataJson);

      expect(result).toEqual(validMetadataV1WithTwoStagePhase);
      expect(result.metadata_version).toBe('1.0');
      const phase = result.phases[0];
      if (phase.phase_type === 'FINAL_TWO_STAGE') {
        expect((phase as any).identify_model).toBeDefined();
        expect((phase as any).implement_model).toBeDefined();
      }
    });

    it('should parse v1.0 metadata with mixed phase types', () => {
      const mixedMetadata = {
        ...validMetadataV1WithRegularPhases,
        phases: [
          validMetadataV1WithRegularPhases.phases[0],
          {
            ...validMetadataV1WithTwoStagePhase.phases[0],
            phase_index: 1,
          },
        ],
      };
      const metadataJson = JSON.stringify(mixedMetadata);

      const result = parseMetadata(metadataJson);

      expect(result.phases).toHaveLength(2);
      expect(result.phases[0].phase_type).toBe('modernization');
      expect(result.phases[1].phase_type).toBe('FINAL_TWO_STAGE');
    });

    it('should throw error for v1.0 metadata missing book_id', () => {
      const { book_id, ...metadataWithoutBookId } = validMetadataV1WithRegularPhases;
      const metadataJson = JSON.stringify(metadataWithoutBookId);

      expect(() => parseMetadata(metadataJson)).toThrow('book_id: Required');
    });

    it('should validate nullable system_prompt_path and user_prompt_path in v1.0', () => {
      const metadataWithNullPaths = {
        ...validMetadataV1WithRegularPhases,
        phases: [
          {
            ...validMetadataV1WithRegularPhases.phases[0],
            system_prompt_path: null,
            user_prompt_path: null,
          },
        ],
      };
      const metadataJson = JSON.stringify(metadataWithNullPaths);

      const result = parseMetadata(metadataJson);

      expect(result.phases[0].system_prompt_path).toBeNull();
      expect(result.phases[0].user_prompt_path).toBeNull();
    });

    it('should throw error for two-stage phase missing identify fields', () => {
      const invalidTwoStageMetadata = {
        ...validMetadataV1WithTwoStagePhase,
        phases: [
          {
            ...validMetadataV1WithTwoStagePhase.phases[0],
            // Missing identify_model and other identify fields
            identify_model: undefined,
            identify_model_type: undefined,
            identify_provider: undefined,
            identify_provider_model_name: undefined,
          },
        ],
      };
      const metadataJson = JSON.stringify(invalidTwoStageMetadata);

      expect(() => parseMetadata(metadataJson)).toThrow();
    });
  });
});
