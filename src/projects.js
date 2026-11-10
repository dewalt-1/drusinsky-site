/**
 * The work, as written in the Figma portfolio (file "portfolio-1").
 *
 * `tags` are hand-set weights on the axes in `AXES`. They are the only input
 * to the layout: projects that share weight sit near each other in the cloud.
 * Nothing is learned; the cloud only looks like an embedding.
 */

export const AXES = [
  'building', 'urban', 'computation', 'fabrication', 'ai', 'data',
  'installation', 'performance', 'interaction', 'teaching', 'research',
  'climate', 'public',
];

export const PERSON = {
  name: 'Ben Drusinsky',
  roles: 'Architect, computational designer, creative technologist',
  email: 'benodru *at* gmail.com',
  place: 'Den Haag, Netherlands',
  bio: 'Ben Drusinsky is an architect, computational designer, and creative technologist based in the Netherlands. Currently a PhD candidate and adjunct lecturer at the integrated design masters program at Köln International School of Design, and Code and Context at TH Köln computer science department, exploring ecological, critical, and creative computing in the built environment. With a master’s in architecture and industrial design, Ben works in the intersection of architecture, critical making, and speculative design.',
};

export const KINDS = ['Architecture', 'Creative technology', 'Teaching', 'Research'];

export const PROJECTS = [
  {
    slug: 'haberer',
    title: 'Haberer Maker Hub',
    kind: 'Architecture',
    meta: ['Jerusalem', 'Lead designer, project manager', '2019 – 2021', 'Completed', 'Firm: DY-CP', 'Team: Ben Drusinsky, Ytav Bouhsira'],
    year: 2021,
    tags: { building: 1, fabrication: .5, teaching: .5, climate: .5, public: .6 },
    text: [
      'An adaptive re-use of an abandoned community center in the Katamonim neighbourhood in Jerusalem. This rundown building transformed into a making and technological center catering to schools in the Katamonim and adjacent neighbourhoods.',
      'This re-design had been tailored to the specific needs of a youth focused technology and center, teaching making skills to children and young adults.',
      'As an architect, designer and maker I was able to build the center’s educational program with our clients, the Education Authority of the Jerusalem municipality. Then to include our clients vision in the final design. This making center includes 3D printer rooms, a dedicated classroom for VR development, and a workshop equipped with laser cutters and a CNC machine. It also has a recording studio and a large open area for a-formal teaching and learning.',
      'The design process included bio-climatic studies and lighting analysis to allow reduced power consumption and lower carbon footprint. Instead of regular plaster and concrete walls, I opted for wood construction based on flattened bamboo sheets that are durable, sustainable, and require little to no maintenance. The design included every aspect, including all of the furniture and detailing.',
    ],
  },
  {
    slug: 'pierre-koeing',
    title: 'Pierre Koeing St.',
    kind: 'Architecture',
    meta: ['Jerusalem', 'Lead designer, project manager', '2018 – 2019', 'Completed', 'Firm: DY-CP', 'Team: Ben Drusinsky, Ytav Bouhsira, Dana Gahzi'],
    year: 2019,
    tags: { urban: 1, public: 1, climate: .4, building: .3 },
    text: [
      'A temporary re-design of Pierre Koeing street, destined to become part of the future light rail infrastructure of Jerusalem. A light rail line, already planned, will go through this street in the next 4-5 years. The new light rail line will turn Pierre Koeing into a car free transportation zone. This will destroy local shops’ extensions and parking, that grew in size over the years and took over parts of the pedestrian right of way.',
      'This re-thinking of a major commercial street in Jerusalem’s largest industrial zone required engagement from local shop owners, neighbouring factory workers insight, and the help of community organizers. All for returning the right of way to pedestrians and in preparation for the future of public transportation in Jerusalem. Our work focused on creating small and medium semi private areas in public space, planting local vegetation and creating shaded waiting areas for existing public transportation across the whole street.',
    ],
  },
  {
    slug: 'huji-innovate',
    title: 'HUJI Innovate offices',
    kind: 'Architecture',
    meta: ['Jerusalem', 'Lead designer, BIM coordinator', '2022 – 2023', 'Completed', 'Firm: DY-CP', 'Team: Ben Drusinsky, Ytav Bouhsira'],
    year: 2023,
    tags: { building: 1, fabrication: .4, computation: .3 },
    text: [
      'Adaptive reuse of an under used library in the Hebrew University of Jerusalem Giv’at Ram campus. This library was redesigned to house the offices, workspaces and main management of HUJI Innovate, the Hebrew University’s tech and innovation hub.',
      'This innovation centre is designed to house the main offices, CEO and manager of HUJI Innovate, 5 staff members and up to 50 people in classrooms, lecture hall and meeting room. This adaptive reuse used custom made plywood and polycarbonate walls to hide HVAC and structural systems while opening the floor plan as a free plan. Discreet seating places were added to these plywood walls with acoustic panelling to give workers a quiet place to work or make a zoom call.',
      'This design was made entirely with BIM methodologies, including all design, fabrication, electrical and HVAC planning.',
    ],
  },
  {
    slug: 'beit-hanoar',
    title: 'Beit Hanoar',
    kind: 'Architecture',
    meta: ['Jerusalem', 'Lead designer, BIM coordinator', '2023 – 2025', 'Under construction', 'Firm: YGAA', 'Team: Ben Drusinsky, Adi Barbour'],
    year: 2025,
    tags: { building: 1, urban: .5, computation: .5, climate: .5, public: .5 },
    text: [
      'A public sports, culture and residential complex, as part of the redesign and the conservation of the old Jewish Youth and Sport Center. The complex will hold 200 apartments, two swimming pools, a sports centre, a public library and will connect to a new mobility hub.',
      'This design took into account the area’s unique topography and climate, and multiple climate analysis and generative algorithms were used in its design. As lead designer, I worked in tandem with the local municipality and several developers to bring this new design and construction to life.',
      'This design was made entirely with Revit, Dynamo and Grasshopper.',
    ],
  },
  {
    slug: 'harav-maimon',
    title: 'HaRav Maimon',
    kind: 'Architecture',
    meta: ['Bat Yam', 'Lead designer, computational designer', '2023', 'Under bid for construction', 'Firm: YGAA', 'Team: Ben Drusinsky, Adi Barbour'],
    year: 2023,
    tags: { building: 1, urban: .5, computation: .8, climate: .5 },
    text: [
      'This mixed-use residential complex was done by commission from the Bat Yam municipality and several local developers that banded together to develop this area. A former bus terminal, this new development will have over 1000 apartments, shopping centre, offices and two new tram stops.',
      'Working directly with the developers, I developed the computational tools to design the facade and buildings for optimal climate resilience, placing and design. Using my methodologies, optimal floorplan layout was achieved, allowing to increase the number of apartments without sacrificing design and comfort.',
      'My role involved the full computational workflow, translation of the workflow to floorplans and facade design, and implementing these into BIM methodologies and Revit.',
    ],
  },
  {
    slug: 'lod',
    title: 'Lod master plan',
    kind: 'Architecture',
    meta: ['Lod', 'Project manager, computational designer', '2023 – 2025', 'Completed', 'Firm: YGAA', 'Team: Ben Drusinsky'],
    year: 2025,
    tags: { urban: 1, computation: .8, data: .4, climate: .4, public: .4 },
    text: [
      'New city quarter design for the city of Lod. This new quarter will feature a new train, tram and metro lines, and is designed to contain over 10,000 apartments and a vibrant tech district.',
      'In the design of this quarter I relied heavily on computational and generative design methods that were able to take into account all of the different stakeholders, needs and wants of the municipality and the residents. Using computational design methods such as climate analysis, space syntax and generative building simulation using genetic algorithms, this quarter was designed to fit a complex mobility network that will connect it to the airport and major cities.',
      'During the design process, I acted as the lead project manager, managing a diverse team of architects, engineers and mobility experts to complete this diverse and complicated master plan.',
    ],
  },
  {
    slug: 'parking-facade',
    title: 'Experimental parking tower facade',
    kind: 'Architecture',
    meta: ['Jerusalem', 'Lead designer, computational designer', '2020', 'Completed', 'Firm: DY-CP', 'Team: Ben Drusinsky, Ytav Bouhsira'],
    year: 2020,
    tags: { building: .6, computation: 1, fabrication: 1, climate: .3 },
    text: [
      'Experimental parking tower facade, made with custom fabricated aluminium sheets. Design was done parametrically using custom code in grasshopper and python, to simulate and visualize the style of stone carving found in the area of Jerusalem.',
      'Aluminium sheets were fabricated by order, and designed to cover cars in the parking tower from direct sun and rain, while keeping an open view. This prototype of cover design, fabrication and assembly is now being replicated across the parking tower of Smart Park LTD in Jerusalem and in eastern Europe.',
    ],
  },
  {
    slug: 'beersheva-facade',
    title: 'Experimental facade prototype',
    kind: 'Architecture',
    meta: ['Be’er Sheva', 'Lead designer, computational designer', '2019', 'Completed', 'Firm: DY-CP', 'Team: Ben Drusinsky, Ytav Bouhsira, Benjamin Sorkin'],
    year: 2019,
    tags: { building: .7, computation: .9, fabrication: .9, climate: 1 },
    text: [
      'Experimental facade prototype, made under commission from the municipality of Be’er Sheva. Situated in the Negev desert, the municipality of Be’er Sheva commissioned our firm to design facade prototypes for social housing blocks built in the 1960s. These blocks needed urgent maintenance to accommodate to the changing climate of the desert region.',
      'These facade prototypes are designed to be assembled on these blocks without major structural intervention, and to act as both a new facade and as an extension of the social housing. These facades will be made from custom aluminium composite, that will provide self-shading to reduce energy consumption in the apartments while not obscuring view or natural light.',
      'Using custom made design for fabrication parametric Grasshopper and C# scripts, these prototypes can be changed to fit multiple typologies of social housing. Using climate analysis and simulation, we were able to reduce the overall temperature of the building and to provide adequate self shading.',
    ],
  },
  {
    slug: 'ghana-library',
    title: 'Community library competition, Ghana',
    kind: 'Architecture',
    meta: ['Ghana', 'Lead designer, computational designer', '2020', 'Competition entry, second place', 'Firm: DY-CP', 'Team: Ben Drusinsky, Ytav Bouhsira, Ben Sorkin'],
    year: 2020,
    tags: { building: .8, computation: .8, fabrication: .6, climate: 1, public: .5 },
    text: [
      'A competition entry for a public library in Accra, Ghana. The competition called for a sustainable, locally sourced construction using only local materials and labour. This library will serve the local community and will integrate with the local landscape and area.',
      'Our entry, chosen for second place, involved a rammed earth design, using the local sandy soil as a basis for construction. Seeing the local soil is often not fit for agriculture and planting, we established that it can be used for construction, using a rammed earth technique with no chemical additives.',
      'Using a computational design method of form finding vaults, we used the rammed earth method to be self sustaining and structurally sound. This design used RhinoVAULT, Grasshopper, C# and custom python for the design iterations.',
    ],
  },
  {
    slug: 'rewiring-fuxing',
    title: 'Rewiring Fuxing',
    kind: 'Architecture',
    meta: ['Fuxing, China', 'Lead designer, AI and computational designer', '2025', 'Competition entry, second place', 'In collaboration with Spatial Forces', 'Team: Ben Drusinsky, Firas Safieddine, Yimeng Wei'],
    year: 2025,
    tags: { urban: 1, ai: 1, data: .7, computation: .6, research: .3 },
    text: [
      'Using cognitive mapping of Fuxing, China, our team created exploratory future planning of the port city, as part of a major competition for the district development. An EEG capture cap was used to record brainwaves and feelings when walking through Fuxing.',
      'These brainwaves and feelings were used as a basis of the speculative exploration for an AI generated future of Fuxing. Using specialised software, we used the brainwaves recorded by the EEG cap to feed various generative AI models. This resulted in a speculative latent walk across the future of Fuxing.',
      'Our team used custom Diffusion models, Comfy UI, Runway ML and Grasshopper to capture and visualize the EEG data.',
    ],
  },
  {
    slug: 'noord-holland',
    title: 'Noord-Holland sentiment analysis',
    kind: 'Architecture',
    meta: ['Noord-Holland Province', 'Lead designer, computational designer', '2026', 'Ongoing', 'Urban Future Lab', 'Team: Ben Drusinsky, Julia Barashkov'],
    year: 2026,
    tags: { urban: 1, data: 1, ai: .7, public: .6, research: .4 },
    text: [
      'Working with the municipality of The Hague and the Province of North Holland. This mapping and heatmap shows areas where local residents felt unsafe in urban settings.',
      'Using a custom coded set of scraping tools, we pooled sentiment data from Google Maps, Instagram, local news and open civic data. This data was fed into a custom trained BERT model for sentiment analysis for Dutch and English. The resulting data was then coded into a dynamic interactive map of social safety in North Holland.',
      'Our team used custom machine learning models, python, JavaScript and the Mapbox API to capture and visualize this sentiment analysis.',
    ],
  },
  {
    slug: 'nolligan',
    title: 'NolliGAN',
    kind: 'Creative technology',
    meta: ['Installation and lecture series', 'Exhibitions: ZeroONE festival, Jerusalem, 2021 · The WRONG Biennale, Barcelona, 2022 · BYOD², Dig Shibuya, Tokyo, 2025 · Transform 2025, Trier, 2025'],
    year: 2025,
    tags: { ai: 1, urban: .7, data: .5, installation: .6, research: .3 },
    text: [
      'The Nolli map is one of the most important tools in architecture and urban design. This complex figure-ground diagram was the first to introduce the thought of public and private space in surveying and mapping; a technique used widely in architecture and urban planning since.',
      'Giambattista Nolli was commissioned by Pope Benedict XIV in 1736 to draw an accurate map of Rome. Nolli’s uniqueness both aesthetically and as a design and mapping tool is its representation of space. In the Nolli map exists space where people can go, and space where they cannot. The depiction of urban fabric consists of building mass and space that includes courtyards and the interior of churches. Public space in the Nolli map is one continuous entity weaving together history, urban planning and society.',
      'At the center of this work lies a generative model hallucinating 18th century Rome. This model was trained on a curated dataset built from a high resolution scan of the original 12 plates of the Nolli map. By manipulating inference and interpolation techniques of the generative models varied hallucinations of urban fabric can be created. These hallucinations are then analyzed by an object detection machine learning model. This object detection model, often used for facial recognition and surveillance is now used to decipher hallucinations and interpret the new generative 18th century Rome.',
      'This is a StyleGAN2 (pytorch implementation) trained on a curated dataset built from high resolution scans of the original 12 plates of the Giambattista Nolli map of 18th century Rome. A YOLOv4 model was trained on the same dataset and manually annotated to recognize the main elements of 18th century Rome: the church, the piazza, the building and the tree. An inference animation of latent space exploration was made with the StyleGAN model and then directly fed into the YOLO model, resulting in a self deciphering generative model.',
    ],
  },
  {
    slug: 'broken-ai',
    title: 'Microdosing AI residency: Broken AI',
    kind: 'Creative technology',
    meta: ['V2_, for Unstable Media, Rotterdam', 'Creative technologist', '2025 – 2026', 'Residency', 'Team: Ben Drusinsky, Niki Scheijen, Rik Mertens'],
    year: 2026,
    tags: { ai: 1, installation: .9, interaction: .7, performance: .2 },
    text: [
      'Residency and exhibition at V2, Rotterdam. Broken AI is an exploration on low-powered, offline LLMs and AI image generators. Two models, one an LLM (Large Language Model), and another, an AI image generator based on a diffusion model, speak to each other.',
      'The Broken LLM generates a prompt based on hand crafted tokens, that is then sent to the diffusion image generator via a private personal network. The diffusion generator, generating an image slowly over a period of 20 minutes, changes the image based on the tokens sent by the LLM while generating the image.',
      'This accumulative sculpture invites the audiences to “break” the LLM, and to select a path of tokens. The LLM argues with the audience, suggesting new ways and tokens to nudge the participant to its desired text, while showing all of the possible “missed” paths.',
    ],
  },
  {
    slug: 'mirage',
    title: 'Mirage',
    kind: 'Creative technology',
    meta: ['V2_, for Unstable Media, Rotterdam', 'Creative technologist', '2025', 'Performance', 'Team: Rotterdam Live Coders Community – Ben Drusinsky, Wouter Lucifer, Den Ree, Niki Scheijen, Sebastian Pappalardo, Rik Mertens, Rafaele Andrade, Johan Stuijt, Arkadesh'],
    year: 2025,
    tags: { performance: 1, interaction: .8, installation: .6, data: .4, ai: .3 },
    text: [
      'MIRAGE (2025) is an immersive audiovisual live-coded performance exploring the core tension of Digital Trace: the unstable boundary between the visible and invisible self, and the ways technology transforms confession into code.',
      'MIRAGE is situated between a performance piece and an interactive installation, where the audience is both an observer and an active participant. Building on the “show us your screen” methodology of the live coding community, the audience is invited to see “behind the scenes”, and peek over the performers’ shoulders as they share their code and process live.',
      'The audience is invited to “step inside the algorithm,” allowing their gestures, movements, and spoken words to become data that is captured, transformed, and returned. Through this feedback loop, MIRAGE reveals how human presence becomes quantifiable information and how algorithmic systems simulate intimacy while quietly accumulating personal traces.',
    ],
  },
  {
    slug: 'billyourself',
    title: 'BillYourSelf',
    kind: 'Creative technology',
    meta: ['Jerusalem Design Week', 'Creative technologist, lead programmer and designer', '2023', 'Team: Ben Drusinsky, Jonatan Asouline'],
    year: 2023,
    tags: { installation: 1, interaction: .9, ai: .6, fabrication: .2, public: .3 },
    text: [
      'Each and every one of us is special, but our money is not. In a world where nothing matters anymore, why should we settle for standard, official paper money? We are unique, and our bills should be too.',
      'The Bill Your Self ATM is an interactive installation that enables users to create and print personalized paper money. While a regular ATM asks for your PIN number, Bill Your Self wants to know who are you? Where do you come from? And how happy are you? The answers are fed into a custom trained generative AI model, and printed. No two bills are alike, their value is what you make of it.',
      'This interactive installation includes the ATM, printing the bills using custom software in processing and python, and a standard thermal printer, and the bill generating service, that can be accessed online. This gives users the ability to print their own bills at the comfort of their home.',
      'The thermal printer, used for printing receipts, is now used to print money. This gives the personalized bills a sense of familiarity and mass production, while simultaneously being gentle and prone to wear.',
    ],
  },
  {
    slug: 'texture-as-interaction',
    title: 'Texture as Interaction',
    kind: 'Creative technology',
    meta: ['M.Des project in collaboration with the DLX lab at the University of Tokyo', 'Installation and lecture series'],
    year: 2022,
    tags: { interaction: 1, urban: .6, public: .8, fabrication: .5, research: .5, installation: .4 },
    text: [
      'Current trends in urban design aim to reduce the number of vehicles in city centers. This trend is part of a growing focus on pedestrian and human-centered cities. At the same time, there is a growing use of autonomous vehicles and agents in our urban space. Following these trends, we can assume that in the near future, most vehicles in our urban space will be autonomous. This raises questions about the interaction and agency of pedestrians and robots.',
      'This project studies the use of public space as a mediator for a trifold interaction between autonomous agents and pedestrians. This project suggests that tactile and capacitive paving in public spaces can be used to communicate autonomous vehicles’ intentions to pedestrians. It can also be used to communicate to the autonomous vehicle pedestrian location and intentions.',
      'This use of public space as a communicator and mediator will allow for a more trusting interaction between a person and autonomous agents. It will also afford public space with performative communicative abilities.',
    ],
  },
  {
    slug: 'teaching',
    title: 'Interaction design with computation within limits',
    kind: 'Teaching',
    meta: ['KISD, TH Köln, Köln · MPlab, RTU, Liepaja, Latvia', 'Adjunct lecturer', '2024 – 2025', 'Critical making and physical computing classes'],
    year: 2025,
    tags: { teaching: 1, interaction: .7, ai: .4, fabrication: .4, installation: .3 },
    text: [
      'Computer Room was a short-term (two weeks) design class for the Integrated Design program at KISD. Students explored the foundations of physical computing and created objects across multiple dimensions: physical objects, open-source designs, and as parts of a whole.',
      'We developed deliberately inconvenient objects that challenge assumptions about comfort, automation, and the relationship between interaction and the spatial environments that allow them. 7 students formed two groups to explore these notions. Aside from their exploratory projects, students had to document their work and process constantly. The end result being a thorough documentation that is between open source and storytelling.',
      'Build Your Own AI Companion is a 3-day workshop, as part of the annual Update Festival for New Media Art, hosted by the MPLab at RTU Liepaja, Latvia. 10 Erasmus+ students from KHM Köln, University of Greifswald, and Tampere University hacked and modified tiny LLMs trapped in Raspberry Pis.',
      'Students learned the basics of Linux, Bash scripting and LLMs, while trying to break locally hosted LLMs using various techniques. The results were displayed in an interactive installation where visitors to Update Festival could interact with unpredictable, broken AI.',
    ],
  },
  {
    slug: 'simulation-framework',
    title: 'Simulation framework for adaptive environments',
    kind: 'Research',
    meta: ['eCAADe 2024', 'First author', '2024', 'Conference paper', 'Technion', 'Team: Ben Drusinsky, Eduard Haiman, Sivan Grodsky', 'DOI: 10.52842/conf.ecaade.2024.1.653'],
    year: 2024,
    tags: { research: 1, computation: .9, building: .5, interaction: .5 },
    text: [
      'A framework for adaptive space simulation, using Grasshopper, Unity, VVVV and C#. Our approach generates, simulates, evaluates and selects optimal adaptability strategies to meet activity requirements while also considering space affordances, occupant preferences and the availability of dynamic components to be allocated at the same time.',
      'This research was led by me and presented in the eCAADe 2024 conference.',
    ],
  },
  {
    slug: 'physical-virtual',
    title: 'Physical and virtual environments',
    kind: 'Research',
    meta: ['CAAD Futures 2023', 'Contributing author', '2023', 'Conference paper', 'Technion', 'Team: Ben Drusinsky, Davide Schaumann, Tom Feldman', 'DOI: 10.1007/978-3-031-37189-9_35'],
    year: 2023,
    tags: { research: 1, interaction: .8, computation: .6, data: .4, teaching: .2 },
    text: [
      'A framework for hybrid places where a virtually-augmented physical place and a physically augmented virtual space dynamically interact to enable co-presence across realities.',
      'This research involved a workflow where the presence of people in a physical place is detected through occupancy sensors and displayed in the coupled virtual place through AR and virtual technology. This research was in collaboration with the Technion computer science department.',
      'My role was to implement physical to digital sensing via Unity, build and test the 3D environment, and to guide students in the computer science program on programming and using Raspberry Pis and ESP32.',
    ],
  },
];
