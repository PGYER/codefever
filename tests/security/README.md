# Standalone security regression tests

Run from the repository root with PHP 7.4+ and Git installed:

```sh
php tests/security/revision_command_test.php
php tests/security/repository_read_permission_test.php
php tests/security/tag_command_test.php
php tests/security/doc_path_test.php
```

These tests use temporary fixtures and do not need a database, application
configuration, credentials, or a running CodeFever instance. Each script exits
with a nonzero status on failure and removes its own fixtures.

`revision_command_test.php` executes the Git command builders through the same
shell batch utility used by the repository model. It covers commit details,
containing refs, ordinary and initial-commit diffs, tag deletion, shell
metacharacters, Git option injection, and legitimate revision syntax.

`repository_read_permission_test.php` invokes the real commit-detail and
containing-ref controller methods with request, service, and model doubles. It
checks the requested repository/user/read permission and verifies that denied
requests cannot reach the model. It does not replace HTTP or database-backed
integration testing.
