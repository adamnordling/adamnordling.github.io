export interface SkillData {
    title: { en: string; sv: string };
    desc: { en: string; sv: string };
}

export const SKILLS_DATA: Record<string, SkillData> = {
    // =========================================================================
    // 1. LANGUAGES
    // =========================================================================
    python: {
        title: { en: 'Python Architecture', sv: 'Python-arkitektur' },
        desc: {
            en: 'Primary language for data-intensive systems and machine learning. Built custom data structures from scratch (HashSets with rehashing, Binary Search Trees), high-throughput data augmentation loops with Optuna, topological analysis with UMAP, PyArrow Feather serialization, and automated web scrapers.',
            sv: 'Mitt primära språk för dataintensiva system och maskininlärning. Implementerat egna datastrukturer från grunden (hash-sets med rehashing, binära sökträd), automatiserade dataaugmenteringsloopar med Optuna, topologisk UMAP-analys, PyArrow Feather-serialisering och web scraping.'
        }
    },
    java: {
        title: { en: 'Java & Enterprise OOP', sv: 'Java & Företags-OOP' },
        desc: {
            en: 'Enterprise object-oriented engineering. Built desktop database applications with JavaFX and JDBC, multi-threaded CPU scheduling emulators, compiler frontends with AST transformations, and emitted raw Java bytecode using the ASM framework.',
            sv: 'Objektorienterad arkitektur och systembyggnad. Skapat databasdrivna skrivbordssystem med JavaFX och JDBC, flertrådade CPU-schemaläggare, kompilator-frontends med AST-transformationer samt genererat rå Java-bytekod via ASM-ramverket.'
        }
    },
    'ts-js': {
        title: { en: 'Fullstack TypeScript & JS', sv: 'Fullstack TypeScript & JS' },
        desc: {
            en: 'Engineered zero-framework client applications and interactive SPAs. Built a complete window-based desktop simulation environment with drag-and-drop, full-duplex WebSocket real-time chat, HTML5 Canvas 2D matrix rendering, and custom Vite inlining build plugins with strict typing.',
            sv: 'Arkitektur av ramverksoberoende webbapplikationer och SPAs. Konstruerat ett fönsterbaserat skrivbordsgränssnitt med drag-and-drop, realtidschatt via WebSockets, HTML5 Canvas 2D-rendering och skräddarsydda byggplugins för Vite med strikta typkontroller.'
        }
    },
    cpp: {
        title: { en: 'High-Performance C++', sv: 'Högprestanda C++' },
        desc: {
            en: 'High-performance and concurrent computing. Implemented multi-threaded algorithms using C++11 concurrency and OpenMP directives, focusing on manual memory management, pointer arithmetic, thread synchronization, and implementing neural networks from scratch.',
            sv: 'Prestandakritiska och samtidiga system. Skrivit flertrådade algoritmer med C++11 concurrency och OpenMP-direktiv, med starkt fokus på manuell minneshantering, pekararitmetik, trådsynkronisering och neurala nätverk skrivna från grunden.'
        }
    },
    c: {
        title: { en: 'Embedded C Systems', sv: 'Inbyggda C-system' },
        desc: {
            en: 'Embedded systems programming on AVR microcontrollers (ATmega). Directly configured hardware registers, timers, interrupt service routines, LCD displays, and programmed raw network sockets implementing custom TFTP servers over UDP.',
            sv: 'Inbyggda system på AVR-mikrokontrollers (ATmega). Direktkonfigurerat hårdvaruregister, timers, avbrottshantering (interrupts), LCD-moduler samt skrivit nätverksprogrammering i rena C-sockets för TFTP över UDP.'
        }
    },
    cuda: {
        title: { en: 'Massively Parallel CUDA', sv: 'Parallell CUDA-beräkning' },
        desc: {
            en: 'Massively parallel GPU computing on NVIDIA architectures. Developed SIMT kernel functions, managed global and shared memory hierarchies, optimized grid/block dimensions, and accelerated parallel reductions and Pearson correlation coefficient calculations.',
            sv: 'Massivt parallella GPU-beräkningar på NVIDIA-hårdvara. Utvecklat SIMT-kernels, hanterat globalt och delat minne, optimerat grid/block-konfigurationer och accelererat parallella reduktioner samt beräkning av Pearson-korrelationskoefficienter.'
        }
    },
    sql: {
        title: { en: 'Relational SQL Modeling', sv: 'Relationell SQL-modellering' },
        desc: {
            en: 'Relational schema design, normalization, relational algebra, and writing complex queries across MySQL, MariaDB, and SQLite. Experienced with transaction isolation (ACID), indexing strategies, and database-driven application integration.',
            sv: 'Relationell schemamodellering, normalisering, relationsalgebra och avancerade databasfrågor i MySQL, MariaDB och SQLite. Erfarenhet av transaktionshantering (ACID), indexeringsstrategier och applikationsintegration.'
        }
    },
    bash: {
        title: { en: 'Shell & System Automation', sv: 'Skript & Systemautomatisering' },
        desc: {
            en: 'Linux server administration and process automation. Scripting administrative maintenance, Dockerized service deployment, system monitoring, and automated project packaging pipelines.',
            sv: 'Linux-serveradministration och processautomatisering. Skriver skript för underhållsrutiner, driftsättning av Docker-containrar, systemövervakning och automatiserade paketeringsverktyg.'
        }
    },

    // =========================================================================
    // 2. AI & MACHINE LEARNING
    // =========================================================================
    'deep-learning': {
        title: { en: 'Deep Learning Architecture', sv: 'Djupinlärningsarkitektur' },
        desc: {
            en: 'Designed, trained, and evaluated neural network architectures from scratch using TensorFlow and Keras. Built Convolutional Neural Networks (CNNs) for spatial computer vision, LSTMs and RNNs for sequential time-series, applying dropout and batch normalization.',
            sv: 'Designat, tränat och utvärderat neurala nätverk från grunden i TensorFlow och Keras. Byggt konvolutionella nätverk (CNN) för bildklassificering samt LSTM och RNN för sekvens- och tidsseriedata med dropout och batch-normalisering.'
        }
    },
    optuna: {
        title: { en: 'Automated HPO', sv: 'Automatiserad HPO' },
        desc: {
            en: 'Engineered automated Bayesian hyperparameter optimization loops with Optuna to dynamically search multi-dimensional parameter spaces in machine learning pipelines across 200GB+ trajectory archives.',
            sv: 'Utvecklat automatiserade Bayesianska optimeringsloopar med Optuna för att dynamiskt utforska flerdimensionella sökrymder i maskininlärningsmodeller över 200GB+ trajektoriedata.'
        }
    },
    pose: {
        title: { en: 'Computer Vision', sv: 'Datorseende & Analys' },
        desc: {
            en: 'Co-developed a movement analysis system utilizing Kinect and MoveNet (TensorFlow.js) pose landmark tracking to evaluate and classify physical exercises, backed by a Flask API and an Angular frontend.',
            sv: 'Utvecklat ett rörelseanalyssystem med Kinect och MoveNet (TensorFlow.js) för att klassificera träningsövningar i realtid, kopplat till en Flask-backend och ett Angular-gränssnitt.'
        }
    },
    'data-mining': {
        title: { en: 'Algorithmic Data Mining', sv: 'Algoritmisk Data Mining' },
        desc: {
            en: 'Implemented fundamental data mining algorithms from scratch in Python: DBSCAN density clustering, K-Means, Sammon Mapping, Fast Newman community detection, and Local Outlier Factor (LOF) anomaly detection.',
            sv: 'Implementerat centrala data mining-algoritmer från grunden i Python: DBSCAN-densitetsklustring, K-Means, Sammon Mapping, Fast Newman-nätverksdetektering och Local Outlier Factor (LOF) för avvikelseanalys.'
        }
    },
    'dim-reduction': {
        title: { en: 'Manifold Analysis', sv: 'Topologisk analys' },
        desc: {
            en: 'Utilized UMAP geometric manifold projections to visualize and mathematically prove how data augmentation repairs topological fragmentation in high-dimensional feature spaces versus introducing noise.',
            sv: 'Använt topologiska UMAP-projektioner för att visualisera och matematiskt bevisa hur dataaugmentering reparerar fragmentering i högdimensionella rymder kontra att introducera brus.'
        }
    },

    // =========================================================================
    // 3. WEB & FULLSTACK
    // =========================================================================
    'node-express': {
        title: { en: 'Backend Architecture', sv: 'Backend-arkitektur' },
        desc: {
            en: 'Architecting server-side MVC backends, OAuth authentication integration, session management with cookies, flash messaging, input validation, and REST API endpoints connected to MongoDB Atlas.',
            sv: 'Arkitektur av serversidans MVC-backends, OAuth-autentisering, sessionshantering med cookies, validering och säkra REST API:er kopplade mot MongoDB Atlas.'
        }
    },
    angular: {
        title: { en: 'Enterprise Angular', sv: 'Företags-Angular' },
        desc: {
            en: 'Building responsive, component-driven client applications. Managed component lifecycles, service dependency injection, client-side routing, and real-time visualization of machine learning data streams.',
            sv: 'Utveckling av responsiva, komponentbaserade webbgränssnitt. Erfarenhet av komponenters livscykel, dependency injection, routing och realtidsvisualisering av dataflöden från ML-modeller.'
        }
    },
    websockets: {
        title: { en: 'Full-Duplex WebSockets', sv: 'Full-Duplex WebSockets' },
        desc: {
            en: 'Engineered full-duplex bi-directional communication systems using the ws protocol. Built real-time multi-user chat applications with custom JSON payloads, connection state recovery, and message broadcasting.',
            sv: 'Byggt dubbelriktade realtidssystem via ws-protokollet. Utvecklat chattapplikationer för flera samtidiga användare med anpassade JSON-protokoll, återanslutningslogik och meddelandebroadcasting.'
        }
    },
    flask: {
        title: { en: 'Microservices & APIs', sv: 'Mikrotjänster & API:er' },
        desc: {
            en: 'Constructing lightweight, high-speed Python REST microservices to serve machine learning models, handle payload serialization, and expose predictions to frontend clients.',
            sv: 'Konstruerat snabba, modulära Python-mikrotjänster i Flask för att serva maskininlärningsmodeller, hantera serialisering och exponera prediktioner mot frontend-klienter.'
        }
    },
    scraping: {
        title: { en: 'Automated Scraping', sv: 'Automatiserad scraping' },
        desc: {
            en: 'Constructing automated web crawlers and scrapers in Node.js. Handled HTTP session handshakes, parsed HTML DOM trees with Cheerio, and aggregated data across synchronized booking portals.',
            sv: 'Byggt automatiserade webbcrawlers och scrapers i Node.js. Hanterat sessioner och inloggningar, parsat HTML-träd med Cheerio och sammanställt data från multipla webbportaler.'
        }
    },

    // =========================================================================
    // 4. ARCHITECTURE & COMPILERS
    // =========================================================================
    compilers: {
        title: { en: 'Compiler Pipelines', sv: 'Kompilatorkedjor' },
        desc: {
            en: 'Built a complete compilation pipeline using ANTLR: lexical tokenization, Context-Free Grammar syntax parsing, Abstract Syntax Tree (AST) construction, symbol tables for scope resolution, static type checking, and Python code generation.',
            sv: 'Konstruerat en komplett kompilatorkedja med ANTLR: lexikal analys, syntaxanalys mot kontextfria grammatiker, AST-konstruktion, symboltabeller för variabelomfång, statisk typkontroll och kodgenerering till Python.'
        }
    },
    bytecode: {
        title: { en: 'Bytecode & VM Runtime', sv: 'Bytekod & Virtuella maskiner' },
        desc: {
            en: 'Generated executable Java bytecode programmatically using the ASM framework and implemented a stack-based virtual machine interpreter capable of executing arithmetic, conditionals, and subroutines.',
            sv: 'Genererat körbar Java-bytekod programmatiskt via ASM-ramverket samt implementerat en stackbaserad virtuell maskin/interpretator för aritmetik, villkor och funktionsanrop.'
        }
    },
    'design-patterns': {
        title: { en: 'Design Patterns & UML', sv: 'Designmönster & UML' },
        desc: {
            en: 'Advanced object-oriented design and domain modeling. Applied GoF structural and behavioral design patterns, responsibility-driven design (MVC), and reverse-engineered complex Java codebases into formal UML diagrams.',
            sv: 'Avancerad objektorienterad design och domänmodellering. Tillämpat GoF-designmönster, responsibility-driven design (MVC) och reverse-engineering av komplexa Java-kodbaser till formella UML-diagram.'
        }
    },
    'formal-verification': {
        title: { en: 'Mathematical Verification', sv: 'Matematisk verifiering' },
        desc: {
            en: 'Mathematically proven program correctness using Hoare logic and the Dafny static verification tool. Modeled reactive, concurrent timed automata systems and verified safety and liveness properties using temporal logic (LTL/CTL) in UPPAAL.',
            sv: 'Matematiskt bevisat programkorrekthet via Hoare-logik och verifieringsverktyget Dafny. Modellerat samtidiga tidskritiska automater samt verifierat säkerhets- och liveness-egenskaper med temporallogik (LTL/CTL) i UPPAAL.'
        }
    },

    // =========================================================================
    // 5. SECURITY & NETWORKS
    // =========================================================================
    wireshark: {
        title: { en: 'Deep Packet Inspection', sv: 'Paketinspektion' },
        desc: {
            en: 'Deep packet inspection and traffic flow analysis. Dissecting TCP handshakes, TLS negotiation, DNS, DHCP, routing protocols (OSPF, RIP), and detecting anomalies or unauthorized access patterns.',
            sv: 'Djupgående paketinspektion och trafikanalys i Wireshark. Analys av TCP-handskakningar, TLS-kryptering, DNS, DHCP, routingprotokoll (OSPF, RIP) samt identifiering av skadliga trafikflöden.'
        }
    },
    'web-security': {
        title: { en: 'Vulnerability Audits', sv: 'Sårbarhetsanalys' },
        desc: {
            en: 'Hands-on penetration testing and vulnerability auditing in isolated sandboxes. Identified and mitigated flaws based on the OWASP Top 10, including SQL injections, XSS, CSRF, broken access control, and insecure deserialization.',
            sv: 'Praktisk sårbarhetsanalys och penetrationstestning i isolerade sandbox-miljöer. Identifierat och motverkat säkerhetsbrister enligt OWASP Top 10 (SQL-injections, XSS, CSRF och behörighetsbrister).'
        }
    },
    cryptography: {
        title: { en: 'Applied Cryptography', sv: 'Tillämpad kryptografi' },
        desc: {
            en: 'Mathematical and practical cryptography: symmetric block ciphers (AES with Galois Field arithmetic, DES), public-key systems (RSA, ElGamal, Diffie-Hellman), digital signatures, PKI certificate generation (CSR), and PGP/GPG encryption.',
            sv: 'Matematisk och praktisk kryptografi: symmetriska blockchiffer (AES med Galois Field-aritmetik, DES), asymmetriska system (RSA, ElGamal, Diffie-Hellman), digitala signaturer, PKI-certifikathantering och PGP/GPG.'
        }
    },
    firewalls: {
        title: { en: 'Firewall Architecture', sv: 'Brandväggsarkitektur' },
        desc: {
            en: 'Configuring stateful packet filtering and network defense policies using Linux iptables and nftables, implementing port forwarding, NAT, enterprise network segmentation, and hardening web infrastructure.',
            sv: 'Konfiguration av tillståndsbaserad paketfiltrering och nätverksförsvar i Linux iptables/nftables, port forwarding, NAT, nätverkssegmentering och skydd mot obehörig åtkomst.'
        }
    },
    wireless: {
        title: { en: 'Wireless Defense', sv: 'Trådlöst försvar' },
        desc: {
            en: 'Hands-on auditing of Wi-Fi standards (WEP, WPA2, WPA3), enterprise 802.1X/RADIUS authentication, encrypted VPN tunneling, multi-factor authentication (MFA), and mobile hardware encryption.',
            sv: 'Granskning och konfiguration av Wi-Fi-säkerhet (WEP, WPA2, WPA3), företagsautentisering via 802.1X/RADIUS, krypterade VPN-tunnlar, flerfaktorsautentisering (MFA) och mobil hårdvarukryptering.'
        }
    },

    // =========================================================================
    // 6. DEVOPS & CLOUD
    // =========================================================================
    docker: {
        title: { en: 'Containerized Infrastructure', sv: 'Container-infrastruktur' },
        desc: {
            en: 'Containerizing fullstack applications, MariaDB/MySQL databases, and Apache2 web servers. Composing multi-service environments with Docker Compose, volume mounts, and isolated bridge networks.',
            sv: 'Containerisering av fullstack-system, MariaDB/MySQL-databaser och Apache2-servrar. Skriver Docker Compose-konfigurationer med volymer, nätverksisolering och reproducerbara miljöer.'
        }
    },
    cicd: {
        title: { en: 'Automated Pipelines', sv: 'Automatiserade byggpipor' },
        desc: {
            en: 'Constructed automated continuous integration and delivery pipelines in GitLab and GitHub Actions: automated linting, unit test execution, Lighthouse CI assertions, and production deployment.',
            sv: 'Konstruerat automatiserade CI/CD-byggkedjor i GitLab och GitHub Actions med automatisk linting, enhetstester, Lighthouse CI-granskning och automatisk driftsättning.'
        }
    },
    cloudflare: {
        title: { en: 'Edge CDN Delivery', sv: 'Edge CDN & Distribution' },
        desc: {
            en: 'Deploying high-performance static and serverless architectures on Cloudflare Edge. Configured global CDN caching, HTTP/3 delivery, Brotli compression, and Level 2 Content-Security-Policy headers.',
            sv: 'Driftsättning på Cloudflare Pages med global edge-distribution. Konfigurerat HTTP/3, Brotli-komprimering, edge-caching och strikta Content-Security-Policy (CSP) nivå 2-regler.'
        }
    },
    scrum: {
        title: { en: 'Agile Project Leadership', sv: 'Agil projektledning' },
        desc: {
            en: 'Served as Scrum Master in large-scale team projects. Directed sprint planning, daily stand-ups, backlog refinement, team velocity tracking, and milestone deliveries using Git and GitLab issue boards.',
            sv: 'Agerat Scrum Master i större teamprojekt. Lett sprintplanering, dagliga stand-ups, backlog-prioritering, sprintmål och projektleveranser via Git och GitLab issue boards.'
        }
    },

    // =========================================================================
    // 7. DATA & DATABASES
    // =========================================================================
    mongodb: {
        title: { en: 'NoSQL Document Store', sv: 'NoSQL-dokumentdatabas' },
        desc: {
            en: 'Document-oriented database modeling, flexible schema management, CRUD operations, and integrating MongoDB Atlas clusters with Node.js/Express using the Mongoose ODM.',
            sv: 'Dokumentbaserad datamodellering, NoSQL-datastrukturer, CRUD-funktionalitet och integration av MongoDB Atlas i Node.js/Express-applikationer via Mongoose ODM.'
        }
    },
    pyarrow: {
        title: { en: 'High-Speed Binary I/O', sv: 'Binär I/O-lagring' },
        desc: {
            en: 'Eliminated disk I/O bottlenecks in machine learning pipelines by streaming and serializing spatial trajectory datasets exceeding 200GB using zero-copy Apache Arrow binary Feather formats.',
            sv: 'Eliminerade disk- och I/O-flaskhalsar i maskininlärningskedjor genom att serialisera över 200GB geospatiala trajektoriedata i binärt Apache Arrow Feather-format med zero-copy.'
        }
    },
    'pandas-numpy': {
        title: { en: 'Vectorized Data Processing', sv: 'Vektoriserad databehandling' },
        desc: {
            en: 'High-performance array operations, matrix mathematics, spatial coordinate cleaning, time-series alignment, and building robust feature engineering pipelines.',
            sv: 'Vektoriserade matrisberäkningar, datatvätt av rumsliga koordinater, tidsseriebearbetning och konstruktion av robusta pipelines för feature engineering.'
        }
    },

    // =========================================================================
    // 8. FORENSICS & SYSTEMS
    // =========================================================================
    'digital-forensics': {
        title: { en: 'Digital Forensics', sv: 'Digital forensik' },
        desc: {
            en: 'Forensic evidence extraction in virtual environments (DeterLab): Windows registry analysis, Prefetch artifacts, browser history carving, timeline reconstruction, and documenting chain-of-custody.',
            sv: 'Spårsäkring och digital bevisföring i DeterLab: Windows registeranalys, Prefetch-artefakter, webbhistorik, minnesextraktion, tidslinjerekonstruktion och juridisk bevisintegritet.'
        }
    },
    linux: {
        title: { en: 'Unix Administration', sv: 'Unix-administration' },
        desc: {
            en: 'Daily driver Unix environment (Ubuntu, Arch/CachyOS, FreeBSD). Configuring Apache2 and MariaDB servers, user privilege management, systemd daemons, and storage virtualization.',
            sv: 'Daglig Unix-miljö (Ubuntu, Arch/CachyOS, FreeBSD). Konfiguration av Apache2- och MariaDB-servrar, behörighetssystem, systemd-tjänster och lagringshantering.'
        }
    },
    sockets: {
        title: { en: 'Socket Programming', sv: 'Socket-programmering' },
        desc: {
            en: 'Implemented network protocols from RFC specifications from scratch: engineered custom multi-threaded HTTP/1.1 web servers over TCP sockets and TFTP file transfer servers over UDP sockets.',
            sv: 'Implementerat nätverksprotokoll från grunden utifrån RFC-specifikationer: byggt flertrådade HTTP/1.1-webbservrar över TCP-sockets och TFTP-filöverföringsservrar över UDP-sockets.'
        }
    }
};
