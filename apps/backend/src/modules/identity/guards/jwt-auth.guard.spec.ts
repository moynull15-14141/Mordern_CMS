import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

function buildContext(): ExecutionContext {
  return {
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
    switchToHttp: () => ({ getRequest: () => ({}), getResponse: () => ({}) }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  it('bypasses authentication when the route is marked @Public()', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(true) } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);

    expect(guard.canActivate(buildContext())).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, expect.any(Array));
  });

  it('delegates to the parent AuthGuard when the route is not public', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);

    // Spy on the actual parent prototype in JwtAuthGuard's chain (not a
    // fresh AuthGuard('jwt') mixin instance, which would be a different
    // class object and wouldn't be the one `super.canActivate()` resolves to).
    const parentPrototype = Object.getPrototypeOf(JwtAuthGuard.prototype);
    const parentCanActivate = jest.spyOn(parentPrototype, 'canActivate').mockReturnValue(true);

    const result = guard.canActivate(buildContext());

    expect(parentCanActivate).toHaveBeenCalled();
    expect(result).toBe(true);
    parentCanActivate.mockRestore();
  });
});
