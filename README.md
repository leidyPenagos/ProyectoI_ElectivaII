# AulaOrganizada

WebApp académica para gestionar la labor docente en Educación Básica Primaria.

## Requisitos
- Node.js 18 o superior
- Cuenta de MongoDB Atlas o MongoDB local
- Acceso a internet para cargar Bootstrap desde CDN

## Instalación en Windows (PowerShell)
1. Descomprime el ZIP.
2. Abre una terminal dentro de la carpeta `AulaOrganizada`.
3. Instala dependencias:
   ```bash
   npm install
   ```
4. Copia `.env.example` como `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
5. Edita `.env` y configura `MONGODB_URI`, `JWT_SECRET` y `SESSION_SECRET`. No compartas el archivo `.env`.
6. Inicia:
   ```bash
   npm run dev
   ```
   o `npm start`.
7. Abre `http://localhost:3000`, crea una cuenta docente y entra.
8. Swagger: `http://localhost:3000/api-docs`.

## Módulos incluidos
Cursos, estudiantes y acudientes (contactos incluidos en ficha del estudiante), asignaturas, asignaciones docentes, horarios, asistencias, planeaciones, actividades, calificaciones, incidentes y comunicaciones.

## API
- `GET /api/health` — estado de API y conexión a MongoDB.
- `POST /api-token` — obtiene un JWT usando `correo` y `password` en JSON.
- `GET /api/:resource` — lista los registros propios del usuario.
- `POST /api/:resource` — crea un registro.
- `GET /api/:resource/:id` — consulta un registro.
- `PATCH /api/:resource/:id` — actualiza un registro.
- `DELETE /api/:resource/:id` — elimina un registro.
- Recursos válidos: `cursos`, `estudiantes`, `asignaturas`, `asignaciones`, `horarios`, `asistencias`, `planeaciones`, `actividades`, `calificaciones`, `incidentes`, `comunicaciones`.

Las rutas de datos requieren `Authorization: Bearer <token>`. Para obtener el token, envía:
```json
{"correo":"docente@ejemplo.com","password":"tu_contraseña"}
```
a `POST /api-token`.

Ejemplo para crear:
```json
{
  "fecha": "2026-10-14",
  "data": {
    "curso": "4.º A",
    "asignatura": "Matemáticas",
    "estudiante": "Estudiante de prueba",
    "estado": "Presente",
    "observacion": ""
  }
}
```
a `POST /api/asistencias`.

## Importante: alcance académico
Esta versión es un punto de partida funcional: permite crear, listar, filtrar por fecha, consultar, actualizar y eliminar registros vía API; la interfaz web permite crear, listar, filtrar y eliminar. Los datos de distintos módulos se almacenan en una colección genérica `records` y cada documento tiene un campo `resource`. Para una entrega de producción o una rúbrica que exija un modelo independiente por entidad, conviene separar los modelos y validar relaciones entre cursos, asignaturas y estudiantes. Los formularios iniciales relacionan registros mediante texto (por ejemplo, “4.º A”), así que no sustituyen las validaciones relacionales de un sistema institucional.

## Seguridad y privacidad
Usa únicamente datos ficticios para la demostración. Como puede manejar datos de menores, implementa autorización estricta, HTTPS, copias de seguridad y las obligaciones aplicables de protección de datos antes de cualquier uso real. Las sesiones web se guardan en MongoDB; el JWT se utiliza para la API.
