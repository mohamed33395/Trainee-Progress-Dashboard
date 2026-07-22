export type Language = 'en' | 'ar'

export interface Translations {
  common: {
    dashboard: string
    trainees: string
    teachers: string
    dailyReport: string
    studentDetails: string
    studentReports: string
    analytics: string
    settings: string
    tasks: string
    profile: string
    search: string
    add: string
    edit: string
    delete: string
    save: string
    cancel: string
    actions: string
    view: string
    name: string
    email: string
    status: string
    progress: string
    week: string
    day: string
    date: string
    total: string
    active: string
    inactive: string
    onLeave: string
    completed: string
    onHold: string
    dropped: string
    appName: string
    admin: string
    teamLeader: string
    teacher: string
    trainee: string
    userManagement: string
    select: string
  }
  dashboard: {
    title: string
    subtitle: string
    totalTrainees: string
    activeTrainees: string
    averageProgress: string
    completedReports: string
    weeklyStatistics: string
    statusDistribution: string
    traineeProgress: string
    topPerformers: string
  }
  trainees: {
    title: string
    subtitle: string
    addTrainee: string
    allTrainees: string
    currentWeek: string
    startDate: string
    noTrainees: string
    deleteConfirm: string
  }
  teachers: {
    title: string
    subtitle: string
    addTeacher: string
    allTeachers: string
    subject: string
    experience: string
    assignedTrainees: string
    years: string
    noTeachers: string
    deleteConfirm: string
  }
  dailyReport: {
    title: string
    subtitle: string
    generalInfo: string
    traineeName: string
    selectTrainee: string
    topics: string
    tasks: string
    addTask: string
    evaluation: string
    strengths: string
    needsImprovement: string
    dailyNotes: string
    tomorrowPlan: string
    overallProgress: string
    saveReport: string
  }
  studentDetails: {
    title: string
    profile: string
    overview: string
    skillsProgress: string
    reportsHistory: string
    evaluation: string
    weeklyProgress: string
    evaluationDetails: string
    recentEvaluations: string
    noReports: string
    noEvaluationData: string
    overallProgress: string
    age: string
    origin: string
    languageLevel: string
    duration: string
    assignedCoach: string
    notAssigned: string
  }
  studentReports: {
    title: string
    subtitle: string
    allStudents: string
    searchStudents: string
    noStudents: string
    languageLevel: string
    reports: string
    viewReports: string
    studentNotFound: string
    viewProgressReports: string
    downloadAllReports: string
    download: string
    noReportsAvailable: string
    topics: string
    strengths: string
    areasForImprovement: string
    dailyNotes: string
    enrolled: string
  }
  analytics: {
    title: string
    subtitle: string
    averageProgress: string
    totalReports: string
    completionRate: string
    activeTrainees: string
    skillsDistribution: string
    progressByStatus: string
    weeklyTrends: string
    topSkills: string
    performanceDistribution: string
    evaluationAverages: string
  }
  settings: {
    title: string
    subtitle: string
    profileSettings: string
    fullName: string
    notificationPreferences: string
    emailNotifications: string
    pushNotifications: string
    weeklyReports: string
    appearance: string
    theme: string
    light: string
    dark: string
    system: string
    dataManagement: string
    dataStorage: string
    exportData: string
    dangerZone: string
    clearAllData: string
    clearWarning: string
    privacy: string
    dataPrivacy: string
  }
  traineeForm: {
    addTitle: string
    editTitle: string
    fullName: string
    email: string
    status: string
    startDate: string
    currentWeek: string
    skills: string
    save: string
    cancel: string
    photo: string
    assignedTeacher: string
    noTeacherAssigned: string
    selectTeacher: string
  }
  teacherForm: {
    addTitle: string
    editTitle: string
    fullName: string
    email: string
    subject: string
    experience: string
    status: string
    save: string
    cancel: string
    photo: string
    assignedTrainees: string
    noTraineesAvailable: string
    traineesSelected: string
  }
  tasks: {
    title: string
    subtitle: string
    addTask: string
    allTasks: string
    taskTitle: string
    taskDescription: string
    taskImage: string
    assignTo: string
    selectTrainee: string
    dueDate: string
    status: string
    pending: string
    submitted: string
    completed: string
    rejected: string
    submitTask: string
    codeSnippetImage: string
    projectImage: string
    taskDetails: string
    instructorRating: string
    instructorFeedback: string
    reviewTask: string
    approve: string
    reject: string
    noTasks: string
    submissionDetails: string
    submittedAt: string
    reviewedAt: string
    maxScore: string
    skills: string
  }
  auth: {
    login: string
    username: string
    password: string
    signIn: string
    invalidCredentials: string
    demoCredentials: string
    resetPassword: string
    resetEmail: string
    resetEmailPlaceholder: string
    sendResetLink: string
    resetSent: string
    resetSentDescription: string
    backToLogin: string
    cancel: string
    logout: string
    switchToDark: string
    switchToLight: string
  }
  userManagement: {
    title: string
    subtitle: string
    addUser: string
    allUsers: string
    noUsers: string
    username: string
    email: string
    password: string
    role: string
    trainee: string
    teamLeader: string
    admin: string
    assignToTrainee: string
    createNewTrainee: string
    traineeName: string
    traineeEmail: string
    createTrainee: string
    cancel: string
    enableCloudStorage: string
    disableCloudStorage: string
    resetAllData: string
    setupFirebase: string
    firebaseInstructions: string
  }
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      dashboard: 'Work Dashboard',
      trainees: 'Trainees',
      teachers: 'Teachers',
      dailyReport: 'Daily Report',
      studentDetails: 'Student Details',
      studentReports: 'Student Reports',
      analytics: 'Analytics',
      settings: 'Settings',
      tasks: 'Tasks',
      profile: 'Profile',
      search: 'Search',
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      actions: 'Actions',
      view: 'View',
      name: 'Name',
      email: 'Email',
      status: 'Status',
      progress: 'Progress',
      week: 'Week',
      day: 'Day',
      date: 'Date',
      total: 'Total',
      active: 'Active',
      inactive: 'Inactive',
      onLeave: 'On Leave',
      completed: 'Completed',
      onHold: 'On Hold',
      dropped: 'Dropped',
      appName: 'Trainee Control Panel in New Vision',
      admin: 'ADMIN',
      teamLeader: 'TEAM LEADER',
      teacher: 'TEACHER',
      trainee: 'TRAINEE',
      userManagement: 'User Management',
      select: 'Select',
    },
    dashboard: {
      title: 'Work Dashboard',
      subtitle: 'Overview of your training program performance',
      totalTrainees: 'Total Trainees',
      activeTrainees: 'Active Trainees',
      averageProgress: 'Average Progress',
      completedReports: 'Completed Reports',
      weeklyStatistics: 'Weekly Statistics',
      statusDistribution: 'Status Distribution',
      traineeProgress: 'Trainee Progress',
      topPerformers: 'Top Performers',
    },
    trainees: {
      title: 'Trainees',
      subtitle: 'Manage and track all your trainees',
      addTrainee: 'Add Trainee',
      allTrainees: 'All Trainees',
      currentWeek: 'Current Week',
      startDate: 'Start Date',
      noTrainees: 'No trainees found',
      deleteConfirm: 'Are you sure you want to delete this trainee?',
    },
    teachers: {
      title: 'Teachers',
      subtitle: 'Manage and track all your teachers',
      addTeacher: 'Add Teacher',
      allTeachers: 'All Teachers',
      subject: 'Subject',
      experience: 'years',
      assignedTrainees: 'Assigned Trainees',
      years: 'years',
      noTeachers: 'No teachers found',
      deleteConfirm: 'Are you sure you want to delete this teacher?',
    },
    dailyReport: {
      title: 'Daily Report',
      subtitle: 'Create and manage daily progress reports',
      generalInfo: 'General Information',
      traineeName: 'Trainee Name',
      selectTrainee: 'Select trainee',
      topics: "Today's Topics",
      tasks: "Today's Tasks",
      addTask: 'Add Task',
      evaluation: 'Performance Evaluation',
      strengths: 'Strengths',
      needsImprovement: 'Needs Improvement',
      dailyNotes: 'Daily Notes',
      tomorrowPlan: 'Tomorrow Plan',
      overallProgress: 'Overall Progress',
      saveReport: 'Save Report',
    },
    studentDetails: {
      title: 'Student Details',
      profile: 'Profile',
      overview: 'Overview',
      skillsProgress: 'Skills Progress',
      reportsHistory: 'Reports History',
      evaluation: 'Evaluation',
      weeklyProgress: 'Weekly Progress',
      evaluationDetails: 'Evaluation Details',
      recentEvaluations: 'Recent Evaluations',
      noReports: 'No reports yet',
      noEvaluationData: 'No evaluation data available',
      overallProgress: 'Overall Progress',
      age: 'Age',
      origin: 'Origin',
      languageLevel: 'Language Level',
      duration: 'Duration',
      assignedCoach: 'Assigned Coach',
      notAssigned: 'Not assigned',
    },
    studentReports: {
      title: 'Student Reports',
      subtitle: 'View and manage student progress reports',
      allStudents: 'All Students',
      searchStudents: 'Search students...',
      noStudents: 'No students found',
      languageLevel: 'Language Level',
      reports: 'Reports',
      viewReports: 'View Reports',
      studentNotFound: 'Student not found',
      viewProgressReports: "View student's progress reports",
      downloadAllReports: 'Download All Reports',
      download: 'Download',
      noReportsAvailable: 'No reports available yet',
      topics: 'Topics',
      strengths: 'Strengths',
      areasForImprovement: 'Areas for Improvement',
      dailyNotes: 'Daily Notes',
      enrolled: 'Enrolled',
    },
    analytics: {
      title: 'Analytics',
      subtitle: 'Detailed insights and performance metrics',
      averageProgress: 'Average Progress',
      totalReports: 'Total Reports',
      completionRate: 'Completion Rate',
      activeTrainees: 'Active Trainees',
      skillsDistribution: 'Skills Distribution',
      progressByStatus: 'Progress by Status',
      weeklyTrends: 'Weekly Report Trends',
      topSkills: 'Top Performing Skills',
      performanceDistribution: 'Performance Distribution',
      evaluationAverages: 'Evaluation Criteria Averages',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Manage your account and application settings',
      profileSettings: 'Profile Settings',
      fullName: 'Full Name',
      notificationPreferences: 'Notification Preferences',
      emailNotifications: 'Email Notifications',
      pushNotifications: 'Push Notifications',
      weeklyReports: 'Weekly Reports',
      appearance: 'Appearance',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      dataManagement: 'Data Management',
      dataStorage: 'Data Storage',
      exportData: 'Export All Data',
      dangerZone: 'Danger Zone',
      clearAllData: 'Clear All Data',
      clearWarning: 'Clearing data will permanently delete all trainees, reports, and settings.',
      privacy: 'Privacy',
      dataPrivacy: 'Data Privacy',
    },
    traineeForm: {
      addTitle: 'Add Trainee',
      editTitle: 'Edit Trainee',
      fullName: 'Full Name',
      email: 'Email',
      status: 'Status',
      startDate: 'Start Date',
      currentWeek: 'Current Week',
      skills: 'Skills',
      save: 'Save',
      cancel: 'Cancel',
      photo: 'Photo',
      assignedTeacher: 'Assigned Teacher',
      noTeacherAssigned: 'No teacher assigned',
      selectTeacher: 'Select a teacher',
    },
    teacherForm: {
      addTitle: 'Add Teacher',
      editTitle: 'Edit Teacher',
      fullName: 'Full Name',
      email: 'Email',
      subject: 'Subject',
      experience: 'Experience (years)',
      status: 'Status',
      save: 'Save',
      cancel: 'Cancel',
      photo: 'Photo',
      assignedTrainees: 'Assigned Trainees',
      noTraineesAvailable: 'No trainees available',
      traineesSelected: 'trainee(s) selected',
    },
    tasks: {
      title: 'Tasks',
      subtitle: 'Manage and track assigned tasks',
      addTask: 'Add Task',
      allTasks: 'All Tasks',
      taskTitle: 'Task Title',
      taskDescription: 'Task Description',
      taskImage: 'Task Image',
      assignTo: 'Assign To',
      selectTrainee: 'Select trainee',
      dueDate: 'Due Date',
      status: 'Status',
      pending: 'Pending',
      submitted: 'Submitted',
      completed: 'Completed',
      rejected: 'Rejected',
      submitTask: 'Submit Task',
      codeSnippetImage: 'Code Snippet Image',
      projectImage: 'Project Image',
      taskDetails: 'Task Details',
      instructorRating: 'Instructor Rating',
      instructorFeedback: 'Instructor Feedback',
      reviewTask: 'Review Task',
      approve: 'Approve',
      reject: 'Reject',
      noTasks: 'No tasks found',
      submissionDetails: 'Submission Details',
      submittedAt: 'Submitted At',
      reviewedAt: 'Reviewed At',
      maxScore: 'Maximum Score',
      skills: 'Skills',
    },
    auth: {
      login: 'Login',
      username: 'Username',
      password: 'Password',
      signIn: 'Sign In',
      invalidCredentials: 'Invalid username or password',
      demoCredentials: '',
      resetPassword: 'Reset Password',
      resetEmail: 'Email',
      resetEmailPlaceholder: 'your@email.com',
      sendResetLink: 'Send Reset Link',
      resetSent: 'Reset email sent successfully!',
      resetSentDescription: 'Check your email for the password reset link.',
      backToLogin: 'Back to Login',
      cancel: 'Cancel',
      logout: 'Logout',
      switchToDark: 'Switch to dark mode',
      switchToLight: 'Switch to light mode',
    },
    userManagement: {
      title: 'User Management',
      subtitle: 'Manage user accounts and permissions',
      addUser: 'Add User',
      allUsers: 'All Users',
      noUsers: 'No users found',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      role: 'Role',
      trainee: 'Trainee',
      teamLeader: 'Team Leader',
      admin: 'Admin',
      assignToTrainee: 'Assign to Trainee',
      createNewTrainee: 'Create New Trainee',
      traineeName: 'Trainee Name',
      traineeEmail: 'Trainee Email',
      createTrainee: 'Create Trainee',
      cancel: 'Cancel',
      enableCloudStorage: 'Enable Cloud Storage',
      disableCloudStorage: 'Disable Cloud Storage',
      resetAllData: 'Reset All Data',
      setupFirebase: 'Setup Firebase',
      firebaseInstructions: 'Go to Firebase Console → Project Settings → Your apps → Copy configuration values here',
    },
  },
  ar: {
    common: {
      dashboard: 'لوحة العمل',
      trainees: 'المتدربين',
      teachers: 'المعلمين',
      dailyReport: 'التقرير اليومي',
      studentDetails: 'تفاصيل الطالب',
      studentReports: 'تقارير الطلاب',
      analytics: 'التحليلات',
      settings: 'الإعدادات',
      tasks: 'المهام',
      profile: 'الملف الشخصي',
      search: 'بحث',
      add: 'إضافة',
      edit: 'تعديل',
      delete: 'حذف',
      save: 'حفظ',
      cancel: 'إلغاء',
      actions: 'الإجراءات',
      view: 'عرض',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      status: 'الحالة',
      progress: 'التقدم',
      week: 'الأسبوع',
      day: 'اليوم',
      date: 'التاريخ',
      total: 'المجموع',
      active: 'نشط',
      inactive: 'غير نشط',
      onLeave: 'في إجازة',
      completed: 'مكتمل',
      onHold: 'معلق',
      dropped: 'منسحب',
      appName: 'لوحه تحكم المتدربين في نيو فيشجن',
      admin: 'مدير',
      teamLeader: 'قائد فريق',
      teacher: 'معلم',
      trainee: 'متدرب',
      userManagement: 'إدارة المستخدمين',
      select: 'اختر',
    },
    dashboard: {
      title: 'لوحة العمل',
      subtitle: 'نظرة عامة على أداء برنامج التدريب الخاص بك',
      totalTrainees: 'إجمالي المتدربين',
      activeTrainees: 'المتدربين النشطين',
      averageProgress: 'متوسط التقدم',
      completedReports: 'التقارير المكتملة',
      weeklyStatistics: 'الإحصائيات الأسبوعية',
      statusDistribution: 'توزيع الحالة',
      traineeProgress: 'تقدم المتدرب',
      topPerformers: 'أفضل الأداء',
    },
    trainees: {
      title: 'المتدربين',
      subtitle: 'إدارة ومتابعة جميع المتدربين',
      addTrainee: 'إضافة متدرب',
      allTrainees: 'جميع المتدربين',
      currentWeek: 'الأسبوع الحالي',
      startDate: 'تاريخ البدء',
      noTrainees: 'لم يتم العثور على متدربين',
      deleteConfirm: 'هل أنت متأكد من حذف هذا المتدرب؟',
    },
    teachers: {
      title: 'المعلمين',
      subtitle: 'إدارة ومتابعة جميع المعلمين',
      addTeacher: 'إضافة معلم',
      allTeachers: 'جميع المعلمين',
      subject: 'المادة',
      experience: 'سنوات',
      assignedTrainees: 'المتدربون المخصصون',
      years: 'سنوات',
      noTeachers: 'لم يتم العثور على معلمين',
      deleteConfirm: 'هل أنت متأكد من حذف هذا المعلم؟',
    },
    dailyReport: {
      title: 'التقرير اليومي',
      subtitle: 'إنشاء وإدارة تقارير التقدم اليومية',
      generalInfo: 'المعلومات العامة',
      traineeName: 'اسم المتدرب',
      selectTrainee: 'اختر المتدرب',
      topics: 'موضوعات اليوم',
      tasks: 'مهام اليوم',
      addTask: 'إضافة مهمة',
      evaluation: 'تقييم الأداء',
      strengths: 'نقاط القوة',
      needsImprovement: 'نقاط التحسين',
      dailyNotes: 'ملاحظات يومية',
      tomorrowPlan: 'خطة الغد',
      overallProgress: 'التقدم العام',
      saveReport: 'حفظ التقرير',
    },
    studentDetails: {
      title: 'تفاصيل الطالب',
      profile: 'الملف الشخصي',
      overview: 'نظرة عامة',
      skillsProgress: 'تقدم المهارات',
      reportsHistory: 'سجل التقارير',
      evaluation: 'التقييم',
      weeklyProgress: 'التقدم الأسبوعي',
      evaluationDetails: 'تفاصيل التقييم',
      recentEvaluations: 'التقييمات الأخيرة',
      noReports: 'لا توجد تقارير بعد',
      noEvaluationData: 'لا توجد بيانات تقييم متاحة',
      overallProgress: 'التقدم العام',
      age: 'العمر',
      origin: 'الأصل',
      languageLevel: 'مستوى اللغة',
      duration: 'المدة',
      assignedCoach: 'المدرب المعين',
      notAssigned: 'غير معين',
    },
    studentReports: {
      title: 'تقارير الطلاب',
      subtitle: 'عرض وإدارة تقارير تقدم الطلاب',
      allStudents: 'جميع الطلاب',
      searchStudents: 'البحث عن الطلاب...',
      noStudents: 'لم يتم العثور على طلاب',
      languageLevel: 'مستوى اللغة',
      reports: 'التقارير',
      viewReports: 'عرض التقارير',
      studentNotFound: 'الطالب غير موجود',
      viewProgressReports: 'عرض تقارير تقدم الطالب',
      downloadAllReports: 'تحميل جميع التقارير',
      download: 'تحميل',
      noReportsAvailable: 'لا توجد تقارير متاحة بعد',
      topics: 'المواضيع',
      strengths: 'نقاط القوة',
      areasForImprovement: 'نقاط التحسين',
      dailyNotes: 'ملاحظات يومية',
      enrolled: 'مسجل',
    },
    analytics: {
      title: 'التحليلات',
      subtitle: 'رؤى مفصلة ومقاييس الأداء',
      averageProgress: 'متوسط التقدم',
      totalReports: 'إجمالي التقارير',
      completionRate: 'معدل الإنجاز',
      activeTrainees: 'المتدربين النشطين',
      skillsDistribution: 'توزيع المهارات',
      progressByStatus: 'التقدم حسب الحالة',
      weeklyTrends: 'اتجاهات التقارير الأسبوعية',
      topSkills: 'أفضل المهارات أداءً',
      performanceDistribution: 'توزيع الأداء',
      evaluationAverages: 'متوسطات معايير التقييم',
    },
    settings: {
      title: 'الإعدادات',
      subtitle: 'إدارة حسابك وإعدادات التطبيق',
      profileSettings: 'إعدادات الملف الشخصي',
      fullName: 'الاسم الكامل',
      notificationPreferences: 'تفضيلات الإشعارات',
      emailNotifications: 'إشعارات البريد الإلكتروني',
      pushNotifications: 'إشعارات الدفع',
      weeklyReports: 'التقارير الأسبوعية',
      appearance: 'المظهر',
      theme: 'المظهر',
      light: 'فاتح',
      dark: 'داكن',
      system: 'النظام',
      dataManagement: 'إدارة البيانات',
      dataStorage: 'تخزين البيانات',
      exportData: 'تصدير جميع البيانات',
      dangerZone: 'منطقة الخطر',
      clearAllData: 'مسح جميع البيانات',
      clearWarning: 'مسح البيانات سيحذف نهائياً جميع المتدربين والتقارير والإعدادات.',
      privacy: 'الخصوصية',
      dataPrivacy: 'خصوصية البيانات',
    },
    traineeForm: {
      addTitle: 'إضافة متدرب',
      editTitle: 'تعديل المتدرب',
      fullName: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      status: 'الحالة',
      startDate: 'تاريخ البدء',
      currentWeek: 'الأسبوع الحالي',
      skills: 'المهارات',
      save: 'حفظ',
      cancel: 'إلغاء',
      photo: 'الصورة',
      assignedTeacher: 'المعلم المعين',
      noTeacherAssigned: 'لا يوجد معلم معين',
      selectTeacher: 'اختر معلم',
    },
    teacherForm: {
      addTitle: 'إضافة معلم',
      editTitle: 'تعديل المعلم',
      fullName: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      subject: 'المادة',
      experience: 'الخبرة (سنوات)',
      status: 'الحالة',
      save: 'حفظ',
      cancel: 'إلغاء',
      photo: 'الصورة',
      assignedTrainees: 'المتدربين المعينين',
      noTraineesAvailable: 'لا يوجد متدربين متاحين',
      traineesSelected: 'متدرب(ين) محدد',
    },
    tasks: {
      title: 'المهام',
      subtitle: 'إدارة ومتابعة المهام المخصصة',
      addTask: 'إضافة مهمة',
      allTasks: 'جميع المهام',
      taskTitle: 'عنوان المهمة',
      taskDescription: 'وصف المهمة',
      taskImage: 'صورة المهمة',
      assignTo: 'تعيين إلى',
      selectTrainee: 'اختر المتدرب',
      dueDate: 'تاريخ الاستحقاق',
      status: 'الحالة',
      pending: 'معلقة',
      submitted: 'مقدمة',
      completed: 'مكتملة',
      rejected: 'مرفوضة',
      submitTask: 'تقديم المهمة',
      codeSnippetImage: 'صورة مقتطف الكود',
      projectImage: 'صورة المشروع',
      taskDetails: 'تفاصيل المهمة',
      instructorRating: 'تقييم المدرب',
      instructorFeedback: 'ملاحظات المدرب',
      reviewTask: 'مراجعة المهمة',
      approve: 'موافقة',
      reject: 'رفض',
      noTasks: 'لم يتم العثور على مهام',
      submissionDetails: 'تفاصيل التقديم',
      submittedAt: 'تقدم في',
      reviewedAt: 'تمت المراجعة في',
      maxScore: 'الدرجة القصوى',
      skills: 'المهارات',
    },
    auth: {
      login: 'تسجيل الدخول',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      signIn: 'دخول',
      invalidCredentials: 'اسم المستخدم أو كلمة المرور غير صحيحة',
      demoCredentials:``,
      resetPassword: 'إعادة تعيين كلمة المرور',
      resetEmail: 'البريد الإلكتروني',
      resetEmailPlaceholder: 'بريدك@الإلكتروني.com',
      sendResetLink: 'إرسال رابط إعادة التعيين',
      resetSent: 'تم إرسال بريد إعادة التعيين بنجاح!',
      resetSentDescription: 'تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور.',
      backToLogin: 'العودة لتسجيل الدخول',
      cancel: 'إلغاء',
      logout: 'تسجيل الخروج',
      switchToDark: 'التبديل إلى الوضع الداكن',
      switchToLight: 'التبديل إلى الوضع الفاتح',
    },
    userManagement: {
      title: 'إدارة المستخدمين',
      subtitle: 'إدارة حسابات المستخدمين والصلاحيات',
      addUser: 'إضافة مستخدم',
      allUsers: 'جميع المستخدمين',
      noUsers: 'لم يتم العثور على مستخدمين',
      username: 'اسم المستخدم',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      role: 'الدور',
      trainee: 'متدرب',
      teamLeader: 'قائد الفريق',
      admin: 'مدير',
      assignToTrainee: 'تعيين للمتدرب',
      createNewTrainee: 'إنشاء متدرب جديد',
      traineeName: 'اسم المتدرب',
      traineeEmail: 'بريد المتدرب الإلكتروني',
      createTrainee: 'إنشاء المتدرب',
      cancel: 'إلغاء',
      enableCloudStorage: 'تفعيل التخزين السحابي',
      disableCloudStorage: 'تعطيل التخزين السحابي',
      resetAllData: 'إعادة تعيين جميع البيانات',
      setupFirebase: 'إعداد Firebase',
      firebaseInstructions: 'اذهب إلى Firebase Console → Project Settings → Your apps → انسخ قيم التكوين هنا',
    },
  },
}
