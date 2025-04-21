# DARU - Panel de Administración

Plataforma de administración y gestión para el MarketPlace DARU.MX, desarrollada con Angular 13.

## Acerca del Proyecto

DARU.MX es una plataforma de comercio electrónico (MarketPlace) especializada en productos tecnológicos que integra múltiples proveedores y catálogos. Este panel de administración permite:

- Gestión completa de productos, categorías, marcas y proveedores
- Importación de catálogos de diferentes proveedores (CT, CVA, Ingram, Syscom, Daisytek, Inttelec, etc.)
- Administración de pedidos y seguimiento de envíos
- Dashboard con estadísticas de ventas por proveedor
- Sistema de cupones y promociones
- Gestión de usuarios y clientes
- Configuración de parámetros del sistema

## Características Técnicas

- Basado en Angular 13 con soporte GraphQL (Apollo)
- Integración con múltiples APIs de proveedores
- Autenticación JWT
- Sistema de permisos basado en roles
- Interfaz responsiva compatible con dispositivos móviles

## Development server

Ejecuta `ng serve` para iniciar el servidor de desarrollo. Navega a `http://localhost:4203/`. La aplicación se recargará automáticamente si cambias alguno de los archivos fuente.

## Code scaffolding

Ejecuta `ng generate component component-name` para generar un nuevo componente. También puedes usar `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Ejecuta `ng build` para construir el proyecto. Los archivos de salida se almacenarán en el directorio `dist/`. Usa la bandera `--prod` para una compilación de producción.

## Running unit tests

Ejecuta `ng test` para ejecutar las pruebas unitarias via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Ejecuta `ng e2e` para ejecutar las pruebas end-to-end via [Protractor](http://www.protractortest.org/).

## Further help

Para obtener más ayuda sobre Angular CLI usa `ng help` o consulta el [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Estructura de Carpetas

El proyecto sigue una estructura organizada por módulos:

- **@account**: Gestión de autenticación y cuentas de usuario
- **@core**: Servicios, interfaces, guardias y modelos principales
- **@graphql**: Operaciones GraphQL y servicios de API
- **@layouts**: Componentes de diseño y estructura de la aplicación
- **@pages**: Módulos y componentes de las páginas principales
- **@shared**: Componentes compartidos y utilidades

## Conexión con APIs Externas

El sistema se conecta con múltiples APIs de proveedores para importar catálogos, verificar existencias y procesar pedidos. La configuración de estas conexiones se administra desde la interfaz de usuario.

## Equipo de Desarrollo

Desarrollado y mantenido por el equipo de DARU.MX.
