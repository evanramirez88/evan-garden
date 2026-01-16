---
title: "Orchestrating AI Agents: Patterns and Pitfalls"
description: "Practical lessons from building multi-agent AI systems"
maturity: budding
topic: ai
created: 2024-03-01
updated: 2024-03-20
tags: ["AI", "agents", "orchestration", "automation", "systems"]
relatedNotes: ["camelot", "system-of-one", "systems-thinking-intro"]
featured: true
---

Building AI agents that actually work requires more than prompt engineering. It requires systems thinking—understanding how agents interact, fail, and recover.

## The Core Challenge

Single-turn AI is straightforward: input → output. Multi-agent orchestration is not. You're dealing with:
- **State management** across multiple calls
- **Error propagation** between agents
- **Context degradation** over long chains
- **Emergent behaviors** you didn't design

## Patterns That Work

### The Supervisor Pattern
One agent coordinates others. It:
- Breaks tasks into subtasks
- Routes subtasks to specialized agents
- Synthesizes results
- Handles failures and retries

This mirrors how good managers work—not doing everything, but orchestrating those who do.

### The Critic Pattern
Pair a generator agent with a critic agent:
1. Generator produces output
2. Critic evaluates against criteria
3. Generator revises based on feedback
4. Iterate until criteria met

This dramatically improves quality over single-pass generation.

### The Memory Pattern
Agents without memory repeat mistakes. Implement:
- **Short-term context** for the current task
- **Long-term memory** for learned patterns
- **Episodic recall** for similar past situations

The [[camelot|CAMELOT framework]] implements this through structured context windows and semantic retrieval.

## Pitfalls to Avoid

### The Telephone Game
Chain too many agents and quality degrades. Each handoff introduces interpretation drift. Keep chains short; prefer parallel over sequential.

### The Infinite Loop
Agents that can call other agents can recurse forever. Always implement:
- Maximum depth limits
- Time-based timeouts
- Token budget caps

### The Hallucination Cascade
One agent's hallucination becomes the next agent's fact. Build verification into the pipeline—agents that check other agents' work.

### The Context Cliff
Models have finite context windows. When you exceed them, behavior degrades unpredictably. Monitor context usage and implement summarization strategies.

## The Systems Perspective

Agent orchestration is a [[systems-thinking-intro|systems problem]]. You're designing:
- **Feedback loops** between agents
- **Balancing mechanisms** to prevent runaway behavior
- **Leverage points** where small changes have big effects

The most effective orchestration systems feel more like ecosystems than assembly lines.

## Current Best Practices

1. **Start simple.** One agent, one task. Add complexity only when needed.
2. **Log everything.** You'll need it for debugging.
3. **Build in observability.** Know what your agents are doing at all times.
4. **Plan for failure.** Every agent will fail. Design for graceful degradation.
5. **Iterate fast.** The field moves quickly. What works today may not work tomorrow.

## What's Next

The tooling is improving rapidly. We're moving from:
- Manual prompt chains → Declarative workflows
- Implicit state → Explicit state machines
- Trial and error → Systematic evaluation

The [[camelot|CAMELOT framework]] is my attempt to codify what I've learned. It's evolving as I learn more.
