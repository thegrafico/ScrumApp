
const confirmationModalId = "#confirmation-modal";
const confirmationBtnConfirm = "#confirmation-btn-confirm";
const confirmationBtnCancel = "#confirmation-btn-cancel";
const CONFIRMATION_TYPES = {INFO: "INFO", DANGER: "DANGER", SUCCES: "SUCCES"};

class ModalConfirmation {
    constructor() {}

    static confirm = async (type, message) => {

        const modalId = confirmationModalId;

        setupModal(type, message);

        const parent = this;

        return new Promise(function (resolve, reject) {
            $(modalId).modal('show');

            $(confirmationBtnConfirm).click(function () {
                parent.closeModal();
                return resolve(true);
            });

            $(confirmationBtnCancel).click(function () {
                parent.closeModal();
                return resolve(false);
            });

            $(modalId).on('hidden.bs.modal', function (e) {
                return resolve(false);
            });

        });
    };

    static closeModal(){
        $(confirmationModalId).modal('hide');
    }
}

function setupModal (type, message){

    // body message
    $(`${confirmationModalId}-message`).text(message);
    
    // clean classes for button
    $(confirmationBtnConfirm).removeClass();

    switch (type) {
        case CONFIRMATION_TYPES.INFO:
            $(confirmationBtnConfirm).addClass(["btn", "btn-primary"]);
            break;
        case CONFIRMATION_TYPES.SUCCES:
            $(confirmationBtnConfirm).addClass(["btn", "btn-success"]);
            break;
        case CONFIRMATION_TYPES.DANGER:
            $(confirmationBtnConfirm).addClass(["btn", "btn-danger"]);
            break;
        default:
            break;
    }
}

