export function getErrorCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code: unknown }).code);
  }
  return '';
}

// Kody, które oznaczają, że użytkownik sam przerwał logowanie - nie pokazujemy błędu
const SILENT_CODES = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/user-cancelled',
]);

export function isSilentAuthError(error: unknown): boolean {
  return SILENT_CODES.has(getErrorCode(error));
}

export function mapAuthError(error: unknown): string {
  const code = getErrorCode(error);

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
      return 'Nieprawidłowy email lub hasło.';
    case 'auth/invalid-email':
      return 'Nieprawidłowy adres email.';
    case 'auth/email-already-in-use':
      return 'Ten email jest już zajęty. Zaloguj się albo użyj logowania przez Google.';
    case 'auth/weak-password':
      return 'Hasło musi mieć minimum 6 znaków.';
    case 'auth/too-many-requests':
      return 'Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie.';
    case 'auth/user-disabled':
      return 'To konto zostało zablokowane.';
    case 'auth/popup-blocked':
      return 'Przeglądarka zablokowała okno logowania. Zezwól na wyskakujące okna dla tej strony i spróbuj ponownie.';
    case 'auth/account-exists-with-different-credential':
      return 'Konto z tym adresem istnieje już z inną metodą logowania.';
    case 'auth/network-request-failed':
      return 'Błąd sieci. Sprawdź połączenie i spróbuj ponownie.';
    case 'auth/unauthorized-domain': {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'twoja-domena';
      return `Domena ${host} nie jest autoryzowana w Firebase (Authentication → Settings → Authorized domains).`;
    }
    case 'auth/operation-not-allowed':
      return 'Ta metoda logowania nie jest włączona w Firebase.';
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return 'Nieprawidłowa konfiguracja Firebase (klucz API).';
    default:
      return 'Wystąpił błąd logowania. Spróbuj ponownie.';
  }
}

export function mapDataError(error: unknown): string {
  const code = getErrorCode(error);

  switch (code) {
    case 'permission-denied':
      return 'Brak uprawnień do danych. Sprawdź reguły Firestore.';
    case 'unavailable':
      return 'Brak połączenia z serwerem. Zmiany mogły nie zostać zapisane.';
    case 'unauthenticated':
      return 'Sesja wygasła. Zaloguj się ponownie.';
    default:
      return 'Nie udało się zapisać lub wczytać danych. Spróbuj ponownie.';
  }
}
