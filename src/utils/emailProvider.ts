/**
 * Detecta se o usuário está em um dispositivo móvel
 * @returns true se estiver em mobile, false caso contrário
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Mapeamento de deep links para apps de email em mobile
 */
const deepLinks: Record<string, string> = {
  'gmail.com': 'googlegmail://',
  'googlemail.com': 'googlegmail://',
  'outlook.com': 'ms-outlook://',
  'hotmail.com': 'ms-outlook://',
  'live.com': 'ms-outlook://',
  'yahoo.com': 'ymail://',
  'yahoo.com.br': 'ymail://',
};

/**
 * Obtém a URL do provedor de email baseado no domínio do email
 * Em mobile, retorna deep link se disponível; em desktop, retorna webmail
 * @param email - O endereço de email do usuário
 * @returns A URL (deep link ou webmail) do provedor
 */
export function getEmailProviderUrl(email: string): string {
  if (!email || !email.includes('@')) {
    return isMobile() && deepLinks['gmail.com']
      ? deepLinks['gmail.com']
      : 'https://mail.google.com';
  }

  const domain = email.split('@')[1].toLowerCase();

  // Se estiver em mobile e houver deep link, usar deep link
  if (isMobile() && deepLinks[domain]) {
    return deepLinks[domain];
  }

  // Caso contrário, usar webmail
  const providers: Record<string, string> = {
    'gmail.com': 'https://mail.google.com',
    'googlemail.com': 'https://mail.google.com',
    'outlook.com': 'https://outlook.live.com/mail/',
    'hotmail.com': 'https://outlook.live.com/mail/',
    'live.com': 'https://outlook.live.com/mail/',
    'yahoo.com': 'https://mail.yahoo.com',
    'yahoo.com.br': 'https://mail.yahoo.com',
    'icloud.com': 'https://www.icloud.com/mail',
    'me.com': 'https://www.icloud.com/mail',
    'mac.com': 'https://www.icloud.com/mail',
    'protonmail.com': 'https://mail.protonmail.com',
    'proton.me': 'https://mail.proton.me',
    'aol.com': 'https://mail.aol.com',
  };

  return providers[domain] || 'https://mail.google.com';
}

/**
 * Obtém o nome do provedor de email para exibição
 * @param email - O endereço de email do usuário
 * @returns O nome amigável do provedor
 */
export function getEmailProviderName(email: string): string {
  if (!email || !email.includes('@')) {
    return 'Gmail';
  }

  const domain = email.split('@')[1].toLowerCase();

  const providerNames: Record<string, string> = {
    'gmail.com': 'Gmail',
    'googlemail.com': 'Gmail',
    'outlook.com': 'Outlook',
    'hotmail.com': 'Outlook',
    'live.com': 'Outlook',
    'yahoo.com': 'Yahoo Mail',
    'yahoo.com.br': 'Yahoo Mail',
    'icloud.com': 'iCloud Mail',
    'me.com': 'iCloud Mail',
    'mac.com': 'iCloud Mail',
    'protonmail.com': 'ProtonMail',
    'proton.me': 'Proton Mail',
    'aol.com': 'AOL Mail',
  };

  return providerNames[domain] || 'seu email';
}

/**
 * Abre o provedor de email (app em mobile via mailto:, webmail em desktop)
 * @param email - O endereço de email do usuário
 */
export function openEmailProvider(email: string): void {
  if (isMobile()) {
    // Em mobile: usar mailto: para abrir app de email padrão
    window.location.href = 'mailto:';
  } else {
    // Desktop: abrir webmail diretamente
    const url = getEmailProviderUrl(email);
    window.open(url, '_blank');
  }
}

/**
 * Obtém URL do webmail para um domínio específico
 * @param domain - Domínio do email
 * @returns URL do webmail
 */
function getWebmailUrl(domain: string): string {
  const providers: Record<string, string> = {
    'gmail.com': 'https://mail.google.com',
    'googlemail.com': 'https://mail.google.com',
    'outlook.com': 'https://outlook.live.com/mail/',
    'hotmail.com': 'https://outlook.live.com/mail/',
    'live.com': 'https://outlook.live.com/mail/',
    'yahoo.com': 'https://mail.yahoo.com',
    'yahoo.com.br': 'https://mail.yahoo.com',
  };

  return providers[domain] || 'https://mail.google.com';
}
