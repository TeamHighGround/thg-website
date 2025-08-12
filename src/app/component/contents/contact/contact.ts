import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-contact',
  imports: [TranslocoModule, CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {

  mail: string = "contact.teamhighground@gmail.com"
  copied = false;

  copyMail() {
    navigator.clipboard.writeText(this.mail).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    });
  }
}
