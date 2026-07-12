/**
 * @author bruno.moreira
 */
public with sharing class JobAppController {
    
    @AuraEnabled(cacheable=true)
    public static List<JobApplication__c> getApplications() {

        return [

            SELECT Id, Company__c, Role__c, Status__c, AppliedDate__c FROM JobApplication__c ORDER BY AppliedDate__c DESC LIMIT 200

        ];

    }

}