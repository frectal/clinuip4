ClineUiP 2
===

This is Node.js + MongoDB application. You need to have instaled Node.js and MongoDB on yout PC to be able to run application.

Setup
--
- get latest code from source control:
```sh
mkdir installFolder
cd installFolder
git clone git@bitbucket.org:frectal/clinuip3_mean.git
OR
git clone https://frectal@bitbucket.org/frectal/clinuip3_mean.git
then
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

[
  '{{repeat(1000)}}',
  {
    name: '{{firstName()}} {{surname()}}',
    sex: '{{gender()}}',
    identifier: '{{guid()}}',
    author: '{{firstName()}} {{surname()}}',
    dob: function (tags) {
      var start = new Date(1945, 0, 1),
          end = new Date(2010, 0, 1);

      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }
  }
]