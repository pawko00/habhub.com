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

4. Na Vercelu ustaw te same zmienne `NEXT_PUBLIC_FIREBASE_*` co w `.env.local`,
   ale `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` ustaw na domenę aplikacji (np. `habhub-com.vercel.app`).
5. W Google Cloud Console → APIs & Services → Credentials → OAuth client „Web client (auto created
   by Google Service)” dodaj do **Authorized redirect URIs**: `https://<domena-aplikacji>/__/auth/handler`.

### Jak działa logowanie Google

`next.config.ts` przepuszcza `/__/auth/*` do `<projekt>.firebaseapp.com`, więc handler logowania
działa na domenie aplikacji. Gdy `authDomain` to domena aplikacji, na telefonach używany jest
`signInWithRedirect` (popupy są tam często blokowane), a na komputerach popup z fallbackiem na redirect.
Gdy `authDomain` to `*.firebaseapp.com` (np. lokalnie), działa tylko popup: przeglądarki blokują
storage innej domeny i redirect cicho by się nie udał.

## Struktura danych

```
users/{uid}/habits/{habitId}                 { name, createdAt }
users/{uid}/completions/{habitId}_{date}     { habitId, date }
```

Daty to `YYYY-MM-DD` w lokalnej strefie czasowej użytkownika.
