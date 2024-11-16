## Install

`npm install`

## Scripts ex.

cd functions

ts-node -r tsconfig-paths/register src/scripts/reporting.ts

## Notes

Deploy one function at a time:

`firebase deploy --only functions:notificateQuiz`

don't forget to check the targeted project before deploying 
echo $(firebase use)

to deploy the express api is mandatory to deploy all functions also