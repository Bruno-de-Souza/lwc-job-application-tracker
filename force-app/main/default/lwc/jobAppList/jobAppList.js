import { LightningElement, wire } from 'lwc';
import getApplications from '@salesforce/apex/JobAppController.getApplications';
import updateApplicationStatus from '@salesforce/apex/JobAppController.updateApplicationStatus';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const ROW_ACTIONS = [

    { label : 'Applied', name: 'Applied' },
    { label : 'Interviewed', name: 'Interview' },
    { label : 'Offer', name: 'Offer' },
    { label : 'Rejected', name: 'Rejected' }

];

console.log('Line 16');

const COLUMNS = [

    { label: 'Company', fieldName: 'Company__c', type: 'text', editable: 'true' },
    { label: 'Role', fieldName: 'Role__c', type: 'text', editable: 'true' },
    { label: 'Status', fieldName: 'Status__c', type: 'text', editable: 'true' },
    { label: 'Applied Date', fieldName: 'AppliedDate__c', type: 'text', editable: 'true' },
    {
        type: 'action',
        typeAttributes: { rowActions: ROW_ACTIONS }
    }

];

export default class JobAppList extends LightningElement {

    columns = COLUMNS;
    applications;
    error;
    wiredResult;

    @wire(getApplications)
    wiredApplications(result) {
        this.wiredResult = result;
        const { data, error } = result;

        if (data) {
            this.applications = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.applications = undefined;
        }
    }

    async handledRowAction(event) {

        const actionName = event.detail.action.name;
        
        const row = event.detail.row;

        let newStatus;

        switch (actionName) {

            case 'Applied' :
                newStatus = 'Applied';
                break;
            case 'Interview' :
                newStatus = 'Interview';
                break;
            case 'Offer' :
                newStatus = 'Offer';
                break;
            case 'Rejected' :
                newStatus = 'Rejected';
                break;
            default :
                return;

        }

        try {
            await updateApplicationStatus({
                
                recordId: row.Id,
                newStatus: newStatus

            });

            console.log('Line 89');

            this.dispatchEvent(
                new ShowToastEvent({

                    title: 'Success',
                    message: `Status update to ${newStatus}`,
                    variant: 'success'

                })
            );

            console.log('Line 101');
            
            await refreshApex(this.wiredResult);

            console.log('LLine 105');

        } catch (error) {

            this.dispatchEvent(

                new ShowToastEvent({

                    title: 'Error updating status',
                    message: error?.body?.message || 'Unknown error',
                    variant: 'e'

                })

            );

            console.log('Line 121');
            
        }

    }

}