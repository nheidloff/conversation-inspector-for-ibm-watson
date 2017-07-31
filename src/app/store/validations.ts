//------------------------------------------------------------------------------
// Copyright IBM Corp. 2017
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------

import { Tool } from './tool';
import { ValidationError } from './validation-error';
import { Validators } from './validators';
import { Common } from './common';

export class Validations {

    static validate(tool: Tool) {
        tool.validationErrors = [];
        Validations.watsonUserName(tool);
        Validations.watsonPassword(tool);
        Validations.watsonWorkspace(tool);
        Validations.overwrittenPayload(tool);

        if (tool.validationErrors.length > 0) {
            tool.watsonConfigStatus = Tool.WATSON_CONFIG_STATUS_SYNTAX_NOT_CORRECT;
            let credentialsSyntaxCorrect: string = 'true';
            tool.validationErrors.forEach((error) => {
                if (error.itemName == 'watsonUserName') credentialsSyntaxCorrect = 'false';
                if (error.itemName == 'watsonPassword') credentialsSyntaxCorrect = 'false';
            });
            if (credentialsSyntaxCorrect == 'true') {
                tool.watsonConfigStatus = Tool.WATSON_CONFIG_STATUS_CREDENTIALS_SYNTAX_CORRECT;
            }
            let errorInConfig: string = 'false';
            tool.validationErrors.forEach((error) => {
                if (error.itemName == 'watsonUserName') errorInConfig = 'true';
                if (error.itemName == 'watsonPassword') errorInConfig = 'true';
                if (error.itemName == 'watsonWorkspace') errorInConfig = 'true';
            });
            if (errorInConfig == 'false') {
                tool.watsonConfigStatus = Tool.WATSON_CONFIG_STATUS_SYNTAX_CORRECT;
            }
        }
        else {
            tool.watsonConfigStatus = Tool.WATSON_CONFIG_STATUS_SYNTAX_CORRECT;
        }
    }

    static overwrittenPayload(tool: Tool): void {
        let itemName: string = 'overwrittenPayload';
        let error: ValidationError;
        let value: string = "";
        let validatorOutput: boolean;
        let type: string;
        if (tool.overwrittenPayload) {
            value = tool.overwrittenPayload;
        }
        type = 'invalidJSON';
        let output: boolean = true;

        try {
            value = value.replace(/<br>/g, '');
            value = value.replace(/&nbsp;/g, '');
        } catch (error) {
        }
        try {
            JSON.parse(value);
        } catch (error) {
            output = false;
        }

        if (output == false) {
            error = new ValidationError(itemName, 'The JSON is not valid');
            tool.validationErrors.push(error);
        }
    }

    static watsonUserName(tool: Tool): void {
        if (tool.vcapCredentialsExist == false) {
            let itemName: string = 'watsonUserName';
            let error: ValidationError;
            let value: string = "";
            let validatorOutput: boolean;
            let type: string;
            if (tool.watsonUserName) {
                value = tool.watsonUserName;
            }

            validatorOutput = Validators.required(value);
            type = Validators.errorTypeRequired;
            if (validatorOutput) {
                error = new ValidationError(itemName, 'The Watson Conversation user name is required.');
                tool.validationErrors.push(error);
            }

            validatorOutput = Validators.minimumLength(value, 30);
            type = Validators.errorTypeRequired;
            if (validatorOutput) {
                error = new ValidationError(itemName, 'The Watson Conversation user name needs to be at least 30 characters long.');
                tool.validationErrors.push(error);
            }

            validatorOutput = Validators.maximumLength(value, 50);
            type = Validators.errorTypeRequired;
            if (validatorOutput) {
                error = new ValidationError(itemName, 'The Watson Conversation user name can not be longer than 50 characters long.');
                tool.validationErrors.push(error);
            }
        }
    }

    static watsonPassword(tool: Tool): void {
        if (tool.vcapCredentialsExist == false) {
            let itemName: string = 'watsonPassword';
            let error: ValidationError;
            let value: string = "";
            let validatorOutput: boolean;
            let type: string;
            if (tool.watsonPassword) {
                value = tool.watsonPassword;
            }

            validatorOutput = Validators.required(value);
            type = Validators.errorTypeRequired;
            if (validatorOutput) {
                error = new ValidationError(itemName, 'The Watson Conversation password is required.');
                tool.validationErrors.push(error);
            }

            validatorOutput = Validators.minimumLength(value, 10);
            type = Validators.errorTypeRequired;
            if (validatorOutput) {
                error = new ValidationError(itemName, 'The Watson Conversation password needs to be at least 10 characters long.');
                tool.validationErrors.push(error);
            }

            validatorOutput = Validators.maximumLength(value, 50);
            type = Validators.errorTypeRequired;
            if (validatorOutput) {
                error = new ValidationError(itemName, 'The Watson Conversation password can not be longer than 50 characters long.');
                tool.validationErrors.push(error);
            }
        }
    }

    static watsonWorkspace(tool: Tool): void {
        let itemName: string = 'watsonWorkspace';
        let error: ValidationError;
        let value: string = "";
        let validatorOutput: boolean;
        let type: string;
        if (tool.watsonWorkspace) {
            value = tool.watsonWorkspace;
        }

        validatorOutput = Validators.required(value);
        type = Validators.errorTypeRequired;
        if (validatorOutput) {
            error = new ValidationError(itemName, 'The Watson Conversation workspace is required.');
            tool.validationErrors.push(error);
        }

        validatorOutput = Validators.minimumLength(value, 30);
        type = Validators.errorTypeRequired;
        if (validatorOutput) {
            error = new ValidationError(itemName, 'The Watson Conversation workspace ID needs to be at least 30 characters long.');
            tool.validationErrors.push(error);
        }

        validatorOutput = Validators.maximumLength(value, 50);
        type = Validators.errorTypeRequired;
        if (validatorOutput) {
            error = new ValidationError(itemName, 'The Watson Conversation workspace ID can not be longer than 50 characters long.');
            tool.validationErrors.push(error);
        }
    }
}