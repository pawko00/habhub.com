# Habit Tracker

Śledzenie nawyków z mapą aktywności w stylu GitHuba. Next.js + Firebase (Auth + Firestore).
Bez logowania dane trzymane są w `localStorage`, po zalogowaniu w Firestore.

## Uruchomienie

```bash
cp .env.example .env.local   # uzupełnij danymi z Firebase Console
npm install
npm run dev
```

## Konfiguracja Firebase

1. **Authentication → Sign-in method**: włącz Google oraz Email/Password.
2. **Authentication → Settings → Authorized domains**: dodaj każdą domenę, na której działa aplikacja (np. domenę z Vercela).
3. **Firestore**: utwórz bazę i wgraj reguły z `firestore.rules`:

   ```bash
   npx firebase-tools deploy --only firestore:rules
   ```

4. Na Vercelu ustaw te same zmienne `NEXT_PUBLIC_FIREBASE_*` co w `.env.local`.

Logowanie Google działa wyłącznie przez popup. `signInWithRedirect` celowo nie jest używany:
przy `authDomain` na `*.firebaseapp.com` i aplikacji na innej domenie przeglądarki (Safari, Firefox,
Chrome) blokują dostęp do storage i logowanie po przekierowaniu cicho się nie udaje.

## Struktura danych

```
users/{uid}/habits/{habitId}                 { name, createdAt }
users/{uid}/completions/{habitId}_{date}     { habitId, date }
```

Daty to `YYYY-MM-DD` w lokalnej strefie czasowej użytkownika.
