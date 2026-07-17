/** Declarative validation rules a `SettingDefinition` may attach. Every field
 * is optional — a definition only declares the rules relevant to its type. */
export interface SettingValidationRule {
  required?: boolean;
  nullable?: boolean;
  min?: number;
  max?: number;
  regex?: string;
  allowedValues?: readonly (string | number | boolean)[];
}
