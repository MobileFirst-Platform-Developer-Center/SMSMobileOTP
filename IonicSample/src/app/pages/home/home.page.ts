import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private router: Router, private utils: UtilsService) {
  }

  ionViewWillEnter(): void {
  }

  logout() {
    console.log('-->  logout(): Logging out from the application');
    WLAuthorizationManager.logout("SMSOTP").then(() => {
      console.log('-->  logout(): Successfully Logged out.');
    }, (error) => {
      console.log('-->  logout(): Failed to logout. Error : ' + JSON.stringify(error));
    }).done(()=> {
      this.router.navigate(['/login']);
    });
  }
}
