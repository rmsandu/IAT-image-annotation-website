"use strict";

var sketchpad_editor = {};
var sketchpad_viewer = {};
var imgSVG = new Image();
var img = new Image();
var rfimg = {};
var currH;
var currW;
var incH;
var incW;
var origW;
var origH;
var FileNameImg = {};

var sketchpad_editor = Raphael.sketchpad("sketchpad_editor", {
    width: 500,
    height: 500,
    editing: false, // true is default
});

var sketchpad_viewer = Raphael.sketchpad("sketchpad_viewer", {
    width: 500,
    height: 500,
    editing: false,
});

function ReloadPage() {
    location.reload();
}

// *----------------------JSON SAVING---------------------------------------*//
// saves the current strokes as json file
var iat_save_json = function() {

    $("#input1").val(sketchpad_editor.json()); //sets the value to input1
    sketchpad_viewer.json($('#input1').val()); // returns the values of input1

    if (sketchpad_editor.json() == '[]') {
        window.alert('No changes detected. Nothing to save here!');
        return;
    }

    var myStrokes = sketchpad_viewer.strokes(); //get_history also viable option
    var JSONStrokes = JSON.stringify(myStrokes);


    var a = document.createElement('a');
    document.body.appendChild(a);
    var idx_img = FileNameImg.indexOf('.');
    var originalImgName = FileNameImg.slice(0, idx_img);
    a.download = originalImgName + "_JSON.txt";

    var file = new Blob([JSONStrokes], {
        "type": "data:application/json;charset=utf8,"
    });

    window.JSONstrokes = JSONStrokes;
    a.href = (window.URL || webkitURL).createObjectURL(file);
    a.click();
};


/**
 * IMPORT JSON File from Local Disk
 * use FileAPI (readasFileText)
 */
var iat_load_json = function() {

    var jsonfile = this.files[0];
    var indextest = 1;

    if (/\.(txt)$/i.test(jsonfile.name)) {

        var reader = new FileReader();
        var indextest = 1;
        reader.addEventListener("loadend", function() {
            window.indextest = indextest +1 ;
            var myJsonContent = reader.result;
            //sketchpad_viewer.json(myJsonContent);
            sketchpad_editor.json(myJsonContent);
            sketchpad_editor.paper().image(img.src, 0, 0, origW, origH).toBack();

        }, false);

        if (jsonfile) {
            reader.readAsText(jsonfile);
        }
    } else {
        alert("The file loaded is not JSON type. Only *.txt files are accepted. Please try again!");
    }
    this.value = null;
    document.getElementById("sketchpad_editor").dispatchEvent(new Event("load"));
};

// *----------------------SVG SAVING---------------------------------------*//
// saves the svg drawing (id = sketchpad_editor) to local client disk as svg/xml file
//
var iat_save_svg = function() {

    $("#input1").val(sketchpad_editor.json()); //sets the value to input1
    sketchpad_viewer.json($('#input1').val()); // returns the values of input1

    if (sketchpad_editor.json() == '[]') {
        window.alert('No changes detected. Nothing to save here!');
        return;
    }

    var paper = sketchpad_viewer.paper();
    var svgString = paper.toSVG();

    var a = document.createElement('a');
    document.body.appendChild(a);
    var idxImgName = FileNameImg.indexOf(".");
    var svgName = FileNameImg.slice(0, idxImgName) + ".svg";
    a.download = svgName;
    a.type = 'image/svg+xml';
    var blob = new Blob([svgString], {
        "type": "image/svg+xml"
    });

    a.href = (window.URL || webkitURL).createObjectURL(blob);
    a.click();
};


//--------------------------------SAVE THE PNG DRAWING---------------------------------------------
// save the png drawing on clicking the button id = save_png
//
var iat_save_png = function() {

    $("#input1").val(sketchpad_editor.json()); //sets the value to input1
    sketchpad_viewer.json($('#input1').val()); // returns the values of input1

    if (sketchpad_editor.json() == '[]') {
        window.alert('No changes detected. Nothing to save here!');
        return;
    }

    var rect = sketchpad_viewer.paper().rect(0, 0, origW, origH).attr({
        fill: "white"
    }).toBack();

    var paper = sketchpad_viewer.paper();
    var svgString = paper.toSVG();
    // console.log(svgString);

    var regex_path = /<path/gi,
        result_path, indices_path = []; // find all indices of "<path"

    var regex_pathEnd = /path>/gi,
        result_pathEnd, indices_pathEnd = []; // find all indices of "</path>"

    var regex_stroke = /stroke=/gi,
        result_stroke, indices_stroke = []; // find all indices of "stroke="


    while ((result_path = regex_path.exec(svgString))) {
        indices_path.push(result_path.index);
    };

    while ((result_stroke = regex_stroke.exec(svgString))) {
        indices_stroke.push(result_stroke.index);
    };

    while ((result_pathEnd = regex_pathEnd.exec(svgString))) {
        indices_pathEnd.push(result_pathEnd.index);
    };

    //initialize a new svgString with the description of the svg file (size, etc)
    var svgString_pore = svgString.slice(0, indices_path[0] - 1) + ">"; //create a new String and copy the svg description (size etc)
    var svgString_hair = svgString.slice(0, indices_path[0] - 1) + ">";
    var svgString_mole = svgString.slice(0, indices_path[0] - 1) + ">";
    var svgString_vessel = svgString.slice(0, indices_path[0] - 1) + ">";
    var svgString_cutaneous = svgString.slice(0, indices_path[0] - 1) + ">";
    var svgString_redness = svgString.slice(0, indices_path[0] - 1) + ">";

    var flag_pore = 0;
    var flag_mole = 0;
    var flag_hair = 0;
    var flag_vessel = 0;
    var flag_wrinkle = 0;
    var flag_redness = 0;

    // flag for paths - 0 if no path of that colour has been drawn (used) , 1 if path of that colour exists
    // use flag for saving --> don't save a separate png file if no layer of that colour exists

    for (var i = 0; i < indices_stroke.length; i++) {

        var stroke_idx = indices_stroke[i + 1]; // returns the index of s in first occurence of "stroke"
        var stroke_color = svgString.slice(stroke_idx + 8, stroke_idx + 7 + 8) //hex color 6 characters + # + "
        var path_idx_first = new Object();
        var path_idx_last = new Object();
        var path_toCopy = new Object();


        // pore color
        if (stroke_color == "#00CED1") {
            flag_pore = 1;
            path_idx_first = indices_path[i];
            path_idx_last = indices_pathEnd[i];
            path_toCopy = svgString.slice(path_idx_first, path_idx_last + 5);
            svgString_pore += path_toCopy;
        }
        //hair color purple FTWx
        else if (stroke_color == "#8A2BE2") {
            flag_hair = 1;
            path_idx_first = indices_path[i];
            path_idx_last = indices_pathEnd[i];
            path_toCopy = svgString.slice(path_idx_first, path_idx_last + 5);
            svgString_hair += path_toCopy;
        }

        // Mole
        else if (stroke_color == "#008000") {
            flag_mole = 1;
            path_idx_first = indices_path[i];
            path_idx_last = indices_pathEnd[i];
            path_toCopy = svgString.slice(path_idx_first, path_idx_last + 5);
            svgString_mole += path_toCopy;
        }

        // Vessel
        else if (stroke_color == "#FF0000") {
            flag_vessel = 1;
            path_idx_first = indices_path[i];
            path_idx_last = indices_pathEnd[i];
            path_toCopy = svgString.slice(path_idx_first, path_idx_last + 5);
            svgString_vessel += path_toCopy;
        }
        // wrinkle
        else if (stroke_color == "#191970") {
            flag_wrinkle = 1;
            path_idx_first = indices_path[i];
            path_idx_last = indices_pathEnd[i];
            path_toCopy = svgString.slice(path_idx_first, path_idx_last + 5);
            svgString_cutaneous += path_toCopy;
        }
        // redness
        else if (stroke_color == "#DAA520") {
            flag_redness = 1;
            path_idx_first = indices_path[i];
            path_idx_last = indices_pathEnd[i];
            path_toCopy = svgString.slice(path_idx_first, path_idx_last + 5);
            svgString_redness += path_toCopy;
        }
    }

    svgString_pore += "</svg>".toString();
    svgString_hair += "</svg>".toString();
    svgString_mole += "</svg>".toString();
    svgString_vessel += "</svg>".toString();
    svgString_cutaneous += "</svg>".toString();
    svgString_redness += "</svg>".toString();


    //Create the canvas element
    // var canvas = document.createElement('canvas');
    var canvas_pore = document.createElement('canvas');
    var canvas_mole = document.createElement('canvas');
    var canvas_hair = document.createElement('canvas');
    var canvas_vessel = document.createElement('canvas');
    var canvas_cutaneous = document.createElement('canvas');
    var canvas_redness = document.createElement('canvas');

    // canvas.id = "canvas";
    canvas_pore.id = "canvas_p";
    canvas_mole.id = "canvas_m";
    canvas_hair.id = "canvas_h";
    canvas_vessel.id = "canvas_v";
    canvas_cutaneous.id = "canvas_c";
    canvas_redness.id = "canvas_r";

    // document.getElementById("result_div").appendChild(canvas);
    document.getElementById("result_div").appendChild(canvas_pore);
    document.getElementById("result_div").appendChild(canvas_mole);
    document.getElementById("result_div").appendChild(canvas_hair);
    document.getElementById("result_div").appendChild(canvas_vessel);
    document.getElementById("result_div").appendChild(canvas_cutaneous);
    document.getElementById("result_div").appendChild(canvas_redness);
    //Load the canvas(es) element with our svg(s) string(s)
    //canvg -> external library
    canvg(document.getElementById('canvas_h'), svgString_hair);
    canvg(document.getElementById('canvas_p'), svgString_pore);
    canvg(document.getElementById('canvas_m'), svgString_mole);
    canvg(document.getElementById('canvas_v'), svgString_vessel);
    canvg(document.getElementById('canvas_c'), svgString_cutaneous);
    canvg(document.getElementById('canvas_r'), svgString_redness);

    //Image Saving from Canvas
    // var canvas_new = document.querySelector("canvas"); // Get the first element in the document with class "canvas"
    // var canvasdata = canvas_new.toDataURL("image/png", 1.0); //returns a data URI containing a representation of the image in the format specified

    var canvas_p2 = document.getElementById('canvas_p');
    var canvasPng_p2 = canvas_p2.toDataURL("image/png", 1.0); //returns a data URI containing a representation of the image in the format specified

    var canvas_h2 = document.getElementById('canvas_h');
    var canvasPng_h2 = canvas_h2.toDataURL("image/png", 1.0);

    var canvas_m2 = document.getElementById('canvas_m');
    var canvasPng_m2 = canvas_m2.toDataURL("image/png", 1.0);

    var canvas_v2 = document.getElementById('canvas_v');
    var canvasPng_v2 = canvas_v2.toDataURL("image/png", 1.0);

    var canvas_c2 = document.getElementById('canvas_c');
    var canvasPng_c2 = canvas_c2.toDataURL("image/png", 1.0);

    var canvas_r2 = document.getElementById('canvas_r');
    var canvasPng_r2 = canvas_r2.toDataURL("image/png", 1.0);

    // ---------------------Download the Image-----------------////

    var idx_img = FileNameImg.indexOf('.');
    var originalImgName = FileNameImg.slice(0, idx_img);

    var a = document.createElement("a"); // creates an Element Node with the name "a"
    document.body.appendChild(a);

    if (flag_pore == 1) {
        var fNameP = originalImgName + "_PoreMask.png";
        a.download = fNameP; // on download give name to file
        a.href = canvasPng_p2; // attach the canvas data to the href attribute that specifies the link destination
        a.click();
    }

    if (flag_hair == 1) {
        var fNameH = originalImgName + "_HairMask.png";;
        a.download = fNameH; // on download give name to file
        a.href = canvasPng_h2; // attach the canvas data to the href attribute that specifies the link destination
        a.click();
    }

    if (flag_mole == 1) {
        var fNameM = originalImgName + "_MoleMask.png"
        a.download = fNameM;
        //a.href = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAOCAYAAAAmL5yKAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAABWSURBVDhPY0xISPh//0UOA7mAiVyNMH2jBjAwkBQGjD9KGBTEJ6OEO0kG2NvbMwCjnXwDsEU5SS5ANuDhjRCGJbPFSQsDdBfIyMhQZgDIQLK9QLWkDABPsQw5I+5qmAAAAABJRU5ErkJggg==";
        a.href = canvasPng_m2;
        a.click();
    }

    if (flag_vessel == 1) {
        var fNameV = originalImgName + "_VesselMask.png"
        a.download = fNameV;
        a.href = canvasPng_v2;
        a.click();
    }

    if (flag_wrinkle == 1) {
        var fNameW = originalImgName + "_WrinkleMask.png"
        a.download = fNameW;
        a.href = canvasPng_c2;
        a.click();
    }

    if (flag_redness == 1) {
        var fNameR = originalImgName + "_RednessMask.png"
        a.download = fNameR;
        a.href = canvasPng_r2;
        a.click();
    }


    // remove the white rectangle background after Saving
    rect.remove();

};


//-------------------------READ IMAGE FROM FILE---------------------------------------------
//--------------------------------------------------------------------------------------------

var iat_read_image = function() {
    "use strict"

    var file = this.files[0];
    imgSVG.src = '';

    // Make sure `file.name` matches our extensions criteria
    if (/\.(jpe?g|png|gif|bmp|tiff|tif|svg)$/i.test(file.name)) {

        var image_reader = new FileReader();

        if (file) {
            image_reader.readAsDataURL(file);
        };

        image_reader.onloadend = function() {

            // $("#sketchpad_editor").html(""); // delete the content of the sketchpad container before loading a new img
            // $("#sketchpad_viewer").html(""); // delete the content of the sketchpad viewer container before loading a new img
            sketchpad_editor.clear();
            sketchpad_viewer.clear();
            $("input:radio").prop("checked", false);
            $("#editor_draw_erase").bootstrapToggle('off');
            $("#editor_draw_erase").bootstrapToggle('disable');

            img.src = image_reader.result;
        }

        img.onload = function() {
            "use strict";

            FileNameImg = file.name;

            currH = img.height;
            origH = img.height;
            currW = img.width;
            origW = img.width;
            incW = 20;
            incH = incW / origW * origH;

            //initialize the sketchpad editor with the dimensions of the image loaded
            //change the sketchpad editor size according to the image loaded
            sketchpad_editor.setSize(origW, origH);
            sketchpad_viewer.setSize(origW, origH);

            sketchpad_editor.paper().image(img.src, 0, 0, origW, origH).toBack();

            var _c = sketchpad_editor.canvas(); // attach events to the sketchpad canvas (svg)

            if (_c.addEventListener) {
                // IE9, Chrome, Safari, Opera
                _c.addEventListener("mousewheel", MouseWheelHandler, false);
                // Firefox
                _c.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
            } else {
                _c.attachEvent("onmousewheel", MouseWheelHandler); // IE 6/7/
            }

            function MouseWheelHandler(e) {
                // cross-browser wheel delta
                var e = window.event || e; // old IE support
                var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
                sketchpad_editor.scale(currW + incW * delta, currH + incH * delta);
                sketchpad_editor.paper().image(img.src, 0, 0, origW, origH).toBack();
                currW = currW + incW * delta;
                currH = currH + incH * delta;

                return false;
            }
            document.getElementById("sketchpad_editor").dispatchEvent(new Event("load"));
        }

    } else {
        alert("The file loaded is not an image type. Only *.jpeg, *.png, *.gif, *.bmp, *.svg are accepted. Please try again!");
    }

    this.value = null;
    // document.getElementById("sketchpad_editor").dispatchEvent(new Event("load"));
};

var iat_warn_unsavedChanges = function(e) {
    var confirmationMessage = 'It looks like you have been editing something. ' +
        'If you leave before saving, your changes will be lost.';
    if (sketchpad_editor.json() != '[]') {
        (e || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    }
}

var iat_enable_all = function() {
    iat_disable_all();
    // enable all the controls
    iat_enable_clear();
    iat_enable_undo();
    iat_enable_redo();
    iat_enable_pen_colors();
    iat_enable_pen_size();
    iat_enable_draw_erase();
    iat_enable_zoom();
}

var iat_disable_all = function() {
    $("#editor_clear").unbind();
    $("#editor_undo").unbind();
    $("#editor_redo").unbind();
    $("#editor_vessel").unbind();
    $("#editor_mole").unbind();
    $("#editor_pore").unbind();
    $("#editor_hair").unbind();
    $("#editor_black_pen").unbind();
    $("#editor_redness").unbind();
    $(".toggle").unbind();
    $("#iconPlus").unbind();
    $("#iconMinus").unbind();
    $("#reset_zoom").unbind();
}

var iat_enable_clear = function() {
    $("#editor_clear").click(function() {
        sketchpad_editor.clear();
        sketchpad_viewer.clear();
        sketchpad_editor.paper().image(img.src, 0, 0, origW, origH);
    });
}

var iat_enable_undo = function() {
    $("#editor_undo").click(function() {
        sketchpad_editor.undo();
        sketchpad_editor.paper().image(img.src, 0, 0, origW, origH).toBack();
    });
}

var iat_enable_redo = function() {
    $("#editor_redo").click(function() {
        sketchpad_editor.redo();
        sketchpad_editor.paper().image(img.src, 0, 0, origW, origH).toBack();
    });
}

var iat_enable_pen_colors = function() {
    $("#editor_vessel").click(function() {
        sketchpad_editor.pen().color("#FF0000").opacity(0.4);
        sketchpad_viewer.pen().color("#FF0000").opacity(0.4);
        sketchpad_editor.editing(true);
        $('#editor_draw_erase').bootstrapToggle('enable');
        $("#editor_draw_erase").bootstrapToggle('off');
    });

    $("#editor_mole").click(function() {
        sketchpad_editor.pen().color("#008000").opacity(0.4);
        sketchpad_viewer.pen().color("#008000").opacity(0.4);
        sketchpad_editor.editing(true);
        $('#editor_draw_erase').bootstrapToggle('enable');
        $("#editor_draw_erase").bootstrapToggle('off');
    });

    $("#editor_pore").click(function() {
        sketchpad_editor.pen().color("#00CED1").opacity(0.4);
        sketchpad_viewer.pen().color("#00CED1").opacity(0.4);
        sketchpad_editor.editing(true);
        $('#editor_draw_erase').bootstrapToggle('enable');
        $("#editor_draw_erase").bootstrapToggle('off');
    });

    $("#editor_hair").click(function() {
        sketchpad_editor.pen().color("#8A2BE2").opacity(0.5);
        sketchpad_viewer.pen().color("#8A2BE2").opacity(0.5);
        sketchpad_editor.editing(true);
        $('#editor_draw_erase').bootstrapToggle('enable');
        $("#editor_draw_erase").bootstrapToggle('off');
    });

    $("#editor_black_pen").click(function() {
        sketchpad_editor.pen().color("#191970").opacity(0.6);
        sketchpad_viewer.pen().color("#191970").opacity(0.6);
        sketchpad_editor.editing(true);
        $('#editor_draw_erase').bootstrapToggle('enable');
        $("#editor_draw_erase").bootstrapToggle('off');
    });

    $("#editor_redness").click(function() {
        sketchpad_editor.pen().color("#DAA520").opacity(0.5);
        sketchpad_viewer.pen().color("#DAA520").opacity(0.5);
        sketchpad_editor.editing(true);
        $('#editor_draw_erase').bootstrapToggle('enable');
        $("#editor_draw_erase").bootstrapToggle('off');
    });

}

var iat_enable_pen_size = function() {
    $(function() {
        $('input').filter(function() {
            return this.type == 'range'
        }).each(function() {
            var $slider = $(this),
                $text_box = $('#' + $(this).attr('link-to'));

            $text_box.val(this.value);

            $slider.change(function() {
                $text_box.val(this.value);
                sketchpad_editor.pen().width(this.value);
                sketchpad_viewer.pen().width(this.value);
            });

            $text_box.change(function() {
                $slider.val($text_box.val());
                sketchpad_editor.pen().width(this.value);
                sketchpad_viewer.pen().width(this.value);
            });
        });
    })
}

var iat_enable_draw_erase = function() {

    $(function() {
        $(".toggle").click(function() {
            if ($(this).hasClass("off")) {
                sketchpad_editor.editing("erase");
            } else {
                sketchpad_editor.editing(true);

            }
        });

    })

}


var iat_enable_zoom = function() {

    $("#iconPlus").click(function() {
        currW = currW + incW;
        currH = currH + incH;
        sketchpad_editor.scale(currW, currH);
        sketchpad_editor.paper().image(img.src, 0, 0, origW, origH).toBack();
    });

    $("#iconMinus").click(function() {
        currW = currW - incW;
        currH = currH - incH;
        sketchpad_editor.scale(currW, currH);
        sketchpad_editor.paper().image(img.src, 0, 0, origW, origH).toBack();
    });

    $("#reset_zoom").click(function() {
        sketchpad_editor.scale(origW, origH);
        sketchpad_editor.paper().image(img.src, 0, 0, origW, origH).toBack();
        currW = origW;
        currH = origH;
    });

}
