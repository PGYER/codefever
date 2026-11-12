# Standalone security regression tests

Run from the repository root with PHP 7.4+ and Git installed:

```sh
php tests/security/revision_command_test.php
php tests/security/repository_read_permission_test.php
php tests/security/repository_comparison_permission_test.php
php tests/security/tag_command_test.php
php tests/security/tag_list_command_test.php
php tests/security/doc_path_test.php
php tests/security/member_role_permission_test.php
```

These tests use temporary fixtures and do not need a database, application
configuration, credentials, or a running CodeFever instance. Each script exits
with a nonzero status on failure and removes its own fixtures.

`revision_command_test.php` executes the Git command builders through the same
shell batch utility used by the repository model. It covers commit details,
containing refs, ordinary and initial-commit diffs, tag deletion, shell
metacharacters, Git option injection, and legitimate revision syntax.

`tag_list_command_test.php` pushes ordinary, annotated, and shell-punctuation
tags to a disposable bare repository, then invokes the original
`Repository_model::getTags()` path, including its Git builders and shell runner.
It verifies literal names, commit details, annotations, and absence of injected
marker files, and checks rejection of option-like tag arguments. Only model
construction and database-backed repository/user lookups are replaced with
fixtures; this is not an HTTP/SSH gateway integration test.

`repository_read_permission_test.php` invokes the real commit-detail,
containing-ref, and last-commit controller methods with request, service, and model doubles. It
checks the requested repository/user/read permission and verifies that denied
requests cannot reach the model. It does not replace HTTP or database-backed
integration testing.

`repository_comparison_permission_test.php` covers local/cross-repository diffs
and commit comparisons, with and without merge-request parameters and version
comparison. It checks source and target read access before model calls, and
verifies that a fixture content marker is returned only to authorized readers.
It also exercises the real merge-request object resolver to reject mismatched
repository identities and checks the existing joined-repository scope of the
related merge-request listing. Request/service/storage dependencies are doubles;
these checks do not require a running database or HTTP deployment.

## Documentation path regression checks

Run with PHP 7.4 or a compatible newer version:

```sh
php tests/security/doc_path_test.php
```

The standalone test uses the real documentation controller and URI parser with
disposable filesystem fixtures. It requires neither Composer dependencies nor a
database. Controller construction and view rendering are stubbed; this is not a
full deployment test.

Coverage includes normal Chinese/English Markdown and menus, the sequential URI
replacement bypass, deeper traversal, sibling directory prefix collisions,
external file/directory symlinks, image paths, non-Markdown files, missing files,
empty directories and NUL bytes. Fixtures contain only test markers and are
removed on shutdown.

For a deployment smoke test, also verify that `/doc/cn/` and `/doc/en/` redirect
to their welcome documents, that a normal documentation image still loads, and
that a request targeting a disposable file outside the documentation root
returns 404 without its contents. Never use real secrets as test fixtures.

## Member role authorization checks

`member_role_permission_test.php` exercises the real repository/group role APIs,
permission service and member persistence with synthetic rows. It covers
Maintainer self-promotion followed by deletion, grants above the caller role,
changes to higher-role members, inherited group roles, and authorized role and
Owner-only deletion controls. Run with PHP 7.4 or newer. No live database or
HTTP server is required.
