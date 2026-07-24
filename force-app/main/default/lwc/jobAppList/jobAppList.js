import { LightningElement, wire, api } from 'lwc';
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

const COLUMNS = [

    { label: 'Company', fieldName: 'Company__c', type: 'text', editable: 'true' },
    { label: 'Role', fieldName: 'Role__c', type: 'text', editable: 'true' },
    { label: 'Status', fieldName: 'Status__c', type: 'text', editable: 'true' },
    { label: 'Applied Date', fieldName: 'AppliedDate__c', type: 'text', editable: 'true' },
    { type: 'action',typeAttributes: { rowActions: ROW_ACTIONS } }

];

export default class JobAppList extends LightningElement {

    columns = COLUMNS;
    allApplications = [];
    error;
    wiredResult;

    _selectedStatus = 'All';

    @api
    get selectedStatus() {
        return this._selectedStatus;
    }
    set selectedStatus(value) {
        this._selectedStatus = value || 'All';
        this.emitStats();
    }

    @wire(getApplications)
    wiredApplications(result) {
        this.wiredResult = result;
        const { data, error } = result;

        if (data) {
            this.allApplications = data;
            this.error = undefined;
            this.emitStats();
        } else if (error) {
            this.error = error;
            this.allApplications = [];
        }
    }

    get applications() {
        if (this._selectedStatus === 'All') {
            return this.allApplications;
        }
        return this.allApplications.filter(
            app => app.Status__c === this._selectedStatus
        );
    }

    emitStats() {
    const source =
        this._selectedStatus === 'All'
            ? this.allApplications
            : this.allApplications.filter(
                    app => app.Status__c === this._selectedStatus
                );

    const stats = {
        total: source.length,
        interview: source.filter(a => a.Status__c === 'Interview').length,
        offer: source.filter(a => a.Status__c === 'Offer').length,
        rejected: source.filter(a => a.Status__c === 'Rejected').length
    };

    this.dispatchEvent(
        new CustomEvent('statschange', {
            detail: stats
            })
        );
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

            this.dispatchEvent(
                new ShowToastEvent({

                    title: 'Success',
                    message: `Status update to ${newStatus}`,
                    variant: 'success'

                })
            );
            
            await refreshApex(this.wiredResult);

            this.emitStats();

        } catch (error) {

            this.dispatchEvent(

                new ShowToastEvent({

                    title: 'Error updating status',
                    message: error?.body?.message || 'Unknown error',
                    variant: 'e'

                })

            );

            
        }

    }

}