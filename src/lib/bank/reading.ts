import type { Testlet } from "./types";

/**
 * INTER Reading bank — 12 testlets (2 per CEFR level, A1–C2), 3 items each.
 * Original texts written for INTER. Difficulty = level centre + optional offset.
 */
export const READING: Testlet[] = [
  // ───────────────────────────── A1 ─────────────────────────────
  {
    id: "R-A1-01",
    skill: "reading",
    level: "A1",
    title: "A message from Laura",
    context: "Read the text message and answer the questions.",
    passage:
      "Hi Carlos! I'm at the café on Duarte Street. It's next to the bank. I have a table by the window. My phone has low battery, so please don't call. Just come in! I'm wearing a red jacket. See you at 4:30. — Laura",
    questions: [
      {
        id: "R-A1-01-1",
        prompt: "Where is Laura?",
        options: ["At the bank", "At a café", "At home", "On a bus"],
        answer: 1,
        offset: -0.3,
      },
      {
        id: "R-A1-01-2",
        prompt: "Why can't Carlos call Laura?",
        options: [
          "She is in a meeting",
          "Her phone has almost no battery",
          "She doesn't have a phone",
          "The café is very noisy",
        ],
        answer: 1,
      },
      {
        id: "R-A1-01-3",
        prompt: "How can Carlos find Laura?",
        options: [
          "She is standing outside",
          "She is wearing a red jacket",
          "She is sitting next to the door",
          "She is with a friend from the bank",
        ],
        answer: 1,
        offset: 0.2,
      },
    ],
  },
  {
    id: "R-A1-02",
    skill: "reading",
    level: "A1",
    title: "Sports Center notice",
    context: "Read the notice and answer the questions.",
    passage:
      "CITY SPORTS CENTER\n\nOpening hours: Monday to Friday, 6:00 a.m. – 9:00 p.m. Saturday, 8:00 a.m. – 2:00 p.m. Closed on Sundays.\n\nSwimming pool: adults only before 10:00 a.m.\nYoga classes: Tuesday and Thursday at 7:00 p.m.\nMonthly membership: RD$1,500. Students pay half price.",
    questions: [
      {
        id: "R-A1-02-1",
        prompt: "When is the Sports Center closed?",
        options: ["On Saturday", "On Sunday", "On Monday morning", "Every evening"],
        answer: 1,
        offset: -0.3,
      },
      {
        id: "R-A1-02-2",
        prompt: "How much does a student pay each month?",
        options: ["RD$1,500", "RD$3,000", "RD$750", "Nothing"],
        answer: 2,
        offset: 0.2,
      },
      {
        id: "R-A1-02-3",
        prompt: "A child wants to swim at 9:00 a.m. Is it possible?",
        options: [
          "Yes, the pool is open",
          "No, only adults can swim then",
          "Only on Sundays",
          "Only with a yoga class",
        ],
        answer: 1,
        offset: 0.3,
      },
    ],
  },
  // ───────────────────────────── A2 ─────────────────────────────
  {
    id: "R-A2-01",
    skill: "reading",
    level: "A2",
    title: "My first job",
    context: "Read the blog post and answer the questions.",
    passage:
      "When I was nineteen, I got my first job at a small hotel in Puerto Plata. I worked at the reception desk from Thursday to Sunday. At first I was very nervous because many guests spoke English and my English was not very good. My manager, Mrs. Taveras, gave me a notebook with useful phrases, and every night I practised them at home.\n\nAfter three months, I could answer the phone, explain the hotel services and help guests with taxis and tours. The job wasn't easy, but it changed my life. Today I work as an assistant manager in a bigger hotel in Santo Domingo.",
    questions: [
      {
        id: "R-A2-01-1",
        prompt: "Why was the writer nervous at the beginning?",
        options: [
          "The hotel was very big",
          "The manager was very strict",
          "He or she couldn't speak English well",
          "The work days were very long",
        ],
        answer: 2,
        offset: -0.2,
      },
      {
        id: "R-A2-01-2",
        prompt: "How did Mrs. Taveras help?",
        options: [
          "She paid for English classes",
          "She gave the writer a notebook of useful phrases",
          "She answered the phone for the writer",
          "She gave the writer more days off",
        ],
        answer: 1,
      },
      {
        id: "R-A2-01-3",
        prompt: "What is true about the writer now?",
        options: [
          "He or she still works in Puerto Plata",
          "He or she has a more important position",
          "He or she is a tour guide",
          "He or she doesn't work in hotels anymore",
        ],
        answer: 1,
        offset: 0.3,
      },
    ],
  },
  {
    id: "R-A2-02",
    skill: "reading",
    level: "A2",
    title: "Office email",
    context: "Read the email and answer the questions.",
    passage:
      "To: All staff\nSubject: Air conditioning repairs\n\nDear colleagues,\n\nTechnicians will repair the air conditioning on the second floor this Friday. Because of the noise, the second-floor meeting rooms will not be available all day. If you have a meeting on Friday, please book a room on the first floor before Wednesday. Staff who work on the second floor can work from home on Friday, but they must tell their supervisor by Thursday at noon.\n\nThank you for your patience,\nFacilities Department",
    questions: [
      {
        id: "R-A2-02-1",
        prompt: "What is the main purpose of the email?",
        options: [
          "To invite staff to a meeting",
          "To explain changes because of repairs",
          "To ask staff to repair the air conditioning",
          "To announce a new office",
        ],
        answer: 1,
        offset: -0.2,
      },
      {
        id: "R-A2-02-2",
        prompt: "What should you do if you have a meeting on Friday?",
        options: [
          "Cancel it",
          "Have it on the second floor",
          "Reserve a first-floor room before Wednesday",
          "Tell the technicians",
        ],
        answer: 2,
      },
      {
        id: "R-A2-02-3",
        prompt: "A second-floor employee wants to work from home. What must they do?",
        options: [
          "Inform their supervisor by Thursday noon",
          "Book a room by Wednesday",
          "Write to the Facilities Department on Friday",
          "Nothing — everyone works from home",
        ],
        answer: 0,
        offset: 0.2,
      },
    ],
  },
  // ───────────────────────────── B1 ─────────────────────────────
  {
    id: "R-B1-01",
    skill: "reading",
    level: "B1",
    title: "Learning on the move",
    context: "Read the article and answer the questions.",
    passage:
      "More and more adults are using their daily commute to learn new skills. According to a recent survey, almost a third of people who travel to work by public transport listen to podcasts or use language apps during the journey. Many say that short, regular sessions help them more than long classes at the weekend, which they often miss because of family commitments.\n\nHowever, experts warn that apps alone are rarely enough. \"You can learn a lot of vocabulary on the bus,\" says teacher trainer Ana Rosario, \"but real progress in speaking comes from interaction. Learners need someone who corrects them and pushes them to say things they couldn't say before.\" She recommends combining self-study with at least one live session a week.",
    questions: [
      {
        id: "R-B1-01-1",
        prompt: "Why do many commuters prefer short learning sessions?",
        options: [
          "They are cheaper than weekend classes",
          "They fit their routine better than long weekend classes",
          "Their employers require them",
          "They can't concentrate for long periods",
        ],
        answer: 1,
      },
      {
        id: "R-B1-01-2",
        prompt: "What is Ana Rosario's main point?",
        options: [
          "Apps are a waste of time",
          "Vocabulary is more important than speaking",
          "Self-study should be combined with live interaction",
          "Learners should study only at the weekend",
        ],
        answer: 2,
        offset: 0.2,
      },
      {
        id: "R-B1-01-3",
        prompt: "In the last paragraph, \"pushes them\" is closest in meaning to…",
        options: ["forces them to leave", "encourages them to go further", "makes them nervous", "gives them homework"],
        answer: 1,
        offset: 0.3,
      },
    ],
  },
  {
    id: "R-B1-02",
    skill: "reading",
    level: "B1",
    title: "Customer review",
    context: "Read the review and answer the questions.",
    passage:
      "I booked the \"Island Explorer\" tour after reading lots of positive comments online, and overall I wasn't disappointed. The guide, Miguel, was friendly and knew a lot about the history of the area. The boat trip was the highlight — the water was crystal clear and we saw dolphins.\n\nThat said, a few things could be improved. The bus picked us up forty minutes late, and nobody from the company explained why. Lunch was included, but there were no vegetarian options, even though I had mentioned this when I booked. I'd still recommend the tour, but I'd suggest calling the company to confirm any special requests.",
    questions: [
      {
        id: "R-B1-02-1",
        prompt: "What did the writer enjoy most?",
        options: ["The lunch", "The bus journey", "The boat trip", "The history lesson"],
        answer: 2,
        offset: -0.2,
      },
      {
        id: "R-B1-02-2",
        prompt: "What was the problem with the bus?",
        options: [
          "It was too small",
          "It arrived late and no reason was given",
          "It left without some passengers",
          "The driver was unfriendly",
        ],
        answer: 1,
      },
      {
        id: "R-B1-02-3",
        prompt: "What is the writer's overall opinion?",
        options: [
          "Positive, with some reservations",
          "Completely negative",
          "Neutral — the writer has no opinion",
          "Positive only about the food",
        ],
        answer: 0,
        offset: 0.3,
      },
    ],
  },
  // ───────────────────────────── B2 ─────────────────────────────
  {
    id: "R-B2-01",
    skill: "reading",
    level: "B2",
    title: "The four-day week",
    context: "Read the article and answer the questions.",
    passage:
      "When a mid-sized logistics firm announced it would trial a four-day working week with no reduction in pay, critics predicted chaos: missed deliveries, frustrated clients and staff struggling to fit five days of work into four. Six months later, the results have surprised even the company's own managers. Productivity, measured by orders processed per employee, rose by eight percent, while sick leave fell by almost a quarter.\n\nYet the company's director is careful not to oversell the experiment. \"It worked for us because we redesigned how we work, not just when we work,\" she explains. Meetings were cut to a maximum of thirty minutes, and teams agreed on \"focus hours\" during which internal messages were discouraged. Without those changes, she suspects, the extra day off would simply have produced exhausted employees and longer working days.",
    questions: [
      {
        id: "R-B2-01-1",
        prompt: "What did critics expect to happen?",
        options: [
          "Employees would ask for higher salaries",
          "The trial would cause serious operational problems",
          "Clients would prefer the new system",
          "Sick leave would decrease",
        ],
        answer: 1,
        offset: -0.2,
      },
      {
        id: "R-B2-01-2",
        prompt: "According to the director, why was the trial successful?",
        options: [
          "Staff worked longer hours on the remaining days",
          "The company hired additional employees",
          "Work processes were reorganised as well",
          "Clients were informed in advance",
        ],
        answer: 2,
      },
      {
        id: "R-B2-01-3",
        prompt: "The phrase \"careful not to oversell\" suggests that the director…",
        options: [
          "wants to sell the company",
          "does not want to exaggerate the benefits",
          "is disappointed with the results",
          "plans to end the experiment",
        ],
        answer: 1,
        offset: 0.3,
      },
    ],
  },
  {
    id: "R-B2-02",
    skill: "reading",
    level: "B2",
    title: "Citizen services go digital",
    context: "Read the report extract and answer the questions.",
    passage:
      "Over the past three years, the municipality has moved most of its citizen services online, from paying local taxes to requesting building permits. Officials point out that average waiting times have dropped from eleven days to four, and that offices are no longer overcrowded on Monday mornings.\n\nNevertheless, the transition has not benefited everyone equally. Residents over sixty-five, as well as those living in rural areas with unreliable internet access, report feeling excluded from a system that was meant to make their lives easier. In response, the council has opened \"digital help points\" staffed by trained volunteers, although critics argue that these are a temporary fix for what is essentially a problem of infrastructure.",
    questions: [
      {
        id: "R-B2-02-1",
        prompt: "Which benefit of the digital system is mentioned?",
        options: [
          "Lower local taxes",
          "Faster processing of requests",
          "More staff in the offices",
          "Free internet for all residents",
        ],
        answer: 1,
        offset: -0.2,
      },
      {
        id: "R-B2-02-2",
        prompt: "Who has found the change difficult?",
        options: [
          "Office staff working on Mondays",
          "Young people in the city centre",
          "Older and rural residents",
          "Volunteers at the help points",
        ],
        answer: 2,
      },
      {
        id: "R-B2-02-3",
        prompt: "What do critics think of the digital help points?",
        options: [
          "They solve the underlying problem",
          "They don't address the real cause",
          "They should be closed immediately",
          "They are too expensive to run",
        ],
        answer: 1,
        offset: 0.3,
      },
    ],
  },
  // ───────────────────────────── C1 ─────────────────────────────
  {
    id: "R-C1-01",
    skill: "reading",
    level: "C1",
    title: "The myth of multitasking",
    context: "Read the essay extract and answer the questions.",
    passage:
      "Few workplace virtues are celebrated as enthusiastically as the ability to multitask. Job advertisements routinely demand it, and many professionals wear their overflowing inboxes and simultaneous video calls as a badge of honour. The research, however, paints a decidedly less flattering picture. What we experience as doing several things at once is, for the most part, rapid switching between tasks — and each switch carries a cognitive cost that accumulates over the day.\n\nThe irony is that heavy multitaskers tend to be the worst at it. Studies consistently find that those who habitually juggle media streams are more easily distracted by irrelevant information, not less. Their confidence, it seems, is inversely related to their competence. None of this means that we should retreat into monastic isolation; rather, it suggests that organisations which genuinely value output would do well to protect their employees' attention as carefully as they protect their data.",
    questions: [
      {
        id: "R-C1-01-1",
        prompt: "According to the writer, what actually happens when people \"multitask\"?",
        options: [
          "They process tasks in parallel efficiently",
          "They alternate quickly between tasks at a cost",
          "They complete simple tasks automatically",
          "They delegate tasks to colleagues",
        ],
        answer: 1,
        offset: -0.2,
      },
      {
        id: "R-C1-01-2",
        prompt: "What is the \"irony\" the writer refers to?",
        options: [
          "Employers no longer value multitasking",
          "People who multitask most often are least skilled at it",
          "Multitasking improves confidence",
          "Research on multitasking is unreliable",
        ],
        answer: 1,
      },
      {
        id: "R-C1-01-3",
        prompt: "What does the writer recommend in the final sentence?",
        options: [
          "Employees should work in isolation",
          "Companies should invest more in data security",
          "Organisations should actively safeguard staff concentration",
          "Job adverts should stop mentioning skills",
        ],
        answer: 2,
        offset: 0.3,
      },
    ],
  },
  {
    id: "R-C1-02",
    skill: "reading",
    level: "C1",
    title: "Tourism and authenticity",
    context: "Read the opinion piece and answer the questions.",
    passage:
      "Travellers increasingly claim to want \"authentic\" experiences: to eat where locals eat, to stay in family-run guesthouses, to avoid anything that smells of mass tourism. It is a laudable instinct, but it rests on a curious assumption — that there exists a pure, unperformed version of a culture waiting to be discovered by the discerning visitor.\n\nIn reality, the moment a destination becomes desirable for its authenticity, that authenticity begins to be packaged. The fishermen's village is repainted in photogenic colours; the grandmother's recipe appears, slightly simplified, on a laminated menu. This is not necessarily a tragedy. Communities that adapt their traditions for visitors are exercising agency, often deliberately and profitably. The problem lies less in the performance than in the visitor's refusal to acknowledge it — a refusal that can render local people as scenery rather than as partners in an exchange.",
    questions: [
      {
        id: "R-C1-02-1",
        prompt: "What assumption does the writer question?",
        options: [
          "That mass tourism is harmful",
          "That an untouched, \"real\" culture exists for tourists to find",
          "That family-run guesthouses are cheaper",
          "That travellers prefer local food",
        ],
        answer: 1,
      },
      {
        id: "R-C1-02-2",
        prompt: "How does the writer view communities that adapt their traditions?",
        options: [
          "As victims of tourism",
          "As dishonest towards visitors",
          "As active decision-makers who may benefit",
          "As a threat to authentic culture",
        ],
        answer: 2,
        offset: 0.1,
      },
      {
        id: "R-C1-02-3",
        prompt: "According to the writer, what is the real problem?",
        options: [
          "Repainted villages look artificial",
          "Visitors ignore the fact that culture is being performed for them",
          "Menus simplify traditional recipes",
          "Local people refuse to work with tourists",
        ],
        answer: 1,
        offset: 0.3,
      },
    ],
  },
  // ───────────────────────────── C2 ─────────────────────────────
  {
    id: "R-C2-01",
    skill: "reading",
    level: "C2",
    title: "On expertise",
    context: "Read the extract and answer the questions.",
    passage:
      "It has become fashionable to lament the \"death of expertise\", as though the public's scepticism towards specialists were a symptom of collective intellectual decay. The diagnosis is not wholly without merit, but it tends to absolve experts themselves of any responsibility. A profession that speaks in impenetrable jargon, that conflates the provisional consensus of its field with settled truth, and that rarely concedes error in public should not be astonished when its pronouncements are met with a shrug.\n\nTrust, after all, is not owed; it is extended, and it is extended on the basis of a track record that the layperson can at least partially evaluate. To demand deference while declining to explain one's reasoning is to mistake authority for credibility. The remedy is neither populist contempt for knowledge nor technocratic condescension, but a more candid accounting of uncertainty — one that treats citizens as capable of grasping that \"we don't yet know\" is itself a form of expert knowledge.",
    questions: [
      {
        id: "R-C2-01-1",
        prompt: "What criticism does the writer make of those who lament the \"death of expertise\"?",
        options: [
          "They exaggerate the public's intelligence",
          "They overlook experts' own contribution to the problem",
          "They rely too heavily on jargon",
          "They deny that scepticism exists",
        ],
        answer: 1,
        offset: -0.2,
      },
      {
        id: "R-C2-01-2",
        prompt: "The phrase \"to mistake authority for credibility\" implies that…",
        options: [
          "having a position does not automatically earn people's belief",
          "credibility is more important than authority in politics",
          "experts should avoid positions of authority",
          "the public cannot distinguish between the two",
        ],
        answer: 0,
      },
      {
        id: "R-C2-01-3",
        prompt: "Which approach does the writer advocate?",
        options: [
          "Restoring deference to specialists",
          "Allowing citizens to make technical decisions",
          "Being more open about the limits of current knowledge",
          "Replacing experts with elected officials",
        ],
        answer: 2,
        offset: 0.2,
      },
    ],
  },
  {
    id: "R-C2-02",
    skill: "reading",
    level: "C2",
    title: "Translation",
    context: "Read the extract and answer the questions.",
    passage:
      "The perennial complaint that something is \"lost in translation\" presupposes a curiously static view of meaning — as if a text were a sealed vessel whose contents might leak during transport. Seasoned translators tend to describe their work rather differently: less as decanting than as re-composition, a negotiation in which every gain in fidelity to one dimension of the original — its rhythm, say — is purchased at the expense of another, such as its idiomatic ease.\n\nSeen in this light, the translator's choices are not failures of preservation but acts of interpretation, and they are no more regrettable than the interpretive choices any attentive reader makes. What is genuinely lost is perhaps only the illusion that there was ever a single, determinate meaning to lose. Paradoxically, it is often through comparing translations that readers come closest to apprehending what an original is doing.",
    questions: [
      {
        id: "R-C2-02-1",
        prompt: "What view of meaning does the writer reject?",
        options: [
          "That meaning is fixed and can simply be carried across intact",
          "That translators are interpreters",
          "That rhythm matters in translation",
          "That readers interpret texts",
        ],
        answer: 0,
        offset: -0.1,
      },
      {
        id: "R-C2-02-2",
        prompt: "According to the passage, translators see their work as…",
        options: [
          "a mechanical transfer of words",
          "a series of trade-offs between competing qualities of the text",
          "an impossible task that always fails",
          "less creative than writing",
        ],
        answer: 1,
      },
      {
        id: "R-C2-02-3",
        prompt: "What \"paradox\" does the writer point out at the end?",
        options: [
          "Translations are more popular than originals",
          "Comparing several translations can reveal the original more clearly",
          "Readers prefer texts with a single meaning",
          "Original texts are often poorly written",
        ],
        answer: 1,
        offset: 0.3,
      },
    ],
  },
];
