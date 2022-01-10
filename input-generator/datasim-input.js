
/**
 * @typedef {Object} IdentifiableObject
 * @property {string} id
 */

/**
 * @typedef {Object} StatementRule
 * @property {string} location
 * @property {('included' | 'excluded' | 'recommended')} presence
 * @property {string} [selector]
 */

// -------------------------------------------------------------------------------------------------
// ProfileGenerator

class ProfileGenerator {
  // -----------------------------------------------------------------------------------------------
  // constructor

  constructor() {
    this.id = 'http://profile.test/lecture';

    this.general = {
      '@context': 'https://w3id.org/xapi/profiles/context',
      id: this.id,
      type: 'Profile',
      conformsTo: 'https://w3id.org/xapi/profiles#1.0',
      prefLabel: {
        en: 'Test Profile'
      },
      definition: {
        en: 'A profile to test DATASIM.'
      },
      author: {
        type: 'Person',
        name: 'Test Profile Creator'
      },
      versions: [
        {
          id: this.createId('v1.0'),
          generatedAtTime: '2012-06-10T00:00:00Z'
        }
      ],
    };

    this.concepts = [];
    this.templates = [];
    this.patterns = [];
  }

  // -----------------------------------------------------------------------------------------------
  // methods

  /**
   * @param {string} relativePart
   *
   * @returns {string}
   */
  createId(relativePart) {
    return `${this.id}/${relativePart}`;
  }

  /**
   * @param {string} relativePart
   *
   * @returns {string}
   */
  createPatternId(relativePart) {
    return this.createId(`patterns/${relativePart}`);
  }

  getCompleteProfile() {
    return {
      ...this.general,
      concepts: this.concepts,
      templates: this.templates,
      patterns: this.patterns,
    };
  }

  /**
   * @param {string} verb
   * @param {string} namespace
   * @param {string} definition
   *
   * @returns {IdentifiableObject}
   */
  addVerb(verb, namespace, definition) {
    const verbObj = {
      id: this.createId(`verbs/${namespace}/${verb}`),
      inScheme: this.general.versions[0].id,
      type: "Verb",
      definition: {
        en: definition
      },
      prefLabel: {
        en: verb
      }
    };

    this.concepts.push(verbObj);

    return verbObj;
  }

  /**
   * @param {string} activity
   * @param {string} definition
   *
   * @returns {IdentifiableObject}
   */
  addActivity(activity, definition) {
    const activityObj = {
      id: this.createId(`activities/${activity}`),
      inScheme: this.general.versions[0].id,
      type: "ActivityType",
      definition: {
        en: definition
      },
      prefLabel: {
        en: activity
      }
    };

    this.concepts.push(activityObj);

    return activityObj;
  }

  /**
   * @param {Object} input
   * @param {string} input.id
   * @param {string} [input.definition]
   * @param {string} [input.verb]
   * @param {string} [input.objectActivityType]
   * @param {StatementRule[]} [input.rules]
   *
   * @returns {IdentifiableObject}
   */
  addStatementTemplate(input) {
    const template = {
      id: this.createId(`templates/${input.id}`),
      type: 'StatementTemplate',
      inScheme: this.general.id,
      prefLabel: {
        en: input.id,
      },
      definition: {
        en: input.definition || input.id,
      },
      verb: input.verb,
      objectActivityType: input.objectActivityType,
      rules: input.rules,
    };

    this.templates.push(template);

    return template;
  }

  /**
   * @param {Object} input
   * @param {string} input.id
   * @param {string} [input.definition]
   * @param {boolean} [input.primary]
   * @param {string[]} [input.alternates]
   * @param {string} [input.optional]
   * @param {string} [input.oneOrMore]
   * @param {string[]} [input.sequence]
   * @param {string} [input.zeroOrMore]
   *
   * @returns {IdentifiableObject}
   */
  addPattern(input) {
    const pattern = {
      id: this.createPatternId(input.id),
      type: 'Pattern',
      prefLabel: {
        en: input.id
      },
      definition: {
        en: input.definition || input.id,
      },
      inScheme: this.general.id,
      primary: input.primary,
      alternates: input.alternates,
      optional: input.optional,
      oneOrMore: input.oneOrMore,
      sequence: input.sequence,
      zeroOrMore: input.zeroOrMore,
    };

    this.patterns.push(pattern);

    return pattern;
  }

  /**
   * @param {Object} input
   * @param {string} input.id
   * @param {string[]} input.sequence
   *
   * @returns {{ required: IdentifiableObject optional: IdentifiableObject }}
   */
  addRequiredAndOptionalSequencePattern(input) {
    const requiredPattern = this.addPattern({
      id: input.id,
      sequence: input.sequence,
    });

    const optionalPattern = this.addPattern({
      id: `optional-${input.id}`,
      optional: requiredPattern.id,
    });

    return {
      required: requiredPattern,
      optional: optionalPattern,
    };
  }

  /**
   * @param {Object} input
   * @param {string} input.id
   * @param {string[]} input.sequence
   *
   * @returns {{ required: IdentifiableObject zeroOrMore: IdentifiableObject }}
   */
  addRequiredAndZeroOrMoreSequencePattern(input) {
    const requiredPattern = this.addPattern({
      id: input.id,
      sequence: input.sequence,
    });

    const zeroOrMorePattern = this.addPattern({
      id: `zero-or-more-${input.id}`,
      zeroOrMore: requiredPattern.id,
    });

    return {
      required: requiredPattern,
      zeroOrMore: zeroOrMorePattern,
    };
  }
}

// -------------------------------------------------------------------------------------------------
// generate profile

const profileGenerator = new ProfileGenerator();

// -------------------------------------------------------------------------------------------------
// verbs

// lecture material

const downloadedMaterialVerb = profileGenerator.addVerb('downloaded', 'material', 'Downloaded lecture material.');

// lecture video

const playedVideoVerb = profileGenerator.addVerb('played', 'video', 'Played a lecture video.');
const pausedVideoVerb = profileGenerator.addVerb('paused', 'video', 'Paused a playing lecture video.');
const continuedVideoVerb = profileGenerator.addVerb('continued', 'video', 'Continued playing a paused lecture video.');
// const jumpedVideoVerb = profileGenerator.addVerb('jumped', 'video', 'Jumped to a specific position in a lecture video.');
const completedVideoVerb = profileGenerator.addVerb('completed', 'video', 'Completed playing a lecture video.');
// const abortedVideoVerb = profileGenerator.addVerb('aborted', 'video', 'Aborted playing a lecture video.');

// lecture test

const startedTestVerb = profileGenerator.addVerb('started', 'test', 'Started working on a lecture test.');
const pausedTestVerb = profileGenerator.addVerb('paused', 'test', 'Paused working on a lecture test.');
const continuedTestVerb = profileGenerator.addVerb('continued', 'test', 'Continued a stopped lecture test.');
const completedTestVerb = profileGenerator.addVerb('completed', 'test', 'Successfully completed a lecture test.');
const failedTestVerb = profileGenerator.addVerb('failed', 'test', 'Failed a lecture test.');
const abortedTestVerb = profileGenerator.addVerb('aborted', 'test', 'Aborted a lecture test.');

// lecture test checkbox

// const selectedTestCheckboxVerb = profileGenerator.addVerb('selected', 'test-checkbox', 'Selected a checkbox in a lecture test.');
// const deselectedTestCheckboxVerb = profileGenerator.addVerb('deselected', 'test-checkbox', 'Deselected a checkbox in a lecture test.');

// -------------------------------------------------------------------------------------------------
// activities

const materialActivity = profileGenerator.addActivity('material', 'Material of a lecture.');
const videoActivity = profileGenerator.addActivity('video', 'Video of a lecture.');
const testActivity = profileGenerator.addActivity('test/', 'Test of a lecture.');
// const testCheckboxActivity = profileGenerator.addActivity('test-checkbox', 'Checkbox of a test of a lecture.');

// -------------------------------------------------------------------------------------------------
// statement templates

const generalTemplate = profileGenerator.addStatementTemplate({
  id: 'general',
  rules: [
    {
      location: '$.id',
      presence: 'included',
    },
    {
      location: '$.timestamp',
      presence: 'included',
    },
  ],
});

// lecture material

const downloadedMaterialTemplate = profileGenerator.addStatementTemplate({
  id: 'downloaded-material',
  verb: downloadedMaterialVerb.id,
  objectActivityType: materialActivity.id,
});

// lecture video

const playedVideoTemplate = profileGenerator.addStatementTemplate({
  id: 'played-video',
  verb: playedVideoVerb.id,
  objectActivityType: videoActivity.id,
});

const pausedVideoTemplate = profileGenerator.addStatementTemplate({
  id: 'paused-video',
  verb: pausedVideoVerb.id,
  objectActivityType: videoActivity.id,
});

const continuedVideoTemplate = profileGenerator.addStatementTemplate({
  id: 'continued-video',
  verb: continuedVideoVerb.id,
  objectActivityType: videoActivity.id,
});

/* const jumpedVideoTemplate = profileGenerator.addStatementTemplate({
  id: 'jumped-video',
  verb: jumpedVideoVerb.id,
  objectActivityType: videoActivity.id,
}); */

const completedVideoTemplate = profileGenerator.addStatementTemplate({
  id: 'completed-video',
  verb: completedVideoVerb.id,
  objectActivityType: videoActivity.id,
});

// lecture test

const startedTestTemplate = profileGenerator.addStatementTemplate({
  id: 'started-test',
  verb: startedTestVerb.id,
  objectActivityType: testActivity.id,
});

const pausedTestTemplate = profileGenerator.addStatementTemplate({
  id: 'paused-test',
  verb: pausedTestVerb.id,
  objectActivityType: testActivity.id,
});

const continuedTestTemplate = profileGenerator.addStatementTemplate({
  id: 'continued-test',
  verb: continuedTestVerb.id,
  objectActivityType: testActivity.id,
});

const completedTestTemplate = profileGenerator.addStatementTemplate({
  id: 'completed-test',
  verb: completedTestVerb.id,
  objectActivityType: testActivity.id,
});

const failedTestTemplate = profileGenerator.addStatementTemplate({
  id: 'failed-test',
  verb: failedTestVerb.id,
  objectActivityType: testActivity.id,
});

const abortedTestTemplate = profileGenerator.addStatementTemplate({
  id: 'aborted-test',
  verb: abortedTestVerb.id,
  objectActivityType: testActivity.id,
});

// -------------------------------------------------------------------------------------------------
// patterns

// lecture video

const videoPauseAndContinuePattern = profileGenerator.addRequiredAndZeroOrMoreSequencePattern({
  id: 'video-pause-and-continue',
  sequence: [
    pausedVideoTemplate.id,
    continuedVideoTemplate.id,
  ],
});

// lecture test

const testPauseAndContinuePattern = profileGenerator.addRequiredAndZeroOrMoreSequencePattern({
  id: 'test-pause-and-continue',
  sequence: [
    pausedTestTemplate.id,
    continuedTestTemplate.id,
  ],
});

const failedOrAbortedAlternatePattern = profileGenerator.addPattern({
  id: 'test-failed-or-aborted',
  alternates: [
    failedTestTemplate.id,
    abortedTestTemplate.id,
  ],
});

const testCycleFailedOrAbortedAndStartedAfterwards = profileGenerator.addRequiredAndZeroOrMoreSequencePattern({
  id: 'test-cycle-failed-or-aborted-and-started-afterwards',
  sequence: [
    failedOrAbortedAlternatePattern.id,
    startedTestTemplate.id,
    testPauseAndContinuePattern.zeroOrMore.id,
  ],
});

const standardTestCyclePattern = profileGenerator.addPattern({
  id: 'standard-test-cycle',
  sequence: [
    startedTestTemplate.id,
    testPauseAndContinuePattern.zeroOrMore.id,
    testCycleFailedOrAbortedAndStartedAfterwards.zeroOrMore.id,
    completedTestTemplate.id,
  ],
});

// lifecycles

const standardLifecyclePattern = profileGenerator.addPattern({
  id: 'standard-lifecycle',
  primary: true,
  sequence: [
    downloadedMaterialTemplate.id,
    playedVideoTemplate.id,
    videoPauseAndContinuePattern.zeroOrMore.id,
    completedVideoTemplate.id,
    standardTestCyclePattern.id,
  ],
});

// -------------------------------------------------------------------------------------------------
// DATASIMInputGenerator

/**
 * @typedef {Object} Actor
 * @property {string} name
 * @property {string} mbox
 */

/**
 * @typedef {Object} GroupOfActors
 * @property {Actor[]} member
 * @property {'Group'} objectType
 * @property {string} name
 */

/**
 * @typedef {Object} Alignment
 * @property {string} component
 * @property {number} weight
 */

/**
 * @typedef {Object} AgentAlignments
 * @property {string} id
 * @property {'Agent'} type
 * @property {Alignment[]} alignments
 */

/**
 * @typedef {Object} DATASIMParameters
 * @property {Date | string} start
 * @property {Date | string} end
 * @param {number} max
 * @param {'Europe/Berlin'} timezone
 * @param {number} seed
 */

class DATASIMInputGenerator {
  /**
   * @param {ProfileGenerator} profileGenerator
   */
  constructor(profileGenerator) {
    this.profileGenerator = profileGenerator;
    this.personae = [];
    this.alignments = [];
  }

  // -----------------------------------------------------------------------------------------------
  // static methods

  static createActor(name, email) {
    return {
      name,
      mbox: `mailto:${email}`,
    };
  }

  // -----------------------------------------------------------------------------------------------
  // methods

  /**
   * @param {string} name
   * @param {Actor[]} actors
   *
   * @returns {GroupOfActors}
   */
  addGroupOfActors(name, actors) {
    /** @type {GroupOfActors} */
    const group = {
      name,
      objectType: 'Group',
      member: actors,
    };

    this.personae.push(group);

    return group;
  }

  /**
   * @param {Actor} actor
   * @param {Alignment[]} alignments
   *
   * @returns {AgentAlignments}
   */
  addAgentAlignment(actor, alignments) {
    /** @type {AgentAlignments} */
    const agentAlignments = {
      id: `mbox::${actor.mbox}`,
      type: 'Agent',
      alignments: alignments,
    };

    this.alignments.push(agentAlignments);

    return agentAlignments;
  }

  /**
   * @param {DATASIMParameters} simParams
   *
   * @returns {Object}
   */
  getSimInput(simParams) {
    return {
      profiles: [
        this.profileGenerator.getCompleteProfile(),
      ],
      'personae-array': this.personae,
      alignments: this.alignments,
      parameters: simParams,
    };
  }
}

// -------------------------------------------------------------------------------------------------
// generate DATASIM input

const datasimInputGen = new DATASIMInputGenerator(profileGenerator);

// -------------------------------------------------------------------------------------------------
// actors

const maxActor = DATASIMInputGenerator.createActor('Max Mustermann', 'max@example.test');
const philActor = DATASIMInputGenerator.createActor('Phil Phillips', 'phil@example.test');
const samActor = DATASIMInputGenerator.createActor('Sam Sommer', 'sam@example.test');
const annaActor = DATASIMInputGenerator.createActor('Anna Anders', 'anna@example.test');
const emmaActor = DATASIMInputGenerator.createActor('Emma Egbert', 'emma@example.test');

const numberOfActors = 5;

const otherActors = new Array(numberOfActors - 5).fill(null)
  .map((_, index) => DATASIMInputGenerator.createActor(`Agent #${index}`, `agent${index}@example.test`));

// -------------------------------------------------------------------------------------------------
// personae

const actorGroup1 = datasimInputGen.addGroupOfActors('students1', [
  maxActor,
  philActor,
]);

const actorGroup2 = datasimInputGen.addGroupOfActors('students2', [
  samActor,
  annaActor,
  emmaActor,
  ...otherActors,
]);

// -------------------------------------------------------------------------------------------------
// alignments

datasimInputGen.addAgentAlignment(maxActor, [
  {
    component: failedTestTemplate.id,
    weight: 0.8,
  },
]);

datasimInputGen.addAgentAlignment(philActor, [
  {
    component: failedTestTemplate.id,
    weight: -0.8,
  },
]);

// -------------------------------------------------------------------------------------------------
// exports

export {
  profileGenerator,
  datasimInputGen,
};
