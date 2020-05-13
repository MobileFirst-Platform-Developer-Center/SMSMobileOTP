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
//  PinCodeChallengeHandler.swift
//  EasyPayApp
//
//  Created by Ishai Borovoy on 29/10/2015.
//  Copyright © 2015 IBM. All rights reserved.
//

import Foundation
import IBMMobileFirstPlatformFoundation

public class SMSCodeChallengeHandler : SecurityCheckChallengeHandler {
    
    public static let securityCheck = "SMSOTP"
    
    override public func handleChallenge(_ challenge: [AnyHashable : Any]!) {
        MainViewController.codeDialog(title: "SMS code", message: "Please provide your sms code",isCode: true) { (code, ok) -> Void in
            if ok {
                self.submitChallengeAnswer(["code": code])
            } else {
                self.cancel()
            }
        }
    }
}
