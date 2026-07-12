import { LightningElement, wire } from 'lwc';
import getApplications from '@salesforce/apex/JobAppController.getApplications';

const COLUMNS = [

    {label: 'Company', fieldName: 'Company__c', type: 'text'},
    {label: 'Role', fieldName: 'Role__c', type: 'text'},
    {label: 'Status', fieldName: 'Status__c', type: 'text'},
    {label: 'Applied Date', fieldName: 'AppliedDate__c', type: 'text'}

];

export default class JobAppList extends LightningElement {

    columns = COLUMNS;
    applications;
    error;

    @wire(getApplications)
    wiredApplications({data, error}) {

        if(data) {

            this.applications = data;
            this.error = undefined;

        } else if(error) {

            this.error = error;
            this.applications = undefined;
            console.error(JSON.stringify(error));

        }

    }

}