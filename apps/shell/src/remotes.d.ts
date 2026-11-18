// Types for the federated modules. `dts` generation is off in this repo to keep
// the moving parts few, so these point at the remotes' sources with type-only
// `import()` references. They never reach the bundler. (A tsconfig `paths`
// alias would, because Rsbuild honors `paths`, and would silently bundle the
// remotes' source into the shell instead of loading it through federation.)

declare module 'places/location' {
  type Source = typeof import('../../places/src/location');
  export const createLocation: Source['createLocation'];
  export const LocationContext: Source['LocationContext'];
  export type LocationModel = import('../../places/src/location').LocationModel;
}

declare module 'places/LocationPicker' {
  const LocationPicker: typeof import('../../places/src/LocationPicker').default;
  export default LocationPicker;
}

declare module 'forecast/Forecast' {
  const Forecast: typeof import('../../forecast/src/Forecast').default;
  export default Forecast;
}
