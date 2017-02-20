#!/usr/bin/env python
from flask import Flask
from flask_slack import Slack
from flask import jsonify
import ssl
# operation-code custom imports
import airtable
import config

'''
  REF: https://api.slack.com/slash-commands
  All slack slash commands are recevied from Slack
  as an HTTPS POST.

  Example POST:
    token=gIkuvaNzQIHg97ATvDxqgjtO
    team_id=T0001
    team_domain=example
    channel_id=C2147483705
    channel_name=test
    user_id=U2147483697
    user_name=Steve
    command=/weather
    text=94070
    response_url=https://hooks.slack.com/commands/1234/5678
  
  After receiving the POST you can return either plain text
  or JSON formatted data with an HTTP 200 OK status code.
'''

app = Flask(__name__)

slack = Slack(app)
app.add_url_rule('/', view_func=slack.dispatch)


@slack.command('/weather', token=config.SLACK_TOKEN,
               team_id=config.team_id, methods=['POST'])
def your_method(**kwargs):
    text = kwargs.get('text')
    return slack.response(text)


@app.route('/echo')
def echo_route(methods=['GET']):
    return 'ECHO'


if __name__ == "__main__":
    ctx = ssl.SSLContext(ssl.PROTOCOL_SSLv23)
    ctx.load_cert_chain('protected/ssl.cert', 'protected/ssl.key')
    app.run(config.ip, port=config.port, ssl_context=ctx, debug=True)