# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

React application developers who need to add and configure keyboard shortcuts. Their primary job is to get working shortcuts into their applications; they also need to find API details and version-specific guidance as their implementations grow.

## Product Purpose

The React Hotkeys Hook documentation helps developers move from installation to an implemented shortcut quickly, then find the guidance they need to use the library correctly.

## Positioning

The site documents a React hook for declaring shortcut bindings in components. It combines implementation guides and API reference with editable examples that let developers try the library in the browser.

## Operating Context

- Developers start with installation commands and React examples, then consult guides, API reference, search, or migration instructions for their task.
- The site provides current documentation and archived major versions; the version selector helps readers reach the relevant material.
- The site links to the project's GitHub repository and support discussions.

## Capabilities and Constraints

- Documentation covers shortcut combinations and sequences, focus and provider scoping, recording shortcuts, API options, and version migration.
- Examples and API guidance must match the library version being documented. Verify behavior against the relevant library version when existing sources disagree.
- A formal accessibility conformance target has not been specified.

## Evidence on Hand

- Quick Start and an editable example: `packages/documentation/docs/intro.mdx`.
- Guides and API reference: `packages/documentation/docs/documentation/` and `packages/documentation/docs/api/`.
- Editable task-manager demonstration: `packages/documentation/src/pages/index.tsx`.
- Archived documentation and version list: `packages/documentation/versioned_docs/` and `packages/documentation/versions.json`.
- Existing project logo: `packages/documentation/static/img/logo.svg`.

## Product Principles

- Make the first working shortcut easy to reach.
- Support practical implementation with examples and clear API explanations.
- Keep guidance accurate for the version a developer is using.
- Help developers find answers for real implementation constraints, including focus and keyboard layouts.
