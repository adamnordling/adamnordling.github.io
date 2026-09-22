export interface CourseData {
    code: string;
    title: { en: string; sv: string };
    desc: { en: string; sv: string };
    meta: { en: string; sv: string };
    links?: { label: string; url: string }[];
}

export const EDUCATION_COURSES: Record<string, CourseData> = {
    // =========================================================================
    // MASTER'S PROGRAMME (16 COURSES)
    // =========================================================================
    '4DV650': {
        code: '4DV650 · 5 HP (A1N)',
        title: {
            en: 'Systems Modeling and Simulation',
            sv: 'Systemmodellering och simulering'
        },
        desc: {
            en: 'Design and evaluation of deterministic and stochastic models. Focuses on event-driven simulations, continuous physical systems, queueing bottleneck analysis, agent-based multi-agent systems, and Monte Carlo sampling.',
            sv: 'Design och utvärdering av deterministiska och stokastiska modeller. Fokuserar på händelsestyrda simuleringar, köteori, agentbaserade system och Monte Carlo-metoder.'
        },
        meta: {
            en: '<strong>Practical Work:</strong> Simulated queueing bottlenecks and agent interactions in Simulink/Modelica. Written take-home examination.',
            sv: '<strong>Examination:</strong> Simuleringsmoduler i Simulink/Modelica samt teoretisk hemtentamen.'
        }
    },
    '4DV507': {
        code: '4DV507 · 5 HP (A1N)',
        title: {
            en: 'Code Transformation and Interpretation',
            sv: 'Kodtransformation och interpretatorer'
        },
        desc: {
            en: 'Full compiler pipeline construction: lexical analysis, Context-Free Grammars with ANTLR, Abstract Syntax Tree (AST) construction, symbol tables, static type checking, target code generation to Python, and bytecode execution via ASM.',
            sv: 'Komplett kompilatorkonstruktion: lexikal analys, syntaxanalys med ANTLR, AST-konstruktion, symboltabeller, statisk typkontroll, kodgenerering till Python och ASM-bytekod.'
        },
        meta: {
            en: '<strong>Projects:</strong> Built 4-stage compiler in Java from scratch; written campus exam on parsing theory and bytecode interpreters.',
            sv: '<strong>Projekt:</strong> Skrev 4-stegs kompilator i Java med ANTLR och ASM-interpretator; salstentamen.'
        }
    },
    '4DV651': {
        code: '4DV651 · 10 HP (A1N)',
        title: {
            en: 'Project in Model-based Development',
            sv: 'Projekt i modellbaserad utveckling'
        },
        desc: {
            en: 'Model-Driven Software Engineering (MDSE): domain-specific modeling using the Eclipse Modeling Framework (EMF), Model-to-Model (M2M) transformations with QVTo, Model-to-Text (M2T) generation with Acceleo, and Papyrus UML Profiles.',
            sv: 'Modellbaserad mjukvaruutveckling (MDSE): metamodellering i EMF, M2M-transformationer i QVTo, M2T-kodgenerering i Acceleo och UML-profiler i Papyrus.'
        },
        meta: {
            en: '<strong>Deliverables:</strong> Engineered an end-to-end model transformation pipeline deployed in Docker, supported by group architecture and reflection reports.',
            sv: '<strong>Projekt:</strong> Konstruerade en komplett modelltrafoskedja körd i Docker samt teknisk slutrapport.'
        }
    },
    '4DV701': {
        code: '4DV701 · 5 HP (A1N)',
        title: {
            en: 'Formal Methods',
            sv: 'Formella metoder'
        },
        desc: {
            en: 'Mathematical reasoning and correctness verification: axiomatic semantics, Hoare logic (preconditions, postconditions, loop invariants) in Dafny, concurrent timed automata, and temporal logic (LTL/CTL) verification in UPPAAL.',
            sv: 'Formell programkorrekthet och matematisk verifiering: Hoare-logik och automatiska bevis i Dafny samt modellprovning av tidskritiska automater (LTL/CTL) i UPPAAL.'
        },
        meta: {
            en: '<strong>Practical Labs:</strong> Formally verified recursive algorithms in Dafny; modeled reactive systems in UPPAAL; final theoretical home exam.',
            sv: '<strong>Laborationer:</strong> Bevisade algoritmer i Dafny; verifierade tillståndsrymder i UPPAAL; hemtentamen.'
        }
    },
    '4DV504': {
        code: '4DV504 · 5 HP (A1N)',
        title: {
            en: 'Selected Topics in Computer Science',
            sv: 'Valda ämnen inom datavetenskap'
        },
        desc: {
            en: 'Advanced research seminar analyzing contemporary software engineering paradigms: Self-Adaptive Software Systems, feedback loops, runtime verification, and Human-Computer Interaction (HCI).',
            sv: 'Avancerad forskningskurs med fokus på självadaptiva programvarusystem, arkitekturella återkopplingsloopar och människa-datorinteraktion.'
        },
        meta: {
            en: '<strong>Outputs:</strong> Published a popular-science research blog post, completed double-blind peer reviews, and delivered a video defense on state-of-the-art literature.',
            sv: '<strong>Moment:</strong> Författade populärvetenskaplig artikel, peer review och muntlig videopresentation.'
        }
    },
    '4DV660': {
        code: '4DV660 · 5 HP (A1N)',
        title: {
            en: 'Machine Learning',
            sv: 'Maskininlärning'
        },
        desc: {
            en: 'Mathematical modeling and scientific pipeline implementation: multiple linear regression, logistic classification, decision trees, random forests, kernel Support Vector Machines (SVM), K-Means clustering, and PCA dimensionality reduction.',
            sv: 'Matematisk modellering och maskininlärningspipor: multipel regression, logistisk klassificering, beslutsträd, SVM, K-Means-klustring och PCA.'
        },
        meta: {
            en: '<strong>Assignments:</strong> Programmed 7 end-to-end Python pipelines in NumPy, Pandas, and Scikit-Learn evaluating bias-variance tradeoffs and F-statistics.',
            sv: '<strong>Uppgifter:</strong> Implementerade 7 maskininlärningspipor i Scikit-Learn och Pandas i Jupyter Notebook.'
        }
    },
    '4DV657': {
        code: '4DV657 · 5 HP (A1N)',
        title: {
            en: 'Parallel Computing',
            sv: 'Parallella beräkningar'
        },
        desc: {
            en: 'High-performance computing and concurrent architectures: multi-core cache coherence, memory walls, C++11 concurrency, OpenMP compiler directives, MPI message-passing, and massively parallel SIMT CUDA programming on GPU architectures.',
            sv: 'Högpresterande och parallell beräkning: minneshierarkier, C++11-flertrådning, OpenMP-direktiv, distribuerad MPI och SIMT CUDA-programmering på NVIDIA GPU.'
        },
        meta: {
            en: '<strong>Projects:</strong> Benchmarked parallel sorting and Pearson correlation in C++/OpenMP; engineered CUDA reduction kernels on LNU GPU clusters; live oral code defense.',
            sv: '<strong>Projekt:</strong> Optimerade parallell sortering och Pearson-korrelation; skrev CUDA-kernels för GPU-reduktioner.'
        }
    },
    '4DV652': {
        code: '4DV652 · 10 HP (A1N)',
        title: {
            en: 'Project in Data Intensive Systems',
            sv: 'Projekt i dataintensiva system'
        },
        desc: {
            en: 'Engineering large-scale data architectures: exploratory data cleansing, training and scaling machine learning pipelines, and deploying distributed data consumption services in realistic production settings.',
            sv: 'Storskaliga dataintensiva system: datatvätt, feature engineering, träning och skalning av ML-modeller samt konstruktion av distribuerade dataflöden.'
        },
        meta: {
            en: '<strong>Deliverables:</strong> Delivered 18 progressive agile milestones across data ingestion, feature extraction, model tuning, and final deployment.',
            sv: '<strong>Moment:</strong> Levererade 18 iterativa milstolpar från dataingestion och modelloptimering till driftsättning.'
        }
    },
    '4DV661': {
        code: '4DV661 · 5 HP (A1N)',
        title: {
            en: 'Deep Machine Learning',
            sv: 'Djup maskininlärning'
        },
        desc: {
            en: 'Deep neural architectures: Convolutional Neural Networks (CNNs) for computer vision, optimization algorithms (Adam, RMSProp), regularization (dropout, batch norm), Recurrent Neural Networks (RNNs), LSTMs for time-series, and Reinforcement Learning (RL).',
            sv: 'Djupa neurala nätverk: CNN för datorseende, optimeringsalgoritmer, regularisering (dropout/batch norm), RNN och LSTM för tidsserier samt förstärkningsinlärning.'
        },
        meta: {
            en: '<strong>Assignments:</strong> Programmed neural classifiers in TensorFlow/Keras, tuned hyperparameters, trained sequence LSTMs, and evaluated convergence.',
            sv: '<strong>Uppgifter:</strong> Tränade konvolutionella nätverk, byggde tidsserie-LSTMs och utvärderade konvergens.'
        }
    },
    '2DV614': {
        code: '2DV614 · 5 HP (G2F)',
        title: {
            en: 'Lean Startup',
            sv: 'Lean Startup'
        },
        desc: {
            en: 'Entrepreneurship under extreme uncertainty: Design Thinking principles (empathy, ideation, prototyping), Lean Canvas assumption mapping, rapid customer discovery, building MVPs, and the Build-Measure-Learn feedback loop.',
            sv: 'Entreprenörskap under osäkerhet: Design Thinking, Lean Canvas-modellering, kundintervjuer, framtagning av MVP och iterativa Build-Measure-Learn-loopar.'
        },
        meta: {
            en: '<strong>Deliverables:</strong> Formulated business model hypotheses, validated real user assumptions, constructed an MVP prototype, and pitched in seminar rounds.',
            sv: '<strong>Projekt:</strong> Byggde och validerade en MVP mot riktiga användare med Lean Canvas och pitchseminarier.'
        }
    },
    '4DV805': {
        code: '4DV805 · 5 HP (A1N)',
        title: {
            en: 'Information Visualization',
            sv: 'Informationsvisualisering'
        },
        desc: {
            en: 'Perception theory, cognitive design, pre-attentive processing, dynamic query filters, zooming/panning, multidimensional data visualization (parallel coordinates, scatterplot matrices), and interactive Plotly Dash web dashboards.',
            sv: 'Perceptionsteori, kognitiv design, dynamisk filtrering och visualisering av flerdimensionella datamängder (parallella koordinater) i interaktiva Dash-gränssnitt.'
        },
        meta: {
            en: '<strong>Project:</strong> Built the Barcelona 2017 Traffic Accident visual analytics dashboard in Python (Dash, Pandas, Plotly); individual oral theory exam.',
            sv: '<strong>Projekt:</strong> Utvecklade interaktiv dashboard för Barcelonas trafikolyckor 2017 i Plotly/Dash; muntlig salstentamen.'
        }
    },
    '4DV510': {
        code: '4DV510 · 5 HP (A1F)',
        title: {
            en: 'Data Mining',
            sv: 'Data Mining'
        },
        desc: {
            en: 'Algorithmic data mining from first principles: K-Means, DBSCAN density clustering, Sammon Mapping, graph modularity, Fast Newman community detection, Local Outlier Factor (LOF), and vector space document retrieval.',
            sv: 'Algoritmisk data mining från grunden: DBSCAN-densitetsklustring, Sammon Mapping, Fast Newman-nätverksdetektering, LOF-avvikelseanalys och text mining.'
        },
        meta: {
            en: '<strong>Framework:</strong> Engineered an extensible Python Data Mining Software Framework integrating clustering, dimensionality reduction, and network algorithms; oral defense.',
            sv: '<strong>Projekt:</strong> Utvecklade ett modulärt Data Mining-ramverk i Python med egna algoritmer; muntlig tentamen.'
        }
    },
    '4DV807': {
        code: '4DV807 · 10 HP (A1F)',
        title: {
            en: 'Project in Visualization and Data Analysis',
            sv: 'Projekt i visualisering och dataanalys'
        },
        desc: {
            en: 'Visual analytics engineering: coupling statistical analysis and machine learning backends with interactive web dashboards on large datasets (VAST Challenge data), containerized in Docker, and formal user study evaluation.',
            sv: 'Visuell dataanalys: integration av maskininlärning och interaktiva webbdashboards för storskaliga dataströmmar (VAST Challenge), paketerat i Docker, samt användarstudier.'
        },
        meta: {
            en: '<strong>Deliverables:</strong> Deployed a full visual analytics application, executed formal quantitative user usability studies, and passed an individual technical interview.',
            sv: '<strong>Moment:</strong> Levererade Dockeriserat visual analytics-system, genomförde användarstudie och teknisk intervju.'
        }
    },
    '4DV806': {
        code: '4DV806 · 5 HP (A1F)',
        title: {
            en: 'Advanced Information Visualization and Applications',
            sv: 'Avancerad informationsvisualisering och tillämpningar'
        },
        desc: {
            en: 'Advanced visual analytics: hierarchical tree layouts, non-linear dimensionality reduction projections (t-SNE, UMAP), temporal visual representations, and text document visualization.',
            sv: 'Avancerad visualisering: hierarkiska trädlayouter, icke-linjär dimensionsreduktion (t-SNE, UMAP), tidsserievisualisering och text mining.'
        },
        meta: {
            en: '<strong>Projects:</strong> Built 3 interactive visual applications combining clustering with non-linear projections; passed comprehensive theoretical oral examination.',
            sv: '<strong>Projekt:</strong> Utvecklade 3 applikationer för trädlayouter och UMAP/t-SNE-projektioner; muntlig tentamen.'
        }
    },
    '4DV502': {
        code: '4DV502 · 5 HP (A1N)',
        title: {
            en: 'Scientific Methods in Computer Science',
            sv: 'Vetenskapliga metoder inom datavetenskap'
        },
        desc: {
            en: 'Research methodology: epistemology, systematic literature reviews (SLR), empirical experimental design, data collection standards, research ethics, and academic opposition.',
            sv: 'Forskningsmetodik: vetenskapsteori, systematiska litteraturöversikter (SLR), empirisk experimentdesign, forskningsetik och vetenskaplig opposition.'
        },
        meta: {
            en: '<strong>Deliverables:</strong> Delivered a peer-reviewed research proposal for the Master’s thesis project and served as official opponent on a peer thesis plan.',
            sv: '<strong>Moment:</strong> Författade och försvarade forskningsplan för examensarbetet samt genomförde opposition.'
        }
    },
    '5DV50E': {
        code: '5DV50E · 30 HP (A2E)',
        title: {
            en: "Master's Thesis in Computer Science",
            sv: 'Examensarbete på masternivå i datavetenskap'
        },
        desc: {
            en: '<strong>A Systematic Approach for Selecting Trajectories for Data Augmentation</strong>: Framework evaluating 5 strategic trajectory selection heuristics with an automated Optuna HPO loop and UMAP topological analysis across 200GB+ trajectory archives (Foxes, Starkey, AIS, Car).',
            sv: '<strong>Systematiskt urval av trajektorier för dataaugmentering</strong>: Forskningsramverk som utvärderar fem urvalsstrategier för geospatial dataaugmentering med Optuna HPO-loopar och topologisk UMAP-analys.'
        },
        meta: {
            en: '<strong>Deliverables:</strong> 39-page research manuscript, Python augmentation architecture, thesis defense, and official student opposition.',
            sv: '<strong>Moment:</strong> 39-sidig forskningsrapport, Python-ramverk, muntligt försvar och studentopposition.'
        },
        links: [
            { label: 'DiVA Portal ↗', url: 'https://www.diva-portal.org/smash/record.jsf?pid=diva2%3A2057524' },
            { label: 'arXiv ↗', url: 'https://arxiv.org/abs/2606.10938' }
        ]
    },

    // =========================================================================
    // BACHELOR'S PROGRAMME (22 COURSES)
    // =========================================================================
    '1MA441': {
        code: '1MA441 · 7.5 HP (G1N)',
        title: {
            en: 'Basic Mathematics for Computer Scientists',
            sv: 'Grundläggande matematik för datavetare'
        },
        desc: {
            en: 'Mathematical foundations: logic, set theory, functions, inequalities, exponential/logarithmic functions, complex numbers, sequences, number theory, combinatorics, systems of linear equations, and matrices.',
            sv: 'Matematiska grunder: logik, mängdlära, funktioner, olikheter, exponential- och logaritmfunktioner, komplexa tal, talföljder, talteori, kombinatorik och matriser.'
        },
        meta: {
            en: '<strong>Examination:</strong> Written take-home examination covering the entire course syllabus, followed by an oral defense examination.',
            sv: '<strong>Examination:</strong> Skriftlig hemtentamen över hela kursplanen samt avslutande muntlig examination.'
        }
    },
    '1DV501': {
        code: '1DV501 · 7.5 HP (G1N)',
        title: {
            en: 'Introduction to Programming',
            sv: 'Introduktion till programmering'
        },
        desc: {
            en: 'Python programming: variables, boolean logic, loops, functions, data structures, file I/O, recursion, and implementing data structures from scratch.',
            sv: 'Programmering i Python: variabler, logik, loopar, funktioner, datastrukturer, filhantering, rekursion och datastrukturimplementation.'
        },
        meta: {
            en: '<strong>Mini-Project:</strong> Built a word frequency text analyzer on 100K sentences implementing custom HashSets (with rehashing) and Binary Search Trees; timed practical programming exam.',
            sv: '<strong>Projekt:</strong> Utvecklade textanalysator med hash-sets och binära sökträd; tidsbegränsad praktisk salstentamen.'
        }
    },
    '1DV700': {
        code: '1DV700 · 7.5 HP (G1F)',
        title: {
            en: 'Computer Security',
            sv: 'Datorsäkerhet'
        },
        desc: {
            en: 'Foundational security: symmetric and public-key cryptography, buffer overflows, operating system security, risk modeling, and corporate ISO/IEC 27002 policies.',
            sv: 'Säkerhetsgrunder: symmetrisk och asymmetrisk kryptografi, buffertspill, operativsystemsskydd, riskanalys och ISO/IEC 27002.'
        },
        meta: {
            en: '<strong>Assignments:</strong> Python encryption scripts, corporate ISO/IEC 27002 policy design, and timed written exam with risk calculations.',
            sv: '<strong>Uppgifter:</strong> Python-kryptering, framtagning av ISO 27002-säkerhetspolicy och salstentamen med riskkalkyler.'
        }
    },
    '1DV510': {
        code: '1DV510 · 7.5 HP (G1F)',
        title: {
            en: 'Technical Information and Communication',
            sv: 'Teknisk information och kommunikation'
        },
        desc: {
            en: 'Scientific communication: research database searching, IEEE referencing standards, academic technical report structure (Aim, Method, Results, Discussion), LaTeX typesetting, and oral presentation rhetoric.',
            sv: 'Vetenskaplig kommunikation: informationssökning, IEEE-referensstandard, rapportstruktur, typsättning i LaTeX och presentationsteknik.'
        },
        meta: {
            en: '<strong>Deliverables:</strong> Authored a full technical research report, conducted peer opposition, and defended in an oral seminar.',
            sv: '<strong>Moment:</strong> Författade vetenskaplig rapport i LaTeX, genomförde opposition och muntligt försvar.'
        }
    },
    '1DV503': {
        code: '1DV503 · 7.5 HP (G1F)',
        title: {
            en: 'Database Technology',
            sv: 'Databasteknik'
        },
        desc: {
            en: 'Relational database systems: conceptual Entity-Relationship (E/R) modeling, relational algebra, SQL DDL/DML, transaction management (ACID properties), B-tree indexing, and application connectivity.',
            sv: 'Relationsdatabaser: E/R-modellering, relationsalgebra, SQL, transaktionshantering (ACID), indexering och applikationsintegration.'
        },
        meta: {
            en: '<strong>Projects:</strong> Implemented relational database in MySQL; built Python application with `mysql-connector-python`; passed mandatory oral examination.',
            sv: '<strong>Projekt:</strong> Byggde MySQL-databas och Python-applikation via `mysql-connector`; muntlig tentamen.'
        }
    },
    '1DV502': {
        code: '1DV502 · 7.5 HP (G1F)',
        title: {
            en: 'Object-Oriented Programming',
            sv: 'Objektorienterad programmering'
        },
        desc: {
            en: 'Java OOP principles: encapsulation, inheritance, polymorphism, interfaces, UML class diagrams, design patterns, JUnit unit testing, Gradle build automation, and GitLab CI/CD pipelines.',
            sv: 'Objektorienterad programmering i Java: inkapsling, arv, polymorfism, gränssnitt, designmönster, enhetstestning i JUnit, Gradle och GitLab CI/CD.'
        },
        meta: {
            en: '<strong>Projects:</strong> Implemented a full Monopoly game engine following Google Java standards; built recipe inventory manager; comprehensive written exam.',
            sv: '<strong>Projekt:</strong> Konstruerade Monopol-spelmotor enligt Google Java-standard; skriftlig salstentamen.'
        }
    },
    '1MA462': {
        code: '1MA462 · 7.5 HP (G1F)',
        title: {
            en: 'Discrete Mathematics',
            sv: 'Diskret matematik'
        },
        desc: {
            en: "Discrete structures: combinatorics, counting techniques, generating functions, recurrence relations, binary relations, partial orders, graph theory, and cellular automata models (Conway's Game of Life).",
            sv: 'Diskret matematik: kombinatorik, genererande funktioner, differensekvationer, partialordningar, grafteori och cellulära automater.'
        },
        meta: {
            en: '<strong>Examination:</strong> Authored scientific project report on recurrence relations and cellular automata; written campus examination.',
            sv: '<strong>Moment:</strong> Projektrapport om differensekvationer och cellulära automater samt skriftlig salstentamen.'
        }
    },
    '1DV508': {
        code: '1DV508 · 7.5 HP (G1F)',
        title: {
            en: 'Project Course in Computer Science',
            sv: 'Projektkurs i datavetenskap'
        },
        desc: {
            en: 'Agile software development: delivering in a 10-person Scrum team, sprint planning, backlog grooming, Git workflow, desktop GUI development in JavaFX, and MySQL database integration.',
            sv: 'Agil mjukvaruutveckling i team: Scrum-ramverket, sprintplanering, versionshantering i Git, GUI-arkitektur i JavaFX och MySQL-databasintegration.'
        },
        meta: {
            en: '<strong>Project:</strong> Engineered the "Team Carbon" hotel booking desktop application in JavaFX/MySQL; delivered stakeholder sprint reviews and YouTube video demo.',
            sv: '<strong>Projekt:</strong> Utvecklade hotellbokningssystem i JavaFX och MySQL; sprintdemo och videopresentation.'
        }
    },
    '1DT301': {
        code: '1DT301 · 7.5 HP (G1F)',
        title: {
            en: 'Computer Technology I',
            sv: 'Datorteknik I'
        },
        desc: {
            en: 'Microcomputer architectures (AVR ATmega2560/ATmega16): assembly programming, instruction sets, register mapping, digital I/O, software/hardware timers, interrupts, LCD modules, and embedded C.',
            sv: 'Mikrodatorarkitektur på AVR (ATmega2560): assembler, registermappning, digital I/O, hårdvarutimers, avbrottshantering, LCD-skärmar och inbyggd C.'
        },
        meta: {
            en: '<strong>Labs:</strong> Programmed 6 hardware modules in PICSimLab & Atmel Studio; wrote C drivers for JHD202C displays; final written exam.',
            sv: '<strong>Laborationer:</strong> 6 hårdvarulabbar i PICSimLab/Atmel Studio; skrev C-drivrutin för LCD; salstentamen.'
        }
    },
    '1DV607': {
        code: '1DV607 · 7.5 HP (G1F)',
        title: {
            en: 'Object Oriented Analysis and Design using UML',
            sv: 'Objektorienterad analys och design med UML'
        },
        desc: {
            en: 'Object-oriented software engineering: domain modeling, UML Class and Sequence diagrams, mapping design models to Java, reverse engineering, responsibility-driven design (MVC), and GoF design patterns.',
            sv: 'Objektorienterad mjukvaruarkitektur: domänmodellering, formell UML (klass- och sekvensdiagram), MVC-separation, GoF-designmönster och kodrefaktorisering.'
        },
        meta: {
            en: '<strong>Assignments:</strong> Designed and implemented 3 Java applications with UML models and GitLab CI/CD pipelines; defended designs in code reviews.',
            sv: '<strong>Moment:</strong> 3 applikationer med formella UML-modeller och GitLab CI/CD; muntligt arkitekturförsvar.'
        }
    },
    '1DV512': {
        code: '1DV512 · 7.5 HP (G1F)',
        title: {
            en: 'Operating Systems',
            sv: 'Operativsystem'
        },
        desc: {
            en: 'OS kernel mechanisms: multi-threaded process scheduling, CPU execution algorithms, synchronization locks, deadlocks, main memory paging, virtual memory, and file-system structures.',
            sv: 'Operativsystemets kärna: schemaläggning, processynkronisering, dödlägen, virtuellt minne, sidallokering och filsystem.'
        },
        meta: {
            en: '<strong>Assignments:</strong> 3 individual theoretical evaluations on memory/scheduling + 2 collaborative group projects emulating CPU scheduling and synchronization in Java.',
            sv: '<strong>Moment:</strong> 3 individuella teoretiska inlämningar samt 2 grupparbeten med schemaläggningssimulatorer.'
        }
    },
    '1ME321': {
        code: '1ME321 · 7.5 HP (G1F) · Elective',
        title: {
            en: 'Web Technology 1 (Elective Course)',
            sv: 'Webbteknik 1 (Valbar kurs)'
        },
        desc: {
            en: 'Web foundations: client-server communication, HTTP protocols, semantic HTML5, responsive CSS layouts, media integration, accessibility standards, and usability evaluation.',
            sv: 'Webbteknologier (valbar kurs): klient-server-kommunikation, semantisk HTML5, responsiv CSS-layout, tillgänglighet och användbarhetsanalys.'
        },
        meta: {
            en: '<strong>Projects:</strong> Deployed a fully standards-compliant responsive website; authored a comprehensive website usability evaluation; written exam.',
            sv: '<strong>Projekt:</strong> Utvecklade responsiv webbplats enligt W3C-standard, användbarhetsrapport och salstentamen.'
        }
    },
    '1DV701': {
        code: '1DV701 · 7.5 HP (G1F)',
        title: {
            en: 'Computer Networks - An Introduction',
            sv: 'Datanät - en introduktion'
        },
        desc: {
            en: '5-layer Internet protocol stack: application protocols (HTTP, DNS, DHCP), transport layer (TCP flow/congestion control, UDP), routing algorithms (RIP, OSPF, BGP), and data link layer.',
            sv: 'Datanätverk och Internetstacken: protokoll (HTTP, DNS, DHCP), transportlager (TCP/UDP), routing (RIP, OSPF, BGP) och datalänkprotokoll.'
        },
        meta: {
            en: '<strong>Labs:</strong> Wireshark packet analysis; implemented multi-threaded HTTP web server in C; coded RFC-compliant TFTP UDP server; GNS3 routing; written exam.',
            sv: '<strong>Laborationer:</strong> Paketanalys i Wireshark; skrev HTTP-webbserver i C; skrev RFC-kompatibel TFTP-server; salstentamen.'
        }
    },
    '1MA464': {
        code: '1MA464 · 7.5 HP (G1F)',
        title: {
            en: 'Cryptography and Coding Theory',
            sv: 'Kryptografi och kodningsteori'
        },
        desc: {
            en: 'Mathematical cryptology and algebraic coding: symmetric block ciphers (AES with GF(2^8) Galois Field arithmetic, DES), public-key crypto (RSA, ElGamal, Diffie-Hellman), digital signatures, Hamming codes, syndrome decoding, and CRC.',
            sv: 'Matematisk kryptologi och kodningsteori: AES med Galois Field-aritmetik, RSA, ElGamal, Diffie-Hellman, digitala signaturer, Hammingkoder och CRC.'
        },
        meta: {
            en: '<strong>Project:</strong> Implemented and cryptanalyzed cipher algorithms in Wolfram Mathematica; written campus examination with formal mathematical proofs.',
            sv: '<strong>Projekt:</strong> Implementerade kryptoanalys i Wolfram Mathematica samt skriftlig salstentamen med matematiska bevis.'
        }
    },
    '2DV702': {
        code: '2DV702 · 7.5 HP (G2F)',
        title: {
            en: 'Internet Security',
            sv: 'Internetsäkerhet'
        },
        desc: {
            en: 'Network threat mitigation: Public Key Infrastructure (PKI), X.509 Certificate Signing Requests, SSL/TLS, PGP/GPG encrypted email, IPsec, web vulnerability audits, and GNU/Linux firewalls (iptables/nftables).',
            sv: 'Nätverkssäkerhet: PKI, certifikathantering, SSL/TLS, PGP/GPG-kryptering, webbsårbarhetstestning i sandbox och Linux iptables/nftables-brandväggar.'
        },
        meta: {
            en: '<strong>Labs:</strong> 4 laboratory reports (TLS configuration, PGP encryption, web penetration testing on LNU Student Shop, iptables firewall filtering); written exam.',
            sv: '<strong>Laborationer:</strong> 4 labbrapporter (TLS, PGP, penetrationstestning i sandbox, iptables-filtrering); salstentamen.'
        }
    },
    '1DV721': {
        code: '1DV721 · 7.5 HP (G1F)',
        title: {
            en: 'Systems Administration',
            sv: 'Systemadministration'
        },
        desc: {
            en: 'Infrastructure administration: installing and hardening Unix/Linux servers, routine backup/restore operations, Bash automation scripting, network flow analysis, QoS metrics (latency, jitter), and Service Level Agreements (SLAs).',
            sv: 'Systemadministration: Linux-serverdrift, Bash-automatisering, nätverksflödesanalys i Wireshark, QoS-policyer och SLA-modellering.'
        },
        meta: {
            en: '<strong>Assignments:</strong> Programmed Bash automation scripts; hardened a live Linux server; executed flow analysis in Wireshark; oral architecture examination.',
            sv: '<strong>Moment:</strong> Skriptade Bash-automatisering, härdade Linux-server, flödesanalys i Wireshark och muntlig tentamen.'
        }
    },
    '2DV505': {
        code: '2DV505 · 7.5 HP (G2F)',
        title: {
            en: 'Current Topics within Computer Science',
            sv: 'Aktuella ämnen inom datavetenskap'
        },
        desc: {
            en: 'Research self-study focusing on Human-Computer Interaction (HCI): scientific paper analysis, popular science communication, emerging interactive technologies (VR/AR, robotics), and peer review.',
            sv: 'Forskningsfördjupning inom människa-datorinteraktion (HCI): vetenskaplig analys, populärvetenskaplig publicering, framväxande interaktiva teknologier och peer review.'
        },
        meta: {
            en: '<strong>Outputs:</strong> Published an accessible popular science blog post on an academic paper; created a recorded state-of-the-art video presentation; completed peer critiques.',
            sv: '<strong>Moment:</strong> Författade populärvetenskaplig artikel, producerade forskningspresentation på video samt opposition.'
        }
    },
    '2DV703': {
        code: '2DV703 · 7.5 HP (G2F)',
        title: {
            en: 'Mobile and Wireless Data Security',
            sv: 'Mobil och trådlös datasäkerhet'
        },
        desc: {
            en: 'Wireless protocols and defense: auditing WEP, WPA2, and WPA3 standards, enterprise 802.1X/RADIUS backend authentication, encrypted VPN tunnels, MFA access control, and hardware-encrypted USB testing.',
            sv: 'Trådlös datasäkerhet: granskning av WEP/WPA2/WPA3, 802.1X/RADIUS-företagsautentisering, krypterade VPN-tunnlar, MFA och mobil hårdvarukryptering.'
        },
        meta: {
            en: '<strong>Labs:</strong> 6 hands-on lab modules with technical reports; live seminar presentations; written exam report.',
            sv: '<strong>Moment:</strong> 6 praktiska labbmoduler med tekniska rapporter, seminariepresentationer och skriftlig tentamensrapport.'
        }
    },
    '2DV704': {
        code: '2DV704 · 7.5 HP (G2F)',
        title: {
            en: 'Digital Forensics',
            sv: 'Digital forensik'
        },
        desc: {
            en: 'Electronic evidence lifecycle and cybercrime law (Budapest Convention, ACPO principles): Windows registry parsing, Prefetch analysis, browser history carving, network packet persistence footprints, and chain-of-custody.',
            sv: 'Digital forensik och IT-brottslagstiftning: Windows-registeranalys, Prefetch-spårsäkring, webbhistorik, minnesextraktion, nätverksspår och bevisintegritet.'
        },
        meta: {
            en: '<strong>Investigations:</strong> Completed 3 practical forensic cases in DeterLab virtual environments (target triage, artifact timeline reconstruction, complex incident footprint analysis).',
            sv: '<strong>Undersökningar:</strong> 3 forensiska utredningsfall i DeterLab (spårsäkring, tidslinjerekonstruktion och intrångsanalys).'
        }
    },
    '1DV528': {
        code: '1DV528 · 15 HP (G1F/G2F)',
        title: {
            en: 'Web Programming',
            sv: 'Webbprogrammering'
        },
        desc: {
            en: 'Fullstack web engineering: client-side SPAs with WebSockets, Node.js and Express MVC backends, MongoDB Atlas persistence via Mongoose, OAuth integration, and automated web scrapers (Cheerio/Axios).',
            sv: 'Fullstack webbutveckling: SPA i ren JavaScript med WebSockets, Node.js och Express MVC-backends, MongoDB Atlas via Mongoose, OAuth och web scraping i Cheerio.'
        },
        meta: {
            en: '<strong>Projects:</strong> Built 6 applications: responsive site, async REST quiz, Windows 10 desktop simulator SPA, automated scraper, CRUD snippet service, and production GitLab webhook dashboard.',
            sv: '<strong>Projekt:</strong> 6 applikationer: Windows 10 PWD/SPA med realtidschatt, web scraper, CRUD-tjänst och produktionsdashboard.'
        }
    },
    '1ME322': {
        code: '1ME322 · 7.5 HP (G2F)',
        title: {
            en: 'Web Technology 2',
            sv: 'Webbteknik 2'
        },
        desc: {
            en: 'Client-side scripting: DOM tree manipulation, asynchronous browser event handling, dynamic UI components, state persistence, and debugging with developer tools.',
            sv: 'Klientsidans skriptprogrammering: DOM-manipulering, asynkrona händelser, dynamiska gränssnittskomponenter, tillståndshantering och felsökning i webbläsaren.'
        },
        meta: {
            en: '<strong>Projects:</strong> Developed and deployed interactive web applications demonstrating dynamic DOM alterations and custom event architectures; written exam.',
            sv: '<strong>Projekt:</strong> Utvecklade och driftsatte interaktiva klientsideapplikationer med anpassade händelser; salstentamen.'
        }
    },
    '2DV50E': {
        code: '2DV50E · 15 HP (G2E)',
        title: {
            en: 'Degree Project at Bachelor Level',
            sv: 'Självständigt arbete på kandidatexamen'
        },
        desc: {
            en: '<strong>Edge Computing Security for IoT: A Systematic Literature Review</strong>: SLR evaluating 82 primary studies from 1,667 papers to classify threats across sensors, gateways, and edge cloud nodes, examining firewalls, cryptography, blockchain, and 5G.',
            sv: '<strong>Edge Computing Security for IoT: En systematisk litteraturstudie</strong>: SLR som granskade 82 primärstudier från 1 667 artiklar för att kartlägga sårbarheter, IDS, kryptografi och arkitekturer i edge-miljöer.'
        },
        meta: {
            en: '<strong>Deliverables:</strong> Authored a formal scientific thesis report in IEEE format, defended findings in an academic presentation, and served as official student opponent.',
            sv: '<strong>Moment:</strong> Författade vetenskaplig uppsats, genomförde muntligt försvar och agerade opponent på peer-arbete.'
        },
        links: [{ label: 'DiVA Portal ↗', url: 'https://diva-portal.org/smash/record.jsf?pid=diva2%3A1764518' }]
    }
};
