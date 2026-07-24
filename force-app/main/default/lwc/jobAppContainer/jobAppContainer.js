import { LightningElement } from 'lwc';

export default class JobAppContainer extends LightningElement {
    selectedStatus = 'All';

    stats = {
        total: 0,
        interview: 0,
        offer: 0,
        rejected: 0
    };

    statusOptions = [
        { label: 'All', value: 'All' },
        { label: 'Applied', value: 'Applied' },
        { label: 'Interview', value: 'Interview' },
        { label: 'Offer', value: 'Offer' },
        { label: 'Rejected', value: 'Rejected' }
    ];

    handleFilterChange(event) {
        this.selectedStatus = event.detail.value;
    }

    handleStatsChange(event) {
        this.stats = event.detail;
    }
}