import { Injectable } from '@angular/core';
import { LoadingController, AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  isLoading = false;
  private loadingElement: any;

  constructor(private alertCtrl: AlertController, private loadingController: LoadingController) { }


  async presentLoading() {
    this.isLoading = true;
    return await this.loadingController.create({
      duration: 4000,
      message: 'Loading...',
      spinner: 'crescent'
    }).then(a => {
      a.present().then(() => {
        if (!this.isLoading) {
          a.dismiss();
        }
      });
    });
  }

  async dismissLoading() {
    this.isLoading = false;
    return await this.loadingController.dismiss();
  }

  showAlert(header: string, message: string) {
    let alert = this.alertCtrl
      .create({
        header: header,
        message: message,
        buttons: [
          {
            text: 'Ok'
          }
        ]
      })
      .then(arltElem => arltElem.present());
  }
}
