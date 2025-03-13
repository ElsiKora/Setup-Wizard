import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClackCliInterface } from '../../../../src/infrastructure/service/clack-cli-interface.service';
import type { ICliInterfaceServiceSelectOptions } from '../../../../src/domain/interface/cli-interface-service-select-options.interface';

// Mock the @clack/prompts module
vi.mock('@clack/prompts', () => ({
  confirm: vi.fn(),
  groupMultiselect: vi.fn(),
  isCancel: vi.fn().mockImplementation((value) => value === Symbol.for('clack.cancel')),
  log: {
    error: vi.fn(),
    info: vi.fn(),
    message: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
  },
  multiselect: vi.fn(),
  note: vi.fn(),
  select: vi.fn(),
  spinner: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
  })),
  text: vi.fn(),
}));

// Mock process.exit
const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as any);

// Import all mock functions from the mocked module
import {
  confirm,
  groupMultiselect,
  isCancel,
  log,
  multiselect,
  note,
  select,
  spinner,
  text,
} from '@clack/prompts';

describe('ClackCliInterface', () => {
  let clackCliInterface: ClackCliInterface;
  let mockSpinnerInstance: { start: vi.Mock; stop: vi.Mock };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up mock spinner instance
    mockSpinnerInstance = {
      start: vi.fn(),
      stop: vi.fn(),
    };
    (spinner as unknown as vi.Mock).mockReturnValue(mockSpinnerInstance);
    
    // Create service instance
    clackCliInterface = new ClackCliInterface();
  });

  describe('clear', () => {
    it('should clear the console', () => {
      const consoleSpy = vi.spyOn(console, 'clear').mockImplementation(() => {});
      clackCliInterface.clear();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('confirm', () => {
    it('should return the result of the confirmation', async () => {
      (confirm as unknown as vi.Mock).mockResolvedValue(true);
      const result = await clackCliInterface.confirm('Are you sure?');
      expect(result).toBe(true);
      expect(confirm).toHaveBeenCalledWith({
        initialValue: false,
        message: 'Are you sure?',
      });
    });

    it('should use the provided default value', async () => {
      (confirm as unknown as vi.Mock).mockResolvedValue(true);
      const result = await clackCliInterface.confirm('Are you sure?', true);
      expect(result).toBe(true);
      expect(confirm).toHaveBeenCalledWith({
        initialValue: true,
        message: 'Are you sure?',
      });
    });

    it('should handle cancellation', async () => {
      // Mock isCancel to return true for the confirm result
      (confirm as unknown as vi.Mock).mockResolvedValue(Symbol.for('clack.cancel'));
      
      // Call confirm which should result in exit being called
      await clackCliInterface.confirm('Are you sure?');
      
      // Verify error was logged and exit was called
      expect(log.error).toHaveBeenCalledWith('Operation cancelled by user');
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  describe('error', () => {
    it('should log an error message', () => {
      clackCliInterface.error('Error message');
      expect(log.error).toHaveBeenCalledWith('Error message');
    });
  });

  describe('groupMultiselect', () => {
    it('should return the selected values', async () => {
      const options = {
        'Group 1': [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
        ],
        'Group 2': [
          { label: 'Option 3', value: 'option3' },
        ],
      };
      
      const selectedValues = ['option1', 'option3'];
      (groupMultiselect as unknown as vi.Mock).mockResolvedValue(selectedValues);
      
      const result = await clackCliInterface.groupMultiselect<string>('Select options', options);
      expect(result).toEqual(selectedValues);
      expect(groupMultiselect).toHaveBeenCalledWith({
        initialValues: undefined,
        message: 'Select options (space to select)',
        options,
        required: false,
      });
    });

    it('should handle required parameter', async () => {
      const options = {
        'Group': [
          { label: 'Option', value: 'option' },
        ],
      };
      
      (groupMultiselect as unknown as vi.Mock).mockResolvedValue(['option']);
      
      await clackCliInterface.groupMultiselect<string>('Select options', options, true);
      expect(groupMultiselect).toHaveBeenCalledWith(expect.objectContaining({
        required: true,
      }));
    });

    it('should handle initial values', async () => {
      const options = {
        'Group': [
          { label: 'Option', value: 'option' },
        ],
      };
      
      const initialValues = ['option'];
      (groupMultiselect as unknown as vi.Mock).mockResolvedValue(['option']);
      
      await clackCliInterface.groupMultiselect<string>('Select options', options, false, initialValues);
      expect(groupMultiselect).toHaveBeenCalledWith(expect.objectContaining({
        initialValues,
      }));
    });

    it('should handle cancellation', async () => {
      const options = {
        'Group': [
          { label: 'Option', value: 'option' },
        ],
      };
      
      (groupMultiselect as unknown as vi.Mock).mockResolvedValue(Symbol.for('clack.cancel'));
      
      await clackCliInterface.groupMultiselect<string>('Select options', options);
      expect(log.error).toHaveBeenCalledWith('Operation cancelled by user');
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  describe('handleError', () => {
    it('should log error message and details', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const error = new Error('Test error');
      
      clackCliInterface.handleError('Something went wrong', error);
      
      expect(log.error).toHaveBeenCalledWith('Something went wrong');
      expect(consoleSpy).toHaveBeenCalledWith(error);
      
      consoleSpy.mockRestore();
    });
  });

  describe('info', () => {
    it('should log an info message', () => {
      clackCliInterface.info('Info message');
      expect(log.info).toHaveBeenCalledWith('Info message');
    });
  });

  describe('log', () => {
    it('should log a regular message', () => {
      clackCliInterface.log('Regular message');
      expect(log.message).toHaveBeenCalledWith('Regular message');
    });
  });

  describe('multiselect', () => {
    it('should return the selected values', async () => {
      const options: ICliInterfaceServiceSelectOptions[] = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ];
      
      const selectedValues = ['option1', 'option2'];
      (multiselect as unknown as vi.Mock).mockResolvedValue(selectedValues);
      
      const result = await clackCliInterface.multiselect<string>('Select options', options);
      expect(result).toEqual(selectedValues);
      expect(multiselect).toHaveBeenCalledWith({
        initialValues: undefined,
        message: 'Select options (space to select)',
        options,
        required: false,
      });
    });

    it('should handle required parameter', async () => {
      const options: ICliInterfaceServiceSelectOptions[] = [
        { label: 'Option', value: 'option' },
      ];
      
      (multiselect as unknown as vi.Mock).mockResolvedValue(['option']);
      
      await clackCliInterface.multiselect<string>('Select options', options, true);
      expect(multiselect).toHaveBeenCalledWith(expect.objectContaining({
        required: true,
      }));
    });

    it('should handle cancellation', async () => {
      const options: ICliInterfaceServiceSelectOptions[] = [
        { label: 'Option', value: 'option' },
      ];
      
      (multiselect as unknown as vi.Mock).mockResolvedValue(Symbol.for('clack.cancel'));
      
      await clackCliInterface.multiselect<string>('Select options', options);
      expect(log.error).toHaveBeenCalledWith('Operation cancelled by user');
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  describe('note', () => {
    it('should display a note with title and message', () => {
      clackCliInterface.note('Title', 'Note message');
      expect(note).toHaveBeenCalledWith('Note message', 'Title');
    });
  });

  describe('select', () => {
    it('should return the selected value', async () => {
      const options: ICliInterfaceServiceSelectOptions[] = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ];
      
      (select as unknown as vi.Mock).mockResolvedValue('option1');
      
      const result = await clackCliInterface.select<string>('Select an option', options);
      expect(result).toBe('option1');
      expect(select).toHaveBeenCalledWith({
        initialValue: undefined,
        message: 'Select an option',
        options,
      });
    });

    it('should handle initial value', async () => {
      const options: ICliInterfaceServiceSelectOptions[] = [
        { label: 'Option', value: 'option' },
      ];
      
      (select as unknown as vi.Mock).mockResolvedValue('option');
      
      await clackCliInterface.select<string>('Select an option', options, 'option');
      expect(select).toHaveBeenCalledWith(expect.objectContaining({
        initialValue: 'option',
      }));
    });

    it('should handle cancellation', async () => {
      const options: ICliInterfaceServiceSelectOptions[] = [
        { label: 'Option', value: 'option' },
      ];
      
      (select as unknown as vi.Mock).mockResolvedValue(Symbol.for('clack.cancel'));
      
      await clackCliInterface.select<string>('Select an option', options);
      expect(log.error).toHaveBeenCalledWith('Operation cancelled by user');
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  describe('startSpinner', () => {
    it('should start a spinner with the given message', () => {
      clackCliInterface.startSpinner('Loading...');
      expect(spinner).toHaveBeenCalled();
      expect(mockSpinnerInstance.start).toHaveBeenCalledWith('Loading...');
    });

    it('should stop existing spinner before starting a new one', () => {
      // Start first spinner
      clackCliInterface.startSpinner('First spinner');
      const firstSpinner = mockSpinnerInstance;
      
      // Reset mock and create new mock for second spinner
      const secondSpinner = {
        start: vi.fn(),
        stop: vi.fn(),
      };
      (spinner as unknown as vi.Mock).mockReturnValue(secondSpinner);
      
      // Start second spinner
      clackCliInterface.startSpinner('Second spinner');
      
      // First spinner should have been stopped
      expect(firstSpinner.stop).toHaveBeenCalled();
      // Second spinner should have been started
      expect(secondSpinner.start).toHaveBeenCalledWith('Second spinner');
    });
  });

  describe('stopSpinner', () => {
    it('should stop the spinner without a message', () => {
      // Start spinner first
      clackCliInterface.startSpinner('Loading...');
      
      // Stop spinner
      clackCliInterface.stopSpinner();
      expect(mockSpinnerInstance.stop).toHaveBeenCalledWith(undefined);
    });

    it('should stop the spinner with a message', () => {
      // Start spinner first
      clackCliInterface.startSpinner('Loading...');
      
      // Stop spinner with message
      clackCliInterface.stopSpinner('Completed!');
      expect(mockSpinnerInstance.stop).toHaveBeenCalledWith('Completed!');
    });

    it('should do nothing if no spinner is active', () => {
      // No spinner started
      // Create a fake spinner property that's undefined
      (clackCliInterface as any).spinner = undefined;
      
      // Should not throw when stopping a non-existent spinner
      expect(() => clackCliInterface.stopSpinner()).not.toThrow();
    });
  });

  describe('success', () => {
    it('should log a success message', () => {
      clackCliInterface.success('Success message');
      expect(log.success).toHaveBeenCalledWith('Success message');
    });
  });

  describe('text', () => {
    it('should return the entered text', async () => {
      (text as unknown as vi.Mock).mockResolvedValue('User input');
      
      const result = await clackCliInterface.text('Enter text');
      expect(result).toBe('User input');
      expect(text).toHaveBeenCalledWith({
        initialValue: undefined,
        message: 'Enter text',
        placeholder: undefined,
        validate: undefined,
      });
    });

    it('should handle placeholder', async () => {
      (text as unknown as vi.Mock).mockResolvedValue('User input');
      
      await clackCliInterface.text('Enter text', 'Placeholder');
      expect(text).toHaveBeenCalledWith(expect.objectContaining({
        placeholder: 'Placeholder',
      }));
    });

    it('should handle initial value', async () => {
      (text as unknown as vi.Mock).mockResolvedValue('User input');
      
      await clackCliInterface.text('Enter text', undefined, 'Initial value');
      expect(text).toHaveBeenCalledWith(expect.objectContaining({
        initialValue: 'Initial value',
      }));
    });

    it('should handle validation function', async () => {
      (text as unknown as vi.Mock).mockResolvedValue('Valid input');
      
      const validate = (value: string) => value.length < 3 ? 'Too short' : undefined;
      
      await clackCliInterface.text('Enter text', undefined, undefined, validate);
      expect(text).toHaveBeenCalledWith(expect.objectContaining({
        validate,
      }));
    });

    it('should handle cancellation', async () => {
      (text as unknown as vi.Mock).mockResolvedValue(Symbol.for('clack.cancel'));
      
      await clackCliInterface.text('Enter text');
      expect(log.error).toHaveBeenCalledWith('Operation cancelled by user');
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  describe('warn', () => {
    it('should log a warning message', () => {
      clackCliInterface.warn('Warning message');
      expect(log.warn).toHaveBeenCalledWith('Warning message');
    });
  });
});