import { Exception } from './Exception';

export class PermissionDeniedException extends Exception {
  constructor() {
    super('Permission Denied', 1005);
  }
}
