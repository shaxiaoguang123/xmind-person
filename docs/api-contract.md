# API Contract

## Boundary

The backend exposes REST described by OpenAPI. Frontend API clients/types SHOULD be generated from OpenAPI to avoid maintaining drifting duplicate DTOs.

The frontend does not access the database directly. The backend does not calculate automatic graph layout and MUST NOT expose a layout API.

## Initial Resources

### Project

Backend stages provide Project CRUD and project recovery semantics.

### Document

A Document persists:

- stable document identity;
- Markdown Source;
- Flow Metadata sidecar payload;
- current revision/version;
- timestamps/ownership fields as introduced by the persistence stage.

Markdown Source and Flow Metadata are distinct payload/model concerns even when saved transactionally.

### Revision

Revision/version is used for history and optimistic concurrency. Save operations must be able to detect a stale client revision rather than silently overwrite a newer revision.

## Flow Metadata Validation

At the relevant backend stage, validation includes at least:

- supported `schemaVersion`;
- unique Node IDs within the metadata document;
- Flow Edge `source` and `target` IDs refer to existing node IDs;
- payload schema/types are valid;
- supplied revision is compatible with optimistic concurrency rules.

Validation does not reinterpret Markdown hierarchy and does not synthesize layout coordinates.

## Conceptual REST Surface

Exact routes are finalized in T09/T10, but the resource contract anticipates operations equivalent to:

```text
POST   /projects
GET    /projects/{projectId}
PATCH  /projects/{projectId}
DELETE /projects/{projectId}

POST   /projects/{projectId}/documents
GET    /documents/{documentId}
PUT    /documents/{documentId}
GET    /documents/{documentId}/revisions
GET    /documents/{documentId}/revisions/{revisionId}
```

A document save request is expected to carry Markdown Source, Flow Metadata, and an expected/current revision token/version when optimistic concurrency is enabled.

## Error Semantics

The API must distinguish at least:

- malformed request/schema validation;
- unsupported Flow Metadata schema version;
- invalid/duplicate node identity;
- invalid edge endpoint;
- missing project/document;
- revision conflict;
- persistence/internal failure.

HTTP status/code details are specified when T09 implements concrete endpoints.

## OpenAPI

OpenAPI is the contract source for transport DTOs. Shared domain concepts may exist in `packages/shared-types`, but request/response schemas should not be manually duplicated in frontend and backend without a generation/synchronization mechanism.

## Explicit Non-Scope Before T09

T00/T01 do not implement FastAPI, database models, migrations, authentication, project persistence, collaboration, or API calls.