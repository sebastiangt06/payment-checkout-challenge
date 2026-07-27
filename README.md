# FullStack Payment Checkout & Onboarding Application

Aplicación web FullStack responsiva orientada a dispositivos móviles para el procesamiento seguro de pagos con tarjeta de crédito mediante pasarela de pagos Sandbox, control de inventario en tiempo real y arquitectura resiliente ante recargas de página.

---

## 🔗 Enlaces del Proyecto

* **Frontend Deployed (Vercel):** [https://tu-app-checkout.vercel.app](https://tu-app-checkout.vercel.app)
* **Backend API (Render/AWS):** [https://payment-checkout-challenge-api.onrender.com/api/v1](https://payment-checkout-challenge-api.onrender.com/api/v1)
* **Swagger API Docs:** [https://payment-checkout-challenge-api.onrender.com/docs](https://payment-checkout-challenge-api.onrender.com/docs)

---

## 🏛️ Arquitectura del Sistema

El proyecto está diseñado siguiendo principios de **Clean Code**, **Arquitectura Hexagonal (Puertos y Adaptadores)** y **Railway Oriented Programming (ROP)** para garantizar bajo acoplamiento, mantenibilidad y facilidades de prueba.

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

+-------------------+       +-----------------------+
|     CUSTOMER      |       |      DELIVERY         |
+-------------------+       +-----------------------+
| id (PK, UUID)     |       | id (PK, UUID)         |
| name              |       | address               |
| email             |       | city                  |
| createdAt         |       | phone                 |
+---------+---------+       +-----------+-----------+
|                             |
| 1                           | 1
|                             |
| N                           | N
+---------v-----------------------------v-----------+       +-------------------+
|                   TRANSACTION                     |       |      PRODUCT      |
+---------------------------------------------------+       +-------------------+
| id (PK, UUID)                                     |       | id (PK, UUID)     |
| reference (String, UNIQUE)                        |  N   1| name              |
| productId (FK) -----------------------------------+------>| description       |
| quantity (Integer)                                |       | price (Numeric)   |
| amount (Numeric)                                  |       | stock (Integer)   |
| baseFee (Numeric, $2.500)                         |       | createdAt         |
| deliveryFee (Numeric, $10.000)                    |       +-------------------+
| status (PENDING | APPROVED | DECLINED | ERROR)        |
| createdAt                                         |
+---------------------------------------------------+


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
 utils/cardUtils.ts          |   95.65 |    90.00 |  100.00 |  100.00 |
 utils/currencyFormater.ts   |  100.00 |   100.00 |  100.00 |  100.00 |
----------------------------|---------|----------|---------|---------|
Test Files: 8 passed (8) | Tests: 20 passed (20)