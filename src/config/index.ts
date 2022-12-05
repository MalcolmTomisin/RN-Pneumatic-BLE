function createEnum<T extends {[P in keyof T]: P}>(o: T) {
  return o;
}

export const appRoutes = createEnum({
  LOGIN: 'LOGIN',
  HOME: 'HOME',
  DASHBOARD: 'DASHBOARD',
  ONBOARD: 'ONBOARD',
});
