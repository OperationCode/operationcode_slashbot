#!/usr/bin/env python

with open('protected/token.txt', 'r') as f:
    token = f.read()

team_id = 'operation-code'
ip = '0.0.0.0'
port = 8080