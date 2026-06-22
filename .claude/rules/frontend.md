---
paths:
  - "components/**/*"
  - "app/**/*.tsx"
  - "app/**/*.css"
  - "**/*.tsx"
  - "**/*.css"
---

# Frontend — Reglas de UI/UX

## Perfil del Usuario
Dueño o administrador de una peluquería. Usa la app a diario desde el celular (entre clientes, de pie) y ocasionalmente desde desktop. No es técnico: quiere información rápida, acciones directas, cero fricción.

## Arquitectura Responsive
- **Mobile-first:** cada acción clave alcanzable con el pulgar. Áreas táctiles >= 44px.
- **Breakpoint:** `md:` separa mobile de desktop. Mobile usa `components/mobile/`, desktop usa `components/admin/`.
- **Bottom nav (mobile):** 4 items — Hoy | Turnos | Agenda | Ganancias. Configuración vía hamburguesa en AppBar.
- **PWA:** manifest + service worker en `public/`. Meta tags para standalone iOS.

## Paleta de Colores
- **Admin (panel peluquero):** tokens `ap-*` definidos en `globals.css`. Base carbon oscuro (`#131313`), acento azul primario (`#2F6BFF`).
- **Cliente (formulario reserva):** tokens `cl-*`. Base navy profundo (`#0C1322`), acento gradiente azul-violeta.
- **Dark mode es la identidad**, no un tema alternativo. No mezclar fondos claros.

## Tipografía
- **Títulos:** Playfair Display (serif) — `font-display`
- **Body/UI:** Manrope (sans-serif) — `font-sans`
- **Números:** JetBrains Mono (monospace) — `font-mono`
- Jerarquía de tamaños marcada (>=1.25 ratio entre niveles).

## Regla Crítica: Cero Input Manual de Fechas
**PROHIBIDO** usar inputs de texto libre para selección de fechas u horarios. Usar componentes visuales (calendario, grilla de slots).

## Convenciones
- Iconos: Lucide React (stroke, no fill). Tamaños: 22px nav, 18-20px botones, 16px inline.
- Tailwind v4: sin `tailwind.config.ts`, tokens en `@theme {}` dentro de `globals.css`.
- Sin shadcn/ui — componentes custom con Tailwind.
- Texto usuario en español argentino ("vos", "turno", "reservá").

## Estado Actual
Pendiente: ajuste fino pre-producción (micro-fallas visuales, consistencia entre pantallas). Ver plan específico cuando se genere.
