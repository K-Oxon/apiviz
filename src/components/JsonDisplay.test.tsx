import { fireEvent, render, screen } from '@testing-library/react';
import JsonDisplay from './JsonDisplay';

const testData = {
  result: {
    data: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ],
  },
};

describe('JsonDisplay', () => {
  test('renders input field with correct label', () => {
    render(<JsonDisplay data={testData} />);
    expect(screen.getByLabelText('Filter JSON')).toBeInTheDocument();
  });

  test('displays full JSON when no filter is applied', () => {
    render(<JsonDisplay data={testData} />);
    const preElement = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'pre' && JSON.parse(content) !== null;
    });
    expect(preElement).toBeInTheDocument();
    expect(JSON.parse(preElement.textContent!)).toEqual(testData);
  });

  test('filters JSON correctly with object notation', () => {
    render(<JsonDisplay data={testData} />);
    const filterInput = screen.getByLabelText('Filter JSON');
    fireEvent.change(filterInput, { target: { value: 'result.data' } });
    const preElement = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'pre' && JSON.parse(content) !== null;
    });
    expect(preElement).toBeInTheDocument();
    expect(JSON.parse(preElement.textContent!)).toEqual(testData.result.data);
  });

  test('filters JSON correctly with array notation', () => {
    render(<JsonDisplay data={testData} />);
    const filterInput = screen.getByLabelText('Filter JSON');
    fireEvent.change(filterInput, { target: { value: 'result.data[1]' } });
    const preElement = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'pre' && JSON.parse(content) !== null;
    });
    expect(preElement).toBeInTheDocument();
    expect(JSON.parse(preElement.textContent!)).toEqual(testData.result.data[1]);
  });

  test('handles invalid filter gracefully', () => {
    render(<JsonDisplay data={testData} />);
    const filterInput = screen.getByLabelText('Filter JSON');
    fireEvent.change(filterInput, { target: { value: 'invalid.path' } });
    const preElement = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'pre' && content === '';
    });
    expect(preElement).toBeInTheDocument();
  });
});
