import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, 
  Smile, Save, X 
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SessionNoteEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialSport?: string;
  onSave: (title: string, content: string, sport: string) => void;
  onCancel: () => void;
  t: any;
  availableSports?: string[];
}

const EMOJIS = ['💪', '🥊', '🥋', '🤼', '🏆', '⚡', '🔥', '🎯', '📊', '📈', '✅', '⚠️', '❌', '💧', '🍎', '😤', '👊', '🧠', '💯', '🕐', '📝', '👍', '👎', '💬', '🏅', '🎽', '🩺', '⚖️', '📅', '🔑', '😅', '🙏', '👏', '💦', '🧊', '🥗', '😴', '🏋️', '⏱️', '🫁'];

export function SessionNoteEditor({ 
  initialTitle = '', 
  initialContent = '', 
  initialSport = 'mma',
  onSave, 
  onCancel, 
  t,
  availableSports = ['mma', 'karate', 'kickboxing', 'jiu_jitsu']
}: SessionNoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [sport, setSport] = useState(initialSport);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiPickerRef]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: t.notesWillAppearHere || 'Write session notes...',
      }),
    ],
    content: initialContent,
  });

  if (!editor) {
    return null;
  }

  const handleSave = () => {
    if (title.trim()) {
      onSave(title, editor.getHTML(), sport);
    }
  };

  const addEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run();
    setShowEmojiPicker(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 sm:p-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">{initialTitle ? t.editNote : t.addNote}</h3>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.noteTitle || 'Session Title'}
          className="w-full text-xl font-bold text-slate-900 placeholder:text-slate-300 border-none focus:ring-0 p-0 mb-2"
          autoFocus
        />

        <div className="flex items-center gap-2 mt-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.sport}:</label>
          <div className="flex flex-wrap gap-2">
            {availableSports.map(s => (
              <button
                key={s}
                onClick={() => setSport(s)}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all",
                  sport === s 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                {s === 'mma' ? t.sportMMA : 
                 s === 'karate' ? t.sportKarate : 
                 s === 'kickboxing' ? t.sportKickboxing : 
                 t.sportJiuJitsu}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border-b border-slate-100 p-1.5 sm:p-2 flex flex-wrap items-center gap-0.5 sm:gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "p-2 rounded-lg transition-all",
            editor.isActive('bold') ? "bg-blue-100 text-blue-600" : "text-slate-600 hover:bg-slate-200"
          )}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "p-2 rounded-lg transition-all",
            editor.isActive('italic') ? "bg-blue-100 text-blue-600" : "text-slate-600 hover:bg-slate-200"
          )}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            "p-2 rounded-lg transition-all",
            editor.isActive('underline') ? "bg-blue-100 text-blue-600" : "text-slate-600 hover:bg-slate-200"
          )}
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        
        <div className="w-px h-4 bg-slate-300 mx-1" />
        
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-2 rounded-lg transition-all",
            editor.isActive('bulletList') ? "bg-blue-100 text-blue-600" : "text-slate-600 hover:bg-slate-200"
          )}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "p-2 rounded-lg transition-all",
            editor.isActive('orderedList') ? "bg-blue-100 text-blue-600" : "text-slate-600 hover:bg-slate-200"
          )}
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-300 mx-1" />

        <div className="relative" ref={emojiPickerRef}>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={cn(
              "p-2 rounded-lg transition-all",
              showEmojiPicker ? "bg-blue-100 text-blue-600" : "text-slate-600 hover:bg-slate-200"
            )}
          >
            <Smile className="w-4 h-4" />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 grid grid-cols-6 sm:grid-cols-8 gap-1 w-56 sm:w-72 max-w-[calc(100vw-2rem)] animate-in fade-in zoom-in-95 duration-200">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-100 rounded-xl transition-all"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 min-h-[200px] prose prose-slate max-w-none">
        <EditorContent editor={editor} className="outline-none" />
      </div>

      <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-all"
        >
          {t.cancel}
        </button>
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 active:scale-95 transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {t.saveNote}
        </button>
      </div>

      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #cbd5e1;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror {
          outline: none;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }
      `}</style>
    </div>
  );
}
