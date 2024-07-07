import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import ApiInput from './ApiInput';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiInput', () => {
  test('renders input field with correct label', () => {
    render(<ApiInput onDataFetched={() => {}} apiHeader={{ name: '', value: '' }} />);
    expect(screen.getByLabelText('API URL')).toBeInTheDocument();
  });

  test('fetches data when form is submitted', async () => {
    const mockOnDataFetched = jest.fn();
    const mockData = { key: 'value' };
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });

    render(
      <ApiInput
        onDataFetched={mockOnDataFetched}
        apiHeader={{ name: 'X-API-KEY', value: 'secret' }}
      />
    );

    const input = screen.getByLabelText('API URL');
    fireEvent.change(input, { target: { value: 'https://api.example.com' } });
    fireEvent.click(screen.getByText('Fetch'));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com', {
        headers: { 'X-API-KEY': 'secret' },
      });
      expect(mockOnDataFetched).toHaveBeenCalledWith(mockData);
    });
  });

  test('displays error message on fetch failure', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    render(<ApiInput onDataFetched={() => {}} apiHeader={{ name: '', value: '' }} />);

    fireEvent.click(screen.getByText('Fetch'));

    await waitFor(() => {
      expect(
        screen.getByText('Failed to fetch data. Please check the URL and API key, then try again.')
      ).toBeInTheDocument();
    });
  });
});
