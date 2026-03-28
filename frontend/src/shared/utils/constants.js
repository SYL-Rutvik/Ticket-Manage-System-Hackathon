const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_URL = `${BASE_URL}/api`;

export const ROLES = { EMPLOYEE: 'employee', AGENT: 'agent', ADMIN: 'admin' };

export const STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export const PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// Legacy kept for any remaining components that use it
export const CATEGORY = ['software', 'hardware', 'network', 'access', 'other'];

// ─────────────────────────────────────────────────────────────
// SMART PROBLEM TREE — powers the guided ticket creation wizard
// ─────────────────────────────────────────────────────────────
export const PROBLEM_TREE = [
  {
    id: 'internet',
    label: 'Internet / Network',
    emoji: '🌐',
    description: 'Wi-Fi, LAN, VPN issues or slow connection',
    category: 'network',
    defaultPriority: PRIORITY.HIGH,
    subQuestions: [
      {
        id: 'connectionType',
        label: 'What type of connection are you using?',
        type: 'radio',
        options: ['Wi-Fi', 'LAN Cable', 'VPN', 'Mobile Hotspot'],
      },
      {
        id: 'scope',
        label: 'How many people are affected?',
        type: 'radio',
        options: ['Only me', 'My team', 'Entire floor', 'Whole company'],
        // "My team / floor / company" = escalate immediately
        escalateIf: ['My team', 'Entire floor', 'Whole company'],
      },
      {
        id: 'symptom',
        label: 'What symptom are you experiencing?',
        type: 'radio',
        options: ['No internet at all', 'Very slow speed', "Can't reach a specific site", "VPN won't connect"],
      },
      {
        id: 'since',
        label: 'When did this start?',
        type: 'radio',
        options: ['Just now', 'Last few hours', 'Since yesterday', 'Past few days'],
      },
    ],
    selfHelpSteps: [
      'Restart your Wi-Fi router or inform the premises team to check the network switch.',
      'Unplug your LAN cable, wait 10 seconds, then plug it back in.',
      'Forget the Wi-Fi network on your device, then reconnect with your credentials.',
      'Check if the issue exists on your mobile phone (same Wi-Fi). If mobile works, the issue is with your computer.',
      'Try opening a different website to rule out a blocked site.',
      'Restart your computer and check the connection again.',
    ],
    selfResolvable: true,
    // Override priority based on sub-question answers
    priorityRules: [
      { key: 'scope', value: 'Whole company', priority: PRIORITY.CRITICAL },
      { key: 'scope', value: 'Entire floor', priority: PRIORITY.CRITICAL },
      { key: 'scope', value: 'My team', priority: PRIORITY.HIGH },
      { key: 'scope', value: 'Only me', priority: PRIORITY.MEDIUM },
    ],
  },

  {
    id: 'printer',
    label: 'Printer / Scanner',
    emoji: '🖨️',
    description: 'Printer offline, paper jam, scan not working',
    category: 'hardware',
    defaultPriority: PRIORITY.MEDIUM,
    subQuestions: [
      {
        id: 'device',
        label: 'Which printer/scanner are you using?',
        type: 'select',
        options: ['HP LaserJet', 'Epson', 'Canon', 'Shared Office Printer', 'Other'],
      },
      {
        id: 'symptom',
        label: 'What is the exact problem?',
        type: 'radio',
        options: ['Printer is offline', 'Paper jam', 'Poor print quality', 'Scanner not working', "Printer not found on my PC"],
      },
      {
        id: 'errorLight',
        label: 'Is any error light or code showing on the printer?',
        type: 'radio',
        options: ['Yes', 'No'],
      },
      {
        id: 'workedBefore',
        label: 'Has this printer worked on your account before?',
        type: 'radio',
        options: ['Yes, it was working fine', 'No — first time setup'],
      },
    ],
    selfHelpSteps: [
      'Turn the printer OFF completely, wait 30 seconds, then turn it back ON.',
      'Check all paper trays are properly loaded and not overfilled.',
      'If there\'s a paper jam, open all printer doors/covers to clear it fully.',
      'On your PC: Settings → Bluetooth & devices → Printers & scanners → Remove and re-add the printer.',
      'Set the printer as your Default Printer and print a test page.',
      'Check that the USB cable or network cable is firmly connected.',
    ],
    selfResolvable: true,
    priorityRules: [
      { key: 'symptom', value: 'Poor print quality', priority: PRIORITY.LOW },
      { key: 'workedBefore', value: 'No — first time setup', priority: PRIORITY.LOW },
    ],
  },

  {
    id: 'computer',
    label: 'Computer / Laptop',
    emoji: '💻',
    description: "Won't start, freezes, very slow, or blue screen",
    category: 'hardware',
    defaultPriority: PRIORITY.HIGH,
    subQuestions: [
      {
        id: 'symptom',
        label: 'What is happening?',
        type: 'radio',
        options: ["Won't turn on", 'Freezing or crashing', 'Very slow performance', 'Blue screen (BSOD)', 'Battery not charging', 'Display / screen issue'],
        escalateIf: ["Won't turn on", 'Blue screen (BSOD)'],
      },
      {
        id: 'trigger',
        label: 'When did this start?',
        type: 'radio',
        options: ['Suddenly just now', 'After a Windows Update', 'Gradually getting worse', 'After a physical drop or damage'],
        escalateIf: ['After a physical drop or damage'],
      },
      {
        id: 'workAround',
        label: 'Can you still access your work?',
        type: 'radio',
        options: ['Yes — via another device', 'Partially', 'No — completely blocked'],
      },
      {
        id: 'assetTag',
        label: 'Asset tag / serial number of your machine',
        type: 'text',
        placeholder: 'e.g. LT-2048',
      },
    ],
    selfHelpSteps: [
      'If frozen: hold the power button for 5 seconds to force shutdown, then restart.',
      'Restart normally and check if the issue persists.',
      'If "very slow": open Task Manager (Ctrl+Shift+Esc) → check if any process is using 100% CPU or memory.',
      'Free up disk space: empty the Recycle Bin and clear your Downloads folder.',
      'Run Windows Update (Settings → Windows Update → Check for updates) and restart.',
      'Run a quick virus/malware scan using Windows Security.',
    ],
    selfResolvable: true,
    priorityRules: [
      { key: 'symptom', value: "Won't turn on", priority: PRIORITY.CRITICAL },
      { key: 'symptom', value: 'Blue screen (BSOD)', priority: PRIORITY.CRITICAL },
      { key: 'trigger', value: 'After a physical drop or damage', priority: PRIORITY.HIGH },
      { key: 'workAround', value: 'No — completely blocked', priority: PRIORITY.HIGH },
    ],
  },

  {
    id: 'software',
    label: 'Software / Application',
    emoji: '🖥️',
    description: 'App crashing, login errors, feature not working',
    category: 'software',
    defaultPriority: PRIORITY.MEDIUM,
    subQuestions: [
      {
        id: 'application',
        label: 'Which application is affected?',
        type: 'select',
        options: ['ERP System', 'CRM', 'Microsoft Office (Word/Excel/PPT)', 'Browser (Chrome/Edge)', 'Custom Internal App', 'Other'],
      },
      {
        id: 'error',
        label: 'What is the error?',
        type: 'radio',
        options: ["App won't open", 'Login fails', 'Specific feature broken', 'App is very slow', 'Getting an error message'],
      },
      {
        id: 'scope',
        label: 'Does this happen to other people?',
        type: 'radio',
        options: ['Only me', 'My whole team', 'Not sure'],
        escalateIf: ['My whole team'],
      },
      {
        id: 'errorMessage',
        label: 'Error message (if any)',
        type: 'text',
        placeholder: 'Paste the exact error text here',
      },
    ],
    selfHelpSteps: [
      'Close the application completely (check the system tray) and reopen it.',
      'If browser-based: press Ctrl + Shift + Delete → clear cache and cookies → try again.',
      'Try a different browser (e.g. Chrome instead of Edge).',
      'Log out of the application and log back in.',
      'Restart your computer and check if the issue is gone.',
    ],
    selfResolvable: true,
    priorityRules: [
      { key: 'scope', value: 'My whole team', priority: PRIORITY.HIGH },
      { key: 'error', value: "App won't open", priority: PRIORITY.HIGH },
    ],
  },

  {
    id: 'email',
    label: 'Email / Outlook',
    emoji: '📧',
    description: "Can't send or receive, account locked, Outlook not opening",
    category: 'software',
    defaultPriority: PRIORITY.HIGH,
    subQuestions: [
      {
        id: 'symptom',
        label: 'What is the problem?',
        type: 'radio',
        options: ["Can't send emails", "Not receiving emails", 'Account locked / password expired', "Outlook won't open", 'Missing emails or folders', 'Email rule / signature issue'],
        escalateIf: ['Account locked / password expired'],
      },
      {
        id: 'client',
        label: 'Which email client are you using?',
        type: 'radio',
        options: ['Outlook Desktop App', 'Outlook Web (browser)', 'Mobile Outlook App', 'All of the above'],
      },
      {
        id: 'since',
        label: 'When did this start?',
        type: 'radio',
        options: ['Today', 'Yesterday', 'Past few days', 'After IT changes'],
      },
    ],
    selfHelpSteps: [
      'First check your internet connection is working.',
      'Open Outlook Web (outlook.office.com) — if that works, the issue is with your desktop app only.',
      'Fully close and reopen Outlook.',
      'Check your Spam / Junk folder for missing emails.',
      'Try logging into a Microsoft service (Teams, OneDrive) to check if your password has expired.',
      'In Outlook: File → Account Settings → test your account settings.',
    ],
    selfResolvable: true,
    priorityRules: [
      { key: 'symptom', value: 'Account locked / password expired', priority: PRIORITY.CRITICAL },
      { key: 'symptom', value: "Can't send emails", priority: PRIORITY.HIGH },
    ],
  },

  {
    id: 'access',
    label: 'Access / Permissions',
    emoji: '🔐',
    description: "Can't access a file, portal, or system",
    category: 'access',
    defaultPriority: PRIORITY.MEDIUM,
    subQuestions: [
      {
        id: 'resourceType',
        label: 'What are you trying to access?',
        type: 'radio',
        options: ['Shared Drive / Folder', 'Internal Portal / Website', 'Database', 'External System', 'Physical Access (room or cabinet)'],
      },
      {
        id: 'error',
        label: 'What error do you see?',
        type: 'radio',
        options: ['"Access Denied"', 'Page not loading', 'Login rejects my credentials', 'No access option available'],
      },
      {
        id: 'hadBefore',
        label: 'Have you ever had this access before?',
        type: 'radio',
        options: ['Yes — it was revoked', 'No — new access request', 'Not sure'],
      },
      {
        id: 'managerApproval',
        label: "Is this approved by your manager?",
        type: 'radio',
        options: ['Yes, manager approved', 'Approval pending', 'Not yet requested'],
      },
    ],
    selfHelpSteps: [
      'Confirm you are connected to the company VPN if you are working remotely.',
      'Try logging out and logging back in to reset your session.',
      'Ask a teammate if they can access the same resource (to confirm it is not system-wide).',
      'Confirm with your manager that access has been formally approved in the system.',
    ],
    selfResolvable: false,  // Almost always needs IT action
    priorityRules: [
      { key: 'managerApproval', value: 'Not yet requested', priority: PRIORITY.LOW },
      { key: 'hadBefore', value: 'Yes — it was revoked', priority: PRIORITY.HIGH },
    ],
  },

  {
    id: 'phone',
    label: 'Office Phone / Teams',
    emoji: '📞',
    description: 'Call quality, Teams login, headset not working',
    category: 'software',
    defaultPriority: PRIORITY.MEDIUM,
    subQuestions: [
      {
        id: 'symptom',
        label: 'What is the issue?',
        type: 'radio',
        options: ['Poor call quality / echo', "Can't make calls", "Teams won't open or crashes", 'Headset not working', 'Not receiving calls / missed calls'],
      },
      {
        id: 'device',
        label: 'Which device are you using?',
        type: 'radio',
        options: ['Office desk phone', 'Laptop (Teams app)', 'Mobile Teams app', 'USB Headset'],
      },
    ],
    selfHelpSteps: [
      'Unplug your headset completely, wait 5 seconds, and plug it back in.',
      'In Teams: click your profile → Settings → Devices — select the correct Speaker and Microphone.',
      'Close Teams fully (right-click tray icon → Quit), then reopen it.',
      'Check if your headset or microphone is muted (look for a physical mute button on the headset).',
      'Test with your laptop\'s built-in microphone to check if the headset is faulty.',
      'Restart your computer if Teams is crashing or freezing.',
    ],
    selfResolvable: true,
    priorityRules: [],
  },

  {
    id: 'hardware',
    label: 'Hardware / Peripherals',
    emoji: '🖱️',
    description: 'Mouse, keyboard, monitor, webcam not working',
    category: 'hardware',
    defaultPriority: PRIORITY.MEDIUM,
    subQuestions: [
      {
        id: 'device',
        label: 'Which device is not working?',
        type: 'radio',
        options: ['Mouse', 'Keyboard', 'Monitor / Screen', 'Webcam', 'USB Hub', 'External Storage', 'Docking Station'],
      },
      {
        id: 'symptom',
        label: 'What is the symptom?',
        type: 'radio',
        options: ['Not detected at all', 'Works sometimes (intermittent)', 'Wrong behaviour / buttons not working', 'Physical damage'],
        escalateIf: ['Physical damage'],
      },
    ],
    selfHelpSteps: [
      'Unplug the device from the USB port, wait 5 seconds, plug it back in.',
      'Try a different USB port on your computer.',
      'Test the same device on a different computer — if it still fails, the device itself is faulty.',
      'Open Device Manager (search in Start menu) → look for any yellow warning icons → right-click and Update driver.',
      'For wireless devices (mouse/keyboard): replace the batteries and re-pair via Bluetooth.',
    ],
    selfResolvable: true,
    priorityRules: [
      { key: 'symptom', value: 'Physical damage', priority: PRIORITY.HIGH },
    ],
  },

  {
    id: 'other',
    label: 'Other / General',
    emoji: '❓',
    description: "Something else — describe your issue",
    category: 'other',
    defaultPriority: PRIORITY.MEDIUM,
    subQuestions: [
      {
        id: 'description',
        label: 'Briefly describe the issue category',
        type: 'text',
        placeholder: 'e.g. Shared drive sync issue, projector setup, etc.',
      },
      {
        id: 'urgency',
        label: 'How urgent is this?',
        type: 'radio',
        options: ['Blocking my work — urgent', 'Can work around it', 'No urgency'],
      },
    ],
    selfHelpSteps: [],
    selfResolvable: false,
    priorityRules: [
      { key: 'urgency', value: 'Blocking my work — urgent', priority: PRIORITY.HIGH },
      { key: 'urgency', value: 'No urgency', priority: PRIORITY.LOW },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// LEGACY kept for backward compatibility with other components
// ─────────────────────────────────────────────────────────────
export const CATEGORY_FOLLOWUP_QUESTIONS = {
  software: [
    { id: 'application', label: 'Which application is affected?', type: 'select', options: ['ERP', 'CRM', 'Email', 'Browser', 'Custom App'] },
    { id: 'version', label: 'App version/build (if known)', type: 'text', placeholder: 'e.g. v2.4.1' },
    { id: 'errorCode', label: 'Error code or message', type: 'text', placeholder: 'Paste exact error text' },
    { id: 'impact', label: 'Business impact', type: 'select', options: ['Single user blocked', 'Team slowed down', 'Department blocked', 'Critical outage'] },
  ],
  hardware: [
    { id: 'deviceType', label: 'Device type', type: 'select', options: ['Laptop', 'Desktop', 'Monitor', 'Printer', 'Peripheral'] },
    { id: 'assetTag', label: 'Asset tag / serial number', type: 'text', placeholder: 'e.g. LT-2048' },
    { id: 'location', label: 'Current location', type: 'text', placeholder: 'Office / Floor / Desk' },
    { id: 'symptom', label: 'Primary symptom', type: 'select', options: ['Won\'t power on', 'Intermittent issue', 'Performance issue', 'Physical damage'] },
  ],
  network: [
    { id: 'networkType', label: 'Connection type', type: 'select', options: ['Wi-Fi', 'LAN', 'VPN', 'Remote Desktop'] },
    { id: 'scope', label: 'How many users are affected?', type: 'select', options: ['Only me', 'My team', 'Multiple teams', 'Company-wide'] },
    { id: 'location', label: 'Location when issue happens', type: 'text', placeholder: 'Office, home, branch, etc.' },
    { id: 'frequency', label: 'Issue frequency', type: 'select', options: ['Always', 'Often', 'Sometimes', 'One-time'] },
  ],
  access: [
    { id: 'systemName', label: 'System/resource name', type: 'text', placeholder: 'e.g. Finance Portal' },
    { id: 'accessType', label: 'Access needed', type: 'select', options: ['Read', 'Write', 'Admin', 'Temporary access'] },
    { id: 'managerApproved', label: 'Manager approval status', type: 'select', options: ['Approved', 'Pending', 'Not requested'] },
    { id: 'requiredBy', label: 'Required by date', type: 'text', placeholder: 'e.g. 2026-03-30' },
  ],
  other: [
    { id: 'context', label: 'Context of issue/request', type: 'text', placeholder: 'What were you trying to do?' },
    { id: 'impact', label: 'Expected impact if unresolved', type: 'text', placeholder: 'Describe business/user impact' },
  ],
};

// Role default redirect after login
export const ROLE_HOME = {
  employee: '/employee/tickets',
  customer: '/employee/tickets',
  agent: '/agent/queue',
  admin: '/admin/dashboard',
};
