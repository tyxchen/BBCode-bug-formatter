/* jshint browser: true, es3: true */
/* global jQuery: false, XBBCODE: false */

(function ($) {
  "use strict";

  // Detects a user's browser's version and OS
  // Modified from https://stackoverflow.com/a/5918791/3472393
  var userInfo = (function () {
        var u = navigator.userAgent, t;

        return {
          browser : (function () {
            var M = u.match(/(opera|chrome|crios|safari|firefox|msie|trident(?=\/))\/?\s*(\S+)/i) || [];
            // Internet Explorer >11
            if (/trident/i.test(M[1])) {
              t = /\brv[ :]+(\d+)/g.exec(u) || [];
              return 'Internet Explorer ' + (t[1] || '');
            }
            // Chrome for iOS
            if (M[1] === 'CriOS') {
              return "Chrome " + M[2];
            }
            // Opera
            if (M[1] === 'Chrome') {
              t = u.match(/\bOPR\/(\S+)/);
              if(t !== null) {
                return 'Opera ' + t[1];
              }
            }
            // Default
            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((t = u.match(/version\/(\d+)/i)) !== null) {
              M.splice(1, 1, t[1]);
            }
            return M.join(' ');
          })(),

          os: (function () {
            var M = u.match(/(Windows NT|Mac OS X|CPU (iPhone )?OS|Android|Linux) (\S+?)(?=[;\) ])/i);
            M = (M && M[1] && M[3]) ? [M[1], M[3].replace("_", ".")] : ["Unknown"];
            // Map Windows NT versions to Windows versions
            if (/Windows/i.test(M[0])) {
              t = {
                "5.0": "2000",
                "5.1": "XP",
                "5.2": "XP",
                "6.0": "Vista",
                "6.1": "7",
                "6.2": "8",
                "6.3": "8.1",
                "10.0": "10"
              };
              M = ["Windows", t[M[1]]];
            }
            // Browsers running on iOS use "CPU OS" to identify themselves in the UA
            if (/CPU(.+)OS/i.test(M[0])) {
              M[0] = "iOS";
            }
            // Replace x86.64 with x86_64
            if (M[0] === "Linux") {
              M[1] = M[1].replace(".", "_");
            }

            return M.join(" ");
          })()
        };
      }),

  // Parses text from the various input fields
      parseHandler = function () {
        var text = "";

        // Description

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

        text += $(".expected").val() + "\n\n";

        // Actual results

        text += "[b]Actual results:[/b]\n\n";

        text += $(".actual").val() + "\n";

        $(".output").text(text);
        $(".preview").html(XBBCODE.process({
          text: text,
          removeMisalignedTags: true,
          addInLineBreaks: true
        }).html);
      }; // jshint ignore:line

  // Prevent default action from occuring when button is pressed
  $("button").click(function (e) {
    e.preventDefault();
  });

  // Fill in browser and OS fields (autodetection)
  $(".browser").val(userInfo.browser);
  $(".os").val(userInfo.os);

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
                       "</div><div class='small-2 end columns'>" +
                       "<button class='tiny secondary postfix remove-step' tabindex='1'>Remove</button>" +
                       "</div></div>");

    $(".step:first-child button").prop("disabled", false);

    $(".text").trigger("keyup");
  });

  $(".steps").on("click", ".remove-step", function (e) {
    var steps, i;

    e.preventDefault();

    $(this).parents(".step").remove();

    steps = $(".steps .step");

    // Re-number steps
    for (i = 0; i < steps.length; i++) {
      steps[i].querySelector("label").textContent = (i + 1) + ".";
      steps[i].querySelector(".text").dataStep = i + 1;
    }

    if (steps.length === 1) {
      $(".step button").prop("disabled", true);
    }

    $(".text").trigger("keyup");
  });

  // Link keys while entering steps
  $(".steps").on("keypress", ".text", function (e) {
    switch (e.keyCode) {
      // Enter triggers adding a new step
      // However, if Cmd/Ctrl was pressed, we generate the BBCode
      case 10:
      case 13:
        e.preventDefault();


        if (e.ctrlKey || e.keyCode === 224 || e.keyCode === 17 || e.keyCode === 91) {
          $(".generate").trigger("click");
        } else {
          $(".add-step").trigger("click");
          $(".steps .step:last-child input").trigger("focus");
        }
        break;

      // Backspace triggers removing the step if and only if step is empty and step is the last child
      case 8:
        if ($(this).val() === "" && $(this).parents(".step").is(":last-child")) {
          e.preventDefault();

          $(this).parent().next().children("button").trigger("click");
          $(".steps .step:last-child input").trigger("focus");
        }
        break;

      default:
    }
  });

  // Link pressing Cmd-Enter/Ctrl-Enter on last textarea to generating BBCode
  $(".text").keypress(function (e) {
    if ((e.keyCode == 10 || e.keyCode == 13) && (e.ctrlKey || e.keyCode == 224 || e.keyCode == 17 || e.keyCode == 91)) {
      $(".generate").trigger("click");
    }
  });

  // Generate BBCode on click
  $(".generate, .write").click(function () {
    var errored = false,
        top;

    $(".hint").remove();

    $(".text").each(function () {
      if ($(this).val() === "") {
        top = $(this).prev().is("h5") ? 4.3 : 1.5;
        errored = true;

        $(this).addClass("input-errored input-errored-anim");
        $(this).parent().append("<div class='hint hint-error' style='top:" + top + "em'>Input can't be empty!</div>");
      } else {
        $(this).removeClass("input-errored");
      }
    });

    if (!errored) {
      $("body").toggleClass("writing displaying");
      $("#main > .row > .columns").toggleClass("hidden");
      $(".generate").toggle();

      parseHandler();
    }

    // remove animation class after animation has been completed
    setTimeout(function () {
      $(".text").removeClass("input-errored-anim");
    }, 320);
  });

  // Initialize Foundation and parsing of fields
  $(document).foundation();
  $(".text").trigger("keyup");
})(jQuery);
