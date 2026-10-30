# Changelog

## 2.0.1 — 2026-10-30

### Changed

- Move the package into the ScalerIT npm organization as `@scalerit/tracklytic-next`.
- Use the scoped JavaScript client `@scalerit/tracklytic`; update imports to `@scalerit/tracklytic-next` and `@scalerit/tracklytic-next/server`.
- Retain the existing unscoped 2.0.0 source tag and release artifact unchanged.

## 2.0.0 — 2026-10-30

### Changed

- Target the current Tracklytic API and JavaScript SDK 2.0.0.
- Replace removed event icons with `logLevel` and optional structured badges.
- Re-export complete current API types and preserve API error details.
- Use the official public JavaScript 2.0.0 GitHub release package while its npm publication is pending. The lockfile pins its integrity.

### Added

- Full pipeline create/update/action operations through server clients and the React hook.
- Event management, profile reads/deletion and insight reads/mutations through the inherited JavaScript client API.
- `createEvent()` for responses containing generated pipeline IDs.
- Configurable API base URL, fetch transport and separate user access JWT.
- Reproducible contract/provider tests and optional sibling SDK verification.

### Fixed

- Reconfigure the provider when project, credentials or transport options change.
- Make `TracklyticProviderApp` the actual children-wrapping provider.
- Add contextual `userId` to events, pipeline creation and identify calls, rejecting identify calls without an ID.
- Resolve nested click targets and preserve server notification defaults in data-attribute tracking.
- Retain the emitted client boundary and a separate server entry point.

### Migration

- Event `icon` / `data-icon` are removed; use `logLevel`, `badge`, or `data-log-level`.
- Use `userId` rather than `user_id` and timestamps in Unix milliseconds.
- `SetUserIdServerComponent` remains a deprecated alias for the correctly named Client Component `SetUserId`.
- API-token writes and user JWT operations are separate. Keep private credentials in server-only code.
- `track()` remains a boolean convenience method; use `createEvent()` or `pipeline.create()` to obtain a pipeline ID.
