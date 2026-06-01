/**
 * Contenido editorial para EvergreenPage (información útil) — San Antonio de Benagéber.
 */

export type EvergreenPageSeed = {
  slug: string;
  title: string;
  titleVal: string;
  content: string;
  contentVal: string;
  isHighlighted?: boolean;
};

export const EVERGREEN_PAGE_SEEDS: EvergreenPageSeed[] = [
  {
    slug: "telefonos-importantes",
    title: "Teléfonos importantes",
    titleVal: "Telèfons importants",
    isHighlighted: true,
    content: `# Teléfonos de emergencia y servicios en San Antonio de Benagéber

## Emergencias (24 h)

| Servicio | Teléfono |
|----------|----------|
| **Emergencias generales** | [112](tel:112) |
| **Emergencias sanitarias CV** | [061](tel:061) |
| **Policía Local SAB** | [961 351 202](tel:961351202) / [670 429 903](tel:670429903) |
| **Guardia Civil** | [062](tel:062) |
| **Bomberos** | [080](tel:080) (Valencia) |

## Ayuntamiento de San Antonio de Benagéber

- **Centralita:** [961 350 301](tel:961350301)
- **Dirección:** Plaza del Ayuntamiento, 1 — 46184 San Antonio de Benagéber
- **Horario atención:** lunes a viernes, 9:00–14:00
- **Web:** [sanantoniodebenageber.es](https://www.sanantoniodebenageber.es/)

### Extensiones útiles (marque 961 350 301)

| Ext. | Servicio |
|------|----------|
| 1 | Oficina de Atención al Ciudadano (OAC) y Registro |
| 2 | Igualdad y Bienestar social |
| 4 | Juzgado de Paz / Registro Civil |
| 5 | Intervención (facturas) |
| 8 | Servicios municipales (alta de agua, línea verde) |
| 9 | Cultura y Fiestas |

## Otros servicios

- **Casa de la Juventud:** 960 918 679 / 607 601 301
- **Edetania Bus (Metrobus):** [961 352 030](tel:961352030)
- **Farmacias de guardia (CV):** [961 496 199](tel:961496199)

## Urbanizaciones de referencia

Montesano, Colinas de San Antonio, Cumbres de San Antonio, San Vicente y Pla del Pou concentran buena parte de la población residencial del municipio.`,
    contentVal: `# Telèfons d'emergència i serveis a Sant Antoni de Benaixeve

## Emergències (24 h)

| Servei | Telèfon |
|--------|---------|
| **Emergències generals** | [112](tel:112) |
| **Emergències sanitàries CV** | [061](tel:061) |
| **Policia Local SAB** | [961 351 202](tel:961351202) |
| **Guàrdia Civil** | [062](tel:062) |

## Ajuntament

- **Centralita:** [961 350 301](tel:961350301)
- **Adreça:** Plaça de l'Ajuntament, 1 — 46184 Sant Antoni de Benaixeve
- **Horari:** dilluns a divendres, 9:00–14:00

Consulta també [farmàcies de guàrdia](/farmacias-de-guardia) i [transport públic](/transporte-publico-sab).`,
  },
  {
    slug: "farmacias-de-guardia",
    title: "Farmacias de guardia",
    titleVal: "Farmàcies de guàrdia",
    isHighlighted: true,
    content: `# Farmacias de guardia en San Antonio de Benagéber

El turno lo organiza el **Colegio Oficial de Farmacéuticos de Valencia**. Para el municipio usa el código postal **46184** en el buscador de [cofpv.com](https://www.cofpv.com/).

- **Teléfono de guardias CV:** [961 496 199](tel:961496199)
- La farmacia asignada puede estar en SAB o en municipios limítrofes (L'Eliana, Bétera, Paterna, La Pobla de Vallbona).

En horario ordinario hay varias oficinas de farmacia en el casco y en urbanizaciones. Para urgencias graves, llama al **112**.`,
    contentVal: `# Farmàcies de guàrdia a Sant Antoni de Benaixeve

Consulta el cercador del COF València amb el codi postal **46184** o truca al [961 496 199](tel:961496199).`,
  },
  {
    slug: "centro-salud-sab",
    title: "Centro de salud y consultorio",
    titleVal: "Centre de salut i consultori",
    isHighlighted: true,
    content: `# Salud en San Antonio de Benagéber

## Consultorio actual

El municipio dispone de **consultorio auxiliar** adscrito al Departamento de Salud Arnau de Vilanova-Llíria (Agrupación Sanitaria València-Sur). Atención de medicina de familia, pediatría y enfermería.

## Nuevo centro de salud (en tramitación)

La Conselleria de Sanidad ha licitado en **2026** la redacción del proyecto y dirección de obra del **nuevo consultorio auxiliar** en la **calle Nieva, 4**, sobre una parcela de 1.390 m² cedida por el Ayuntamiento.

- **Inversión estimada en obra:** 5,7 millones de euros
- **Mejoras previstas:** 7 consultas de medicina (frente a 5 actuales), 7 de enfermería, 3 de pediatría, matrona, extracciones, trabajo social
- **Calendario orientativo:** redacción 2026; licitación de obra prevista para **2027**

Mientras tanto, las citas y urgencias de atención primaria se gestionan desde el consultorio vigente y la cartera de servicios del departamento.

## Urgencias

- **112** / **061** para emergencias
- Hospitales de referencia en **Valencia** y **Llíria** — ver [hospitales cercanos](/hospitales-cercanos)`,
    contentVal: `# Salut a Sant Antoni de Benaixeve

## Consultori actual

Consultori auxiliar del Departament de Salut Arnau de Vilanova-Llíria.

## Nou centre de salut

Projecte al carrer Nieva, 4. La Conselleria de Sanitat ha licitat la redacció del projecte el 2026; obra prevista a partir de 2027. Inversió estimada: 5,7 M€.`,
  },
  {
    slug: "salud-sab",
    title: "Salud y emergencias",
    titleVal: "Salut i emergències",
    content: `# Guía de salud para vecinos de SAB

- [Centro de salud y nuevo consultorio](/centro-salud-sab)
- [Farmacias de guardia](/farmacias-de-guardia)
- [Hospitales cercanos](/hospitales-cercanos)
- [Urgencias](/urgencias-sab)

San Antonio de Benagéber, con unos **10.630 habitantes** y alta densidad (aprox. 1.220 hab/km²), tiene una población muy dinámica que exige equipamientos sanitarios ampliados.`,
    contentVal: `# Guia de salut per a veïns de SAB

Enllaços: [centre de salut](/centro-salud-sab), [farmàcies](/farmacias-de-guardia), [hospitals](/hospitales-cercanos).`,
  },
  {
    slug: "urgencias-sab",
    title: "Urgencias",
    titleVal: "Urgències",
    content: `# Qué hacer ante una urgencia en SAB

1. **Peligro vital:** [112](tel:112) o [061](tel:061)
2. **Urgencia sanitaria no vital:** consultorio / centro de salud en horario de urgencias de AP
3. **Policía Local:** [961 351 202](tel:961351202) (24 h)

No sustituyas una urgencia grave por la farmacia de guardia.`,
    contentVal: `# Què fer davant d'una urgència a SAB

1. **Perill vital:** 112 o 061
2. **Policia Local:** 961 351 202`,
  },
  {
    slug: "hospitales-cercanos",
    title: "Hospitales cercanos",
    titleVal: "Hospitals propers",
    content: `# Hospitales de referencia desde San Antonio de Benagéber

SAB no tiene hospital general; la derivación habitual es hacia **Valencia** y **Llíria**.

| Hospital | Notas |
|----------|-------|
| Hospital Arnau de Vilanova (Llíria) | Referencia del departamento de salud |
| La Fe, Clínico, General (Valencia) | Urgencias y especialidades |
| Hospital 9 d'Octubre | Valencia |

**Cómo llegar:** líneas de autobús **145, 146, 136** hacia Valencia; Metro Línea 2 en estaciones cercanas (L'Eliana, La Vallesa). Ver [transporte](/transporte-publico-sab).`,
    contentVal: `# Hospitals de referència des de SAB

Derivació habitual a València i Llíria. [Transport públic](/transporte-publico-sab).`,
  },
  {
    slug: "colegios-sab",
    title: "Colegios e institutos",
    titleVal: "Col·legis i instituts",
    isHighlighted: true,
    content: `# Educación en San Antonio de Benagéber

## Centros públicos

- **CEIP San Antonio** — infantil y primaria (casco urbano)
- **CEIP Montesano** — infantil y primaria (urbanización Montesano)
- **IES San Antonio de Benagéber** — ESO, Bachillerato y FPB bilingüe (C. San Vicente Ferrer, 1-2). Tel. [961 206 325](tel:961206325)

## Concertado

- **IES Fundación San Vicente Ferrer** (C. Vereda)

Más del **35 %** de la población tiene menos de 16 años; la oferta educativa es un eje central del municipio residencial del Camp de Túria.

Consulta la ficha detallada en [/colegios](/colegios).`,
    contentVal: `# Educació a Sant Antoni de Benaixeve

CEIP Sant Antoni, CEIP Montesano, IES Sant Antoni de Benaixeve (bilingüe) i IES Fundació Sant Vicent Ferrer.`,
  },
  {
    slug: "transporte-publico-sab",
    title: "Transporte público",
    titleVal: "Transport públic",
    isHighlighted: true,
    content: `# Transporte en San Antonio de Benagéber

## Autobús (Metrobus / Edetania Bus)

Operador de referencia: **Edetania Bus** — [961 352 030](tel:961352030) · edetaniabus@edetaniabus.com

Líneas destacadas que pasan o enlazan con SAB:

| Línea | Destino / uso |
|-------|----------------|
| **145 / 146** | Valencia, Centro Comercial El Osito, polígono; frecuencia hasta ~20 min en punta |
| **136 / 136A / 136B** | Universidades de Valencia (UV y UPV) |
| **145N / 135N** | Servicio nocturno hacia/desde Valencia |

Desde **mayo 2025** el Ayuntamiento impulsó la mejora de frecuencias y paradas. Sigue pendiente la **reubicación de la parada bajo el puente de la CV-35** (accesibilidad: 54 escalones), con propuesta cerca del IES.

## Metro (Metrovalencia)

La **Línea 2** (dirección Llíria) no tiene estación en el término de SAB, pero las más cercanas son:

- La Vallesa, Entrepinos, Montesol, **L'Eliana**, Tablón de anuncios

Conexión habitual: autobús + metro para Valencia capital.

## Municipios vecinos

L'Eliana, La Pobla de Vallbona, Bétera y Paterna completan la movilidad diaria de muchos vecinos.`,
    contentVal: `# Transport a Sant Antoni de Benaixeve

Línies 145, 146, 136 cap a València. Metro L2 a l'Eliana i La Vallesa. Edetania Bus: 961 352 030.`,
  },
  {
    slug: "movilidad-sab",
    title: "Movilidad",
    titleVal: "Mobilitat",
    content: `# Movilidad en SAB

- [Transporte público](/transporte-publico-sab)
- Acceso rodado: **CV-35** (autovía) y conexión con Valencia
- Plan de movilidad urbana municipal (consultar ayuntamiento)

Urbanizaciones como **Montesano**, **Colinas**, **Cumbres**, **San Vicente** y **Pla del Pou** tienen perfil residencial con desplazamientos diarios hacia Valencia.`,
    contentVal: `# Mobilitat a SAB

[Transport públic](/transporte-publico-sab). Accés CV-35.`,
  },
  {
    slug: "tramites-sab",
    title: "Trámites en el Ayuntamiento",
    titleVal: "Tràmits a l'Ajuntament",
    isHighlighted: true,
    content: `# Trámites en San Antonio de Benagéber

## Cómo tramitar

1. **Presencial:** Plaza del Ayuntamiento, 1 — cita o turno en OAC (ext. 1)
2. **Sede electrónica:** tramites disponibles en [sanantoniodebenageber.es](https://www.sanantoniodebenageber.es/)
3. **Teléfono:** [961 350 301](tel:961350301) (9:00–14:00)

## Trámites frecuentes

- Empadronamiento y certificados — ver [cómo empadronarse](/como-empadronarse)
- Alta de agua y servicios (ext. 8)
- Licencias de obra (técnicos municipales con cita previa los martes)
- Cultura, fiestas y juventud (ext. 9 / Casa de la Juventud)
- Registro civil y juzgado de paz (ext. 4)

## Datos del municipio

- **CIF:** P4625203G · **INE:** 46903
- **Comarca:** Camp de Túria · **Provincia:** Valencia
- **Fundación como municipio independiente:** 1957 (segregación de L'Eliana)`,
    contentVal: `# Tràmits a Sant Antoni de Benaixeve

OAC ext. 1. Alta d'aigua ext. 8. [Empadronament](/como-empadronarse).`,
  },
  {
    slug: "como-empadronarse",
    title: "Cómo empadronarse",
    titleVal: "Com empadronar-se",
    content: `# Empadronamiento en San Antonio de Benagéber

Acude a la **Oficina de Atención al Ciudadano** (ext. 1) con:

- DNI/NIE/Pasaporte
- Contrato de alquiler, escritura o autorización del titular
- Libro de familia si empadronas menores

**Horario:** lunes a viernes, 9:00–14:00 · Plaza del Ayuntamiento, 1.

El empadronamiento es necesario para escolarización, sanidad y trámites locales.`,
    contentVal: `# Empadronament a SAB

OAC amb DNI i contracte o escriptura. Dill-div 9:00–14:00.`,
  },
  {
    slug: "recogida-basura-horarios",
    title: "Recogida de basura",
    titleVal: "Recollida de brossa",
    content: `# Residuos en San Antonio de Benagéber

Consulta calendario y normas en el Ayuntamiento (ext. 8 — Servicios municipales) o en la web municipal. Para contenedores específicos y puntos limpios, ver [puntos limpios](/puntos-limpios).`,
    contentVal: `# Residus a SAB

Consulta l'ajuntament (ext. 8) o [punts nets](/puntos-limpios).`,
  },
  {
    slug: "puntos-limpios",
    title: "Puntos limpios",
    titleVal: "Punts nets",
    content: `# Puntos limpios y residuos

Información actualizada en el área de **Servicios Municipales** del Ayuntamiento de San Antonio de Benagéber y en la Mancomunidad de Camp de Túria cuando aplique.`,
    contentVal: `# Punts nets

Consulta serveis municipals de l'ajuntament de SAB.`,
  },
  {
    slug: "actividades-ninos",
    title: "Actividades para niños",
    titleVal: "Activitats per a xiquets",
    content: `# Ocio infantil y juvenil en SAB

- **Casa de la Juventud (SABJOVE):** programación gratuita para infancia (10-12) y juventud (12-16)
- **ACDSAB:** multideporte, fútbol, danza, karate, etc. — [acdsab.com](https://www.acdsab.com/)
- Talleres municipales de cultura (castañuelas, inglés, valenciano, teatro)

Consulta el tablón de anuncios del ayuntamiento y [eventos](/eventos-sab).`,
    contentVal: `# Oci infantil a SAB

SABJOVE, ACDSAB i tallers de cultura municipal.`,
  },
  {
    slug: "eventos-sab",
    title: "Eventos y cultura",
    titleVal: "Esdeveniments i cultura",
    content: `# Agenda cultural en San Antonio de Benagéber

## Hitos del año

| Fecha | Evento |
|-------|--------|
| Marzo | Fallas |
| **8 abril** | **Fiesta de la Segregación** (aniversario municipal 1957) |
| Julio | Cine de verano en urbanizaciones (Montesano, San Vicente, Colinas…) |
| 7-16 agosto | Fiestas patronales **San Isidro y San Roque** |
| Septiembre | Fiesta de la Patata |
| 31 octubre | Halloween |
| Diciembre-enero | Navidad (San Silvestre, belén, cabalgata) |

Concejalía de Cultura: ext. 9 · [sanantoniodebenageber.es](https://www.sanantoniodebenageber.es/)`,
    contentVal: `# Agenda cultural a SAB

8 d'abril: Festa de la Segregació. Agost: festes de Sant Isidre i Sant Roc.`,
  },
  {
    slug: "parques-sab",
    title: "Parques y zonas verdes",
    titleVal: "Parcs i zones verdes",
    content: `# Parques en San Antonio de Benagéber

El municipio apuesta por parques y rutas saludables («Vive tus Parques», circuitos, marcha nórdica). Consulta ubicaciones actualizadas en la web municipal y el programa de deportes (La Legua, San Silvestre).`,
    contentVal: `# Parcs a SAB

Consulta l'ajuntament i el programa «Viu els teus Parcs».`,
  },
  {
    slug: "colegio-ceip-san-antonio",
    title: "CEIP San Antonio",
    titleVal: "CEIP Sant Antoni",
    content: `Colegio público de infantil y primaria en el casco de San Antonio de Benagéber.`,
    contentVal: `Col·legi públic d'infantil i primària al nucli de SAB.`,
  },
  {
    slug: "colegio-ceip-montesano",
    title: "CEIP Montesano",
    titleVal: "CEIP Montesano",
    content: `Centro público que da servicio a la urbanización Montesano y entorno.`,
    contentVal: `Centre públic a la urbanització Montesano.`,
  },
  {
    slug: "colegio-ies-san-antonio",
    title: "IES San Antonio de Benagéber",
    titleVal: "IES Sant Antoni de Benaixeve",
    content: `Instituto bilingüe en C. San Vicente Ferrer. Tel. 961 206 325. [Portal educativo GVA](https://portal.edu.gva.es/iessanantoniodebenageber/).`,
    contentVal: `Institut bilingüe al carrer Sant Vicent Ferrer.`,
  },
  {
    slug: "colegio-ies-fundacion-san-vicente",
    title: "IES Fundación San Vicente Ferrer",
    titleVal: "IES Fundació Sant Vicent Ferrer",
    content: `Centro concertado en la zona de la Vereda.`,
    contentVal: `Centre concertat a la Vereda.`,
  },
];
