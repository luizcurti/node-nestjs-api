import { DatabaseError } from '../types/DatabaseError';
import { NotFoundError } from '../types/NotFoundError';
import { PrismaClientError } from '../types/PrismaClientError';
import { UniqueConstraintError } from '../types/UniqueConstraintError';

enum PrismaErrors {
  UniqueConstraintFail = 'P2002',
  RecordNotFound = 'P2025',
}

export const handleDatabaseErrors = (e: PrismaClientError): Error => {
  switch (e.code) {
    case PrismaErrors.UniqueConstraintFail:
      return new UniqueConstraintError(e);

    case PrismaErrors.RecordNotFound:
      return new NotFoundError('Record not found.');

    default:
      return new DatabaseError(e.message);
  }
};
