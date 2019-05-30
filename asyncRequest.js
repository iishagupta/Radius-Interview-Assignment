// this is to use the power of async request in nodeJS

const REQUEST_PER_UNIT_TIME = 15;

const unirest = require('unirest');
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
}

const username = process.argv[2];
const repo = process.argv[3];


let page = 1;
let tillPage = REQUEST_PER_UNIT_TIME;

let previous_non_zero_issues_counter = 0;
let previous_zero_issues_counter = 0;

let last_one_day_issues = 0
let last_one_week_issues = 0
let all_issues = 0

const now = new Date().getTime();
const one_day_before = now - (1 * 24 * 60 * 60 * 1000); // now - 24 hours
const one_week_before = now - (7 * 24 * 60 * 60 * 1000); // now - 7 days

function count(issues_json) {
    issues_json.forEach(issue => {
        if(issue['pull_request']) {
            // the github api docs says, that they will send pull requests also in issues API
            // if its a pull request, dont process this issue, so return
            return;
        }
        
        const created_at = issue['created_at']

        const date = new Date(created_at);
        if (date < one_week_before)     // date is before 1 week
            all_issues += 1
        else if (date < one_day_before) // date is before 24 hours
            last_one_week_issues += 1
        else                            // date is after 24 hours
            last_one_day_issues += 1
    })
}

function handleResponse(response) {
    // console.log("handling some response")
    responseText = response.raw_body;
    let issues_json = {};
    try {
        issues_json = JSON.parse(responseText);
    }
    catch(e) {
        console.log(
            `Github did not return a json. Are you sure, you entered a correct URL.<br> It returned ${responseText}`
        )
        process.exit();
    }

    try {
        const message = issues_json.message;
        if(message) {
            console.log(
                `Github says ${message}`
            ) // if github sends any message
            process.exit();
        }
    }
    catch(e) {}

    count(issues_json);
    if(issues_json.length != 0) {
        previous_non_zero_issues_counter++;
    } else {
        previous_zero_issues_counter++;
    }
    if(previous_non_zero_issues_counter + previous_zero_issues_counter === REQUEST_PER_UNIT_TIME)
        check_non_zero_issues_counter()
}

function check_non_zero_issues_counter() {
    if(previous_non_zero_issues_counter === REQUEST_PER_UNIT_TIME) {
        page ++;
        tillPage += REQUEST_PER_UNIT_TIME;
        previous_non_zero_issues_counter = 0;
        previous_zero_issues_counter = 0;
        makeRequests();
    } else {
        // end the code
        const total_issues = last_one_day_issues + last_one_week_issues + all_issues;
        console.log(
            `Total Issues: ${total_issues}<br>`,
            `Issues that were opened in the last 24 hours: ${last_one_day_issues}<br>`,
            `Issues that were opened more than 24 hours ago but less than 7 days ago: ${last_one_week_issues}<br>`,
            `Issues that were opened more than 7 days ago: ${all_issues}`,
        );
        process.exit();
    }
}


function makeRequests() {
    // console.log(`making request to page #${page}`)

    unirest.get(
        `https://api.github.com/repos/${username}/${repo}/issues?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&q=is:issue&per_page=100&page=${page}`
    )
    .headers(headers)
    .end(res => {
        handleResponse(res)
    });
    
    if(page === tillPage)
        return;

    page++;
    makeRequests() 
}

makeRequests()
