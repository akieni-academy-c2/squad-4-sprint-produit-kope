export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Connexion requise") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Accès refusé") {
    return new ApiError(403, message);
  }

  static notFound(message = "Introuvable") {
    return new ApiError(404, message);
  }

  static conflict(message, errors) {
    return new ApiError(409, message, errors);
  }

  static tooManyRequests(message = "Trop de tentatives, réessayez plus tard") {
    return new ApiError(429, message);
  }
}
