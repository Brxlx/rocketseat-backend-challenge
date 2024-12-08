export interface ValidationErrorItem {
  field: string;
  message: string;
  code: string;
}

export interface FormattedValidationError {
  errors: ValidationErrorItem[];
}
