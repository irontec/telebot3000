import { Component, OnInit } from '@angular/core';
// import * as call from './../../../app-jssip/utils';

@Component({
  selector: 'app-callslist',
  templateUrl: './callslist.component.html',
  styleUrls: ['./callslist.component.scss']
})
export class CallslistComponent implements OnInit {

    calls = [];
  constructor() { }

  ngOnInit() {

    this.calls = [
        {
            target: '695161132',
            type: 'IN',
            duration: '00:10:01'
        },
        {
            target: '201',
            type: 'IN',
            duration: '01:06:11'
        },
        {
            target: '203',
            type: 'OUT',
            duration: '00:22:11'
        }

    ];
  }

}
