/* jshint browser: true, es3: true */
/* global jQuery: false */
(function ($) {
  "use strict";

  // Detects a browser's version
  // Modified from https://stackoverflow.com/a/5918791/3472393
  var browser = (function(){var u=navigator.userAgent,t,M=u.match(/(opera|chrome|crios|safari|firefox|msie|trident(?=\/))\/?\s*(\S+)/i)||[];if(/trident/i.test(M[1])){t=/\brv[ :]+(\d+)/g.exec(u)||[];return 'IE '+(t[1]||'')}if(M[1]==='CriOS')return "Chrome "+M[2];if(M[1]==='Chrome'){t=u.match(/\bOPR\/(\d+)/);if(t!=null)return 'Opera '+t[1]}M=M[2]?[M[1],M[2]]:[navigator.appName,navigator.appVersion,'-?'];if((t=u.match(/version\/(\d+)/i))!=null)M.splice(1,1,t[1]);return M.join(' ')})(),

  // Detects the operating system of a user
      os = (function(){var u=navigator.userAgent,t,M=u.match(/(Windows NT|Mac OS X|CPU (iPhone )?OS|Android|Linux) (\S+)(?=;)/i);M=M[1]&&M[3]?[M[1],M[3]]:["Unknown"];if(/Windows/i.test(M[0])){t={"5.0":"2000","5.1":"XP","5.2":"XP","6.0":"Vista","6.1":"7","6.2":"8","6.3":"8.1","10.0":"10"};return "Windows "+t[M[1]]}if(/Mac/.test(M[0]))return "Mac OS X "+M[1].replace("_",".");if(/CPU(.+)OS/.test(M[0]))return "iOS "+M[1].replace("_",".");return M.join(" ")})(),

  // Parses text from the various input fields
      parseHandler = function () {
        var text = "";

        // Description

        text += "[b]Description:[/b]\n\n";

        text += $(".description").val() + "\n\n";

        // Browser/OS version

        text += "[b]Browser:[/b] " + $(".browser").val() + "\n";
        text += "[b]Operating System:[/b] " + $(".os").val() + "\n\n";

        // Steps to reproduce

        text += "[b]Steps to reproduce:[/b]\n";

        text += "[list=1]\n";

        $(".step .text").each(function () {
          text += "[*]" + $(this).val() + "\n";
        });

        text += "[/list]\n";

        // Expected results

        text += "[b]Expected results:[/b]\n\n";

        text += $(".expected").val() + "\n";

        // Actual results

        text += "[b]Actual results:[/b]\n\n";

        text += $(".actual").val() + "\n";

        $(".output").text(text);
        $("#preview").html(XBBCODE.process({
          text: text,
          removeMisalignedTags: true,
          addInLineBreaks: true
        }).html);
      };

  // Prevent default action from occuring when button is pressed
  $("button").click(function (e) {
    e.preventDefault();
  });

  // Fill in browser and OS fields (autodetection)
  $(".browser").val(browser);
  $(".os").val(os);

  $(".toggle-browser, .toggle-os").click(function () {
    var $parent = $(this).parent();

    $parent.prev().find(".text").prop("disabled", false);
    $parent.prev().removeClass("small-8").addClass("small-12");
    $parent.remove();
  });

  // Add/remove steps to reproduce
  $(".add-step").click(function () {
    var count = $(".steps .step").length + 1;

    $(".steps").append("<div class='row collapse step'>" +
                       "<div class='small-1 columns'>" +
                       "<label class='right inline'>" + count + ". </label>" +
                       "</div>" +
                       "<div class='small-9 columns'>" +
                       "<input type='text' class='text' data-step='" + count + "'>" +
                       "</div><div class='small-2 columns'>" +
                       "<button class='tiny secondary postfix remove-step'>Remove</button>" +
                       "</div></div>");

    $(".text").trigger("keyup");
  });

  $(".steps").on("click", ".remove-step", function (e) {
    var steps, i;

    e.preventDefault();

    $(this).parents(".step").remove();

    steps = $(".steps .step");

    // Re-number steps
    for (var i = 0; i < steps.length; i++) {
      steps[i].querySelector("label").textContent = (i + 1) + ".";
      steps[i].querySelector(".text").dataStep = i + 1;
    }

    $(".text").trigger("keyup");
  });

  // Attach handlers
  $(".steps").on("keyup", ".text", parseHandler);

  $(".text").keyup(parseHandler);

  // Initialize Foundation and parsing of fields
  $(document).foundation();
  $(".text").trigger("keyup");
})(jQuery);
