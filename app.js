var JiraApi = require("jira").JiraApi;
var excel = require("excel");
var Backbone = require("backbone");

var config = {
    "user": "jirabot",
    "password": "jiraBotSlalom1",
    "port":"443",
    "host": "slalom100.jira.com"
};


var SPRINT_FIELD = 'customfield_10550';

var finalMapping = new Backbone.Collection();

excel('test.xlsx', function(error, data){
    console.log('inside parse excel');

    if (error) {
        console.log(error);
        throw error;
    }

    var requirementNumberCollection = new Backbone.Collection(data);
    console.log("Number of requirements found: "  + requirementNumberCollection.size());


    requirementNumberCollection.forEach(function(model){

        if(model.get(0)){
            console.log("Looking for attribute: " + model.get(0));
            var issueNumber = lookupIssue(model.get(0));
        }

    });

});




function lookupIssue(requirementNumber) {
    var query = 'text~' + '"' + requirementNumber + '"';
    console.log("inside of lookupIssue(), looking for: " + query);
    var jira = new JiraApi('https', config.host, config.port, config.user, config.password, '2');

    jira.searchJira(query, {fields:["summary", "status", SPRINT_FIELD]}, function(error, issues) {

        if(error){
            console.log(error);
            return;
        }

        var searchResults = new Backbone.Model(issues);
        console.log("Issues found: " + searchResults.get('total'));
        var searchResultIssues = new Backbone.Collection(searchResults.get('issues'));

        if(searchResultIssues){
            var keys = '';
            var sprints = '';
            var delim = ' ';

            searchResultIssues.forEach(function(foundIssue){
                keys += delim + foundIssue.get('key');
                var fields= foundIssue.get('fields');
                var sprint = [];
                sprint = fields[SPRINT_FIELD];
                if(sprint != null){
                    var charNum = sprint[0].search("name=") + 5;
                    sprints += sprint[0].substr(charNum, 9);
                }
                delim = ', ';

            });
        }

        finalMapping.add({
            requirementNumber: requirementNumber,
            key:keys,
            sprint:sprints
        });

        console.log(JSON.stringify(finalMapping));
    });
}










