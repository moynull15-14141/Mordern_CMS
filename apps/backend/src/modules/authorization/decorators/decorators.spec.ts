import 'reflect-metadata';
import {
  REQUIRE_ALL_PERMISSIONS_KEY,
  REQUIRE_ANY_PERMISSION_KEY,
  REQUIRE_PERMISSION_KEY,
  REQUIRE_ROLE_KEY,
} from '../authorization.constants';
import { RequireAllPermissions } from './require-all-permissions.decorator';
import { RequireAnyPermission } from './require-any-permission.decorator';
import { RequirePermission } from './require-permission.decorator';
import { RequireRole } from './require-role.decorator';

/** Applies a decorator to a throwaway class method and reads back the
 * metadata NestJS's Reflector would read at request time. */
function readMetadata(decoratorFactory: () => MethodDecorator, key: string): unknown {
  class Target {
    handler(): void {
      /* noop */
    }
  }
  decoratorFactory()(Target.prototype, 'handler', Object.getOwnPropertyDescriptor(Target.prototype, 'handler')!);
  return Reflect.getMetadata(key, Target.prototype.handler);
}

describe('authorization decorators', () => {
  it('@RequirePermission sets REQUIRE_PERMISSION_KEY to the given permissions', () => {
    expect(readMetadata(() => RequirePermission('article.create', 'article.update'), REQUIRE_PERMISSION_KEY)).toEqual([
      'article.create',
      'article.update',
    ]);
  });

  it('@RequireAnyPermission sets REQUIRE_ANY_PERMISSION_KEY to the given permissions', () => {
    expect(readMetadata(() => RequireAnyPermission('article.create'), REQUIRE_ANY_PERMISSION_KEY)).toEqual([
      'article.create',
    ]);
  });

  it('@RequireAllPermissions sets REQUIRE_ALL_PERMISSIONS_KEY to the given permissions', () => {
    expect(
      readMetadata(() => RequireAllPermissions('article.create', 'article.publish'), REQUIRE_ALL_PERMISSIONS_KEY),
    ).toEqual(['article.create', 'article.publish']);
  });

  it('@RequireRole sets REQUIRE_ROLE_KEY to the given roles', () => {
    expect(readMetadata(() => RequireRole('Editor', 'Administrator'), REQUIRE_ROLE_KEY)).toEqual([
      'Editor',
      'Administrator',
    ]);
  });
});
