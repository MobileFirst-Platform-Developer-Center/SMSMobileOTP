/**
 *    © Copyright 2016 IBM Corp.
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

//
//  HelloUserViewController.swift
//  UserLoginSample
//
//  Created by Ishai Borovoy on 03/11/2015.
//  Copyright © 2015 IBM. All rights reserved.
//

import UIKit
import IBMMobileFirstPlatformFoundation

class MainViewController: UIViewController{
    
    @IBOutlet weak var registerButton: UIButton!
    @IBOutlet weak var loginButton: UIButton!
    
    override func viewDidLoad() {
        let resourseRequest = WLResourceRequest(url: NSURL(string:"/adapters/SMSOTP/phone/isRegistered")! as URL, method:"GET")
        resourseRequest?.send(completionHandler: { (response, error) -> Void in
            if error == nil {
                self.enableButtons (isRegistered: response?.responseText == "true")
            } else {
                self.alert (msg: "Oops, something wrong happen!")
            }
        })
    }
    
    @IBAction func smsOTPLogin(sender: AnyObject) {
        WLAuthorizationManager.sharedInstance().obtainAccessToken(forScope: "SMSOTP") { (accessToken, error) in
            if (error == nil) {
                self.alert (msg: "Success :-)")
            } else {
                self.alert (msg: "Failed :-(")
            }
        }
    }
    
    @IBAction func registerNumber(sender: AnyObject) {
        MainViewController.codeDialog(title: "Phone Number", message: "Please provide your phone number",isCode: true) { (phone, ok) -> Void in
            if ok {
                let resourseRequest = WLResourceRequest(url: NSURL(string:"/adapters/SMSOTP/phone/register/\(phone)")! as URL, method:"POST")
                resourseRequest?.send(completionHandler: { (response, error) -> Void in
                    if error == nil {
                        self.enableButtons (isRegistered: response?.responseText == "true")
                    } else {
                        self.alert (msg: "Oops, failed to register.")
                    }
                })
            }
        }
    }
    
    private func enableButtons (isRegistered : Bool) {
        self.registerButton.isEnabled = !isRegistered;
        self.loginButton.isEnabled = isRegistered;
    }
    
    private func alert (msg : String) {
        let alert = UIAlertController(title: "SMS OTP Login", message: msg, preferredStyle: UIAlertController.Style.alert)
        alert.addAction(UIAlertAction(title: "Ok", style: UIAlertAction.Style.default, handler: nil))
        self.present(alert, animated: true, completion: nil)
    }
    
    internal static func codeDialog (title: String, message: String, isCode : Bool, completion:  @escaping (_ code: String, _ ok: Bool) -> Void) {
        let codeDialog = UIAlertController(title: title, message: message, preferredStyle: UIAlertController.Style.alert)
        
        var codeTxtField :UITextField?
        
        codeDialog.addTextField { (txtCode) -> Void in
            codeTxtField = txtCode
            if (isCode) {
                codeTxtField?.isSecureTextEntry = true
            }
            txtCode.placeholder = title
        }
        
        codeDialog.addAction(UIAlertAction(title: "Ok", style: .default, handler: { (action) in
             completion (codeTxtField!.text!, true)
        }))
        
        codeDialog.addAction(UIAlertAction(title: "Cancel", style: .default, handler: { (action: UIAlertAction!) in
            completion ("", false)
        }))
        
        UIApplication.shared.delegate?.window!!.rootViewController!.present(codeDialog, animated: true, completion: nil)
    }
}


