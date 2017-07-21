function submitApplication() {

    var position = document.getElementById('selectPosition');
    var age = document.getElementById('submitAge');
    var timezone = document.getElementById('submitTimezone');
    var country = document.getElementById('submitCountry');
    var experience = document.getElementById('submitExperience');
    var reason = document.getElementById('submitReason');

    if (checkValues(position, age, timezone, country, experience, reason)) {
        sendSubmit(position.value, age.value, timezone.value, country.value, experience.value, reason.value);
    }
}

function checkValues(position, age, timezone, country, experience, reason) {

    if (!position.value || !age.value || !timezone.value || !country.value || !experience.value || !reason.value) {

        if (!age.value) age.setAttribute('class', 'input is-danger');
        if (!timezone.value) timezone.setAttribute('class', 'input is-danger');
        if (!country.value) country.setAttribute('class', 'input is-danger');
        if (!experience.value) experience.setAttribute('class', 'textarea is-danger');
        if (!reason.value) reason.setAttribute('class', 'textarea is-danger');

        return false;
    }
    return true;
}

function sendSubmit(position, age, timezone, country, experience, reason) {

    let url = `/api/submit?position=${position}&age=${age}&timezone=${timezone}&country=${country}&experience=${experience}&reason=${reason}`;

    var submitXhr = new XMLHttpRequest();
    submitXhr.open('GET', url);
    submitXhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            submitSuccessfull();

        } else if (this.readyState === 4 && this.status === 500) {
            console.error(`Error while submitting your application! Error: ${this.responseText}`);
            showSnackbar(`You were unable to submit that number.<br>Error: ${this.responseText}`);

        } else if (this.readyState === 4 && this.status === 401) {
            console.error(`Error while submitting your application! Error: ${this.responseText}`);
            showSnackbar(`You appear to be blocked from submitting applications! Please contact a member of senior staff!`);
        }
    };
    submitXhr.send();
}

function resetFields() {
    document.getElementById('submitAge').value = '';
    document.getElementById('submitTimezone').value = '';
    document.getElementById('submitCountry').value = '';
    document.getElementById('submitExperience').value = '';
    document.getElementById('submitReason').value = '';

    document.getElementById('submitAge').setAttribute('class', 'input');
    document.getElementById('submitTimezone').setAttribute('class', 'input');
    document.getElementById('submitCountry').setAttribute('class', 'input');
    document.getElementById('submitExperience').setAttribute('class', 'textarea');
    document.getElementById('submitReason').setAttribute('class', 'textarea');
}

function submitSuccessfull() {
    console.log(`Successfully submit a staff application!`);
    showSnackbar("You have successfully submitted your application! Submissions are open, but we may not be taking on staff right now!");
    resetFields();
}

function showSnackbar(text) {
    var bar = document.getElementById("snackbar");
    bar.innerHTML = text;
    bar.className = "show";

    setTimeout(function () {
        bar.className = bar.className.replace("show", "");
    }, 6000);
}