export abstract class BaseError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnsetTypeError extends BaseError {}

export class UnSupportError extends BaseError {}

export class UnknownError extends BaseError {}

export class NotFoundFileError extends BaseError {}

export class NotFoundReference extends BaseError {}

export class FeatureDevelopmentError extends BaseError {}

export class SchemaOnlySupportError extends BaseError {}

export class UndefinedComponent extends BaseError {}

export class DevelopmentError extends BaseError {}
