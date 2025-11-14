#!/bin/bash
# 🔧 Configuración dinámica de app.json para BusNow

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Configurando app.json con variables de entorno...${NC}"

# Verificar que existe .env
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: Archivo .env no encontrado${NC}"
    echo -e "${YELLOW}💡 Copia .env.example a .env y configura tus variables${NC}"
    exit 1
fi

# Cargar variables de entorno
source .env

# Verificar que PROJECT_ID está definido
if [ -z "$EXPO_PUBLIC_PROJECT_ID" ]; then
    echo -e "${RED}❌ Error: EXPO_PUBLIC_PROJECT_ID no está definido en .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PROJECT_ID encontrado: $EXPO_PUBLIC_PROJECT_ID${NC}"

# Backup del app.json original
cp app.json app.json.backup

# Usar sed para reemplazar el PROJECT_ID en app.json (compatible con Windows/Git Bash)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows/Git Bash
    sed -i "s/\"projectId\": \"[^\"]*\"/\"projectId\": \"$EXPO_PUBLIC_PROJECT_ID\"/" app.json
else
    # Unix/Linux/macOS
    sed -i '' "s/\"projectId\": \"[^\"]*\"/\"projectId\": \"$EXPO_PUBLIC_PROJECT_ID\"/" app.json
fi

echo -e "${GREEN}✅ app.json actualizado con PROJECT_ID desde .env${NC}"

# Verificar el cambio
if grep -q "$EXPO_PUBLIC_PROJECT_ID" app.json; then
    echo -e "${GREEN}🎉 Configuración exitosa!${NC}"
    echo -e "${BLUE}📱 Project ID: $EXPO_PUBLIC_PROJECT_ID${NC}"
else
    echo -e "${RED}❌ Error: No se pudo actualizar app.json${NC}"
    # Restaurar backup
    mv app.json.backup app.json
    exit 1
fi

# Limpiar backup
rm -f app.json.backup

echo -e "${BLUE}🚀 app.json listo para usar con EAS${NC}"
