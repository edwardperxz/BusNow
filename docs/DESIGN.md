# 🎨 Paleta de Colores BusNow

La nueva paleta de colores de BusNow refleja la identidad visual moderna y accesible de la aplicación.

## 🚌 Colores Principales

| Color | Hex | Uso |
|-------|-----|-----|
| **Principal** | `#003D2D` | Verde oscuro - Color principal de la marca |
| **Blanco** | `#FFFFFF` | Blanco puro - Fondos y textos sobre colores oscuros |
| **Secundario Fuerte** | `#163C78` | Azul fuerte - Acciones secundarias y navegación |
| **Secundario Débil** | `#B76D68` | Rosa suave - Elementos de apoyo y estados |
| **Destacable** | `#E09F3E` | Naranja - Llamadas a la acción e información importante |

## 🚦 Estados de Buses

- **Activo** (`#003D2D`): Bus en ruta normal
- **Inactivo** (`#6B7280`): Bus fuera de servicio
- **Mantenimiento** (`#E09F3E`): Bus en mantenimiento
- **Retrasado** (`#B76D68`): Bus con retrasos

## 👥 Niveles de Capacidad

- **Disponible** (`#003D2D`): Muchos asientos libres
- **Medio lleno** (`#E09F3E`): Capacidad media
- **Muy lleno** (`#B76D68`): Pocos asientos
- **Completo** (`#163C78`): Sin espacio disponible

## 🌈 Colores de Rutas

Las rutas utilizan variaciones de la paleta principal para mantener consistencia visual:

1. **Línea 1**: `#003D2D` (Verde principal)
2. **Línea 2**: `#163C78` (Azul fuerte)
3. **Línea 3**: `#E09F3E` (Naranja)
4. **Línea 4**: `#B76D68` (Rosa)
5. **Línea 5**: `#004D40` (Verde más oscuro)
6. **Línea 6**: `#1E3A8A` (Azul más oscuro)

## 💡 Uso en el Código

```typescript
import { BusNowColors } from '../styles/colors';

// Usar colores principales
backgroundColor: BusNowColors.primary
color: BusNowColors.white

// Usar funciones utilitarias
backgroundColor: getBusStatusColor('active')
backgroundColor: getRouteColor(1)
backgroundColor: getCapacityColor('low')
```

## ♿ Accesibilidad

Esta paleta cumple con las pautas de accesibilidad WCAG 2.1:
- Contraste mínimo de 4.5:1 para texto normal
- Contraste mínimo de 3:1 para texto grande
- Colores diferenciables para usuarios con daltonismo
