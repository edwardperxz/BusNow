#!/bin/bash

# 🚀 BusNow Deployment Scripts
# Scripts para facilitar el deployment de BusNow en EAS

echo "🚌 BusNow - EAS Deployment Helper"
echo "================================="

# Configurar app.json automáticamente
echo -e "${YELLOW}🔧 Configurando app.json con variables de .env...${NC}"
npm run configure

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en configuración. Verifica tu archivo .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Configuración completada${NC}"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar estado de builds
check_builds() {
    echo -e "${BLUE}📊 Estado actual de builds:${NC}"
    eas build:list
}

# Función para build de desarrollo
build_dev() {
    echo -e "${YELLOW}🔨 Iniciando build de desarrollo...${NC}"
    eas build --platform all --profile development
}

# Función para build de preview
build_preview() {
    echo -e "${BLUE}📱 Iniciando build de preview...${NC}"
    echo "Selecciona plataforma:"
    echo "1) Android"
    echo "2) iOS"
    echo "3) Ambas"
    read -p "Opción (1-3): " platform_choice
    
    case $platform_choice in
        1)
            eas build --platform android --profile preview
            ;;
        2)
            eas build --platform ios --profile preview
            ;;
        3)
            eas build --platform all --profile preview
            ;;
        *)
            echo -e "${RED}Opción inválida${NC}"
            ;;
    esac
}

# Función para build de producción
build_prod() {
    echo -e "${GREEN}🚀 Iniciando build de producción...${NC}"
    echo -e "${YELLOW}⚠️  ¿Estás seguro? Este build irá a las tiendas.${NC}"
    read -p "Confirmar (y/N): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        echo "Selecciona plataforma:"
        echo "1) Android"
        echo "2) iOS" 
        echo "3) Ambas"
        read -p "Opción (1-3): " platform_choice
        
        case $platform_choice in
            1)
                eas build --platform android --profile production
                ;;
            2)
                eas build --platform ios --profile production
                ;;
            3)
                eas build --platform all --profile production
                ;;
            *)
                echo -e "${RED}Opción inválida${NC}"
                ;;
        esac
    else
        echo "Build cancelado."
    fi
}

# Función para actualizaciones OTA
ota_update() {
    echo -e "${BLUE}📤 Enviando actualización OTA...${NC}"
    echo "Selecciona canal:"
    echo "1) Preview"
    echo "2) Production"
    read -p "Opción (1-2): " channel_choice
    
    read -p "Mensaje de la actualización: " message
    
    case $channel_choice in
        1)
            eas update --branch preview --message "$message"
            ;;
        2)
            echo -e "${YELLOW}⚠️  Actualizando producción. ¿Confirmar?${NC}"
            read -p "Confirmar (y/N): " confirm
            if [[ $confirm =~ ^[Yy]$ ]]; then
                eas update --branch production --message "$message"
            else
                echo "Actualización cancelada."
            fi
            ;;
        *)
            echo -e "${RED}Opción inválida${NC}"
            ;;
    esac
}

# Función para enviar a tiendas
submit_stores() {
    echo -e "${GREEN}🏪 Enviar a tiendas...${NC}"
    echo "Selecciona tienda:"
    echo "1) Google Play Store (Android)"
    echo "2) Apple App Store (iOS)"
    echo "3) Ambas"
    read -p "Opción (1-3): " store_choice
    
    case $store_choice in
        1)
            eas submit --platform android --profile production
            ;;
        2)
            eas submit --platform ios --profile production
            ;;
        3)
            eas submit --platform all --profile production
            ;;
        *)
            echo -e "${RED}Opción inválida${NC}"
            ;;
    esac
}

# Menú principal
show_menu() {
    echo ""
    echo "¿Qué deseas hacer?"
    echo "1) Ver estado de builds"
    echo "2) Build de desarrollo"
    echo "3) Build de preview"
    echo "4) Build de producción"
    echo "5) Actualización OTA"
    echo "6) Enviar a tiendas"
    echo "7) Salir"
    echo ""
}

# Loop principal
while true; do
    show_menu
    read -p "Selecciona una opción (1-7): " choice
    
    case $choice in
        1)
            check_builds
            ;;
        2)
            build_dev
            ;;
        3)
            build_preview
            ;;
        4)
            build_prod
            ;;
        5)
            ota_update
            ;;
        6)
            submit_stores
            ;;
        7)
            echo -e "${GREEN}¡Hasta luego! 🚌${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Opción inválida. Por favor selecciona 1-7.${NC}"
            ;;
    esac
    
    echo ""
    read -p "Presiona Enter para continuar..."
done
