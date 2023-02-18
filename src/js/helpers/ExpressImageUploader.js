
// there is probably a way to pass this on from the ckfinder configuration, revisit this when adding authentication
import AppConfig from './../../../config/App.config';

const ExpressImageUploader = editor => {
    editor.plugins.get( 'FileRepository' ).createUploadAdapter = loader =>

        // I used an IICE here for convenience (its not going to be used outside this function)
        new class {
            constructor(props) {
                this.loader = props;
            }

            upload() {
                return new Promise((resolve, reject) => {

                    const fd = new FormData();

                    // file itself is a Promise so await its result, then append it to the form data
                    this.loader.file.then(result => {

                        // upload is the form field id that contains the image data
                        fd.append('upload', result);

                        fetch(`${AppConfig.api.baseUrl}/api/admin/upload`, {
                            method: 'POST',
                            mode: 'cors',
                            body: fd
                        })
                            .then(response => response.json())
                            .then(response =>
                                resolve({
                                    default: response.path
                                })
                            )
                            .catch((error) =>
                                reject(error)
                            );
                    });
                });
            }

            abort() {}
        }(loader); // dont forget to add the loader property
};

export default ExpressImageUploader;

// todo: add propTypes, jsdoc
