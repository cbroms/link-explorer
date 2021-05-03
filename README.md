# Link Explorer

Explore the links between websites.

## Run it

You can either use docker, or run the backend and frontend manually. I'd recommend running them manually if you have Chrome installed locally as performance is better.

### Manually

Enter into both the `client` and `api` directories and run:

```
npm install
npm run dev
```

Visit `http://localhost:5000` in your browser.

### Docker

Create a .env file in the root of this repository with:

```
API=http://localhost:5004
CLIENT=http://localhost:3003
```

Then, run:

```
$ docker-compose up -d
```

Visit `http://localhost:3003` in your browser.
