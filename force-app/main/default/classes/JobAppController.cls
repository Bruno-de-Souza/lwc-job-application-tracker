/**
 * @author bruno.moreira
 */
public with sharing class JobAppController {
    
    @AuraEnabled(cacheable=true)
    public static List<JobApplication__c> getApplications() {

        return [

            SELECT Id, Company__c, Role__c, Status__c, AppliedDate__c FROM JobApplication__c ORDER BY AppliedDate__c ASC LIMIT 200

        ];

    }

    @AuraEnabled
    public static void updateApplicationStatus(Id recordId, String newStatus) {

        if (recordId == null || String.isBlank(newStatus)) {

            throw new AuraHandledException('recordId and newStatus are required!');

        }

        JobApplication__c jobApplication = [ SELECT Id, Status__c FROM JobApplication__c WHERE Id =: recordId LIMIT 1 ];

        jobApplication.Status__c = newStatus;

        update jobApplication;

        System.debug('Job Applications: ' + jobApplication);

    }

}