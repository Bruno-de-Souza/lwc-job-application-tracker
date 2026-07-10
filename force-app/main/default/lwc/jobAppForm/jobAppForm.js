import { LightningElement } from 'lwc';

export default class JobAppForm extends LightningElement {

    company = '';
    role = '';
    showPreview = false;

    handleCompanyChange(event) {
        this.company = event.target.value;
    }

    handleRoleChange(event) {
        this.role = event.target.value;
    }

    handleAdd() {
        this.showPreview = true;
    }

}