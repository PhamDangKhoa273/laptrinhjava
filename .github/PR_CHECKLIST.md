# PR Check / Branch Protection Checklist

Required before merge:
- [ ] backend test passes in GitHub Actions
- [ ] frontend lint passes in GitHub Actions
- [ ] frontend build passes in GitHub Actions
- [ ] migration presence check passes in GitHub Actions
- [ ] basic secret scan passes in GitHub Actions
- [ ] README matches seed/demo accounts declared in Flyway migrations
- [ ] no source/artifact/doc drift for demo accounts, startup order, or env vars
- [ ] all required checks must be green before merge

Branch protection should require the `ci` workflow on pull requests.
GitHub/GitLab branch protection is still a host setting, not something this repo can fully enforce by itself.
