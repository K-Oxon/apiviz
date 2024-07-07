import { fireEvent, render, screen } from '@testing-library/react';
import ApiKeyInput from './ApiKeyInput';

describe('ApiKeyInput', () => {
  test('renders input fields with correct labels', () => {
    render(<ApiKeyInput onApiKeyChange={() => {}} />);
    expect(screen.getByLabelText('Header Name')).toBeInTheDocument();
    expect(screen.getByLabelText('API Key / Token')).toBeInTheDocument();
  });

  test('calls onApiKeyChange with updated values', () => {
    const mockOnApiKeyChange = jest.fn();
    render(<ApiKeyInput onApiKeyChange={mockOnApiKeyChange} />);

    const headerNameInput = screen.getByLabelText('Header Name');
    const headerValueInput = screen.getByLabelText('API Key / Token');

    fireEvent.change(headerNameInput, { target: { value: 'X-Custom-Header' } });
    expect(mockOnApiKeyChange).toHaveBeenCalledWith('X-Custom-Header', '');

    fireEvent.change(headerValueInput, { target: { value: 'secret-key' } });
    expect(mockOnApiKeyChange).toHaveBeenCalledWith('X-Custom-Header', 'secret-key');
  });
});
