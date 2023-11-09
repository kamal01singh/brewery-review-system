# Brewery Review System

## Screenshots

![image](https://github.com/kamal01singh/brewery-review-system/assets/106004575/f98a4f78-132f-4274-aaed-5bf63f415338)

![image](https://github.com/kamal01singh/brewery-review-system/assets/106004575/9a3e9637-a0cc-46db-a5bf-310d6b8882b9)

![image](https://github.com/kamal01singh/brewery-review-system/assets/106004575/1952fed9-70a9-45ff-8b0a-bdc99fcc4467)

![image](https://github.com/kamal01singh/brewery-review-system/assets/106004575/bfed6a74-86ea-4355-93ab-128ca8994b08)


## Overview
This is a web application to search Brewery by City, Type, Name using Brewery APIs (https://www.openbrewerydb.org/documentation).

Users can provied ratings and add reviews.

## Features
- Users can create profile and ratings, reviews and browse nearby breweries.
- user can search based on City, Type, Name.
- Users can refer to other peoples ratings and reviews.

## TechStack
- NodeJS - Backend
- ExpressJS - Handeling routes
- ejs - Its a templating engine
- MongoDB - Store user review and Ratings
- MySQL - Store the signup and login details.

## How to Run
- ``` git clone https://github.com/kamal01singh/brewery-review-system.git ```
-   3rd party api ```https://www.openbrewerydb.org/documentation ```
- Installing all dependencies
   - ``` npm i ```
- To run server in Developer mode
  - ```npm run dev```
- To run server in Production mode
  - ``` npm run prod```
- To access the web application on the browser
  - [localhost:3000](http://localhost:3000) or use .env to set the port as required
