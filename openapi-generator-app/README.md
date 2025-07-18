# openapi-generator-app

## Descripción

Este proyecto es una aplicación que utiliza `openapi-generator-cli` para generar código basado en especificaciones OpenAPI. La aplicación está dividida en dos partes: un backend construido con TypeScript y Express, y un frontend desarrollado con Angular.

## Estructura del Proyecto

- **backend/**: Contiene la lógica del servidor y la configuración de la API.
  - **src/**: Código fuente del backend.
    - **app.ts**: Punto de entrada de la aplicación backend.
    - **types/**: Contiene definiciones de tipos utilizados en la aplicación.
  - **package.json**: Configuración de npm para el backend.
  - **tsconfig.json**: Configuración de TypeScript para el backend.

- **frontend/**: Contiene la interfaz de usuario de la aplicación.
  - **src/**: Código fuente del frontend.
    - **app/**: Componentes de la aplicación Angular.
      - **app.component.ts**: Lógica del componente principal.
      - **app.component.html**: Plantilla HTML del componente principal.
      - **app.module.ts**: Módulo principal de la aplicación.
    - **environments/**: Configuraciones de entorno.
      - **environment.ts**: Configuración del entorno de desarrollo.
      - **environment.prod.ts**: Configuración del entorno de producción.
  - **angular.json**: Configuración del proyecto Angular.
  - **package.json**: Configuración de npm para el frontend.
  - **tsconfig.json**: Configuración de TypeScript para el frontend.

## Instalación

Para instalar las dependencias del proyecto, navega a las carpetas `backend` y `frontend` y ejecuta:

```bash
npm install
```

## Ejecución

Para ejecutar el backend, utiliza el siguiente comando en la carpeta `backend`:

```bash
npm start
```

Para ejecutar el frontend, utiliza el siguiente comando en la carpeta `frontend`:

```bash
ng serve
```

## Generación de Código

Para generar código utilizando `openapi-generator-cli`, asegúrate de tenerlo instalado y ejecuta el siguiente comando:

```bash
openapi-generator-cli generate -i <ruta-a-tu-especificacion-openapi> -g <lenguaje-de-salida> -o <directorio-de-salida>
```

Reemplaza `<ruta-a-tu-especificacion-openapi>`, `<lenguaje-de-salida>`, y `<directorio-de-salida>` con los valores correspondientes.

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la licencia MIT.