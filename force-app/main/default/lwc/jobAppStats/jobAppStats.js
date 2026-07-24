import { LightningElement, api } from 'lwc';

export default class JobAppStats extends LightningElement {
    @api total = 0;
    @api interview = 0;
    @api offer = 0;
    @api rejected = 0;
}