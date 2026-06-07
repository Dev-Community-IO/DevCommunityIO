# Security Policy

## Supported versions

Security fixes are applied to the latest release on the `main` branch.

| Version | Supported |
| ------- | --------- |
| latest on `main` | Yes |
| older releases | Best effort |

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately using one of these methods:

1. **GitHub Security Advisories (preferred):**
   [Create a private security advisory](https://github.com/Dev-Community-IO/devcommunityIO/security/advisories/new)

2. **Email:** Contact the maintainers through the organization profile if advisory access is unavailable.

Include as much detail as possible:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We aim to acknowledge reports within **72 hours** and provide a status update within **7 days**.

## Disclosure policy

- Confirmed issues are fixed on `main` and released as soon as practical.
- Reporters are credited in the advisory unless they prefer to remain anonymous.
- Please allow reasonable time for a fix before public disclosure.

## Safe harbor

We support good-faith security research. Do not access data that is not yours,
disrupt production services, or violate applicable laws.

## Frontend-specific notes

- Never commit `.env` files or API secrets to this repository.
- `VITE_*` variables are exposed to the browser — only public keys belong there.
- Report issues involving XSS, auth token handling, or unsafe redirects.
