# Security Policy

## Supported versions

The `main` branch is the actively maintained version.

## Reporting a vulnerability

Please open a private security advisory on GitHub or contact the maintainer through the GitHub profile.

Do not include real student data, Firebase credentials with write access, or personally identifiable information in public issues.

## Data handling

Grade Planner stores course progress in Firebase. Deployers should configure their own Firebase project and review Firestore security rules before public use.
