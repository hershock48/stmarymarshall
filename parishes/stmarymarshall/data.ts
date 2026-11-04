import type { Parish } from "@/lib/types";

/**
 * St. Mary Catholic Church, Marshall. Every fact on the site, once.
 *
 * Read off stmarymarshall.org on 2026-10-27 with the parish's permission to
 * reuse its photos and words (Kevin, 2026-10-27). Where the old site
 * contradicted itself the README says which value won. A line the office
 * has not confirmed is left out rather than guessed.
 */
const P = "/parishes/stmarymarshall";
const phone = "(269) 781-3949";
const email = "stmarymarshall@aol.com";

const parish: Parish = {
  slug: "stmarymarshall",
  hosts: ["stmarymarshall.org", "www.stmarymarshall.org", "stmarymarshall.vercel.app"],
  pitchHost: "stmarymarshall.glazedweb.com",
  live: false,
  lang: "en",

  name: "St. Mary Catholic Church",
  shortName: "St. Mary",
  parishName: "St. Mary Parish",
  tagline: "A Catholic parish in Marshall, Michigan, since 1852",
  founded: 1852,
  diocese: { slug: "kalamazoo", name: "Diocese of Kalamazoo", url: "https://www.diokzoo.org/" },
  timeZone: "America/Detroit",
  // The ring-and-M from the parish's own favicon (components/Mark.tsx).
  mark: { type: "ring", letters: "M" },

  phone,
  phoneHref: "tel:+12697813949",
  email,
  // The church and the office are two addresses: the church at Eagle and
  // Green, the office and all mail on Hanover. The old site's directions
  // link used 214 S. Eagle St. for the church door.
  church: { street: "214 S. Eagle St.", corner: "corner of Eagle and Green Streets", city: "Marshall", state: "MI", zip: "49068" },
  office: { street: "212 W. Hanover St.", city: "Marshall", state: "MI", zip: "49068" },
  geo: { lat: 42.2709048, lng: -84.9615026 },
  mapUrl: "https://www.google.com/maps/dir/?api=1&destination=214+S.+Eagle+Street%2C+Marshall%2C+MI+49068",
  facebook: "https://www.facebook.com/St-Mary-Marshall-101547054894575",
  bulletins: "https://discovermass.com/church/st-mary-marshall-mi/",
  finderId: "massTimes_6225",
  findAMass: "https://findamass.org/",

  photos: {
    hero: { src: `${P}/img/nave-easter.jpg`, width: 1340, height: 810, alt: "The nave of St. Mary Church during Mass, the congregation standing as the procession enters." },
    chapel: { src: `${P}/img/chapel-altar.jpg`, width: 1920, height: 810, alt: "The altar of St. Mary Chapel, with candles, lilies and the tabernacle." },
    about: { src: `${P}/img/chapel-renovation.jpg`, width: 1742, height: 810, alt: "St. Mary Chapel: oak pews, stained glass windows and the crucifix above the small altar." },
    give: { src: `${P}/img/adoration.jpg`, width: 1440, height: 810, alt: "The monstrance on the altar during Eucharistic Adoration." },
    extra: [
      { src: `${P}/img/monstrance.jpg`, width: 1636, height: 810, alt: "The monstrance on the altar of St. Mary Church during Eucharistic Adoration." },
      { src: `${P}/img/cemetery.jpg`, width: 650, height: 645, alt: "St. Mary Cemetery: the grounds under tall trees, the brick cemetery chapel, and a statue of Christ with arms raised." },
    ],
  },

  masses: [
    { day: 6, start: "17:00", label: "Saturday Vigil" },
    { day: 0, start: "09:00", label: "Sunday" },
    { day: 0, start: "11:00", label: "Sunday" },
    { day: 2, start: "16:00", label: "Tuesday" },
    { day: 3, start: "12:00", label: "Wednesday" },
    { day: 5, start: "07:30", label: "Friday" },
  ],
  confession: [{ day: 6, start: "15:30", end: "16:30", label: "Saturday" }],
  adoration: [{ day: 6, start: "15:30", end: "16:30", label: "Saturday" }],
  // Holy Saturday is skipped every year in the parish feed, back to 2016.
  confessionNote: "Also by appointment. No confessions on Holy Saturday.",
  adorationNote: "Eucharistic Adoration during the Saturday confession hour.",
  specialMasses: [
    { date: "2026-11-02", start: "19:00", label: "All Souls’ Day Mass" },
    { date: "2026-11-26", start: "09:00", label: "Thanksgiving Mass" },
  ],
  /**
   * Holy Days of Obligation as the dioceses of Michigan keep them: the
   * Ascension moves to Sunday. Mass times are null until the office gives
   * them; the page prints the date and says the time is in the bulletin.
   */
  holyDays: [
    { date: "2026-12-08", label: "Immaculate Conception", masses: null },
    { date: "2026-12-25", label: "Christmas Day", masses: null, note: "Christmas Eve Masses are announced in the bulletin." },
    { date: "2027-01-01", label: "Mary, Mother of God", masses: null },
    { date: "2027-08-15", label: "Assumption of Mary", masses: null, note: "Falls on a Sunday in 2027." },
    { date: "2027-11-01", label: "All Saints", masses: null, note: "Falls on a Monday in 2027, so the obligation is lifted." },
  ],

  /**
   * Every rule transcribed from stmarymarshall.org/icalendar1.ics on
   * 2026-10-27, exceptions included. The feed dies with eCatholic, so the
   * calendar lives here. Seasonal rules carry from/until; cancelled dates
   * go in exdates.
   */
  events: [
    { title: "Confessions and Adoration", kind: "worship", rule: { kind: "weekly", day: 6, start: "15:30", end: "16:30", exdates: ["2027-03-27"] } },
    { title: "Bible Study", note: "Reflect and pray on the upcoming weekend readings. Contact Karen Bess, karen.bess60@gmail.com.", where: "St. James Room, school building", kind: "formation", rule: { kind: "weekly", day: 2, start: "19:00", end: "20:00" } },
    { title: "Men’s Bible Study", note: "Prayer and the Gospel readings. Contact Ted Merkel, tedmerkel@gmail.com.", where: "St. James Room", kind: "formation", rule: { kind: "weekly", day: 6, start: "07:00", end: "08:00" } },
    { title: "Knights of Columbus Monthly Meeting", kind: "meeting", rule: { kind: "monthly", day: 1, nth: 2, start: "19:00", end: "20:00" } },
    // From the Women's Ministry entry on the old site; the feed had no rule for it. No end time published.
    { title: "Women’s Ministry Meeting", where: "Parish Hall", kind: "meeting", rule: { kind: "monthly", day: 1, nth: 4, start: "18:30" } },
    { title: "Adult Choir Rehearsal", note: "Questions: the music director, 269-781-3949 ext. 104.", where: "St. Cecilia Music Room", kind: "music", rule: { kind: "weekly", day: 3, start: "18:45", end: "20:15", until: "2026-11-19", exdates: ["2026-11-04"] } },
    { title: "Adult Choir Rehearsal", note: "Moved to Tuesday this week. Questions: the music director, 269-781-3949 ext. 104.", where: "St. Cecilia Music Room", kind: "music", rule: { kind: "once", date: "2026-11-03", start: "18:45", end: "20:15" } },
    { title: "OCIA / Adult Faith Formation Class", note: "To register or with questions, email Carol DiBiaggio, trinitas@att.net.", where: "Parish Hall", kind: "formation", rule: { kind: "weekly", day: 4, start: "18:30", end: "20:00", until: "2026-11-20" } },
    { title: "Religious Education, Grades 6 to 8", note: "Class is cancelled whenever Marshall Public Schools closes for weather. An email goes out and the cancellation is posted on the parish Facebook page.", kind: "family", rule: { kind: "weekly", day: 2, start: "16:00", end: "17:00", until: "2027-04-28", exdates: ["2026-11-03", "2026-11-24", "2026-12-08", "2026-12-22", "2026-12-29", "2027-01-05", "2027-03-30"] } },
    { title: "Religious Education, Age 4 to Grade 5", kind: "family", rule: { kind: "weekly", day: 0, start: "10:00", end: "10:50", until: "2027-04-26", exdates: ["2026-11-01", "2026-11-29", "2026-12-20", "2026-12-27", "2027-01-03", "2027-02-07", "2027-02-14", "2027-03-28", "2027-04-04", "2027-04-25"] } },
    { title: "Family Catechesis Event", kind: "family", rule: { kind: "once", date: "2026-11-01", start: "10:00", end: "10:50" } },
    { title: "Family Catechesis Event", kind: "family", rule: { kind: "once", date: "2026-12-20", start: "10:00", end: "10:50" } },
    { title: "Family Catechesis Event", kind: "family", rule: { kind: "once", date: "2027-02-07", start: "10:00", end: "10:50" } },
    { title: "Family Catechesis Event", kind: "family", rule: { kind: "once", date: "2027-04-25" } },
    { title: "Youth Choir Rehearsal, Grades 3 to 8", note: "Questions: the music director, 269-781-3949 ext. 104.", where: "St. Cecilia Music Room", kind: "music", rule: { kind: "weekly", day: 3, start: "16:30", end: "17:15", from: "2026-11-04", until: "2026-11-19" } },
    { title: "Youth Choir Rehearsal, Grades 3 to 8", note: "Questions: the music director, 269-781-3949 ext. 104.", where: "St. Cecilia Music Room", kind: "music", rule: { kind: "weekly", day: 3, start: "16:30", end: "17:15", from: "2026-12-02", until: "2026-12-24" } },
    { title: "Diocesan Huddle Meeting", note: "Led by Fr. Paul Redmond for deacons of the Diocese of Kalamazoo.", kind: "meeting", rule: { kind: "once", date: "2026-11-09", start: "18:30", end: "20:30" } },
    { title: "Parish Council Meeting", kind: "meeting", rule: { kind: "once", date: "2026-11-16", start: "18:30", end: "19:30" } },
    { title: "Finance Council Meeting", kind: "meeting", rule: { kind: "once", date: "2026-11-18", start: "17:45", end: "18:30" } },
    { title: "Elections", note: "The Parish Hall is a polling place.", kind: "meeting", rule: { kind: "once", date: "2026-11-03", start: "08:00", end: "20:00" } },
  ],

  welcome: {
    heading: "Welcome to St. Mary",
    body: [
      "We gather to remember, to celebrate, and to believe. In the celebration of life, the people of St. Mary Parish respond to the call of Jesus Christ. We are committed to the spiritual and physical welfare of those in our parish and community.",
      "In our daily lives, we will honor God Our Father with loyalty and devotion. Through our Christian love and good works, we shall embrace and support all people.",
    ],
  },

  // Every line is something the parish said on its old site or in its
  // bulletin; nothing about parking spots or which door is invented.
  newHere: [
    { q: "What about the kids?", a: "Children are welcome at every Mass. Religious Education runs September to April for age 4 through 8th grade, on Sunday mornings between the Masses for the younger ones and Tuesday afternoons for grades 6 to 8. A Children’s Choir sings at the 9:00 AM Mass." },
    { q: "Is there anything after Mass?", a: "During the school year, coffee hour follows most Sunday 9:00 AM Masses in the Parish Hall: coffee, muffins and a chance to meet people. The bulletin says which Sundays." },
    { q: "I’m not Catholic, or I was and drifted. Where do I start?", a: "OCIA, which used to be called RCIA, meets Thursday evenings from September. It is for adults exploring the faith, adults who want to become Catholic, and Catholics who want to go deeper. You can sit in without committing to anything." },
  ],

  staff: [
    { role: "Pastor", name: "Fr. Craig Lusk", phone, email, link: { label: "Read “From Music Man to Holy Man”", href: "https://swmcatholic.org/news/from-music-man-to-holy-man" } },
    { role: "Business Manager, Bulletin Editor, Safe Environment", name: "Stacie Contat", phone, email },
    { role: "Organist and Director of Music", name: "James Hamilton, Jr.", phone, ext: "104", email: "stmarymarshallmusic@gmail.com" },
    { role: "Director of Religious Education", name: "Sara Rodgers", phone: "(269) 781-5656", email: "stmaryschoolofreligion@gmail.com" },
    { role: "Adult Faith Formation and OCIA Coordinator, Lead Sacristan, Wedding Coordinator", name: "Carol DiBiaggio", phone: "(269) 967-2919", email: "trinitas@att.net" },
    { role: "Director of Parish Facilities", name: "Gary Zink", phone },
    // Deacon Mike is named on the old site only under the Shut-In Ministry. Ask the office for his full name.
  ],

  history: {
    lede: "Mission priests on horseback in 1837. A resident pastor in 1852. The present church, dedicated October 27, 1889, renovated most recently in 2021.",
    paragraphs: [
      "Catholics of the Marshall area were served out of Northville as far back as 1837. Priests came on horseback to the mission here, among them Fathers Morrissey, Cullen and Hennessy. Father James Hennessy became the first resident pastor in 1852, and the first church was dedicated in 1853.",
      "Records were first kept under the second pastor, Father P. C. Koopmans. The first baptism recorded was Mary Hamilton on May 27, 1855. On May 31, 1855, James Wall and Bridget Farell were the first couple whose marriage was recorded here. Under Father Koopmans the first school opened in 1856, the Sisters of the Immaculate Heart of Mary came to teach in 1864, and the cemetery land was purchased in 1866.",
      "Father Peter A. Baart came in 1882. He opened a new school in 1883, reorganized the Altar Society, and built the present church, dedicated on October 27, 1889. Baart Hall opened in 1900. Father Baart died in 1908 and is buried in the cemetery chapel, as is Father George Clarson, pastor from 1919 to 1932.",
      "When the parish was founded and when the present church was built, Marshall was part of the Archdiocese of Detroit, and one of the front windows was donated by Bishop Gallagher of Detroit. In 1937 Lansing became a diocese and Marshall went with it. In 1948, under Father Patrick McGuinnes, the church was renovated and the Rosary Altar Society bought a new marble altar for $4,000. A piece of that altar now stands under the tabernacle.",
      "During the pastorate of Father Julius Hengesbach, 1966 to 1974, the church changed again with the liturgical reforms of the Second Vatican Council. In 1971 the Diocese of Kalamazoo was formed under Bishop Paul Donovan, and the parish became part of it. Bishop Alfred Markiewicz was installed as the second bishop on January 31, 1995, followed by Bishop James Murray in 1998, Bishop Paul Bradley in 2009, and Bishop Edward M. Lohse, installed on July 25, 2023.",
      "Under Father Donald Wieber, 1974 to 1981, the present Parish Center replaced Baart Hall. The church was renovated and rededicated on August 13, 1988, and again on October 13, 2021.",
      "Parish history tends to follow the pastors and their buildings. Not forgotten are the people who have come here to be baptized, educated, married and buried.",
    ],
    links: [
      { label: "Watch the 2021 renovation", href: "https://www.youtube.com/watch?v=-PcS1tCIoe0" },
      { label: "The Michigan Stained Glass Census, which recorded the windows in 1994", href: "https://michiganstainedglass.org/" },
    ],
  },

  cemetery: {
    name: "St. Mary Cemetery",
    address: "18245 Centennial Road, Marshall, MI 49068",
    mapUrl: "https://www.google.com/maps/dir/?api=1&destination=18245+Centennial+Rd%2C+Marshall%2C+MI+49068",
    body: [
      "St. Mary Cemetery dates to 1866, when Fr. Koopmans purchased 16 acres on the east side of town for $800. Fr. Baart wrote that Fr. Koopmans “spent considerably more in the surveying and arranging of it,” and called it “a choice spot for a cemetery” and “one of the finest in the diocese.”",
      "Today the cemetery continues to be a blessed place where the bodies of the faithful departed await the day of Resurrection. Regulations let families express their love and loss while preserving the grounds for every visitor.",
      "St. Mary Cemetery assumes no responsibility for the protection or maintenance of decorations, grave markers or flower urns. Unsightly or prohibited decorations are removed during normal grounds maintenance, for the safety of the cemetery staff.",
    ],
    docs: [
      { label: "Cemetery map", href: `${P}/docs/cemetery-map.pdf` },
      { label: "Cemetery regulations", href: `${P}/docs/cemetery-regulations.pdf` },
      { label: "Cemetery fees", href: `${P}/docs/cemetery-fees.pdf` },
    ],
    plots: `To purchase a plot or ask a question, call the office at ${phone}.`,
  },

  sacraments: [
    {
      slug: "baptism",
      title: "Baptism",
      body: ["A baptism preparation class is required. Call the office to make an appointment with the deacon or priest. No date can be set before that meeting."],
      prep: { steps: ["Call the office for an appointment with the deacon or priest.", "Attend the baptism preparation class.", "The date is set after that meeting, not before."] },
      contact: `Call ${phone}`,
    },
    { slug: "first-communion-confirmation", title: "First Communion and Confirmation", body: ["Children prepare through the parish Religious Education program. Contact the Religious Education office for class schedules."], contact: "Call (269) 781-5656" },
    {
      slug: "matrimony",
      title: "Matrimony",
      body: ["Consult the priest eight months in advance of the desired date. No dates are reserved until the couple has met with the priest or deacon and met the requirements for marriage.", "Appointments are scheduled during the week, not on weekends. You must be a registered parishioner for at least one year."],
      prep: { steps: ["Be a registered parishioner for at least one year.", "Call the office at least eight months before the date you hope for; appointments are during the week.", "Meet with the priest or deacon and complete the requirements for marriage.", "The date is reserved after that, not before."] },
      contact: `Call ${phone}`,
    },
    { slug: "anointing", title: "Anointing of the Sick", body: ["Call the office, or the rectory for emergencies at any time. Please let the parish priest know of anyone who is in the hospital or unable to leave home."], contact: `Call ${phone}` },
    { slug: "penance", title: "Penance", body: ["Confessions are heard Saturdays from 3:30 to 4:30 PM unless the bulletin says otherwise, and by appointment."], contact: `Call ${phone}` },
  ],

  formation: [
    {
      slug: "youth",
      title: "Youth Religious Education",
      body: [
        "The St. Mary Religious Education program for students age 4 through 8th grade begins each September. All registered parishioners are invited to enroll their children. Students follow a diocesan-approved curriculum to learn the Catholic faith at their age level, supporting the work parents do at home to foster a love of God and a rich knowledge of the faith.",
        "For 2026 to 2027: classes for age 4 through 5th grade meet Sunday mornings from 10:00 to 10:50, beginning September 27 with a Family Catechesis event. Classes for grades 6 through 8 meet Tuesdays from 4:00 to 5:00 PM, beginning September 29.",
        "Family Catechesis events take place on scheduled Sundays through the year for children and their parents, in place of the regular Sunday classes. All are invited.",
        "Order of Christian Initiation for Children: if you have a child age 7 or older who has not been baptized, or was baptized in another Christian tradition, and would like to be received into the Catholic Church, OCIC classes are offered on scheduled Sunday mornings through the year. Contact Sara Rodgers.",
      ],
      // The 2026 to 27 Google form was closed when checked on 2026-10-27, so it is not linked.
      links: [
        { label: "Sunday class calendar", href: `${P}/docs/re-sunday-calendar-2026-27.pdf` },
        { label: "Tuesday class calendar", href: `${P}/docs/re-tuesday-calendar-2026-27.pdf` },
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
    { slug: "bible-study", title: "Tuesday Night Bible Study", body: ["Meets Tuesday nights at 7:00 PM in the St. James Room of the school building to discuss the upcoming Sunday Gospel."], contact: "Karen Bess, karen.bess60@gmail.com" },
    { slug: "mens-bible-study", title: "Men’s Bible Study", body: ["Meets Saturday mornings at 7:00 AM in the St. James Room to pray and discuss the Gospel readings."], contact: "Ted Merkel, tedmerkel@gmail.com" },
    { slug: "life-teen", title: "Life Teen", body: ["Life Teen is a Catholic youth ministry resource for teens and their families."], links: [{ label: "Visit lifeteen.com", href: "https://lifeteen.com/", external: true }] },
    { slug: "catholic-schools", title: "Catholic Schools", body: ["Catholic school options within the Diocese of Kalamazoo."], links: [{ label: "Diocesan Catholic Schools", href: "https://catholicschools.diokzoo.org/", external: true }, { label: "Battle Creek Area Catholic Schools", href: "https://bcacs.org/", external: true }] },
  ],

  ministries: [
    {
      slug: "music",
      title: "Music Ministry",
      body: [
        "James Hamilton serves as Organist and Music Director. He began as a weekly organist at St. Mary Catholic Church in Charlotte, Michigan at age 15, and has served as an organist for more than 26 years, including 11 as a choir director.",
        "New adult choir members and cantors are welcome, whether you have years of experience or simply enjoy singing. Cantors get individual practice sessions, training and support as they learn the role.",
        // The old music letter said 4:00 PM; the parish calendar feed, updated more recently, has 4:30 to 5:15. The calendar wins; README asks the music director.
        "The Adult Choir rehearses Wednesdays from 6:45 to 8:15 PM in the St. Cecilia Music Room and sings at Sunday Mass from mid September. The Children’s Choir, grades 3 through 8, rehearses Wednesdays at 4:30 PM in the St. Cecilia Music Room and sings at the 9:00 AM Mass from October.",
        "Virtus-trained adult volunteers are needed to support the young singers at rehearsals and at Mass, about one Mass a month during the season.",
      ],
      links: [{ label: "Register a child for the Children’s Choir", href: "https://docs.google.com/forms/d/e/1FAIpQLSfcI9TdW_n3Od9Xxz4e4G_EwdgIr3VdiQOp8b_MBlS2BbDwNQ/viewform", external: true }],
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
    { slug: "women", title: "Women’s Ministry", body: ["Encouraging, celebrating and supporting authentic Catholic living through fellowship and service to the Church and the parish community. Meets the fourth Monday of the month at 6:30 PM in the Parish Hall."], contact: "Lynn Gruber, gruberl1113@gmail.com, or Theresa Ruedisueli, theresaruedisueli@hotmail.com" },
    { slug: "councils", title: "Parish and Finance Councils", body: ["Advisory councils to the pastor.", "Finance Council president: Steve Hageman. Parish Council: Tom Gruber, president; Tyler Stuut, vice president; Lynn Gruber, secretary; Carol DiBiaggio, Brad and Brenda Moorehead, Jim Oliver, Tracy Nofs, Tim Fitzgerald and Jeremy Weitting."], contact: "Steve Hageman, steven.hageman@att.net" },
    { slug: "st-theresa-guild", title: "St. Theresa Guild", body: ["Pro-life awareness and promotion, and the sale of religious articles and gifts before First Holy Communion and Confirmation."], contact: "Chair: Fran Weberling" },
    { slug: "st-joseph-guild", title: "St. Joseph Guild", body: ["Supports youth faith formation in the parish, and keeps young people connected to their faith through the college years with prayers, college and military care packages, prayer books and graduate recognition. The guild organizes the First Holy Communion reception and donates personal care and baby care products to The Fountain Clinic and Oaklawn Hospital."], contact: "Mary Crosby, crosbyma@att.net" },
    {
      slug: "welcoming",
      title: "Welcoming Ministry",
      body: [
        "Registration: new parishioners are encouraged to register online. Newly registered members are contacted by the parish and sent a welcome packet.",
        "Coffee hour: after most Sunday 9:00 AM Masses during the school year, parishioners and guests are welcome in the Parish Hall for coffee, muffins and other treats. Check the bulletin each week for the schedule.",
        "Ushers greet and seat people as they arrive for Mass and serve during it. Call the office to be trained as an usher.",
        "Funeral lunches are provided after funerals for parishioners, family and friends.",
      ],
      contact: phone,
    },
    { slug: "shut-in", title: "Shut-In Ministry", body: ["If a family member or friend is in the hospital or at home and unable to attend Mass, or would like a visit or Communion, contact Deacon Mike."], contact: `Deacon Mike, ${phone}` },
    { slug: "garden", title: "Garden Ministry", body: ["Cares for the many gardens around St. Mary Church."], contact: "Karen Mestemaker, mesty59214@aol.com" },
    { slug: "cleaning", title: "Church Cleaning Ministry", body: ["Teams rotate monthly to do the weekly cleaning in the church, and lend a hand at the busy times of the liturgical year."], contact: "Susie Twiss, dave.susie.twiss@gmail.com" },
    { slug: "library", title: "Parish Library", body: ["Books, audio and movies can be checked out for a limited time by registered St. Mary parishioners."], contact: "Barb Goedde, begoedde@gmail.com" },
    { slug: "meal-train", title: "Meal Train Ministry", body: ["Schedules meals for St. Mary families after life events such as surgery or a birth. The team is looking for more members to spot needs in the parish and to organize and manage meal trains."], contact: "Katie Kellogg, (269) 832-8921" },
  ],

  pages: [],

  give: {
    intro: "Donations to St. Mary Parish can be made online from a computer or phone, one time or on a schedule: weekly, every two weeks, monthly or twice a month.",
    funds: [
      "For the Church: Sunday and Holy Day offerings, Building on His Cornerstone for parish improvements, and altar flowers.",
      "Religious Education: class fees and youth ministry.",
      "Other collections, specified when needed.",
    ],
    url: "https://secure.myvanco.com/L-ZG5R/home",
    provider: "Vanco",
    extras: [
      // The old site printed two numbers for Gus: this one on the Donate page and (269) 830-7744 under the Knights. README: ask the office which is current.
      { title: "We Care Fund", body: "The We Care Fund assists families at St. Mary. The Knights of Columbus administer it and the people of St. Mary fund it. If you need help, or know of a family in need, contact Gus Groat.", contact: "Gus Groat, (269) 781-0008" },
      { title: "St. Mary Parish Endowment Fund", body: "A permanent fund held at the Catholic Foundation of Southwestern Michigan. Gifts to the endowment support the parish for generations.", url: "https://www.osvhub.com/catholic-foundation-of-southwestern-michigan/giving/funds/st-mary-parish-endowment-fund", linkLabel: "Give to the endowment" },
    ],
  },

  docs: [
    { label: "Registration form", href: `${P}/docs/registration-form.pdf` },
    { label: "Christmas letter from the pastor, 2025", href: `${P}/docs/fr-craig-christmas-letter-2025.pdf` },
    { label: "Mid-summer update from the pastor, 2025", href: `${P}/docs/fr-craig-midsummer-update-2025.pdf` },
    { label: "Parish photo directory price list", href: `${P}/docs/directory-price-list.pdf` },
  ],

  registrationForm: `${P}/docs/registration-form.pdf`,
  nav: [],
  credit: "Built by",
};

export default parish;
