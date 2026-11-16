type Runner = (() => void) & { deps: Set<Runner>[]; active: boolean; scheduler?: (job: Runner) => void };
const bucket = new WeakMap<object, Map<PropertyKey, Set<Runner>>>();
const stack: Runner[] = [];
const jobs = new Set<Runner>();
let pending = false;

export function queueJob(job: Runner) {
  jobs.add(job);
  if (pending) return;
  pending = true;
  queueMicrotask(() => {
    try {
      for (const job of jobs) if (job.active) job();
    } finally {
      jobs.clear();
      pending = false;
    }
  });
}

function cleanup(runner: Runner) {
  runner.deps.forEach(dep => dep.delete(runner));
  runner.deps.length = 0;
}

export function effect(fn: () => void, scheduler?: (job: Runner) => void) {
  const runner: Runner = Object.assign(() => {
    if (!runner.active || stack.includes(runner)) return;
    cleanup(runner);
    stack.push(runner);
    try { fn(); } finally { stack.pop(); }
  }, { deps: [] as Set<Runner>[], active: true, scheduler });
  runner();
  return () => {
    runner.active = false;
    cleanup(runner);
    jobs.delete(runner);
  };
}

const cache = new WeakMap<object, object>();
const proxies = new WeakSet<object>();

// 教学版：支持普通对象的读取与赋值，不包含数组、集合和遍历操作。
export function reactive<T extends object>(target: T): T {
  if (proxies.has(target)) return target;
  const cached = cache.get(target);
  if (cached) return cached as T;
  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      const runner = stack[stack.length - 1];
      if (runner) {
        let deps = bucket.get(target);
        if (!deps) bucket.set(target, deps = new Map());
        let dep = deps.get(key);
        if (!dep) deps.set(key, dep = new Set());
        if (!dep.has(runner)) {
          dep.add(runner);
          runner.deps.push(dep);
        }
      }
      const value = Reflect.get(target, key, receiver);
      return value !== null && typeof value === 'object' ? reactive(value) : value;
    },
    set(target, key, value, receiver) {
      const oldValue = Reflect.get(target, key, receiver);
      const success = Reflect.set(target, key, value, receiver);
      if (success && !Object.is(oldValue, value)) {
        for (const runner of new Set(bucket.get(target)?.get(key))) {
          if (!stack.includes(runner)) {
            if (runner.scheduler) runner.scheduler(runner);
            else runner();
          }
        }
      }
      return success;
    },
  });
  cache.set(target, proxy);
  proxies.add(proxy);
  return proxy;
}
