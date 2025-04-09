# MindUp Notification Service

Servicio de notificaciones para la plataforma educativa MindUp. Este servicio gestiona el envío de correos electrónicos y recordatorios automáticos.

## Características

- Envío de notificaciones por correo electrónico a usuarios
- Sistema de recordatorios automáticos similar a Duolingo
- Seguimiento de actividad de los usuarios
- Notificaciones de progreso en cursos
- Recordatorios de suscripciones por expirar

## Instalación

1. Clona el repositorio:
```bash
git clone [url-del-repositorio]
cd notifications-service
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` basado en `.env-example`:
```bash
cp .env-example .env
```

4. Edita el archivo `.env` con la configuración adecuada para tu entorno.

5. Ejecuta las migraciones de bases de datos (asegúrate de que tu base de datos MySQL esté configurada):
```bash
mysql -u root -p mindup < migrations.sql
```

## Estructura del Proyecto

```
notifications-service/
├── index.js                     # Punto de entrada principal
├── src/
│   ├── controllers/             # Controladores
│   ├── routes/                  # Rutas API
│   ├── services/                # Servicios (email, templates)
│   ├── scheduler/               # Servicio de programación de recordatorios
│   ├── utils/                   # Utilidades (DB, fechas)
│   └── templates/               # Plantillas HTML para correos
└── config/                      # Configuraciones
```

## Dependencias Principales

- express: Servidor web
- node-cron: Programación de tareas
- nodemailer: Envío de correos electrónicos
- mysql2: Conexión a base de datos MySQL

## Uso

### Iniciar el Servicio

```bash
npm start
```

Para desarrollo:
```bash
npm run dev
```

### Endpoints API

#### Notificaciones

- `POST /createNotification`: Envía una notificación por correo electrónico
  ```json
  {
    "to": "usuario@ejemplo.com",
    "subject": "Asunto del correo",
    "type": "welcome",
    "data": {
      "name": "Nombre del Usuario"
    }
  }
  ```

#### Recordatorios

- `PUT /reminders/preferences`: Actualiza preferencias de notificación
  ```json
  {
    "studentId": 1,
    "preferences": {
      "reminderFrequency": "weekly",
      "emailNotifications": true
    }
  }
  ```

- `GET /reminders/preferences/:studentId`: Obtiene preferencias de notificación

- `POST /reminders/send`: Envía un recordatorio manual
  ```json
  {
    "studentId": 1,
    "reminderType": "inactivity",
    "additionalData": {
      "daysInactive": 5
    }
  }
  ```

- `POST /reminders/track-activity`: Registra actividad de un estudiante
  ```json
  {
    "studentId": 1,
    "activityType": "login" // o "courseAccess", "moduleCompleted"
  }
  ```

## Scheduler

El sistema incluye trabajos programados que se ejecutan automáticamente:

- Recordatorio de inactividad: Diariamente a las 10:00 AM
- Recordatorio de progreso: Lunes, miércoles y viernes a las 3:00 PM
- Recordatorio de suscripción: Diariamente a las 9:00 AM

## Integración con el Frontend

Para rastrear la actividad del usuario desde el frontend, envía peticiones a la API:

```javascript
// Ejemplo al iniciar sesión
fetch('https://api.mindup.edu/reminders/track-activity', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    studentId: userId,
    activityType: 'login'
  })
});

// Ejemplo al acceder a un curso
fetch('https://api.mindup.edu/reminders/track-activity', {
  method: 'POST',
  body: JSON.stringify({
    studentId: userId,
    activityType: 'courseAccess'
  })
});

// Ejemplo al completar un módulo
fetch('https://api.mindup.edu/reminders/track-activity', {
  method: 'POST',
  body: JSON.stringify({
    studentId: userId,
    activityType: 'moduleCompleted'
  })
});
```