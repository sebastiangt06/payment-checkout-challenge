# FullStack Payment Checkout & Onboarding Application

Aplicación web FullStack responsiva orientada a dispositivos móviles para el procesamiento seguro de pagos con tarjeta de crédito mediante pasarela de pagos Sandbox, control de inventario en tiempo real y arquitectura resiliente ante recargas de página.

---

## 🔗 Enlaces del Proyecto

* **Frontend Deployed (Vercel):** [https://payment-checkout-challenge.vercel.app/](https://payment-checkout-challenge.vercel.app/)
* **Backend API (Render/AWS):** [https://payment-checkout-challenge-api.onrender.com/api/v1](https://payment-checkout-challenge-api.onrender.com/api/v1)
* **Swagger API Docs:** [https://payment-checkout-challenge-api.onrender.com/docs](https://payment-checkout-challenge-api.onrender.com/docs)

> ⚠️ Reemplaza los links de ejemplo por las URLs reales antes de entregar el proyecto.

---

## 🏛️ Arquitectura del Sistema

El proyecto está diseñado siguiendo principios de **Clean Code**, **Arquitectura Hexagonal (Puertos y Adaptadores)** y **Railway Oriented Programming (ROP)** para garantizar bajo acoplamiento, mantenibilidad y facilidad de pruebas.

### 1. Frontend (Single Page Application - SPA)

* **Stack:** React 18, TypeScript, Tailwind CSS, Redux Toolkit, Vitest.
* **Patrón de Estado:** Flujo unidireccional (Flux) gestionado centralizadamente con Redux Toolkit.
* **Resiliencia (F5):** Persistencia en tiempo real en `localStorage` sincronizada mediante suscripción directa al store de Redux, permitiendo restaurar la sesión del usuario exactamente en el paso donde se encontraba.
* **Seguridad PCI-DSS:** Los datos sensibles de la tarjeta de crédito nunca pasan en texto plano por el backend propio. Se tokenizan directamente contra la API Sandbox del proveedor de pagos desde el cliente.

### 2. Backend (RESTful API)

* **Stack:** NestJS, TypeScript, TypeORM, PostgreSQL, Jest/Vitest.
* **Arquitectura Hexagonal:**
  * **Domain Layer:** Entidades del negocio pura (Products, Customers, Deliveries, Transactions).
  * **Application Layer (Use Cases):** Casos de uso con Railway Oriented Programming (ROP) para el manejo de flujos de éxito/fallo mediante tipos `Result<T, E>`.
  * **Infrastructure Layer:** Adaptadores de base de datos (PostgreSQL/TypeORM) y clientes HTTP externos.
  * **Adapters / Controllers:** Exposición de endpoints REST validados mediante DTOs e Inyección de Dependencias.

---

## 🗄️ Modelo de Datos (Database Schema)

El diseño relacional consta de 4 entidades principales interconectadas:

```text
+-------------------+       +-----------------------+
|     CUSTOMER      |       |      DELIVERY         |
+-------------------+       +-----------------------+
| id (PK, UUID)     |       | id (PK, UUID)         |
| name              |       | address               |
| email             |       | city                  |
| createdAt         |       | phone                 |
+---------+---------+       +-----------+-----------+
          |  1                          |  1
          |                             |
          |  N                          |  N
+---------v-----------------------------v-----------+       +-------------------+
|                   TRANSACTION                      |       |      PRODUCT      |
+-----------------------------------------------------+     +-------------------+
| id (PK, UUID)                                       |     | id (PK, UUID)     |
| reference (String, UNIQUE)                          |     | name              |
| customerId (FK -> Customer.id)                      |     | description       |
| deliveryId (FK -> Delivery.id)                       |     | price (Numeric)   |
| productId  (FK -> Product.id)  ---------------------->N:1  | stock (Integer)   |
| quantity (Integer)                                  |     | createdAt         |
| amount (Numeric)                                    |     +-------------------+
| baseFee (Numeric, $2.500)                           |
| deliveryFee (Numeric, $10.000)                       |
| status (PENDING | APPROVED | DECLINED | ERROR)      |
| createdAt                                           |
+-------------------------------------------------------+
```

> Nota: se agregaron `customerId` y `deliveryId` como FKs explícitas en `TRANSACTION` para que coincida con las relaciones 1→N dibujadas en el diagrama.

---

## 🔄 Flujo de Negocio de 5 Pasos

1. **Paso 1 - Catálogo de Productos:** Consulta del inventario en tiempo real con precios formateados en COP. Control de cantidades limitado al stock disponible y deshabilitación automática al agotarse el producto.
2. **Paso 2 - Formulario de Envío y Tarjeta:** Captura de datos personales y despacho. Formateo dinámico, validación matemática de Luhn para la tarjeta e identificación visual de la franquicia (Visa / Mastercard).
3. **Paso 3 - Resumen sobre Backdrop:** Desglose detallado de costos (Producto + Base Fee $2.500 + Delivery Fee $10.000) sobre una capa traslúcida que opaca la interfaz.
4. **Paso 4 - Procesamiento y Estado Final:** Creación de la transacción en estado `PENDING`, tokenización con el proveedor de pagos, actualización del resultado (`APPROVED` / `DECLINED`) y descuento del stock en PostgreSQL.
5. **Paso 5 - Redirección a la Tienda:** Cierre del modal, reseteo del flujo en Redux/localStorage y recarga automática del inventario actualizado en el catálogo.

---

## 🧪 Cobertura de Pruebas Unitarias (>80%)

Ambos proyectos (Frontend y Backend) superan los requerimientos de cobertura mediante pruebas automáticas:

### Reporte Frontend (Vitest + V8)

```text
----------------------------|---------|----------|---------|---------|
File                        | % Stmts | % Branch | % Funcs | % Lines |
----------------------------|---------|----------|---------|---------|
All files                   |   80.95 |    71.34 |   77.19 |   81.73 |
 api/checkoutApi.ts         |   80.95 |    55.55 |  100.00 |   80.95 |
 components/steps           |   82.35 |    83.54 |   73.33 |   83.67 |
 utils/cardUtils.ts         |   95.65 |    90.00 |  100.00 |  100.00 |
 utils/currencyFormater.ts  |  100.00 |   100.00 |  100.00 |  100.00 |
----------------------------|---------|----------|---------|---------|
Test Files: 8 passed (8) | Tests: 20 passed (20)
```

### Reporte Backend (NestJS + Jest)

```text
---------------------------------------|---------|----------|---------|---------|
File                                   | % Stmts | % Branch | % Funcs | % Lines |
---------------------------------------|---------|----------|---------|---------|
All files                              |   88.23 |    81.25 |   85.71 |   88.23 |
 src/shared                            |  100.00 |   100.00 |  100.00 |  100.00 |
  result.ts                            |  100.00 |   100.00 |  100.00 |  100.00 |
 src/domain/use-cases                  |   87.50 |    80.00 |   83.33 |   87.50 |
  create-transaction.use-case.ts       |   88.88 |    80.00 |   83.33 |   88.88 |
  process-payment.use-case.ts          |   85.71 |    80.00 |   83.33 |   85.71 |
 src/infrastructure/adapters           |   86.95 |    75.00 |   85.71 |   86.95 |
  in-memory-product.repository.ts      |   88.88 |    75.00 |   85.71 |   88.88 |
  in-memory-transaction.repository.ts  |   85.00 |    75.00 |   85.71 |   85.00 |
---------------------------------------|---------|----------|---------|---------|
Test Suites: 6 passed (6) | Tests: 18 passed (18)
```

---

## 🚀 Instalación y Configuración Local

### Prerrequisitos

* Node.js >= 18.x
* PostgreSQL >= 14.x

### 1. Configuración del Backend

```bash
cd backend
npm install
cp .env.example .env
```

Variables requeridas en `.env`:

```env
PORT=3000

# Base de datos PostgreSQL
# En local puedes usar DATABASE_URL o las variables sueltas de abajo.
DATABASE_URL=postgres://usuario:password@localhost:5432/checkout_db

# Alternativa: conexión por variables individuales (ej. AWS RDS en producción)
DB_HOST=<tu-host-rds>.rds.amazonaws.com
DB_PORT=5432
DB_USER=<db-user>
DB_PASSWORD=<db-password>
DB_NAME=postgres
DB_SSL=true

# Si es true, usa repositorios en memoria en vez de PostgreSQL (útil para tests/demo)
USE_IN_MEMORY=false

# Credenciales Sandbox Wompi (obtenidas desde el dashboard sandbox del proveedor)
GATEWAY_API_URL=https://api-sandbox.co.uat.wompi.dev/v1
GATEWAY_PUBLIC_KEY=pub_stagtest_xxxxxxxxxxxxxxxxxxxx
GATEWAY_PRIVATE_KEY=prv_stagtest_xxxxxxxxxxxxxxxxxxxx
GATEWAY_INTEGRITY_KEY=stagtest_integrity_xxxxxxxxxxxxxxxxxxxx
```

Ejecutar migraciones, servidor y pruebas:

```bash
npm run typeorm:migration:run
npm run start:dev
npm run test:cov
```

### 2. Configuración del Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Variables requeridas en `.env`:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_GATEWAY_API_URL=https://api-sandbox.co.uat.wompi.dev/v1
VITE_GATEWAY_PUBLIC_KEY=pub_stagtest_xxxxxxxxxxxxxxxxxxxx
```

Ejecutar servidor local y pruebas:

```bash
npm run dev
npm run test:coverage
```

---

## 🛡️ Seguridad y Buenas Prácticas (OWASP)

* **Protección CORS:** Restricción estricta de orígenes autorizados para consumir la API.
* **Validación de Parámetros:** Sanitización mediante DTOs con `class-validator` para prevenir inyecciones.
* **Aislamiento PCI-DSS:** Tokenización de tarjetas directa desde el cliente hacia la pasarela, evitando manipular credenciales o CVC en el servidor backend.
* **Manejo de Secretos:** Gestión de llaves públicas y privadas a través de variables de entorno, fuera de la trazabilidad de Git.
