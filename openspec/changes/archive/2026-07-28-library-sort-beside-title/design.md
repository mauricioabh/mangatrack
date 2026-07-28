## Context

After WAY-97, My Library title row is `title + count | search` and the second row is `chips | Sort`. Product feedback: place Sort next to the title instead.

## Goals / Non-Goals

**Goals:** Title cluster = My Library + count + Sort; search stays trailing; chips row chips-only.

**Non-Goals:** Sort behavior, prefs, chip logic.

## Decisions

### Sort beside title
**Choice:** Put Sort in the leading flex group after the count badge.  
**Why:** Matches “a la derecha del título”; search remains the primary trailing find control.  
**Alt:** Sort between title cluster and search as a middle column — rejected (harder wrap).

## Risks / Trade-offs

- [Narrow wrap] → Title/count/Sort may wrap before search; acceptable with flex-wrap.

## Migration Plan

1. UI move + spec update.
2. Rollback: revert layout.

## Open Questions

- None.
