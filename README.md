# Group Video Chat Web App
![](https://miro.medium.com/max/1400/1*XEu9XT-U1RKmuTtz8k3qMQ.png)
This is a group video chat web app that uses [Agora.io](https://www.agora.io) to build a simple group video chat web app, very similar to Google Hangouts, Skype or whichever other video chat platform you prefer. 

## Pre Requisites
- [A simple web server](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server) (I like to use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer))
- An SSL certificate or way to have an https connection (I use [ngrok](https://ngrok.com))
- A developer account with [Agora.io](https://www.agora.io)
- An understanding of HTML/CSS/JS 
- An understand of how Bootstrap and JQuery function _(minimal knowledge needed)_

Read the full tutorial: [GUIDE.MD](/GUIDE.MD)

## Hosted Demo ##
If you would like to see the demo in action, check out the [demo of the code in action](https://digitallysavvy.github.io/group-video-chat/) on GitHub Pages 

## How to Run the Demo ##
To test the video chat app, start a [simple web server](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server) with a secure connection _(https)_. To keep things simple I like to use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) but you can use XAMPP, or any other local server that you prefer.

All browsers have the `localhost` url Whitelisted as secure, so you can use that to test. 

If you want to test this out with friends you can run it locally in conjunction with [ngrok](https://ngrok.com), a service that creates a tunnel out from your local machine and provides an https url for use. In my experience this is one of the simplest ways to run a publicly accessible `https` secured webserver on your local machine. 

Once the server is ready we can run our test.

>NOTE: use two (or more) browser tabs to simulate a local host and a single/multiple remote host(s).
