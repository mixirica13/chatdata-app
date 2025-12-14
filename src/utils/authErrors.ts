// Traduções de mensagens de erro do Supabase para português
const errorTranslations: Record<string, string> = {
  // Login errors
  'Invalid login credentials': 'Email ou senha incorretos',
  'invalid_credentials': 'Email ou senha incorretos',
  'Email not confirmed': 'Por favor, confirme seu email antes de fazer login',
  'Invalid email or password': 'Email ou senha incorretos',
  'User not found': 'Usuário não encontrado',

  // Password errors
  'Password should be at least 6 characters': 'A senha deve ter no mínimo 6 caracteres',
  'Signup requires a valid password': 'É necessário uma senha válida',

  // Email errors
  'Unable to validate email address: invalid format': 'Formato de email inválido',
  'A user with this email address has already been registered': 'Este email já está cadastrado',
  'User already registered': 'Este email já está cadastrado',
  'Email already in use': 'Este email já está em uso',

  // Rate limiting
  'For security purposes, you can only request this once every 60 seconds':
    'Por segurança, aguarde 60 segundos antes de tentar novamente',
  'Email rate limit exceeded': 'Limite de envios excedido. Tente novamente mais tarde',

  // Session/Token errors
  'Invalid Refresh Token': 'Sessão expirada. Por favor, faça login novamente',
  'Refresh Token Not Found': 'Sessão expirada. Por favor, faça login novamente',
  'Token has expired or is invalid': 'Link expirado ou inválido',

  // General errors
  'Network error': 'Erro de conexão. Verifique sua internet',
  'Request failed': 'Falha na requisição. Tente novamente',
};

export function translateAuthError(error: any): string {
  if (!error) return 'Ocorreu um erro. Tente novamente.';

  const message = error.message || error.error_description || String(error);

  // Check for direct translation
  if (errorTranslations[message]) {
    return errorTranslations[message];
  }

  // Check for partial matches
  for (const [key, translation] of Object.entries(errorTranslations)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return translation;
    }
  }

  // Check for common patterns
  if (message.includes('confirme seu email') || message.includes('confirm your email')) {
    return 'Por favor, confirme seu email antes de fazer login';
  }

  if (message.includes('already registered') || message.includes('already exists')) {
    return 'Este email já está cadastrado';
  }

  if (message.includes('invalid') && message.includes('password')) {
    return 'Senha incorreta';
  }

  if (message.includes('invalid') && message.includes('email')) {
    return 'Email inválido';
  }

  // Return original if no translation found (but log it for future translations)
  console.warn('Untranslated auth error:', message);
  return 'Ocorreu um erro. Tente novamente.';
}
