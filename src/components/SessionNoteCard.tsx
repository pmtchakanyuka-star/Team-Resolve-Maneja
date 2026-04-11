import React from 'react';
import { Calendar, User, Edit, Trash2, Clock } from 'lucide-react';
import { SessionNote } from '../types';

interface SessionNoteCardProps {
  note: SessionNote;
  isCoach: boolean;
  onEdit?: (note: SessionNote) => void;
  onDelete?: (noteId: string) => void;
  t: any;
}

export function SessionNoteCard({ note, isCoach, onEdit, onDelete, t }: SessionNoteCardProps) {
  const formattedDate = new Date(note.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 sm:p-6">
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

        <div 
          className="prose prose-slate prose-sm max-w-none text-slate-600 mb-6 line-clamp-4"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />

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
            {note.createdAt?.toDate ? note.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
