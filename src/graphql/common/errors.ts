import { createError } from 'apollo-errors';

/*
export const FooError = createError('FooError', {
  message: 'A foo error has occurred'
});

// 更新错误
export const UpdateError = createError('updateError', {
  message: 'update error'
});

export const RejectedError = createError('rejectedError', {
  message: 'the request was rejected'
});
*/

export default ({ message, data = {} }: any) => {
  let error = createError('error', {
    message,
    data
  })
  return new error(data)
}
