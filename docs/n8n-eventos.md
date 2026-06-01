# Integracion de eventos con n8n

## Objetivo

Leer eventos desde `https://www.leliana.es/eventos` y sincronizarlos en `lelianahoy.es` mediante un upsert seguro.

## Endpoint de integracion

- URL: `POST /api/integrations/eventos/upsert`
- Auth:
  - `Authorization: Bearer <EVENTS_API_TOKEN>`
  - o `X-API-Key: <EVENTS_API_TOKEN>`
- Variable necesaria: `EVENTS_API_TOKEN` (16+ caracteres)

## Payload esperado

Campos nuevos opcionales:

- `category`: `"generico"` (por defecto) | `"teatro"` | `"feria"`
- `details`: JSON según categoría:
  - **teatro**: `startTime` (`"HH:mm"`), `theaterCompany`, `theaterCompanyVal` (opcional)
  - **feria**: `endDate` (`"YYYY-MM-DD"`), **obligatorio** si `category` es `feria`: último día (inclusive). Debe ser >= `eventDate` (fecha de inicio del evento)

También se acepta `extra` como alias de `details` en el upsert.

```json
{
  "externalId": "leliana:12345",
  "title": "Concierto de primavera",
  "titleVal": "Concert de primavera",
  "description": "Banda sinfonica municipal en la plaza.",
  "descriptionVal": "Banda simfonica municipal en la placa.",
  "eventDate": "2026-05-10",
  "category": "generico",
  "imageUrl": "https://.../imagen.jpg",
  "linkUrl": "https://www.leliana.es/evento/concierto-primavera",
  "source": "leliana.es",
  "sourceUrl": "https://www.leliana.es/evento/concierto-primavera",
  "status": "active"
}
```

Ejemplo feria de tres días (10–12 mayo):

```json
{
  "externalId": "leliana:feria-2026",
  "title": "Fira del llibre",
  "description": "...",
  "eventDate": "2026-05-10",
  "category": "feria",
  "details": { "endDate": "2026-05-12" }
}
```

## Flujo n8n recomendado

1. `Cron` cada 6 horas.
2. `HTTP Request` a la pagina de origen.
3. `HTML Extract` o `Code` para parsear eventos.
4. Normalizar fecha y generar `externalId` estable.
5. `Split In Batches` + `HTTP Request` al endpoint upsert.
6. Manejo de errores con notificacion (email/Telegram/Slack).

## Notas de deduplicacion

- `externalId` es unico en base de datos.
- Si cambia titulo o descripcion en origen, el evento se actualiza.
- El detalle publico usa `slug` y se mantiene estable entre sincronizaciones.
