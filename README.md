# 🚀 Trends MCP (SaaS Radar de Tendencias)

Una plataforma modular diseñada para creadores de contenido. Detecta tendencias tempranas, audios virales y temas candentes en tiempo real analizando la "Velocidad de Crecimiento" (Momentum) en múltiples plataformas.

## 🏗️ Arquitectura del Proyecto (Monorepo)

Este repositorio contiene el motor completo del SaaS, dividido en tres piezas clave:

* **/apps/frontend**: Dashboard Premium (Next.js 14 App Router + Tailwind + Recharts).
* **/apps/backend-api**: Motor Multi-Fuente (Node.js + Express) ejecutándose en el puerto 3001.
* **/mcp**: Servidor Model Context Protocol (STDIO) para integración con LLMs como Claude Desktop.

## 🧠 Capacidades Core

* **Motor Multi-Fuente:** Adaptadores integrados para YouTube Data API v3 y Reddit API (Rising). Preparado para integraciones futuras.
* **Momentum Scoring:** Algoritmo propietario que calcula la velocidad de viralidad basándose en el ratio visualizaciones/tiempo.
* **Protección de Cuotas (Caché):** Sistema inteligente de caché en memoria (TTL) para evitar bloqueos y optimizar costes de API externas.
* **Dashboard Premium:** Interfaz oscura, minimalista y profesional para la visualización de datos.

## 🛠️ Stack Tecnológico

* **Frontend:** Next.js 14, React, Tailwind CSS, shadcn/ui, Recharts.
* **Backend:** Node.js, Express, TypeScript, Axios.
* **Integración IA:** Model Context Protocol (MCP) SDK.

## ⚙️ Configuración y Arranque

Para instrucciones detalladas sobre cómo obtener las API Keys y levantar el entorno de desarrollo, consulta el archivo [SETUP.md](./SETUP.md).
