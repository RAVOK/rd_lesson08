export class ResponseDTO<T> {
  user: T[];
  error: {
    errorCode: number;
    errorMessage: string;
  };

  constructor(user: T[] = [], errorCode = 0, errorMessage = '') {
    this.user = user;
    this.error = { errorCode, errorMessage };
  }
}