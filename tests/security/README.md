# Documentation path regression checks

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
