# Question inventory

110 expanded questions. Generated from the runtime bank with `npm run docs:generate`. Full conditions, examples, destinations and validation are in QUESTION_BANK.json.

| ID                             | Scope      | Category   | Question                                                                             | Priority | Required |
| ------------------------------ | ---------- | ---------- | ------------------------------------------------------------------------------------ | -------: | -------- |
| identity.name                  | profile    | identity   | What name should appear on your résumé?                                              |      100 | Yes      |
| identity.email                 | profile    | identity   | Which email can employers use to contact you?                                        |       99 | Yes      |
| career.target                  | profile    | career     | What are you looking for next?                                                       |       98 | Yes      |
| education.year                 | profile    | education  | Where are you in your studies?                                                       |       97 | No       |
| education.school               | profile    | education  | Where do you study?                                                                  |       96 | Yes      |
| education.degree               | profile    | education  | What degree and major are you working toward?                                        |       95 | Yes      |
| education.graduation           | profile    | education  | When do you expect to graduate?                                                      |       94 | Yes      |
| discovery.work                 | profile    | discovery  | Have you had a job, internship, or paid responsibility?                              |       93 | No       |
| discovery.sources              | profile    | discovery  | Which of these have you tried?                                                       |       92 | No       |
| discovery.story                | profile    | discovery  | Tell me about one thing you did that someone relied on.                              |       91 | No       |
| identity.phone                 | profile    | identity   | Would you like to include a phone number?                                            |       24 | No       |
| identity.location              | profile    | identity   | What city or region are you based in?                                                |       35 | No       |
| identity.linkedin              | profile    | identity   | What is your LinkedIn URL?                                                           |       23 | No       |
| identity.github                | profile    | identity   | What is your GitHub URL?                                                             |       23 | No       |
| identity.website               | profile    | identity   | Do you have a portfolio or personal website?                                         |       23 | No       |
| education.gpa                  | profile    | education  | Would you like to include your GPA and its scale?                                    |       30 | No       |
| education.coursework           | profile    | education  | Which classes have given you skills relevant to your target?                         |       58 | No       |
| education.honors               | profile    | education  | Have you earned honors, scholarships, or academic awards?                            |       44 | No       |
| education.lab                  | profile    | education  | What is one lab or class assignment you can explain and demonstrate?                 |       88 | No       |
| education.research             | profile    | education  | Have you worked with a professor or research group?                                  |       42 | No       |
| career.interests               | profile    | career     | Which kinds of problems make you curious?                                            |       85 | No       |
| career.workMode                | profile    | career     | What work arrangement would you prefer?                                              |       52 | No       |
| career.type                    | profile    | career     | What kind of opportunity do you want?                                                |       54 | No       |
| career.location                | profile    | career     | Where would you like to work, and could you relocate?                                |       41 | No       |
| career.industry                | profile    | career     | Are there industries or organizations you are interested in?                         |       20 | No       |
| career.enjoyed                 | profile    | career     | Which project or class have you enjoyed most, and why?                               |       64 | No       |
| career.people                  | profile    | career     | How would you like to spend most of your working day?                                |       50 | No       |
| career.tradeoff                | profile    | career     | Would you rather analyze an open-ended problem or build a concrete solution?         |       49 | No       |
| career.unsure                  | profile    | career     | What have you tried so far, and what would you like to try next?                     |       87 | No       |
| career.job                     | profile    | career     | Do you have a job description you want to use?                                       |       15 | No       |
| skills.claimed                 | profile    | skills     | Which technical tools or languages have you used?                                    |       61 | No       |
| skills.evidence                | profile    | skills     | Pick one skill. What did you actually do with it, and where?                         |       60 | No       |
| skills.recency                 | profile    | skills     | When did you last use those skills, and what could you do independently?             |       39 | No       |
| skills.languages               | profile    | skills     | Which languages can you communicate in, and in what contexts?                        |       17 | No       |
| skills.certifications          | profile    | skills     | Have you earned any certifications?                                                  |       35 | No       |
| skills.evaluation              | profile    | skills     | How could someone inspect or reproduce your work?                                    |       38 | No       |
| import.resume                  | profile    | discovery  | What is in your existing résumé that we have not captured?                           |       16 | No       |
| experience.summary             | experience | experience | How would you describe this experience in your own words?                            |       90 | No       |
| experience.problem             | experience | experience | What problem or need were you working on?                                            |       87 | No       |
| experience.action              | experience | experience | What did you personally do?                                                          |       89 | Yes      |
| experience.tools               | experience | experience | What tools, technologies, or methods did you actually use?                           |       84 | No       |
| experience.outcome             | experience | experience | What happened as a result of your work?                                              |       83 | No       |
| experience.metric              | experience | experience | Is there a number or range you can honestly support?                                 |       80 | No       |
| experience.team                | experience | experience | Who did you work with, and what was your role?                                       |       63 | No       |
| experience.challenge           | experience | experience | What was the hardest part, and how did you solve it?                                 |       70 | No       |
| experience.communication       | experience | experience | When did you explain your work to someone else?                                      |       47 | No       |
| experience.learning            | experience | experience | What did you learn or become able to do independently?                               |       36 | No       |
| experience.link                | experience | experience | Is there a public link or artifact you can share?                                    |       22 | No       |
| project.summary                | project    | projects   | How would you describe this experience in your own words?                            |       90 | No       |
| project.problem                | project    | projects   | What problem or need were you working on?                                            |       87 | No       |
| project.action                 | project    | projects   | What did you personally do?                                                          |       89 | Yes      |
| project.tools                  | project    | projects   | What tools, technologies, or methods did you actually use?                           |       84 | No       |
| project.outcome                | project    | projects   | What happened as a result of your work?                                              |       83 | No       |
| project.metric                 | project    | projects   | Is there a number or range you can honestly support?                                 |       80 | No       |
| project.team                   | project    | projects   | Who did you work with, and what was your role?                                       |       63 | No       |
| project.challenge              | project    | projects   | What was the hardest part, and how did you solve it?                                 |       70 | No       |
| project.communication          | project    | projects   | When did you explain your work to someone else?                                      |       47 | No       |
| project.learning               | project    | projects   | What did you learn or become able to do independently?                               |       36 | No       |
| project.link                   | project    | projects   | Is there a public link or artifact you can share?                                    |       22 | No       |
| activity.summary               | activity   | activities | How would you describe this experience in your own words?                            |       90 | No       |
| activity.problem               | activity   | activities | What problem or need were you working on?                                            |       87 | No       |
| activity.action                | activity   | activities | What did you personally do?                                                          |       89 | Yes      |
| activity.tools                 | activity   | activities | What tools, technologies, or methods did you actually use?                           |       84 | No       |
| activity.outcome               | activity   | activities | What happened as a result of your work?                                              |       83 | No       |
| activity.metric                | activity   | activities | Is there a number or range you can honestly support?                                 |       80 | No       |
| activity.team                  | activity   | activities | Who did you work with, and what was your role?                                       |       63 | No       |
| activity.challenge             | activity   | activities | What was the hardest part, and how did you solve it?                                 |       70 | No       |
| activity.communication         | activity   | activities | When did you explain your work to someone else?                                      |       47 | No       |
| activity.learning              | activity   | activities | What did you learn or become able to do independently?                               |       36 | No       |
| activity.link                  | activity   | activities | Is there a public link or artifact you can share?                                    |       22 | No       |
| education.summary              | education  | education  | How would you describe this experience in your own words?                            |       90 | No       |
| education.problem              | education  | education  | What problem or need were you working on?                                            |       87 | No       |
| education.action               | education  | education  | What did you personally do?                                                          |       89 | Yes      |
| education.tools                | education  | education  | What tools, technologies, or methods did you actually use?                           |       84 | No       |
| education.outcome              | education  | education  | What happened as a result of your work?                                              |       83 | No       |
| education.metric               | education  | education  | Is there a number or range you can honestly support?                                 |       80 | No       |
| education.team                 | education  | education  | Who did you work with, and what was your role?                                       |       63 | No       |
| education.challenge            | education  | education  | What was the hardest part, and how did you solve it?                                 |       70 | No       |
| education.communication        | education  | education  | When did you explain your work to someone else?                                      |       47 | No       |
| education.learning             | education  | education  | What did you learn or become able to do independently?                               |       36 | No       |
| education.link                 | education  | education  | Is there a public link or artifact you can share?                                    |       22 | No       |
| experience.repair              | experience | experience | Which devices and hardware or software problems did you diagnose?                    |       88 | No       |
| experience.recovery            | experience | experience | Did you recover data or handle sensitive information? What precautions did you take? |       74 | No       |
| experience.customers           | experience | experience | What did you help customers understand or decide?                                    |       61 | No       |
| experience.automation          | experience | experience | Did you automate or simplify any repetitive task?                                    |       66 | No       |
| experience.ownership           | experience | experience | Were you responsible for opening, closing, inventory, or working independently?      |       62 | No       |
| experience.training            | experience | experience | Did you train someone? What did you teach and how?                                   |       59 | No       |
| experience.improvement         | experience | experience | Did your work change turnaround time, errors, cost, or reliability?                  |       68 | No       |
| experience.frequency           | experience | experience | How often did you perform this work?                                                 |       52 | No       |
| project.architecture           | project    | projects   | How did the main parts of your project fit together?                                 |       74 | No       |
| project.frontend               | project    | projects   | What did you implement in the user interface?                                        |       59 | No       |
| project.backend                | project    | projects   | What happened on the server, and what did you implement?                             |       62 | No       |
| project.database               | project    | projects   | How did you structure, query, or validate the data?                                  |       67 | No       |
| project.testing                | project    | projects   | How did you test it, and what failure did a test catch?                              |       76 | No       |
| project.security               | project    | projects   | What permissions, authentication, or security risks did you address?                 |       72 | No       |
| project.deployment             | project    | projects   | Where did you deploy it, and what did you manage yourself?                           |       55 | No       |
| project.performance            | project    | projects   | Did you measure speed, resource use, or reliability?                                 |       53 | No       |
| project.data                   | project    | projects   | Where did your data come from, and how did you check its quality?                    |       86 | No       |
| project.evaluation             | project    | projects   | How did you evaluate the model or analysis, and against what baseline?               |       85 | No       |
| project.threat                 | project    | projects   | What system were you allowed to assess, and what did you find?                       |       86 | No       |
| project.engineering            | project    | projects   | Which design tradeoff or code review changed your implementation?                    |       82 | No       |
| project.systems                | project    | projects   | How did you monitor or debug the system when something failed?                       |       82 | No       |
| project.hardware               | project    | projects   | How did you design, measure, or test the physical system?                            |       82 | No       |
| activity.leadership            | activity   | activities | What decision or responsibility did you personally own?                              |       67 | No       |
| activity.event                 | activity   | activities | Did you organize an event? What did you coordinate?                                  |       57 | No       |
| activity.tutoring              | activity   | activities | How did you help someone understand a difficult topic?                               |       58 | No       |
| activity.community             | activity   | activities | Did you maintain content, a community, or a shared service?                          |       56 | No       |
| activity.award                 | activity   | activities | Was your work recognized, published, or awarded?                                     |       49 | No       |
| education.additionalCoursework | education  | education  | Which relevant courses did you complete here?                                        |       65 | No       |
| education.additionalHonors     | education  | education  | Which honors or scholarships did you receive here?                                   |       50 | No       |
