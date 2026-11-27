import type { Testlet } from "./types";

/**
 * INTER Listening bank — 12 testlets (2 per CEFR level, A1–C2).
 * Audio is rendered in the browser with speech synthesis (v1). For production,
 * replace with studio recordings: drop files in /public/audio/{testletId}.mp3
 * and the player uses them automatically (see AudioPlayer).
 */
export const LISTENING: Testlet[] = [
  // ───────────────────────────── A1 ─────────────────────────────
  {
    id: "L-A1-01",
    skill: "listening",
    level: "A1",
    title: "At the reception",
    context: "Listen to a conversation at a language school. Answer the questions.",
    script: [
      { speaker: "Receptionist", voice: "f", text: "Good morning! Can I help you?" },
      { speaker: "Student", voice: "m", text: "Yes, please. I want to start an English class. My name is Daniel Pérez." },
      { speaker: "Receptionist", voice: "f", text: "Nice to meet you, Daniel. We have classes on Monday and Wednesday in the evening, at seven o'clock." },
      { speaker: "Student", voice: "m", text: "Seven o'clock is good. I finish work at six." },
      { speaker: "Receptionist", voice: "f", text: "Perfect. The class is in room twelve, on the second floor." },
    ],
    questions: [
      { id: "L-A1-01-1", prompt: "What does Daniel want?", options: ["A new job", "An English class", "A room in a hotel", "To meet a teacher"], answer: 1, offset: -0.3 },
      { id: "L-A1-01-2", prompt: "What time is the class?", options: ["6:00", "7:00", "12:00", "2:00"], answer: 1 },
      { id: "L-A1-01-3", prompt: "Where is the class?", options: ["Room 2, first floor", "Room 7, second floor", "Room 12, second floor", "Room 12, first floor"], answer: 2, offset: 0.2 },
    ],
  },
  {
    id: "L-A1-02",
    skill: "listening",
    level: "A1",
    title: "A voicemail",
    context: "Listen to a voicemail message. Answer the questions.",
    script: [
      {
        speaker: "Mónica",
        voice: "f",
        text: "Hi, Pedro, it's Mónica. I'm at the supermarket. Do we need milk? I have bread, eggs and rice. Oh, and it's your mother's birthday on Saturday, so I'm buying a cake. Call me back, please. Bye!",
      },
    ],
    questions: [
      { id: "L-A1-02-1", prompt: "Where is Mónica?", options: ["At home", "At work", "At the supermarket", "At a birthday party"], answer: 2, offset: -0.3 },
      { id: "L-A1-02-2", prompt: "What does Mónica ask Pedro?", options: ["If they need milk", "If he wants eggs", "Where his mother is", "What time it is"], answer: 0 },
      { id: "L-A1-02-3", prompt: "Why is she buying a cake?", options: ["It's Pedro's birthday", "It's his mother's birthday", "It's for a party at work", "Pedro asked for one"], answer: 1, offset: 0.2 },
    ],
  },
  // ───────────────────────────── A2 ─────────────────────────────
  {
    id: "L-A2-01",
    skill: "listening",
    level: "A2",
    title: "Changing a flight",
    context: "Listen to a phone call with an airline. Answer the questions.",
    script: [
      { speaker: "Agent", voice: "f", text: "Good afternoon, thank you for calling. How can I help you today?" },
      { speaker: "Customer", voice: "m", text: "Hi. I have a flight to Miami on Friday morning, but I need to change it. I have an important meeting on Friday." },
      { speaker: "Agent", voice: "f", text: "No problem. We have a flight on Saturday at ten fifteen in the morning, or on Sunday afternoon." },
      { speaker: "Customer", voice: "m", text: "Saturday is better. How much does it cost to change?" },
      { speaker: "Agent", voice: "f", text: "The change fee is fifty dollars. I'll send the new ticket to your email." },
    ],
    questions: [
      { id: "L-A2-01-1", prompt: "Why does the man want to change his flight?", options: ["He is sick", "He has a meeting on Friday", "The flight is too expensive", "He wants to stay longer in Miami"], answer: 1, offset: -0.2 },
      { id: "L-A2-01-2", prompt: "When is his new flight?", options: ["Friday morning", "Saturday morning", "Saturday afternoon", "Sunday afternoon"], answer: 1 },
      { id: "L-A2-01-3", prompt: "How will he receive the new ticket?", options: ["By email", "At the airport", "By text message", "By post"], answer: 0, offset: 0.2 },
    ],
  },
  {
    id: "L-A2-02",
    skill: "listening",
    level: "A2",
    title: "Weekend plans",
    context: "Listen to two friends talking. Answer the questions.",
    script: [
      { speaker: "Sara", voice: "f", text: "Hey Luis, what are you doing this weekend?" },
      { speaker: "Luis", voice: "m", text: "I wanted to go to the beach, but the weather forecast says it's going to rain all weekend." },
      { speaker: "Sara", voice: "f", text: "Oh no. Why don't we go to the cinema instead? There's a new comedy at the mall." },
      { speaker: "Luis", voice: "m", text: "Good idea. But not on Saturday — I'm helping my brother move to his new apartment. Is Sunday OK?" },
      { speaker: "Sara", voice: "f", text: "Sunday's perfect. Let's meet at five." },
    ],
    questions: [
      { id: "L-A2-02-1", prompt: "Why can't Luis go to the beach?", options: ["He has to work", "The weather will be bad", "The beach is closed", "His car is broken"], answer: 1, offset: -0.2 },
      { id: "L-A2-02-2", prompt: "What is Luis doing on Saturday?", options: ["Going to the cinema", "Studying", "Helping his brother move", "Visiting the mall"], answer: 2 },
      { id: "L-A2-02-3", prompt: "What do they decide?", options: ["Cinema on Sunday at five", "Beach on Sunday", "Cinema on Saturday at five", "Shopping on Saturday"], answer: 0, offset: 0.2 },
    ],
  },
  // ───────────────────────────── B1 ─────────────────────────────
  {
    id: "L-B1-01",
    skill: "listening",
    level: "B1",
    title: "Team meeting",
    context: "Listen to part of a team meeting. Answer the questions.",
    script: [
      { speaker: "Manager", voice: "f", text: "Okay everyone, quick update on the customer service project. Last month we received about three hundred complaints, and most of them were about long waiting times on the phone." },
      { speaker: "Manager", voice: "f", text: "So, starting next Monday, we're going to try something new. Customers will be able to choose a call-back option instead of waiting on the line. Someone from the team will call them back within two hours." },
      { speaker: "Employee", voice: "m", text: "Sounds good, but who's going to make the call-backs? We're already very busy." },
      { speaker: "Manager", voice: "f", text: "Good question. We're hiring two part-time assistants, and they'll start on the same day. If it works, we'll keep the system after the trial period of six weeks." },
    ],
    questions: [
      { id: "L-B1-01-1", prompt: "What were most complaints about?", options: ["Rude staff", "Waiting too long on the phone", "Wrong products", "High prices"], answer: 1, offset: -0.2 },
      { id: "L-B1-01-2", prompt: "What is the new idea?", options: ["Customers can ask to be called back", "Customers can send emails instead", "The office will open earlier", "Staff will work longer hours"], answer: 0 },
      { id: "L-B1-01-3", prompt: "What is the employee worried about?", options: ["The cost of the project", "The team doesn't have enough time", "Customers won't like it", "The trial is too short"], answer: 1, offset: 0.3 },
    ],
  },
  {
    id: "L-B1-02",
    skill: "listening",
    level: "B1",
    title: "Radio: volunteering",
    context: "Listen to part of a radio programme. Answer the questions.",
    script: [
      {
        speaker: "Presenter",
        voice: "m",
        text: "Today we're talking to Carmen, who started a reading programme for children in her neighbourhood. Carmen, how did it begin?",
      },
      {
        speaker: "Carmen",
        voice: "f",
        text: "Well, it was almost by accident. I used to read to my own kids on the balcony, and other children started coming over to listen. After a few weeks there were fifteen of them! So I asked the local library if they could lend us some books, and they said yes.",
      },
      {
        speaker: "Presenter",
        voice: "m",
        text: "And what's been the biggest challenge?",
      },
      {
        speaker: "Carmen",
        voice: "f",
        text: "Honestly, finding enough volunteers. Lots of people say they want to help, but when they realise it's every Saturday, they disappear. The ones who stay, though, are fantastic.",
      },
    ],
    questions: [
      { id: "L-B1-02-1", prompt: "How did the programme start?", options: ["The library asked Carmen to organise it", "Children came to listen while she read to her kids", "Carmen saw an advert for volunteers", "Her children's school asked for help"], answer: 1 },
      { id: "L-B1-02-2", prompt: "What did the library do?", options: ["Gave Carmen a job", "Lent books for the programme", "Found volunteers", "Offered a room"], answer: 1, offset: -0.2 },
      { id: "L-B1-02-3", prompt: "Why do some volunteers leave?", options: ["They don't like children", "They don't want to commit every week", "The programme is too far", "They aren't paid"], answer: 1, offset: 0.3 },
    ],
  },
  // ───────────────────────────── B2 ─────────────────────────────
  {
    id: "L-B2-01",
    skill: "listening",
    level: "B2",
    title: "Hotel complaint",
    context: "Listen to a conversation between a guest and a hotel manager. Answer the questions.",
    script: [
      { speaker: "Guest", voice: "f", text: "I'm sorry to bother you, but I'd like to speak to someone about my room. I specifically requested a quiet room when I booked, and I've been put right above the bar. I barely slept last night." },
      { speaker: "Manager", voice: "m", text: "I'm really sorry to hear that, madam. Unfortunately we're fully booked tonight because of the conference, so I can't move you straight away." },
      { speaker: "Guest", voice: "f", text: "That's not ideal. I'm here for work and I have a presentation tomorrow morning." },
      { speaker: "Manager", voice: "m", text: "I completely understand. What I can do is close the terrace section of the bar at eleven tonight instead of one, and tomorrow I'll move you to a room on the sixth floor. I'll also take tonight off your bill." },
      { speaker: "Guest", voice: "f", text: "Well, that's more than fair. Thank you." },
    ],
    questions: [
      { id: "L-B2-01-1", prompt: "Why is the guest unhappy?", options: ["The room is too small", "She didn't get the type of room she had asked for", "The bar is closed", "Her booking was cancelled"], answer: 1, offset: -0.2 },
      { id: "L-B2-01-2", prompt: "Why can't the manager change her room immediately?", options: ["The sixth floor is being repaired", "The hotel has no free rooms that night", "She needs to pay extra", "It's against hotel policy"], answer: 1 },
      { id: "L-B2-01-3", prompt: "How does the guest feel at the end?", options: ["Still very angry", "Satisfied with the solution", "Confused about her bill", "Worried about her presentation"], answer: 1, offset: 0.2 },
    ],
  },
  {
    id: "L-B2-02",
    skill: "listening",
    level: "B2",
    title: "Lecture: sleep and memory",
    context: "Listen to part of a talk. Answer the questions.",
    script: [
      {
        speaker: "Lecturer",
        voice: "m",
        text: "A lot of students believe that staying up all night before an exam is a sensible strategy — after all, more hours of study should mean more knowledge. But the evidence points in the opposite direction. During deep sleep, the brain replays and reorganises what we learned during the day, moving information from short-term into long-term memory.",
      },
      {
        speaker: "Lecturer",
        voice: "m",
        text: "In one study, two groups learned the same list of words. One group slept normally; the other stayed awake. When they were tested two days later — after both groups had had a full night's recovery sleep — the group that had missed the first night still remembered about forty percent less. In other words, the damage wasn't simply tiredness on the day of the test. The memories had never been properly stored in the first place.",
      },
    ],
    questions: [
      { id: "L-B2-02-1", prompt: "What happens during deep sleep, according to the speaker?", options: ["The brain rests completely", "The brain consolidates what was learned", "New information is deleted", "Short-term memory improves"], answer: 1, offset: -0.2 },
      { id: "L-B2-02-2", prompt: "Why were both groups allowed to sleep before the test?", options: ["To make the test fair", "To show that the problem was not just fatigue", "Because the test was in the evening", "Because the researchers were late"], answer: 1, offset: 0.3 },
      { id: "L-B2-02-3", prompt: "What is the speaker's main message?", options: ["Students should study more hours", "Losing sleep after learning prevents proper storage of memories", "Tests should be taken in the morning", "Memory cannot be improved"], answer: 1 },
    ],
  },
  // ───────────────────────────── C1 ─────────────────────────────
  {
    id: "L-C1-01",
    skill: "listening",
    level: "C1",
    title: "Panel: remote work",
    context: "Listen to part of a panel discussion. Answer the questions.",
    script: [
      { speaker: "Host", voice: "f", text: "Roberto, you've been fairly critical of fully remote teams. Why?" },
      {
        speaker: "Roberto",
        voice: "m",
        text: "I'd say sceptical rather than critical. Productivity, by most measures, holds up remarkably well. What worries me is something harder to quantify — the informal learning that happens when a junior colleague overhears how a senior one handles a difficult client. You don't schedule that; it just happens, and remote setups quietly remove it.",
      },
      { speaker: "Host", voice: "f", text: "Isn't that something good management can compensate for?" },
      {
        speaker: "Roberto",
        voice: "m",
        text: "To an extent, yes — mentoring programmes, shadowing calls and so on. But there's a risk of assuming that because we've replaced the formal elements, we've replaced everything. The costs tend to show up years later, when you realise your mid-level people never developed the judgement you took for granted.",
      },
    ],
    questions: [
      { id: "L-C1-01-1", prompt: "How does Roberto describe his position?", options: ["Strongly against remote work", "Doubtful rather than opposed", "Fully supportive", "Undecided because of lack of data"], answer: 1, offset: -0.2 },
      { id: "L-C1-01-2", prompt: "What is his main concern?", options: ["Lower productivity", "Loss of unplanned learning between colleagues", "Higher costs for companies", "Difficult clients"], answer: 1 },
      { id: "L-C1-01-3", prompt: "What does he suggest about mentoring programmes?", options: ["They fully solve the problem", "They help but may create a false sense that nothing is missing", "They are too expensive", "They should replace managers"], answer: 1, offset: 0.3 },
    ],
  },
  {
    id: "L-C1-02",
    skill: "listening",
    level: "C1",
    title: "Podcast: negotiation",
    context: "Listen to part of a podcast. Answer the questions.",
    script: [
      {
        speaker: "Host",
        voice: "f",
        text: "One of the most counter-intuitive findings in negotiation research concerns first offers. Conventional wisdom says you should let the other side name a number first, so you don't give anything away. Yet experiments repeatedly show that whoever makes the first offer tends to anchor the entire discussion — final agreements cluster around that initial figure, even when both parties know it's arbitrary.",
      },
      {
        speaker: "Host",
        voice: "f",
        text: "There's a caveat, though. Anchoring only works in your favour if you're reasonably well informed. Open with a figure that's wildly out of line with the market, and you don't anchor the other party — you simply lose credibility, and they may walk away altogether. So the lesson isn't 'always go first'; it's 'go first when you've done your homework.'",
      },
    ],
    questions: [
      { id: "L-C1-02-1", prompt: "What does conventional wisdom recommend?", options: ["Making the first offer", "Waiting for the other side to make the first offer", "Avoiding numbers altogether", "Offering a low price"], answer: 1, offset: -0.2 },
      { id: "L-C1-02-2", prompt: "What does research show about first offers?", options: ["They have little effect", "They strongly influence the final outcome", "They always lead to failure", "They are usually rejected"], answer: 1 },
      { id: "L-C1-02-3", prompt: "What is the speaker's final advice?", options: ["Always speak first", "Never speak first", "Make the first offer only if you are well prepared", "Make an extreme offer to gain an advantage"], answer: 2, offset: 0.3 },
    ],
  },
  // ───────────────────────────── C2 ─────────────────────────────
  {
    id: "L-C2-01",
    skill: "listening",
    level: "C2",
    title: "Talk: the measurement trap",
    context: "Listen to part of a talk. Answer the questions.",
    script: [
      {
        speaker: "Speaker",
        voice: "m",
        text: "There's an old adage in management that what gets measured gets managed. It's usually quoted approvingly, but I'd suggest it's at least as much a warning as a recommendation. The moment an indicator becomes a target, people quite rationally start optimising for the indicator rather than for whatever it was supposed to reflect.",
      },
      {
        speaker: "Speaker",
        voice: "m",
        text: "Hospitals judged on waiting times find ingenious ways to delay the official start of the wait. Schools judged on exam pass rates quietly steer weaker pupils away from the exams. None of this requires dishonesty, strictly speaking — merely an attentiveness to incentives. The point isn't that we should stop measuring; it's that any metric worth having should be treated as a question, not an answer.",
      },
    ],
    questions: [
      { id: "L-C2-01-1", prompt: "How does the speaker reinterpret the adage?", options: ["As outdated advice", "As something that also contains a caution", "As a rule that should be followed strictly", "As a misquotation"], answer: 1, offset: -0.2 },
      { id: "L-C2-01-2", prompt: "What do the hospital and school examples illustrate?", options: ["Widespread fraud in public services", "People adapting their behaviour to meet targets rather than real goals", "The failure of public institutions", "The need for more indicators"], answer: 1 },
      { id: "L-C2-01-3", prompt: "What does \"treated as a question, not an answer\" imply?", options: ["Metrics should prompt further investigation rather than be taken at face value", "Metrics should be abolished", "Metrics are always wrong", "Only experts should interpret metrics"], answer: 0, offset: 0.3 },
    ],
  },
  {
    id: "L-C2-02",
    skill: "listening",
    level: "C2",
    title: "Interview: an editor",
    context: "Listen to part of an interview with a book editor. Answer the questions.",
    script: [
      { speaker: "Interviewer", voice: "f", text: "You've said that your best editing is invisible. What do you mean by that?" },
      {
        speaker: "Editor",
        voice: "m",
        text: "Only that if a reader can detect my hand, I've probably overreached. The temptation — and it's a real one — is to make a manuscript sound more like the book I would have written. That's not editing; it's ventriloquism. My job is to help the author become more fully themselves on the page, which occasionally means defending choices I personally find a little odd.",
      },
      { speaker: "Interviewer", voice: "f", text: "Do authors always welcome that?" },
      {
        speaker: "Editor",
        voice: "m",
        text: "Not always, no. Some would quite like to be rescued from their own quirks. But I've learned to distinguish between a quirk that's a flaw and a quirk that's a signature. Sanding off the latter is the quickest way to make a distinctive book indistinguishable.",
      },
    ],
    questions: [
      { id: "L-C2-02-1", prompt: "What does the editor mean by \"ventriloquism\"?", options: ["Reading the book aloud", "Imposing his own voice on the author's text", "Translating the text", "Speaking on behalf of the publisher"], answer: 1 },
      { id: "L-C2-02-2", prompt: "How does he see his role?", options: ["Making the book commercially successful", "Helping authors express their own voice more fully", "Correcting all unusual choices", "Rewriting weak chapters"], answer: 1, offset: -0.2 },
      { id: "L-C2-02-3", prompt: "Which quirks does he try to preserve?", options: ["All of them", "Those that are genuine flaws", "Those that make the author's style distinctive", "Those the readers notice"], answer: 2, offset: 0.3 },
    ],
  },
];
