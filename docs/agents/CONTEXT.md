# Agent Context for BICAP

This file defines the local context an agent must load before working on BICAP.

## Repository Model

BICAP is a modular monolith with a Spring Boot backend and React frontend.

Do not treat modules as independent microservices. They share one deployable application
and one database migration stream, but their responsibilities should remain separated.

## Required Reading Order

1. `AGENTS.md`
2. `docs/architecture/PROJECT_CONTEXT.md`
3. `docs/architecture/MODULES.md`
4. `docs/business/BUSINESS_RULES.md`
5. Relevant `docs/modules/*.md`
6. Relevant tests

## Decision Principles

- Prefer explicit module boundaries over ad-hoc cross-module calls.
- Keep role access deny-by-default.
- Keep business rules in services, not page components or controllers.
- Keep frontend routes aligned with backend permissions.
- Update docs when behavior changes.

## Current Submission Bar

BICAP is expected to remain demo/submission-ready:

- Frontend test/build must pass.
- Vulnerability audit should stay clean.
- Runtime fallback references must not crash pages.
- RBAC tests must cover the main role workspaces.

## When Unsure

Document uncertainty as a gap in the relevant module file rather than inventing behavior.
