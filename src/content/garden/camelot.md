---
title: "The CAMELOT Framework"
description: "Context-Aware Multi-Expert Layered Orchestration Technology for AI agent systems"
maturity: evergreen
topic: ai
created: 2024-01-10
updated: 2024-04-01
tags: ["AI", "agents", "orchestration", "framework", "CAMELOT"]
relatedNotes: ["system-of-one", "ai-agent-patterns", "leverage-points-systems"]
featured: true
---

CAMELOT is my framework for orchestrating multiple AI agents into coherent systems. The name stands for **Context-Aware Multi-Expert Layered Orchestration Technology**.

## Core Principles

### Context Awareness
Agents need to understand not just their task, but their position in the larger system. A summarization agent behaves differently when it's feeding into a decision engine vs. producing human-readable output.

### Multi-Expert Architecture
No single model or prompt can handle every situation. CAMELOT uses specialized agents for different cognitive tasks, routing between them based on task requirements.

### Layered Orchestration
Like [[leverage-points-systems|Meadows' leverage points]], there are layers of control:

1. **Task Layer** — What specific action is being performed
2. **Context Layer** — What state and history inform the task
3. **Strategy Layer** — What approach governs multiple tasks
4. **Goal Layer** — What outcome the system is trying to achieve

### Technology Agnosticism
The framework isn't tied to any specific model or provider. The principles apply whether you're using Claude, GPT, or local models.

## Why This Matters

The current approach to AI agents is often either:
- Single-agent systems that try to do everything (brittle, confused)
- Multi-agent systems with no coherent orchestration (chaotic, redundant)

CAMELOT provides the missing middle: structure that enables specialization while maintaining coherence.

## Relation to System-of-One

[[system-of-one|System-of-One]] is my personal implementation of CAMELOT principles—a single-person operation augmented by well-orchestrated AI agents.

## Current Status

The framework is mature in concept but still evolving in implementation. Core patterns are stable; specific tooling continues to develop.
