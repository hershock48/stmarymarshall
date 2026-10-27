import { DOCS, LINKS, SITE } from "@/lib/site";

/**
 * The parish's own words, lifted from stmarymarshall.org on 2026-10-27 with
 * permission, lightly edited for the page they now sit on. Names, phone
 * extensions and email addresses are exactly as the parish published them.
 * Every page reads from here, so a staff change is one edit.
 */

export const WELCOME = {
  heading: "Welcome to St. Mary",
  body: [
    "We gather to remember, to celebrate, and to believe. In the celebration of life, the people of St. Mary Parish respond to the call of Jesus Christ. We are committed to the spiritual and physical welfare of those in our parish and community.",
    "In our daily lives, we will honor God Our Father with loyalty and devotion. Through our Christian love and good works, we shall embrace and support all people.",
  ],
} as const;

export type Person = { role: string; name: string; phone?: string; ext?: string; email?: string; link?: { label: string; href: string } };

export const STAFF: readonly Person[] = [
  {
    role: "Pastor",
    name: "Fr. Craig Lusk",
    phone: SITE.phone,
    email: SITE.email,
    link: { label: "Read “From Music Man to Holy Man”", href: LINKS.frCraigBio },
  },
  { role: "Business Manager, Bulletin Editor, Safe Environment", name: "Stacie Contat", phone: SITE.phone, email: SITE.email },
  { role: "Organist and Director of Music", name: "James Hamilton, Jr.", phone: SITE.phone, ext: "104", email: "stmarymarshallmusic@gmail.com" },
  { role: "Director of Religious Education", name: "Sara Rodgers", phone: "(269) 781-5656", email: "stmaryschoolofreligion@gmail.com" },
  {
    role: "Adult Faith Formation and OCIA Coordinator, Lead Sacristan, Wedding Coordinator",
    name: "Carol DiBiaggio",
    phone: "(269) 967-2919",
    email: "trinitas@att.net",
  },
  { role: "Director of Parish Facilities", name: "Gary Zink", phone: SITE.phone },
  // Deacon Mike is named on the old site only under the Shut-In Ministry, not
  // on the staff list, so he is not listed here. Ask the office for his full
  // name and whether he belongs on this page.
];

export const HISTORY: readonly string[] = [
  "Catholics of the Marshall area were served out of Northville as far back as 1837. Priests came on horseback to the mission here, among them Fathers Morrissey, Cullen and Hennessy. Father James Hennessy became the first resident pastor in 1852, and the first church was dedicated in 1853.",
  "Records were first kept under the second pastor, Father P. C. Koopmans. The first baptism recorded was Mary Hamilton on May 27, 1855. On May 31, 1855, James Wall and Bridget Farell were the first couple whose marriage was recorded here. Under Father Koopmans the first school opened in 1856, the Sisters of the Immaculate Heart of Mary came to teach in 1864, and the cemetery land was purchased in 1866.",
  "Father Peter A. Baart came in 1882. He opened a new school in 1883, reorganized the Altar Society, and built the present church, dedicated on October 27, 1889. Baart Hall opened in 1900. Father Baart died in 1908 and is buried in the cemetery chapel, as is Father George Clarson, pastor from 1919 to 1932.",
  "When the parish was founded and when the present church was built, Marshall was part of the Archdiocese of Detroit, and one of the front windows was donated by Bishop Gallagher of Detroit. In 1937 Lansing became a diocese and Marshall went with it. In 1948, under Father Patrick McGuinnes, the church was renovated and the Rosary Altar Society bought a new marble altar for $4,000. A piece of that altar now stands under the tabernacle.",
  "During the pastorate of Father Julius Hengesbach, 1966 to 1974, the church changed again with the liturgical reforms of the Second Vatican Council. In 1971 the Diocese of Kalamazoo was formed under Bishop Paul Donovan, and the parish became part of it. Bishop Alfred Markiewicz was installed as the second bishop on January 31, 1995, followed by Bishop James Murray in 1998, Bishop Paul Bradley in 2009, and Bishop Edward M. Lohse, installed on July 25, 2023.",
  "Under Father Donald Wieber, 1974 to 1981, the present Parish Center replaced Baart Hall. The church was renovated and rededicated on August 13, 1988, and again on October 13, 2021.",
  "Parish history tends to follow the pastors and their buildings. Not forgotten are the people who have come here to be baptized, educated, married and buried.",
];

export const CEMETERY = {
  name: "St. Mary Cemetery",
  address: "18245 Centennial Road, Marshall, MI 49068",
  mapUrl: "https://www.google.com/maps/dir/?api=1&destination=18245+Centennial+Rd%2C+Marshall%2C+MI+49068",
  body: [
    "St. Mary Cemetery dates to 1866, when Fr. Koopmans purchased 16 acres on the east side of town for $800. Fr. Baart wrote that Fr. Koopmans “spent considerably more in the surveying and arranging of it,” and called it “a choice spot for a cemetery” and “one of the finest in the diocese.”",
    "Today the cemetery continues to be a blessed place where the bodies of the faithful departed await the day of Resurrection. Regulations let families express their love and loss while preserving the grounds for every visitor.",
    "St. Mary Cemetery assumes no responsibility for the protection or maintenance of decorations, grave markers or flower urns. Unsightly or prohibited decorations are removed during normal grounds maintenance, for the safety of the cemetery staff.",
  ],
  docs: [
    { label: "Cemetery map", href: DOCS.cemeteryMap },
    { label: "Cemetery regulations", href: DOCS.cemeteryRegulations },
    { label: "Cemetery fees", href: DOCS.cemeteryFees },
  ],
  plots: `To purchase a plot or ask a question, call the office at ${SITE.phone}.`,
} as const;

export type Sacrament = { slug: string; name: string; body: string[]; contact?: string };

export const SACRAMENTS: readonly Sacrament[] = [
  {
    slug: "baptism",
    name: "Baptism",
    body: [
      "A baptism preparation class is required. Call the office to make an appointment with the deacon or priest. No date can be set before that meeting.",
    ],
    contact: SITE.phone,
  },
  {
    slug: "first-communion-confirmation",
    name: "First Communion and Confirmation",
    body: ["Children prepare through the parish Religious Education program. Contact the Religious Education office for class schedules."],
    contact: "(269) 781-5656",
  },
  {
    slug: "matrimony",
    name: "Matrimony",
    body: [
      "Consult the priest eight months in advance of the desired date. No dates are reserved until the couple has met with the priest or deacon and met the requirements for marriage.",
      "Appointments are scheduled during the week, not on weekends. You must be a registered parishioner for at least one year.",
    ],
    contact: SITE.phone,
  },
  {
    slug: "anointing",
    name: "Anointing of the Sick",
    body: [
      "Call the office, or the rectory for emergencies at any time. Please let the parish priest know of anyone who is in the hospital or unable to leave home.",
    ],
    contact: SITE.phone,
  },
  {
    slug: "penance",
    name: "Penance",
    body: ["Confessions are heard Saturdays from 3:30 to 4:30 PM unless the bulletin says otherwise, and by appointment."],
    contact: SITE.phone,
  },
];

export type Section = { slug: string; title: string; body: string[]; links?: { label: string; href: string; external?: boolean }[]; contact?: string };

export const FORMATION: readonly Section[] = [
  {
    slug: "youth",
    title: "Youth Religious Education",
    body: [
      "The St. Mary Religious Education program for students age 4 through 8th grade begins each September. All registered parishioners are invited to enroll their children. Students follow a diocesan-approved curriculum to learn the Catholic faith at their age level, supporting the work parents do at home to foster a love of God and a rich knowledge of the faith.",
      "For 2026 to 2027: classes for age 4 through 5th grade meet Sunday mornings from 10:00 to 10:50, beginning September 27 with a Family Catechesis event. Classes for grades 6 through 8 meet Tuesdays from 4:00 to 5:00 PM, beginning September 29.",
      "Family Catechesis events take place on scheduled Sundays through the year for children and their parents, in place of the regular Sunday classes. All are invited.",
      "Order of Christian Initiation for Children: if you have a child age 7 or older who has not been baptized, or was baptized in another Christian tradition, and would like to be received into the Catholic Church, OCIC classes are offered on scheduled Sunday mornings through the year. Contact Sara Rodgers.",
    ],
    // The 2026 to 27 Google registration form was closed when checked on
    // 2026-10-27 ("no longer accepting responses"), so it is not linked;
    // late registrations go through Sara Rodgers, named in the contact line.
    links: [
      { label: "Sunday class calendar", href: DOCS.reSundayCalendar },
      { label: "Tuesday class calendar", href: DOCS.reTuesdayCalendar },
    ],
    contact: "To register, or with questions: Sara Rodgers, stmaryschoolofreligion@gmail.com or (269) 781-5656",
  },
  {
    slug: "ocia",
    title: "Adult Faith Formation and OCIA",
    body: [
      "Want to learn more about the Catholic faith? Adult Faith Formation and OCIA classes meet Thursdays from 6:30 to 8:00 PM in the Parish Hall, beginning September 17, 2026. Guest speakers, video clips and discussion lead an exploration of the faith.",
      "OCIA, the Order of Christian Initiation of Adults, is the Church’s process for those entering the Catholic Church. It used to be called RCIA, the Rite of Christian Initiation of Adults, and many people still know it by that name. Classes are open to all adults, 18 and older: current Catholics who want to go deeper, people exploring the faith for the first time, and those who wish to become Catholic.",
    ],
    contact: "Carol DiBiaggio, OCIA Coordinator, (269) 967-2919 or trinitas@att.net",
  },
  {
    slug: "bible-study",
    title: "Tuesday Night Bible Study",
    body: ["Meets Tuesday nights at 7:00 PM in the St. James Room of the school building to discuss the upcoming Sunday Gospel."],
    contact: "Karen Bess, karen.bess60@gmail.com",
  },
  {
    slug: "mens-bible-study",
    title: "Men’s Bible Study",
    body: ["Meets Saturday mornings at 7:00 AM in the St. James Room to pray and discuss the Gospel readings."],
    contact: "Ted Merkel, tedmerkel@gmail.com",
  },
  {
    slug: "life-teen",
    title: "Life Teen",
    body: ["Life Teen is a Catholic youth ministry resource for teens and their families."],
    links: [{ label: "Visit lifeteen.com", href: LINKS.lifeTeen, external: true }],
  },
  {
    slug: "catholic-schools",
    title: "Catholic Schools",
    body: ["Catholic school options within the Diocese of Kalamazoo."],
    links: [
      { label: "Diocesan Catholic Schools", href: LINKS.diocesanSchools, external: true },
      { label: "Battle Creek Area Catholic Schools", href: LINKS.battleCreekSchools, external: true },
    ],
  },
];

export const MINISTRIES: readonly Section[] = [
  {
    slug: "music",
    title: "Music Ministry",
    body: [
      "James Hamilton serves as Organist and Music Director. He began as a weekly organist at St. Mary Catholic Church in Charlotte, Michigan at age 15, and has served as an organist for more than 26 years, including 11 as a choir director.",
      "New adult choir members and cantors are welcome, whether you have years of experience or simply enjoy singing. Cantors get individual practice sessions, training and support as they learn the role.",
      "The Adult Choir rehearses Wednesdays from 6:45 to 8:15 PM in the St. Cecilia Music Room and sings at Sunday Mass from mid September. The Children’s Choir, grades 3 through 8, rehearses Wednesdays at 4:30 PM in the St. Cecilia Music Room and sings at the 9:00 AM Mass from October.",
      // The old site's music letter said 4:00 PM; the parish calendar feed,
      // updated more recently, has the youth choir at 4:30 to 5:15. The
      // calendar wins here. README: confirm with the music director.
      "Virtus-trained adult volunteers are needed to support the young singers at rehearsals and at Mass, about one Mass a month during the season.",
    ],
    links: [{ label: "Register a child for the Children’s Choir", href: LINKS.childrensChoirRegistration, external: true }],
    contact: "stmarymarshallmusic@gmail.com or (269) 781-3949 ext. 104",
  },
  {
    slug: "knights",
    title: "Knights of Columbus, Council 5999",
    body: [
      "Regular meetings are the second Monday of the month at 7:00 PM. The Knights serve a breakfast buffet with omelets to order each month, run the Friday fish fry during Lent, host the Christmas Day dinner, award college scholarships, and give charitable service to the parish and the community.",
      "The We Care Fund assists families at St. Mary. The Knights administer it and the people of St. Mary fund it. If you need help, or know a registered parish family that does, contact Gus Groat.",
    ],
    contact: "Grand Knight Jeremy Weitting, weittingj@gmail.com. We Care Fund: Gus Groat, (269) 830-7744",
  },
  {
    slug: "women",
    title: "Women’s Ministry",
    body: [
      "Encouraging, celebrating and supporting authentic Catholic living through fellowship and service to the Church and the parish community. Meets the fourth Monday of the month at 6:30 PM in the Parish Hall.",
    ],
    contact: "Lynn Gruber, gruberl1113@gmail.com, or Theresa Ruedisueli, theresaruedisueli@hotmail.com",
  },
  {
    slug: "councils",
    title: "Parish and Finance Councils",
    body: [
      "Advisory councils to the pastor.",
      "Finance Council president: Steve Hageman. Parish Council: Tom Gruber, president; Tyler Stuut, vice president; Lynn Gruber, secretary; Carol DiBiaggio, Brad and Brenda Moorehead, Jim Oliver, Tracy Nofs, Tim Fitzgerald and Jeremy Weitting.",
    ],
    contact: "Steve Hageman, steven.hageman@att.net",
  },
  {
    slug: "st-theresa-guild",
    title: "St. Theresa Guild",
    body: ["Pro-life awareness and promotion, and the sale of religious articles and gifts before First Holy Communion and Confirmation."],
    contact: "Chair: Fran Weberling",
  },
  {
    slug: "st-joseph-guild",
    title: "St. Joseph Guild",
    body: [
      "Supports youth faith formation in the parish, and keeps young people connected to their faith through the college years with prayers, college and military care packages, prayer books and graduate recognition. The guild organizes the First Holy Communion reception and donates personal care and baby care products to The Fountain Clinic and Oaklawn Hospital.",
    ],
    contact: "Mary Crosby, crosbyma@att.net",
  },
  {
    slug: "welcoming",
    title: "Welcoming Ministry",
    body: [
      "Registration: new parishioners are encouraged to register online. Newly registered members are contacted by the parish and sent a welcome packet.",
      "Coffee hour: after most Sunday 9:00 AM Masses during the school year, parishioners and guests are welcome in the Parish Hall for coffee, muffins and other treats. Check the bulletin each week for the schedule.",
      "Ushers greet and seat people as they arrive for Mass and serve during it. Call the office to be trained as an usher.",
      "Funeral lunches are provided after funerals for parishioners, family and friends.",
    ],
    contact: SITE.phone,
  },
  {
    slug: "shut-in",
    title: "Shut-In Ministry",
    body: ["If a family member or friend is in the hospital or at home and unable to attend Mass, or would like a visit or Communion, contact Deacon Mike."],
    contact: `Deacon Mike, ${SITE.phone}`,
  },
  { slug: "garden", title: "Garden Ministry", body: ["Cares for the many gardens around St. Mary Church."], contact: "Karen Mestemaker, mesty59214@aol.com" },
  {
    slug: "cleaning",
    title: "Church Cleaning Ministry",
    body: ["Teams rotate monthly to do the weekly cleaning in the church, and lend a hand at the busy times of the liturgical year."],
    contact: "Susie Twiss, dave.susie.twiss@gmail.com",
  },
  {
    slug: "library",
    title: "Parish Library",
    body: ["Books, audio and movies can be checked out for a limited time by registered St. Mary parishioners."],
    contact: "Barb Goedde, begoedde@gmail.com",
  },
  {
    slug: "meal-train",
    title: "Meal Train Ministry",
    body: [
      "Schedules meals for St. Mary families after life events such as surgery or a birth. The team is looking for more members to spot needs in the parish and to organize and manage meal trains.",
    ],
    contact: "Katie Kellogg, (269) 832-8921",
  },
];

export const GIVE = {
  intro:
    "Donations to St. Mary Parish can be made online from a computer or phone, one time or on a schedule: weekly, every two weeks, monthly or twice a month.",
  funds: [
    "For the Church: Sunday and Holy Day offerings, Building on His Cornerstone for parish improvements, and altar flowers.",
    "Religious Education: class fees and youth ministry.",
    "Other collections, specified when needed.",
  ],
  weCare: {
    title: "We Care Fund",
    body: "The We Care Fund assists families at St. Mary. The Knights of Columbus administer it and the people of St. Mary fund it. If you need help, or know of a family in need, contact Gus Groat.",
    // The old site printed two numbers for Gus: this one on the Donate page
    // and (269) 830-7744 under the Knights. Both are kept where they were.
    // README: ask the office which is current.
    contact: "Gus Groat, (269) 781-0008",
  },
  endowment: {
    title: "St. Mary Parish Endowment Fund",
    body: "A permanent fund held at the Catholic Foundation of Southwestern Michigan. Gifts to the endowment support the parish for generations.",
  },
} as const;
