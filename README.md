# 2026-group-3
2026 COMSM0166 group 3

## Doomsday Kitchen

<div align="center">

  <h3><i>Shoot, Cook, Survive. A post-apocalyptic culinary defense game.</i></h3>

  <a href="https://uob-comsm0166.github.io/2026-group-3/">
    <img src="documentation/images/MainMenuBackground.png" alt="Doomsday Kitchen" width="80%">
  </a>

  <br><br>
  🧟‍♂️  <a href="https://uob-comsm0166.github.io/2026-group-3/"><b>CLICK HERE TO PLAY</b></a> 🍴

  <br>
  <a href="https://youtu.be/Si7i7T8xywY">
    <img src="docs/assets/UI/play.png" alt="Watch the Demo Video" width="150">
  </a>
  
  <br>

  🎥  <a href="https://youtu.be/Si7i7T8xywY"><b>Demo Video</b></a> 🎮

 </div>


## Our Group

<div align="center">

 <img src="documentation/images/WhatsApp Image 2026-02-17 at 14.51.29.jpeg" width="75%" />

| Name | Email | Role |
| :---: | :--- | :--- |
| Matthew Honey | is25252@bristol.ac.uk | Project Manager, Front-end Developer, QA, Music/SFX |
| Yoyo Wu | xa25891@bristol.ac.uk | Front-end Developer, UX/UI Design, Game Flow, Video |
| Khalda Satti | ji25166@bristol.ac.uk | Project Manager, Front-end Developer, QA, Music/SFX |
| Tanveer Bakshi | lr25703@bristol.ac.uk | Documentation, Developer,Game Flow |
| Shuyuan Liu | de25547@bristol.ac.uk | Developer, Architecture and Integration |
| Di Deng | th25793@bristol.ac.uk | Documentation, Developer,Github Review |

## Project Report

## Introduction

Doomsday Kitchen is a genre-blending 2D survival game set in a post-apocalyptic world, forty years after a catastrophic global famine known as the "Shamble Shift." Players take on the role of "The Chef," inheriting a legendary wasteland restaurant from his father. To keep the colony from starving, the player must engage in a dual-phase gameplay loop that seamlessly transitions between high-octane action and strategic time management.

Our core mechanics draw heavy inspiration from several successful titles. The combat and survival aspects are influenced by the horde-clearing upgrade systems of Vampire Survivors and the iconic zombie defense themes of Plants vs. Zombies. Meanwhile, the resource management and restaurant operation phases are directly inspired by the dual-gameplay loop of Dave the Diver, where combat gathering fuels the business operations.

What makes Doomsday Kitchen novel is its subversion of player expectations. At first glance, players may assume it is a straightforward top-down shooter focused purely on surviving endless waves of enemies. However, the game's true "twist" is revealed when the player transitions into the management phase: the enemies they were just shooting are actually the raw ingredients for their restaurant. This unhinged, dark-comedy element of harvesting, cooking, and serving zombie meat to hungry wasteland survivors adds a unique thematic layer. It transforms standard enemy loot into a crucial economic resource, forcing players to balance aggressive hunting with careful culinary planning.

## 2. Requirements 

### 2.1 Ideation Process

Doomsday Kitchen was a result of continuous brainstorming and developing our ideas in response to feedback from both our team and other student groups. While gathering inspiration, we focused on what we liked and didn’t like about each game’s mechanics, storylines, objectives, themes and player modes (see Figure - below).

Individual members developed their own game ideas, creating drawings, diagrams or character images to illustrate them to the group. Through an anonymous vote, we chose two games:
- **Evolution Through Consumption**
- **Doomsday Kitchen (Tower Defence + Management)**

However, after creating prototypes of both games, we chose the latter for the following reasons:


### Distinctive, Unique Gameplay Concept

Doomsday Kitchen combines multiple game ideas into one concept:
- *Plants vs Zombies* (zombie defence)
- *Vampire Survivors* (upgrades)
- *Dave the Diver* (restaurant management phase)

As opposed to Evolution Through Consumption, which was solely inspired by *Agar.io* and contained less thematic creativity.


### Interactive Menu System for Purchasing Food and Weapons

We adapted the menu of *Dave the Diver* to create our own zombie food items, such as [insert examples]. This increased the customisability and interactivity of the game for the player, encouraging engagement by collecting coins and purchasing items they personally like. This is a key component of our user experience.


### Increased Technical Complexity in Mechanics

Incorporating technical novelty into Doomsday Kitchen was more straightforward than in Evolution Through Consumption. We planned for zombies to move freely within the game map, not restricted to a grid or rows, as in *Plants vs Zombies*, where movement is confined to a straight line. Evolution Through Consumption was more constrained in terms of imaginative mechanical design.


<p align="center">
  <img src="documentation/Requirements_figures/games.png" width="75%" />
  <img src="documentation/Requirements_figures/vote.png" width="75%" /> 
</p>

#### Early stages design

<p align="center">
  <img src="documentation/Requirements_figures/PvsZ.gif" width="45%" />
  <img src="documentation/Requirements_figures/VSlevelup.jpg" width="45%" /> 
</p>
<p align="center">
 Our initial concept was a Tower Defense game inspired by Plants vs. Zombies, featuring the power-scaling and upgrade systems of Vampire Survivors. To create a unique twist, we integrated a management cycle similar to Dave the Diver: the gameplay loops between a combat phase (gathering resources) and a management phase (running a shop/restaurant).
</p>

<p align="center">
  <img src="documentation/Requirements_figures/DtDfishing.gif" width="45%" />
  <img src="documentation/Requirements_figures/DtDsushi.gif" width="45%" /> 
</p>
<b> Core Mechanics & Inspirations: </b>
<p align="center">

- Tower Defense: Base defense mechanics inspired by Plants vs. Zombies.

- Progression: Roguelike level-ups and upgrades similar to Vampire Survivors.

- The Twist: A dual-phase loop inspired by Dave the Diver—players switch between an action phase (combat) and a management phase (serving customers).)
</p>
<p align="center">
  <img src="documentation/Requirements_figures/gamePhase.jpg" width="70%" />
  
   <b>To simplify development and keep the gameplay flow intuitive, we pivoted from a two-scene structure to a single unified view. 
 
  We simplified the game loop by keeping everything in one persistent scene. The game alternates phases purely through character movement</b>
</p>

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>Phase 1: Day Time Defense</h3>
      <ul>
        <li><b>Chef's Position:</b> In front of the counter.</li>
        <li><b>Goal:</b> Defend the kitchen from incoming zombies.</li>
        <li><b>Mechanic:</b> Shooting and gathering ingredients (zombie parts).</li>
        <li><b>UI:</b> Health bar and ammo count are visible.</li>
      </ul>
    </td>
    <td width="50%">
      <img src="documentation/Requirements_figures/phase1Prototype.gif" width="100%">
    </td>
  </tr>
</table>
<table>
  <tr>
    <td width="50%" valign="top">
      <h3>Phase 2: Night Time Managment</h3>
      <ul>
        <li><b>Chef's Position:</b> Behind the counter.</li>
        <li><b>Goal:</b> Serve customers food to earn gold.</li>
        <li><b>Mechanic:</b> Cooking and Serving.</li>
        <li><b>UI:</b> Ingredients stock and menu are visible.</li>
      </ul>
    </td>
    <td width="50%">
      <img src="documentation/Requirements_figures/phase2Prototype.gif" width="100%">
    </td>
  </tr>
</table>

### 2.2 Stakeholders & Epics
<p align="center">
  <img src="documentation/Requirements_figures/OnionModel.png" width="60%" />
</p>
<p align="center"><em>Figure : Onion model showing stakeholders of Doomsday Kitchen</em></p>


We also identified the following epics based on the requirments of these stakeholders

- Difficulty options
- Accessibility settings
- Able to earn coins/collect meat
- Able to purchase weapons/upgrades
- Clear and readable user interface
- Difficulty scaling
- Good art
- Good music

### User Stories

With these epics and stakeholders, we devised the following user stories which will drive the development of our game:

| Stakeholder | Epic | User Story | Acceptance Criteria|
|-------------|------|------------|--------------------|
| Competitive Player | Difficulty Options | As a competitive player, I want to be challenged so that I can enjoy the game | Given I am on the main menu, when I start a new game, then I should be given the option of a harder difficulty |
| Casual Player | Difficulty Options | As a casual player, I want a more relaxed experience so that I can enjoy the game | Given I am on the main menu, when I start a new game, then I should be given the option of an easier difficulty |
| Visually Impaired Player | Accessibility Settings | As a visually impaired player, I want to be able to increase the UI size so that I can read the interface better | Given I am on the main menu, when I open the settings, then I should be given the option to change the UI size |
| Hard of Hearing Player | Accessibility Settings | As a hard of hearing player, I want the option to increase the audio volume, so that I can hear the game better | Given I am on the main menu, when I open the settings, then I should be given the option to change the audio volume |
| Player | Able to earn coins/collect meat | As a player, I want to be able to collect meat and earn coins, so that I can purchase upgrades | Given I am playing the game, when I beat a day, then I can use all the meat obtained to earn money in the night phase |
| Player | Able to purchase weapons/upgrades | As a player, I want to be able to purchase upgrades, so that I can be stronger as the game gets harder | Given I am playing the game, when I open up the shop menu, Then I can select any weapons/upgrades to purchase with my money |
| Player | Clear and readable user interface | As a player, I want to be able to easily read the user interface | Given I am playing the game, when I look at any part of the UI, the it should be easily readable |
| Player | Clear and readable user interface | As a player, I want to be able to see indicators of my progress so that I can easily understand my progress through the game| Given I am playing the game, when I look at the UI, then I should be able to see: my current money, the current day and the progress through the current day|
| Player | Difficulty Scaling | As a player, I want the difficulty to increase as I progress through the days so that I can feel challenged | Given I have progressed through a few days, when I fight against the approaching zombies, then there should be more of them and their health should be greater |
| Art Designer | Good Art | As an art designer, I want the art to be used properly in the game so that the art is appreciated by the players | Given I am playing the game, when multiple different assets are visible on screen, they should be layered correctly |
| Music Designer | Good Music | As a music designer, I want the music to be properly utilised in the game so that the music is appreciated by the players | Given I am playing the game, when music is played in the game, then it should be used in the correct scenes and have it's volume correctly mixed with the sound effects |

### 2.3 Use Cases

![Use Case Diagram](documentation/images/UseCaseDiagram.png)

Figure X – Use Case Diagram

- Actor: Player
- System: Zombie Kitchen
- Core Use Cases: Start Game, Configure Settings, Play Game（include Day/Night two stage）, Collect Ingredients, Purchase Upgrades



Table X — Use Case Specifications (Zombie Kitchen)
| Use Case ID | Use Case Name | Primary Actor | Description | Preconditions | Trigger | Main Flow (Summary) | Postconditions | Alternatives / Exceptions |
|------------|-------------|--------------|------------|--------------|--------|--------------------|---------------|--------------------------|
| UC1 | Start Game | Player | Start a new gameplay run | Game launched; main menu visible | Player selects Start Game | System initializes run and enters gameplay loop | New run active | Loading failure returns to menu |
| UC2 | Configure Settings | Player | Adjust game preferences | Player in menu | Player opens settings | System displays and saves updated preferences | Settings updated | Invalid input rejected |
| UC3 | Play Game | Player | Progress through day–night cycles | Run has started | Gameplay begins | Day phase → Night phase → repeat | Player progresses or run ends | Pause, Quit, or Game Over |
| UC4 | Day Phase – Defend Kitchen | Player | Protect kitchen from zombie waves | Play Game active | Day phase starts | Zombies spawn → Player defends → Ingredients drop | Resources gained | Kitchen destroyed → Game Over |
| UC5 | Defeat Zombie Wave | Player | Eliminate attacking zombies | Zombie wave active | Zombies appear | Player attacks → Zombies removed → Drops generated | Wave cleared | Player overwhelmed → Game Over |
| UC6 | Gather Ingredients | Player | Collect dropped ingredients | Ingredients in scene | Player collects item | Item picked up → Inventory updated | Ingredients stored | Inventory full prevents pickup |
| UC7 | Night Phase – Run Kitchen | Player | Convert ingredients into coins/upgrades | Day phase completed | Night phase starts | Cook → Serve → Earn coins → Upgrade | Upgrades applied | None |
| UC8 | Cook Dishes | Player | Prepare dishes from ingredients | Ingredients available | Player selects recipe | Ingredients consumed → Dish created | Dish ready | Missing ingredients |
| UC9 | Serve Customers | Player | Fulfill orders for coins | Customers present | Order placed | Dish served → Coins rewarded | Coins earned | Wrong dish or timeout penalty |
| UC10 | Pause Game | Player | Temporarily halt gameplay | Play Game active | Player pauses | Game freezes → Pause menu shown | Game resumes | None |
| UC11 | Quit Game | Player | Exit current run | Play Game active | Player selects quit | Confirmation → Run ends | Main menu shown | Quit cancelled |
| UC12 | Game Over | Player | End run after failure | Failure met | Kitchen destroyed | Game stops → Game Over screen | Post-game options | None |
| UC13 | Purchase Upgrades | Player | Improve abilities | Sufficient coins | Player opens upgrade menu | Upgrade applied → Coins deducted | Ability improved | Insufficient coins |
| UC14 | Post-Game Options | Player | Choose next action | Game Over active | Player selects option | Action executed | New run or menu | Invalid selection retry |



### 2.4 Reflection

By shaping our epics, user stories and acceptance criteria, we reviewed our proposed game implementations and filled in design gaps. Developing the epics was straightforward, but we became hesitant when creating user stories and acceptance criteria, finding our original definitions too vague. For example, we were sure to include a buying menu, but did not specify what the buying currency in the game was. How would the player purchase upgrades, and how would they earn this currency? We chose that the player would collect zombie meat to earn coins. This lack of detail in our planning reflects our focus on forming good epics but a lack of consideration for the development process.  

The epic, “Difficulty Scaling”, highlighted our lack of lose condition in gameplay. We knew we wanted to gradually increase difficulty as the levels progressed from easy to hard, but we were unsure how to create the challenge. This led to brainstorming ideas: zombies becoming critically close to the player, introducing a “big boss” at the end of a stage with higher difficulty to kill than ordinary zombies and spawning large numbers of zombies to challenge the player’s ability to defeat them before they get too close. We settled on a lose condition where the player’s health decreases as zombies become critically close to the player, and spawning larger numbers of zombies as game level difficulty increases.

Our group also encountered challenges in creating quantifiable acceptance criteria since a significant part of our user stories was based on subjective features. For example, “Given I am playing the game, when multiple different assets are visible on screen, they should be layered correctly”. This user story would be difficult to test because “Good Art” as an epic is subjective. 

Additionally, collecting the requirements emphasised how user stories and acceptance criteria can differ for the same epic. For example, both a casual player and a competitive player might want the option to switch difficulties, but for distinct reasons.

Gathering requirements helped us perfect our game concept, moving us closer to a well-rounded game from a vague idea.

## 3 Design

With our requirements laid out, we could begin working on the architecture design, including any class or sequence diagrams required. We decided an object oriented approach would be most suitable and determined a few key design points we wanted to build our architecture around

1. We would need a way to dynamically switch between scenes within the game. To do this, we decided to use a scene object that could be dynamically switched out within the operation of the game. 
2. We would need a way to contain all the current game elements. To do this, we chose to classify all elements as either entities or UI elements. 
3. We would need a way to dynamically scale the game and it's elements with the players screen. To do this, we chose to fix all entities onto a 16 by 9, and map those local coordinates onto the screen. You UI elements, we don't want them changing size with the screen size, so we decided they would be in fixed positions on the screen, using parameters to attach them to parts of the screen
4. We would need a way to update and draw the game each frame. To do this, we chose to use a model-view-controller approach, whereby the controller updates everything in the scene first, including all its elements, before the view draws everything in the scene.

### 3.1 Class diagrams 

From our system architecture, we designed 3 class diagrams. The first is for the core system architecture, representing our model-view-controller system. The 2nd and 3rd represent our 2 main scenes within the game; our kitchen scene and our shooter scene. We determined these were the most important scenes to design, although other scenes exist like a main menu scene or a introduction scene, those had a relatively simple design.

#### MVC Class Diagram

![Core Class Diagram](/documentation/Class_DIagrams/Class_Diagram_Core.png)

#### Shooter Scene Class Diagram

![Kitchen Scene Class Diagram](/documentation/Class_DIagrams/Class_Diagram_Shooter.png)

#### Kitchen Scene Class Diagram

![Kitchen Scene Class Diagram](/documentation/Class_DIagrams/Class_Diagram_Kitchen.png)

#### UI Bar Class Diagram

![UI Bar Class Diagram](/documentation/Class_DIagrams/Class_Diagram_UIBar.png)

### 3.2 Sequence Diagrams

From our architecture, we determined the most import interactions would come from the update and draw loops, and so these were the first ones we aimed to depict.
TODO: SEQUENCE DIAGRAMS

## Implementation

- 15% ~750 words

- Describe implementation of your game, in particular highlighting the TWO areas of *technical challenge* in developing your game. 

## Evaluation

- 15% ~750 words

- One qualitative evaluation (of your choice)
## Qualitative Evaluation

## Heuristic Evaluation

We conducted a heuristic evaluation of the game using Nielsen's 10 usability heuristics. Each issue was identified and rated based on severity calculated from frequency, impact, and persistence.

Severity = (Frequency + Impact + Persistence) / 3

| # | Heuristic | Location | Problem | F | I | P | Severity | Evidence | Fix |
|---|-----------|----------|---------|---|---|---|----------|----------|-----|
| 1 | Visibility of System Status | Night | Player didn't know when day/night changes | 3 | 3 | 2 | 2.67 | Sudden phase switch | Show transition message |
| 2 | Error Prevention | Day | Incorrect ingredient mapping blocks cooking | 4 | 4 | 4 | 4.00 | Meat mismatch | Fix mapping |
| 3 | Visibility of System Status | Night | No feedback when meat is collected | 3 | 3 | 3 | 3.00 | No drop indicator | Add animation/UI feedback |
| 4 | Consistency & Standards | Day | Different controls between phases | 2 | 2 | 2 | 2.00 | Control mismatch | Standardize controls |
| 5 | Recognition vs Recall | Day | No recipe visibility forces memory use | 3 | 3 | 4 | 3.33 | No recipe list | Add recipe panel |
| 6 | Flexibility & Efficiency | Both | Limited gameplay strategies | 3 | 2 | 4 | 3.00 | Same loop every round | Add upgrades/waves |
| 7 | Help & Documentation | Both | No tutorial for new players | 4 | 3 | 4 | 3.67 | Players confused | Add Instructions menu |
| 8 | Aesthetic & Minimalist Design | Day | UI clutter and small text | 3 | 2 | 3 | 2.67 | Too much info | Simplify UI |
| 9 | Visibility of System Status | Night | No wall damage feedback | 3 | 3 | 3 | 3.00 | No damage indicator | Add cracking effect |
| 10 | User Control & Freedom | Global | No pause functionality | 3 | 4 | 4 | 3.67 | Cannot pause | Add pause menu |
| 11 | Flexibility & Efficiency | Night | Turret position unclear | 2 | 2 | 3 | 2.33 |Can be placed in only one area| Show turret stats |
| 12 | Visibility of System Status | Night | Meat drops not clearly visible | 3 | 3 | 3 | 3.00 | Loot unclear | Add visible drops |

Based on the findings, several targeted design improvements were recommended:

- Implemented an Instructions menu to support first-time users and improve learnability
- Introduced a pause menu to enhance user control and improve user experience
- Improved system feedback mechanisms: Addition of features like meat drops, wall damage, phase transitions
- Ensured consistency in ingredient mapping and controls
- Added recipe panel and reduce UI clutter
- Introduced upgrades and varied gameplay strategies

## Quantitative Evaluation: NASA Task Load Index (TLX)

## Methods

We administered the NASA Task Load Index (Hart and Staveland, 1988) to measure users’ perceived workload across two difficulty levels: Easy and Hard. The latter contained a higher spawn frequency of zombies. To reduce between-participant differences, a within-subjects design was adopted and we recruited only students. 

Limitation: Learning effects potentially minimised perceived workload differences in the Hard difficulty. On reflection, the conditions could have been counterbalanced or randomised across participants, or possibly a time gap to reduce these biases. Nonetheless, the results show that workload predictably increased between the Easy and Hard difficulty levels.



## Results

### Bar Chart: NASA Task Load Index (TLX)

<p align="center">
  <img src="documentation/Evaluation_figures/NASATLX,%20BARCHART.png"
       width="700"
       style="border-radius: 12px;">
</p>

A Wilcoxon Signed Rank Test showed statistical significance for the overall scores (W = 1, p < 0.005).

---

### Stacked Radar Chart: Aggregate perceived workload score (n = 10) for Easy and Hard difficulty

<p align="center">
  <img src="documentation/Evaluation_figures/NASATLXRADARLAYER.jpg"
       width="400"
       style="border-radius: 12px;">
</p>

---

### Radar Chart (Easy Difficulty): Aggregate perceived workload score (n = 10), per dimension

<p align="center">
  <img src="documentation/Evaluation_figures/NASATLXEASY.png"
       width="400"
       style="border-radius: 12px;">
</p>

---

### Radar Chart (Hard Difficulty): Aggregate perceived workload score (n = 10), per dimension

<p align="center">
  <img src="documentation/Evaluation_figures/NASATLXHARD.png"
       width="400"
       style="border-radius: 12px;">
</p>


## Wilcoxon Signed-Rank Test Results (NASA-TLX)

| Dimension     | W stat | p-value | Significant (p < 0.05) | Result        |
|---------------|--------|---------|--------------------------|---------------|
| Mental        | 0      | 0.005   | ✔                        | Significant   |
| Physical      | 0      | 0.025   | ✔                        | Significant   |
| Temporal      | 0      | 0.010   | ✔                        | Significant   |
| Performance   | —      | —       | ✘                        | Not significant |
| Effort        | 3.5    | 0.010   | ✔                        | Significant   |
| Frustration   | 10.5   | 0.100   | ✘                        | Not significant |

---

Mental, physical, temporal and effort scores were recorded significantly higher in the hard condition, as expected due to a higher zombie spawn frequency, tighter timing pressure, and the need for faster keyboard movements. 

Interestingly, frustration had an insignificant result, with unusual variability in scores. For example, User 7 reported less frustration and effort for the hard condition, despite rating increased mental demand. User 1 also recorded less frustration in the harder condition, despite rating mental, physical and temporal demand as higher.

This could be attributed to differences in participants’ perception of the game feedback, specifically the health bar, which very gradually decreased from 100% during gameplay. Participants may not have perceived this as impactful enough to feel frustrated. Rather than omitting these values as possible outliers, we included them in our evaluation, linking them to individual differences. 



## Black Box Testing

Testing was performed by simulating real player behavior and verifying that all game systems respond correctly to user interactions. Each feature was tested across different game states (day and night phases) to ensure consistent and expected behavior without examining the underlying code.

### Day/Night Transition

| Test Case | Input | Expected Output | Result |
|-----------|-------|-----------------|--------|
| TC1 | Wait for day timer to end | Transition to night phase with visual/audio feedback | ✓ Pass |
| TC2 | Wait for night timer to end | Transition to day phase with message | ✓ Pass |
| TC3 | Check UI during transition | Phase indicator updates correctly | ✓ Pass |

### Ingredient Collection (Night Phase)

| Test Case | Input | Expected Output | Result |
|-----------|-------|-----------------|--------|
| TC1 | Enemy defeated during night | Meat drops at enemy location | ✓ Pass |
| TC2 | Meat dropped floats to the Items bar | Ingredient count increases | ✓ Pass |

### Recipe System (Day Phase)

| Test Case | Input | Expected Output | Result |
|-----------|-------|-----------------|--------|
| 1 | Player has correct ingredients | Recipe can be cooked | ✓ Pass |
| 2 | Player missing ingredients | Players tries to add a dish is given a "not enough Ingredients message" | ✓ Pass |
| 3 | Complete recipe | Ingredients consumed,Player earns Profit | ✓ Pass |

### Enemy Spawning (Night Phase)

| Test Case | Input | Expected Output | Result |
|-----------|-------|-----------------|--------|
| 1 | Night phase begins | Enemies spawn at random locations | ✓ Pass |
| 2 | Enemy defeated | Enemy disappears, meat drops | ✓ Pass |
| 3 | Multiple waves | Enemy count increases each wave | ✓ Pass |

### Wall Defense

| Test Case | Input | Expected Output | Result |
|-----------|-------|-----------------|--------|
| 1 | Enemy attacks wall | Wall health decreases | ✓ Pass |
| 2 | Wall takes damage | Visual damage indicator shows | ✓ Pass |
| 3 | Wall health = 0 | Game over/loss state triggered | ✓ Pass |

### Shop Menu

| Test Case | Input | Expected Output | Result |
|-----------|-------|-----------------|--------|
| 1 | Press shop menu  |  menu appears | ✓ Pass |
| 2 | You buy weapons| weapon changes | ✓ Pass |
| 3 | buy turrets | can place a turret in the shooter scene | ✓ Pass |

### Controls Consistency

| Test Case | Input | Expected Output | Result |
|-----------|-------|-----------------|--------|
| 1 | Controls work in day phase | Player can move/interact | ✓ Pass |
| 2 | Controls work in night phase | Player can move/defend | ✓ Pass |
| 3 | Key bindings are consistent | Same keys work throughout game | ✓ Pass |

# Sustainability
It is important to consider the sustainability impact of our systems across all dimensions beyond its immediate effects (enabling and structural), as through our design we cause change, and shape our environment (Karlskrona, 2015 ADD REF).  

Our team conducted a sustainability impact analysis with the Sustainability Analysis Framework. Alongside the environment dimension, we found the individual and social dimensions most applicable to our game. 

#### Individual Impact

**Doomsday Kitchen** may positively impact a user’s mental health by providing stress relief and a sense of accomplishment after each level or night survived. Research suggests that gaming can reduce stress and improve mood (WHO, 2025 ADD REF AT END OF REPORT), supporting the potential benefits of games as a leisure activity. 

On the other hand, if users become highly engaged, the repetitive gameplay loop of “shooting scene → kitchen scene” may encourage an addictive engagement pattern, often described as a “just one more game (ADD REFERENCE AT END OF REPORT)” effect. As levels are relatively short and increase in difficulty, this may promote prolonged or repeated play.

To mitigate this, **Doomsday Kitchen** avoids long-term progression features such as player leaderboards, instead isolating each game session and providing a pause menu to halt gameplay. This reduces the pressure for users to return and continue their progress. Additionally, as no personal data is required to save progress, user privacy is preserved.

Physical health is also at a minor risk, as gameplay requires prolonged use of both a keyboard and mouse to control settings and interact with game elements, such as the “START WAVE” button and weapon upgrades. Extended play may also contribute to eye strain; therefore, a brightness slider has been implemented to improve visual comfort.

Users are given agency through upgrade and customisation options, particularly in weapon selection and kitchen menu items. As difficulty increases and zombie numbers grow, players are encouraged to make strategic decisions about resource allocation. This can enhance engagement, decision-making and planning; however, this agency is constrained by limited in-game currency, which is only earned in the kitchen scene, requiring users to evaluate their choices.

#### **Social Impact**

Our game aims to promote inclusivity through features such as adjustable volume sliders for sound effects and music, as well as a text resize slider. These support players who are hard of hearing or visually impaired, alongside a brightness slider to improve visual comfort. These settings also accommodate different user preferences, improving usability for a wider range of players.

While such features are already common in modern game design, as a team, we agreed their inclusion remains important. Consistent implementation of accessibility settings helps ensure that inclusive design continues to be standard practice within the games industry, rather than being overlooked or deprioritised.

On the other hand, **Doomsday Kitchen** includes themes of combat, involving weapons such as “pistol”, “turret”, and “machine gun”, which are named after real-world items. Although this is a common convention in games such as ***Vampire Survivors***, it may still be perceived as depicting violence.

To mitigate this, the game is centred around fictitious entities, such as zombies, and original food items presented in a creative way. This helps detach the game from real-world contexts and reduces the seriousness of combat, exhibiting a more light-hearted experience.

#### **Environmental Impact**

GitHub Pages, on which Doomsday Kitchen is hosted, provides straightforward deployment and repository storage. However, it is acknowledged that commits, files, and branches are stored redundantly across multiple data centres (Medium, 2025 (ADD REFERENCE AT END OF REPORT)), contributing to increased energy consumption and associated greenhouse gas emissions. In addition, while short gameplay sessions limit prolonged continuous use, repeated play may increase overall energy consumption over time.

The game uses moderately complex 2D graphics, animations, UI overlays, and continuous rendering during gameplay, particularly across the "ShooterScene” and ”KitchenScene_MVP” files. This results in higher processing demand compared to simpler or more static applications. In hindsight, we could have compressed assets to reduce their storage size and improve efficiency.

We aimed to reduce energy usage through features such as a brightness slider; while its primary purpose is to improve visual comfort, it may also contribute to minor reductions in screen energy consumption when used at lower levels.

While our visual design choices enhance the game’s appearance, there is a clear trade-off between user experience and environmental sustainability. In the future we would reduce our asset sizes and reduce unnecessary rendering to minimise energy consumption.


CHAINS OF IMPACT DIAGRAM



# Process 

At the start of this project, we identified our individual strengths to understand our skills, and realise how each member could best contribute to the game and report. For example, a member with a creative background, focused on graphics and the UI, while another, more confident in coding and implementation aspects. Whilst our development process took these preferences into consideration, team members did not have fixed roles. Instead, we frequently updated tasks and adapted priorities, with members claiming work as needed. This ensured we collaborated to complete the project, whilst allowing members to choose skills they wanted to develop or improve.                       

We met both in person and online, aiming for bi-weekly meetings, with regular progress updates between sessions. Sprints lasted 3–4 weeks. Significant moments in our workflow included reading week and the Easter break, which is discussed in this section.

#### Sprint Board: Development Timeline

<p align="center">
  <img src="documentation/Process_figures/SprintBoardStoryPoints.png"
       width="800"
       style="border-radius: 12px;">
</p>

Figure: A retrospective sprint board showing the main story points aimed for each sprint.

The first sprint began in reading week, where a minimal viable product formed. We focused on producing a base to slowly develop, with a main page, shooting scene (including shooting functionality), and a simple kitchen scene interface. During this time, we familiarised ourselves with the codebase. To ensure our communication stayed consistent, despite some of us being less available, we maintained our meetings and discussed progress through text messaging.

However, we noticed that discussion and progress became, understandably, stunted over the Easter break, despite the game not being near completion. Our meeting on the 4th of April was a pivotal moment in our process. We recognised our team process was working, but could be improved. In particular, we lacked clear deadlines, with completion timelines being relatively passive and reliant on task progression through the sprint backlog. 

This led to features intended for earlier completion being outstanding, alongside unfinished sections of the report. This meeting served as a friendly mid-sprint check-in, with the outcome being a stricter plan. We set firmer deadlines on incomplete features and bugs to resolve for the remainder of our sprint, in addition to evaluating each member's current workloads and redistributing the remaining tasks. The final sprint served as a period of consolidation for our game, during which we worked more efficiently than in earlier sprints.

## Planning Poker

We used planning poker during a lab session, via an online tool: Planning Poker online. This helped us understand how each team member perceived the effort required to meet certain requirements. It sparked conversations around why certain requirements were considered more complicated than a few members anticipated. In hindsight, we had a few inaccuracies in our estimations. For example, the user requirement on text resizing needed less effort and was less time consuming than expected. However, the kitchen scene was considerably more challenging than estimated. This tool was great in facilitating team discussion and coordinating our viewpoints on task complexity before our first sprint.

<p align="center">
  <img src="documentation/Process_figures/PlanningPokerApp.gif"
       width="300"
       style="border-radius: 12px;">
</p>

## **Kanban**

Kanban was a beneficial tool for visualising exactly what needed to be done, its priority and size. We used it to delegate tasks in the report and game (keeping in mind collective ownership), making responsibilities clear to everyone. This eliminated ambiguity around what work remained “unclaimed” and prevented any tasks being duplicated. Initially, we used Jira Kanban, but moved to GitHub Projects, keeping our tools in one place with our Git repository. After a while, especially as the deadline approached, we moved away from this approach. We began meeting more regularly and, as the number of remaining tasks decreased, relied more on WhatsApp for delegation.

<p align="center">
  <img src="documentation/Process_figures/JiraKanbanBoard.png" width="500"
       style="margin-right: 20px; border-radius: 12px;"/>
  <img src="documentation/Process_figures/JiraKanbanList.png" width="600"
       style="margin-top: -100px; border-radius: 12px;"/>
</p>


## Communication: WhatsApp and Google Meet

To maintain regular communication outside of in-person meetings, we used both a WhatsApp group and Google Meet. WhatsApp was utilised for everyday discussions whilst Google Meet hosted our online meetings. We regularly shared “progress update” messages to flag significant changes we made to the repository, that might need context (see image below). This allowed all team members to stay “in the loop” with activities, and provided a shared channel to discuss upcoming tasks. WhatsApp was used to notify the group in advance of absences from lab sessions or meetings, which helped to plan lab tasks such as HCI evaluations.

<p align="center">
  <img src="documentation/Process_figures/ProgressUpdateText.png"
       width="700"
       style="border-radius: 12px;">
</p>

## Pair programming

We used pair programming primarily to guide how assets were going to be placed in the game. Our tactician drove the creative vision and implementation methods, whilst the helm brought them to life! We found this approach reduced the number of potential bugs compared to working independently, as defects were identified early. Because this approach required discussion between pairs, it made working through parts of the game quicker, as points could be discussed together in person rather than waiting for text responses or until the next meeting.

insert image here

## Conclusion

- 10% ~500 words

- Reflect on the project as a whole. Lessons learnt. Reflect on challenges. Future work, describe both immediate next steps for your current game and also what you would potentially do if you had chance to develop a sequel.

## Contribution Statement

- Provide a table of everyone's contribution, which *may* be used to weight individual grades. We expect that the contribution will be split evenly across team-members in most cases. Please let us know as soon as possible if there are any issues with teamwork as soon as they are apparent and we will do our best to help your team work harmoniously together.

## Additional Marks

You can delete this section in your own repo, it's just here for information. in addition to the marks above, we will be marking you on the following two points:

- **Quality** of report writing, presentation, use of figures and visual material (5% of report grade) 
  - Please write in a clear concise manner suitable for an interested layperson. Write as if this repo was publicly available.
- **Documentation** of code (5% of report grade)
  - Organise your code so that it could easily be picked up by another team in the future and developed further.
  - Is your repo clearly organised? Is code well commented throughout?
