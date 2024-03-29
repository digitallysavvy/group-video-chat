# Agora Live Video

![Group Vido Demo](https://github.com/digitallysavvy/group-video-chat/actions/workflows/deploy-to-pages.yaml/badge.svg)

Pure javascript implmentation of the Agora Video SDK for Web v4.2
For an walk through of the code: [Guide.md](Guide.md)

Test the build here: [https://digitallysavvy.github.io/group-video-chat/](https://digitallysavvy.github.io/group-video-chat/)

## Setup

1. Clone the repo
2. Rename `.env-example` file to `.env`
3. Add Agora API Key to the .env file

## Test in Dev mode
1. Follow steps in setup
2. Open the terminal and navigate to repo folder
3. Use this command to run dev mode with local webserver: 
```npm run dev```

## Build for production
1. Follow steps in setup
2. Open the terminal and navigate to repo folder
3. Use this command to run the build script: 
```npm run build```
4. Upload the contents of the new `dist` folder to your webserver
5. Make sure the server has your Agora API key set in the environment variables using the env variable `VITE_AGORA_APP_ID=`