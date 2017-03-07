/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ______    ______    ______   __  __    __    ______
 /\  == \  /\  __ \  /\__  _\ /\ \/ /   /\ \  /\__  _\
 \ \  __<  \ \ \/\ \ \/_/\ \/ \ \  _"-. \ \ \ \/_/\ \/
 \ \_____\ \ \_____\   \ \_\  \ \_\ \_\ \ \_\   \ \_\
 \/_____/  \/_____/    \/_/   \/_/\/_/  \/_/    \/_/


 This is a sample Slack Button application that provides a custom
 Slash command.

 This bot demonstrates many of the core features of Botkit:

 *
 * Authenticate users with Slack using OAuth
 * Receive messages using the slash_command event
 * Reply to Slash command both publicly and privately

 # RUN THE BOT:

 Create a Slack app. Make sure to configure at least one Slash command!

 -> https://api.slack.com/applications/new

 Run your bot from the command line:

 clientId=<my client id> clientSecret=<my client secret> PORT=3000 node bot.js

 Note: you can test your oauth authentication locally, but to use Slash commands
 in Slack, the app must be hosted at a publicly reachable IP or host.


 # EXTEND THE BOT:

 Botkit is has many features for building cool and useful bots!

 Read all about it here:

 -> http://howdy.ai/botkit
 -> https://github.com/howdyai/botkit

 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/* Uses the slack button feature to offer a real time bot to multiple teams */
var Botkit = require('botkit');

/* Airtable Setup */
var Airtable = require('airtable');
var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE);

/* Grab authentication info from env vars */
if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.PORT || !process.env.VERIFICATION_TOKEN) {
    console.log('Error: Specify CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN and PORT in environment');
    process.exit(1);
}

/* 
  This is required for authorizing the app with slack.
  Losing the database or json file will require an oauth
  login to occur again from a slack admin before bot will
  work
*/
var config = {}
if (process.env.MONGO_URI) {
    var BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({mongoUri: process.env.MONGO_URI}),
    };
} else {
    config = {
        json_file_store: './db_slackbutton_slash_command/',
    };
}

var controller = Botkit.slackbot(config).configureSlackApp(
    {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        scopes: ['commands', 'bot'],
    }
);

controller.setupWebserver(process.env.PORT, function (err, webserver) {
    controller.createWebhookEndpoints(controller.webserver);

    controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    });
});


//
// Slack slash commands, edit from here down
//


controller.on('slash_command', function (slashCommand, message) {

    if (message.token !== process.env.VERIFICATION_TOKEN) {
        console.log('Bad token', message.token);
        return; //just ignore it.
    }
    switch (message.command) {
        case "/echo":
            // if no text was supplied, treat it as a help command
            if (message.text === "" || message.text === "help") {
                // TODO: reply help with all available OC commands
                slashCommand.replyPrivate(message,
                    "I echo back what you tell me. " +
                    "Try typing `/echo hello` to see.");
                return;
            }

            // If we made it here, just echo what the user typed back at them
            slashCommand.replyPrivate(message, "1", function() {
                slashCommand.replyPrivate(message, "2").then(slashCommand.replyPrivate(message, "3"));
            });

            break;

        /* Meetup Events */
        /* command /oc events */
        case "/oc":
            if (message.text == 'events'){
                base( "Events" ).select( {
                    view: "Main View"
                } ).firstPage( ( err, records ) => {
                    if ( err ) {
                        return console.error( err );
                    }
                    const events = records.map( record => `${ record.get( "Name" ) } ${record.get("Notes")}` );
                    slashCommand.replyPrivate( message, '*OC Events:*\n' + events.join("\n\n"));
                } );
            }

            break;
        /* command: /mentees <language> */
        // TODO: Create standard function to build queries
        case "/mentees": 
            // prevent too ambiguous of a search
            if (message.text.length < 3){
                slashCommand.replyPrivate(message, '*Length of search param must be 3 or more characters.*');
                return;
            }

            else if (message.text == 'unassigned'){
                base( "Mentees" ).select( {
                    filterByFormula: `NOT({Assigned?} = "true")`
                    , view: "Main View"
                } ).firstPage( ( err, records ) => {
                    if ( err ) {
                        return console.error( err );
                    }
                    const mentees = records.map( record => `@${ record.get( "Slack User" ) }` );
                    slashCommand.replyPrivate( message, '*Mentees without mentors: *\n' + mentees.join("\n"));
                } );
            }

            else {
                base( "Mentees" ).select( {
                    filterByFormula: `SEARCH(LOWER("${message.text}"), LOWER({Language})) >= 1`
                    , view: "Main View"
                } ).firstPage( ( err, records ) => {
                    if ( err ) {
                        return console.error( err );
                    }
                    const mentees = records.map( record => `@${ record.get( "Slack User" ) }` );
                    slashCommand.replyPrivate( message, `*Mentees for ${ message.text }:*\n ${ mentees.join( "\n" ) }` );
                } );
            }

            break;


        /* command: /mentors <language> */
        case "/mentors": 
            if (message.text){
                if (message.text.length < 3){
                    slashCommand.replyPrivate(message, '*Length of search param must be 3 or more characters.*');
                    return;
                }
                base( "Mentors" ).select( {
                    filterByFormula: `SEARCH(LOWER("${ message.text }"), LOWER({Skillsets})) >= 1`
                    , view: "Main View"
                } ).firstPage( ( err, records ) => {
                    if ( err ) {
                        return console.error( err );
                    }
                    const mentors = records.map( record => `@${ record.get( "Slack Name" ) }` );
                    slashCommand.replyPrivate( message, `*Mentors for ${ message.text }:*\n ${ mentors.join( "\n" ) }` );
                } );
            }

            break;

        default:
            slashCommand.replyPrivate(message, "I'm afraid I don't know how to " + message.command + " yet.");

    }

});

// controller.hears('casey me',['ambient', 'direct_message','direct_mention','mention'],function(bot,message) {
//   Scrape.request('https://www.youtube.com/user/caseyneistat/videos', function (err, $) {
//       if (err) return console.error(err);

//       video = $('.channels-content-item .yt-uix-tile-link').first();
//       url = "https://youtube.com" + video.attribs.href;

//       bot.reply(message, video.text + " " + url);
//   });
// });

controller.hears('hello',['direct_message','direct_mention','mention'],function(bot,message) {
 
  bot.reply(message,'Hello yourself.');
 
});