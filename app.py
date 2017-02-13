#!/usr/bin/env python
from flask import Flask
from flask_slack import Slack
from flask import jsonify
import ssl
# operation-code custom imports
import airtable
import config



app = Flask(__name__)

slack = Slack(app)
app.add_url_rule('/', view_func=slack.dispatch)


@slack.command('your_command', token=config.token,
               team_id=config.team_id, methods=['POST'])
def your_method(**kwargs):
    text = kwargs.get('text')
    return slack.response(text)


if __name__ == "__main__":
    ctx = ssl.SSLContext(ssl.PROTOCOL_SSLv23)
    ctx.load_cert_chain('ssl.cert', 'ssl.key')
    app.run(config.ip, port=config.port, ssl_context=ctx)