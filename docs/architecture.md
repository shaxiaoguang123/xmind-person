# Architecture

## Monorepo

apps/web: React TypeScript frontend
apps/api: FastAPI backend
packages/contracts: shared API contracts

## Boundary

Frontend owns parsing, graph projection, rendering, ELK layout, viewport, interaction.

Backend owns persistence, revisions, validation, and CRUD.

REST APIs are described through OpenAPI.
