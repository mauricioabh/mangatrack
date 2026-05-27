# MangaTrack — Android (nativo)

App Android en `android/` dentro del mismo repo que la web. Comparte API, Clerk, Neon y el pipeline de notificaciones (Inngest + FCM).

## Requisitos

- Android Studio (Ladybug o superior)
- JDK 17
- Proyecto Firebase con app Android (`com.mangatrack.app`)
- Clerk con **Native API** habilitada

## Configuración local

1. Copiar `android/local.properties.example` → `android/local.properties`
2. Ajustar `sdk.dir`, `mangatrack.apiBaseUrl`, `clerk.publishableKey`
   - Emulador → API: `http://10.0.2.2:3000`
   - Dispositivo físico → IP de tu PC, ej. `http://192.168.x.x:3000`
3. Firebase Console → añadir app Android → descargar `google-services.json` → `android/app/google-services.json`
4. Abrir **Android Studio** → *Open* → carpeta `android/`

## Notificaciones (misma arquitectura que web)

| Capa | Comportamiento |
|------|----------------|
| MangaDex webhook | `POST /api/webhook/mangadex` |
| Inngest | `manga/chapter.published` |
| Por usuario | In-app + email (preferencias) + FCM si hay token |
| Android | `POST /api/user/push-token` con `platform: "ANDROID"` |

En la app: **Settings → Enable on this device** registra el token FCM.

## Auth móvil

Las rutas API aceptan sesión web (cookies) o **`Authorization: Bearer <Clerk JWT>`** desde Android (`src/lib/auth-request.ts`).

## Estructura

```
android/
  app/src/main/java/com/mangatrack/app/
    MainActivity.kt          # Nav + Clerk AuthView
    data/api/                # Retrofit → mismas rutas que la web
    notifications/           # FCM service + registro de token
    ui/screens/              # Library, Search, Detail, Reader, Settings
    billing/                 # Stripe Checkout (Custom Tabs + deep links)
```

## Build (Gradle en terminal)

Desde `android/` (hay `gradlew.bat`):

```powershell
cd c:\Projects\mangatrack\android
.\gradlew.bat :app:signingReport    # SHA-256 para Clerk (variant debug)
.\gradlew.bat :app:assembleDebug    # compila APK debug
```

El keystore de debug se crea al firmar/compilar; si `signingReport` dice *Missing keystore*, ejecuta `assembleDebug` primero o genera el keystore con `keytool` (ver abajo).

**SHA-256 sin Android Studio UI:**

```powershell
& "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -list -v `
  -keystore "$env:USERPROFILE\.android\debug.keystore" `
  -alias androiddebugkey -storepass android -keypass android
```

## Build (Android Studio)

*Run* en emulador o dispositivo.

La web sigue en la raíz (`npm run dev`); el deploy Vercel **no** incluye el APK.

## Lector

- Detalle manga → capítulo → `ReaderScreen` (scroll vertical).
- Imágenes vía proxy autenticado: `/api/chapters/{id}/pages/{n}` (mismo JWT que el resto de la API).

## Stripe Premium

- Settings → Monthly/Yearly abre **Chrome Custom Tab** con Stripe Checkout.
- URLs de retorno: `mangatrack://checkout/success` y `mangatrack://checkout/cancel` (deep link en el manifest).
- El backend acepta `successUrl` / `cancelUrl` opcionales en `POST /api/stripe/create-checkout`.

## Qué no mezclar

- No desplegar `android/` en Vercel
- No duplicar Prisma/Inngest en la app — solo HTTP al backend
- Un solo repo Git; issues/PRs pueden etiquetar `platform: android` vs `platform: web`
