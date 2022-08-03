import isEmpty from "lodash/isEmpty";
import isString from "lodash/isString";

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = (error) => reject(error);
        reader.onload = () => {
            let base64String = "";

            if (isString(reader.result) && !isEmpty(reader.result)) {
                base64String = reader.result.toString().replace(/^data:(.*,)?/, '');
            }

            resolve(base64String);
        };

        reader.readAsDataURL(file);
    })
};

export { fileToBase64 };
