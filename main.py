from githubAPI import githubAPI
from flask import Flask, render_template, request, send_from_directory

app = Flask('radius-interview')


@app.route("/", methods=['GET'])
def index():
    return send_from_directory('frontend', 'index.html'); # sends frontend/index.html

@app.route("/<path>", methods=['GET'])
def frontend_static_server(path):
    return send_from_directory('frontend', path); # sends frontend/

@app.route("/api/githubIssues", methods=['POST'])
def getGithubIssues():
    _dict = request.get_json()
    if(_dict):
        url = _dict.get('url')
        if (url and len(url)):
            # validations?
            return githubAPI(url)
        else:
            return "Did you pass any URL?"
    else:
        return "Did you pass any json body? Also check the header Content-Type: application/json";

@app.after_request
def add_header(r):
    """
    Forcing browser to cache the rendered page for 0 minutes.
    So that we can see real time changes while in dev mode.
    It should be removed in production.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r

app.run(debug=True, port=5000, host='0.0.0.0')