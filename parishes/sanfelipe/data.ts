import type { Parish } from "@/lib/types";

/**
 * Parroquia San Felipe de Jesús, Fennville. Every fact on the site, once,
 * in Spanish, because the parish speaks Spanish: its old site, its Masses
 * and its bulletin all do.
 *
 * Read off sanfelipe-fennville.org and its calendar feed on 2026-11-01 for
 * the diocesan pilot demo. The parish has not been asked yet; the demo sits
 * on a noindex pitch host. A line the office has not confirmed is left out
 * rather than guessed.
 */
const P = "/parishes/sanfelipe";
const phone = "(269) 561-5029";

const parish: Parish = {
  slug: "sanfelipe",
  hosts: ["sanfelipe-fennville.org", "www.sanfelipe-fennville.org"],
  pitchHost: "sanfelipe.glazedweb.com",
  live: false,
  lang: "es",

  name: "Parroquia San Felipe de Jesús",
  shortName: "San Felipe",
  parishName: "Parroquia San Felipe de Jesús",
  // The parish's own motto, from the top of its old site.
  tagline: "Unidos en la fe y la esperanza, marchamos hacia el Reino de Dios",
  diocese: { name: "Diócesis de Kalamazoo", url: "https://www.diokzoo.org/" },
  timeZone: "America/Detroit",
  mark: { type: "ring", letters: "SF" },
  // Clay, marigold and talavera blue: a deep terracotta ground, marigold
  // for the accent, the blue for links on paper. Ratios in
  // tools/palette-check.mjs.
  theme: {
    navy: "#26130f",
    navySoft: "#38201a",
    navyLine: "#58352c",
    marian: "#1f4e86",
    gold: "#e5a53a",
    goldLight: "#f0bf66",
    goldDeep: "#7a4f0e",
    cream: "#f8f0e2",
    dim: "#dcc8b4",
    paper: "#f8f1e4",
    paperDim: "#ecdfcb",
    ink: "#26180f",
    inkSoft: "#5e4836",
  },

  phone,
  phoneHref: "tel:+12695615029",
  church: { street: "5586 117th Ave", city: "Fennville", state: "MI", zip: "49408" },
  office: { street: "PO Box 588", city: "Fennville", state: "MI", zip: "49408" },
  mapUrl: "https://www.google.com/maps/dir/?api=1&destination=5586+117th+Ave%2C+Fennville%2C+MI+49408",
  facebook: "https://www.facebook.com/parroquia.s.dejesus",
  livestream: "https://www.facebook.com/parroquia.s.dejesus",
  geo: { lat: 42.594105, lng: -86.104596 },
  finderId: "massTimes_19696",
  findAMass: "https://findamass.org/",

  photos: {
    hero: { src: `${P}/img/procesion.jpg`, width: 1279, height: 640, alt: "El obispo y los sacerdotes en la procesión de entrada de una Misa en San Felipe de Jesús." },
    about: { src: `${P}/img/catequesis.jpg`, width: 1280, height: 640, alt: "Jóvenes y adultos de la parroquia en clase de catequesis." },
    extra: [
      { src: `${P}/img/voleibol.jpg`, width: 1170, height: 1040, alt: "El equipo de San Felipe, campeones del torneo interparroquial de vóleibol 2026, con su trofeo." },
      { src: `${P}/img/san-felipe.jpg`, width: 450, height: 450, alt: "Imagen de San Felipe de Jesús, mártir, con los brazos abiertos." },
    ],
  },

  masses: [
    { day: 0, start: "12:30", lang: "Español" },
    { day: 4, start: "18:30", lang: "Español" },
  ],
  confession: [{ day: 4, start: "17:00" }],
  adoration: [{ day: 4, start: "17:00" }],
  confessionNote: "También con cita previa.",
  adorationNote: "Adoración al Santísimo también el tercer domingo de cada mes, de 6:00 a 8:00 PM.",
  specialMasses: [],
  holyDays: [
    { date: "2026-12-08", label: "Inmaculada Concepción", masses: null },
    { date: "2026-12-25", label: "Navidad", masses: null, note: "Las Misas de Nochebuena se anuncian en el boletín." },
    { date: "2027-01-01", label: "Santa María, Madre de Dios", masses: null },
    { date: "2027-08-15", label: "Asunción de María", masses: null, note: "En 2027 cae en domingo." },
    { date: "2027-11-01", label: "Todos los Santos", masses: null, note: "En 2027 cae en lunes, así que no es de precepto." },
  ],

  /** From sanfelipe-fennville.org/icalendar1.ics on 2026-11-01, Masses excluded. */
  events: [
    { title: "El Santo Rosario", kind: "worship", rule: { kind: "weekly", day: 4, start: "18:00", end: "19:00" } },
    { title: "Adoración al Santísimo", kind: "worship", rule: { kind: "monthly", day: 0, nth: 3, start: "18:00", end: "20:00" } },
  ],

  welcome: {
    heading: "Bienvenidos a San Felipe de Jesús",
    body: [
      "Unidos en la fe y la esperanza, marchamos hacia el Reino de Dios.",
      "San Felipe de Jesús es la parroquia católica de habla hispana de Fennville, en el oeste de Michigan. La Misa se celebra en español el domingo a las 12:30 PM y el jueves a las 6:30 PM, con el Santo Rosario y las confesiones antes de la Misa del jueves. Si eres nuevo en la zona, o vuelves después de un tiempo, aquí tienes tu casa.",
    ],
  },
  newHere: [
    { q: "¿La Misa se transmite en vivo?", a: "Sí. La Misa del domingo a las 12:30 PM se transmite en la página de Facebook de la parroquia." },
    { q: "¿Hay catequesis para los niños?", a: "Sí. La parroquia prepara a los niños para la Primera Comunión y a los jóvenes para la Confirmación. Las hojas de inscripción están en la página de formación en la fe." },
  ],

  staff: [
    { role: "Párroco", name: "Padre Evelio Ramírez", phone: "(269) 857-7951", email: "Fr.Ramirez@stpeter-douglas.org" },
    { role: "Coordinador parroquial", name: "Joseph Marble", phone, email: "joe.marble@stpeter-douglas.org" },
    { role: "Asociada pastoral", name: "Hermana Leidy Zuñiga, MSDE", phone: "(269) 539-8506", email: "sisterusa88@gmail.com" },
    { role: "Diácono permanente", name: "José Alfaro" },
  ],

  sacraments: [
    { slug: "bautismo", title: "Bautismo", body: ["Para los católicos, el Bautismo es el primer paso de un camino de compromiso y discipulado para toda la vida. Ya sea de niños o de adultos, el Bautismo es la manera en que la Iglesia celebra y hace presente el abrazo de Dios. Para bautizar a un hijo, llama a la oficina parroquial; hay una clase de preparación para los padres y los padrinos."], contact: `Llama al ${phone}` },
    { slug: "reconciliacion", title: "Reconciliación", body: ["El sacramento de la Reconciliación, también llamado Penitencia o Confesión, tiene tres elementos: la conversión, la confesión y la celebración. En él encontramos el perdón incondicional de Dios y entendemos mejor nuestra llamada a perdonar a los demás.", "Las confesiones son el jueves a las 5:00 PM, antes de la Misa, y con cita previa."], links: [{ label: "Horarios de confesión", href: "/mass-times#confession" }] },
    { slug: "eucaristia", title: "Eucaristía", body: ["Los católicos creemos que la Eucaristía, o Comunión, es a la vez sacrificio y banquete. Creemos en la presencia real de Jesús, que murió por nuestros pecados. Al recibir el Cuerpo y la Sangre de Cristo nos alimentamos espiritualmente y nos acercamos a Dios.", "Los niños se preparan para la Primera Comunión en la catequesis de la parroquia."], links: [{ label: "La catequesis para los sacramentos", href: "/faith-formation" }] },
    { slug: "confirmacion", title: "Confirmación", body: ["La Confirmación es el sacramento del compromiso cristiano maduro y de la profundización de los dones bautismales. Es uno de los tres sacramentos de iniciación y se asocia con los dones del Espíritu Santo. Los jóvenes se preparan en la catequesis de la parroquia."], links: [{ label: "Inscripción para la Confirmación", href: `${P}/docs/inscripcion-confirmacion.pdf` }] },
    { slug: "matrimonio", title: "Matrimonio", body: ["Para los católicos, el sacramento del Matrimonio es un signo público de que uno se entrega por completo a la otra persona. También es una declaración pública sobre Dios: la unión amorosa del esposo y la esposa habla de los valores de la familia y de los valores de Dios. Para casarte en la parroquia, habla con el párroco con varios meses de anticipación."], contact: `Llama al ${phone}` },
    { slug: "orden-sacerdotal", title: "Orden sacerdotal", body: ["En el sacramento del Orden, el sacerdote que se ordena promete guiar a los demás católicos llevándoles los sacramentos, sobre todo la Eucaristía, proclamando el Evangelio y ofreciendo otros medios de santidad. Los diáconos también se ordenan y reciben el Orden sagrado."] },
    { slug: "uncion", title: "Unción de los enfermos", body: ["La Unción de los enfermos, antes conocida como extremaunción, es un rito de sanación no solo para la enfermedad física sino también para la mental y la espiritual. Si alguien de tu familia está enfermo, en el hospital o en casa sin poder salir, llama a la oficina para que un sacerdote lo visite."], contact: `Llama al ${phone}` },
  ],

  formation: [
    {
      slug: "catequesis",
      title: "La catequesis para los sacramentos",
      body: ["La parroquia prepara a los niños para la Primera Comunión y a los jóvenes para la Confirmación. Las hojas de inscripción están aquí; entrégalas en la oficina o después de la Misa."],
      links: [
        { label: "Hoja 1 para la Primera Comunión", href: `${P}/docs/primera-comunion-1.pdf` },
        { label: "Hoja 2 para la Primera Comunión", href: `${P}/docs/primera-comunion-2.pdf` },
        { label: "Inscripción para la Confirmación", href: `${P}/docs/inscripcion-confirmacion.pdf` },
      ],
      contact: `Hermana Leidy Zuñiga, (269) 539-8506, o la oficina, ${phone}`,
    },
    { slug: "experiencia", title: "La Experiencia del Domingo", body: ["Un recurso de la Diócesis de Kalamazoo para vivir mejor la Misa dominical."], links: [{ label: "La Experiencia del Domingo, en diokzoo.org", href: "https://www.diokzoo.org/experiencia", external: true }] },
    { slug: "lecturas", title: "Las lecturas del día", body: ["Las lecturas de la Misa de cada día, en español, de la Conferencia de Obispos Católicos de Estados Unidos."], links: [{ label: "Lecturas del día", href: "https://bible.usccb.org/es/lecturas-del-dia", external: true }] },
  ],

  ministries: [],

  pages: [
    {
      slug: "oraciones",
      title: "Oraciones",
      lede: "Las oraciones de siempre, para rezarlas en casa.",
      sections: [
        { slug: "senal-de-la-cruz", title: "La señal de la cruz", body: ["En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén."] },
        { slug: "padre-nuestro", title: "Padre nuestro", body: ["Padre nuestro, que estás en el cielo, santificado sea tu Nombre; venga a nosotros tu reino; hágase tu voluntad en la tierra como en el cielo. Danos hoy nuestro pan de cada día; perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación, y líbranos del mal. Amén."] },
        { slug: "ave-maria", title: "Ave María", body: ["Dios te salve, María, llena eres de gracia; el Señor es contigo. Bendita tú eres entre todas las mujeres, y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén."] },
        { slug: "gloria", title: "Gloria", body: ["Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén."] },
        { slug: "espiritu-santo", title: "Oración al Espíritu Santo", body: ["Ven, Espíritu Santo, llena los corazones de tus fieles y enciende en ellos el fuego de tu amor. Envía tu Espíritu y todo será creado, y renovarás la faz de la tierra. Amén."] },
      ],
    },
  ],

  give: {
    intro: "Las ofrendas se reciben en la Misa y en la oficina parroquial.",
  },

  docs: [],
  nav: [{ href: "/oraciones", label: "Oraciones" }],
  credit: "Hecho por",
};

export default parish;
