import { Component, Renderer2 } from '@angular/core';
import { Router } from '@angular/router'
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  private TwilioOTPChallengeHandler: WL.Client.SecurityCheckChallengeHandler;
  phoneNumber: string = '';
  securityCheck: string = 'TwilioOTP';


  constructor(private router: Router, private alertCtrl : AlertController, private renderer2: Renderer2, private utils: UtilsService) {
    renderer2.listen('document', 'mfpjsloaded', (evt) => {
      this.registerChallengeHandler()
    })
  }

  registerChallengeHandler() {
    this.TwilioOTPChallengeHandler = WL.Client.createSecurityCheckChallengeHandler(
      'TwilioOTP'
    );
    this.TwilioOTPChallengeHandler.handleChallenge = (challenge: any) => {
      console.log('--> TwilioOTPChallengeHandler.handleChallenge called');
      if(challenge.errorMsg.includes("Invalid JSON")) {
        this.TwilioOTPChallengeHandler.cancel();
      } else {
        this.displayLoginChallenge(challenge);
      }
    };
  }

  async displayLoginChallenge(response) {
    this.utils.dismissLoading()
    if (response.errorMsg) {
      var msg = response.errorMsg;
      console.log('--> displayLoginChallenge ERROR: ' + msg);
    }
    let prompt = await this.alertCtrl.create({
      header: 'Alert',
      message: msg,
      inputs: [
        {
          name: 'OTP',
          placeholder: 'Enter the verification code'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            this.TwilioOTPChallengeHandler.cancel();
            this.utils.presentLoading()
          }
        },
        {
          text: 'Verify',
          handler: data => {
            data.phoneNumber = response.phoneNumber;
            data.countryCode = response.countryCode;
            this.TwilioOTPChallengeHandler.submitChallengeAnswer(data);
            this.utils.presentLoading()
          }
        }
      ]
    });
    await prompt.present();
  }

  register(form) {
    this.utils.presentLoading();
    let credentials = {
      phoneNumber: form.value.phoneNumber,
      countryCode: '1'
    };
    WLAuthorizationManager.login(this.securityCheck, credentials).then(
      () => {
        console.log('-->  Phone Number Login: Success ');
          //   this.result = "Phone Number Successfully verifed";
          this.router.navigate(['/home']);
          this.utils.dismissLoading()
      },
      (error) => {
        console.log('--> Phone Number Login:  ERROR ', JSON.stringify(error));
        this.utils.dismissLoading().then(() => {
          if (error.responseText.includes("cancelled")) {
            this.utils.showAlert("Login Failure", "Invalid Phone Number/OTP")
          } else {
            this.utils.showAlert("Login Failure", error.responseText)
          }
          form.reset();
        })
      }
    );
  }
}
