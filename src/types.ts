export type Role = 'fighter' | 'coach' | 'master_coach';
export type Language = 'en' | 'jp';
export type FighterType = 'professional' | 'amateur' | 'dojo_member';
export type Sport = 'mma' | 'karate' | 'kickboxing' | 'jiu_jitsu';

export interface UserProfile {
  uid: string;
  email: string;
  role: Role;
  name: string;
  language: Language;
  maintenanceCalories?: number;
  targetWeight?: number;
  startingWeight?: number;
  saltCutEstimate?: number;
  waterCutEstimate?: number;
  avatarUrl?: string;
  onboardingCompleted?: boolean;
  hasConsented?: boolean;
  currentCampId?: string;
  fighterType?: FighterType;
  sports?: Sport[];
  weightUnit?: 'kg' | 'lbs';
  guidanceOptOuts?: { coach?: boolean; dashboard?: boolean; settings?: boolean };
}

export interface Camp {
  id: string;
  uid: string;
  name: string;
  startDate: string;
  targetDate?: string;
  targetWeight: number;
  startingWeight: number;
  isActive: boolean;
}

export interface WeightEntry {
  id?: string;
  uid: string;
  date: string;
  morningWeight?: number;
  eveningWeight?: number;
  caloriesText?: string;
  estimatedCalories?: number;
  waterIntake?: number;
  mood?: 1 | 2 | 3 | 4 | 5;
  timestamp: any;
  userName?: string;
  campId?: string;
}

export interface NoteReply {
  id: string;
  authorId: string;
  authorName: string;
  role: 'coach' | 'fighter'; // master_coach users are stored as 'coach'
  content: string;
  createdAt: any;
}

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

export const TRANSLATIONS = {
  en: {
    title: "Team Resolve",
    privacyPolicy: "Privacy Policy",
    termsConditions: "Terms and Conditions",
    changePassword: "Change Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    changeUsername: "Change Nickname",
    newUsername: "New Nickname",
    massEdit: "Mass Edit Entries",
    saveAll: "Save All",
    login: "Login",
    logout: "Logout",
    morningWeight: "Morning Weight",
    eveningWeight: "Evening Weight",
    caloriesInput: "What did you eat today?",
    estimate: "Estimate Calories",
    save: "Save Entry",
    history: "Weight History",
    trend: "Weight Trend",
    date: "Date",
    morning: "Morning",
    evening: "Evening",
    calories: "Calories",
    coachView: "Coach Dashboard",
    fighterView: "Fighter Dashboard",
    noData: "No data available",
    estimating: "Estimating calories...",
    roleSelection: "Select your role",
    fighter: "Fighter",
    coach: "Coach",
    language: "Language",
    estimated: "Estimated",
    dailyAverage: "Daily Average",
    weeklyDeficit: "Weekly Caloric Deficit",
    allFighters: "All Fighters",
    selectFighter: "Select Fighter",
    back: "Back",
    settings: "Settings",
    maintenanceCalories: "Maintenance Calories (kcal)",
    targetWeight: "Target Weight",
    startingWeight: "Starting Weight",
    saveSettings: "Save Settings",
    deficitInfo: "Calculated based on your maintenance calories minus actual intake over the last 7 days.",
    target: "Target",
    waterIntake: "Water Intake (L)",
    saltCut: "Salt Cut",
    waterCut: "Water Cut",
    remainingToLose: "Weight to Lose (Pre-Fight Week)",
    bulkEntry: "Bulk Entry",
    addRows: "Add Rows",
    current: "Current",
    plan: "Fight Week Plan",
    coachNotes: "Coach's Cut Plan",
    nickname: "Nickname",
    fighterName: "Nickname",
    status: "Status",
    edit: "Edit",
    delete: "Delete",
    selectAvatar: "Select your icon",
    onboardingTitle: "Welcome to Team Resolve!",
    onboardingStep1: "Track your morning and evening weight daily to see trends.",
    onboardingStep2: "Use the AI calorie estimator to log your meals easily.",
    onboardingStep3: "Coaches can set your Salt and Water cut plans for fight week.",
    onboardingStep4: "Monitor your progress towards your target weight in real-time.",
    gotIt: "Got it!",
    next: "Next",
    skip: "Skip",
    campName: "Camp Name",
    activeCamp: "Active Camp",
    createCamp: "Start New Camp",
    overallTrend: "Overall Trend",
    campTrend: "Camp Specific Trend",
    noCamp: "No active camp",
    competition: "Competition",
    competitionName: "Competition Name",
    cancel: "Cancel",
    forgotPassword: "Forgot Password?",
    masterPassword: "Master Password",
    resetPassword: "Reset Password",
    invalidMasterPassword: "Invalid master password",
    passwordResetSuccess: "Password reset successfully! You can now log in.",
    addFighter: "Add Fighter",
    editFighter: "Edit Fighter",
    deleteFighter: "Delete Fighter",
    confirmDelete: "Are you sure you want to delete this fighter? This action cannot be undone.",
    nicknameTaken: "This nickname is already taken. Please choose another one.",
    fighterType: "Fighter Type",
    professional: "Professional",
    amateur: "Amateur",
    dojoMember: "Dojo Member",
    guidanceOptOut: "Don't show this again",
    guidanceDashboard: "Welcome to your dashboard! Here you can track your daily weight, see your progress towards your target, and log your meals.",
    guidanceCoach: "Welcome to the Coach Dashboard! Here you can manage your fighters, set their cut plans, and monitor their progress. Click on a fighter type to see a summary chart.",
    guidanceSettings: "Manage your profile, update your target weight, and customize your avatar here.",
    noRecentData: "No recent data",
    consentTitle: "Welcome to Resolve MMA",
    consentTerms: "I agree to the Terms of Use and Privacy Policy.",
    consentAge: "I am 18 or older, or I have parental consent.",
    consentCoach: "I agree to share my weight data with my coach.",
    consentButton: "Agree & Continue",
    privacyPolicyContent: "Privacy Policy\n\n1. Data Collection\nWe collect weight data and basic profile information to provide our services.\n\n2. Data Usage\nYour data is used to track your progress and, if you are a fighter, may be shared with your coach.\n\n3. Data Protection\nWe implement standard security measures to protect your data.\n\n4. APPI Compliance\nFor users in Japan, we comply with the Act on the Protection of Personal Information (APPI). You have the right to request access, correction, or deletion of your data.",
    termsConditionsContent: "Terms of Use\n\n1. Acceptance of Terms\nBy using Resolve MMA, you agree to these terms.\n\n2. User Responsibilities\nYou are responsible for maintaining the confidentiality of your account.\n\n3. Medical Disclaimer\nThis app is for informational purposes only and does not provide medical advice. Consult a physician before starting any weight management program.",
    securityProfile: "Security & Profile",
    overwriteTitle: "Overwrite Entry?",
    overwriteBody: "You already logged {morning} this morning and {evening} this evening. Overwrite?",
    overwriteConfirm: "Overwrite",
    weightSaved: "Weight saved successfully",
    updateEntry: "Update Entry",
    bulkSubtitle: "Mass edit multiple entries",
    started: "Started",
    targetVsCurrent: "Target vs Current",
    actualToLose: "Actual weight to lose before cut",
    saltCutNote: "Estimated salt cut during fight week",
    waterCutNote: "Estimated water cut during cut",
    nicknameChangeNote: "Changing this will change your login nickname.",
    googleLoginDeprecated: "Google login has been deprecated. Please use your nickname.",
    noFightersYet: "No fighters yet",
    addFirstFighter: "Add your first fighter",
    noEntriesYet: "No entries yet",
    startLogging: "Start logging your weight today",
    sessionNotes: "Session Notes",
    addNote: "Add Note",
    noteTitle: "Session Title",
    saveNote: "Save Note",
    replyPlaceholder: "Write a reply... (Enter to send)",
    editNote: "Edit Note",
    deleteNote: "Delete Note",
    noNotesYet: "No notes yet",
    notesWillAppearHere: "Session notes recorded by your coach will appear here",
    sport: "Sport",
    sportMMA: "MMA",
    sportKarate: "Karate",
    sportKickboxing: "Kickboxing",
    sportJiuJitsu: "Jiu-Jitsu",
    allSports: "All Sports",
    coachSports: "Assigned Sports",
    projectedWeight: "Projected Weight",
    onTrack: "On Track",
    atRisk: "At Risk",
    weightUnit: "Weight Unit",
    switchToLbs: "Switch to lbs",
    switchToKg: "Switch to kg",
    teamManagement: "Team Management",
    promoteToMaster: "Promote to Master Coach",
    demoteToCoach: "Change to Sport Coach",
    promotionConfirmTitle: "Promote to Master Coach?",
    promotionConfirmBody: "Promote {name} to Master Coach? They will be able to see all fighters across all sports.",
    promoted: "Promoted successfully",
    demoted: "Changed successfully",
    lastMasterCoach: "Cannot change the last Master Coach",
    resetInstructions: "To reset your password, contact your Master Coach or Team Resolve admin.",
    comingSoon: "Coming Soon"
  },
  jp: {
    title: "Team Resolve",
    privacyPolicy: "プライバシーポリシー",
    termsConditions: "利用規約",
    changePassword: "パスワード変更",
    newPassword: "新しいパスワード",
    confirmPassword: "パスワードの確認",
    changeUsername: "ニックネーム変更",
    newUsername: "新しいニックネーム",
    massEdit: "一括編集",
    saveAll: "すべて保存",
    login: "ログイン",
    logout: "ログアウト",
    morningWeight: "朝の体重",
    eveningWeight: "夜の体重",
    caloriesInput: "今日の食事内容は？",
    estimate: "カロリーを推定",
    save: "記録を保存",
    history: "体重履歴",
    trend: "体重トレンド",
    date: "日付",
    morning: "朝",
    evening: "夜",
    calories: "カロリー",
    coachView: "コーチダッシュボード",
    fighterView: "選手ダッシュボード",
    noData: "データがありません",
    estimating: "カロリーを推定中...",
    roleSelection: "ロールを選択してください",
    fighter: "選手",
    coach: "コーチ",
    language: "言語",
    estimated: "推定",
    dailyAverage: "1日の平均",
    weeklyDeficit: "週間のカロリー不足",
    allFighters: "全選手",
    selectFighter: "選手を選択",
    back: "戻る",
    settings: "設定",
    maintenanceCalories: "維持カロリー (kcal)",
    targetWeight: "目標体重",
    startingWeight: "開始時の体重",
    saveSettings: "設定を保存",
    deficitInfo: "維持カロリーから過去7日間の摂取カロリーを引いて算出されます。",
    target: "目標",
    waterIntake: "水分摂取量 (L)",
    saltCut: "塩分カット",
    waterCut: "水抜き",
    remainingToLose: "残り減量幅 (試合前週まで)",
    bulkEntry: "一括入力",
    addRows: "行を追加",
    current: "現在",
    plan: "試合週プラン",
    coachNotes: "コーチの減量プラン",
    nickname: "ニックネーム",
    fighterName: "ニックネーム",
    status: "ステータス",
    edit: "編集",
    delete: "削除",
    selectAvatar: "アイコンを選択してください",
    onboardingTitle: "Team Resolveへようこそ！",
    onboardingStep1: "毎日の朝と夜の体重を記録してトレンドを確認しましょう。",
    onboardingStep2: "AIカロリー推定機能を使って食事を簡単に記録できます。",
    onboardingStep3: "コーチは試合週の塩分・水抜きプランを設定できます。",
    onboardingStep4: "目標体重への進捗をリアルタイムで監視できます。",
    gotIt: "了解！",
    next: "次へ",
    skip: "スキップ",
    campName: "キャンプ名",
    activeCamp: "現在のキャンプ",
    createCamp: "新しいキャンプを開始",
    overallTrend: "全体のトレンド",
    campTrend: "キャンプ別トレンド",
    noCamp: "アクティブなキャンプはありません",
    competition: "大会",
    competitionName: "大会名",
    cancel: "キャンセル",
    forgotPassword: "パスワードを忘れましたか？",
    masterPassword: "マスターパスワード",
    resetPassword: "パスワードをリセット",
    invalidMasterPassword: "マスターパスワードが正しくありません",
    passwordResetSuccess: "パスワードがリセットされました。ログインできます。",
    addFighter: "選手を追加",
    editFighter: "選手を編集",
    deleteFighter: "選手を削除",
    confirmDelete: "この選手を削除してもよろしいですか？この操作は取り消せません。",
    nicknameTaken: "このニックネームは既に使用されています。別の名前を選んでください。",
    fighterType: "ファイタータイプ",
    professional: "プロ",
    amateur: "アマチュア",
    dojoMember: "道場生",
    guidanceOptOut: "今後表示しない",
    guidanceDashboard: "ダッシュボードへようこそ！ここでは毎日の体重を記録し、目標への進捗を確認し、食事を記録できます。",
    guidanceCoach: "コーチダッシュボードへようこそ！ここではファイターを管理し、減量プランを設定し、進捗を監視できます。ファイタータイプをクリックすると概要チャートが表示されます。",
    guidanceSettings: "プロフィールの管理、目標体重の更新、アイコンのカスタマイズはこちらで行えます。",
    noRecentData: "未入力",
    consentTitle: "Resolve MMAへようこそ",
    consentTerms: "利用規約とプライバシーポリシーに同意します。",
    consentAge: "18歳以上であるか、保護者の同意を得ています。",
    consentCoach: "コーチと体重データを共有することに同意します。",
    consentButton: "同意して進む",
    privacyPolicyContent: "プライバシーポリシー\n\n1. データ収集\n当サービスを提供するため、体重データと基本的なプロフィール情報を収集します。\n\n2. データ利用\nお客様のデータは進捗状況の追跡に使用され、ファイターの場合はコーチと共有される場合があります。\n\n3. データ保護\nお客様のデータを保護するため、標準的なセキュリティ対策を実施しています。\n\n4. 個人情報保護法（APPI）の遵守\n日本国内のユーザーに対して、個人情報の保護に関する法律（APPI）を遵守します。お客様はご自身のデータの開示、訂正、削除を要求する権利を有します。",
    termsConditionsContent: "利用規約\n\n1. 規約への同意\nResolve MMAを使用することにより、これらの規約に同意したものとみなされます。\n\n2. ユーザーの責任\nアカウントの機密性を維持する責任はお客様にあります。\n\n3. 医療に関する免責事項\nこのアプリは情報提供のみを目的としており、医学的なアドバイスを提供するものではありません。減量プログラムを開始する前に医師にご相談ください。",
    securityProfile: "セキュリティとプロフィール",
    overwriteTitle: "記録を上書きしますか？",
    overwriteBody: "今朝{morning}、今夜{evening}を記録済みです。上書きしますか？",
    overwriteConfirm: "上書き",
    weightSaved: "体重を保存しました",
    updateEntry: "記録を更新",
    bulkSubtitle: "複数の記録を一括管理",
    started: "開始日",
    targetVsCurrent: "目標 vs 現在",
    actualToLose: "カット前に落とすべき体重",
    saltCutNote: "ファイトウィーク中の塩分カット見込み",
    waterCutNote: "カット中の水分減少見込み",
    nicknameChangeNote: "変更するとログインニックネームも変わります",
    googleLoginDeprecated: "Googleログインは廃止されました。ニックネームをご使用ください。",
    noFightersYet: "選手がまだいません",
    addFirstFighter: "最初の選手を追加する",
    noEntriesYet: "記録がまだありません",
    startLogging: "今日から体重を記録しよう",
    sessionNotes: "セッションノート",
    addNote: "ノートを追加",
    noteTitle: "セッションタイトル",
    saveNote: "ノートを保存",
    replyPlaceholder: "返信を入力... (Enterで送信)",
    editNote: "ノートを編集",
    deleteNote: "ノートを削除",
    noNotesYet: "ノートがまだありません",
    notesWillAppearHere: "コーチが記録したセッションノートがここに表示されます",
    sport: "競技",
    sportMMA: "MMA",
    sportKarate: "空手",
    sportKickboxing: "キックボクシング",
    sportJiuJitsu: "柔術",
    allSports: "全競技",
    coachSports: "担当競技",
    projectedWeight: "予測体重",
    onTrack: "順調",
    atRisk: "要注意",
    weightUnit: "体重単位",
    switchToLbs: "lbsに切り替え",
    switchToKg: "kgに切り替え",
    teamManagement: "チーム管理",
    promoteToMaster: "マスターコーチに昇格",
    demoteToCoach: "スポーツコーチに変更",
    promotionConfirmTitle: "マスターコーチに昇格しますか？",
    promotionConfirmBody: "{name}をマスターコーチに昇格しますか？全競技の選手データが閲覧できるようになります。",
    promoted: "昇格しました",
    demoted: "変更しました",
    lastMasterCoach: "最後のマスターコーチは変更できません",
    resetInstructions: "パスワードをリセットするには、マスターコーチまたは管理者にお問い合わせください。",
    comingSoon: "近日公開"
  }
};
