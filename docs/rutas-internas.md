# Rutas internas — sabhoy.es

Mapa de **secciones públicas** para enlazar desde noticias. Usar **rutas relativas** (`/eventos`) salvo que convenga la URL absoluta en noticias concretas (`https://www.sabhoy.es/noticias/{slug}`).

**Regla editorial:** en cada noticia, incluir **al menos un enlace interno** cuando el tema encaje con alguna ruta de esta tabla. Ver [`/generators/news-generator.md`](../../generators/news-generator.md) → **ENLACES INTERNOS**.

## Secciones principales

| Ruta | Cuándo enlazar | Ancla sugerida (ES / VAL) |
|------|----------------|---------------------------|
| `/eventos` | Festivales, conciertos, ferias, agenda cultural | calendario de eventos / calendari d'esdeveniments |
| `/noticias` | Remisión al archivo de noticias | más noticias de SAB / més notícies de SAB |
| `/politica` | Plenos, mociones, corporación | política local / política local |
| `/elecciones-municipales-sab-2027` | Proceso electoral 2027 | elecciones municipales 2027 / eleccions municipals 2027 |
| `/comercios` | Comercio local | directorio de comercios / directori de comerços |
| `/asociaciones` | Asociaciones, clubes | asociaciones del municipio / associacions del municipi |
| `/colegios` | Educación | colegios / col·legis |
| `/deportes` | Deporte local | deportes / esports |
| `/el-nostre-poble` | Historia, patrimonio | El nostre poble / El nostre poble |
| `/informacion-util` | Trámites, teléfonos | información útil / informació útil |
| `/videos` | Vídeos en la web | vídeos locales / vídeos locals |
| `/denuncias` | Denuncia ciudadana (con tacto) | denuncias ciudadanas / denúncies ciutadanes |

## Ejemplos por tema

- **Fiestas patronales, agenda cultural** → `/eventos` (véase también [`docs/fiestas/fiestas-tradiciones-sab.md`](fiestas/fiestas-tradiciones-sab.md)).
- **Nuevo consultorio, sanidad** → `/noticias/{slug}` previas + [`docs/proyectos/nuevo-consultorio-nieva.md`](proyectos/nuevo-consultorio-nieva.md) como contexto interno (no publicar el .md; solo enlazar sección pública).
- **Moción de censura, gobierno** → `/politica` + noticias relacionadas.

Contexto local: [`docs/README.md`](README.md).
