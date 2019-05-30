import subprocess

def githubAPI(url):
    url = url.strip() # removing leading/trailing spaces

    if(url.startswith('http://')):
        url = url[len('http://'):] # strip http

    if(url.startswith('https://')):
        url = url[len('https://'):] # strip https

    if(url.startswith('www.')):
        url = url[len('www.'):] # strip www

    if(url.endswith('/')):
        url = url[:-len('/')] # strip trailing /

    if(url.endswith('.git')):
        url = url[:-len('.git')] # strip .git
    
    components = url.split("/");
    if(len(components) != 3):
        return "Wrong URL. Expected URL is like github.com/<:username>/<:repo_url>/"

    domain, username, repo = components;

    if (domain != 'github.com'):
        return "Wrong domain name, only github.com is allowed."

    result = subprocess.run(['node', 'asyncRequest.js', username, repo], stdout=subprocess.PIPE)
    return result.stdout


