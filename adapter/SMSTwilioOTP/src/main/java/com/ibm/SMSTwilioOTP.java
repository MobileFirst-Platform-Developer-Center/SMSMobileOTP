/**
* Copyright 2018 IBM Corp.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
package com.ibm;

import com.ibm.mfp.security.checks.base.UserAuthenticationSecurityCheck;
import com.ibm.mfp.server.registration.external.model.AuthenticatedUser;
import com.ibm.mfp.server.security.external.checks.AuthorizationResponse;
import com.ibm.mfp.server.security.external.checks.SecurityCheckConfiguration;
import com.twilio.rest.verify.v2.Service;
import com.authy.*;
import com.authy.api.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

public class SMSTwilioOTP extends UserAuthenticationSecurityCheck {
    private String errorMsg;
    private String number;
    private String numberCountryCode;
    private boolean rememberMe = false;

    @Override
    public SecurityCheckConfiguration createConfiguration(Properties properties) {
        return new TwilioConfig(properties);
    }

    @Override
    protected TwilioConfig getConfiguration() {
        return (TwilioConfig) super.getConfiguration();
    }

    @Override
    protected AuthenticatedUser createUser() {
        return new AuthenticatedUser(number, number, this.getName());
    }

    @Override
    public void authorize(Set<String> scope, Map<String, Object> credentials, HttpServletRequest request, AuthorizationResponse response) {
        //Return failure in case no phone number is found in registration service
        if(credentials==null && !credentials.containsKey("phoneNumber")) {
            Map<String, Object> failure = new HashMap<String, Object>();
            failure.put("failure", "Missing phone number");
            response.addFailure(getName(), failure);
        } else {
            super.authorize(scope, credentials, request, response);
        }
    }

    @Override
    protected boolean validateCredentials(Map<String, Object> credentials) {
        if(credentials!=null && credentials.containsKey("OTP") && credentials.containsKey("phoneNumber")){
            String OTP = credentials.get("OTP").toString();
            String phonenumber = credentials.get("phoneNumber").toString();
            String countryCode = credentials.get("countryCode").toString();
            verifyOTP(OTP, phonenumber, countryCode);
          }
          else if(credentials!=null && credentials.containsKey("phoneNumber")){
              String phoneNumber = credentials.get("phoneNumber").toString();
              String countryCode = credentials.get("countryCode").toString();
              sendSMSCode(phoneNumber, countryCode);
            }
        return false;
    }

    private Boolean verifyOTP(String OTP, String phoneNumber, String countryCode ) {
        AuthyApiClient client = new AuthyApiClient(getConfiguration().twilioAPIKey);
        PhoneVerification phoneVerification = client.getPhoneVerification();
        if (OTP!=null && phoneNumber!=null && OTP!="" && phoneNumber!="" && countryCode!=null && countryCode!="") {
            Verification verification;
            try {
                verification = phoneVerification.check(phoneNumber, countryCode, OTP);
                if (verification.isOk()) {
                    number = phoneNumber;
                    return true;
                } else {
                    errorMsg = verification.getMessage();
                    return false;
                }
            } catch (AuthyException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
        return false;
    }

    private Boolean sendSMSCode(String phoneNumber, String countryCode ) {
        AuthyApiClient client = new AuthyApiClient(getConfiguration().twilioAPIKey);
        PhoneVerification phoneVerification  = client.getPhoneVerification();
        Verification verification;
        Params params = new Params();
        params.setAttribute("locale", "en");
            try {
                verification = phoneVerification.start(phoneNumber, countryCode, "sms", params);
                errorMsg = verification.getMessage();
                number = phoneNumber;
                numberCountryCode = countryCode;
            } catch (AuthyException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        return false;
    }

    @Override
    protected Map<String, Object> createChallenge() {
        Map challenge = new HashMap();
        challenge.put("errorMsg",errorMsg);
        challenge.put("phoneNumber",number);
        challenge.put("countryCode",numberCountryCode);
        challenge.put("remainingAttempts",getRemainingAttempts());
        return challenge;
    }

    @Override
    protected boolean rememberCreatedUser() {
        return rememberMe;
    }
}
