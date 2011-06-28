var App = (function() {
    
    // Private Vars / functions here, outside of the return closure
    //
    // It is a good rule of thumb to keep all vars & functions private
    // unless there is a specific reason to expose them to other scripts
    // you are using on the page. For example, if you wanted to let another
    // script use the getCookie function, you could move it inside of the
    // returned object closure.
    
    var userEmail;
    var userName;
    
    // Private Functions
    
    //----------------------------------------------------------------------------
    //  PAGES
    //----------------------------------------------------------------------------
     
    function gotoWelcome() {
        
        changePage("#welcomeTemplate","#welcome");
        
        // Clear email field on focus
        $('#signin-email').one("focus", function() {
            $(this).val('');
        });
        
        $('#signin-email').blur(function() {
            if ($(this).val() == "")
            {
                $(this).val("Email Address");
            }
        });
        
        $('.submit-button').click(function(e) {
            e.preventDefault();
            userEmail = $('#signin-email').val();
            $('#form-welcome').submit();
        });
        
        $('#form-welcome').submit(function(e) {
            e.preventDefault();
            userEmail = $('#signin-email').val();
                
            if (validateEmail(userEmail)) {
                // in a real app, you would communicate with an api
                // to check if user exists, for example:
                // $.post("api/user/", { action:"check", email:userEmail }, function(data) {
                //     handleUserSubmit(data);
                // }, "json");
                //
                handleUserSubmit({email:userEmail});
            } else {
                $(".error-text").css("visibility","visible");
            }
        });
    }
    
    function handleUserSubmit(data) {
        // in a real app, this function would handle user data returned from the api
        if (!data || !data.userName) {
            gotoRegister(data);
        } else {
            gotoHome(data);
        }
    }
    
    function gotoHome(data) {
        setCookie("userName", userName);
        changePage("#homeTemplate", "#home", data);
    }
    
    function gotoRegister(data) {
        changePage("#registerTemplate", "#register", data);
        
        // Clear email field on focus
        $('#register-name').one("focus", function() {
            $(this).val('');
        });
        
        $('.submit-button').click(function(e) {
            e.preventDefault();
            $('#form-register').submit();
        });
        
        $('#form-register').submit(function(e) {
            e.preventDefault();
            var registerEmail = $('#register-email').val();
            var registerName = $('#register-name').val();
            
            // hide any visible errors
            $("#error-email").css("visibility","hidden");
            $("#error-name").css("visibility","hidden");
            $("#error-confirm").css("visibility","hidden");
            
            // validate register form
            var registerValid = true;
            
            if (!validateEmail(registerEmail)) {
                registerValid = false;
                $("#error-email").css("visibility","visible");
            }
            
            if (!validateName(registerName)) {
                registerValid = false;
                $("#error-name").css("visibility","visible");
            }
            
            if (!$('#register-confirm').is(':checked')) {
                registerValid = false;
                $("#error-confirm").css("visibility","visible");
            }
            
            if (registerValid) {
                userName = registerName;
                userEmail = registerEmail;
                enableSignout(true);
                gotoHome({userName:registerName})
            }
            
        });
    }
    
    //--------------------------------------
    //  NAVIGATION
    //--------------------------------------
    
    function changePage(newTemplate, pageID, data) {
        // empty content
        $("#content").empty();
        
        if (!data) {
            data = {};
        }
        
        // add size name to data for use in templates
        data.size = sizeit.size;
        
        // add the template to the div we created (same id for template as div)
        $(newTemplate).tmpl(data).appendTo("#content");
        
        // If using jQuery mobile, uncomment to apply styles to the new content
        // if (isMobile) {
        //    $(pageID).page(); 
        // }
        
        // Scroll to top
        window.scrollTo(0,0);
        
        trackPage(pageID.substring(1));
    }
    
    function setNavEvents() {
        $("#wrapper")
            .delegate("#button-signout", "click", function(e){
                e.preventDefault();
                userName = null;
                userEmail = null;
                setCookie('userName', '', 0);
                gotoWelcome();
            });        
    }
    
    function enableSignout(enable) {
        if (enable) {
            $("#button-signout").show();
        } else {
            $("#button-signout").hide();
        }
    }
    
    //--------------------------------------
    //  FORM HANDLING
    //--------------------------------------
    
    function validateEmail(emailTest) {
        var filter = /^[a-zA-Z0-9]+[a-zA-Z0-9_.-]+[a-zA-Z0-9_-]+@[a-zA-Z0-9]+[a-zA-Z0-9.-]+[a-zA-Z0-9]+.[a-z]{2,4}$/;
        if (filter.test(emailTest) && emailTest.length < 99) {
            return true;
        } else {
            return false;
        }
    }
    
    function validateName(nameTest) {
        var filter = /[^a-z0-9\s]/gi;
        var valid = !(filter.test(nameTest));
        
        // at least 2 letters
        if (nameTest.length < 2) {
            valid = false;
        }
        
        // at least one letter character
        filter = /[a-z]/gi;
        if (!(filter.test(nameTest))) {
            valid = false;
        }
        
        // no extra spaces
        filter = /\s{2,}/g;
        if (filter.test(nameTest)) {
            valid = false;
        }
        
        return valid;
    }
    
    //--------------------------------------
    //  TRACKING
    //--------------------------------------
    
    function trackPage(pageID) {
        var _gaq = _gaq || [];
        if (_gaq) {
            _gaq.push(['_trackPageview', pageID]);   
        }
    }
    
    //--------------------------------------
    //  COOKIES
    //--------------------------------------
    
    function getCookie(cookieName) {
        var i, x, y, cookies = document.cookie.split(";");
        var cookieValue = "";
        for (i = 0; i < cookies.length; i++)
        {
            x = cookies[i].substr(0, cookies[i].indexOf("="));
            y = cookies[i].substr(cookies[i].indexOf("=")+1);
            x = x.replace(/^\s+|\s+$/g,"");
            if (x == cookieName) {
                cookieValue = unescape(y);
            }
        }
        return cookieValue;
    }
    
    function setCookie(cookieName, value, expDays) {
        var expDate = new Date();
        expDate.setDate(expDate.getDate() + expDays);
        var cookieValue = escape(value) + ((expDays === null) ? "" : "; expires="+expDate.toUTCString());
        document.cookie = cookieName + "=" + cookieValue;
    }
    
    return {
        
        // create public vars / functions here, inside the closure
        
        config : {},
        
        init : function() {
            
            setNavEvents();
            
            userName = getCookie("userName");
            if (userName) {
                gotoHome({userName:userName});
            } else {
                enableSignout(false);
                gotoWelcome();    
            }   
        }   
    };

}());

$(document).ready(function(){
    App.init();
});