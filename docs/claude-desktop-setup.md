# Claude Desktop + MCP - Setup Completo GRATUITO

## 🎯 **Configuración Claude Desktop (100% Gratis)**

### **1. Descargar Claude Desktop**
```bash
# Mac
https://claude.ai/download

# O instalar con Homebrew
brew install --cask claude
```

### **2. Configurar MCP en Claude Desktop**
Crear/editar archivo de configuración:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "trends-mcp": {
      "command": "node",
      "args": [
        "/Users/carolina/Proyectos/trends-mcp/mcp/dist/trends-server.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### **3. O usar directamente con tsx (desarrollo)**
```json
{
  "mcpServers": {
    "trends-mcp-dev": {
      "command": "npx",
      "args": [
        "tsx", 
        "/Users/carolina/Proyectos/trends-mcp/mcp/trends-server.ts"
      ],
      "cwd": "/Users/carolina/Proyectos/trends-mcp/mcp"
    }
  }
}
```

## 🚀 **Flujo de Uso Completo**

### **Paso 1: Iniciar Backend**
```bash
cd /Users/carolina/Proyectos/trends-mcp/apps/backend-api
PORT=3001 npm run dev
```

### **Paso 2: Compilar MCP Server**
```bash
cd /Users/carolina/Proyectos/trends-mcp/mcp  
npm run build
```

### **Paso 3: Abrir Claude Desktop**
- Claude Desktop detectará automáticamente el MCP Server
- Aparecerá el icono 🔧 indicando herramientas disponibles

### **Paso 4: Probar con Claude**
```
¿Qué tendencias están viral en YouTube ahora?

¿Puedes generar 5 ideas de video basadas en tendencias actuales?

Busca tendencias sobre "react" o "javascript" 

Dame detalles sobre la tendencia más popular
```

## 🎯 **Ventajas de Claude Desktop vs Web**

| Claude Web | Claude Desktop + MCP |
|------------|---------------------|
| 💳 Límites de mensajes | ✅ Sin límites |
| ❌ Sin herramientas custom | ✅ Todas nuestras herramientas MCP |
| 🌐 Requiere internet | 📱 Funciona offline |
| 💰 $20/mes para Pro | 🆓 Completamente gratis |

## 📋 **Comandos de Prueba**

Una vez configurado, probar estos prompts en Claude Desktop:

### **1. Obtener Tendencias**
```
"Muéstrame las 10 tendencias más populares ahora"
```

### **2. Buscar Específico**  
```
"Busca tendencias relacionadas con programación o tecnología"
```

### **3. Ideas de Contenido**
```
"Genera 5 ideas de video para YouTube basadas en las tendencias actuales de gaming"
```

### **4. Análisis Detallado**
```
"Dame el detalle completo de la tendencia más viral y analiza por qué está funcionando"
```

## 🔧 **Troubleshooting**

### **Si no aparecen herramientas:**
1. Verificar que el backend esté en puerto 3001
2. Reiniciar Claude Desktop
3. Verificar logs del MCP server:
   ```bash
   cd mcp && npm run dev
   ```

### **Si hay errores de conexión:**
1. Compilar MCP server: `npm run build`
2. Verificar path absoluto en config
3. Verificar permisos de archivo

## ✅ **Resultado Final**

Con esta configuración tendrás:
- 🆓 **Claude Desktop gratis** con todas tus herramientas
- 📊 **Datos reales** de tendencias (cuando implementemos APIs)  
- 🤖 **Chat inteligente** que puede consultar tendencias
- 💡 **Generación de ideas** de contenido personalizadas
- 🔍 **Búsqueda semántica** en todas las plataformas

**¿Configuramos Claude Desktop ahora?**