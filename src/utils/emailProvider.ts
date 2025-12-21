/**
 * Obtém a URL do webmail do provedor de email baseado no domínio
 * @param email - O endereço de email do usuário
 * @returns A URL do webmail do provedor
 */
export function getEmailProviderUrl(email: string): string {
  if (!email || !email.includes('@')) {
    return 'https://mail.google.com';
  }

  const domain = email.split('@')[1].toLowerCase();

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
 * Abre o provedor de email no navegador (webmail)
 * @param email - O endereço de email do usuário
 */
export function openEmailProvider(email: string): void {
  const url = getEmailProviderUrl(email);
  window.open(url, '_blank');
}
