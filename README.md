# Operation Code Slack Slashbot
Slash commands integrating various api's.
### Install dependencies
```npm install```

### Run the server in node.js:

``` npm start ```

### Run local tunnel

``` lt --port 8765 --subdomain opcodeslash ```

### Test the library in slack

``` /oc events ```


### List of commands currently implemented:

``` /oc events ```

Returns a list of all events in the Events airtable.

``` /mentees <language> ```

Returns a filtered list of all mentees requesting the provided language

``` /mentors <language> ```

Returns a filtered list of all mentors requesting the provided langauge

``` /mentees unassigned ```

Returns a list of all mentees without an assigned mentor(s)
