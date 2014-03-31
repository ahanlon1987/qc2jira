##QC to JIRA
This is a lightweight node app that will read in requirement #'s from a text file, execute a RESTful lookup for those issues, and then return the corresponding JIRA #'s if applicable.

Steps to run:
1. Install node on your computer http://nodejs.org/
2. Install Node Package Manager - curl http://npmjs.org/install.sh | sh
3. Clone this repo to your local machine
4. Take the weekly requirement extract, transform the "requirement name" column into requirement number by:
* In a new column, run =LEFT(G2,FIND(" ", G2)) WHERE G2 is the column of the "Requirement Name"
* Cut and paste the result of that command into "test.xls" in the qc2jira directory
* From that directory, run npm install then run node app.js
5. Open the output.txt file, sort by the first column A-Z
6. Paste that into the requirements extract, viola, 1-1 mapping of requirements to JIRA issues

