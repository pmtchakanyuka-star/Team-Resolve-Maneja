import React, { useState, useEffect } from 'react';
import { Plus, RefreshCcw, User as UserIcon, Edit, Trash2, ChevronRight, AlertCircle, Loader2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile, WeightEntry, Camp, FighterType, Sport, SessionNote } from '../types';
import { WeightOverviewChart } from '../components/charts/WeightOverviewChart';
import { SportBreakdownChart } from '../components/charts/SportBreakdownChart';
import { ProjectionChart } from '../components/charts/ProjectionChart';
import { CalorieWeightChart } from '../components/charts/CalorieWeightChart';
import { SessionNoteEditor } from '../components/SessionNoteEditor';
import { SessionNoteCard } from '../components/SessionNoteCard';

interface CoachViewProps {
  user: any;
  profile: UserProfile;
  allUsers: UserProfile[];
  entries: WeightEntry[];
  camps: Camp[];
  sessionNotes: SessionNote[];
  t: any;
  loading: boolean;
  refreshKey: number;
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
  selectedFighterId: string | null;
  setSelectedFighterId: React.Dispatch<React.SetStateAction<string | null>>;
  onAddFighter: () => void;
  onEditFighter: (fighter: UserProfile) => void;
  onDeleteFighter: (fighterId: string) => void;
  onSaveNote: (fighterId: string, title: string, content: string, sport: string, noteId?: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
}

export function CoachView({
  user,
  profile,
  allUsers,
  entries,
  camps,
  sessionNotes,
  t,
  loading,
  refreshKey,
  setRefreshKey,
  selectedFighterId,
  setSelectedFighterId,
  onAddFighter,
  onEditFighter,
  onDeleteFighter,
  onSaveNote,
  onDeleteNote
}: CoachViewProps) {
  const [selectedFighterTypeView, setSelectedFighterTypeView] = useState<FighterType | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<SessionNote | null>(null);

  const weightUnit = profile.weightUnit || 'kg';
  const convertWeight = (kg: number) => weightUnit === 'lbs' ? kg * 2.20462 : kg;

  // Filter fighters based on coach's assigned sports
  const accessibleFighters = React.useMemo(() => allUsers.filter(u => {
    if (profile.role === 'master_coach') return true;
    if (!profile.sports || profile.sports.length === 0) return true; // Fallback
    return u.sports?.some(s => profile.sports?.includes(s)) || (!u.sports && profile.sports.includes('mma'));
  }), [allUsers, profile]);

  const filteredFighters = React.useMemo(() => accessibleFighters.filter(u => {
    if (selectedFighterTypeView && u.fighterType !== selectedFighterTypeView) return false;
    
    if (statusFilter) {
      const fighterEntries = entries.filter(e => e.uid === u.uid).sort((a, b) => b.date.localeCompare(a.date));
      const latestEntry = fighterEntries.find(e => e.morningWeight || e.eveningWeight);
      const activeCamp = camps.find(c => c.uid === u.uid && c.isActive);
      const currentWeightKg = latestEntry?.morningWeight || latestEntry?.eveningWeight || activeCamp?.startingWeight || u.startingWeight || 0;
      const targetWeightKg = u.targetWeight || 0;
      
      const currentWeight = convertWeight(currentWeightKg);
      const targetWeight = convertWeight(targetWeightKg);

      let status = 'missing';
      if (latestEntry) {
        const daysSince = Math.floor((new Date().getTime() - new Date(latestEntry.date).getTime()) / (1000 * 3600 * 24));
        if (daysSince > 2) {
          status = 'missing';
        } else if (targetWeight > 0) {
          const overPercent = ((currentWeight - targetWeight) / targetWeight) * 100;
          if (overPercent <= 1) status = 'on-track';
          else if (overPercent <= 3) status = 'close';
          else status = 'over';
        } else {
          status = 'on-track';
        }
      }
      
      if (status !== statusFilter) return false;
    }
    
    return true;
  }), [accessibleFighters, selectedFighterTypeView, statusFilter, entries, weightUnit, camps]);

  const selectedFighter = accessibleFighters.find(u => u.uid === selectedFighterId);
  const selectedFighterEntries = entries.filter(e => e.uid === selectedFighterId);
  const activeCamp = camps.find(c => c.uid === selectedFighterId && c.isActive);
  const selectedFighterNotes = sessionNotes.filter(n => n.fighterId === selectedFighterId);

  // Compute latest entries for cards from the entries prop
  const fighterLatestEntries = React.useMemo(() => {
    const latest: Record<string, WeightEntry> = {};
    for (const fighter of filteredFighters) {
      const fighterEntries = entries.filter(e => e.uid === fighter.uid).sort((a, b) => b.date.localeCompare(a.date));
      const entryWithWeight = fighterEntries.find(e => e.morningWeight || e.eveningWeight);
      if (entryWithWeight) {
        latest[fighter.uid] = entryWithWeight;
      }
    }
    return latest;
  }, [filteredFighters, entries]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">{t.coachView || 'Coach Dashboard'}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={onAddFighter}
            className="bg-blue-600 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t.addFighter || 'Add Fighter'}</span>
          </button>
          <button 
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="bg-slate-100 text-slate-700 font-bold p-3 rounded-2xl hover:bg-slate-200 active:scale-95 transition-all"
            title="Refresh Data"
          >
            <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          
          {!selectedFighterId && (
            <>
              <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200">
                <select 
                  className="bg-transparent px-3 py-1 text-sm font-medium focus:outline-none"
                  value={selectedFighterTypeView || ''}
                  onChange={(e) => setSelectedFighterTypeView(e.target.value as FighterType || null)}
                >
                  <option value="">All Types</option>
                  <option value="professional">{t.professional || 'Professional'}</option>
                  <option value="amateur">{t.amateur || 'Amateur'}</option>
                  <option value="dojo_member">{t.dojoMember || 'Dojo Member'}</option>
                </select>
              </div>
              {statusFilter && (
                <button 
                  onClick={() => setStatusFilter(null)}
                  className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1"
                >
                  Clear Filter <X className="w-3 h-3" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {!selectedFighterId ? (
        <div className="space-y-6">
          {profile.role === 'master_coach' && (
            <SportBreakdownChart fighters={accessibleFighters} entries={entries} camps={camps} weightUnit={weightUnit} t={t} />
          )}
          
          <WeightOverviewChart 
            fighters={accessibleFighters} 
            entries={entries} 
            camps={camps}
            weightUnit={weightUnit} 
            onStatusClick={setStatusFilter}
            t={t} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFighters.length > 0 ? (
              filteredFighters.map(fighter => {
                const latestEntry = fighterLatestEntries[fighter.uid];
                const activeCamp = camps.find(c => c.uid === fighter.uid && c.isActive);
                const currentWeightKg = latestEntry?.morningWeight || latestEntry?.eveningWeight || activeCamp?.startingWeight || fighter.startingWeight || 0;
                const targetWeightKg = fighter.targetWeight || 0;
                
                const currentWeight = convertWeight(currentWeightKg);
                const targetWeight = convertWeight(targetWeightKg);
                
                let statusColor = 'bg-slate-50 border-slate-200 text-slate-700';
                let statusText = 'No Data';
                
                if (latestEntry) {
                  const daysSince = Math.floor((new Date().getTime() - new Date(latestEntry.date).getTime()) / (1000 * 3600 * 24));
                  if (daysSince > 2) {
                    statusColor = 'bg-red-50 border-red-200 text-red-700';
                    statusText = 'Missing Data';
                  } else if (targetWeight > 0) {
                    const overPercent = ((currentWeight - targetWeight) / targetWeight) * 100;
                    if (overPercent <= 1) {
                      statusColor = 'bg-green-50 border-green-200 text-green-700';
                      statusText = 'On Track';
                    } else if (overPercent <= 3) {
                      statusColor = 'bg-amber-50 border-amber-200 text-amber-700';
                      statusText = 'Close';
                    } else {
                      statusColor = 'bg-red-50 border-red-200 text-red-700';
                      statusText = 'Over';
                    }
                  } else {
                    statusColor = 'bg-green-50 border-green-200 text-green-700';
                    statusText = 'On Track';
                  }
                }

                const sportColors: Record<string, string> = {
                  'mma': 'bg-red-50 text-red-700 border-red-200',
                  'karate': 'bg-blue-50 text-blue-700 border-blue-200',
                  'kickboxing': 'bg-amber-50 text-amber-700 border-amber-200',
                  'jiu_jitsu': 'bg-purple-50 text-purple-700 border-purple-200',
                };
                const sportBadgeColor = sportColors[fighter.sports?.[0] || 'mma'] || 'bg-slate-100 text-slate-600 border-slate-200';

                return (
                  <div 
                    key={fighter.uid}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => setSelectedFighterId(fighter.uid)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img src={fighter.avatarUrl || 'https://img.icons8.com/fluency/96/monkey.png'} alt="avatar" className="w-12 h-12 rounded-full bg-slate-100" />
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{fighter.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${sportBadgeColor}`}>
                                {t[`sport${(fighter.sports?.[0] || 'mma').split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}`] || fighter.sports?.[0] || 'MMA'}
                              </span>
                              <span className="text-xs text-slate-500 capitalize">{t[fighter.fighterType || 'amateur'] || fighter.fighterType}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onEditFighter(fighter); }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteFighter(fighter.uid); }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-50 rounded-2xl p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{t.current || 'Current'}</p>
                          <p className="text-2xl font-bold text-slate-900">{currentWeight.toFixed(1)} <span className="text-sm font-medium text-slate-500">{weightUnit}</span></p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{t.target || 'Target'}</p>
                          <p className="text-2xl font-bold text-slate-900">{targetWeight.toFixed(1)} <span className="text-sm font-medium text-slate-500">{weightUnit}</span></p>
                        </div>
                      </div>

                      <div className={`text-xs font-bold px-3 py-2 rounded-xl border flex items-center justify-center ${statusColor}`}>
                        {statusText}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-white rounded-3xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
                <UserIcon className="w-12 h-12 text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t.noFightersYet || 'No fighters yet'}</h3>
                <p className="text-slate-500 mb-6 max-w-sm">
                  {statusFilter 
                    ? `No fighters match the status filter "${statusFilter}".` 
                    : t.addFirstFighter || 'Add your first fighter to start tracking their progress.'}
                </p>
                {!statusFilter && (
                  <button 
                    onClick={onAddFighter}
                    className="bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    {t.addFighter || 'Add Fighter'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSelectedFighterId(null)}
              className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              ← {t.back || 'Back'}
            </button>
            <h3 className="text-xl font-bold text-slate-900">{selectedFighter?.name}</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProjectionChart 
              entries={selectedFighterEntries} 
              camp={activeCamp || null} 
              targetWeight={selectedFighter?.targetWeight || 0} 
              weightUnit={weightUnit} 
              t={t} 
            />
            <CalorieWeightChart 
              entries={selectedFighterEntries} 
              weightUnit={weightUnit} 
              t={t} 
            />
          </div>
          
          {/* Session Notes Section */}
          <div className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">{t.sessionNotes}</h3>
              {!showNoteEditor && (
                <button
                  onClick={() => {
                    setEditingNote(null);
                    setShowNoteEditor(true);
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  {t.addNote}
                </button>
              )}
            </div>

            {showNoteEditor && (
              <SessionNoteEditor
                initialTitle={editingNote?.title}
                initialContent={editingNote?.content}
                initialSport={editingNote?.sport}
                availableSports={profile.sports && profile.sports.length > 0 ? profile.sports : ['mma']}
                t={t}
                onSave={async (title, content, sport) => {
                  await onSaveNote(selectedFighterId!, title, content, sport, editingNote?.id);
                  setShowNoteEditor(false);
                  setEditingNote(null);
                }}
                onCancel={() => {
                  setShowNoteEditor(false);
                  setEditingNote(null);
                }}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedFighterNotes.length > 0 ? (
                selectedFighterNotes.map(note => (
                  <SessionNoteCard
                    key={note.id}
                    note={note}
                    isCoach={true}
                    t={t}
                    onEdit={(n) => {
                      setEditingNote(n);
                      setShowNoteEditor(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onDelete={onDeleteNote}
                  />
                ))
              ) : (
                <div className="col-span-full bg-white rounded-3xl border border-slate-200 border-dashed p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                    <Edit className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{t.noNotesYet}</h4>
                  <p className="text-slate-500 max-w-xs">
                    {t.notesWillAppearHere}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
