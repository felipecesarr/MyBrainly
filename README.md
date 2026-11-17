# MyBrainly

A mobile vocabulary and flashcard app for building personal decks, reviewing words and tracking learning progress.

[App Store](https://apps.apple.com/nz/app/mybrainly/id6739167084)

## What this repository shows

- Personal vocabulary decks and flashcard study flows.
- React Native/Expo mobile interface and Firebase-backed user configuration.
- Progress and retention views with subscription integration.
- AI generation through a configurable authenticated backend; provider secrets are never bundled into the client.

## Source edition

This is a separately prepared, independently configured source edition dated 17 November 2026. It is not a binary reproduction of the currently published application. It has a new Git history and excludes the private development history and production credentials. The original private repositories and deployments were not changed by this preparation.

Use your own backend and service configuration. Optional integrations may remain disabled until configured; read [SECURITY.md](./SECURITY.md) and the development guide below. No production service access or running demonstration backend is included.

## License and commercial use

The original application code that the licensor is authorized to license is available under **PolyForm Noncommercial License 1.0.0**. Read [LICENSE](./LICENSE), [NOTICE](./NOTICE) and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

This is **source-available software**, with use limited to the purposes permitted by that license. Commercial reuse or resale outside those permissions requires a separate license: **felipecesarrf@gmail.com**.

Third-party code, libraries, fonts and assets retain their own licenses and notices. These application terms do not remove rights already granted by their holders. Product names, logos and branding are not offered as a license to market or impersonate the published products. GitHub's platform rights to view and fork public repositories continue to apply.


## Development guide

MyBrainly is a React Native/Expo language-learning app built around vocabulary flashcards, decks, study sessions, profiles and learning progress. This repository is a newly prepared source showcase, separate from the private production repository and its Git history.

[Published MyBrainly app on the App Store](https://apps.apple.com/nz/app/mybrainly/id6739167084)

The published app and this source showcase are distinct builds. The public copy uses development application identifiers, placeholder backend configuration and a server-only interface for AI. It does not include production credentials, user records or production deployment settings.

## Technology and implemented areas

- Expo SDK 52, React Native 0.76.9 and React 18.3.1.
- Firebase Authentication and Firestore integration.
- Deck and flashcard creation, study screens, vocabulary profiles, progress and feedback.
- RevenueCat subscription integration, disabled until your own public SDK keys are configured.
- AI deck creation through an authenticated backend contract; provider credentials must stay on the server.

## Local setup

Use Node.js compatible with Expo SDK 52, npm, and the platform toolchain: Xcode/CocoaPods for iOS or Android Studio/JDK for Android.

```sh
npm ci
```

In `app.json`, replace the `YOUR_FIREBASE_*` placeholders under `expo.extra` with the web client configuration from **your own** Firebase project. These Firebase client fields are public application configuration; access must still be restricted by Firebase Authentication, Firestore/Storage rules and appropriate API-key restrictions. This repository does not provide production Firebase rules or a hosted backend.

Create a local debug signing key for Android; no signing keystore is committed:

```sh
keytool -genkeypair -v -storetype PKCS12 \
  -keystore android/app/debug.keystore -storepass android \
  -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 \
  -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
```

The conventional debug password above is not a production credential. The generated keystore remains ignored. Configure your own Apple signing team in Xcode for iOS and your own private release signing configuration for release builds.

```sh
npm run android
# or
npm run ios
```

After installing a development build, `npm start` starts Metro. Expo Go is not the supported path for this app's native subscription dependencies.

## Optional AI backend

Set `expo.extra.AI_DECK_ENDPOINT` to your own HTTPS endpoint. Until then the AI screen explains that the backend is not configured and makes no provider request. Never put an OpenAI/provider secret in `app.json`, a mobile `.env` file, an `EXPO_PUBLIC_*` variable, native resources or client code.

The client sends:

```http
POST /your-ai-deck-endpoint
Authorization: Bearer <Firebase user ID token>
Content-Type: application/json
```

```json
{ "title": "Travel", "description": "Airport vocabulary", "language": "English", "count": 10 }
```

Your backend must verify the Firebase ID token, authorize the user, enforce quotas/input limits and keep the provider key in server-side secret storage. It should return:

```json
{ "flashcards": [{ "word": "gate", "translation": "portão", "example": "the boarding gate" }] }
```

No AI backend is implemented or deployed by this source showcase. The client validates the response and passes the resulting cards through the existing Firestore deck workflow.

## Optional subscriptions and sharing

Configure your own RevenueCat project with the optional `REVENUECAT_IOS_PUBLIC_SDK_KEY` and `REVENUECAT_ANDROID_PUBLIC_SDK_KEY` fields in `app.json`. Public SDK keys are distinct from RevenueCat secret API keys; secret keys must never be used in the mobile client. Purchases and restoration are inactive when SDK configuration is absent.

Production asset download tokens and production sharing endpoints were removed. Configure your own storage artwork and sharing bridge for a complete hosted experience. The public copy uses vibration feedback instead of original audio samples whose redistribution provenance was not documented.

## Verification and limits

```sh
node --test tests/*.test.cjs
```

The isolated AI client has tests for endpoint validation, session requirements, the restricted request contract and malformed responses. The prepared snapshot was parsed for JavaScript/JSX syntax, checked for missing static asset imports and scanned for secret patterns. A full native build, provider integration and production Firebase authorization were not tested in this preparation.

## License and attribution

Copyright in the original MyBrainly product belongs to Lunar Link Desenvolvimento de Software LTDA, as identified by the published app. See the repository `LICENSE` and `NOTICE` for the source-available terms applied to owned code. Public visibility does not grant unrestricted commercial redistribution or permission to reuse the product name and branding. Third-party components retain their own licenses; see `THIRD_PARTY_NOTICES.md`.
