import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { SettingField } from './setting-field';
import type { SettingType } from '../types/settings';

function Harness({ type, isSensitive, defaultValue }: { type: SettingType; isSensitive: boolean; defaultValue: unknown }) {
  const { control } = useForm({ defaultValues: { value: defaultValue } });
  return (
    <Controller
      control={control}
      name="value"
      render={({ field }) => <SettingField type={type} isSensitive={isSensitive} field={field} />}
    />
  );
}

describe('SettingField', () => {
  it('renders a text input for STRING', () => {
    render(<Harness type="STRING" isSensitive={false} defaultValue="Modern CMS" />);
    expect(screen.getByRole('textbox')).toHaveValue('Modern CMS');
  });

  it('renders a textarea for TEXT/JSON/ARRAY', () => {
    render(<Harness type="TEXT" isSensitive={false} defaultValue="hello" />);
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
  });

  it('renders a switch for BOOLEAN and toggles it', async () => {
    const user = userEvent.setup();
    render(<Harness type="BOOLEAN" isSensitive={false} defaultValue={false} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).not.toBeChecked();
    await user.click(toggle);
    expect(toggle).toBeChecked();
  });

  it('renders a number input for NUMBER', () => {
    render(<Harness type="NUMBER" isSensitive={false} defaultValue={10} />);
    expect(screen.getByRole('spinbutton')).toHaveValue(10);
  });

  it('renders an empty password field with a placeholder for sensitive types, regardless of type', () => {
    render(<Harness type="STRING" isSensitive={true} defaultValue="" />);
    const input = screen.getByPlaceholderText('Leave blank to keep unchanged');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveValue('');
  });

  it('renders a color swatch + text input for COLOR', () => {
    render(<Harness type="COLOR" isSensitive={false} defaultValue="#0f172a" />);
    expect(screen.getByLabelText('Pick a color')).toHaveValue('#0f172a');
    expect(screen.getByPlaceholderText('#0f172a')).toBeInTheDocument();
  });
});
