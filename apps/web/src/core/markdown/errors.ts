export type MarkdownCoreErrorCode = 'INVALID_APPLICATION_STATE';

export class MarkdownCoreError extends Error {
  readonly code: MarkdownCoreErrorCode;

  constructor(code: MarkdownCoreErrorCode, message: string) {
    super(message);
    this.name = 'MarkdownCoreError';
    this.code = code;
  }
}
