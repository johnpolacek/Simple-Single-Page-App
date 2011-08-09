var App = (function() {
    
    // Keep vars & functions private unless there is a reason to use in other 
    // scripts running on the page. For example, to let another script
    // use getCookie(), move it inside the returned object closure.
    
    // Private Vars
    
    var userEmail;
    var userName;
    var appTitle = document.title;
    var pageData = {};
    
    
    // Private Functions
    
    //--------------------------------------
    //  NAVIGATION
    //--------------------------------------
    
    function changePage(pageID, pageTitle, data) {
        // update page data
        if (!data) {
            pageData = {}
        } else {
            pageData = data;    
        }
        
        // update title
        if (pageTitle) {
            if (appTitle) {
                $.address.title(appTitle+' | '+pageTitle);
            } else {
                $.address.title(pageTitle);
            }
        }
        
        // update page
        $.address.value(pageID);
    }
    
    function updateContent(pageName) {
        
        var pageID = '#'+pageName;
        
        // empty content
        $("#content").empty();
        
        if (!pageData) {
            pageData = {};
        }
        
        // add size name to data for use in templates
        pageData.size = sizeit.size;
        
        // add user name to page data by default
        pageData.userName = userName;
        
        if (!$(pageID+'Template').length) {
            // if no page template, throw error, go to default page
            console.error(pageID+'Template not found');
        }
        
        // add the content
        $(pageID+'Template').tmpl(pageData).appendTo('#content').trigger('create');
        
        // Scroll to top
        window.scrollTo(0,0);    
    }
    
    function setPageEvents() {
        
        // set global events
        $("#wrapper")
            .delegate("#button-signout", "click", function(e){
                e.preventDefault();
                userName = null;
                userEmail = null;
                setCookie('userName', '', 0);
                enableSignout(false);
                changePage("welcome", "Welcome");
            });
        
        // set page events
        $("#content")
        
            // WELCOME PAGE
                
            .delegate("#signin-email", "focus", function(){
                if ($(this).val() == "Email Address")
                {
                    $(this).val("");
                }
            })
            .delegate("#signin-email", "blur", function(){
                if ($(this).val() == "")
                {
                    $(this).val("Email Address");
                }
            })
            .delegate("#signin-submit", "click", function(e){
                e.preventDefault();
                $('#form-welcome').submit();
            })
            .delegate("#form-welcome", "submit", function(e){
                e.preventDefault();
                userEmail = $('#signin-email').val();
                    
                if (validateEmail(userEmail)) {
                    // in a real app, you would communicate with an api
                    // to check if user exists, for example:
                    // $.post("api/user/", { action:"check", email:userEmail }, function(data) {
                    //     handleUserSubmit(data);
                    // }, "json");
                    //
                    handleEmailSubmit({email:userEmail});
                } else {
                    $(".error-text").css("visibility","visible");
                }
            })
            
            // REGISTER PAGE
            
            .delegate("#register-name", "focus", function(){
                if ($(this).val() == "User Name")
                {
                    $(this).val("");
                }
            })
            .delegate("#register-name", "blur", function(){
                if ($(this).val() == "")
                {
                    $(this).val("User Name");
                }
            })
            .delegate("#form-register", "submit", function(e){
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
                    setCookie("userName", userName);
                    changePage("home","Thanks For Signing Up", {userName:registerName})
                }
            })
            .delegate("#register-submit", "click", function(e){
                e.preventDefault();
                $('#form-register').submit();
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
    
    function handleEmailSubmit(data) {
        // in a real app, this function would handle user data returned from the api
        if (!data || !data.userName) {
            // user doesn't exist, so go to register
            changePage("register","Create Account",data)
        } else {
            // user does exist, so go to home
            changePage("home","Thanks For Signing Up",data)
        }
    }
    
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
        
        init : function() {
            
            // use jQuery address for app navigation
            $.address.init(function(event) {
                userName = getCookie("userName");
                if (userName) {
                    // if user is signed in go home
                    changePage("home","Welcome Back")
                } else {
                    // otherwise, go to signin screen (welcome)
                    enableSignout(false);
                    changePage("welcome","Welcome")
                }  
            })
                .change(function(event) {
                    updateContent(event.value.substring(1));
            });
            
            setPageEvents();
        }   
    };

}());

$(document).ready(function(){
    App.init();
});