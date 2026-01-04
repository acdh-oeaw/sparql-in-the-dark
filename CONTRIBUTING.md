# Contributing Guide

Thank you for considering contributing to `SPARQL in the Dark`!

This document outlines how to participate constructively.
Please read these guidelines before opening Issues or Pull Requests.

<!-- omit in toc -->

## Table of Contents

- [Vision](#vision)
- [I Have a Question](#i-have-a-question)
- [Styleguide](#styleguide)
- [Issues-Before-Pull-Requests Policy](#issues-before-pull-requests-policy)
- [Git/Github Workflow](#gitgithub-workflow)

## Vision

`SPARQL in the Dark` aims to be a guide for navigating unfamiliar knowledge graphs.

We envision a resource that combines practical, reusable query patterns with clear didactic explanations, empowering researchers and developers to systematically explore and understand unknown or only partially known RDF datasets.

Our goal is to build a community-driven collection where contributors share proven discovery strategies, document real-world exploration patterns, and develop tutorials that transform SPARQL from a query language into an investigative methodology.

Whether you're a digital humanist encountering a new dataset, a developer integrating an unknown endpoint, or a researcher mapping an undocumented graph, this project aims to provide the patterns and approaches you need to illuminate the dark.

## I Have a Question

> If you want to ask a question, we assume that you have read at least the README.

Before you ask a question, it is best to search for existing [Issues](https://github.com/acdh-oeaw/sparql-in-the-dark/issues) that might help you. In case you have found a suitable issue and still need clarification, you can write your question in this issue. It is also advisable to search the internet for answers first.

If you then still feel the need to ask a question and need clarification, we recommend the following:

- Open an [Issue](https://github.com/acdh-oeaw/sparql-in-the-dark/issues/new).
- Provide as much context as you can about what you're running into.
- Provide project and platform versions (nodejs, npm, etc), depending on what seems relevant.

We will then take care of the issue as soon as possible.

## Styleguide

### General

Please try to keep your commit changes focused on the change you want to implement - don't start fixing typos if your commit is actually about adding a feature.

### Commit Messages

`SPARQL in the Dark` uses [conventional commits](https://www.conventionalcommits.org/) so please format your commit messages accordingly.

Consider using a scope when writing a commit message. See [Commit message with scope](https://www.conventionalcommits.org/en/v1.0.0/#commit-message-with-scope).

## Issues-Before-Pull-Requests Policy

To keep the project focused, maintainable, and aligned with its vision, `SPARQL in the Dark` follows an Issue-first workflow.

> All PRs should reference an existing issue.

If you want to propose a change - whether it’s a bug fix, refactor, feature, or documentation update - please follow this process:

1. Open an Issue describing the problem/motivation/rationale and (optionally) a proposed approach towards Issue resolution.

> Issues must be narrow in scope and focus on a single topic.

2. Wait for maintainers to acknowledge or discuss the proposal.

Discussion should happen on the Issue and confirm scope, direction, and/or alternatives.

3. Only after the Issue is acknowledged, open a Pull Request that explicitly references it

> Pull Requests must be narrow in scope and focus on a single topic.

## Git/Github Workflow

`SPARQL in the Dark` uses a rebase workflow to keep history clean.

Please:

- Base your branch off the latest main

- Avoid merge commits in feature branches

- Ensure each commit is logically focused
