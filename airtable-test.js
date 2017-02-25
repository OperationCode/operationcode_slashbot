/* load all environment variables from script .env */
require('env2')('.env');

/* Airtable Setup */
var Airtable = require('airtable');
var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE);



let mentees = [];
let languageFilter = 'JAVA';
new Promise( ( resolve, reject ) => {
    base('Mentees').select({
        view: 'Main View',
        // filterByFormula: `{Language} = "${languageFilter}"`
        filterByFormula: `NOT({Assigned?} = "true")`
    }).firstPage(function(err, records) {
        if (err) { console.error(err); reject( err );}

        records.forEach(function(record) {
            mentees.push('@' + record.get('Slack User'));
        });

        resolve( mentees );
    });
}).then( mentees => console.log('*Mentees requesting ' +languageFilter+ ':*\n' + mentees.join("\n")));

