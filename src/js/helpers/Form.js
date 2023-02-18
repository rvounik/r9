import ErrorTypes from '../constants/ErrorTypes';

export default class Form {

    /**
     * parse Errors
     */
    static parseErrors = errors => {
        const stateErrors = [];

        // for each error, add error object to state
        errors.forEach(error => {
            stateErrors.push({
                type: ErrorTypes.VALIDATION_ERROR,
                field: error.path,
                value: error.value,
                message: error.message
            });
        });

        return stateErrors;
    }
}

// todo: add propTypes
