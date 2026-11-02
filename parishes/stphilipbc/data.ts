import type { Parish } from "@/lib/types";

/**
 * St. Philip Catholic Church, Battle Creek. Every fact on the site, once.
 *
 * Read off stphilipbc.org and its calendar feed on 2026-11-01 for the
 * diocesan pilot demo. The parish has not been asked yet; the demo sits on
 * a noindex pitch host and nothing here is published to search engines.
 * Where the old site and its feed disagreed, the README says which value
 * won. A line the office has not confirmed is left out rather than guessed.
 */
const P = "/parishes/stphilipbc";
const phone = "(269) 968-6645";
const email = "admin@stphilipbc.org";

const parish: Parish = {
  slug: "stphilipbc",
  hosts: ["stphilipbc.org", "www.stphilipbc.org"],
  pitchHost: "stphilip.glazedweb.com",
  live: false,
  lang: "en",

  name: "St. Philip Catholic Church",
  shortName: "St. Philip",
  parishName: "St. Philip Parish",
  tagline: "A Catholic parish in Battle Creek, Michigan, since 1869",
  founded: 1869,
  diocese: { name: "Diocese of Kalamazoo", url: "https://www.diokzoo.org/" },
  timeZone: "America/Detroit",
  // The parish's own logo, from its old site.
  mark: { type: "image", src: `${P}/img/logo.png`, width: 268, height: 441 },
  // Bedford stone and the crest's red and gold: an oxblood ground, stone
  // paper, gold kept warm. Ratios in tools/palette-check.mjs.
  theme: {
    navy: "#2a1116",
    navySoft: "#3b1b22",
    navyLine: "#5a3039",
    marian: "#7a1f2e",
    gold: "#d9b45f",
    goldLight: "#e8cb84",
    goldDeep: "#6e5518",
    cream: "#f5efe4",
    dim: "#d8c9bb",
    paper: "#f5f0e7",
    paperDim: "#e9e0d2",
    ink: "#26191a",
    inkSoft: "#5b4a49",
  },

  phone,
  phoneHref: "tel:+12699686645",
  email,
  church: { street: "112 Capital Ave NE", city: "Battle Creek", state: "MI", zip: "49017" },
  office: { street: "Seton Center, 112 Capital Ave NE", city: "Battle Creek", state: "MI", zip: "49017" },
  officeHours: ["Monday to Thursday, 9 AM to 3 PM", "First and third Wednesday, 9 AM to 6 PM", "Friday, 9 AM to noon"],
  mapUrl: "https://www.google.com/maps/dir/?api=1&destination=112+Capital+Ave+NE+Battle+Creek%2C+MI+49017-3927",
  facebook: "https://www.facebook.com/stphilipbc",
  youtube: "https://www.youtube.com/user/StPhilipCatholic",
  bulletins: "https://discovermass.com/church/st-philip-battle-creek-mi/",
  livestream: "https://www.facebook.com/stphilipbc",
  findAMass: "https://findamass.org/",

  photos: {
    hero: { src: `${P}/img/church-magnolias.jpg`, width: 1500, height: 1100, alt: "The stone front of St. Philip Church, its rose window above a magnolia in bloom." },
    about: { src: `${P}/img/seton-center.jpg`, width: 1600, height: 1200, alt: "Parishioners gathered in the Seton Center lobby." },
    extra: [{ src: `${P}/img/host.jpg`, width: 660, height: 350, alt: "A Communion host stamped with the IHS and a cross." }],
  },

  masses: [
    { day: 6, start: "16:30", label: "Saturday Vigil" },
    { day: 0, start: "09:00", label: "Sunday", where: "Streamed on Facebook" },
    { day: 0, start: "11:30", label: "Sunday" },
    { day: 0, start: "19:00", label: "Sunday", lang: "Latin" },
    { day: 1, start: "08:00", label: "Monday" },
    { day: 2, start: "12:10", label: "Tuesday" },
    { day: 2, start: "18:30", label: "Tuesday", where: "Mass with healing prayers" },
    { day: 3, start: "08:00", label: "Wednesday" },
    { day: 3, start: "17:00", label: "Wednesday", lang: "Latin" },
    // Thursday and Friday 8:00 AM come from the parish calendar feed, which
    // the office keeps current with cancellations; the Mass times page lists
    // Monday, Wednesday and Saturday only. README: confirm with the office.
    { day: 4, start: "08:00", label: "Thursday" },
    { day: 5, start: "08:00", label: "Friday" },
    { day: 6, start: "08:00", label: "Saturday" },
  ],
  confession: [
    { day: 0, start: "08:15", label: "Sunday" },
    { day: 0, start: "10:45", label: "Sunday" },
    { day: 1, start: "07:15", label: "Monday" },
    { day: 2, start: "11:35", label: "Tuesday" },
    { day: 3, start: "07:15", label: "Wednesday" },
    { day: 6, start: "07:15", label: "Saturday" },
    { day: 6, start: "15:00", end: "16:00", label: "Saturday" },
  ],
  // Exposition runs around the clock from Wednesday morning to Saturday
  // morning in the Sacred Heart Adoration Chapel; four rows so the tile
  // can say "Now" on any of those days.
  adoration: [
    { day: 3, start: "09:00", end: "23:59", label: "Wednesday from 9:00 AM", where: "Sacred Heart Adoration Chapel" },
    { day: 4, start: "00:00", end: "23:59", label: "Thursday, all day" },
    { day: 5, start: "00:00", end: "23:59", label: "Friday, all day" },
    { day: 6, start: "00:00", end: "09:00", label: "Saturday until 9:00 AM" },
  ],
  confessionNote: "The weekday and early Saturday times are before the 8:00 AM Mass.",
  adorationNote: "Exposition and Adoration of the Blessed Sacrament runs from Wednesday at 9:00 AM until Saturday at 9:00 AM in the Sacred Heart Adoration Chapel. To take a regular hour, call Betty Dillard at (269) 962-8255, or drop by any time to pray.",
  specialMasses: [],
  holyDays: [
    { date: "2026-12-08", label: "Immaculate Conception", masses: null },
    { date: "2026-12-25", label: "Christmas Day", masses: null, note: "Christmas Eve Masses are announced in the bulletin." },
    { date: "2027-01-01", label: "Mary, Mother of God", masses: null },
    { date: "2027-08-15", label: "Assumption of Mary", masses: null, note: "Falls on a Sunday in 2027." },
    { date: "2027-11-01", label: "All Saints", masses: null, note: "Falls on a Monday in 2027, so the obligation is lifted." },
  ],

  /**
   * Transcribed from stphilipbc.org/icalendar1.ics on 2026-11-01, Masses
   * excluded (they live above). The feed dies with eCatholic, so the
   * calendar lives here.
   */
  events: [
    { title: "Sunday Supper", note: "A hot meal for anyone who comes hungry, every Sunday for more than 35 years.", kind: "service", rule: { kind: "weekly", day: 0, start: "16:00", end: "17:00" } },
    { title: "Apologetics", kind: "formation", rule: { kind: "weekly", day: 2, start: "09:30", end: "10:30" } },
    { title: "Prayer for America", kind: "worship", rule: { kind: "weekly", day: 2, start: "11:00", end: "12:00" } },
    { title: "Fear and Anger Management Group", note: "A confidential support and healing group for fear, anger management and healing.", kind: "service", rule: { kind: "weekly", day: 3, start: "10:00", end: "11:00" } },
    { title: "Religious Education", note: "Grades 1 to 8, mid September to early May. Most grades meet the second and fourth Wednesdays with a parent and work at home in between.", kind: "family", rule: { kind: "weekly", day: 3, start: "18:00", end: "19:15", from: "2026-09-16", until: "2027-05-05" } },
    { title: "Choir Practice", kind: "music", rule: { kind: "weekly", day: 4, start: "19:00", end: "20:00" } },
    { title: "That Man Is You", kind: "formation", rule: { kind: "weekly", day: 6, start: "07:00", end: "08:00" } },
    { title: "Healing Tamar", note: "Women helping women heal from love’s wounds.", kind: "service", rule: { kind: "monthly", day: 4, nth: 2, start: "18:30", end: "19:30" } },
    { title: "Council of Catholic Women Meeting", kind: "meeting", rule: { kind: "monthly", day: 1, nth: 3, start: "16:00", end: "17:00" } },
    { title: "Knights of Columbus Council Meeting", kind: "meeting", rule: { kind: "monthly", day: 2, nth: 3, start: "18:00", end: "19:30" } },
    { title: "Knights of Columbus Assembly", kind: "meeting", rule: { kind: "monthly", day: 3, nth: 3, start: "18:00", end: "19:30" } },
  ],

  welcome: {
    heading: "Welcome to St. Philip",
    body: [
      "Praised be Jesus Christ! We welcome you to St. Philip Catholic Church in Battle Creek. What you find here will help you learn more about our Catholic faith in general and our parish community in particular. Our hope, of course, is to welcome you in person, so please contact us with any questions or thoughts.",
      "Hospitality has long been an important characteristic of Christianity. In countless stories throughout the Bible, strangers and friends are welcomed into homes and towns, and Jesus counted it among the works of mercy: “When I was a stranger, you welcomed me.”",
    ],
  },
  newHere: [
    { q: "Is Mass streamed?", a: "The 9:00 AM Sunday Mass is streamed on the parish Facebook page most Sundays, and videos of past Masses are there too." },
    { q: "Is there a Latin Mass?", a: "Yes. Sunday at 7:00 PM and Wednesday at 5:00 PM." },
    { q: "What about the kids?", a: "Religious Education meets Wednesday evenings from 6:00 to 7:15 PM, mid September to early May, for 1st through 8th grade, with sacramental preparation in 2nd grade and Confirmation preparation in 7th and 8th. Battle Creek Area Catholic Schools runs St. Joseph Elementary and Middle School and St. Philip Catholic Central High School." },
  ],

  staff: [
    { role: "Pastor", name: "Fr. James Richardson", email: "frjames@stphilipbc.org" },
    { role: "Parochial Vicar", name: "Fr. Patrick Murphy", email: "FrPatrick@stphilipbc.org" },
    { role: "Director of Parish Operations", name: "Debra Wawzysko", phone, email: "dwawzysko@stphilipbc.org" },
    { role: "Receptionist and Bulletin Editor", name: "Kateri Claussen", phone, email },
    { role: "Director of Religious Education and Faith Formation", name: "Tim McNamara", phone, email: "tmcnamara@stphilipbc.org" },
    { role: "Echo Apprentice", name: "Camila Holden", phone, email: "cholden@stphilipbc.org" },
    { role: "Director of Music", name: "Omar Padilla", phone: "(269) 963-2584", email: "Opadilla@stphilipbc.org" },
    { role: "Parish Outreach Coordinator", name: "Deb Lawver", phone, email: "dlawver@stphilipbc.org" },
    { role: "Environmental Coordinator", name: "Toni Gore", phone, email: "tgore@stphilipbc.org" },
    { role: "Wedding Coordinator", name: "Nicki Herold", phone, email: "stphilipbcweddings@gmail.com" },
  ],

  history: {
    lede: "The first Mass in Battle Creek was said in 1849. A resident pastor came in 1869, the first brick church was dedicated in 1879, and the present church in Bedford stone rose in 1929 after a fire.",
    paragraphs: [
      "The first religious ceremony of any faith recorded in Battle Creek was the marriage of Jeremiah McCarthy and Bridget Walsh, performed by Fr. Cullen, the resident pastor of Ann Arbor, on July 12, 1847. The first Mass said in Battle Creek was on August 10, 1849, by Fr. Hennessy of Ann Arbor, assistant to Fr. Cullen.",
      "From 1855 to 1869, Fr. Frain, Fr. D. Callaert and Fr. J. Koopmans came from Marshall to say Mass, until Fr. William Herwit was appointed Battle Creek’s first resident pastor in December 1869. Services were held monthly in Stuart Hall on West Main Street, opposite City Hall, until a little red frame building, formerly a Quaker church, was offered for sale at public auction.",
      "On July 1, 1877, Fr. F. J. Brogger was appointed pastor and the work of collecting funds for a church began in earnest. The cornerstone of the parish’s first brick church was laid by the Very Rev. P. Hennaert, V.G., on August 13, 1878, and the church was dedicated on Thanksgiving Day, November 27, 1879, by Bishop Casper Borgess. So successful was Fr. Brogger’s work that by October 1880, when he was transferred to Wyandotte, the entire cost of the new building had been raised.",
      "From October 1, 1887, until September 4, 1891, Fr. J. P. McManus was pastor, a good priest who worked for the welfare of his people and had the happiness of knowing his efforts were appreciated. He was transferred to St. Stephen in Port Huron, and Fr. Richard Joseph Sadlier came to St. Philip in 1891. Fr. Sadlier purchased the house and lot next to the school, converted at once into a rectory and remodeled and enlarged in 1905. He died of Bright’s disease on February 14, 1908.",
      "The original church burned in 1928. In 1929 the present church was built, in the late Romanesque style, executed in Bedford stone.",
    ],
  },

  sacraments: [
    {
      slug: "baptism",
      title: "Baptism",
      body: [
        "Congratulations! One of the most important things you can do for your children is to bring them up in your Catholic faith. To have your baby baptized at St. Philip, we ask that you attend a Baptism Preparation class. If this is not your first baby and you have already attended one, here or at another Catholic church, a second is not required. If you are not registered at St. Philip, we ask for permission from your pastor.",
        "We will ask for the names of one or two sponsors. Godparents are Catholic witnesses to your child’s baptism: practicing Catholics who are not the child’s parents, at least sixteen years old, with a letter of good standing from their parish. If one of the people you would like is not Catholic, he or she can be a Christian Witness, who must be Christian.",
      ],
      contact: `Call the parish office to schedule a baptism, ${phone}`,
    },
    {
      slug: "reconciliation",
      title: "Reconciliation",
      body: [
        "The Sacrament of Reconciliation is the gift given by Christ to his Church to renew the spiritual life we can damage or lose through sin. “In imparting to his Apostles his own power to forgive sins, the Lord also gives them the authority to reconcile sinners with the Church” (Catechism 1444). That grace continues to be exercised by his priests, so that his mercy is always present to the faithful, even those who fall again and again. As Pope Francis said, the Lord never tires of forgiving; it is we who tire of asking.",
        "Confession is heard Sunday at 8:15 and 10:45 AM, Monday, Wednesday and Saturday at 7:15 AM, Tuesday at 11:35 AM, and Saturday from 3:00 to 4:00 PM.",
      ],
      links: [{ label: "Confession times", href: "/mass-times#confession" }],
    },
    {
      slug: "first-communion",
      title: "First Holy Communion",
      body: [
        "Preparation for the Eucharist draws your child into fuller and more active participation in the parish. It begins at home, through prayer and attendance at Mass, so that your child comes to a true understanding of the Mass and Communion. Baptism and First Reconciliation come before First Holy Communion.",
        "If your child was not baptized at St. Philip, a copy of the baptismal certificate goes to the Director of Religious Education or the parish office. Students are expected to attend every class session so they are fully prepared.",
      ],
      contact: "Tim McNamara, Director of Religious Education, tmcnamara@stphilipbc.org",
    },
    {
      slug: "confirmation",
      title: "Confirmation",
      body: [
        "Confirmation is a sacrament of initiation. By the laying on of hands, anointing with chrism and prayer, those already baptized are strengthened by the Holy Spirit to profess the faith steadfastly and live up to that profession. Each candidate chooses a mature adult as sponsor to walk with them through the preparation.",
        "Preparation takes two years, normally beginning in 7th grade, with the sacrament received toward the end of 8th. The first year reviews the foundations of the faith at a deeper level and builds a mature prayer life; the second looks in depth at the sacramental life of the Church and spends several weeks on the Theology of the Body. The date of Confirmation is set by the Bishop’s office and given out after classes begin.",
        "High school students beyond the usual age follow a preparation closer to OCIA, handled case by case. For any circumstance outside the normal age of preparation, contact the Director of Faith Formation. Parents are expected to be involved in their children’s preparation whatever their age.",
      ],
      contact: "Tim McNamara, Director of Religious Education and Faith Formation, tmcnamara@stphilipbc.org",
    },
    {
      slug: "matrimony",
      title: "Matrimony",
      body: ["Celebrating a marriage at St. Philip begins with a call to the parish office. The wedding coordinator walks each couple through the preparation, the music and the liturgy; booklets of wedding psalms, hymns, readings and blessings are available at the office."],
      contact: `${phone} or Nicki Herold, Wedding Coordinator, stphilipbcweddings@gmail.com`,
    },
    {
      slug: "anointing",
      title: "Anointing of the Sick",
      body: [
        "This sacrament consists of prayers by the priest and anointing with the Oil of the Sick. People may be anointed at any stage of a serious illness, before surgery, or because of advanced years and the limitations that come with age. A priest can anoint at home, in a hospital or nursing home, or in the church. When possible the sacrament is preceded by Confession and followed by Holy Communion.",
        "In an emergency, call the office and use option 1. Chaplains at the Battle Creek hospitals also know how to reach a priest.",
      ],
      contact: `Call the parish office, ${phone}`,
    },
    {
      slug: "funerals",
      title: "Funerals",
      body: [
        "The Catholic funeral is a bridge between death and new life. The rites in the Order of Christian Funerals let the community mourn and hope at once, by keeping the mystery of Christ’s death and resurrection at the center. The Funeral Mass is ordinarily the heart of it: a prayer for God’s mercy on the deceased and a solace for the living.",
        "The Church encourages burial in a Catholic cemetery (Canon 1180.1), a sign of baptismal commitment and a witness, even in death, to faith in the resurrection. Planning booklets, with hymns, psalm responses and readings for funerals, are available at the parish office.",
      ],
      contact: `Call the parish office, ${phone}`,
    },
  ],

  formation: [
    {
      slug: "religious-education",
      title: "Religious Education",
      body: [
        "Religious Education at St. Philip runs from mid September through early May, once a week on Wednesday evenings from 6:00 to 7:15 PM.",
        "Grades 1, 3, 4, 5 and 6 meet with a catechist twice a month, generally the second and fourth Wednesdays, together with a parent, grandparent, godparent or sponsor, for a presentation on a topic, and cover work at home as a family once a month, returning a sheet signed by the parent. Grade 2 prepares for Reconciliation and the Eucharist, with a half-day retreat, and receives those sacraments toward the end of the year. Grades 7 and 8, Confirmation 1 and 2, prepare to be fully initiated into the Church and to receive the seven gifts of the Holy Spirit.",
        "What is all this education ultimately about? To grow in relationship with, and fall in love with, Jesus Christ and his Catholic Church, so that each student lives fully alive as a daughter or son of the ever-present God.",
      ],
      contact: "Tim McNamara, Director of Religious Education, tmcnamara@stphilipbc.org or " + phone,
    },
    {
      slug: "ocia",
      title: "OCIA, the Order of Christian Initiation of Adults",
      body: [
        "“I think I want to be Catholic.” Are you interested in a relationship with Jesus Christ and his Catholic Church? Do you feel pulled to consider living your life as a Catholic? Do you feel there is more to life than what you are experiencing now? Perhaps you know someone with many questions about life with God.",
        "OCIA, which used to be called RCIA, is the process for exploring those questions and, for those who choose it, entering the Catholic Church. It is open to adults who are not baptized, adults baptized in another Christian tradition, and Catholics who never completed their sacraments.",
      ],
      contact: "Tim McNamara, tmcnamara@stphilipbc.org, or the parish office, " + phone,
    },
    { slug: "adult-formation", title: "Adult Formation", body: ["Apologetics meets Tuesday mornings at 9:30. That Man Is You, for men, meets Saturday mornings at 7:00. Bible study, Formed, and the Health and Spirituality series are announced in the bulletin."], contact: phone },
    { slug: "catholic-schools", title: "Catholic Schools", body: ["Battle Creek Area Catholic Schools serves families from preschool through 12th grade: St. Joseph Preschool, Elementary and Middle School, and St. Philip Catholic Central High School."], links: [{ label: "Battle Creek Area Catholic Schools", href: "https://bcacs.org/", external: true }, { label: "Diocesan Catholic Schools", href: "https://catholicschools.diokzoo.org/", external: true }] },
  ],

  ministries: [
    {
      slug: "sunday-suppers",
      title: "Sunday Suppers",
      body: [
        "For more than 35 years, volunteers have served a hot, nutritious meal to anyone who shows up hungry on Sunday afternoons between 4 and 5 o’clock at St. Philip. Between 65 and 125 diners sign in at the door each week, a group diverse in age, race and family makeup; most arrive on foot.",
        "Five crews of five to ten volunteers each take an assigned Sunday: ordering and picking up the food from the Food Bank, preparing and serving the meal, and cleaning up. Students from area high schools and colleges volunteer through the year.",
        "Sunday Supper is funded by donations to the Food Bank of South Central Michigan (mark the check “St. Philip Sunday Supper”) and to the St. Vincent de Paul Society, which supplies what the Food Bank does not carry. Checks labeled Sunday Supper can also go to the parish office.",
      ],
      contact: `${email} or ${phone}`,
    },
    { slug: "st-vincent-de-paul", title: "St. Vincent de Paul", body: ["Spiritual and material help to the poor regardless of race, color or creed. Referrals come through a central clearing organization so benefits can be coordinated with other churches and agencies. Help includes food and assistance with gas and electric bills. Officers: Paul Ohm, president; John Donnelly, treasurer. New members are welcome."], contact: "(269) 962-2267; a member returns the call" },
    { slug: "homebound", title: "Homebound Ministry", body: ["The parish priests, the deacon and commissioned lay ministers bring Communion to parishioners who cannot come to Mass, at home, in the hospital and in nursing homes. If you or someone you know is homebound and would like a bulletin in the mail, contact the office."], contact: `${phone} or ${email}` },
    { slug: "healing", title: "Healing Ministry", body: ["A Mass with healing prayers is offered Tuesday evenings at 6:30. A confidential support and healing group for fear and anger management meets Wednesday mornings at 10:00. Healing Tamar, women helping women heal from love’s wounds, meets the second Thursday of the month at 6:30 PM."], contact: phone },
    { slug: "adoration", title: "Perpetual Adoration", body: ["Exposition and Adoration of the Blessed Sacrament in the Sacred Heart Adoration Chapel runs from Wednesday at 9:00 AM until Saturday at 9:00 AM. Sign up for a specific day and hour, or drop by any time to pray."], contact: "Betty Dillard, (269) 962-8255" },
    {
      slug: "music",
      title: "Music Ministry",
      body: [
        "St. Philip has a rich legacy of music and musicians who have enriched worship with their gifts. We welcome those who wish to assist in the ministry of music, the enhancement of the liturgy, and the leading of the congregation in the celebration of the Eucharist, as a member of the choir or the liturgical ensemble, as a cantor or as an instrumentalist.",
        "The choir rehearses Thursday evenings at 7:00.",
      ],
      contact: "Omar Padilla, Director of Music, (269) 963-2584 or Opadilla@stphilipbc.org",
    },
    {
      slug: "knights",
      title: "Knights of Columbus, Father Owens Council 11114",
      body: [
        "The council meets the third Tuesday of the month at 6:00 PM and the assembly the third Wednesday. Grand Knight: Jordan Peterson. Chaplain: Fr. James Richardson. The council received a Double Star Award for 225 percent of its membership quota, was named Council of the Month in the Diocese of Kalamazoo, and holds a Star Award.",
        "Membership is open to practicing Catholic men in union with the Holy See who are at least 18. Application blanks are available from any member; every Knight is happy to propose an eligible man.",
      ],
      contact: "Jordan Peterson, (269) 317-1027",
    },
    { slug: "ccw", title: "Council of Catholic Women", body: ["The Council of Catholic Women meets the third Monday of the month at 4:00 PM."], contact: "Deb Lawver, deb.lawver@outlook.com" },
    { slug: "pro-life", title: "Tri-Parish Pro-Life", body: ["The pro-life group shared by the three Battle Creek parishes."], contact: "prolifeministrybc@yahoo.com" },
    { slug: "scouts", title: "Scouts BSA Troop 325", body: ["The parish charters Scouts BSA Troop 325."], contact: "Eddie Thomas, Scoutmaster, scoutmaster325@gmail.com" },
    { slug: "liturgical", title: "Liturgical Ministries", body: ["Altar servers, extraordinary ministers of Holy Communion, hospitality, lectors, sacristans and ushers. Every Mass needs them, and training is provided."], contact: phone },
  ],

  pages: [],

  give: {
    intro: "Online giving helps sustain the parish. Give, serve and pray while you are away: make donations, payments and pledges from your phone or computer, one time or on a schedule, and keep supporting your parish back home.",
    url: "https://osvhub.com/stphilipchurch-bc/funds",
    provider: "Our Sunday Visitor",
    extras: [
      { title: "Restore and Renew: Boiler and Air Conditioning", body: "The fund for the church’s boiler and air conditioning.", url: "https://www.osvhub.com/stphilipchurch-bc/giving/funds/renew-and-restore", linkLabel: "Give to Restore and Renew" },
      { title: "iGiveCatholic on Giving Tuesday", body: "Each December the parish takes part in iGiveCatholic, raising funds for religious education and evangelization and for the works of mercy, including Sunday Supper and St. Vincent de Paul.", url: "https://diokzoo.igivecatholic.org/organizations/st-philip-catholic-church", linkLabel: "The parish’s iGiveCatholic page" },
      { title: "Bishop’s Annual Appeal", body: "Diocesan programs and ministries serve people in ways no parish could alone. The parish goal is 100 percent participation; no gift is too large or too small. Pledge envelopes are in the pews, or give online. Checks go to the Diocese of Kalamazoo, BAA, 215 North Westnedge Ave, Kalamazoo, MI 49007, with St. Philip in the memo line.", url: "https://www.osvhub.com/dioceseofkalamazooappeal/giving/funds", linkLabel: "Pledge to the Appeal" },
    ],
  },

  docs: [],
  nav: [],
  credit: "Built by",
};

export default parish;
