import { LightningElement, wire, api } from 'lwc';
import getApplications from '@salesforce/apex/JobAppController.getApplications';
import updateApplicationStatus from '@salesforce/apex/JobAppController.updateApplicationStatus';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { deleteRecord } from 'lightning/uiRecordApi';

const BASE_ROW_ACTIONS = [
    { label: 'Applied', name: 'Applied' },
    { label: 'Interview', name: 'Interview' },
    { label : 'Offer', name: 'Offer' },
    { label : 'Rejected', name: 'Rejected' }

];

const COLUMNS = [
    { label: 'Company', fieldName: 'Company__c', type: 'text' },
    { label: 'Role', fieldName: 'Role__c', type: 'text' },
    { label: 'Status', fieldName: 'Status__c', type: 'text' },
    { label: 'Applied Date', fieldName: 'AppliedDate__c', type: 'text' },
    { type: 'action', typeAttributes: { rowActions: { fieldName: 'rowActions' } } },
    { 
        type: 'button', 
        initialWidth: 150,
        typeAttributes: {
            label: 'Delete',
            name: 'delete',
            title: 'Delete',
            variante: 'destructive',
            disabled: { fieldName: 'disableDelete' }
        } 
    }
];

export default class JobAppList extends LightningElement {
    columns = COLUMNS;
    allApplications = [];
    error;
    errorMessage = '';
    wiredResult;

    isLoading = true;
    isUpdating = false;

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
            this.error = undefined;
            this.errorMessage = '';
            this.allApplications = data.map(row => ({
                ...row,
                rowActions: this.buildRowActions(),
                disableDelete: this.isUpdating
            }));
            this.emitStats();
        } else if (error) {
            this.error = error;
            this.errorMessage = error?.body?.message || 'Unable to load job applications.';
            this.allApplications = [];
        }

        this.isLoading = false;
    }

    get applications() {
        const source =
            this._selectedStatus === 'All'
                ? this.allApplications
                : this.allApplications.filter(app => app.Status__c === this._selectedStatus);

        return source.map(row => ({
            ...row,
            rowActions: this.buildRowActions(),
            disableDelete: this.isUpdating
        }));
    }

    get hasRecords() {
        return this.applications && this.applications.length > 0;
    }

    get showEmptyState() {
        return !this.isLoading && !this.error && !this.hasRecords;
    }

    buildRowActions() {
        return BASE_ROW_ACTIONS.map(action => ({
            ...action,
            disabled: this.isUpdating
        }));
    }

    emitStats() {
        const source =
            this._selectedStatus === 'All'
                ? this.allApplications
                : this.allApplications.filter(app => app.Status__c === this._selectedStatus);
                
        const stats = {
            total: source.length,
            applied: source.filter(a => a.Status__c === 'Applied').length,
            interview: source.filter(a => a.Status__c === 'Interview').length,
            offer: source.filter(a => a.Status__c === 'Offer').length,
            rejected: source.filter(a => a.Status__c === 'Rejected').length
        };

        this.dispatchEvent(new CustomEvent('statschange', { detail: stats }));
    }

    async handleRowAction(event) {
        if (this.isUpdating) return;

        const actionName = event.detail.action.name;
        const row = event.detail.row;

        this.isUpdating = true;

        try {
            if (actionName === 'delete') {
                await deleteRecord(row.Id);

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Deleted',
                        message: 'Application deleted successfully',
                        variant: 'success'
                    })
                );
            } else {
                let newStatus;

                switch (actionName) {
                    case 'Applied':
                        newStatus = 'Applied';
                        break;
                    case 'Interview':
                        newStatus = 'Interview';
                        break;
                    case 'Offer':
                        newStatus = 'Offer';
                        break;
                    case 'Rejected':
                        newStatus = 'Rejected';
                        break;
                    default:
                        return;
                }

                await updateApplicationStatus({ recordId: row.Id, newStatus });

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: `Status updated to ${newStatus}`,
                        variant: 'success'
                    })
                );
            }

            this.isLoading = true;
            await refreshApex(this.wiredResult);
            this.emitStats();
        } catch (err) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: err?.body?.message || err?.message || 'Unknown error',
                    variant: 'error'
                })
            );
        } finally {
            this.isUpdating = false;
            this.isLoading = false;
        }
    }
}