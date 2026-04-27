# SECURITY

## Scope
This document is the honest security baseline for the repo. It is not a full audit report.

## Core controls present
- Spring Security with role-based access control
- Password hashing for seeded and user-auth accounts
- Actuator endpoints for health/metrics
- Redis/cache support
- Audit logging in critical flows
- Idempotency/versioning on selected sensitive write paths

## Threats to watch
- Over-broad admin permissions
- Duplicate payment / callback replay
- Duplicate shipment creation / status races
- Public exposure of private media/files
- Secret leakage in docs or CI logs
- Weak demo credentials left in production

## Required checks
- Backend tests pass
- Frontend build passes
- Lint passes
- Migration check passes
- Basic secret scan passes
- README does not overclaim runtime proof

## Operational rules
- No public post/email/send without explicit user request
- No hard-delete assumptions when the system uses lifecycle status control
- No blockchain claim beyond what the runtime and evidence actually prove
- No “done” wording unless API, UI, test, and evidence all exist

## Evidence standard
Security claims should be backed by:
- code path
- test output
- CI output
- screenshot/evidence pack
