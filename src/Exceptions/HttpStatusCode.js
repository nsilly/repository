export const HTTP_CONTINUE = 100;

export const HTTP_SWITCHING_PROTOCOLS = 101;

// [Successful 2xx]

export const HTTP_OK = 200;

export const HTTP_CREATED = 201;

export const HTTP_ACCEPTED = 202;

export const HTTP_NONAUTHORITATIVE_INFORMATION = 203;

export const HTTP_NO_CONTENT = 204;

export const HTTP_RESET_CONTENT = 205;

export const HTTP_PARTIAL_CONTENT = 206;

// [Redirection 3xx]

export const HTTP_MULTIPLE_CHOICES = 300;

export const HTTP_MOVED_PERMANENTLY = 301;

export const HTTP_FOUND = 302;

export const HTTP_SEE_OTHER = 303;

export const HTTP_NOT_MODIFIED = 304;

export const HTTP_USE_PROXY = 305;

export const HTTP_UNUSED = 306;

export const HTTP_TEMPORARY_REDIRECT = 307;

// [Client Error 4xx]

export const errorCodesBeginAt = 400;

export const HTTP_BAD_REQUEST = 400;

export const HTTP_UNAUTHORIZED = 401;

export const HTTP_PAYMENT_REQUIRED = 402;

export const HTTP_FORBIDDEN = 403;

export const HTTP_NOT_FOUND = 404;

export const HTTP_METHOD_NOT_ALLOWED = 405;

export const HTTP_NOT_ACCEPTABLE = 406;

export const HTTP_PROXY_AUTHENTICATION_REQUIRED = 407;

export const HTTP_REQUEST_TIMEOUT = 408;

export const HTTP_CONFLICT = 409;

export const HTTP_GONE = 410;

export const HTTP_LENGTH_REQUIRED = 411;

export const HTTP_PRECONDITION_FAILED = 412;

export const HTTP_REQUEST_ENTITY_TOO_LARGE = 413;

export const HTTP_REQUEST_URI_TOO_LONG = 414;

export const HTTP_UNSUPPORTED_MEDIA_TYPE = 415;

export const HTTP_REQUESTED_RANGE_NOT_SATISFIABLE = 416;

export const HTTP_EXPECTATION_FAILED = 417;

export const HTTP_PRECONDITION_REQUIRED = 428;

export const HTTP_TOO_MANY_REQUEST = 429;

// [Server Error 5xx]

export const HTTP_INTERNAL_SERVER_ERROR = 500;

export const HTTP_NOT_IMPLEMENTED = 501;

export const HTTP_BAD_GATEWAY = 502;

export const HTTP_SERVICE_UNAVAILABLE = 503;

export const HTTP_GATEWAY_TIMEOUT = 504;

export const HTTP_VERSION_NOT_SUPPORTED = 505;

export const $messages = {
  // [Informational 1xx]

  100: '100 Continue',

  101: '101 Switching Protocols',

  // [Successful 2xx]

  200: '200 OK',

  201: '201 Created',

  202: '202 Accepted',

  203: '203 Non-Authoritative Information',

  204: '204 No Content',

  205: '205 Reset Content',

  206: '206 Partial Content',

  // [Redirection 3xx]

  300: '300 Multiple Choices',

  301: '301 Moved Permanently',

  302: '302 Found',

  303: '303 See Other',

  304: '304 Not Modified',

  305: '305 Use Proxy',

  306: '306 (Unused)',

  307: '307 Temporary Redirect',

  // [Client Error 4xx]

  400: '400 Bad Request',

  401: '401 Unauthorized',

  402: '402 Payment Required',

  403: '403 Forbidden',

  404: '404 Not Found',

  405: '405 Method Not Allowed',

  406: '406 Not Acceptable',

  407: '407 Proxy Authentication Required',

  408: '408 Request Timeout',

  409: '409 Conflict',

  410: '410 Gone',

  411: '411 Length Required',

  412: '412 Precondition Failed',

  413: '413 Request Entity Too Large',

  414: '414 Request-URI Too Long',

  415: '415 Unsupported Media Type',

  416: '416 Requested Range Not Satisfiable',

  417: '417 Expectation Failed',

  // [Server Error 5xx]

  500: '500 Internal Server Error',

  501: '501 Not Implemented',

  502: '502 Bad Gateway',

  503: '503 Service Unavailable',

  504: '504 Gateway Timeout',

  505: '505 HTTP Version Not Supported'
};
