# ABOUT

r9 is the ninth revision of my personal website, developed in early 2021. however, it will probably never go public.

# PREREQUISITES

- yarn 1.22
- node 12.9
- mysql 5.7

# DATABASE

DROP DATABASE IF EXISTS r9;
CREATE DATABASE r9 CHARACTER SET utf8 COLLATE utf8_general_ci;

# MODULES USED

- babel/core                 : the core libraries used for babel (babel transpiles es6 to usable code)
- babel/preset-env           : allows using latest es6 syntax
- babel/preset-react         : configuration of babel for usage with react
- ckeditor/ckeditor5-react   : rich text editor that works with react
- argon2                     : handles password hashing
- autoprefixer               : automatically inserts CSS vendor prefixes for rules that require it
- babel-cli                  : used to transpile from a task runner
- babel-eslint               : linting for es6
- babel-loader               : loads es6 files and parses them (webpack process)
- body-parser                : to be able to parse 'body' content (as opposed to just headers) in API responses
- ckeditor5-custom-build     : customised version of the ckeditor5 editor created using their online builder
- clean-webpack-plugin       : webpack package to clean a folder
- compression-webpack-plugin : used to gzip assets and files
- cookie-parser              : makes it much easier to parse cookies in backend
- copy-webpack-plugin        : webpack package to copy files and assets
- cors                       : middleware to solve CORS issues with local running express accessed from frontend
- css loader                 : The css-loader interprets @import and url() like import/require() and will resolve them                               
- cssnano                    : compresses css and removes comments
- dotenv                     : read system variables from .env
- dotenv-webpack             : read system variables from .env
- express                    : backend interface (this sits between frontend JS and Node)
- html-webpack-plugin        : this injects resource locators (js, css) into the project's entry point (index.html)
- jsonwebtoken               : sign and verify json web tokens
- minicssextractplugin       : extracts CSS into separate files, one for each js file (css modules)
- multer                     : handles multipart (eg image) uploads within express
- mysql2                     : The underlying connector library used by Sequelize for MySQL
- nocache                    : disables caching of files within node
- nodemon                    : watches for changes made to express and reloads the server if required
- path                       : stores and resolves paths used in the application
- postcss                    : framework for loading css extensions in webpack
- postcss-loader             : is able to load css and scss
- precss                     : this is a module for postcss for mixins and nesting support
- react                      : the frontend framework of choice
- react-dom                  : the dom manipulation library of react
- react-router               : the router component of react
- react-router-dom           : the dom manipulation library of the router component
- sass-resources-loader      : injects global sass variables before compiling the extracted css into css modules
- sequelize                  : ORM to make working with SQL easier
- sequelize-cli              : the cli version that can be run from terminal
- slugify                    : automatically generate a slug based on a string
- uuid                       : generates unique identifiers
- webpack                    : task runner to automate building assets and transpiling es6 code
- webpack-cli                : to run it from the command line

dev dependencies:

- eslint                     : for linting
- eslint-plugin-css-modules  : eslint plugin for parsing css modules
- eslint-plugin-jsx-a11y     : eslint plugin for parsing jsx
- eslint-plugin-react        : eslint plugin for parsing react
        
# USAGE

first ensure a valid .env exists based on the .env.example_prod or .env.example_dev file. then run these services:

### Backend

- nvm use 12.9                  : ensure node 12.9 is used in your currently opened terminal!
- yarn run start                : this will start the backend express server

### Frontend

- nvm use 12.9                  : ensure node 12.9 is used in your currently opened terminal!
- php -S 127.0.0.1:9010 -t web/ : use any web server like XAMPP or PHP to serve the frontend from the web/ folder

### Builder

- nvm use 12.9                  : ensure node 12.9 is used in your currently opened terminal!
- yarn run build:dev --watch    : build sources and enable watcher

## Folder structure

- config/                       : contains the various configuration files. Note the Webpack config stays in root
- express/                      : contains endpoint configuration for the API written in express
- sequelize/                    : serves as an ORM to make writing SQL statements easier
- src/                          : the javascript source code and asset files
- web/                          : the transpiled es6 code as output by webpack

## Migrations

to build up the database according to the migrations, first destroy the current database, and recreate it:

`DROP r9`

then run:

`yarn sequelize-cli db:migrate`

note these commands take db configuration from config/db.config.json and run in dev mode by default

`yarn sequelize-cli db:migrate --env production`

will run the same command in production mode

see https://sequelize.org/master/manual/migrations.html for more on migrations

### Fresh start?

a yarn target was introduced to automate the process of destroying a database, creating a new one according to the
defined models, and run the available migrations and seeders:

`yarn run db-rebuild:dev`

note that this is a dangerous command, use it with care.

after you have run this, ensure you register for the admin pages by going to /register (the default user wont work)

## MySQL

just as a side note, to prevent clashing (port or credentials) with running Dockerised MySQL instances:

- docker(-compose) stop mysql (this will stop any running Dockerised instances of MySQL)
- brew services start mysql (this will start the local MySQL instance that r9 uses)

and the other way around:

- brew services stop mysql
- docker start mysql

## CSS

the CSS code is imported / bundled per Javascript component (CSS Modules) but there is a folder containing global css
for styling that should be loaded on every page. The names of the selectors specified therein are not mangled by Webpack.

## Linting

`yarn run lint`

Will run linting on the project.

## Authentication flow

If this whole set-up seems a bit overcomplicated for a simple monolithic application like this, then you are absolutely
right. I did it to learn new things.

`/register`

At this point you can freely register. Given credentials are stored in MySQL with the password hashed by Argon2.

`/login`

Backend hashes given password then compares with the stored hashed password, if correct a SH256 serialised JWT
accessToken is generated with a short TTL, together with a refreshToken that is valid for a bit longer. On every call to
a protected API endpoint the cookie token is checked again for validity.

`/authenticate`

Separate endpoint to check if given access token (forwarded by cookie) is valid. If not, it will attempt to refresh the
access token using the endpoint below. This ensures secure pages are not rendered, before even doing endpoint requests.

`/refreshtoken`

This will refresh the access token, as long as the refresh token is still valid.
