
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { UnitConverter } from './UtilityTools';

describe('UnitConverter', () => {
  it('should convert units correctly', async () => {
    render(<UnitConverter />);

    // Check if the default conversion is correct
    await act(async () => {
      const input = screen.getByLabelText('Input');
      await userEvent.type(input, '10');
    });
    expect(screen.getByLabelText('Output')).toHaveValue('1000');

    // Change the conversion type and check again
    await act(async () => {
      const select = screen.getByLabelText('Conversion Type');
      await userEvent.selectOptions(select, 'Kilograms to Pounds');
    });
    expect(screen.getByLabelText('Output')).toHaveValue('22.0462');
  });
});
