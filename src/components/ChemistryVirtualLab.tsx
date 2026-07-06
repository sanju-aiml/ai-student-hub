import React, { useState, useEffect, useRef } from 'react';
import { 
  Beaker, Play, Pause, RotateCcw, ShieldAlert, Sparkles, AlertTriangle, 
  ChevronRight, CheckCircle2, Award, Info, HelpCircle, Flame, Eye, Settings, Sliders 
} from 'lucide-react';

interface ExperimentTopic {
  id: string;
  name: string;
  category: string;
  objective: string;
  theory: string;
  chemicals: string[];
  apparatus: string[];
  safety: string[];
  equation: string;
  ionicEquation: string;
  explanation: string;
  mistakes: string[];
  viva: { q: string; a: string }[];
  applications: string[];
}

const EXPERIMENT_TOPICS: ExperimentTopic[] = [
  {
    id: 'titration',
    name: 'Acid-Base Titration (HCl + NaOH)',
    category: 'Acids, Bases, and Buffers',
    objective: 'To determine the concentration of an unknown Hydrochloric Acid solution using standard 0.1M Sodium Hydroxide solution and Phenolphthalein indicator.',
    theory: 'Neutralization is a chemical reaction in which an acid and a base react quantitatively with each other to produce water and salt. Phenolphthalein is colorless in acidic solutions (pH < 8.2) and turns bright pink/magenta in basic solutions (pH > 10.0). The equivalence point is reached when the moles of H+ ions equal the moles of OH- ions.',
    chemicals: ['0.1M Hydrochloric Acid (Unknown analyte)', '0.1M Sodium Hydroxide (Standard titrant)', 'Phenolphthalein Indicator Solution', 'Deionized Water'],
    apparatus: ['50mL Graduated Burette', '250mL Erlenmeyer Flask', 'Burette Stand & Clamp', '10mL Volumetric Pipette', 'Pipette Bulb'],
    safety: [
      'Sodium hydroxide (NaOH) is corrosive. Avoid skin contact; flush with water immediately if splashed.',
      'Hydrochloric acid (HCl) releases mild fumes. Handle carefully with gloves.',
      'Wear safety goggles and lab apron at all times.'
    ],
    equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
    ionicEquation: 'H⁺(aq) + OH⁻(aq) → H₂O(l)  [Spectator Ions: Na⁺, Cl⁻]',
    explanation: 'At the start, the Erlenmeyer flask contains strong hydrochloric acid which completely dissociates into hydronium and chloride ions. Upon addition of NaOH titrant, hydronium ions are steadily neutralized to water. Near the endpoint, the local concentration of OH- around the drop creates temporary pink swirls. At the exact equivalence point (pH 7.0-8.2), a single drop triggers a permanent light pink hue.',
    mistakes: [
      'Over-shooting the endpoint by adding titrant too rapidly, resulting in a dark magenta solution instead of light pink.',
      'Forgetting to rinse the burette with NaOH solution before filling, which dilutes the titrant and causes calculated concentration errors.',
      'Reading the burette meniscus incorrectly (always read the bottom of the curve at eye level).'
    ],
    viva: [
      { q: 'Why is Phenolphthalein used instead of Methyl Orange for this titration?', a: 'Phenolphthalein has a pH transition range of 8.2-10.0, making it highly sensitive to the sharp pH surge that occurs at the equivalence point of a strong acid-strong base titration.' },
      { q: 'What is a primary standard solution?', a: 'A highly pure, stable, non-hygroscopic chemical compound used to prepare a solution of highly precise concentration (e.g., Sodium Carbonate or Potassium Hydrogen Phthalate).' },
      { q: 'What is the pH at the exact equivalence point of a strong acid and strong base at 25°C?', a: 'At the equivalence point, the solution contains only neutral salt (NaCl) and water, so the pH is exactly 7.0.' }
    ],
    applications: [
      'Water purification plants to monitor and adjust acid neutralization levels.',
      'Food industry quality control to measure acidity levels in citrus juices, milk, and vinegar.',
      'Pharmaceutical manufacturing to ensure uniform acid-buffering agent dosages in medication tables.'
    ]
  },
  {
    id: 'flame_test',
    name: 'Flame Tests for Metal Cations',
    category: 'Analytical Chemistry / Atomic Structure',
    objective: 'To identify unknown metal ions in chloride salt samples based on their characteristic electromagnetic emission spectra when heated in a Bunsen burner flame.',
    theory: 'When metal salts are introduced into a hot flame, thermal energy is absorbed by the metal ions. This excites the valence electrons from their ground state to higher energy levels (excited state). Since the excited state is unstable, the electrons quickly relax back to the ground state, releasing the absorbed energy as electromagnetic radiation (photons) of specific wavelengths corresponding to visible light.',
    chemicals: ['Sodium Chloride (NaCl) salt', 'Copper(II) Chloride (CuCl₂) salt', 'Strontium Chloride (SrCl₂) salt', 'Potassium Chloride (KCl) salt', '3M Concentrated Hydrochloric Acid (for loop cleaning)'],
    apparatus: ['Platinum or Nichrome Wire Loop', 'Bunsen Burner connected to gas regulator', 'Cobalt Blue Glass (for Potassium filtration)', 'Watch Glasses'],
    safety: [
      'Bunsen burners pose an active fire and burn hazard. Keep hair tied back and loose clothes secured.',
      '3M HCl is highly caustic and produces irritating vapors. Perform near ventilation.',
      'Do not touch wire loops directly after heating; allow to cool on heat-resistant mats.'
    ],
    equation: 'M⁺(excited) → M⁺(ground) + hν (where hν represents light emission)',
    ionicEquation: 'Electron transitions: [Core] ns¹ → np¹ (excitation) → ns¹ + Photon (relaxation)',
    explanation: 'The specific flame color is determined by the energy difference (ΔE) between the excited state and ground state orbitals of the metal cation. Because each element has a unique electronic configuration and shell spacing, the emitted photon possesses a unique frequency. Sodium emits at 589 nm (yellow), Copper at 510 nm (turquoise green), Strontium at 640 nm (crimson red), and Potassium at 404 nm (lilac violet).',
    mistakes: [
      'Failing to clean the nichrome wire thoroughly between tests, causing contamination and mixed flame colors (Sodium is extremely bright and easily masks other colors).',
      'Using the wire loop when still red hot, which volatilizes the salt sample too rapidly before observation.',
      'Confusing the orange-yellow glare of the wire loop itself with a positive Sodium cation test.'
    ],
    viva: [
      { q: 'Why are chloride salts preferred for flame tests?', a: 'Metal chlorides are highly volatile at Bunsen burner temperatures, allowing them to vaporize and dissociate into atoms quickly, producing intense emission colors.' },
      { q: 'What is the function of Cobalt Blue Glass in flame tests?', a: 'Cobalt glass absorbs high-intensity yellow light emitted by sodium contaminants, allowing the faint lilac flame of potassium to be seen clearly.' },
      { q: 'How does quantum theory explain flame colors?', a: 'Energy is quantized: ΔE = hν = hc/λ. The color wavelength λ is inversely proportional to the specific orbital gap of the metal cation.' }
    ],
    applications: [
      'Pyrotechnics industry to design brilliant colors for commercial fireworks displays (e.g. Strontium for red, Copper for blue).',
      'Spectrochemical analysis in analytical laboratories to determine elemental mineral content in soil, ore, and blood serum.',
      'Astrophysics spectroscopy to identify chemical elements present in distant stellar coronas and atmospheres.'
    ]
  },
  {
    id: 'electrolysis',
    name: 'Electrolysis of Copper Sulfate Solution',
    category: 'Electrochemistry',
    objective: 'To study the chemical changes, mass transfer, and half-reactions occurring during the electrolysis of aqueous Copper(II) Sulfate solution using copper electrodes.',
    theory: 'Electrolysis is the process of using electrical energy to drive a non-spontaneous chemical reaction. When current is passed through an aqueous CuSO₄ solution using copper electrodes, copper metal is oxidized at the positive anode and goes into solution as Cu²⁺, while Cu²⁺ ions migrate to the negative cathode where they are reduced and plate out as copper metal. This is the basis of electrorefining.',
    chemicals: ['1.0M Copper(II) Sulfate solution (CuSO₄)', 'Deionized Water', 'Ethanol (for washing and drying electrodes)'],
    apparatus: ['Aqueous Glass Electrolytic Cell', 'Variable DC Power Supply (0-12V)', 'Two Copper Electrodes (Strip foils)', 'Connecting Wires with Alligator Clips', 'Analytical Weighing Balance'],
    safety: [
      'Avoid high voltage settings to prevent accidental electrical shocks or hydrogen gas bursts.',
      'Copper sulfate is harmful if swallowed and is an environmental irritant. Dispose of in dedicated metal waste carboys.',
      'Ensure the power supply is switched off before adjusting alligator clips.'
    ],
    equation: 'Cathode (Reduction): Cu²⁺(aq) + 2e⁻ → Cu(s) | Anode (Oxidation): Cu(s) → Cu²⁺(aq) + 2e⁻',
    ionicEquation: 'Net Cell Reaction: Cu(anode) → Cu(cathode) [No net chemical consumption, pure metal migration]',
    explanation: 'When the battery is connected, the anode becomes positively charged and the cathode becomes negatively charged. Cu²⁺ cations in the blue electrolyte are attracted to the negative cathode, where they accept two electrons and deposit as shiny copper atoms. Meanwhile, the copper anode dissolves to replace the Cu²⁺ ions, maintaining a constant blue color intensity in the solution.',
    mistakes: [
      'Reversing the power supply polarities, which causes the wrong electrode to gain mass, confusing experimental observations.',
      'Not drying the copper electrodes thoroughly with ethanol before weighing, which leads to artificial mass calculation gains.',
      'Setting the electric current density too high, which causes the copper coating to deposit as a loose, crumbly sludge instead of a solid shiny plate.'
    ],
    viva: [
      { q: 'What would happen if inert Platinum electrodes were used instead of Copper electrodes?', a: 'Oxygen gas would evolve at the positive anode (2H₂O → O₂ + 4H⁺ + 4e⁻) instead of copper dissolving, and the solution would become acidic as blue Cu²⁺ is slowly depleted.' },
      { q: 'How does Faraday\'s First Law of Electrolysis apply here?', a: 'The mass of copper deposited at the cathode is directly proportional to the total electrical charge (current × time) that passes through the cell: m = zIt.' },
      { q: 'Define the term electrolysis anode.', a: 'The anode is the positive electrode connected to the positive terminal of the power supply, where oxidation (loss of electrons) occurs.' }
    ],
    applications: [
      'Industrial electrorefining to purify crude copper metal up to 99.99% purity for high-conductivity electrical wires.',
      'Electroplating of decorative and protective layers of precious metals (gold, silver, nickel) onto jewelry and steel components.',
      'Commercial production of high-grade copper foil sheets used in lithium-ion battery current collectors.'
    ]
  },
  {
    id: 'stoichiometry',
    name: 'Stoichiometry of Gas Evolution (Zn + HCl)',
    category: 'Stoichiometry / Gas Laws',
    objective: 'To react a known mass of Zinc metal with excess Hydrochloric Acid, collect the evolved Hydrogen gas, and verify stoichiometric volume predictions.',
    theory: 'In a single displacement reaction, a reactive metal reacts with mineral acid to release hydrogen gas. According to Avogadro\'s Law and ideal gas stoichiometry, 1 mole of zinc reacts to produce exactly 1 mole of hydrogen gas. At Standard Temperature and Pressure (STP), 1 mole of any ideal gas occupies a volume of exactly 22.4 Liters (22,400 mL).',
    chemicals: ['Granular Zinc metal (0.5g to 2.0g weighed precisely)', '3.0M Concentrated Hydrochloric Acid (excess)', 'Deionized Water'],
    apparatus: ['250mL Erlenmeyer Flask with gas-tight delivery port', 'Elastic Rubber Balloon (for gas containment and display)', 'Graduated Gas Syringe (or water displacement apparatus)', 'Digital Balance (0.001g accuracy)', 'Thermometer and Barometer'],
    safety: [
      'Hydrogen gas is highly flammable and forms explosive mixtures with air. Ensure absolutely no open flames or spark sources are nearby.',
      '3.0M HCl is corrosive. Wear acid-resistant gloves and goggles.',
      'Release collected gas slowly in a fume hood once calculations are completed.'
    ],
    equation: 'Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)↑',
    ionicEquation: 'Zn(s) + 2H⁺(aq) → Zn²⁺(aq) + H₂(g)↑ [Spectator: Cl⁻]',
    explanation: 'The reaction begins immediately upon adding zinc granules to the acid. Zinc is oxidized, transferring two electrons to hydrogen ions, which form neutral hydrogen gas. Since the system is sealed, the expanding hydrogen gas creates pressure, inflating the attached balloon. By measuring the initial mass of Zinc, we can predict the exact balloon expansion volume.',
    mistakes: [
      'Allowing gas to leak from around the delivery port or balloon attachment, resulting in lower collected gas volumes than stoichiometric predictions.',
      'Using oxide-coated zinc pieces without cleaning, which reacts more slowly and introduces mass measurement impurities.',
      'Ignoring ambient temperature and barometric pressure adjustments when calculating gas volume conversions to STP.'
    ],
    viva: [
      { q: 'How many moles of HCl are needed to react completely with 1 mole of Zinc?', a: 'Based on the balanced equation stoichiometry, exactly 2 moles of Hydrochloric Acid are required for every 1 mole of Zinc metal.' },
      { q: 'What is the chemical test to confirm the presence of Hydrogen gas?', a: 'Bring a burning wooden splinter near the mouth of the gas collection tube; hydrogen gas ignites with a characteristic "pop" sound.' },
      { q: 'How does temperature affect gas volume?', a: 'According to Charles\'s Law, the volume of a fixed mass of gas is directly proportional to its absolute temperature in Kelvin when pressure is held constant.' }
    ],
    applications: [
      'Design of light-weight aerospace balloon structures inflated by chemical gas generator cartridges.',
      'Industrial synthesis of pure Zinc Chloride used as a soldering flux, wood preservative, and chemical catalyst.',
      'Safe on-demand hydrogen fuel supply systems for localized micro-combustion devices.'
    ]
  }
];

export default function ChemistryVirtualLab() {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('titration');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1); // 1 = Normal, 0.5 = Slow, 2 = Fast
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isExplainingStep, setIsExplainingStep] = useState<boolean>(true);
  
  // Custom interactive parameters
  const [quantity, setQuantity] = useState<number>(20); // mL for titration, grams for stoichiometry
  const [concentration, setConcentration] = useState<number>(0.1); // Molarity
  const [temperature, setTemperature] = useState<number>(25); // °C
  const [batteryVoltage, setBatteryVoltage] = useState<number>(4); // Volts for electrolysis
  
  // Active chemical reactant selections
  const [activeBeakerSol, setActiveBeakerSol] = useState<string>('None');
  const [activeFlameSalt, setActiveFlameSalt] = useState<string>('None');
  
  // Dynamic Simulation values
  const [pHValue, setPHValue] = useState<number>(1.0);
  const [solutionColor, setSolutionColor] = useState<string>('rgba(255, 255, 255, 0.1)'); // Colorless initial
  const [gasBubbles, setGasBubbles] = useState<{ x: number; y: number; size: number; speed: number }[]>([]);
  const [precipitateLevel, setPrecipitateLevel] = useState<number>(0); // Height of solids
  const [cathodeMassGained, setCathodeMassGained] = useState<number>(0); // mg copper plated
  const [balloonSize, setBalloonSize] = useState<number>(1); // Scale factor for hydrogen balloon
  
  // Quiz states
  const [quizAnswered, setQuizAnswered] = useState<Record<number, number>>({});
  const [score, setScore] = useState<number | null>(null);

  const activeTopic = EXPERIMENT_TOPICS.find(t => t.id === selectedTopicId) || EXPERIMENT_TOPICS[0];
  
  // Refs for drawing and loops
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const bubbleIntervalRef = useRef<any>(null);

  // Restart experiment on topic or slider changes
  const resetSimulation = () => {
    setIsPlaying(false);
    setStepIndex(0);
    setIsExplainingStep(true);
    setGasBubbles([]);
    setPrecipitateLevel(0);
    setCathodeMassGained(0);
    setBalloonSize(1);
    setQuizAnswered({});
    setScore(null);
    setActiveFlameSalt('None');

    if (selectedTopicId === 'titration') {
      setPHValue(1.0);
      setSolutionColor('rgba(255, 255, 255, 0.05)');
      setActiveBeakerSol('HCl Analyte');
    } else if (selectedTopicId === 'flame_test') {
      setSolutionColor('rgba(59, 130, 246, 0.2)'); // Soft gas blue
      setActiveBeakerSol('Clean Wire Loop');
    } else if (selectedTopicId === 'electrolysis') {
      setSolutionColor('rgba(14, 165, 233, 0.45)'); // Blue CuSO4
      setActiveBeakerSol('CuSO4 Solution');
    } else if (selectedTopicId === 'stoichiometry') {
      setPHValue(1.2);
      setSolutionColor('rgba(255, 255, 255, 0.08)');
      setActiveBeakerSol('HCl Acid');
    }
  };

  useEffect(() => {
    resetSimulation();
  }, [selectedTopicId]);

  // Handle active simulation steps
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      const intervalDuration = (selectedTopicId === 'titration' ? 100 : 1000) / speedMultiplier;
      timer = setInterval(() => {
        if (selectedTopicId === 'titration') {
          // Titration simulation steps
          setStepIndex(prev => {
            const nextVal = prev + 1;
            // Let titration go up to 100 steps of adding NaOH drop-by-drop
            if (nextVal >= 100) {
              setIsPlaying(false);
              return 100;
            }
            
            // Calculate dynamic pH based on quantity and concentration added
            const addedVol = nextVal * 0.4; // 0.4mL per step
            const totalVol = quantity + addedVol;
            const acidMoles = quantity * 0.001 * concentration;
            const baseMoles = addedVol * 0.001 * 0.1; // NaOH is 0.1M standard
            
            let currentPH = 1.0;
            let finalColor = 'rgba(255, 255, 255, 0.05)';
            
            if (acidMoles > baseMoles) {
              const remainingH = (acidMoles - baseMoles) / (totalVol * 0.001);
              currentPH = -Math.log10(remainingH);
              // Color stays completely clear/colorless
              finalColor = 'rgba(255, 255, 255, 0.05)';
            } else if (Math.abs(acidMoles - baseMoles) < 1e-6) {
              currentPH = 7.0; // Equivalence point
              finalColor = 'rgba(236, 72, 153, 0.2)'; // Very soft pink
            } else {
              const excessOH = (baseMoles - acidMoles) / (totalVol * 0.001);
              currentPH = 14 + Math.log10(excessOH);
              
              // Fade from faint pink to deep pink to magenta based on alkaline concentration
              if (currentPH < 8.2) {
                finalColor = 'rgba(255, 255, 255, 0.05)';
              } else if (currentPH < 9.0) {
                finalColor = 'rgba(236, 72, 153, 0.35)'; // Pale pink
              } else if (currentPH < 10.5) {
                finalColor = 'rgba(219, 39, 119, 0.7)'; // Stable Pink
              } else {
                finalColor = 'rgba(157, 23, 77, 0.9)'; // Over-titrated dark magenta
              }
            }
            
            setPHValue(Math.max(1.0, Math.min(13.8, currentPH)));
            setSolutionColor(finalColor);
            
            // Increment steps of narrative explanation
            if (nextVal === 10) setStepIndex(10);
            if (nextVal === 50) setStepIndex(50);
            if (nextVal === 95) setStepIndex(95);

            return nextVal;
          });
        } 
        else if (selectedTopicId === 'electrolysis') {
          // Electrolysis copper plating over time
          setStepIndex(prev => {
            if (prev >= 10) {
              setIsPlaying(false);
              return 10;
            }
            
            // Plating rate proportional to battery voltage & concentration & speed
            const platingIncr = batteryVoltage * concentration * 3.5; 
            setCathodeMassGained(c => c + platingIncr);
            
            // Add anodic gas bubble arrays
            triggerBubbles(8);
            
            return prev + 1;
          });
        }
        else if (selectedTopicId === 'stoichiometry') {
          // Stoichiometry balloon inflation and bubbling
          setStepIndex(prev => {
            if (prev >= 10) {
              setIsPlaying(false);
              return 10;
            }

            // Target balloon scale matches mass of Zinc added
            const maxInflation = 1.0 + (quantity * 0.85 * (concentration / 1.0)); // scale balloon
            setBalloonSize(b => Math.min(maxInflation, b + (maxInflation - 1) * 0.15));
            
            // Active bubbling
            triggerBubbles(12);

            return prev + 1;
          });
        }
      }, intervalDuration);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isPlaying, selectedTopicId, speedMultiplier, quantity, concentration, batteryVoltage]);

  // Manage rising gas bubble updates
  const triggerBubbles = (count: number) => {
    setGasBubbles(prev => {
      const next = [...prev];
      for (let i = 0; i < count; i++) {
        next.push({
          x: 20 + Math.random() * 60, // percentage x inside beaker
          y: 75, // start near bottom
          size: 1.5 + Math.random() * 4,
          speed: 0.8 + Math.random() * 2
        });
      }
      return next.slice(-60); // caps buffer
    });
  };

  useEffect(() => {
    let bubbleTimer: any = null;
    if (isPlaying && (selectedTopicId === 'stoichiometry' || selectedTopicId === 'electrolysis')) {
      bubbleTimer = setInterval(() => {
        setGasBubbles(prev => 
          prev
            .map(b => ({ ...b, y: b.y - b.speed }))
            .filter(b => b.y > 10) // remove bubbles reaching liquid surface
        );
      }, 30);
    }
    return () => { if (bubbleTimer) clearInterval(bubbleTimer); };
  }, [isPlaying, selectedTopicId]);

  // Draw Microscopic Molecular/Atomic Particles Canvas Frame
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localFrameId: number;
    let time = 0;

    // Set stable positions for microscopic particles
    const particles: { x: number; y: number; dx: number; dy: number; label: string; color: string; size: number }[] = [];
    
    const setupParticles = () => {
      particles.length = 0;
      if (selectedTopicId === 'titration') {
        // Hydronium ions H+ and Hydroxide OH-
        for (let i = 0; i < 6; i++) {
          particles.push({
            x: 40 + Math.random() * 200, y: 40 + Math.random() * 100,
            dx: (Math.random() - 0.5) * 1.5, dy: (Math.random() - 0.5) * 1.5,
            label: 'H⁺', color: '#F87171', size: 9
          });
          particles.push({
            x: 40 + Math.random() * 200, y: 40 + Math.random() * 100,
            dx: (Math.random() - 0.5) * 1.5, dy: (Math.random() - 0.5) * 1.5,
            label: 'Cl⁻', color: '#60A5FA', size: 11
          });
        }
        // If titrated slightly, add Na+ and OH-
        if (stepIndex > 10) {
          for (let i = 0; i < Math.min(10, Math.floor(stepIndex / 8)); i++) {
            particles.push({
              x: 40 + Math.random() * 200, y: 40 + Math.random() * 100,
              dx: (Math.random() - 0.5) * 1.2, dy: (Math.random() - 0.5) * 1.2,
              label: 'Na⁺', color: '#FBBF24', size: 10
            });
            particles.push({
              x: 40 + Math.random() * 200, y: 40 + Math.random() * 100,
              dx: (Math.random() - 0.5) * 1.8, dy: (Math.random() - 0.5) * 1.8,
              label: 'H₂O', color: '#10B981', size: 12
            });
          }
        }
      } 
      else if (selectedTopicId === 'flame_test') {
        // Excited atomic orbital circles showing energy levels
        particles.push({ x: 140, y: 80, dx: 0, dy: 0, label: 'Nucleus', color: '#EF4444', size: 18 });
        // Electrons on orbits
        particles.push({ x: 140, y: 45, dx: 0.05, dy: 0, label: 'e⁻', color: '#F59E0B', size: 6 });
        particles.push({ x: 140, y: 115, dx: -0.05, dy: 0, label: 'e⁻', color: '#F59E0B', size: 6 });
      }
      else if (selectedTopicId === 'electrolysis') {
        // Cu2+ migrating toward cathode, SO42- toward anode
        for (let i = 0; i < 5; i++) {
          particles.push({
            x: 40 + Math.random() * 220, y: 40 + Math.random() * 100,
            dx: -0.8 - Math.random() * 0.4, // leftward migration to negative cathode
            dy: (Math.random() - 0.5) * 0.6,
            label: 'Cu²⁺', color: '#0EA5E9', size: 12
          });
          particles.push({
            x: 40 + Math.random() * 220, y: 40 + Math.random() * 100,
            dx: 0.8 + Math.random() * 0.4, // rightward migration to positive anode
            dy: (Math.random() - 0.5) * 0.6,
            label: 'SO₄²⁻', color: '#A855F7', size: 14
          });
        }
      }
      else if (selectedTopicId === 'stoichiometry') {
        // H+ colliding with Zinc matrix to form gas
        for (let i = 0; i < 6; i++) {
          particles.push({
            x: 40 + Math.random() * 200, y: 40 + Math.random() * 100,
            dx: (Math.random() - 0.5) * 1.5, dy: (Math.random() - 0.5) * 1.5,
            label: 'H⁺', color: '#F87171', size: 9
          });
        }
        for (let i = 0; i < 4; i++) {
          particles.push({
            x: 40 + Math.random() * 200, y: 120 + Math.random() * 20,
            dx: 0, dy: -1.2 - Math.random() * 1.5, // rising H2 gas bubbles
            label: 'H₂', color: '#10B981', size: 10
          });
        }
      }
    };

    setupParticles();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.05;

      // Draw bounding dark coordinate board
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Render micro elements based on topic
      if (selectedTopicId === 'flame_test') {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Draw quantum shells
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1.5;
        
        ctx.beginPath(); ctx.arc(cx, cy, 35, 0, 2 * Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 65, 0, 2 * Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 95, 0, 2 * Math.PI); ctx.stroke();
        ctx.setLineDash([]);

        // Nucleus
        ctx.fillStyle = '#EF4444';
        ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('M⁺', cx - 5, cy + 3);

        // Orbiting excited electron jumping shells
        const orbitRadius = 65 + Math.sin(time * 1.5) * 15; // smooth excitation oscillation
        const angle = time * 0.8;
        const ex = cx + orbitRadius * Math.cos(angle);
        const ey = cy + orbitRadius * Math.sin(angle);

        // Flame energy arrows
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 90, cy + 80);
        ctx.lineTo(cx - 60, cy + 50);
        ctx.stroke();
        ctx.fillStyle = '#F59E0B';
        ctx.fillText('ΔE (FLAME)', cx - 115, cy + 90);

        // Excited electron halo
        const grad = ctx.createRadialGradient(ex, ey, 2, ex, ey, 14);
        grad.addColorStop(0, '#FFD700');
        grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(ex, ey, 14, 0, 2 * Math.PI); ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(ex, ey, 4, 0, 2 * Math.PI); ctx.fill();
        ctx.fillText('e⁻', ex + 6, ey + 3);

        // Emitted Photon Wave representation
        if (Math.sin(time) > 0) {
          ctx.strokeStyle = activeFlameSalt === 'Sodium' ? '#FFD700' :
                            activeFlameSalt === 'Copper' ? '#10B981' :
                            activeFlameSalt === 'Strontium' ? '#EF4444' :
                            activeFlameSalt === 'Potassium' ? '#C084FC' : '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          for (let i = 0; i < 60; i++) {
            const px = ex + i * 1.8;
            const py = ey - Math.sin(i * 0.4 + time * 5) * 10 - i * 0.3;
            ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.fillStyle = ctx.strokeStyle as string;
          ctx.fillText('PHOTON (hν)', ex + 40, ey - 20);
        }
      } 
      else {
        // Draw fluid particles colliding
        particles.forEach(p => {
          p.x += p.dx;
          p.y += p.dy;

          // Boundary bounce bounds
          if (p.x < 15 || p.x > canvas.width - 15) p.dx *= -1;
          if (p.y < 15 || p.y > canvas.height - 15) p.dy *= -1;

          // Draw ion circles
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 8px monospace';
          ctx.fillText(p.label, p.x - p.size + 2, p.y + 3);
        });
      }

      localFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(localFrameId);
    };
  }, [selectedTopicId, stepIndex, activeFlameSalt]);

  // Handle drag and drop chemical events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleChemicalDrop = (chemicalName: string) => {
    if (selectedTopicId === 'flame_test') {
      const elementSalt = chemicalName.split(' ')[0]; // E.g., 'Sodium'
      setActiveFlameSalt(elementSalt);
      setSolutionColor(
        elementSalt === 'Sodium' ? 'rgba(245, 158, 11, 0.95)' : // Golden yellow
        elementSalt === 'Copper' ? 'rgba(16, 185, 129, 0.95)' : // Turquoise
        elementSalt === 'Strontium' ? 'rgba(239, 68, 68, 0.95)' : // Crimson red
        elementSalt === 'Potassium' ? 'rgba(192, 132, 252, 0.95)' : 'rgba(59, 130, 246, 0.2)'
      );
    } else {
      setActiveBeakerSol(chemicalName);
    }
  };

  const submitQuiz = () => {
    const questions = quizQuestionsMap[selectedTopicId] || [];
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (quizAnswered[idx] === q.correct) {
        correctCount++;
      }
    });
    setScore(Math.round((correctCount / questions.length) * 100));
  };

  return (
    <div className="space-y-6" id="chemistry-virtual-lab-stage">
      {/* Banner & Objective header */}
      <div className="bg-[#09090B] border-2 border-[#1F1F23] p-5 shadow-[0_0_15px_rgba(255,215,0,0.05)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2 py-0.5 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-[9px] font-mono uppercase tracking-wider block mb-2 w-max">
              Professional Chemistry virtual lab
            </span>
            <h3 className="text-lg font-serif font-black italic text-zinc-100 flex items-center gap-2">
              <Beaker className="text-[#FFD700] h-5 w-5" /> Chemistry Virtual Laboratory & Synthesis
            </h3>
            <p className="text-xs text-zinc-400 font-serif mt-1">
              Interactive physical molecular engine modeling electronic configurations, stoichiometries, and flame ion transitions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-400">Select Lab Topic:</span>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-xs font-mono text-[#FFD700] outline-none px-3 py-1.5 rounded-none cursor-pointer"
            >
              <option value="titration">1. Acid-Base Titration (HCl + NaOH)</option>
              <option value="flame_test">2. Flame Tests (Emission Spectra)</option>
              <option value="electrolysis">3. Electrolysis (CuSO4 Solution)</option>
              <option value="stoichiometry">4. Stoichiometric Gas Evolution (Zn + HCl)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Lab Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Objective, Theory & Procedures Checklist (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-none space-y-4">
            <div>
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-1">01 // OBJECTIVE & THEORY</span>
              <h4 className="text-xs font-serif font-bold italic text-zinc-100 mb-2">{activeTopic.name}</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{activeTopic.objective}</p>
            </div>

            <div className="border-t border-zinc-800/60 pt-3">
              <h5 className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Micro-Level chemical theory</h5>
              <p className="text-[10.5px] text-zinc-400 leading-relaxed font-sans bg-zinc-900/50 p-2.5 border border-zinc-800/40">{activeTopic.theory}</p>
            </div>

            <div className="border-t border-zinc-800/60 pt-3 space-y-2">
              <h5 className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Required chemicals & apparatus</h5>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="bg-zinc-900 p-2 border border-zinc-800">
                  <span className="text-accent-gold font-bold block border-b border-zinc-800 pb-1 mb-1">CHEMICALS</span>
                  <ul className="space-y-1 list-disc pl-3 text-zinc-300">
                    {activeTopic.chemicals.map((chem, idx) => (
                      <li key={idx} className="leading-snug">{chem.split('(')[0]}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-zinc-900 p-2 border border-zinc-800">
                  <span className="text-purple-400 font-bold block border-b border-zinc-800 pb-1 mb-1">APPARATUS</span>
                  <ul className="space-y-1 list-disc pl-3 text-zinc-300">
                    {activeTopic.apparatus.map((app, idx) => (
                      <li key={idx} className="leading-snug">{app}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step-by-Step Interactive Checkpoint Procedure */}
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-none">
            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-2.5">02 // step-by-step procedures</span>
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {proceduresMap[selectedTopicId].map((proc, idx) => {
                const maxStepIdx = selectedTopicId === 'titration' ? 100 : 10;
                const stepFraction = Math.min(13, Math.floor((stepIndex / maxStepIdx) * 14));
                const isActiveStep = idx <= stepFraction;
                return (
                  <div 
                    key={idx} 
                    className={`p-2.5 border transition-all ${
                      isActiveStep 
                        ? 'bg-zinc-900 border-[#FFD700]/30 text-zinc-200 shadow-md' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <div className="flex items-start gap-2 text-xs">
                      <span className={`font-mono text-[9px] font-bold px-1 py-0.5 rounded ${isActiveStep ? 'bg-[#FFD700]/10 text-[#FFD700]' : 'bg-zinc-900 text-zinc-600'}`}>
                        Step {idx < 9 ? '0' : ''}{idx + 1}
                      </span>
                      <p className="flex-1 font-sans text-[11px] leading-relaxed">{proc}</p>
                    </div>
                    {isActiveStep && isExplainingStep && idx === stepFraction && (
                      <button 
                        onClick={() => setIsExplainingStep(false)}
                        className="mt-2 text-[9px] font-mono uppercase bg-[#FFD700] hover:bg-[#FFE55C] text-slate-950 font-bold py-1 px-2 flex items-center gap-1 cursor-pointer"
                      >
                        Confirm Understanding <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Panel: Interactive Virtual Lab Equipment & Controls (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-950 border-2 border-zinc-800 h-[360px] relative overflow-hidden flex flex-col justify-between p-4 shadow-inner">
            
            {/* Live Safety Warning Rail */}
            <div className="absolute top-3 left-3 right-3 bg-red-950/40 border border-red-800/40 p-2 flex items-start gap-2 z-10 font-mono text-[9px] text-red-300">
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
              <div>
                <span className="font-bold uppercase tracking-wider block">LIVE LAB SAFETY GUIDELINE:</span>
                <p className="font-sans leading-tight mt-0.5">{activeTopic.safety[0]}</p>
              </div>
            </div>

            {/* Simulated Equipment Drawing Canvas Stage */}
            <div className="flex-1 flex items-center justify-center relative mt-12 select-none">
              
              {/* Burette / Pipette for Titration */}
              {selectedTopicId === 'titration' && (
                <div className="absolute top-0 flex flex-col items-center">
                  <div className="w-4 h-32 border-2 border-zinc-700 bg-white/20 relative flex items-end justify-center">
                    {/* Liquid standard NaOH levels */}
                    <div 
                      style={{ height: `${100 - stepIndex}%` }}
                      className="w-full bg-blue-300/45 transition-all duration-300"
                    />
                    {/* Level ticks */}
                    <div className="absolute left-0 right-0 top-2 h-[1px] bg-zinc-600" />
                    <div className="absolute left-0 right-0 top-10 h-[1px] bg-zinc-600" />
                    <div className="absolute left-0 right-0 top-20 h-[1px] bg-zinc-600" />
                    <span className="absolute text-[8px] font-mono text-zinc-400 right-[-32px]">Burette (NaOH)</span>
                  </div>
                  {/* Burette stopcock */}
                  <div className="w-6 h-4 bg-zinc-800 border border-zinc-600 my-1 relative">
                    <span className={`absolute left-2.5 top-0 w-1 h-4 bg-red-500 transition-transform ${isPlaying ? 'rotate-90' : ''}`} />
                  </div>
                  {/* Drop sequence */}
                  {isPlaying && (
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping absolute bottom-[-16px] duration-500" />
                  )}
                </div>
              )}

              {/* Bunsen Burner Flame Stage for Flame Tests */}
              {selectedTopicId === 'flame_test' && (
                <div className="absolute bottom-4 flex flex-col items-center">
                  {/* The glowing Bunsen burner flame */}
                  <div className="relative w-14 h-24 mb-1">
                    <div 
                      style={{ backgroundColor: solutionColor }}
                      className="absolute inset-x-2 bottom-0 rounded-t-full transition-all duration-300 blur-[2px] animate-pulse"
                    />
                    <div className="absolute inset-x-4 bottom-0 h-16 bg-blue-400/80 rounded-t-full blur-[1.5px]" />
                  </div>
                  <div className="w-8 h-12 bg-zinc-800 border border-zinc-700" />
                  <div className="w-16 h-2 bg-zinc-900 border border-zinc-800" />
                  <span className="text-[8px] font-mono text-zinc-400 mt-1">Bunsen Burner Gas Valve</span>
                </div>
              )}

              {/* Chemical Drag and Drop chemicals shelf */}
              {selectedTopicId === 'flame_test' && activeFlameSalt === 'None' && (
                <div className="absolute left-3 top-16 bg-zinc-900/90 border border-zinc-800 p-2.5 text-[9px] font-mono space-y-1.5">
                  <span className="text-accent-gold block border-b border-zinc-800 pb-1 font-bold">DRAG SALT TO FLAME</span>
                  {['Sodium Chloride (NaCl)', 'Copper Chloride (CuCl₂)', 'Strontium Chloride (SrCl₂)', 'Potassium Chloride (KCl)'].map((salt) => (
                    <div 
                      key={salt}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text', salt)}
                      className="px-2 py-1 bg-zinc-950 border border-zinc-800 cursor-grab hover:bg-zinc-800 hover:text-white transition-all text-zinc-300"
                    >
                      {salt}
                    </div>
                  ))}
                </div>
              )}

              {/* Beaker Container displaying physical fluid, precipitate particles & gas bubble layers */}
              {selectedTopicId !== 'flame_test' && (
                <div className="absolute bottom-2 w-32 h-36 border-4 border-t-0 border-zinc-700 bg-zinc-950/40 relative rounded-b-md flex flex-col justify-end">
                  {/* Liquid reactive volume */}
                  <div 
                    style={{ 
                      height: `${selectedTopicId === 'titration' ? 40 + stepIndex * 0.3 : 60}%`,
                      backgroundColor: solutionColor
                    }}
                    className="w-full absolute bottom-0 left-0 transition-all duration-200"
                  />

                  {/* Bubble array rendering inside the liquid */}
                  {gasBubbles.map((bubble, idx) => (
                    <div 
                      key={idx}
                      style={{ 
                        left: `${bubble.x}%`, 
                        bottom: `${bubble.y}%`,
                        width: `${bubble.size}px`,
                        height: `${bubble.size}px`
                      }}
                      className="absolute bg-white/60 rounded-full animate-bounce"
                    />
                  ))}

                  {/* Electrolysis Electrodes (Anode / Cathode) */}
                  {selectedTopicId === 'electrolysis' && (
                    <div className="absolute inset-0 flex justify-around px-4">
                      {/* Cathode Negative electrode */}
                      <div className="w-3 h-28 bg-zinc-400 relative border border-zinc-600 flex flex-col justify-end">
                        {/* Copper layer plating out */}
                        {cathodeMassGained > 0 && (
                          <div 
                            style={{ height: `${Math.min(100, cathodeMassGained * 1.5)}%` }}
                            className="absolute inset-x-[-2px] bg-amber-700/80 border border-amber-600/60 rounded-sm"
                          />
                        )}
                        <span className="absolute text-[6px] font-mono bg-zinc-900 text-red-400 px-0.5 top-0 left-[-4px] select-none font-bold">C(-)</span>
                      </div>
                      
                      {/* Anode Positive electrode */}
                      <div className="w-3 h-28 bg-zinc-400 relative border border-zinc-500">
                        <span className="absolute text-[6px] font-mono bg-zinc-900 text-blue-400 px-0.5 top-0 right-[-4px] select-none font-bold">A(+)</span>
                      </div>
                    </div>
                  )}

                  {/* Zinc Stoichiometric reactive pieces */}
                  {selectedTopicId === 'stoichiometry' && stepIndex < 10 && (
                    <div className="absolute bottom-1 left-2 right-2 flex justify-center gap-1">
                      <div className="w-2.5 h-2 bg-zinc-400 rounded-sm animate-pulse" />
                      <div className="w-2.5 h-2 bg-zinc-400 rounded-sm animate-pulse" />
                      <div className="w-2.5 h-2 bg-zinc-400 rounded-sm animate-pulse" />
                    </div>
                  )}

                  {/* Flask/Beaker measurement volume label */}
                  <span className="absolute text-[8px] font-mono text-zinc-500 left-[-24px] bottom-10">200mL</span>
                  <span className="absolute text-[8px] font-mono text-zinc-500 left-[-24px] bottom-20">100mL</span>
                </div>
              )}

              {/* Balloon component for stoichiometric gas evolution */}
              {selectedTopicId === 'stoichiometry' && (
                <div className="absolute bottom-36 flex flex-col items-center">
                  <div 
                    style={{ transform: `scale(${balloonSize})` }}
                    className="w-16 h-20 bg-red-600/90 rounded-full transition-transform duration-300 relative shadow-lg flex items-center justify-center"
                  >
                    <span className="text-[7px] font-mono text-white/80 uppercase font-bold tracking-wider">H₂ Gas</span>
                  </div>
                  {/* Balloon neck connector */}
                  <div className="w-3 h-4 bg-red-700 border border-red-800" />
                </div>
              )}

            </div>

            {/* Real-time Laboratory Instruments overlay readout */}
            <div className="bg-zinc-900 p-2.5 border border-zinc-800 font-mono text-[9px] flex justify-between text-zinc-400 select-text">
              <div>
                <span className="text-zinc-500 block uppercase font-bold">Digital Ph Meter:</span>
                <span className="text-accent-gold font-bold text-xs">
                  {selectedTopicId === 'titration' ? pHValue.toFixed(2) : '7.00'}
                </span>
              </div>
              <div className="border-l border-zinc-800/80 pl-2">
                <span className="text-zinc-500 block uppercase font-bold">Lab Thermometer:</span>
                <span className="text-zinc-300 font-bold text-xs">{temperature.toFixed(1)}°C</span>
              </div>
              <div className="border-l border-zinc-800/80 pl-2">
                <span className="text-zinc-500 block uppercase font-bold">Spectroscopic State:</span>
                <span className="text-zinc-300 font-bold block uppercase mt-0.5">
                  {selectedTopicId === 'flame_test' ? activeFlameSalt : activeBeakerSol}
                </span>
              </div>
            </div>

          </div>

          {/* Interactive Sliders and Play/Pause controls container */}
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-none space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                Lab Controls & Speed Variables
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded text-xs font-mono text-zinc-300 flex items-center gap-1 cursor-pointer"
                  title="Play / Pause reaction sequence"
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5 text-rose-500" /> : <Play className="h-3.5 w-3.5 text-emerald-500" />}
                  <span className="text-[9.5px] uppercase">{isPlaying ? 'Pause' : 'Synthesize'}</span>
                </button>
                
                <button
                  onClick={resetSimulation}
                  className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded text-xs font-mono text-zinc-300 flex items-center gap-1 cursor-pointer"
                  title="Reset laboratory setup"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-[#FFD700]" />
                  <span className="text-[9.5px] uppercase">Reset</span>
                </button>
              </div>
            </div>

            {/* Adjustable Experiment Sliders */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                  <span>Reactivity concentration / Standard solution:</span>
                  <span className="text-[#FFD700] font-bold">{concentration.toFixed(2)} M</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.50"
                  step="0.05"
                  value={concentration}
                  onChange={(e) => setConcentration(parseFloat(e.target.value))}
                  className="w-full accent-[#FFD700] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                  <span>Chemical Quantity (Analyte volume or reactant mass):</span>
                  <span className="text-purple-400 font-bold">
                    {selectedTopicId === 'stoichiometry' ? `${quantity / 10} g (Zinc)` : `${quantity} mL`}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              {selectedTopicId === 'electrolysis' && (
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                    <span>Power supply DC Battery voltage:</span>
                    <span className="text-blue-400 font-bold">{batteryVoltage} V</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="1"
                    value={batteryVoltage}
                    onChange={(e) => setBatteryVoltage(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Speed multiplier selection */}
              <div>
                <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Simulation rate clock:
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono">
                  {[[0.5, '0.5x (Slow-Mo)'], [1.0, '1.0x (Normal)'], [2.0, '2.0x (Accelerated)']].map(([rate, label]: any) => (
                    <button
                      key={rate}
                      onClick={() => setSpeedMultiplier(rate)}
                      className={`py-1 rounded border text-center transition cursor-pointer ${
                        speedMultiplier === rate 
                          ? 'bg-[#FFD700]/10 border-[#FFD700] text-[#FFD700] font-bold' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Microscopic Sub-Atomic Particle Simulator (Col 3) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-none h-[420px] flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-1">03 // microscopic observer</span>
              <h4 className="text-xs font-serif font-bold italic text-zinc-100 mb-1">Atomic-Level Electron & Ion Orbitals</h4>
              <p className="text-[10px] text-zinc-400 font-sans leading-snug">
                Real-time particle projection demonstrating dynamic bonds, electron transfers, and molecular collision paths.
              </p>
            </div>

            {/* Particle Canvas wrapper */}
            <div className="flex-1 bg-zinc-900/40 border border-zinc-800/80 my-3 relative overflow-hidden rounded-sm">
              <canvas 
                ref={particleCanvasRef}
                width={240}
                height={200}
                className="w-full h-full block bg-[#0D0D0E]"
              />
              <span className="absolute bottom-1 right-2 text-[7px] font-mono text-zinc-600 uppercase select-none">360° Zoom Projection</span>
            </div>

            <div className="bg-zinc-900 p-2.5 border border-zinc-800 font-mono text-[9px] leading-relaxed text-zinc-400 select-all">
              <span className="text-accent-gold block border-b border-zinc-800 font-bold uppercase pb-0.5 mb-1">balanced equation:</span>
              <p className="font-bold text-zinc-100 text-[10px] mb-1">{activeTopic.equation}</p>
              <span className="text-purple-400 block border-b border-zinc-800 font-bold uppercase pb-0.5 mb-1">net ionic formula:</span>
              <p className="font-sans text-zinc-300 leading-normal">{activeTopic.ionicEquation}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Panel: Reaction Explanation & Lab Report Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Reaction Detailed Mechanics & Industrial applications */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-none space-y-4 select-text">
          <h4 className="text-sm font-serif font-black italic text-zinc-100 border-b border-zinc-800 pb-2 flex items-center gap-1.5">
            <Sparkles className="text-accent-gold h-4 w-4" /> Molecular Reactions Mechanism Breakdown
          </h4>
          <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{activeTopic.explanation}</p>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-800/60">
            <div>
              <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-wider block mb-1">COMMON LABORATORY MISTAKES</span>
              <ul className="space-y-1 list-disc pl-3 text-[10px] font-sans text-zinc-400">
                {activeTopic.mistakes.map((m, idx) => (
                  <li key={idx} className="leading-tight">{m}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1">INDUSTRIAL APPLICATIONS</span>
              <ul className="space-y-1 list-disc pl-3 text-[10px] font-sans text-zinc-400">
                {activeTopic.applications.map((app, idx) => (
                  <li key={idx} className="leading-tight">{app}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* VIVA Questions & Answers */}
          <div className="pt-3 border-t border-zinc-800/60">
            <span className="text-[9px] font-mono font-bold text-[#FFD700] uppercase tracking-wider block mb-2">VIVA / PRACTICAL INTERVIEW Q&A</span>
            <div className="space-y-2.5">
              {activeTopic.viva.map((v, idx) => (
                <div key={idx} className="text-[10px] font-mono bg-zinc-900 p-2.5 border border-zinc-800/60 text-left">
                  <span className="font-bold text-zinc-200 block">Q: {v.q}</span>
                  <p className="text-zinc-400 font-sans mt-1">A: {v.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Lab Report Quiz & Assignment compiler */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-none space-y-4">
          <h4 className="text-sm font-serif font-black italic text-zinc-100 border-b border-zinc-800 pb-2 flex items-center gap-1.5">
            <Award className="text-emerald-500 h-4.5 w-4.5" /> Interactive Lab Report Quiz & Self-Assessment
          </h4>
          <p className="text-[11.5px] text-zinc-400 font-serif leading-relaxed">
            Verify experimental mechanics, electronic shells, and molar mathematics coefficients to compile verified marks.
          </p>

          <div className="space-y-4 pt-2">
            {quizQuestionsMap[selectedTopicId].map((q, qIdx) => (
              <div key={qIdx} className="space-y-2 text-left">
                <span className="text-xs font-mono font-bold text-zinc-300 block">
                  {qIdx + 1}. {q.q}
                </span>
                <div className="grid grid-cols-1 gap-1.5 text-xs font-sans">
                  {q.choices.map((choice, cIdx) => {
                    const isSelected = quizAnswered[qIdx] === cIdx;
                    return (
                      <button
                        key={cIdx}
                        onClick={() => setQuizAnswered(prev => ({ ...prev, [qIdx]: cIdx }))}
                        className={`w-full p-2 rounded-none border text-left transition duration-150 cursor-pointer ${
                          isSelected 
                            ? 'bg-[#FFD700]/10 border-[#FFD700] text-[#FFD700] font-semibold' 
                            : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-850 text-zinc-300'
                        }`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {score === null ? (
              <button
                onClick={submitQuiz}
                disabled={Object.keys(quizAnswered).length < quizQuestionsMap[selectedTopicId].length}
                className="w-full bg-[#1A1A1A] hover:bg-zinc-800 text-[#FFD700] border border-[#FFD700]/30 py-2 text-xs font-mono uppercase tracking-wider disabled:opacity-40 cursor-pointer"
              >
                Compile Lab Marks & Export Report
              </button>
            ) : (
              <div className="p-4 bg-zinc-900 border-2 border-dashed border-emerald-500/30 text-center space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-400 block uppercase tracking-wider">
                  🧪 LAB ASSESSMENT COMPLETION RECONSTRUCTED
                </span>
                <p className="text-xl font-bold font-serif text-[#FFD700]">Score: {score}%</p>
                <p className="text-[10px] text-zinc-400 font-sans">
                  Compiled securely. Your answers matched chemical parameters. Proceed to the next concept or retry.
                </p>
                <button
                  onClick={() => { setQuizAnswered({}); setScore(null); }}
                  className="mt-2 text-[9px] font-mono text-zinc-400 underline hover:text-[#FFD700]"
                >
                  Reset Assessment Sheet
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

// Sub-procedure lists (14-step teaching workflow per experiment)
const proceduresMap: Record<string, string[]> = {
  titration: [
    'Equip safety goggles and heavy nitrile gloves before handling corrosives.',
    'Switch on ventilation inside the fume hood hazard cabinet.',
    'Rinse the Erlenmeyer flask twice with deionized water for sterilization.',
    'Measure precisely 20mL of unknown HCl solution using a volumetric pipette.',
    'Carefully release the measured acid into the Erlenmeyer flask.',
    'Add exactly 2-3 drops of Phenolphthalein indicator and swirl to verify transparency.',
    'Secure the graduated burette onto the stable retort metal stand.',
    'Rinse and fill the burette with 0.1M standard NaOH up to the 0.0mL mark.',
    'Dip the digital pH probe to record the starting acidic pH baseline.',
    'Open the burette stopcock to begin dropwise titration of standard NaOH.',
    'Observe the micro-level molecular neutralization of hydronium and hydroxide ions.',
    'Watch for transient localized pink swirls as the equivalence boundary nears.',
    'Swirl continuously until a faint pink endpoint persists permanently for 30s.',
    'Calculate the unknown HCl molarity using the volume used (MaVa = MbVb) and save data.'
  ],
  flame_test: [
    'Equip heat-resistant leather gloves and high-impact safety goggles.',
    'Inspect the active fume hood vent to prevent inhalation of metal vapors.',
    'Dip the platinum/nichrome wire loop into 3M Concentrated Hydrochloric Acid.',
    'Heat the loop in the Bunsen burner flame core to burn off contaminant residues.',
    'Place a clean sterile watch glass on the digital analytical scale.',
    'Tare the electronic scale and deposit exactly 0.5g of metal chloride salt.',
    'Moisten the sterile loop in acid and dip into the sample to adhere crystals.',
    'Align the atomic emission spectrometer detector with the burner mouth.',
    'Turn on the burner gas regulator and ignite a steady blue non-luminous flame.',
    'Plunge the crystalline loop directly into the hottest outer region of the flame.',
    'Observe the immediate intense characteristic color flash (crimson, violet, green).',
    'Verify atomic emission line spectra on the digitized screen spectrometer.',
    'Plunge the hot wire back into the 3M HCl bath to thoroughly clean the loop.',
    'Publish the quantum electron relaxation energy level data to the lab board.'
  ],
  electrolysis: [
    'Put on splash-proof safety goggles, lab apron, and heavy-duty gloves.',
    'Switch on the laboratory fume hood fan to vent any toxic evolved gas.',
    'Scrub and rinse the glass cell container vessel with deionized water.',
    'Weigh both blank copper electrode plates precisely on the analytical balance.',
    'Measure precisely 150mL of blue 1.0M Copper Sulfate solution in a graduated cylinder.',
    'Pour the copper sulfate electrolyte solution into the cell beaker.',
    'Suspend the clean copper anode and cathode plates vertically in the holder.',
    'Connect the colored lead alligator clips to power supply terminals.',
    'Calibrate the digital current and voltage meters to baseline.',
    'Set power supply to 4.0V DC and switch the live power supply trigger on.',
    'Monitor bubbles at the anode and copper plating reduction at the cathode.',
    'De-energize the circuit, dry electrodes thoroughly, and record mass gain.',
    'Apply Faraday\'s laws of electrolysis to calculate the theoretical charge passed.',
    'Save and export the electrical deposition efficiency calculations to the ledger.'
  ],
  stoichiometry: [
    'Fit explosive-gas rated safety goggles and heavy nitrile gloves.',
    'Start the fume hood exhaust to prevent hydrogen gas accumulation.',
    'Inspect the gas delivery flask to ensure the rubber fitting is hermetic.',
    'Weigh precisely 1.50 grams of active granular Zinc metal on a watch glass.',
    'Measure and pour 30mL of 3M Hydrochloric Acid into the delivery flask.',
    'Fit the neck of a deflated gas balloon securely over the delivery nozzle.',
    'Clamp the safety valves to verify a completely air-tight system.',
    'Tare the digital gas displacement flow meter to baseline zero.',
    'Quickly uncap the side port, add zinc granules, and seal the stopper.',
    'Observe immediate aggressive effervescence and initial balloon inflation.',
    'Record the exothermic temperature spike using the digital thermal probe.',
    'Allow the reaction to run until zinc fully dissolves and balloon size stabilizes.',
    'Use the ideal gas law (PV=nRT) to calculate the moles of Hydrogen gas evolved.',
    'Neutralize excess acid with sodium carbonate and submit the percentage yield report.'
  ]
};

// Practical examination questions mapping
const quizQuestionsMap: Record<string, { q: string; choices: string[]; correct: number }[]> = {
  titration: [
    {
      q: 'What is the color change of Phenolphthalein indicator at the titration endpoint?',
      choices: ['Colorless to Light Pink', 'Yellow to Orange', 'Blue to Crimson', 'Colorless to Dark Brown'],
      correct: 0
    },
    {
      q: 'If the NaOH burette has bubble gaps at the tip before starting, how does this affect the calculated acid molarity?',
      choices: ['No difference', 'Artificially high calculated acid concentration', 'Artificially low calculated acid concentration', 'Endpoint becomes neutral'],
      correct: 1
    }
  ],
  flame_test: [
    {
      q: 'Which visible light wavelength matches the Strontium cation emission spectrum?',
      choices: ['Crimson Red (~640nm)', 'Turquoise Green (~510nm)', 'Golden Yellow (~589nm)', 'Lilac Violet (~404nm)'],
      correct: 0
    },
    {
      q: 'What is the physical cause of the flame emission light?',
      choices: ['Combustion of nitrogen molecules', 'Electron relaxation from excited shell to ground state', 'Ionization of oxygen atoms', 'Oxidation of the platinum wire'],
      correct: 1
    }
  ],
  electrolysis: [
    {
      q: 'At which electrode does copper plating reduction deposit occur?',
      choices: ['Anode (+)', 'Cathode (-)', 'Both electrodes equally', 'Electrolyte boundary'],
      correct: 1
    },
    {
      q: 'Why does the blue color intensity of the CuSO4 solution stay constant during copper-electrode electrolysis?',
      choices: ['Sulfate ions undergo reduction', 'Copper anode dissolution rate matches cathode deposition rate', 'Water gets electrolyzed', 'Copper sulfate acts as a buffer'],
      correct: 1
    }
  ],
  stoichiometry: [
    {
      q: 'How many moles of Hydrogen gas are evolved per mole of Zinc metal reacted?',
      choices: ['0.5 Moles', '1.0 Moles', '2.0 Moles', '3.0 Moles'],
      correct: 1
    },
    {
      q: 'What STP volume is occupied by 0.05 moles of ideal gas?',
      choices: ['1.12 Liters (1120 mL)', '22.4 Liters (22400 mL)', '2.24 Liters (2240 mL)', '0.56 Liters (560 mL)'],
      correct: 0
    }
  ]
};
