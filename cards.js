const GAME_DATA = {
  regions: [
    "Europe",
    "East Asia",
    "Middle East",
    "Africa",
    "Latin America",
    "Non-Aligned World"
  ],

  initialInfluence: {
    "Europe": { US: 3, USSR: 3 },
    "East Asia": { US: 2, USSR: 3 },
    "Middle East": { US: 2, USSR: 2 },
    "Africa": { US: 1, USSR: 1 },
    "Latin America": { US: 2, USSR: 1 },
    "Non-Aligned World": { US: 1, USSR: 2 }
  },

  decklist: [
    {
      id: "basic-economic-aid",
      name: "Economic Aid",
      type: "Basic",
      count: 4,
      effect: "Add +1 influence to two different regions.",
      flavor: "Where wealth arrives, influence takes root.",
      targets: 2,
      rules: "twoDifferentPlusOne"
    },
    {
      id: "basic-political-support",
      name: "Political Support",
      type: "Basic",
      count: 4,
      effect: "Add +2 influence to one uncontrolled region.",
      flavor: "A regime is often stabilized by recognition from abroad.",
      targets: 1,
      rules: "uncontrolledPlusTwo"
    },
    {
      id: "basic-military-assistance",
      name: "Military Assistance",
      type: "Basic",
      count: 3,
      effect: "Add +2 influence to one region where you trail by 1 or 2.",
      flavor: "Weapons are never neutral; they always point toward someone’s future.",
      targets: 1,
      rules: "trailByTwoPlusTwo"
    },
    {
      id: "basic-propaganda-drive",
      name: "Propaganda Campaign",
      type: "Basic",
      count: 8,
      effect: "Either gain +1 influence in one region or reduce opponent by 1 in one region.",
      flavor: "Whoever controls the narrative wins hearts before borders.",
      targets: 1,
      mode: true,
      rules: "selfPlusOneOrOppMinusOne"
    },
    {
      id: "basic-sanctions",
      name: "Sanctions",
      type: "Basic",
      count: 6,
      effect: "Reduce opponent by 2 in one controlled region; if that region is dominated, reduce by 1 instead.",
      flavor: "A war without blood can still suffocate a nation.",
      targets: 1,
      rules: "controlledRegionSanctions"
    },
    {
      id: "basic-diplomatic-tour",
      name: "Diplomatic Tour",
      type: "Basic",
      count: 3,
      effect: "Add +1 influence to three different regions.",
      flavor: "Borders stay on maps, but loyalties can be rewritten.",
      targets: 3,
      rules: "threeDifferentPlusOne"
    },

    /* 事件牌 */
    {
      id: "event-un-veto",
      name: "UN Veto",
      type: "Event",
      count: 2,
      effect: "Reaction card: when the opponent plays an event card, you may cancel it. Both cards go to the discard pile.",
      flavor: "At times, a single objection weighs more than an army.",
      targets: 0,
      rules: "vetoResponse"
    },
    {
      id: "event-yalta",
      name: "Yalta Conference",
      type: "Event",
      count: 1,
      effect: "Both sides gain +1 in Europe, then you gain +1 in Europe or the Non-Aligned World.",
      flavor: "The war was not yet over, yet the lines of peace were already being drawn.",
      targets: 1,
      rules: "yalta"
    },
    {
      id: "event-truman",
      name: "Truman Doctrine",
      type: "Event",
      count: 2,
      effect: "Gain +2 in Europe or the Middle East; if the opponent controls that region, gain +3 instead.",
      flavor: "Once containment begins, it rarely chooses to end.",
      targets: 1,
      rules: "trumanDoctrine"
    },
    {
      id: "event-marshall",
      name: "Marshall Plan",
      type: "Event",
      count: 2,
      effect: "Gain +2 in Europe, then +1 in one other region.",
      flavor: "Rebuilding is not charity; it is an investment in order.",
      targets: 1,
      rules: "marshallPlan"
    },
    {
      id: "event-nato",
      name: "NATO",
      type: "Event",
      count: 2,
      effect: "Gain +2 in Europe.",
      flavor: "A threat to one state is soon declared a threat to many.",
      targets: 0,
      rules: "nato"
    },
    {
      id: "event-warsaw",
      name: "Warsaw Pact",
      type: "Event",
      count: 2,
      effect: "Gain +2 in Europe; if you control Europe, also gain +1 in East Asia.",
      flavor: "An alliance is both a promise and a chain that binds retreat.",
      targets: 0,
      rules: "warsawPact"
    },
    {
      id: "event-nam",
      name: "Non-Aligned Movement",
      type: "Event",
      count: 1,
      effect: "Gain +2 in the Non-Aligned World; if either side controls it, both sides lose 1 there first.",
      flavor: "Not every nation is willing to bow between two banners.",
      targets: 0,
      rules: "nonAlignedMovement"
    },
    {
      id: "event-arms",
      name: "Arms Race",
      type: "Event",
      count: 1,
      effect: "Gain +1 in two different regions, then one of those regions gains another +1. Your opponent draws 1 card.",
      flavor: "When fear becomes institutional, peace depends on balance alone.",
      targets: 2,
      rules: "armsRace"
    },
    {
      id: "event-berlin",
      name: "Berlin Wall",
      type: "Event",
      count: 1,
      effect: "Gain +1 in Europe.",
      flavor: "A wall may divide land, but never truly divide an age.",
      targets: 0,
      rules: "berlinWall"
    },
    {
      id: "event-brink",
      name: "Brinkmanship",
      type: "Event",
      count: 2,
      effect: "Reduce opponent by 2 in one controlled region; if that region is dominated, reduce by 1 instead.",
      flavor: "To stand at the edge is itself a form of power.",
      targets: 1,
      rules: "brinkmanship"
    },
    {
      id: "event-castro",
      name: "Castro Revolution",
      type: "Event",
      count: 1,
      effect: "Gain +3 in Latin America; if the opponent has 4 or more there, they lose 1 more.",
      flavor: "The turn of a single island can unsettle the entire world.",
      targets: 0,
      rules: "castroRevolution"
    },
    {
      id: "event-bay",
      name: "Bay of Pigs",
      type: "Event",
      count: 1,
      effect: "Reduce opponent by 2 in Latin America; if you trail there, gain +1 there.",
      flavor: "A failed operation may expose an age more than a victory ever could.",
      targets: 0,
      rules: "bayOfPigs"
    },
    {
      id: "event-civilian",
      name: "Civilian Aid",
      type: "Event",
      count: 1,
      effect: "Gain +1 in two different regions among Africa, the Middle East, and the Non-Aligned World.",
      flavor: "When aid reaches daily life, influence reaches institutions.",
      targets: 2,
      rules: "civilianAid"
    },
    {
      id: "event-technical",
      name: "Technical Assistance",
      type: "Event",
      count: 1,
      effect: "Gain +3 in one uncontrolled region, or in one region where you trail by up to 3.",
      flavor: "The flow of knowledge eventually becomes the flow of power.",
      targets: 1,
      rules: "technicalAssistance"
    },
    {
      id: "event-kgb",
      name: "KGB Operation",
      type: "Event",
      count: 2,
      effect: "Reduce opponent by 1 in two different regions.",
      flavor: "The most dangerous weapons between states often leave no sound at all.",
      targets: 2,
      rules: "kgbOperations"
    },
    {
      id: "event-thaw",
      name: "Khrushchev Thaw",
      type: "Event",
      count: 1,
      effect: "Gain +2 in Europe or East Asia, then draw 1 card.",
      flavor: "The slightest thaw does not mean winter has passed.",
      targets: 1,
      rules: "khrushchevThaw"
    },
    {
      id: "event-prague",
      name: "Prague Spring",
      type: "Event",
      count: 2,
      effect: "Reduce opponent by 2 in Europe or the Non-Aligned World; if they dominate that region, reduce by 1 and you gain +1 there instead.",
      flavor: "Once freedom is spoken aloud, order begins to tremble.",
      targets: 1,
      rules: "pragueSpring"
    },
    {
      id: "event-detente",
      name: "Détente",
      type: "Event",
      count: 2,
      effect: "Both sides draw 1 card, then you gain +1 in any region.",
      flavor: "Conflict can pause, but suspicion does not disappear at once.",
      targets: 1,
      rules: "detente"
    },
    {
      id: "event-salt",
      name: "SALT I",
      type: "Event",
      count: 1,
      effect: "Gain +1 in any region.",
      flavor: "When destruction becomes real enough, restraint becomes proof of reason.",
      targets: 1,
      rules: "saltI"
    },
    {
      id: "event-reagan-thatcher",
      name: "Reagan-Thatcher Alliance",
      type: "Event",
      count: 1,
      effect: "Gain +2 in Europe; if you control Europe, gain +1 in one other region.",
      flavor: "A steadfast alliance echoes louder than isolated resolve.",
      targets: 1,
      rules: "reaganThatcher"
    },

    /* 间谍牌 */
    {
      id: "spy-sabotage",
      name: "Sabotage",
      type: "Spy",
      count: 6,
      effect: "Reduce opponent by 2 in one region where the influence gap is 4 or less.",
      flavor: "A single fracture may weaken the foundations of an empire.",
      targets: 1,
      rules: "sabotage"
    },
    {
      id: "spy-coup",
      name: "Coup Support",
      type: "Spy",
      count: 5,
      effect: "In one region where the influence gap is 2 or less, gain +2 and the opponent loses 1.",
      flavor: "A government may fall by an order given in shadow.",
      targets: 1,
      rules: "coupOperation"
    },
    {
      id: "spy-intel",
      name: "Intelligence Leak",
      type: "Spy",
      count: 2,
      effect: "Discard one event card from the opponent’s hand. If none exist, draw 1 card.",
      flavor: "Once a secret leaves the archive, it becomes a new force.",
      targets: 0,
      rules: "intelligenceLeak"
    },
    {
      id: "spy-scandal",
      name: "Scandal Exposure",
      type: "Spy",
      count: 5,
      effect: "In one uncontrolled region, the opponent loses 1 and you gain 1.",
      flavor: "Reputation often collapses faster than a regime.",
      targets: 1,
      rules: "scandalExposure"
    }
  ]
};