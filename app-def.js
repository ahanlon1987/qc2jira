var JiraApi = require("jira").JiraApi;
var excel = require("excel");
var Backbone = require("backbone");
var nodeFS = require("fs");

var config = {
    "user": "jirabot",
    "password": "jiraBotSlalom1",
    "port":"443",
    "host": "slalom100.jira.com"
};


var SPRINT_FIELD = 'customfield_10550';
var QC_DEFECT_FIELD = 'customfield_10750';

var finalMapping = new Backbone.Collection();
var numberOfRequirements;
var outputString = '';


excel('defects.xlsx', function(error, data){

    console.log('inside parse excel');

    if (error) {
        console.log(error);
        throw error;
    }

    numberOfRequirements = 0;
    console.log("data.length: " + data.length);
    var requirementNumberCollection = new Backbone.Collection(data);

    numberOfRequirements = requirementNumberCollection.size();
    console.log("Number of defects in Excel found: "  + numberOfRequirements);

    requirementNumberCollection.forEach(function(model){
        if(model.get(0)){
            console.log("Looking for defect: " + model.get(0));
            var issueNumber = lookupIssue(model.get(0));
        }
    });
});




function lookupIssue(defectNumber) {


    var query = '"QC Defect Number" ~' + '"' + defectNumber + '"';
    var jira = new JiraApi('https', config.host, config.port, config.user, config.password, '2');

    jira.searchJira(query, {fields:["summary", "status", SPRINT_FIELD, QC_DEFECT_FIELD]}, function(error, issues) {

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
            var defectNumber = '';
            var delim = ' ';

            searchResultIssues.forEach(function(foundIssue){
                keys += delim + foundIssue.get('key');
                var fields= foundIssue.get('fields');
//                console.log('Found issue:' + JSON.stringify(foundIssue)+ '\n');
                var sprint = [];
                var qcDefect = [];
                sprint = fields[SPRINT_FIELD];
                if(sprint != null){
                    var charNum = sprint[0].search("name=") + 5;
                    sprints += delim + sprint[0].substr(charNum, 9);
                }
                delim = ', ';


                qcDefect = fields[QC_DEFECT_FIELD];

                if(qcDefect != null){
                    defectNumber += qcDefect;
                }


            });
        }


        finalMapping.add({
            defectNumber: defectNumber,
            key:keys,
            sprint:sprints
        });

        if (keys && !sprints) {
            sprints = 'TBD'; //If we have an NGEN Ticket, but no Sprint #, set the Sprint to "TBD"
        }

        outputString += (keys ? keys : 'NO JIRA FOUND') + ' | ' + ( sprints ? sprints : 'NO SPRINT FOUND') + ' | ' + (defectNumber ? defectNumber : 'NO QC #')  + '\n';


        console.log("final Mapping Size: " + finalMapping.size() + ', numberOfRequirements: ' + numberOfRequirements);
        // if (finalMapping.size() == numberOfRequirements) {
            nodeFS.writeFile("out-defects.txt", outputString, function(error) {

                if (error){
                   console.log(error);
                }

                console.log("Finished writing to output.txt.");
            })
        // }

    });
}










