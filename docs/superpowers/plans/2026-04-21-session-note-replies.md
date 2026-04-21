# Session Note Replies & CSS Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix note content truncation bug and add threaded plain-text replies to session notes, visible to both coaches and fighters.

**Architecture:** Replies are stored as a `NoteReply[]` array on each `session_notes` Firestore document. `SessionNoteCard` handles all display and input for the thread. Two new handlers in `App.tsx` (`handleAddReply`, `handleDeleteReply`) write to Firestore and are passed down via `CoachView` and `DashboardView`.

**Tech Stack:** React 19 + TypeScript, Tailwind CSS 4, Firebase Firestore (`arrayUnion` for adds, client-side filter + `updateDoc` for deletes), Lucide React icons.

---

## File Map

| File | Change |
|------|--------|
| `src/types.ts` | Add `NoteReply` export; add `replies?` to `SessionNote`; add `replyPlaceholder` translation key |
| `src/firebase.ts` | Export `arrayUnion` from Firestore |
| `src/components/SessionNoteCard.tsx` | Full rewrite: CSS expand/collapse + reply thread UI |
| `src/App.tsx` | Import `arrayUnion`, `NoteReply`; add handlers; update `DashboardView` props + call site; update `CoachView` call site |
| `src/pages/CoachView.tsx` | Add reply props to `CoachViewProps`; pass to `SessionNoteCard` |

---

### Task 1: Add `NoteReply` type and update `SessionNote`

**Files:**
- Modify: `src/types.ts:53` (insert `NoteReply` above `SessionNote`)
- Modify: `src/types.ts:53-64` (add `replies?` to `SessionNote`)
- Modify: `src/types.ts` TRANSLATIONS (add `replyPlaceholder` to `en` and `jp`)

- [ ] **Step 1: Insert `NoteReply` interface immediately above `SessionNote`**

In `src/types.ts`, before the line `export interface SessionNote {` (currently line 53), insert:

```ts
export interface NoteReply {
  id: string;
  authorId: string;
  authorName: string;
  role: 'coach' | 'fighter';
  content: string;
  createdAt: any;
}
```

- [ ] **Step 2: Add `replies?` to `SessionNote`**

After the `updatedAt: any;` line inside `SessionNote`, add:

```ts
  replies?: NoteReply[];
```

The complete updated `SessionNote` interface should read:

```ts
export interface SessionNote {
  id: string;
  fighterId: string;
  coachId: string;
  coachName: string;
  sport: string;
  date: string;
  title: string;
  content: string;
  createdAt: any;
  updatedAt: any;
  replies?: NoteReply[];
}
```

- [ ] **Step 3: Add `replyPlaceholder` to TRANSLATIONS**

In the `en` block (near `sessionNotes`, `addNote`, `saveNote` — around line 188), add:

```ts
    replyPlaceholder: "Write a reply... (Enter to send)",
```

In the `jp` block (same area, around line 341), add:

```ts
    replyPlaceholder: "返信を入力... (Enterで送信)",
```

- [ ] **Step 4: Verify TypeScript compiles**

Run from `Team Resolve Maneja/` directory:
```bash
npm run lint
```
Expected: Zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/types.ts
git commit -m "feat: add NoteReply type and replyPlaceholder translations"
```

---

### Task 2: Export `arrayUnion` from `src/firebase.ts`

**Files:**
- Modify: `src/firebase.ts:3` (Firestore import line)
- Modify: `src/firebase.ts:75` (re-export line)

- [ ] **Step 1: Add `arrayUnion` to the Firestore destructured import on line 3**

Replace the existing line 3 with:

```ts
import { initializeFirestore, collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp, getDocFromServer, deleteField, limit, writeBatch, enableNetwork, disableNetwork, getDocs, arrayUnion, type DocumentData } from 'firebase/firestore';
```

- [ ] **Step 2: Add `arrayUnion` to the re-export on line 75**

Replace the existing export line with:

```ts
export { signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword, updateEmail, collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp, deleteField, limit, writeBatch, enableNetwork, disableNetwork, getDocs, arrayUnion };
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npm run lint
```
Expected: Zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/firebase.ts
git commit -m "feat: export arrayUnion from firebase helpers"
```

---

### Task 3: Rewrite `SessionNoteCard.tsx` — CSS fix + reply thread

**Files:**
- Modify: `src/components/SessionNoteCard.tsx` (full rewrite)

- [ ] **Step 1: Replace entire file with the new implementation**

Write the following as the complete content of `src/components/SessionNoteCard.tsx`:

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, User, Edit, Trash2, Clock, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { SessionNote, NoteReply } from '../types';

interface SessionNoteCardProps {
  note: SessionNote;
  isCoach: boolean;
  onEdit?: (note: SessionNote) => void;
  onDelete?: (noteId: string) => void;
  t: any;
  currentUserId?: string;
  currentUserName?: string;
  currentUserRole?: 'coach' | 'fighter';
  onAddReply?: (noteId: string, content: string) => Promise<void>;
  onDeleteReply?: (noteId: string, reply: NoteReply) => Promise<void>;
}

export function SessionNoteCard({
  note, isCoach, onEdit, onDelete, t,
  currentUserId, currentUserName, currentUserRole,
  onAddReply, onDeleteReply
}: SessionNoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const formattedDate = new Date(note.date).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    setIsOverflowing(el.scrollHeight > el.clientHeight);
  }, [note.content]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !onAddReply) return;
    setSending(true);
    try {
      await onAddReply(note.id, replyText.trim());
      setReplyText('');
    } finally {
      setSending(false);
    }
  };

  const replies = note.replies || [];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 sm:p-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {note.sport === 'mma' ? t.sportMMA :
                 note.sport === 'karate' ? t.sportKarate :
                 note.sport === 'kickboxing' ? t.sportKickboxing :
                 t.sportJiuJitsu}
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{note.title}</h3>
          </div>

          {isCoach && (
            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit?.(note)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete?.(note.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Note content with expand/collapse */}
        <div className="mb-4">
          <div
            ref={contentRef}
            className={`prose prose-slate prose-sm max-w-none text-slate-600 ${!expanded ? 'line-clamp-4' : ''}`}
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
          {isOverflowing && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              {expanded
                ? <><ChevronUp className="w-3 h-3" /> Show less</>
                : <><ChevronDown className="w-3 h-3" /> Show more</>}
            </button>
          )}
        </div>

        {/* Footer: author + timestamp */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-slate-900">{note.coachName}</p>
              <p className="text-slate-500 uppercase tracking-tighter text-[10px]">{t.coach}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
            <Clock className="w-3 h-3" />
            {note.createdAt?.toDate
              ? note.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ''}
          </div>
        </div>

        {/* Reply thread — only rendered when onAddReply is provided */}
        {onAddReply && (
          <div className="mt-4 pt-4 border-t border-slate-100">

            {replies.length > 0 && (
              <div className="space-y-3 mb-4">
                {replies.map((reply) => {
                  const canDelete = isCoach || reply.authorId === currentUserId;
                  const replyTime = reply.createdAt?.toDate
                    ? reply.createdAt.toDate().toLocaleString([], {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })
                    : '';
                  return (
                    <div key={reply.id} className="group/reply flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{reply.authorName}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                            reply.role === 'coach'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {reply.role === 'coach' ? t.coach : t.fighter}
                          </span>
                          <span className="text-[10px] text-slate-400">{replyTime}</span>
                          {canDelete && (
                            <button
                              onClick={() => onDeleteReply?.(note.id, reply)}
                              className="opacity-0 group-hover/reply:opacity-100 ml-auto p-1 text-slate-300 hover:text-red-500 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap break-words">{reply.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reply input */}
            <div className="flex gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
                placeholder={t.replyPlaceholder || 'Write a reply...'}
                rows={2}
                className="flex-1 text-sm text-slate-700 placeholder:text-slate-300 border border-slate-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim() || sending}
                className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 active:scale-95 transition-all self-end"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run lint
```
Expected: Type errors only in consumers (`App.tsx`, `CoachView.tsx`) where new props aren't passed yet — those are expected at this stage. The component file itself should be clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/SessionNoteCard.tsx
git commit -m "feat: add expand/collapse and reply thread to SessionNoteCard"
```

---

### Task 4: Update `App.tsx` — add handlers and wire up components

**Files:**
- Modify: `src/App.tsx:7-37` (add `arrayUnion` to firebase import)
- Modify: `src/App.tsx:71` (add `NoteReply` to types import)
- Modify: `src/App.tsx` after `handleDeleteNote` (insert two new handlers)
- Modify: `src/App.tsx` `DashboardView` function definition (add reply props to signature)
- Modify: `src/App.tsx` `SessionNoteCard` inside `DashboardView` (pass reply props)
- Modify: `src/App.tsx` `<DashboardView>` call site (pass reply props)
- Modify: `src/App.tsx` `<CoachView>` call site (pass reply handlers)

- [ ] **Step 1: Add `arrayUnion` to the firebase import block**

In the firebase import block (lines 7–37), add `arrayUnion` to the destructure list:

```ts
import { 
  auth, 
  db, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
  updateEmail,
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  updateDoc,
  deleteDoc,
  deleteField,
  limit,
  arrayUnion,
  OperationType,
  handleFirestoreError,
  testConnection,
  writeBatch,
  enableNetwork,
  disableNetwork,
  getDocs,
} from './firebase';
```

- [ ] **Step 2: Add `NoteReply` to the types import (line 71)**

```ts
import { TRANSLATIONS, Role, Language, UserProfile, WeightEntry, Camp, FighterType, Sport, SessionNote, NoteReply } from './types';
```

- [ ] **Step 3: Insert `handleAddReply` and `handleDeleteReply` after `handleDeleteNote`**

After the closing `};` of `handleDeleteNote` (currently around line 629), insert:

```ts
  const handleAddReply = async (noteId: string, content: string) => {
    if (!user || !profile) return;
    const replyRole: 'coach' | 'fighter' =
      (profile.role === 'coach' || profile.role === 'master_coach') ? 'coach' : 'fighter';
    const reply: NoteReply = {
      id: crypto.randomUUID(),
      authorId: user.uid,
      authorName: profile.name,
      role: replyRole,
      content,
      createdAt: serverTimestamp(),
    };
    try {
      await updateDoc(doc(db, 'session_notes', noteId), { replies: arrayUnion(reply) });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'session_notes');
    }
  };

  const handleDeleteReply = async (noteId: string, reply: NoteReply) => {
    const note = sessionNotes.find(n => n.id === noteId);
    if (!note) return;
    const filteredReplies = (note.replies || []).filter(r => r.id !== reply.id);
    try {
      await updateDoc(doc(db, 'session_notes', noteId), { replies: filteredReplies });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'session_notes');
    }
  };
```

- [ ] **Step 4: Update `DashboardView` function signature**

Find the `function DashboardView({` definition (around line 2459). Replace the existing props destructure and type annotation with:

```ts
function DashboardView({ entries, chartData, t, profile, isCoach, onUpdatePlan, onEdit, activeCamp, sessionNotes, currentUserId, currentUserName, currentUserRole, onAddReply, onDeleteReply }: { 
  entries: WeightEntry[], 
  chartData: any[], 
  t: any, 
  profile: UserProfile | null,
  isCoach?: boolean,
  onUpdatePlan?: (field: string, value: string) => void,
  onEdit?: (entry: WeightEntry) => void,
  activeCamp?: Camp | null,
  sessionNotes: SessionNote[],
  currentUserId?: string,
  currentUserName?: string,
  currentUserRole?: 'coach' | 'fighter',
  onAddReply?: (noteId: string, content: string) => Promise<void>,
  onDeleteReply?: (noteId: string, reply: NoteReply) => Promise<void>,
}) {
```

- [ ] **Step 5: Pass reply props to `SessionNoteCard` inside `DashboardView`**

Find the `<SessionNoteCard` inside `DashboardView` (around line 2909). Replace it with:

```tsx
<SessionNoteCard
  key={note.id}
  note={note}
  isCoach={false}
  t={t}
  currentUserId={currentUserId}
  currentUserName={currentUserName}
  currentUserRole={currentUserRole}
  onAddReply={onAddReply}
  onDeleteReply={onDeleteReply}
/>
```

- [ ] **Step 6: Update the `<DashboardView>` JSX call site (around line 2003)**

Add these five props to the existing `<DashboardView ...>` element:

```tsx
currentUserId={user.uid}
currentUserName={profile?.name || ''}
currentUserRole={(profile?.role === 'coach' || profile?.role === 'master_coach') ? 'coach' : 'fighter'}
onAddReply={handleAddReply}
onDeleteReply={handleDeleteReply}
```

- [ ] **Step 7: Update the `<CoachView>` JSX call site (around line 1820)**

Add these two props to the existing `<CoachView ...>` element:

```tsx
onAddReply={handleAddReply}
onDeleteReply={handleDeleteReply}
```

- [ ] **Step 8: Verify TypeScript compiles**

```bash
npm run lint
```
Expected: Only CoachView-related errors (props not yet declared in `CoachViewProps`). No errors in App.tsx itself.

- [ ] **Step 9: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add reply handlers and wire up to DashboardView and CoachView"
```

---

### Task 5: Update `CoachView.tsx` — accept and pass reply props

**Files:**
- Modify: `src/pages/CoachView.tsx:4` (types import)
- Modify: `src/pages/CoachView.tsx:12-30` (`CoachViewProps` interface)
- Modify: `src/pages/CoachView.tsx:32-50` (function destructuring)
- Modify: `src/pages/CoachView.tsx:427-438` (`SessionNoteCard` JSX)

- [ ] **Step 1: Add `NoteReply` to types import (line 4)**

```ts
import { UserProfile, WeightEntry, Camp, FighterType, Sport, SessionNote, NoteReply } from '../types';
```

- [ ] **Step 2: Add reply props to `CoachViewProps` interface**

After `onDeleteNote: (noteId: string) => Promise<void>;`, add:

```ts
  onAddReply: (noteId: string, content: string) => Promise<void>;
  onDeleteReply: (noteId: string, reply: NoteReply) => Promise<void>;
```

- [ ] **Step 3: Destructure the new props in the `CoachView` function**

After `onDeleteNote` in the destructure pattern, add:

```ts
  onAddReply,
  onDeleteReply,
```

- [ ] **Step 4: Pass reply props to `SessionNoteCard` in the coach notes grid**

Find the `<SessionNoteCard` in CoachView (around line 427). Replace it with:

```tsx
<SessionNoteCard
  key={note.id}
  note={note}
  isCoach={true}
  t={t}
  currentUserId={user.uid}
  currentUserName={profile.name}
  currentUserRole="coach"
  onAddReply={onAddReply}
  onDeleteReply={onDeleteReply}
  onEdit={(n) => {
    setEditingNote(n);
    setShowNoteEditor(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }}
  onDelete={onDeleteNote}
/>
```

- [ ] **Step 5: Verify TypeScript compiles clean with zero errors**

```bash
npm run lint
```
Expected: Zero errors across all files.

- [ ] **Step 6: Final commit**

```bash
git add src/pages/CoachView.tsx
git commit -m "feat: wire reply props through CoachView to SessionNoteCard"
```
