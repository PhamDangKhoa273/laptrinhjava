## Summary

<!-- 1-2 sentences describing the change -->

## Doc IDs touched

<!--
List every ID in docs/ that this PR exercises or changes.
At least one ID is required if the PR modifies code under backend/ or frontend/.
-->

- R-*: 
- BR-*: 
- STM-*: 
- API-*: 

## Gap entries

<!--
If this PR introduces a deviation between code and docs that cannot be fixed immediately,
open a GAP-* in docs/09-governance/gap-register.md and list it here.
-->

- [ ] None
- [ ] GAP-* opened: 

## OpenAPI delta

<!--
If this PR adds, modifies, or removes an endpoint, describe the change in docs/05-api/openapi.yaml.
-->

- [ ] No endpoint change
- [ ] openapi.yaml updated:

## Tests

<!-- Tests added or test files updated -->

- Backend tests:
- Frontend tests:
- Manual verification:

## RBAC impact

<!--
If this PR affects RBAC (adds @PreAuthorize, route guard, conditional rule),
describe which cell of docs/06-security/rbac-matrix.md is affected.
-->

- [ ] No RBAC change
- [ ] RBAC matrix updated:

## Checklist

- [ ] `scripts/docs/docs-check` passes (no broken links)
- [ ] `scripts/docs/docs-lint` passes (no violation)
- [ ] `scripts/docs/docs-trace` passes (no new gap)
- [ ] Doc IDs in test names or @DisplayName (where applicable)
- [ ] Build passes: `mvnw test` + `npm run build`
