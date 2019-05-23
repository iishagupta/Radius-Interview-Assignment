function getGithubIssues() {
    showLoader()
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/githubIssues');
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
        if(xhr.readyState === 4) {
            hideLoader();
            document.getElementById('serverResponse').innerHTML = xhr.responseText;
        }
    }
    xhr.send(JSON.stringify({
        url: document.getElementById('githubURL').value,
    }))
}

function showLoader() {
    document.getElementById('serverResponseDiv').style.display = 'none';
    document.getElementById('loading-gif').style.display = 'flex';
}

function hideLoader() {
    document.getElementById('serverResponseDiv').style.display = 'flex';
    document.getElementById('loading-gif').style.display = 'none';
}

