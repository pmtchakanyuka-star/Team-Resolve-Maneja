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
    const check = () => setIsOverflowing(el.scrollHeight > el.clientHeight);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    check();
    return () => ro.disconnect();
  }, [note.content]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !onAddReply || sending) return;
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
                ? <><ChevronUp className="w-3 h-3" /> {t.showLess || 'Show less'}</>
                : <><ChevronDown className="w-3 h-3" /> {t.showMore || 'Show more'}</>}
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
                  const replyTime = reply.createdAt
                    ? new Date(reply.createdAt).toLocaleString([], {
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
