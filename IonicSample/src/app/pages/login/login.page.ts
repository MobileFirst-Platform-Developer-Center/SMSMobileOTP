import { Component, Renderer2, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router'
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  private SMSOTPChallengeHandler: WL.Client.SecurityCheckChallengeHandler;
  phoneNumber: string = '';
  securityCheck: string = 'TwilioOTP';
  isRegistered: Boolean = false;


  constructor(private router: Router, private alertCtrl : AlertController, private renderer2: Renderer2, private utils: UtilsService, private cd: ChangeDetectorRef) {
    renderer2.listen('document', 'mfpjsloaded', (evt) => {
      this.registerChallengeHandler()
    //  this.checkRegistration()
    })
  }

  registerChallengeHandler() {
    this.SMSOTPChallengeHandler = WL.Client.createSecurityCheckChallengeHandler(
      'SMSOTP'
    );
    this.SMSOTPChallengeHandler.handleChallenge = (challenge: any) => {
      console.log('--> SMSOTPChallengeHandler.handleChallenge called');
      this.displayLoginChallenge();
    };
  }

  async displayLoginChallenge() {
    this.utils.dismissLoading()
    let prompt = await this.alertCtrl.create({
      header: 'Alert',
      message: "One Time Verification code has been succesfully sent to the mobile number",
      inputs: [
        {
          name: 'code',
          placeholder: 'Enter the verification code'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            this.SMSOTPChallengeHandler.cancel();
            this.utils.presentLoading()
          }
        },
        {
          text: 'Verify',
          handler: data => {
            this.SMSOTPChallengeHandler.submitChallengeAnswer(data);
            this.utils.presentLoading()
          }
        }
      ]
    });
    await prompt.present();
  }


  checkRegistration() {
    this.utils.presentLoading()
    var resourceRequest = new WLResourceRequest("/adapters/SMSOTP/phone/isRegistered",WLResourceRequest.GET, {});
    resourceRequest.send().then((response) => {
      console.log('-->  isRegisterd(): Success ', JSON.stringify(response));
      //this.isRegistered = true;
    },(error) => {
        console.log('-->  isRegisterd():  ERROR ', JSON.stringify(error.responseText));
        this.utils.showAlert('Failure', 'Something went wrong. Reason : ' + error.responseText);     
    }).done(() => {
      this.utils.dismissLoading();  
    });
  }

  register(form) {
    this.utils.presentLoading()
    var resourceRequest = new WLResourceRequest("/adapters/SMSOTP/phone/register/"+ form.value.phoneNumber,WLResourceRequest.POST, {});
    resourceRequest.send().then((response) => {
      console.log('-->  register(): Success ', JSON.stringify(response));
      this.isRegistered = true;
      this.phoneNumber = form.value.phoneNumber;
      this.cd.detectChanges(); 
      this.utils.showAlert('Success', 'Your mobile number got registered successfully');  
    },(error) => {
        console.log('-->  register():  ERROR ', JSON.stringify(error.responseText));
        this.utils.showAlert('Failure', 'Something went wrong. Reason : ' + error.responseText);     
    }).done(() => {
      this.utils.dismissLoading();  
    });
  }

  login() {
    this.utils.presentLoading()
    WLAuthorizationManager.obtainAccessToken("SMSOTP").then((token) => {
      console.log('-->  login(): Success ', JSON.stringify(token));
      this.router.navigate(['/home']);
    },(error) => {
        console.log('-->  login():  ERROR ', JSON.stringify(error.responseText));
        this.utils.showAlert('Failure', 'Something went wrong. Reason : ' + error.responseText);     
    }).done(() => {
      this.utils.dismissLoading();  
    });
  }

  clearRegistration(){
    this.isRegistered = false;
    this.cd.detectChanges(); 
  }

}
