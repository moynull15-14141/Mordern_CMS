export function throttle<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  limitMs: number
): (...args: TArgs) => void {
  let inCooldown = false;
  let pendingArgs: TArgs | undefined;

  const invoke = (args: TArgs) => {
    fn(...args);
    inCooldown = true;
    setTimeout(() => {
      inCooldown = false;
      if (pendingArgs) {
        const args2 = pendingArgs;
        pendingArgs = undefined;
        invoke(args2);
      }
    }, limitMs);
  };

  return (...args: TArgs) => {
    if (inCooldown) {
      pendingArgs = args;
      return;
    }
    invoke(args);
  };
}
