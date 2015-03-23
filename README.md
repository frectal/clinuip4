ClinUiP 3.3
===
Clinical Overview
-----
This is a lightweight but powerful Clinically Oriented Application based on earlier work called [Clin Ui P, Clinical UI Patterns](http://clinuip.wordpress.com/).

Primarily..it exposes 3 key levels of a typical healthcare application.

1) Research & Reporting... the pie and bar charts show at a glance some key aspects , eg total number of Male/Female Patients, or patients by Age. A search in the search field refines that and clicking on the charts further refines the search to return the relevant patient cohort list.

2) Management of Cohort .. the middle table shows at a glance who are those individuals who make up a specific cohort of patients, eg All Male Patients, All Age 31-60 etc, All that fit such a search criteria. A simple filter alongside that table enables further quick filtering. A click on any row then makes the individual record available for a patient.

3) Patient Care.. the right table shows the patients record. The entries that make up the record are groups of "clinical statements" captured at specific points in time, with an encounter number also linked. Data Entry can be made with/without a template.


It offers 2 key modal forms to allow data capture

1) Free form - here by using "type ahead" the user can quickly record preformed clinical statements for a particular event + free text to balance the structure/narrative elements.

2) Templated- here by using "tags" we filter those clinical statements that may be most relevant for this scenario, which then allows rapid data entry + free text entry to balance the structured /narrative elements.

Any data entered can be used to power a search at a later time.



Secondly it exposes a simple way to create and maintain a clinical content library..

The Content is grouped by Headings and can be tagged.
This content is captured in the form of common clinical statements.
This content is then available for use within the Healthcare application, either in free form and with/without leveraging the tags.


Screenshots
---
Overview of clinical application

![OverviewPic.jpg](https://bitbucket.org/repo/qMrRdp/images/185708717-OverviewPic.jpg)


Data Entry Modal

![OverviewPic_DataEntry.jpg](https://bitbucket.org/repo/qMrRdp/images/3511412551-OverviewPic_DataEntry.jpg)

Overview of Clinical Content admin

![OverviewPic_ClinicalContent.jpg](https://bitbucket.org/repo/qMrRdp/images/661535907-OverviewPic_ClinicalContent.jpg)


Technical Overview & Install
---
This is Javascript application using the MEAN stack including Node.js + MongoDB. You need to have installed Node.js and MongoDB on your PC/server to be able to run application.

Setup
--
- get latest code from source control:
```sh
mkdir installFolder
cd installFolder
git clone git@bitbucket.org:frectal/clinuip3_mean.git
(OR)
git clone https://frectal@bitbucket.org/frectal/clinuip3_mean.git
cd clinuip3_mean
```
- install Node.js modules
```sh
npm install
```
- start application
```sh
node index.js
```

Folder and file structure
----

```sh
  .
  ├── app                          // Node.js server side code
  │   ├── controllers
  │   │   ├── index.js
  │   │   └── patients.js          // Actions for patient controller
  │   └── models
  │       ├── index.js
  │       └── patient.js           // MongoDB mapping file for "patient" collection
  ├── app.json                     // Config
  ├── index.js                     // Start index, db connection, routes...
  ├── package.json                 // Config
  ├── public                       // Frontend code (AngularJS, HTML, CSS)
  │   ├── css                      // Custom CSS lib files
  │   ├── index.html               // Home page, start page of our application
  │   ├── js
  │   │   ├── app.js
  │   │   ├── controllers
  │   │   │   ├── homeCtrl.js
  │   │   │   └── patientsCtrl.js  // Frontend code for 'patients' page
  │   │   ├── lib                  // Custom JS libs (jquery, angular, bootstrap...)
  │   │   └── services
  │   │       └── patients.js      // Frontend service to communicate with server
  │   └── partials
  │       ├── header.html          // Navigation HTML
  │       ├── home.html            // Home page, 'Home Page...'
  │       └── patients.html        // HTML code for 'patient' page (module)
  └── README.md

```
License
-----
Copyright 2015 Frectal Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.