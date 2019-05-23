import json
import requests
import datetime
import pytz

utc=pytz.UTC


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
        return "Wrong URL. Expected URL is like github.com/:username/:repo_url"

    domain, username, repo = components;

    if (domain != 'github.com'):
        return "Wrong domain name, only github.com is allowed."

    link = f'https://api.github.com/repos/{username}/{repo}/issues';

    response = requests.get(link)
    try:
        issues_json = json.loads(response.text)
    except:
        return f'Github did not return a json. Are you sure, you entered a correct URL.<br> It returned {response.text}'

    try:
        message = issues_json.get('message')
        return f'Github says {message}'; # if github sends any message
    except:
        pass
    

    now = datetime.datetime.now(pytz.UTC)
    now = now.replace(tzinfo=pytz.UTC)

    last_one_day_issues = 0
    last_one_week_issues = 0
    all_issues = 0
    for issue in issues_json:
        created_at = issue.get('created_at')
        if (created_at):
            date = datetime.datetime.strptime(created_at[:-1], "%Y-%m-%dT%H:%M:%S")
            date = date.replace(tzinfo=pytz.UTC)
            if date < now-datetime.timedelta(days=7): # date is before 1 week
                all_issues += 1
            elif date < now-datetime.timedelta(hours=24): # date is before 24 hours
                last_one_week_issues += 1
            else:                                                             # date is after 24 hours
                last_one_day_issues += 1

    total_issues = all_issues + last_one_week_issues + last_one_day_issues;
    return (
        f"Total Issues: {total_issues}<br>"
        f"Issues that were opened in the last 24 hours: {last_one_day_issues}<br>"
        f"Issues that were opened more than 24 hours ago but less than 7 days ago: {last_one_week_issues}<br>"
        f"Issues that were opened more than 7 days ago: {all_issues}"
    );