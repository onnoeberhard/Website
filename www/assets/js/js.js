jQuery(function () {
    function setAspectRatio() {
        jQuery('iframe').each(function () {
            jQuery(this).css('height', jQuery(this).width() * 9 / 16);
        });
    }

    setAspectRatio();
    jQuery(window).resize(setAspectRatio);
});


// smooth scrolling: https://www.w3schools.com/jquery/tryit.asp?filename=tryjquery_eff_animate_smoothscroll
$(document).ready(function () {
    $("a").on('click', function (event) {
        if (this.hash !== "") {
            event.preventDefault();
            var hash = this.hash;
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800, function () {
                window.location.hash = hash;
            });
        }
    });
});