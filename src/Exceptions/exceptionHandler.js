import {
  HTTP_FORBIDDEN,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_BAD_REQUEST,
  HTTP_CONFLICT,
  HTTP_GONE,
  HTTP_LENGTH_REQUIRED,
  HTTP_METHOD_NOT_ALLOWED,
  HTTP_NOT_ACCEPTABLE,
  HTTP_NOT_FOUND,
  HTTP_PRECONDITION_FAILED,
  HTTP_PRECONDITION_REQUIRED,
  HTTP_SERVICE_UNAVAILABLE,
  HTTP_TOO_MANY_REQUEST,
  HTTP_UNAUTHORIZED,
  HTTP_UNSUPPORTED_MEDIA_TYPE
} from './HttpStatusCode';
import { Exception } from './Exception';

export const ExceptionHandler = function(err, req, res, next) {
  console.log(err);
  
  const praseStatusCode = e => {
    switch (Object.getPrototypeOf(e).constructor.name) {
      case 'AccessDeniedHttpException':
        return HTTP_FORBIDDEN;
      case 'BadRequestHttpException':
        return HTTP_BAD_REQUEST;
      case 'ConflictHttpException':
        return HTTP_CONFLICT;
      case 'GoneHttpException':
        return HTTP_GONE;
      case 'HttpException':
        return HTTP_INTERNAL_SERVER_ERROR;
      case 'LengthRequiredHttpException':
        return HTTP_LENGTH_REQUIRED;
      case 'MethodNotAllowedHttpException':
        return HTTP_METHOD_NOT_ALLOWED;
      case 'NotAcceptableHttpException':
        return HTTP_NOT_ACCEPTABLE;
      case 'NotFoundHttpException':
        return HTTP_NOT_FOUND;
      case 'PreconditionFailedHttpException':
        return HTTP_PRECONDITION_FAILED;
      case 'PreconditionRequiredHttpException':
        return HTTP_PRECONDITION_REQUIRED;
      case 'ServiceUnavailableHttpException':
        return HTTP_SERVICE_UNAVAILABLE;
      case 'TooManyRequestsHttpException':
        return HTTP_TOO_MANY_REQUEST;
      case 'UnauthorizedHttpException':
        return HTTP_UNAUTHORIZED;
      case 'UnsupportedMediaTypeHttpException':
        return HTTP_UNSUPPORTED_MEDIA_TYPE;
      default:
        return HTTP_BAD_REQUEST;
    }
  };
  if (Object.getPrototypeOf(err).constructor.name === 'ServerError' && err.inner instanceof Exception) {
    err = err.inner;
  }
  res.status(praseStatusCode(err)).json({ error_code: err.error_code, message: err.message });
};
