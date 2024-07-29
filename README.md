# benweare.co.uk-api

## Description

This repository is the backend solution for [benweare.co.uk](https://benweare.co.uk).

It uses the Express.js framework to create an easy to launch service.

I use a personalised version of Swagger-UI to document the API, this is called [Swagger-UI-SLIM](https://www.npmjs.com/package/swagger-ui-slim). This was also created by me so I could have a lightweight solution with minimal/no configuration required.

This site is hosted on Heroku under these applications:

-   [benweare.co.uk](https://benweare.co.uk)

-   [dev.benweare.co.uk](https://dev.benweare.co.uk)

## Frontend Application

The frontend solution is a React based app.

It uses React-Router to incorporate a multi-page application.

This site constantly polls the API with a socket connection to check for updated news and weather data.

## API Documentation

Documentation on the benweare.co.uk API can be found in:

-   [Production](https://www.benweare.co.uk/api/docs/)

-   [Development](https://dev.benweare.co.uk/api/docs/)

The server fetches data at different intervals:

-   News Endpoints refresh every 8 minutes.
-   Weather Endpoints refresh every 15 minutes.

## Usage

This is not intended for usage outside of my personal website, though can be adapted to suit other webscrape/server uses.

This frontend-UI to this repository is installed via NPM called [benweare.co.uk-client](www.npmjs.com/package/benweare.co.uk-client). In the case that someone else wishes to use this repo, they can substitute this module for their personal frontend package or use their own static files.

## Requirements

There are required environment variables.

### Discord Bot Requirements:

1. _DISCORD_CLIENT_ID_
2. _DISCORD_TOKEN_

These are required to login the bot into Discord.

### Weather Requirements:

1. _METOFFICE_API_TOKEN_
2. _LATITUDE_
3. _LONGITUDE_

These are used to collect weather data from the [Met Office API](www.metoffice.gov.uk/services/data).

### NASA API Requirements:

1. _NASA_API_KEY_

This is used to collect the [NASA Daily Image](api.nasa.gov/).
