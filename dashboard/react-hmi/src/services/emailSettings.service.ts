/**
 * Email Settings Storage Service
 * Stores email configuration for automated reports to localStorage
 */

export interface EmailSettings {
  enabled: boolean;
  recipients: string[];
  dailyReport: boolean;
  monthlyReport: boolean;
  reportTime: string;  // HH:MM format for daily reports
  monthlyReportDay: number;  // Day of month (1-28) for monthly reports
  lastDailyReport?: string;  // YYYY-MM-DD of last daily report
  lastMonthlyReport?: string;  // YYYY-MM of last monthly report
}

const STORAGE_KEY = 'hvac-email-settings';

const DEFAULT_SETTINGS: EmailSettings = {
  enabled: false,
  recipients: [],
  dailyReport: false,
  monthlyReport: true,
  reportTime: '08:00',
  monthlyReportDay: 1,
};

// Get email settings from localStorage
export function getEmailSettings(): EmailSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch (e) {
    console.error('Failed to parse email settings:', e);
    return { ...DEFAULT_SETTINGS };
  }
}

// Save email settings to localStorage
export function saveEmailSettings(settings: Partial<EmailSettings>): EmailSettings {
  const current = getEmailSettings();
  const updated = { ...current, ...settings };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save email settings:', e);
  }

  return updated;
}

// Add a recipient email
export function addRecipient(email: string): EmailSettings {
  const settings = getEmailSettings();
  const emailLower = email.toLowerCase().trim();

  // Validate email format
  if (!isValidEmail(emailLower)) {
    throw new Error('Invalid email format');
  }

  // Check for duplicates
  if (settings.recipients.includes(emailLower)) {
    return settings;
  }

  settings.recipients.push(emailLower);
  return saveEmailSettings(settings);
}

// Remove a recipient email
export function removeRecipient(email: string): EmailSettings {
  const settings = getEmailSettings();
  settings.recipients = settings.recipients.filter(r => r !== email.toLowerCase());
  return saveEmailSettings(settings);
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check if daily report should be sent
export function shouldSendDailyReport(): boolean {
  const settings = getEmailSettings();
  if (!settings.enabled || !settings.dailyReport || settings.recipients.length === 0) {
    return false;
  }

  const today = new Date().toISOString().split('T')[0];
  return settings.lastDailyReport !== today;
}

// Check if monthly report should be sent
export function shouldSendMonthlyReport(): boolean {
  const settings = getEmailSettings();
  if (!settings.enabled || !settings.monthlyReport || settings.recipients.length === 0) {
    return false;
  }

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const dayOfMonth = now.getDate();

  // Only send on the configured day
  if (dayOfMonth !== settings.monthlyReportDay) {
    return false;
  }

  return settings.lastMonthlyReport !== currentMonth;
}

// Mark daily report as sent
export function markDailyReportSent(): void {
  const today = new Date().toISOString().split('T')[0];
  saveEmailSettings({ lastDailyReport: today });
}

// Mark monthly report as sent
export function markMonthlyReportSent(): void {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  saveEmailSettings({ lastMonthlyReport: currentMonth });
}

// Clear all email settings
export function clearEmailSettings(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Export settings for backup
export function exportEmailSettings(): string {
  return JSON.stringify(getEmailSettings(), null, 2);
}
