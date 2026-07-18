import { LightningElement } from 'lwc';

export default class JobAppForm extends LightningElement {

    company = '';
    role = '';
    showPreview = false;

    handleCompanyChange(event) {
        this.company = event.target.value;

        console.log('Line 12');
    }

    handleRoleChange(event) {
        this.role = event.target.value;

        console.log('Line 18');
    }

    handleAdd() {
        this.showPreview = true;

        console.log('Line 24');
    }

}