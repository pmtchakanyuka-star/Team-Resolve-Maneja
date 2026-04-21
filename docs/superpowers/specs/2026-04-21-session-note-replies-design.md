# Session Note Replies & CSS Fix — Design Spec
Date: 2026-04-21

## Overview

Two changes to the session notes feature:
1. Fix a CSS bug that clips note content for non-editing users
2. Add bi-directional threaded replies so fighters can respond to coach notes and coaches can continue the conversation inline

---

## 1. CSS Fix — Note Content Truncation

**Problem:** `SessionNoteCard.tsx:60` applies `line-clamp-4` to the content div, capping all notes at 4 lines for every viewer. Fighters can only see full content when the note is open in edit mode (coach only).

**Fix:** Remove `line-clamp-4`. Replace with a controlled expand/collapse toggle:
- Default state: content capped at 4 lines via `line-clamp-4`
- A "Show more" chevron-down link appears when content overflows
- Clicking it removes the clamp and shows all content; chevron flips to "Show less"
- Both coaches and fighters get this behaviour

---

## 2. Threaded Replies

### Data Model

Add a `NoteReply` interface to `types.ts`:

```ts
interface NoteReply {
  id: string;          // crypto.randomUUID()
  authorId: string;
  authorName: string;
  role: 'coach' | 'fighter';
  content: string;
  createdAt: any;      // Firestore serverTimestamp
}
```

Extend `SessionNote` in `types.ts`:

```ts
interface SessionNote {
  // ...existing fields unchanged...
  replies?: NoteReply[];
}
```

Existing notes with no `replies` field render as empty threads — no migration needed.

**Write operations:**
- Add reply: `updateDoc(noteRef, { replies: arrayUnion(newReply) })`
- Delete reply: filter the existing `replies` array by `id` client-side, then `updateDoc(noteRef, { replies: filteredReplies })`. `arrayRemove` is not used because server timestamps make exact object matching unreliable.

### Reply Thread UI

The thread renders inside `SessionNoteCard` below the note content, visible to both coaches and fighters. No modal — fully inline.

**Layout:**
- Replies listed chronologically
- Each reply shows: author name, role badge ("Coach" / "Fighter"), formatted timestamp (date + HH:MM, matching existing app style), plain text content
- Trash icon on hover — coaches can delete any reply; fighters can only delete their own
- Plain text `<textarea>` + "Send" button at the bottom for composing a new reply
- Card expands vertically; no fixed height cap on the thread

**Permissions:**
- Coach: can read, write, and delete any reply
- Fighter: can read all replies, write new replies, delete only their own replies

**Out of scope for v1:** Unread indicators / per-user read tracking.

### Firestore Handler Changes

Two new handlers in `App.tsx`:

```ts
handleAddReply(noteId: string, content: string): Promise<void>
handleDeleteReply(noteId: string, reply: NoteReply): Promise<void>
```

These are passed as props through `CoachView` and `DashboardView` down to `SessionNoteCard`.

### Component Interface Changes

`SessionNoteCard` gains three optional props:
```ts
currentUserId: string
currentUserName: string
currentUserRole: 'coach' | 'fighter'
onAddReply?: (noteId: string, content: string) => Promise<void>
onDeleteReply?: (noteId: string, reply: NoteReply) => Promise<void>
```

---

## Affected Files

| File | Change |
|------|--------|
| `src/types.ts` | Add `NoteReply` interface; add `replies?` to `SessionNote` |
| `src/components/SessionNoteCard.tsx` | CSS fix + reply thread UI |
| `src/App.tsx` | Add `handleAddReply` / `handleDeleteReply`; pass props to card |
| `src/pages/CoachView.tsx` | Pass reply handlers + user context to `SessionNoteCard` |

---

## Out of Scope

- Rich text replies (plain text only)
- Unread / read receipt tracking
- Push notifications for new replies
- Reply editing (delete + re-post is sufficient for v1)
