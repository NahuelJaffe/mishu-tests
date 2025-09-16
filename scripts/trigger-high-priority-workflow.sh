#!/bin/bash

# Script para ejecutar el workflow de high-priority-tests manualmente

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 TRIGGERING HIGH-PRIORITY TESTS WORKFLOW${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

# Verificar que estamos en el branch correcto
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "high-priority-tests" ]; then
    echo -e "${RED}❌ Error: Debes estar en el branch 'high-priority-tests'${NC}"
    echo -e "${YELLOW}💡 Ejecuta: git checkout high-priority-tests${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Branch actual: $CURRENT_BRANCH${NC}"
echo ""

# Opciones de browser
echo -e "${YELLOW}🌐 Selecciona el browser:${NC}"
echo "1) all (todos)"
echo "2) chromium"
echo "3) firefox"
echo "4) webkit"
echo ""
read -p "Opción (1-4): " browser_choice

case $browser_choice in
    1) browser="all" ;;
    2) browser="chromium" ;;
    3) browser="firefox" ;;
    4) browser="webkit" ;;
    *) echo -e "${RED}❌ Opción inválida${NC}"; exit 1 ;;
esac

# Opciones de categoría
echo ""
echo -e "${YELLOW}📂 Selecciona la categoría de tests:${NC}"
echo "1) all (todas las categorías)"
echo "2) auth (autenticación)"
echo "3) connections (conexiones)"
echo "4) messages (mensajes)"
echo "5) security (seguridad)"
echo ""
read -p "Opción (1-5): " category_choice

case $category_choice in
    1) category="all" ;;
    2) category="auth" ;;
    3) category="connections" ;;
    4) category="messages" ;;
    5) category="security" ;;
    *) echo -e "${RED}❌ Opción inválida${NC}"; exit 1 ;;
esac

echo ""
echo -e "${GREEN}🎯 Configuración seleccionada:${NC}"
echo -e "   Browser: ${BLUE}$browser${NC}"
echo -e "   Categoría: ${BLUE}$category${NC}"
echo ""

# Confirmar ejecución
read -p "¿Ejecutar workflow con esta configuración? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏹️  Cancelado por el usuario${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🚀 Ejecutando workflow...${NC}"

# Usar GitHub CLI para ejecutar el workflow
if command -v gh &> /dev/null; then
    gh workflow run high-priority-tests.yml \
        --ref high-priority-tests \
        -f browser="$browser" \
        -f test_category="$category"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Workflow ejecutado exitosamente${NC}"
        echo ""
        echo -e "${YELLOW}📊 Para ver el progreso:${NC}"
        echo -e "   ${BLUE}gh run list --workflow=high-priority-tests.yml${NC}"
        echo ""
        echo -e "${YELLOW}🔗 O visita GitHub Actions:${NC}"
        echo -e "   ${BLUE}https://github.com/NahuelJaffe/mishu-tests/actions${NC}"
    else
        echo -e "${RED}❌ Error ejecutando el workflow${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  GitHub CLI no está instalado${NC}"
    echo -e "${BLUE}💡 Instala GitHub CLI: https://cli.github.com/${NC}"
    echo ""
    echo -e "${YELLOW}🔗 Ejecuta manualmente en GitHub:${NC}"
    echo -e "   ${BLUE}https://github.com/NahuelJaffe/mishu-tests/actions/workflows/high-priority-tests.yml${NC}"
    echo ""
    echo -e "${YELLOW}📋 Parámetros a usar:${NC}"
    echo -e "   Browser: ${BLUE}$browser${NC}"
    echo -e "   Test Category: ${BLUE}$category${NC}"
fi
