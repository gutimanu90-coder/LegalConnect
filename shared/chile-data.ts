export const REGIONES = [
  { id: "RM", nombre: "Región Metropolitana de Santiago" },
  { id: "V", nombre: "Región de Valparaíso" },
  { id: "VIII", nombre: "Región del Biobío" },
  { id: "IX", nombre: "Región de La Araucanía" },
  { id: "X", nombre: "Región de Los Lagos" },
  { id: "VII", nombre: "Región del Maule" },
  { id: "VI", nombre: "Región del Libertador B. O'Higgins" },
  { id: "II", nombre: "Región de Antofagasta" },
  { id: "I", nombre: "Región de Tarapacá" },
  { id: "IV", nombre: "Región de Coquimbo" },
  { id: "III", nombre: "Región de Atacama" },
  { id: "XIV", nombre: "Región de Los Ríos" },
  { id: "XVI", nombre: "Región de Ñuble" },
  { id: "XII", nombre: "Región de Magallanes" },
  { id: "XI", nombre: "Región de Aysén" },
  { id: "XV", nombre: "Región de Arica y Parinacota" },
] as const;

export const COMUNAS_POR_REGION: Record<string, string[]> = {
  RM: [
    "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central",
    "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja",
    "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo",
    "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Padre Hurtado", "Peñaflor",
    "Peñalolén", "Pedro Aguirre Cerda", "Providencia", "Pudahuel",
    "Puente Alto", "Quilicura", "Quinta Normal", "Recoleta", "Renca",
    "San Bernardo", "San Joaquín", "San Miguel", "San Ramón", "Santiago",
    "Talagante", "Vitacura",
  ],
  V: [
    "Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "Con-Con",
    "Casablanca", "Los Andes", "San Felipe", "Quillota", "La Calera",
    "Limache", "Olmué", "Putaendo", "San Esteban",
  ],
  VIII: [
    "Concepción", "Talcahuano", "Hualpén", "San Pedro de la Paz",
    "Chiguayante", "Coronel", "Lota", "Tomé", "Penco", "Chillán",
    "Los Ángeles", "Lebu", "Cañete",
  ],
  IX: [
    "Temuco", "Padre Las Casas", "Villarrica", "Pucón", "Angol",
    "Victoria", "Lautaro", "Nueva Imperial",
  ],
  X: [
    "Puerto Montt", "Osorno", "Castro", "Puerto Varas", "Ancud",
    "Calbuco", "Los Muermos",
  ],
  VII: [
    "Talca", "Curicó", "Linares", "Cauquenes", "Constitución",
    "Molina", "San Clemente",
  ],
  VI: [
    "Rancagua", "San Fernando", "Pichilemu", "Rengo", "Machalí",
    "Graneros", "Cotahuasi",
  ],
  II: ["Antofagasta", "Calama", "Tocopilla", "Mejillones"],
  I: ["Iquique", "Alto Hospicio", "Pozo Almonte"],
  IV: ["La Serena", "Coquimbo", "Ovalle", "Illapel", "Andacollo"],
  III: ["Copiapó", "Caldera", "Vallenar", "Chañaral"],
  XIV: ["Valdivia", "La Unión", "Río Bueno", "Panguipulli"],
  XVI: ["Chillán", "San Carlos", "Yungay", "Bulnes"],
  XII: ["Punta Arenas", "Puerto Natales", "Porvenir"],
  XI: ["Coyhaique", "Aysén", "Chile Chico"],
  XV: ["Arica", "Putre", "General Lagos"],
};

export const ESPECIALIDADES = [
  { id: "medicina-general", nombre: "Medicina General", icono: "stethoscope" },
  { id: "traumatologia", nombre: "Traumatología y Ortopedia", icono: "bone" },
  { id: "pediatria", nombre: "Pediatría", icono: "baby" },
  { id: "ginecologia", nombre: "Ginecología y Obstetricia", icono: "heart-pulse" },
  { id: "cardiologia", nombre: "Cardiología", icono: "heart" },
  { id: "dermatologia", nombre: "Dermatología", icono: "sparkles" },
  { id: "neurologia", nombre: "Neurología", icono: "brain" },
  { id: "oftalmologia", nombre: "Oftalmología", icono: "eye" },
  { id: "otorrino", nombre: "Otorrinolaringología", icono: "ear" },
  { id: "urologia", nombre: "Urología", icono: "activity" },
  { id: "psiquiatria", nombre: "Psiquiatría", icono: "brain" },
  { id: "endocrinologia", nombre: "Endocrinología", icono: "activity" },
  { id: "gastroenterologia", nombre: "Gastroenterología", icono: "activity" },
  { id: "neumologia", nombre: "Neumología", icono: "wind" },
  { id: "reumatologia", nombre: "Reumatología", icono: "activity" },
  { id: "oncologia", nombre: "Oncología", icono: "activity" },
  { id: "cirugia-general", nombre: "Cirugía General", icono: "scissors" },
  { id: "fisiatria", nombre: "Fisiatría y Rehabilitación", icono: "activity" },
  { id: "nutricion", nombre: "Nutrición y Dietética", icono: "apple" },
  { id: "psicologia", nombre: "Psicología", icono: "brain" },
] as const;

export const PREVISIONES = [
  "Particular",
  "Fonasa A",
  "Fonasa B",
  "Fonasa C",
  "Fonasa D",
  "Banmédica",
  "Colmena",
  "Cruz Blanca",
  "Consalud",
  "New Capital Salud",
  "Vida Tres",
  "MasVida",
];

export type Region = (typeof REGIONES)[number];
export type Especialidad = (typeof ESPECIALIDADES)[number];
