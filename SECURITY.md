# Security policy

## Reporting a vulnerability

Please report a security problem **privately**, not in a public issue:

1. Open [Security > Report a vulnerability](https://github.com/udienz/hadistweb/security/advisories/new) in this repository.
2. Say what you found, how to reproduce it, and what it could allow. A page address and the steps are usually enough.

Only the maintainers see the report. We will answer as soon as we can, tell you whether we agree it is a problem, and
credit you in the fix if you wish. This is a small project, so please be patient; there is no fixed response time.

## What is in scope

The code in this repository and the sites that run it: https://hadist.udienz.web.id and the test site
https://hadist-qa.udienz.web.id. The site has no accounts and stores nothing about its readers, so the main concerns are
the pages themselves (for example a text from a source that could run as a script), the server's requests to its
sources, and the deployment files in this repository.

## Please do not

- run denial-of-service tests, scans at a large scale, or anything that slows the site for readers or floods the sources
  it reads from (GitHub and HadeethEnc.com);
- use social engineering or physical attacks.

## Not a security problem

A mistake in the text of a hadith, a translation, a grade or an explanation is not a vulnerability: please open a normal
issue. The content comes from published sources and is never edited in this project (see the About page).

## Supported versions

Only the latest release, which is the one running on the site.
