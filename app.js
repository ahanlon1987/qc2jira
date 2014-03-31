var JiraApi = require("jira").JiraApi;
var excel = require("excel");
var Backbone = require("backbone");

var config = {
    "user": "jirabot",
    "password": "jiraBotSlalom1",
    "port":"443",
    "host": "slalom100.jira.com"
};


var finalMapping = new Backbone.Collection();

excel('test.xlsx', function(error, data){
    console.log('inside parse excel');

    if (error) {
        console.log(error);
        throw error;
    }


    var requirementNumberCollection = new Backbone.Collection(data);
    console.log("Number of requirements found: "  + requirementNumberCollection.size());

    //Locking ths down to one requirement.
    var flag = true;
    requirementNumberCollection.forEach(function(model){

        if (flag){
            if(model.get(0)){
                console.log("Looking for attribute: " + model.get(0));
                var issueNumber = lookupIssue(model.get(0));
            }
        }

        flag = false;

    });

});




function lookupIssue(requirementNumber) {
    var query = 'text~' + '"' + requirementNumber + '"';
    console.log("inside of lookupIssue(), looking for: " + query);
    var jira = new JiraApi('https', config.host, config.port, config.user, config.password, '2');

    jira.searchJira(query, {}, function(error, issues) {

        if(error){
            console.log(error);
            return;
        }

        var searchResults = new Backbone.Model(issues);
        console.log("Issues found: " + searchResults.get('total'));
        var searchResultIssues = new Backbone.Collection(searchResults.get('issues'));

        if(searchResultIssues){
            var keys = '';
            var delim = ' ';
            searchResultIssues.forEach(function(foundIssue){
                keys += delim + foundIssue.get('key');
                delim = ', ';
            });
        }

        finalMapping.add({
            requirementNumber: requirementNumber,
            keys:keys
        })


        console.log(JSON.stringify(finalMapping));
    });
}










