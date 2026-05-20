# Kroatravel × Volaris Integration

Plataforma de booking aéreo para la agencia Kroatravel, integrada con la API de Duffel para acceder a vuelos de Volaris.

![Volaris](https://img.shields.io/badge/Volaris-E41B17?style=for-the-badge&logo=airplane&logoColor=white)
![Duffel](https://img.shields.io/badge/Duffel-API-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🚀 Características

- **Búsqueda de vuelos** en tiempo real con filtros por precio, aerolinea, clase y escalas
- **Vista de resultados** en múltiples formatos: tarjetas, lista compacta y burbujas
- **Reservación de vuelos** con formulario de pasajeros y datos de contacto
- **Panel de reservaciones** para visualizar reservas confirmadas
- **Diseño moderno** con glassmorphism, gradientes y animaciones fluidas

## 📁 Estructura del Proyecto

```
├── app/
│   ├── api/
│   │   ├── search/route.ts    # Endpoint para buscar ofertas
│   │   ├── offers/route.ts    # Endpoint para obtener detalle de ofertas
│   │   ├── orders/route.ts   # Endpoint para crear órdenes
│   │   └── order/route.ts     # Endpoint para reservaciones
│   ├── search/page.tsx        # Página de búsqueda
│   ├── offers/page.tsx       # Página de resultados
│   ├── booking/page.tsx       # Página de reservación
│   ├── reservations/page.tsx   # Panel de reservaciones
│   └── page.tsx               # Landing page
├── components/                # Componentes reutilizables
├── public/img/                # Recursos estáticos
└── .env.local                # Variables de entorno (no commitear)
```

## 🛠️ Requisitos

- Node.js 18+
- npm o yarn
- Cuenta de Duffel con Access Token

## ⚙️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd kroatravel-volaris
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env.local` en la raíz del proyecto:

```env
DUFFEL_ACCESS_TOKEN=duffel_test_tu_token_aqui
```

Obtén tu token en [Duffel Dashboard](https://app.duffel.com/tokens)

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

5. **Abrir en el navegador**
```
http://localhost:3000
```

## 🧪 Build para Producción

```bash
npm run build
npm start
```

## 📡 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/search` | Crear offer request y obtener ofertas |
| GET | `/api/offers` | Obtener detalle de una oferta |
| POST | `/api/order` | Crear una reservación |
| GET | `/api/orders` | Listar todas las reservaciones |

## 🎨 Vistas

### Landing Page `/`
Hero con integración Kroatravel × Volaris, características de la API y flujo de integración.

### Búsqueda `/search`
Formulario con:
- Origen y destino (aeropuertos mexicanos)
- Fecha de salida
- Número de pasajeros
- Clase de cabina

### Resultados `/offers`
Ofertas con filtros y 3 vistas:
- **Tarjetas**: Cards visuales con información del vuelo
- **Compacto**: Lista simplificada
- **Burbujas**: Representación proporcional al precio

### Reservación `/booking`
Formulario de pasajeros con boarding pass preview en tiempo real.

### Mis Reservaciones `/reservations`
Panel con historial de reservas, filtros y vistas alternativas.

## ⚠️ Notas Importantes

- Los tokens de **test** (`duffel_test_...`) no generan reservas reales
- Las ofertas expiran rápidamente - completa la reserva sin demora
- Los números de teléfono deben seguir formato E.164 (ej: +525551234567)

## 📄 Licencia

MIT © 2024 Kroatravel