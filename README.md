ClineUiP 2
===

Folder and file structure:
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
│   │       └── patients.js      // Frontend service to comunicate with server
│   └── partials
│       ├── header.html          // Navihation HTML
│       ├── home.html            // Home page, 'Home Page...'
│       └── patients.html        // HTML code for 'patient' page
└── README.md