import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Décorateur personnalisé pour définir les rôles autorisés sur une route.
 *
 * Usage :
 *   @Roles('admin')
 *   @Roles('admin', 'manager')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
