export class SuccessResponseDto<T> {
  data: T;
  meta?: Record<string, any>;
}
