$(function () {
	const USER_EMAIL = "#userEmail";
	const SPAN_ERROR_EMAIL = ".errorEmail";

	$(USER_EMAIL).focusin(function(){
		$(SPAN_ERROR_EMAIL).addClass("invisible");
	});

	$(USER_EMAIL).focusout(function () {
		let email = $(USER_EMAIL).val();

		if (!isEmail(email)){
			$(SPAN_ERROR_EMAIL).removeClass("invisible");
			return;
		}

		$(SPAN_ERROR_EMAIL).addClass("invisible");
	});
});

/**
 * Validate if email
 * @param {String} email 
 * @returns {Boolean} - True if the email is valid
 */
function isEmail(email) {
	return validator.isEmail(email);
}