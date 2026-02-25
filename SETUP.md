# 🚦 Guía de Configuración y Arranque (Local)

Para que el Radar de Tendencias funcione con datos reales, necesitas configurar las claves de las APIs externas y levantar los servicios.

## Paso 1: Obtener las API Keys

### 1. YouTube Data API v3
1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto nuevo (ej. "Trends Radar").
3. Ve a "APIs y Servicios" > "Biblioteca" y busca **YouTube Data API v3**. Haz clic en "Habilitar".
4. Ve a "Credenciales" > "Crear credenciales" > "Clave de API".
5. Copia esa clave.

### 2. Reddit API (User-Agent)
Reddit no exige una API key compleja para búsquedas públicas en `/rising`, pero **exige un User-Agent estricto** para no banearte la IP.
* Formato requerido: `<plataforma>:<app ID>:<version> (by /u/<tu_usuario_de_reddit>)`
* Ejemplo: `web:trends-mcp:v1.0 (by /u/Estivbi)`

## Paso 2: Configurar Variables de Entorno (.env)

En la carpeta `apps/backend-api`, renombra el archivo `.env.example` a `.env` (o créalo) y añade:

```env
PORT=3001
YOUTUBE_API_KEY="tu_clave_de_google_aqui"
REDDIT_USER_AGENT="web:trends-mcp:v1.0 (by /u/tu_usuario)"
# CORS config para permitir que Next.js llame al backend
CORS_ORIGIN="http://localhost:3000"
