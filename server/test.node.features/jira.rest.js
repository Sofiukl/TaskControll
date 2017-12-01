var config = require('./server/common/config/application-properties.js');

JiraApi = require('jira').JiraApi;
const issueNumber = 'THAGMO-3888';

var jira = new JiraApi('http', config.host, config.port, config.user, config.password, config.version);
jira.findIssue(issueNumber, function(error, issue) {
    console.log('Status: ' + issue.fields.status.name);
});