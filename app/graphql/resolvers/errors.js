import { createError } from 'apollo-errors';

export const FooError = createError('FooError', {
  message: 'A foo error has occurred'
});
