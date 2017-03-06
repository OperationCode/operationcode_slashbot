var Airtable = require('airtable');
var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE);


base( "Mentees" ).select( {
    filterByFormula: `NOT({Assigned?} = "true")`
    , view: "Main View"
} ).firstPage( ( err, records ) => {
    if ( err ) {
        return console.error( err );
    }
    const mentees = records.map( record => `@${ record.get( "Slack User" ) }` );
    console.log('*Mentees without mentors: *\n' + mentees.join("\n"));
} );



text = 'python';
base( "Mentees" ).select( {
    filterByFormula: `SEARCH(LOWER("${text}"), LOWER({Language})) >= 1`
    , view: "Main View"
} ).firstPage( ( err, records ) => {
    if ( err ) {
        return console.error( err );
    }
    const mentees = records.map( record => `@${ record.get( "Slack User" ) }` );
    console.log(`*Mentees for ${ text }:*\n ${ mentees.join( "\n" ) }` );
} );