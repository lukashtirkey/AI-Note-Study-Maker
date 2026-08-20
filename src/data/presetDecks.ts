import type { StudyDeck } from '../types';

export const PRESET_DECKS: StudyDeck[] = [
  {
    id: 'deck-ml-101',
    title: 'Machine Learning & Neural Networks',
    subject: 'Computer Science',
    description: 'Core principles of supervised learning, deep neural networks, backpropagation, and transformer architectures.',
    icon: 'BrainCircuit',
    color: 'from-purple-600 to-indigo-600',
    notes: [
      {
        id: 'note-ml-1',
        title: 'Foundations of Deep Learning & Transformers',
        subject: 'Computer Science',
        rawInput: 'Deep learning uses artificial neural networks with multiple layers (hence "deep") to progressively extract higher-level features from raw input. Key concepts include gradient descent, loss functions, activation functions (ReLU, Sigmoid, GELU), backpropagation via automatic differentiation, and attention mechanisms introduced in "Attention Is All You Need" (Vaswani et al., 2017).',
        summary: 'Deep Learning models process complex high-dimensional data through layered neural representations optimized via loss gradients and backpropagation.',
        bulletPoints: [
          'Gradient Descent iteratively updates weight matrices in direction of steepest descent of the loss function.',
          'Backpropagation computes partial derivatives using the chain rule from output back to input layer.',
          'Self-Attention allows transformers to compute dependencies between all tokens simultaneously regardless of distance.',
          'Overfitting occurs when high variance models memorize training noise; mitigated by Dropout, L2 Regularization, and Early Stopping.'
        ],
        keyTerms: [
          { term: 'Backpropagation', definition: 'An algorithm for supervised learning of artificial neural networks using gradient descent with chain rule.' },
          { term: 'Transformer', definition: 'A deep learning architecture relying on self-attention mechanisms to weigh significance of different input data parts.' },
          { term: 'Gradient Descent', definition: 'Optimization algorithm that minimizes a function by iteratively moving in direction of steepest descent.' },
          { term: 'Overfitting', definition: 'A modeling error where a machine learning model fits noise rather than the underlying data distribution.' }
        ],
        tags: ['AI', 'Deep Learning', 'Neural Networks', 'Python'],
        createdAt: '2026-08-18'
      }
    ],
    flashcards: [
      {
        id: 'fc-ml-1',
        front: 'What is the mathematical purpose of Backpropagation in neural networks?',
        back: 'To compute the partial derivatives (gradients) of the loss function with respect to every weight parameter using the chain rule, enabling gradient descent optimization.',
        category: 'Deep Learning',
        difficulty: 'medium',
        masteryScore: 85,
        timesReviewed: 4
      },
      {
        id: 'fc-ml-2',
        front: 'How does Self-Attention differ from Recurrent Neural Networks (RNNs)?',
        back: 'Self-Attention processes all input tokens in parallel with O(1) sequential step count, whereas RNNs process tokens sequentially (O(N) time), creating a bottleneck for long contexts.',
        category: 'Transformers',
        difficulty: 'hard',
        masteryScore: 70,
        timesReviewed: 3
      },
      {
        id: 'fc-ml-3',
        front: 'Why is ReLU (Rectified Linear Unit) favored over Sigmoid in deep networks?',
        back: 'ReLU (f(x) = max(0,x)) avoids the vanishing gradient problem in positive regions because its derivative is constantly 1, allowing gradients to flow back easily.',
        category: 'Activation Functions',
        difficulty: 'easy',
        masteryScore: 95,
        timesReviewed: 6
      },
      {
        id: 'fc-ml-4',
        front: 'What is the role of the Softmax function in classification models?',
        back: 'Softmax converts raw logits (unnormalized log-probabilities) into a normalized probability distribution across N classes where all values sum to 1.0.',
        category: 'Classification',
        difficulty: 'easy',
        masteryScore: 90,
        timesReviewed: 5
      },
      {
        id: 'fc-ml-5',
        front: 'What is the difference between L1 and L2 Regularization?',
        back: 'L1 (Lasso) adds absolute weight values to loss, inducing sparsity (zeroing out weights). L2 (Ridge) adds squared weights, penalizing large weights smoothly without forcing exact zeros.',
        category: 'Optimization',
        difficulty: 'medium',
        masteryScore: 60,
        timesReviewed: 2
      }
    ],
    quiz: [
      {
        id: 'q-ml-1',
        question: 'Which component in Transformer architectures computes token-to-token relationship weights?',
        options: [
          'Convolutional Filter Bank',
          'Multi-Head Self-Attention Mechanism',
          'Recurrent Hidden Gated Unit',
          'Max Pooling Layer'
        ],
        correctAnswer: 1,
        explanation: 'Multi-Head Self-Attention projects inputs into Query, Key, and Value matrices, computing Softmax(QK^T / sqrt(d_k))V to weigh all token pairwise interactions.',
        hint: 'It allows the model to look at other words in the input sequence when encoding a specific word.'
      },
      {
        id: 'q-ml-2',
        question: 'What primary problem does Residual Connections (Skip Connections) solve in ResNet and Transformers?',
        options: [
          'Memory leakage during evaluation',
          'Vanishing and exploding gradients in very deep architectures',
          'Slow disk I/O during data batching',
          'Categorical cross-entropy underflow'
        ],
        correctAnswer: 1,
        explanation: 'Residual connections allow gradients to flow directly through identity shortcuts F(x) + x, preventing vanishing gradients as networks get hundreds of layers deep.',
        hint: 'Think about allowing gradients to bypass layer operations directly.'
      },
      {
        id: 'q-ml-3',
        question: 'What occurs during Overfitting in a machine learning model?',
        options: [
          'High training error and high test error',
          'Low training error but high generalization error on unseen test data',
          'Equal performance across training and validation sets',
          'Loss function fails to compute gradients'
        ],
        correctAnswer: 1,
        explanation: 'Overfitting happens when a model learns noise and specific details of the training set rather than general patterns, resulting in low training loss but poor test set accuracy.',
        hint: 'The model "memorizes" the training data.'
      }
    ],
    mindMap: {
      id: 'mm-ml-root',
      label: 'Machine Learning Ecosystem',
      description: 'Supervised, Unsupervised & Deep Learning',
      color: '#8b5cf6',
      children: [
        {
          id: 'mm-ml-1',
          label: 'Supervised Learning',
          description: 'Labeled datasets for training',
          color: '#ec4899',
          children: [
            { id: 'mm-ml-1-1', label: 'Regression', description: 'Linear, Ridge, Lasso, Polynomial' },
            { id: 'mm-ml-1-2', label: 'Classification', description: 'Logistic, SVM, Random Forest' }
          ]
        },
        {
          id: 'mm-ml-2',
          label: 'Deep Neural Networks',
          description: 'Layered feature representation',
          color: '#3b82f6',
          children: [
            { id: 'mm-ml-2-1', label: 'CNNs', description: 'Spatial grid processing & Computer Vision' },
            { id: 'mm-ml-2-2', label: 'Transformers', description: 'Self-Attention, LLMs & Sequential modeling' },
            { id: 'mm-ml-2-3', label: 'Optimization', description: 'AdamW, SGD, Backprop, LR Schedulers' }
          ]
        }
      ]
    }
  },
  {
    id: 'deck-neuro-102',
    title: 'Cognitive Neuroscience & Memory',
    subject: 'Biology & Neuroscience',
    description: 'Neural circuits, synaptic plasticity (LTP), hippocampus memory consolidation, and neurotransmitter systems.',
    icon: 'Activity',
    color: 'from-emerald-500 to-teal-700',
    notes: [
      {
        id: 'note-neuro-1',
        title: 'Synaptic Plasticity & Long-Term Potentiation (LTP)',
        subject: 'Neuroscience',
        rawInput: 'Long-Term Potentiation (LTP) is a persistent strengthening of synapses based on recent patterns of activity. It is widely considered one of the major cellular mechanisms that underlies learning and memory. The NMDA receptor acts as a coincidence detector requiring both glutamate binding and postsynaptic depolarization to clear the Mg2+ plug.',
        summary: 'LTP strengthens synaptic connections through NMDA-dependent Calcium influx leading to AMPA receptor insertion in the postsynaptic membrane.',
        bulletPoints: [
          'NMDA receptors require dual activation: Glutamate binding AND membrane depolarization to unblock Magnesium (Mg2+).',
          'Calcium (Ca2+) influx activates CaMKII and PKC enzymes.',
          'Retrograde messengers (Nitric Oxide) stimulate presynaptic glutamate release.',
          'Hippocampus CA1 region is critical for declarative memory consolidation.'
        ],
        keyTerms: [
          { term: 'LTP (Long-Term Potentiation)', definition: 'Long-lasting increase in synaptic strength following high-frequency stimulation.' },
          { term: 'NMDA Receptor', definition: 'Ionotropic glutamate receptor that conducts Calcium when unblocked by depolarization.' },
          { term: 'Synaptic Plasticity', definition: 'The ability of synapses to strengthen or weaken over time in response to activity.' }
        ],
        tags: ['Neuroscience', 'Memory', 'Brain', 'Biology'],
        createdAt: '2026-08-19'
      }
    ],
    flashcards: [
      {
        id: 'fc-neuro-1',
        front: 'Why is the NMDA receptor referred to as a "Coincidence Detector"?',
        back: 'Because it conducts Ca2+ ions only when two simultaneous events occur: Presynaptic Glutamate release AND Postsynaptic depolarization to expel the blocking Mg2+ ion.',
        category: 'Synaptic Mechanism',
        difficulty: 'hard',
        masteryScore: 80,
        timesReviewed: 3
      },
      {
        id: 'fc-neuro-2',
        front: 'What anatomical structure is primarily responsible for converting short-term memory into long-term declarative memory?',
        back: 'The Hippocampus (specifically circuits involving the Dentate Gyrus, CA3, and CA1 pyramidal neurons).',
        category: 'Brain Anatomy',
        difficulty: 'easy',
        masteryScore: 100,
        timesReviewed: 5
      },
      {
        id: 'fc-neuro-3',
        front: 'What structural change occurs at the postsynaptic membrane during late-phase LTP?',
        back: 'Increased insertion of AMPA receptors, spine head enlargement, and protein synthesis leading to new dendritic spine creation.',
        category: 'Plasticity',
        difficulty: 'medium',
        masteryScore: 75,
        timesReviewed: 3
      }
    ],
    quiz: [
      {
        id: 'q-neuro-1',
        question: 'Which ion normally blocks the pore of the NMDA channel at resting membrane potential (-70mV)?',
        options: ['Sodium (Na+)', 'Magnesium (Mg2+)', 'Potassium (K+)', 'Chloride (Cl-)'],
        correctAnswer: 1,
        explanation: 'At resting potential, Mg2+ is attracted into the channel pore by electrostatic force, physically blocking ion passage until depolarization occurs.',
        hint: 'It is a divalent cation abundant in extracellular fluid.'
      },
      {
        id: 'q-neuro-2',
        question: 'Which neurotransmitter is the primary excitatory signaling molecule in the mammalian central nervous system?',
        options: ['GABA', 'Glutamate', 'Dopamine', 'Acetylcholine'],
        correctAnswer: 1,
        explanation: 'Glutamate acts on AMPA, NMDA, and Kainate receptors to mediate fast excitatory synaptic transmission across >80% of brain synapses.',
        hint: 'It is an amino acid present in MSG.'
      }
    ],
    mindMap: {
      id: 'mm-neuro-root',
      label: 'Memory Systems',
      description: 'Taxonomy of Human Memory',
      color: '#10b981',
      children: [
        {
          id: 'mm-neuro-1',
          label: 'Declarative (Explicit)',
          description: 'Conscious recall of facts and events',
          color: '#06b6d4',
          children: [
            { id: 'mm-neuro-1-1', label: 'Episodic', description: 'Personal events & experiences (Hippocampus)' },
            { id: 'mm-neuro-1-2', label: 'Semantic', description: 'Facts & general knowledge (Cortex)' }
          ]
        },
        {
          id: 'mm-neuro-2',
          label: 'Non-Declarative (Implicit)',
          description: 'Unconscious procedural memory',
          color: '#f59e0b',
          children: [
            { id: 'mm-neuro-2-1', label: 'Procedural', description: 'Motor skills & habits (Striatum & Cerebellum)' },
            { id: 'mm-neuro-2-2', label: 'Conditioning', description: 'Emotional response (Amygdala)' }
          ]
        }
      ]
    }
  },
  {
    id: 'deck-chem-103',
    title: 'Organic Chemistry & Reaction Mechanisms',
    subject: 'Chemistry',
    description: 'Nucleophilic substitution (SN1/SN2), elimination (E1/E2), aromaticity, and synthesis pathways.',
    icon: 'FlaskConical',
    color: 'from-amber-500 to-orange-600',
    notes: [
      {
        id: 'note-chem-1',
        title: 'SN1 vs SN2 Nucleophilic Substitution Reactions',
        subject: 'Organic Chemistry',
        rawInput: 'SN1 is a unimolecular nucleophilic substitution proceeding through a carbocation intermediate with inversion and retention (racemization). SN2 is a bimolecular concerted reaction featuring a pentacoordinate transition state leading to 100% Walden inversion of stereochemistry.',
        summary: 'SN1 reactions rely on carbocation stability and weak nucleophiles; SN2 reactions prefer methyl/primary substrates and strong nucleophiles.',
        bulletPoints: [
          'SN1 rate = k[Substrate]; SN2 rate = k[Substrate][Nucleophile].',
          'SN1 favored by polar protic solvents (H2O, EtOH) that stabilize carbocation intermediates.',
          'SN2 favored by polar aprotic solvents (DMSO, DMF, Acetone).',
          'Substrate reactivity order: SN2 (Methyl > 1° > 2° >> 3°); SN1 (3° > 2° >> 1°).'
        ],
        keyTerms: [
          { term: 'Nucleophile', definition: 'An electron-pair donor that attacks electron-deficient electrophilic centers.' },
          { term: 'Carbocation', definition: 'An organic cation containing a positively charged carbon atom with 6 valence electrons.' },
          { term: 'Walden Inversion', definition: 'Inversion of a chiral center configuration during an SN2 backside attack.' }
        ],
        tags: ['Chemistry', 'Organic Chemistry', 'Reactions', 'MCAT'],
        createdAt: '2026-08-17'
      }
    ],
    flashcards: [
      {
        id: 'fc-chem-1',
        front: 'Why does an SN2 reaction result in complete stereochemical inversion (Walden Inversion)?',
        back: 'The nucleophile must perform a backside attack (180° opposite the leaving group) into the σ* antibonding orbital, turning the spatial geometry inside-out like an umbrella.',
        category: 'Substitution Mechanisms',
        difficulty: 'medium',
        masteryScore: 90,
        timesReviewed: 4
      },
      {
        id: 'fc-chem-2',
        front: 'Which solvent type stabilizes SN1 carbocation intermediates best?',
        back: 'Polar Protic solvents (e.g. Water, Methanol, Ethanol) because their hydrogen-bonding ability solvates both the carbocation and the departing anion leaving group.',
        category: 'Solvent Effects',
        difficulty: 'hard',
        masteryScore: 65,
        timesReviewed: 2
      }
    ],
    quiz: [
      {
        id: 'q-chem-1',
        question: 'What is the rate law for a unimolecular SN1 substitution reaction?',
        options: ['Rate = k[Substrate][Nucleophile]', 'Rate = k[Substrate]', 'Rate = k[Leaving Group]^2', 'Rate = k[Nucleophile]'],
        correctAnswer: 1,
        explanation: 'Because the rate-determining step is the unimolecular dissociation of the leaving group to form a carbocation, the nucleophile concentration does not affect reaction rate.',
        hint: 'Unimolecular means only one molecule is involved in the rate-limiting step.'
      }
    ],
    mindMap: {
      id: 'mm-chem-root',
      label: 'Organic Reaction Types',
      description: 'Substitution, Elimination & Addition',
      color: '#f97316',
      children: [
        {
          id: 'mm-chem-1',
          label: 'Substitution',
          description: 'Nucleophilic Replacement',
          color: '#ef4444',
          children: [
            { id: 'mm-chem-1-1', label: 'SN1', description: 'Two-step, Carbocation, Racemization' },
            { id: 'mm-chem-1-2', label: 'SN2', description: 'Concerted, Backside attack, Inversion' }
          ]
        },
        {
          id: 'mm-chem-2',
          label: 'Elimination',
          description: 'Double Bond Formation',
          color: '#eab308',
          children: [
            { id: 'mm-chem-2-1', label: 'E1', description: 'Carbocation, Zaitsev alkene product' },
            { id: 'mm-chem-2-2', label: 'E2', description: 'Anti-periplanar orientation requirement' }
          ]
        }
      ]
    }
  }
];
