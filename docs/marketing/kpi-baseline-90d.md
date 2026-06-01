# KPI baseline 90 dias

Fecha de arranque: 2026-05-07

## Objetivo operativo

Medir en ciclos quincenales el avance de participacion local y captacion para `lelianahoy.es`.

## KPIs y objetivo

- Usuarios locales (GA4): +30%
- Interacciones comunitarias (`incidencias_creadas + votos`): +40%
- CTR interno portada -> (`/denuncias`, `/eventos`, `/noticias`): +25%
- Suscriptores newsletter: +20%
- Tiempo de lectura contenidos locales (GA4): +15%

## Fuente de datos por KPI

- Usuarios locales: GA4, filtro geografico por L'Eliana / Camp de Turia.
- Interacciones comunitarias: `report.createdAt` + `report.likeCount`.
- CTR interno portada: evento GA4 `cta_click` con `cta_context`.
- Suscriptores newsletter: `newsletterSubscription.createdAt`.
- Tiempo de lectura: GA4 (engagement rate + average engagement time).

## Baseline recomendado

1. Abrir `/admin/marketing` y registrar valores de ultimos 30 dias.
2. Exportar en una hoja quincenal:
   - columna A: fecha de corte
   - columna B: valor actual
   - columna C: valor periodo previo
   - columna D: variacion %
   - columna E: accion aplicada
3. Mantener una nota corta de aprendizajes por cada corte.
