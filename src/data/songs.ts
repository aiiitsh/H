// French song lyrics as flashcards (Learn → French songs). One card per lyric line.
// To add a song, append to SONGS. To add a line, append to a song's cards:
// fr on the front; on the back the English meaning, what it means in the song, an optional note and the word-by-word breakdown.

export interface SongWord {
  fr: string
  en: string
}

export interface SongCard {
  fr: string
  en: string
  context?: string
  note?: string
  words: SongWord[]
}

export interface Song {
  id: string
  title: string
  artist: string
  cards: SongCard[]
}

export const SONGS: Song[] = [
  {
    id: 'khallini',
    title: 'Khallini',
    artist: "Willy L'ancien",
    cards: [
      {
        fr: "J'aimerais parler au moi d'avant",
        en: 'I’d like to talk to the me from before (my past self).',
        context: 'The singer misses who they used to be, or wants to give their younger self some advice. 💭',
        words: [
          { fr: "J'aimerais", en: 'I would like. It’s aimer (to like / love) in the conditional, a polite “I’d like”. Same as je voudrais.' },
          { fr: 'parler à', en: 'to talk to' },
          { fr: 'au', en: 'à + le. French always merges these two: je vais au cinéma.' },
          { fr: 'le moi', en: '“the me”. Here moi is used like a noun, meaning “myself” or “my self”.' },
          { fr: "d'avant", en: 'from before. Avant means before, and d’avant works like an adjective: le monde d’avant = the world from before.' },
        ],
      },
      {
        fr: "Le prévenir de ce qui l'attend",
        en: 'To warn him about what’s waiting for him.',
        context: 'It continues the last line: I’d like to talk to my past self… to warn him about what’s coming. 💭',
        note: 'It’s almost surely ce qui, not ce qu’il. They sound the same when sung!',
        words: [
          { fr: 'prévenir', en: 'to warn' },
          { fr: 'le prévenir', en: 'to warn him (le = the past self)' },
          { fr: 'de', en: 'about' },
          { fr: 'ce qui', en: 'what (the thing that)' },
          { fr: "l'attend", en: 'awaits him. From attendre, “to wait” but also “to await”: ce qui t’attend = what’s waiting for you.' },
        ],
      },
      {
        fr: "Ils vont pas rester les potos d'avant",
        en: 'They won’t stay the buddies from before.',
        context: 'Friends change and drift apart: the people around you won’t stay the same. 💭',
        note: 'Why just pas? The full written form is ne + verb + pas, but in everyday spoken French people almost always drop the ne.\n'
          + 'Written: Je ne sais pas → spoken: Je sais pas (J’sais pas, Chais pas).\n'
          + 'Written: Ils ne vont pas rester → spoken: Ils vont pas rester.\n'
          + 'The pas stays because it carries the “not”; the ne is short and unstressed, so it gets swallowed in fast speech. Songs, and rap especially, sound like real talk.\n'
          + 'Tip: understand both, but always keep the ne in writing and exams.',
        words: [
          { fr: 'Ils vont', en: 'they are going to. Aller + infinitive = the near future.' },
          { fr: 'pas', en: 'not (the ne is dropped in speech)' },
          { fr: 'rester', en: 'to stay / remain. Not “to rest”!' },
          { fr: 'les potos', en: 'buddies / homies, slang for les amis. One friend = un poto.' },
          { fr: "d'avant", en: 'from before, as in le moi d’avant.' },
        ],
      },
      {
        fr: 'Tu vas te détruire en bédavant',
        en: 'You’re going to destroy yourself smoking.',
        context: 'A warning to his past self: smoking weed will wreck him. 💭',
        note: 'En + -ant is the gérondif: it means “while” or “by” doing something. En mangeant = while eating.',
        words: [
          { fr: 'Tu vas', en: 'you are going to. Aller + infinitive = the near future.' },
          { fr: 'te détruire', en: 'to destroy yourself. Détruire = to destroy, te = yourself (reflexive).' },
          { fr: 'en bédavant', en: 'while / by smoking (the gérondif of bédaver).' },
          { fr: 'bédaver', en: 'slang for to smoke, usually weed. It comes from Romani and is common in French rap.' },
        ],
      },
      {
        fr: "J'veux une piscine de billets",
        en: 'I want a pool of bills.',
        context: 'A swimming pool full of cash: dreaming of being rich. 💸',
        note: 'J’veux = Je veux. The e of je gets swallowed in speech, like j’sais and j’suis.',
        words: [
          { fr: "J'veux", en: 'I want (je veux)' },
          { fr: 'une piscine', en: 'a swimming pool' },
          { fr: 'de', en: 'of / full of' },
          { fr: 'des billets', en: 'banknotes, bills. Un billet is also a ticket: un billet de train.' },
        ],
      },
      {
        fr: "Dedans faut pas que j'aie pied",
        en: 'Inside it, I mustn’t be able to touch the bottom.',
        context: 'Continues the pool of cash: it has to be so deep he can’t even stand. 💸',
        note: 'It’s spelled j’aie (subjunctive), not j’ai. They sound exactly the same.',
        words: [
          { fr: 'Dedans', en: 'inside (the pool)' },
          { fr: 'faut pas', en: 'mustn’t. Il ne faut pas, with il and ne dropped in speech.' },
          { fr: "que j'aie", en: 'that I have. Subjunctive of avoir, always used after il faut que.' },
          { fr: 'avoir pied', en: 'to touch the bottom in water. J’ai pas pied = I can’t touch the bottom / I’m out of my depth.' },
        ],
      },
      {
        fr: 'Le produit est colombien',
        en: 'The product is Colombian.',
        context: 'In rap, le produit is code for drugs, and Colombian hints at cocaine.',
        note: 'Nationality adjectives take no capital in French (un film français), but nouns for people do (un Colombien).',
        words: [
          { fr: 'le produit', en: 'the product. Rap slang for drugs.' },
          { fr: 'est', en: 'is (from être)' },
          { fr: 'colombien', en: 'Colombian' },
        ],
      },
      {
        fr: 'Mais le plug est antillais',
        en: 'But the plug is from the Antilles.',
        context: 'Pairs with the last line: the product comes from Colombia, but the dealer is from the French Caribbean.',
        note: 'Antillais is an adjective, so no capital, just like colombien.',
        words: [
          { fr: 'Mais', en: 'but' },
          { fr: 'le plug', en: 'the supplier / dealer. Borrowed from English rap slang: “the plug” = your connect.' },
          { fr: 'antillais', en: 'from the Antilles, the French Caribbean islands like Guadeloupe and Martinique.' },
        ],
      },
      {
        fr: "J'parle à ma [?]",
        en: 'I talk to my [?]',
        context: 'The last word can’t be made out (Genius doesn’t have it either), so we don’t know who he’s talking to. 🤷',
        note: 'Ma is feminine, so it’s a woman or a feminine noun: ma mère, ma meuf…',
        words: [
          { fr: "J'parle", en: 'I talk (je parle). The e gets swallowed again, like in j’veux.' },
          { fr: 'à ma…', en: 'to my…' },
        ],
      },
      {
        fr: 'Ça me voit comme un animal',
        en: 'They see me as an animal.',
        context: 'People look at him like he’s a beast, something wild and dangerous. 🐺',
        note: 'Ça normally means it / that, but in slang it can mean “they” or “those people”, said in a cold, dismissive way.',
        words: [
          { fr: 'ça', en: 'it / that. In slang: “they”, “those people”.' },
          { fr: 'me voit', en: 'sees me (from voir)' },
          { fr: 'comme', en: 'like, as' },
          { fr: 'un animal', en: 'an animal' },
        ],
      },
      {
        fr: "La plata est radicale, c'est que du business, y'a rien d'amical",
        en: 'Money is ruthless. It’s only business, there’s nothing friendly about it.',
        context: 'Where cash is involved, friendship disappears. 💸',
        note: 'Full proper form: Ce n’est que du business. Il n’y a rien d’amical.',
        words: [
          { fr: 'la plata', en: 'money. Spanish slang borrowed by French rap, like le plug.' },
          { fr: 'radicale', en: 'radical, here harsh or ruthless. Ends in -e because plata is feminine.' },
          { fr: "c'est que du business", en: 'it’s only business (ce n’est que…). Ne… que = only, and the ne is dropped again.' },
          { fr: "y'a", en: 'there is (il y a). In speech, il gets dropped.' },
          { fr: "rien d'amical", en: 'nothing friendly. Rien de + adjective: rien de nouveau = nothing new.' },
        ],
      },
      {
        fr: "L'humain j'l'ai laissé, il m'emboucane",
        en: 'Humans, I left them behind, they get on my nerves.',
        context: 'He’s turned away from people: they annoy him, so he leaves them behind.',
        note: 'L’humain is put first for emphasis, then repeated with l’ and il. Same pattern: Mon frère, je l’aime.',
        words: [
          { fr: "L'humain", en: 'people / humanity' },
          { fr: "j'l'ai laissé", en: 'I left it / them (je l’ai laissé). Laisser in the passé composé.' },
          { fr: "il m'emboucane", en: 'it annoys me. Rare slang; the everyday words are il m’énerve or il me saoule.' },
        ],
      },
      {
        fr: "Ils t'aiment bien une fois qu'tu cannes",
        en: 'They like you once you’re dead.',
        context: 'The bitter idea: people only show love after you die.',
        note: 'Aimer bien is softer than aimer: to like, not to love.',
        words: [
          { fr: "Ils t'aiment bien", en: 'they like you' },
          { fr: 'une fois que', en: 'once, as soon as' },
          { fr: "qu'tu", en: 'que tu, with the e swallowed' },
          { fr: 'canner', en: 'slang for “to die”. Standard: mourir. Other slang: crever.' },
        ],
      },
      {
        fr: "Ils m'ont enfermé pour quelques grammes",
        en: 'They locked me up for a few grams.',
        context: 'He went to prison over a small amount of drugs.',
        note: 'The lyric site writes Il, but it’s Ils (plural, “they”). They sound the same.',
        words: [
          { fr: "Ils m'ont", en: 'they have… me (plural, so Ils)' },
          { fr: 'enfermé', en: 'locked up. Enfermer in the passé composé: avoir + past participle.' },
          { fr: 'pour', en: 'for (giving the reason)' },
          { fr: 'quelques', en: 'a few' },
          { fr: 'des grammes', en: 'grams. In rap this almost always means drugs.' },
        ],
      },
      {
        fr: "C'est quand le procès d'Yahou-Netan",
        en: 'When’s the trial of Yahu-Netan?',
        context: 'Netanyahu’s name flipped around: when will Netanyahu be put on trial? A contrast with him being locked up for a few grams.',
        note: 'Flipping syllables is a rap wordplay trick, close to verlan (l’envers → verlan).',
        words: [
          { fr: "C'est quand…?", en: 'When is…? Casual; formal: Quand est-ce que…?' },
          { fr: 'le procès', en: 'the trial' },
          { fr: "d'Yahou-Netan", en: 'of Netanyahu, with the syllables flipped' },
        ],
      },
    ],
  },
  {
    id: 'coco-acai',
    title: 'Coco Açaï',
    artist: "Willy L'ancien",
    cards: [
      {
        fr: "Sous popo, le flash, c'est coco açaï",
        en: 'High on “popo”, the rush tastes like coconut-açaí. (Best guess, see the note.)',
        context: 'A party / getting-high line: whatever he’s on, the hit feels or tastes sweet and fruity, like a coconut-açaí drink. Coco may also wink at cocaine. 🥥🍇',
        note: 'Not 100% sure about this one: popo isn’t a slang word I can confirm. The next line brags about Piatella (hash), so sous most likely means “high on” here.\n'
          + 'Sous + a substance = “high on / under the influence of”: sous alcool, sous médocs.',
        words: [
          { fr: 'sous', en: 'under. With a substance it means “high on”: il est sous alcool = he’s under the influence of alcohol.' },
          { fr: 'popo', en: 'unclear here. Elsewhere it’s baby talk for poop, and borrowed from English it can mean the police. Neither fits well.' },
          { fr: 'le flash', en: 'the rush / hit of a drug or drink. Also a camera flash, and avoir un flash = to suddenly remember something.' },
          { fr: "c'est", en: 'it is. In speech it often comes with no article: c’est coco açaï = it’s (a) coconut-açaí (thing).' },
          { fr: 'coco', en: 'coconut (noix de coco). Slang: cocaine. Also a pet name: mon coco = my darling.' },
          { fr: 'açaï', en: 'açaí, the purple Brazilian berry. Said “a-sa-ï”: ç = s sound, ï = the i is said on its own.' },
        ],
      },
      {
        fr: "J'ai du Piatella, j'en veux pas d'ta caille",
        en: 'I’ve got Piatella, I don’t want your “caille”.',
        context: 'He’s bragging that he has top-quality hash, so he doesn’t need whatever you’re offering. 🍃',
        note: 'Piatella is a premium kind of hash. Caille is less clear: literally it means a quail (the bird), and ma caille is a pet name. Here it most likely means “your stuff”, your lower-quality product, but that’s a guess from context.\n'
          + 'J’en veux pas d’ta caille: the en and the de ta both point to the same thing. Spoken French often doubles it like this for emphasis. Proper: Je ne veux pas de ta caille.',
        words: [
          { fr: "J'ai du", en: 'I have some. Du = de + le, the “some” article: j’ai du pain = I have (some) bread.' },
          { fr: 'Piatella', en: 'a premium type of hash (pressed cannabis resin).' },
          { fr: "j'en veux pas", en: 'I don’t want any (of it). En = of it / some. Ne is dropped again.' },
          { fr: "d'ta", en: 'de ta, of your. After a negative, “some” becomes de: je veux du café → je veux pas de café.' },
          { fr: 'une caille', en: 'a quail. Slang meaning here is unclear, probably “your stuff”.' },
        ],
      },
      {
        fr: "Ils aiment l'odeur du fric, ont le nez plein de bails de (Mmh)",
        en: 'They love the smell of money, their noses are full of… stuff (mmh).',
        context: 'He says it twice. The “mmh” replaces a word he doesn’t say out loud. A nose full of something hints at cocaine, which ties back to coco. 💸👃',
        note: 'Ont is missing its ils: Ils aiment… (et ils) ont le nez plein. Rap drops repeated subjects to keep the rhythm.\n'
          + 'L’odeur du fric is a pun: money has a “smell”, and the nose is full of something else.',
        words: [
          { fr: "Ils aiment l'odeur", en: 'they love the smell. Une odeur = a smell.' },
          { fr: 'du fric', en: 'of money. Le fric = slang for money, like la plata or l’oseille.' },
          { fr: 'ont le nez plein de', en: '(they) have their nose full of. French uses le nez, not “their nose”, for body parts.' },
          { fr: 'des bails', en: 'stuff, things, deals, usually shady. Very common slang: c’est quoi ce bail ? = what’s this thing / what’s going on?' },
          { fr: '(Mmh)', en: 'a hum in place of the word he leaves out.' },
        ],
      },
      {
        fr: "J'ai la dégaine à Keyser Söze\nPas cramé, ils m'ont mis sur l'côté",
        en: 'I’ve got the look of Keyser Söze. They didn’t catch me, but they pushed me to the side.',
        context: 'Keyser Söze is the hidden crime boss in the film The Usual Suspects: he fools everyone by acting harmless and fake-limping. Willy has that look, and nobody saw through him, yet he still got sidelined. 🎬',
        note: 'La dégaine à Keyser = la dégaine de Keyser. Using à for “belonging to” is very common in speech (la voiture à mon père) but wrong in writing.',
        words: [
          { fr: 'la dégaine', en: 'someone’s look, the way they walk and carry themselves. Usually a bit odd or stylish.' },
          { fr: 'cramé', en: 'literally burnt. Slang: exposed, caught, spotted. T’es cramé ! = You’ve been caught!' },
          { fr: "ils m'ont mis", en: 'they put me (mettre in the passé composé)' },
          { fr: "sur l'côté", en: 'to the side, sidelined. Mettre quelqu’un sur le côté = to push someone aside.' },
        ],
      },
      {
        fr: "Maintenant, rien que ça m'propose des lovés\nNiquez-vous, c'est tout seul que j'me suis sauvé",
        en: 'Now they keep offering me cash. Screw you all, I saved myself on my own.',
        context: 'Now that he’s made it, people show up with money and deals. He rejects them: nobody helped him back then. 💸',
        note: 'C’est… que is a cleft sentence that puts a word in the spotlight: C’est tout seul que je me suis sauvé = It’s on my own that I saved myself.\nSe sauver also means to run away, so it can also be heard as “I got out on my own”.\nNiquez-vous is very vulgar. Understand it, don’t use it.',
        words: [
          { fr: 'rien que', en: 'nothing but, constantly. Here: “they do nothing but offer me…”' },
          { fr: 'ça', en: '“they / those people”, cold and dismissive, like in Khallini.' },
          { fr: "m'propose", en: 'offer me (me propose, with the e swallowed)' },
          { fr: 'des lovés', en: 'money, cash. From Romani, like bédaver.' },
          { fr: 'Niquez-vous', en: 'f*** you all (vulgar)' },
          { fr: 'tout seul', en: 'all alone, by myself' },
          { fr: "j'me suis sauvé", en: 'I saved myself / I got away (se sauver, passé composé with être).' },
        ],
      },
      {
        fr: "Je garde tout à l'intérieur, quelques humains m'ont déçu\nJe trace mon chemin, peu importe ce qui se trouve dessus",
        en: 'I keep everything inside, a few people let me down. I make my own way, whatever’s on it.',
        context: 'The pre-chorus: he’s been hurt, so he keeps his feelings to himself and keeps moving forward no matter what. 💭',
        note: 'False friend: décevoir means to disappoint, NOT to deceive (that’s tromper). Tu m’as déçu = You disappointed me.',
        words: [
          { fr: 'je garde tout', en: 'I keep everything (garder = to keep)' },
          { fr: "à l'intérieur", en: 'inside' },
          { fr: "quelques humains m'ont déçu", en: 'a few people disappointed me (décevoir → déçu)' },
          { fr: 'je trace mon chemin', en: 'I make my own way. Tracer = to draw a line; slang: to go fast.' },
          { fr: 'peu importe', en: 'no matter, whatever. Peu importe ce que tu dis = whatever you say.' },
          { fr: 'ce qui se trouve dessus', en: 'what’s on it. Se trouver = to be found / to be located; dessus = on it.' },
        ],
      },
      {
        fr: "Pour toi, j'suis prêt à tout",
        en: 'For you, I’m ready to do anything.',
        context: 'The chorus, repeated four times. ❤️',
        note: 'Prêt à + infinitive = ready to do something: prêt à partir = ready to leave. Prêt à tout = ready for anything / willing to do anything.',
        words: [
          { fr: 'pour toi', en: 'for you' },
          { fr: "j'suis", en: 'I am (je suis). Often sounds like “chui”.' },
          { fr: 'prêt à tout', en: 'ready to do anything. Feminine: prête à tout.' },
        ],
      },
      {
        fr: "C'est Willy la moulaga\nLes gitans passent, les chiens aboient",
        en: 'It’s Willy “la moulaga”. The Gypsies pass by, the dogs bark.',
        context: 'He introduces himself, then twists a famous proverb to say haters can bark all they want, he keeps going. 🐕',
        note: 'The proverb is Les chiens aboient, la caravane passe = the dogs bark, the caravan moves on (ignore the haters). He swaps la caravane for les gitans, the Romani people famous for travelling in caravans.\nMoulaga isn’t a word I can confirm. It probably comes from la moula (money, from English “moolah”), so something like “Willy the money-maker”, but that’s a guess.',
        words: [
          { fr: 'la moulaga', en: 'a nickname, probably from la moula = money (unsure).' },
          { fr: 'les gitans', en: 'the Gitans, Romani people in France and Spain. Bédaver and lovés both come from their language.' },
          { fr: 'passent', en: 'pass by (passer)' },
          { fr: 'les chiens aboient', en: 'the dogs bark (aboyer)' },
        ],
      },
      {
        fr: "On est prêt, ramène nous tes gars\nÉchec, échec",
        en: 'We’re ready, bring us your guys. Check, check.',
        context: 'A challenge: send your crew, we’re waiting. Échec is “check” in chess, as in he has you trapped. ♟️',
        note: 'On est = we are. In speech on almost always replaces nous.\nÉchec also means failure. Échec et mat = checkmate.',
        words: [
          { fr: 'on est prêt', en: 'we’re ready (on = we)' },
          { fr: 'ramène-nous', en: 'bring us (ramener, imperative). In writing it takes a hyphen.' },
          { fr: 'tes gars', en: 'your guys, your crew. Un gars = a guy (the s is silent).' },
          { fr: 'échec', en: 'check (chess); also failure.' },
        ],
      },
      {
        fr: "J'ai sali les Botega\nJe compte plus les kills, comme Gotaga",
        en: 'I got my Bottegas dirty. I don’t count the kills anymore, like Gotaga.',
        context: 'Bottega Veneta is an Italian luxury brand: he wears expensive shoes or bags even when doing dirty work. Gotaga is a famous French gamer and streamer, known for racking up kills in Call of Duty. 🎮',
        note: 'Je compte plus = je ne compte plus. Ne… plus = no longer / not anymore, with the ne dropped again.',
        words: [
          { fr: "j'ai sali", en: 'I dirtied (salir = to make dirty; sale = dirty)' },
          { fr: 'les Botega', en: 'Bottega Veneta items (luxury shoes / bags)' },
          { fr: 'je compte plus', en: 'I don’t count anymore (compter = to count)' },
          { fr: 'les kills', en: 'kills, gaming English used in French' },
          { fr: 'comme', en: 'like' },
        ],
      },
      {
        fr: "Toujours mon 9, et un bout d'taga\nÉchec, échec",
        en: 'Always my 9, and a piece of “taga”. Check, check.',
        context: 'Mon 9 is a 9 mm pistol. Taga isn’t a word I can confirm: un bout de (a piece of) is how people talk about hash, so it’s probably that, but that’s a guess.',
        note: 'Un bout de = a piece / bit of: un bout de pain = a piece of bread.',
        words: [
          { fr: 'toujours', en: 'always / still' },
          { fr: 'mon 9', en: 'my nine, a 9 mm pistol' },
          { fr: "un bout d'", en: 'a piece of' },
          { fr: 'taga', en: 'unclear, probably hash (guess from context)' },
        ],
      },
    ],
  },
]
