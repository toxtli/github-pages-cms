(function(){;
// File start: c:\work\modules\raptor-gold\raptor-common/ajax.js
var ajax = {};

ajax.x = function() {
    try {
        return new ActiveXObject('Msxml2.XMLHTTP')
    } catch (e1) {
        try {
            return new ActiveXObject('Microsoft.XMLHTTP')
        } catch (e2) {
            return new XMLHttpRequest()
        }
    }
};

ajax.prepare = function(data) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    return query.join('&');
};

ajax.send = function(url, callback, method, data, async) {
    var x = ajax.x();
    x.open(method, url, async);
    x.onreadystatechange = function() {
        if (x.readyState == 4) {
            callback(x.responseText, x)
        }
    };
    x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    if (method == 'POST') {
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    x.send(data)
};

ajax.get = function(url, data, callback, async) {
    ajax.send(url + (data ? '?' + ajax.prepare(data) : ''), callback, 'GET', null, async)
};

ajax.post = function(url, data, callback, async) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url, callback, 'POST', ajax.prepare(data), async)
};
;
// File end: c:\work\modules\raptor-gold\raptor-common/ajax.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/debug.js
// <debug/>


// <strict/>
;
// File end: c:\work\modules\raptor-gold\raptor-common/debug.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/event.js
function eventMouseEnter(node, callback) {
    node.addEventListener('mouseover', function(event) {
        if (!event.relatedTarget || (event.relatedTarget !== this && !(this.compareDocumentPosition(event.relatedTarget) & Node.DOCUMENT_POSITION_CONTAINED_BY))) {
            callback.call(node, event);
        }
    });
};

function eventMouseLeave(node, callback) {
    node.addEventListener('mouseout', function(event) {
        if (!event.relatedTarget || (event.relatedTarget !== this && !(this.compareDocumentPosition(event.relatedTarget) & Node.DOCUMENT_POSITION_CONTAINED_BY))) {
            callback.call(node, event);
        }
    });
};

function eventEventable(object) {
    object.prototype.events = {};
    object.prototype.bindOptions = function(options) {
        for (var name in options) {
            this.bind(name, options[name]);
        }
    };
    object.prototype.bind = function(name, callback) {
        // <strict/>
        var names = name.split(/,\s*/);
        for (var i = 0, l = names.length; i < l; i++) {
            if (!this.events[names[i]]) {
                this.events[names[i]] = [];
            }
            this.events[names[i]].push(callback);
        }
    };
    object.prototype.fire = function(name, args) {
        var result = [];

        // <debug/>

        if (this.events[name]) {
            for (var i = 0; i < this.events[name].length; i++) {
                var event = this.events[name][i],
                    currentResult = event.apply(this, args);
                if (typeof currentResult !== 'undefined') {
                    result = result.concat(currentResult);
                }
            }
        }

        return result;
    };
};
;
// File end: c:\work\modules\raptor-gold\raptor-common/event.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/format.js
function formatBytes(bytes, decimalPlaces) {
    if (typeof decimalPlaces === 'undefined') {
        decimalPlaces = 2;
    }
    var suffix = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    for (var i = 0; bytes > 1024 && i < 8; i++) {
        bytes /= 1024;
    }
    return Math.round(bytes, decimalPlaces) + ' ' + suffix[i];
}
;
// File end: c:\work\modules\raptor-gold\raptor-common/format.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/i18n.js
/**
 * @fileOverview Editor internationalization (i18n) private functions and properties.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 */

/**
 * @type String|null
 */
var currentLocale = null;

var localeFallback = 'en';

/**
 * @type Object
 */
var locales = {};

/**
 * @type Object
 */
var localeNames = {};

/**
 *
 * @static
 * @param {String} languageCode The language code (e.g. `en`, `fr`, `zh-CN`).
 * @param {String} nativeName The languages native name.
 * @param {Object} [strings] Locale keys mapped to phrases.
 */
function registerLocale(name, nativeName, strings) {
    // <strict/>
    // <debug/>

    locales[name] = strings;
    localeNames[name] = nativeName;
}

/**
 * Extends an existing locale, or registers it if it does not already exist.
 *
 * @static
 * @param {String} languageCode The language code (e.g. `en`, `fr`, `zh-CN`).
 * @param {String|Object} nativeName The languages native name, or an locale keys mapped to phrases.
 * @param {Object} [strings] Locale keys mapped to phrases.
 */
function extendLocale(languageCode, nativeName, strings) {
    if (typeof locales[languageCode] === 'undefined') {
        registerLocale(languageCode, nativeName, strings);
    } else {
        // <debug/>

        // Allow only passing the nativeName once.
        strings = strings || nativeName;

        for (var key in strings) {
            locales[languageCode][key] = strings[key];
        }
    }
}

/**
 * @param {String} key
 */
function setLocale(key) {
    if (currentLocale !== key) {
        // <debug/>

        currentLocale = key;
        Raptor.eachInstance(function() {
            this.localeChange();
        });
    }
}

/**
 * Return the localised string for the current locale if present, else the
 * localised string for the first available locale, failing that return the
 * string.
 *
 * @param  {string} string
 * @param  {Boolean} allowMissing If true and the localized string is missing, false is returned.
 * @return {string|false}
 */
function getLocalizedString(string, allowMissing) {
    if (typeof locales[currentLocale] !== 'undefined' &&
            typeof locales[currentLocale][string] !== 'undefined') {
        return locales[currentLocale][string];
    }

    if (typeof locales[localeFallback] !== 'undefined' &&
            typeof locales[localeFallback][string] !== 'undefined') {
        return locales[localeFallback][string];
    }

    for (var localeName in localeNames) {
        if (typeof locales[localeName][string] !== 'undefined') {
            return locales[localeName][string];
        }
    }

    if (allowMissing) {
        return false;
    }

    // <debug/>
    return string;
}

/**
 * Internationalisation function. Translates a string with tagged variable
 * references to the current locale.
 *
 * <p>
 * Variable references should be surrounded with double curly braces {{ }}
 *      e.g. "This string has a variable: {{my.variable}} which will not be translated"
 * </p>
 *
 * @static
 * @param {String} string
 * @param {Object|false} variables If false, then no string is returned by default.
 */
function tr(string, variables) {
    if (!currentLocale) {
        var lastLocale = Raptor.persist('locale');
        if (lastLocale) {
            currentLocale = lastLocale;
        }
    } 
    if (!currentLocale) {
        currentLocale = 'en';
    }

    // Get the current locale translated string
    string = getLocalizedString(string, variables === false);
    if (string === false) {
        return false;
    }

    // Convert the variables
    if (!variables) {
        return string;
    } else {
        for (var key in variables) {
            string = string.replace('{{' + key + '}}', variables[key]);
        }
        return string;
    }
}
;
// File end: c:\work\modules\raptor-gold\raptor-common/i18n.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/node.js

/**
 * Generates a unique ID for a node.
 *
 * @returns {String} The unique ID.
 */
function nodeUniqueId(node) {
    if (!node || !node.id) {
        var id;
        do {
            id = 'ruid-' + Math.random().toString().replace('.', '');
        } while (document.getElementById(id))
        if (!node) {
            return id;
        }
        node.id = id;
    }
    return node.id;
}

function nodeClosestByClassName(node, className) {
    while (node.parentNode && node.parentNode.className != className) {
        node = node.parentNode;
    }
    if (node.parentNode) {
        return node.parentNode;
    }
    return null;
}

function nodeFromHtml(html, wrapper) {
    return nodesFromHtml(html, wrapper)[0];
}

function nodesFromHtml(html, wrapper) {
    var node = document.createElement(wrapper || 'div');
    node.innerHTML = html;
    return node.children;
}

function nodeClassSwitch(node, classAdd, classRemove) {
    node.classList.add(classAdd);
    node.classList.remove(classRemove);
}

function nodeLastChild(node) {
    var lastChild = node.lastChild
    while (lastChild && lastChild.nodeType !== 1) {
        lastChild = lastChild.previousSibling;
    }
    return lastChild;
}

function nodeOffsetTop(node) {
    var offsetTop = 0;
    do {
        if (node.tagName === 'BODY') {
            break;
        } else {
            offsetTop += node.offsetTop;
        }
        node = node.offsetParent;
    } while(node);
    return offsetTop;
}
;
// File end: c:\work\modules\raptor-gold\raptor-common/node.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/plugin.js
function Plugin(overrides) {
    for (var key in overrides) {
        this[key] = overrides[key];
    }
};

Plugin.prototype.init = function() {}

function pluginPluggable(object) {
    object.registerPlugin = function(plugin) {
        // <strict/>

        this.prototype.plugins[plugin.name] = plugin;
    };
    object.prototype.plugins = {};
    object.prototype.pluginInstances = {};
};

function pluginPrepare(pluggable, plugin, pluginOptions, pluginAttributes) {
    var instance = $.extend({}, plugin);

    var options = $.extend({}, pluggable.options, {
        baseClass: 'raptor-plugin-' + stringFromCamelCase(plugin.name)
    }, instance.options, pluginOptions);

    instance.pluggable = pluggable;
    instance.options = options;

    for (var key in pluginAttributes) {
        instance[key] = pluginAttributes[key];
    }

    // <strict/>
    var ui = instance.init();

    return {
        ui: ui,
        instance: instance
    };
};
;
// File end: c:\work\modules\raptor-gold\raptor-common/plugin.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/state.js
var stateDirty = {};

jQuery(window).on('beforeunload', stateCheckDirty);

function stateSetDirty(owner, dirty) {
    if (dirty) {
        stateDirty[owner] = dirty;
    } else {
        delete stateDirty[owner];
    }
}

function stateCheckDirty(event) {
    var dirty = false;
    for (var key in stateDirty) {
        if (typeof stateDirty[key] === 'function') {
            if (stateDirty[key]()) {
                dirty = true;
            }
        } else if (stateDirty[key]) {
            dirty = true;
        }
    }
    if (dirty) {
        var confirmationMessage = 'There are unsaved changes on this page. Are you sure you wish to navigate away?';
        (event || window.event).returnValue = confirmationMessage;
        return confirmationMessage;
    }
};
// File end: c:\work\modules\raptor-gold\raptor-common/state.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/string.js
function stringHash(string) {
    return string
        .split('')
        .reduce(function(a, b){
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a
        }, 0);
}

function stringUcFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function stringFromCamelCase(string, delimiter) {
    return string.replace(/([A-Z])/g, function(match) {
        return (delimiter || '-') + match.toLowerCase();
    });
}
;
// File end: c:\work\modules\raptor-gold\raptor-common/string.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/template.js
/**
 * @fileOverview Template helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 *
 * @type type
 */
var templateCache = { 
    "unsupported": "<div class=\"{{baseClass}}-unsupported-overlay\"></div> <div class=\"{{baseClass}}-unsupported-content\"> It has been detected that you a using a browser that is not supported by Raptor, please use one of the following browsers: <ul> <li><a href=\"http://www.google.com/chrome\">Google Chrome</a></li> <li><a href=\"http://www.firefox.com\">Mozilla Firefox</a></li> <li><a href=\"http://www.google.com/chromeframe\">Internet Explorer with Chrome Frame</a></li> </ul> <div class=\"{{baseClass}}-unsupported-input\"> <button class=\"{{baseClass}}-unsupported-close\">Close</button> <input name=\"{{baseClass}}-unsupported-show\" type=\"checkbox\" /> <label>Don't show this message again</label> </div> <div>",
    "class-menu.item": "<li><a data-value=\"{{value}}\">{{label}}</a></li>",
    "click-button-to-edit.button": "<button class=\"{{baseClass}}-button\">tr('clickButtonToEditPluginButton')</button>",
    "color-menu-basic.menu": "<li><a data-color=\"automatic\"><div class=\"{{baseClass}}-swatch\" style=\"display: none\"></div> <span>tr('colorMenuBasicAutomatic')</span></a></li> <li><a data-color=\"white\"><div class=\"{{baseClass}}-swatch\" style=\"background-color: #ffffff\"></div> <span>tr('colorMenuBasicWhite')</span></a></li> <li><a data-color=\"black\"><div class=\"{{baseClass}}-swatch\" style=\"background-color: #000000\"></div> <span>tr('colorMenuBasicBlack')</span></a></li> <li><a data-color=\"grey\"><div class=\"{{baseClass}}-swatch\" style=\"background-color: #999\"></div> <span>tr('colorMenuBasicGrey')</span></a></li> <li><a data-color=\"blue\"><div class=\"{{baseClass}}-swatch\" style=\"background-color: #4f81bd\"></div> <span>tr('colorMenuBasicBlue')</span></a></li> <li><a data-color=\"red\"><div class=\"{{baseClass}}-swatch\" style=\"background-color: #c0504d\"></div> <span>tr('colorMenuBasicRed')</span></a></li> <li><a data-color=\"green\"><div class=\"{{baseClass}}-swatch\" style=\"background-color: #9bbb59\"></div> <span>tr('colorMenuBasicGreen')</span></a></li> <li><a data-color=\"purple\"><div class=\"{{baseClass}}-swatch\" style=\"background-color: #8064a2\"></div> <span>tr('colorMenuBasicPurple')</span></a></li> <li><a data-color=\"orange\"><div class=\"{{baseClass}}-swatch\" style=\"background-color: #f79646\"></div> <span>tr('colorMenuBasicOrange')</span></a></li>",
    "embed.dialog": "<div class=\"{{baseClass}}-panel-tabs ui-tabs ui-widget ui-widget-content ui-corner-all\"> <ul class=\"ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all\"> <li class=\"ui-state-default ui-corner-top ui-tabs-selected ui-state-active\"><a>tr('embedDialogTabCode')</a></li> <li class=\"ui-state-default ui-corner-top\"><a>tr('embedDialogTabPreview')</a></li> </ul> <div class=\"{{baseClass}}-code-tab\"> <p>tr('embedDialogTabCodeContent')</p> <textarea></textarea> </div> <div class=\"{{baseClass}}-preview-tab\" style=\"display: none\"> <p>tr('embedDialogTabPreviewContent')</p> <div class=\"{{baseClass}}-preview\"></div> </div> </div>",
    "image-resize.dialog": "<div class=\"raptor-resize-image\"> <div> <label for=\"{{baseClass}}-width\">tr('imageResizeDialogWidth')</label> <input class=\"form-text\" id=\"{{baseClass}}-width\" name=\"width\" type=\"text\" placeholder=\"tr('imageResizeDialogWidthPlaceHolder')\"/> </div> <div> <label for=\"{{baseClass}}-height\">tr('imageResizeDialogHeight')</label> <input class=\"form-text\" id=\"{{baseClass}}-height\" name=\"height\" type=\"text\" placeholder=\"tr('imageResizeDialogHeightPlaceHolder')\"/> </div> <div class=\"{{baseClass}}-lock-proportions-container\"> <span class=\"{{baseClass}}-lock-proportions\"> <span class=\"ui-button-text\">Constrain proportions</span> <span class=\"ui-icon ui-icon-locked\"></span> </span> </div> </div>",
    "insert-file.dialog": "<div> <div> <label class=\"form-label\">tr('insertFileURLLabel')</label> <input type=\"text\" name=\"location\" class=\"form-text\" placeholder=\"tr('insertFileURLPlaceHolder')\"/> </div> <div> <label class=\"form-label\">tr('insertFileNameLabel')</label> <input type=\"text\" name=\"name\" class=\"form-text\" placeholder=\"tr('insertFileNamePlaceHolder')\"/> </div> </div>",
    "link.dialog": "<div style=\"display:none\" class=\"{{baseClass}}-panel\"> <div class=\"{{baseClass}}-menu\"> <p>tr('linkCreateDialogMenuHeader')</p> <fieldset data-menu=\"\"></fieldset> </div> <div class=\"{{baseClass}}-wrap\"> <div class=\"{{baseClass}}-content\" data-content=\"\"></div> </div> </div>",
    "link.document": "<h2>tr('linkTypeDocumentHeader')</h2> <fieldset> <label for=\"{{baseClass}}-document-href\">tr('linkTypeDocumentLocationLabel')</label> <input id=\"{{baseClass}}-document-href\" value=\"http://\" name=\"location\" class=\"{{baseClass}}-document-href\" type=\"text\" placeholder=\"tr('linkTypeDocumentLocationPlaceHolder')\" /> </fieldset> <h2>tr('linkTypeDocumentNewWindowHeader')</h2> <fieldset> <label for=\"{{baseClass}}-document-target\"> <input id=\"{{baseClass}}-document-target\" name=\"blank\" type=\"checkbox\" /> <span>tr('linkTypeDocumentNewWindowLabel')</span> </label> </fieldset> tr('linkTypeDocumentInfo')",
    "link.email": "<h2>tr('linkTypeEmailHeader')</h2> <fieldset class=\"{{baseClass}}-email\"> <label for=\"{{baseClass}}-email\">tr('linkTypeEmailToLabel')</label> <input id=\"{{baseClass}}-email\" name=\"email\" type=\"text\" placeholder=\"tr('linkTypeEmailToPlaceHolder')\"/> </fieldset> <fieldset class=\"{{baseClass}}-email\"> <label for=\"{{baseClass}}-email-subject\">tr('linkTypeEmailSubjectLabel')</label> <input id=\"{{baseClass}}-email-subject\" name=\"subject\" type=\"text\" placeholder=\"tr('linkTypeEmailSubjectPlaceHolder')\"/> </fieldset>",
    "link.error": "<div style=\"display:none\" class=\"ui-widget {{baseClass}}-error-message {{messageClass}}\"> <div class=\"ui-state-error ui-corner-all\"> <p> <span class=\"ui-icon ui-icon-alert\"></span> {{message}} </p> </div> </div>",
    "link.external": "<h2>tr('linkTypeExternalHeader')</h2> <fieldset> <label for=\"{{baseClass}}-external-href\">tr('linkTypeExternalLocationLabel')</label> <input id=\"{{baseClass}}-external-href\" value=\"http://\" name=\"location\" class=\"{{baseClass}}-external-href\" type=\"text\" placeholder=\"tr('linkTypeExternalLocationPlaceHolder')\" /> </fieldset> <h2>tr('linkTypeExternalNewWindowHeader')</h2> <fieldset> <label for=\"{{baseClass}}-external-target\"> <input id=\"{{baseClass}}-external-target\" name=\"blank\" type=\"checkbox\" /> <span>tr('linkTypeExternalNewWindowLabel')</span> </label> </fieldset> tr('linkTypeExternalInfo')",
    "link.file-url": "<h2>tr('Link to a document or other file')</h2> <fieldset> <label for=\"{{baseClass}}-external-href\">tr('Location')</label> <input id=\"{{baseClass}}-external-href\" value=\"http://\" name=\"location\" class=\"{{baseClass}}-external-href\" type=\"text\" placeholder=\"tr('Enter your URL')\" /> </fieldset> <h2>tr('New window')</h2> <fieldset> <label for=\"{{baseClass}}-external-target\"> <input id=\"{{baseClass}}-external-target\" name=\"blank\" type=\"checkbox\" /> <span>tr('Check this box to have the file open in a new browser window')</span> </label> </fieldset> <h2>tr('Not sure what to put in the box above?')</h2> <ol> <li>tr('Ensure the file has been uploaded to your website')</li> <li>tr('Open the uploaded file in your browser')</li> <li>tr(\"Copy the file's URL from your browser's address bar and paste it into the box above\")</li> </ol>",
    "link.internal": "<h2>tr('linkTypeInternalHeader')</h2> <fieldset> <label for=\"{{baseClass}}-internal-href\">tr('linkTypeInternalLocationLabel') {{domain}}</label> <input id=\"{{baseClass}}-internal-href\" value=\"\" name=\"location\" class=\"{{baseClass}}-internal-href\" type=\"text\" placeholder=\"tr('linkTypeInternalLocationPlaceHolder')\" /> </fieldset> <h2>tr('linkTypeInternalNewWindowHeader')</h2> <fieldset> <label for=\"{{baseClass}}-internal-target\"> <input id=\"{{baseClass}}-internal-target\" name=\"blank\" type=\"checkbox\" /> <span>tr('linkTypeInternalNewWindowLabel')</span> </label> </fieldset> tr('linkTypeInternalInfo')",
    "link.label": "<label> <input type=\"radio\" name=\"link-type\" autocomplete=\"off\"/> <span>{{label}}</span> </label>",
    "paste.dialog": "<div class=\"{{baseClass}}-panel ui-dialog-content ui-widget-content\"> <div class=\"{{baseClass}}-panel-tabs ui-tabs ui-widget ui-widget-content ui-corner-all\"> <ul class=\"ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all\"> <li class=\"{{baseClass}}-tab-formatted-clean ui-state-default ui-corner-top ui-state-active ui-tabs-selected\" style=\"display: none\"><a>tr('pasteDialogFormattedCleaned')</a></li> <li class=\"{{baseClass}}-tab-plain-text ui-state-default ui-corner-top\" style=\"display: none\"><a>tr('pasteDialogPlain')</a></li> <li class=\"{{baseClass}}-tab-formatted-unclean ui-state-default ui-corner-top\" style=\"display: none\"><a>tr('pasteDialogFormattedUnclean')</a></li> <li class=\"{{baseClass}}-tab-source ui-state-default ui-corner-top\" style=\"display: none\"><a>tr('pasteDialogSource')</a></li> </ul> <div class=\"{{baseClass}}-content-formatted-clean\" style=\"display: none\"> <div contenteditable=\"true\" class=\"{{baseClass}}-area {{baseClass}}-markup\"></div> </div> <div class=\"{{baseClass}}-content-plain-text\" style=\"display: none\"> <textarea class=\"{{baseClass}}-area {{baseClass}}-plain\"></textarea> </div> <div class=\"{{baseClass}}-content-formatted-unclean\" style=\"display: none\"> <div contenteditable=\"true\" class=\"{{baseClass}}-area {{baseClass}}-rich\"></div> </div> <div class=\"{{baseClass}}-content-source\" style=\"display: none\"> <textarea class=\"{{baseClass}}-area {{baseClass}}-source\"></textarea> </div> </div> </div>",
    "snippet-menu.item": "<li><a data-name=\"{{name}}\">{{name}}</a></li>",
    "special-characters.dialog": "<div> tr('specialCharactersHelp') <br/> <ul></ul> </div>",
    "special-characters.tab-button": "<button data-setKey=\"{{setKey}}\" data-charactersIndex=\"{{charactersIndex}}\" title=\"{{description}}\">{{htmlEntity}}</button>",
    "special-characters.tab-content": "<div id=\"{{baseClass}}-{{key}}\"></div>",
    "special-characters.tab-li": "<li><a href=\"#{{baseClass}}-{{key}}\">{{name}}</a></li>",
    "table.create-menu": "<table class=\"{{baseClass}}-menu\"> <tr> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr> <tr> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr> <tr> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr> <tr> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr> <tr> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr> <tr> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr> <tr> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr> <tr> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr> </table>",
    "tag-menu.menu": "<li><a data-value=\"na\">tr('tagMenuTagNA')</a></li> <li><a data-value=\"p\">tr('tagMenuTagP')</a></li> <li><a data-value=\"h1\">tr('tagMenuTagH1')</a></li> <li><a data-value=\"h2\">tr('tagMenuTagH2')</a></li> <li><a data-value=\"h3\">tr('tagMenuTagH3')</a></li> <li><a data-value=\"h4\">tr('tagMenuTagH4')</a></li> <li><a data-value=\"div\">tr('tagMenuTagDiv')</a></li> <li><a data-value=\"pre\">tr('tagMenuTagPre')</a></li> <li><a data-value=\"address\">tr('tagMenuTagAddress')</a></li>",
    "unsaved-edit-warning.warning": "<div class=\"{{baseClass}} ui-corner-tl\"> <span class=\"ui-icon ui-icon-alert\"></span> <span>tr('unsavedEditWarningText')</span> </div>",
    "view-source.dialog": "<div class=\"{{baseClass}}-inner-wrapper\"> <textarea></textarea> </div>"
 };

function templateRegister(name, content) {
    templateCache[name] = content;
}

function templateGet(name) {
    return templateCache[name];
};

/**
 *
 * @param {type} template
 * @param {type} variables
 * @returns {unresolved}
 */
function templateConvertTokens(template, variables) {
    // Translate template
    template = template.replace(/tr\(['"]{1}(.*?)['"]{1}\)/g, function(match, key) {
        key = key.replace(/\\(.?)/g, function (s, slash) {
            switch (slash) {
                case '\\': {
                    return '\\';
                }
                case '0': {
                    return '\u0000';
                }
                case '': {
                    return '';
                }
                default: {
                    return slash;
                }
            }
        });
        return tr(key);
    });

    // Replace variables
    variables = $.extend({}, this.options, variables || {});
    variables = templateGetVariables(variables);
    template = template.replace(/\{\{(.*?)\}\}/g, function(match, variable) {
        // <debug/>
        return variables[variable];
    });

    return template;
};

/**
 *
 * @param {type} variables
 * @param {type} prefix
 * @param {type} depth
 * @returns {unresolved}
 */
function templateGetVariables(variables, prefix, depth) {
    prefix = prefix ? prefix + '.' : '';
    var maxDepth = 5;
    if (!depth) depth = 1;
    var result = {};
    for (var name in variables) {
        if (typeof variables[name] === 'object' && depth < maxDepth) {
            var inner = templateGetVariables(variables[name], prefix + name, ++depth);
            for (var innerName in inner) {
                result[innerName] = inner[innerName];
            }
        } else {
            result[prefix + name] = variables[name];
        }
    }
    return result;
};
;
// File end: c:\work\modules\raptor-gold\raptor-common/template.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/toolbar.js
function toolbarLayout(pluggable, uiOrder, panelElement, pluginAttributes) {
    panelElement = $(panelElement || document.createElement('div'));
    // Loop the UI component order option
    for (var i = 0, l = uiOrder.length; i < l; i++) {
        var uiGroupContainer = $('<div/>')
            .addClass('raptor-layout-toolbar-group');

        // Loop each UI in the group
        var uiGroup = uiOrder[i];
        for (var ii = 0, ll = uiGroup.length; ii < ll; ii++) {
            // <strict/>
            var pluginOptions = pluggable.plugins[uiGroup[ii]];
            if (pluginOptions === false) {
                continue;
            }

            var component = pluginPrepare(pluggable, pluggable.plugins[uiGroup[ii]], pluginOptions, pluginAttributes);

            pluggable.pluginInstances[uiGroup[ii]] = component.instance;

            if (typeIsElement(component.ui)) {
                // Fix corner classes
                component.ui.removeClass('ui-corner-all');

                // Append the UI object to the group
                uiGroupContainer.append(component.ui);
            }
        }

        // Append the UI group to the editor toolbar
        if (uiGroupContainer.children().length > 0) {
            uiGroupContainer.appendTo(panelElement);
        }
    }

    // Fix corner classes
    panelElement.find('.ui-button:first-child').addClass('ui-corner-left');
    panelElement.find('.ui-button:last-child').addClass('ui-corner-right');
    return panelElement[0];
};
;
// File end: c:\work\modules\raptor-gold\raptor-common/toolbar.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/types.js
/**
 * @fileOverview Type checking functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author Michael Robinson michael@panmedia.co.nz
 * @author David Neilsen david@panmedia.co.nz
 */

/**
 * Determine whether object is a number
 * {@link http://stackoverflow.com/a/1421988/187954}.
 *
 * @param  {mixed} object The object to be tested
 * @return {Boolean} True if the object is a number.
 */
function typeIsNumber(object) {
    return !isNaN(object - 0) && object !== null;
}

/**
 * Determines whether object is a string.
 *
 * @param {mixed} object The object to be tested.
 * @returns {Boolean} True if the object is a string.
 */
function typeIsString(object) {
    return typeof object === 'string';
}

/**
 * @param  {mixed} object
 * @return {boolean} True if object is an Array.
 */
function typeIsArray(object) {
    return object instanceof Array;
}

/**
 * Determines whether object is a node.
 *
 * @param {mixed} object The object to be tested.
 * @returns {Boolean} True if the object is a node.
 */
function typeIsNode(object) {
    return object instanceof Node;
}

/**
 * @param  {mixed} object
 * @return {boolean} True if object is a text node.
 */
function typeIsTextNode(object) {
    if (typeIsNode(object)) {
        return object.nodeType === Node.TEXT_NODE;
    }

    if (typeIsElement(object)) {
        return typeIsNode(object[0]);
    }

    return false;
}

/**
 * Determines whether object is a jQuery element.
 *
 * @param {mixed} object The object to be tested.
 * @returns {Boolean} True if the object is a jQUery element.
 */
function typeIsElement(object) {
    return object instanceof jQuery;
}

function typeIsJQueryCompatible(object) {
    return object instanceof Node || object instanceof NodeList || object instanceof HTMLCollection || object instanceof jQuery;
};
// File end: c:\work\modules\raptor-gold\raptor-common/types.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/adapters/jquery-ui.js
/**
 * @fileOverview jQuery UI helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Wrap the jQuery UI button function.
 *
 * @param {Element|Node|selector} element
 * @param {Object|null} options The options relating to the creation of the button.
 * @returns {Element} The modified element.
 */
function aButton(element, options) {
    // <strict/>

    return $(element).button(options);
}

/**
 * Wrap the jQuery UI button's set label function.
 *
 * @param {Element|Node|selector} element
 * @param {String} text The text for the label.
 * @returns {Element} The labelled button.
 */
function aButtonSetLabel(element, text) {
    // <strict/>

    $(element).button('option', 'text', true);
    return $(element).button('option', 'label', text);
}

/**
 * Wrap the jQuery UI button's set icon function.
 *
 * @param {Element|Node|selector} element
 * @param {String} icon The icon name to be added to the button, e.g. 'ui-icon-disk'
 * @returns {Element} The modified button.
 */
function aButtonSetIcon(element, icon) {
    // <strict/>

    return $(element).button('option', 'icons', {
        primary: icon
    });
}

/**
 * Wrap the jQuery UI button's enable function.
 *
 * @param {Element|Node|selector} element
 * @returns {Element} The enabled button.
 */
function aButtonEnable(element) {
    // <strict/>

    return $(element).button('option', 'disabled', false);
}

function aButtonIsEnabled(element) {
    return !$(element).is('.ui-state-disabled');
}

/**
 * Wrap the jQuery UI button's disable function.
 *
 * @param {Element|Node|selector} element
 * @returns {Element} The disabled button.
 */
function aButtonDisable(element) {
    // <strict/>

    return $(element).button('option', 'disabled', true);
}

/**
 * Wrap the jQuery UI button's add class function.
 *
 * @param {Element|Node|selector} element
 * @returns {Element} The highlighted button.
 */
function aButtonActive(element) {
    // <strict/>

    return $(element).addClass('ui-state-highlight');
}

/**
 * Wrap the jQuery UI button's remove class function.
 *
 * @param {Element|Node|selector} element
 * @returns {Element} The button back in its normal state.
 */
function aButtonInactive(element) {
    // <strict/>

    return $(element).removeClass('ui-state-highlight');
}

/**
 * Wrap the jQuery UI button's initialise menu function.
 *
 * @param {Element|Node|selector} element
 * @param {Object|null} options The set of options for menu creation.
 * @returns {Element} The menu.
 */
function aMenu(element, options) {
    // <strict/>

    return $(element).menu(options);
}

/**
 * Initialises a dialog with the given element.
 *
 * @param {Element|Node|selector} element
 * @param {Object|null} options The set of options for the menu.
 * @returns {Element} A dialog.
 */
function aDialog(element, options) {
    // <strict/>

    options.dialogClass = typeof options.dialogClass !== 'undefined' ? options.dialogClass + ' ui-dialog-fixed' : 'ui-dialog-fixed';
    var dialog = $(element).dialog(options);
    dialog.parent().css({
        top: (parseInt(dialog.parent().css('top')) || 0) - $(window).scrollTop()
    });
    dialog.dialog("option", "position", 'center');
    return dialog;
}

/**
 * Wrap the jQuery UI open dialog function.
 *
 * @param {Element|Node|selector} element
 * @returns {Element}
 */
function aDialogOpen(element) {
    // <strict/>

    return $(element).dialog('open');
}

/**
 * Wrap the jQuery UI close dialog function.
 *
 * @param {Element|Node|selector} element
 * @returns {Element}
 */
function aDialogClose(element) {
    // <strict/>

    return $(element).dialog('close');
}

function aDialogRemove(element) {
    // <strict/>

    return $(element).dialog('destroy').remove();
}

/**
 * Wrap the jQuery UI tabs function.
 *
 * @param  {Element|Node|selector} element
 * @param  {Object|null} options
 * @returns {Element}
 */
function aTabs(element, options) {
    // <strict/>

    return $(element).tabs(options);
}
;
// File end: c:\work\modules\raptor-gold\raptor-common/adapters/jquery-ui.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/adapters/pnotify.js
function aNotify(options) {
    if (options.type == 'success') {
        options.state = 'confirmation'
    }
    $.pnotify($.extend({
        type: 'success',
        styling: 'jqueryui',
        history: false
    }, options));
}
;
// File end: c:\work\modules\raptor-gold\raptor-common/adapters/pnotify.js
;
// File start: c:\work\modules\raptor-gold\raptor-locales/en.js
/**
 * @fileOverview English strings file.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 */
extendLocale('en', 'English', {
    alignCenterTitle: 'Align text center',
    alignJustifyTitle: 'Align text justify',
    alignLeftTitle: 'Align text left',
    alignRightTitle: 'Align text right',

    cancelDialogCancelButton: 'Continue Editing',
    cancelDialogContent: 'Are you sure you want to cancel editing? All changes will be lost!',
    cancelDialogOKButton: 'Cancel Editing',
    cancelDialogTitle: 'Cancel Editing',
    cancelTitle: 'Cancel editing',

    classMenuTitle: 'Style picker',
    cleanBlockTitle: 'Clean block',
    clearFormattingTitle: 'Clear formatting',
    clickButtonToEditText: 'Edit',
    clickButtonToEditTitle: null,

    closeTitle: 'Close this toolbar',

    colorMenuBasicAutomatic: 'Automatic',
    colorMenuBasicBlack: 'Black',
    colorMenuBasicBlue: 'Blue',
    colorMenuBasicGreen: 'Green',
    colorMenuBasicGrey: 'Grey',
    colorMenuBasicOrange: 'Orange',
    colorMenuBasicPurple: 'Purple',
    colorMenuBasicRed: 'Red',
    colorMenuBasicTitle: 'Change text color',
    colorMenuBasicWhite: 'White',

    dockToElementTitle: 'Dock/undock editor to element',
    dockToScreenTitle: 'Dock/undock editor to screen',

    embedTitle: 'Embed object',
    embedDialogTitle: 'Embed Object',
    embedDialogTabCode: 'Embed Code',
    embedDialogTabCodeContent: 'Paste your embed code into the text area below:',
    embedDialogTabPreview: 'Preview',
    embedDialogTabPreviewContent: 'A preview of your embedded object is displayed below:',
    embedDialogOKButton: 'Embed Object',
    embedDialogCancelButton: 'Cancel',

    errorUINoName: 'UI "{{ui}}" is invalid (must have a name property)',
    errorUINotObject: 'UI "{{ui}}" is invalid (must be an object)',
    errorUIOverride: 'UI "{{name}}" has already been registered, and will be overwritten',

    editPageDialogTitle: 'Edit Page',
    editPageDialogOKButton: 'Save',
    editPageDialogCancelButton: 'Cancel',

    floatLeftTitle: 'Align image to the left',
    floatNoneTitle: 'Remove image align',
    floatRightTitle: 'Align image to the right',

    fontFamilyMenuTitle: 'Choose your font',
    fontFamilyMenuFontDefault: 'Default Font',
    fontFamilyMenuFontArial: 'Arial',
    fontFamilyMenuFontPalatino: 'Palatino',
    fontFamilyMenuFontGeorgia: 'Georgia',
    fontFamilyMenuFontTimes: 'Times New Roman',
    fontFamilyMenuFontComicSans: 'Comic Sans',
    fontFamilyMenuFontImpact: 'Impact',
    fontFamilyMenuFontCourier: 'Courier New',

    guidesTitle: 'Show element guides',

    historyRedoTitle: 'Redo',
    historyUndoTitle: 'Undo',

    hrCreateTitle: 'Insert Horizontal Rule',

    imageResizeDialogWidth: 'Image width',
    imageResizeDialogHeight: 'Image height',
    imageResizeDialogWidthPlaceHolder: 'Width',
    imageResizeDialogHeightPlaceHolder: 'Height',
    imageResizeDialogTitle: 'Resize Image',
    imageResizeDialogOKButton: 'Resize',
    imageResizeDialogCancelButton: 'Cancel',
    imageResizeTitle: 'Resize this image',

    insertFileTitle: 'Insert file',
    insertFileDialogTitle: 'Insert file',
    insertFileDialogOKButton: 'Insert file',
    insertFileDialogCancelButton: 'Cancel',
    insertFileURLLabel: 'File URL',
    insertFileNameLabel: 'File Name',
    insertFileURLPlaceHolder: 'File URL...',
    insertFileNamePlaceHolder: 'File Name...',

    languageMenuTitle: 'Change Language',

    loremIpsumTitle: 'Insert dummy text for testing',

    listOrderedTitle: 'Ordered list',
    listUnorderedTitle: 'Unordered list',

    linkCreateTitle: 'Insert Link',
    linkRemoveTitle: 'Remove Link',

    linkCreateDialogTitle: 'Insert Link',
    linkCreateDialogOKButton: 'Insert Link',
    linkCreateDialogCancelButton: 'Cancel',
    linkCreateDialogMenuHeader: 'Choose a link type',

    linkTypeEmailLabel: 'Email address',
    linkTypeEmailHeader: 'Link to an email address',
    linkTypeEmailToLabel: 'Email:',
    linkTypeEmailToPlaceHolder: 'Enter email address',
    linkTypeEmailSubjectLabel: 'Subject (optional):',
    linkTypeEmailSubjectPlaceHolder: 'Enter subject',

    linkTypeExternalLabel: 'Page on another website',
    linkTypeExternalHeader: 'Link to a page on another website',
    linkTypeExternalLocationLabel: 'Location:',
    linkTypeExternalLocationPlaceHolder: 'Enter a URL',
    linkTypeExternalNewWindowHeader: 'New window',
    linkTypeExternalNewWindowLabel: 'Check this box to have the link open in a new browser window/tab.',
    linkTypeExternalInfo:
        '<h2>Not sure what to put in the box above?</h2>' +
        '<ol>' +
        '    <li>Find the page on the web you want to link to.</li>' +
        '    <li>Copy the web address from your browser\'s address bar and paste it into the box above.</li>' +
        '</ol>',

    linkTypeDocumentLabel: 'Document or other file',
    linkTypeDocumentHeader: 'Link to a document or other file',
    linkTypeDocumentLocationLabel: 'Location:',
    linkTypeDocumentLocationPlaceHolder: 'Enter a URL',
    linkTypeDocumentNewWindowHeader: 'New window',
    linkTypeDocumentNewWindowLabel: 'Check this box to have the file open in a new browser window/tab.',
    linkTypeDocumentInfo:
        '<h2>Not sure what to put in the box above?</h2>' +
        '<ol>' +
        '    <li>Ensure the file has been uploaded to your website.</li>' +
        '    <li>Open the uploaded file in your browser.</li>' +
        '    <li>Copy the file\'s URL from your browser\'s address bar and paste it into the box above.</li>' +
        '</ol>',

    linkTypeInternalLabel: 'Page on this website',
    linkTypeInternalHeader: 'Link to a page on this website',
    linkTypeInternalLocationLabel: '',
    linkTypeInternalLocationPlaceHolder: 'Enter a URI',
    linkTypeInternalNewWindowHeader: 'New window',
    linkTypeInternalNewWindowLabel: 'Check this box to have the link open in a new browser window/tab.',
    linkTypeInternalInfo:
        '<h2>Not sure what to put in the box above?</h2>' +
        '<ol>' +
        '    <li>Find the page on this site link to.</li>' +
        '    <li>Copy the web address from your browser\'s address bar, excluding "{{domain}}" and paste it into the box above.</li>' +
        '</ol>',

    logoTitle: 'Learn More About the Raptor WYSIWYG Editor',

    navigateAway: '\nThere are unsaved changes on this page. \nIf you navigate away from this page you will lose your unsaved changes',

    pasteDialogTitle: 'Paste',
    pasteDialogOKButton: 'Insert',
    pasteDialogCancelButton: 'Cancel',
    pasteDialogPlain: 'Plain Text',
    pasteDialogFormattedCleaned: 'Formatted &amp; Cleaned',
    pasteDialogFormattedUnclean: 'Formatted Unclean',
    pasteDialogSource: 'Source Code',

    placeholderPluginDefaultContent: '<br/>',

    saveTitle: 'Save content',
    saveNotConfigured: 'Save has not been configured, or is disabled.',
    saveJsonFail: 'Failed to save {{failed}} content block(s)',
    saveJsonSaved: 'Successfully saved {{saved}} content block(s).',
    saveRestFail: 'Failed to save {{failed}} content block(s).',
    saveRestPartial: 'Saved {{saved}} out of {{failed}} content blocks.',
    saveRestSaved: 'Successfully saved {{saved}} content block(s).',

    snippetMenuTitle: 'Snippets',

    specialCharactersArrows: 'Arrows',
    specialCharactersDialogOKButton: 'OK',
    specialCharactersDialogTitle: 'Insert Special Characters',
    specialCharactersGreekAlphabet: 'Greek Alphabet',
    specialCharactersHelp: 'Click a special character to add it. Click "OK" when done to close this dialog',
    specialCharactersMathematics: 'Mathematics',
    specialCharactersSymbols: 'Symbols',
    specialCharactersTitle: 'Insert a special character',

    statisticsButtonCharacterOverLimit: '{{charactersRemaining}} characters over limit',
    statisticsButtonCharacterRemaining: '{{charactersRemaining}} characters remaining',
    statisticsButtonCharacters: '{{characters}} characters',
    statisticsDialogCharactersOverLimit: '{{characters}} characters, {{charactersRemaining}} over the recommended limit',
    statisticsDialogCharactersRemaining: '{{characters}} characters, {{charactersRemaining}} remaining',
    statisticsDialogNotTruncated: 'Content will not be truncated',
    statisticsDialogOKButton: 'Ok',
    statisticsDialogSentence: '{{sentences}} sentence',
    statisticsDialogSentences: '{{sentences}} sentences',
    statisticsDialogTitle: 'Content Statistics',
    statisticsDialogTruncated: 'Content contains more than {{limit}} characters and may be truncated',
    statisticsDialogWord: '{{words}} word',
    statisticsDialogWords: '{{words}} words',
    statisticsTitle: 'Click to view statistics',

    imageSwapTitle: 'Swap this image',

    tableCreateTitle: 'Create table',
    tableDeleteColumnTitle: 'Delete table column',
    tableDeleteRowTitle: 'Delete table row',
    tableInsertColumnTitle: 'Insert table column',
    tableInsertRowTitle: 'Insert table row',
    tableMergeCellsTitle: 'Merge table cells',
    tableSplitCellsTitle: 'Split table cells',

    tagMenuTagH1: 'Heading&nbsp;1',
    tagMenuTagH2: 'Heading&nbsp;2',
    tagMenuTagH3: 'Heading&nbsp;3',
    tagMenuTagH4: 'Heading&nbsp;4',
    tagMenuTagNA: 'N/A',
    tagMenuTagP: 'Paragraph',
    tagMenuTagDiv: 'Div',
    tagMenuTagPre: 'Pre-formatted',
    tagMenuTagAddress: 'Address',
    tagMenuTitle: 'Change element style',

    tagTreeElementLink: 'Select {{element}} element',
    tagTreeElementTitle: 'Click to select the contents of the "{{element}}" element',
    tagTreeRoot: 'root',
    tagTreeRootLink: 'Select all editable content',
    tagTreeRootTitle: 'Click to select all editable content',

    textBlockQuoteTitle: 'Block quote',
    textBoldTitle: 'Bold',
    textItalicTitle: 'Italic',
    textStrikeTitle: 'Strike through',
    textSubTitle: 'Sub-script',
    textSuperTitle: 'Super-script',
    textUnderlineTitle: 'Underline',
    textSizeDecreaseTitle: 'Decrease text size',
    textSizeIncreaseTitle: 'Increase text size',

    unsavedEditWarningText: 'There are unsaved changes on this page',

    revisionsText: 'Revisions',
    revisionsTextEmpty: 'No Revisions',
    revisionsTitle: null,
    revisionsCreated: 'Created',
    revisionsApplyButtonTitle: 'Rollback',
    revisionsApplyButtonText: 'Rollback',
    revisionsAJAXFailed: 'Failed to retrieve revisions',
    revisionsApplyButtonDialogCancelButton: 'Cancel',
    revisionsApplyButtonDialogOKButton: 'Rollback',
    revisionsApplyButtonDialogTitle: 'Rollback Confirmation',
    revisionsApplyDialogContent: 'This will replace the current content with the selected revision.<br/>The current content will be added as a revision, and will be visible in the revisions list for this block.',
    revisionsDialogCancelButton: 'Cancel',
    revisionsDialogTitle: 'View content revisions',
    revisionsButtonCurrent: 'Current',
    revisionsButtonViewDiffText: 'Differences',
    revisionsButtonViewDiffTitle: null,
    revisionsDiffButtonDialogCancelButton: 'Close',
    revisionsDiffButtonDialogTitle: 'View differences',
    revisionsDiffButtonTitle: 'View differences',
    revisionsDiffButtonText: 'View differences',
    revisionsLoading: 'Loading revisions...',
    revisionsNone: 'No revisions for this element',
    revisionsPreviewButtonTitle: 'Preview',
    revisionsPreviewButtonText: 'Preview',

    fileManagerDialogTitle: 'File Manager',
    fileManagerTitle: 'File Manager',
    rfmClose: 'Close',
    rfmContinue: 'Continue',
    rfmDeleteTitle: 'Delete',
    rfmDownloadTitle: 'Download',
    rfmEditTitle: 'Edit',
    rfmFileActions: 'Actions',
    rfmFileModificationTime: 'Modified',
    rfmFileName: 'Name',
    rfmFileSize: 'Size',
    rfmFileType: 'Type',
    rfmFilteredTotal: 'Showing {{start}} to {{end}} of {{filteredTotal}} files',
    rfmFirst: 'First',
    rfmHeadingDirectories: 'Directories',
    rfmHeadingSearch: 'Search',
    rfmHeadingTags: 'Tags',
    rfmHeadingUpload: 'Upload',
    rfmInsertTitle: 'Insert',
    rfmLast: 'Last',
    rfmRenameTitle: 'Rename',
    rfmSearch: 'Go',
    rfmTagDocument: 'Document',
    rfmTagImage: 'Image',
    rfmTotal: ', filtered from {{total}}',
    rfmUpload: 'Upload',
    rfmUploadBrowse: 'Browse',
    rfmUploadDrop: 'Drop Files Here',
    rfmUploadFileRemove: 'Remove',
    rfmUploadOr: 'or',
    rfmViewTitle: 'View',

    imageEditorDialogCancelButton: 'Cancel',
    imageEditorDialogOKButton: 'Save',
    imageEditorDialogTitle: 'Image Editor',
    imageEditorTitle: 'Edit Image',
    rieApply: 'Apply',
    rieBlurTitle: 'Blur',
    rieBrightnessTitle: 'Brightness/Contrast',
    rieCancel: 'Cancel',
    rieCancelTitle: 'Cancel',
    rieColorAdjustTitle: 'Adjsut Color',
    rieCropTitle: 'Crop',
    rieDesaturateTitle: 'Desaturate',
    rieFlipHTitle: 'Flip Horizontally',
    rieFlipVTitle: 'Flip Vertically',
    rieGlowTitle: 'Glow',
    rieHslTitle: 'Hue, Saturation, Lightness.',
    rieInvertTitle: 'Invert',
    riePosterizeTitle: 'Posterize',
    rieRedoTitle: 'Redo',
    rieRemoveNoiseTitle: 'Remove Noise',
    rieResizeTitle: 'Resize',
    rieRevertTitle: 'Revert',
    rieRotateLeftTitle: 'Rotate Left',
    rieRotateRightTitle: 'Rotate Right',
    rieSaveTitle: 'Save',
    rieSaveTitle: 'Save',
    rieSepiaTitle: 'Sepia',
    rieSharpenTitle: 'Sharpen',
    rieSolarizeTitle: 'Solarize',
    rieUndoTitle: 'Undo',
    rieUploadTitle: 'Upload',

    rieActionColorAdjustRed: 'Red',
    rieActionColorAdjustGreen: 'Green',
    rieActionColorAdjustBlue: 'Blue',
    rieActionBrightnessBrightness: 'Brightness',
    rieActionBrightnessContrast: 'Contrast',
    rieActionGlowAmount: 'Glow Amount',
    rieActionGlowRadius: 'Glow Radius',
    rieActionHsl: 'Hue',
    rieActionHsl: 'Saturation',
    rieActionHsl: 'Lightness',
    rieActionPosterize: 'Levels',

    viewSourceDialogCancelButton: 'Close',
    viewSourceDialogOKButton: 'Apply source code',
    viewSourceDialogTitle: 'Content source code',
    viewSourceTitle: 'View/edit source code'
});
;
// File end: c:\work\modules\raptor-gold\raptor-locales/en.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/../TOP
/**
 * Raptor Editor HTML5 WYSIWYG Editor
 * http://www.raptor-editor.com
 *
 * Copyright 2011-2013, PAN Media Limited. All rights reserved.
 * http://www.panmedia.co.nz
 *
 * Released under the GPL license.
 * See LICENSE for more information.
 *
 * All other components and libraries redistributed in this package are subject
 * to their respective copyright notices and licenses.
 * See THIRD-PARTY COMPONENTS AND LIBRARIES for more information.
 * All images and icons redistributed in this package are subject
 * to their respective copyright notices and licenses.
 * See IMAGES AND ICONS for more information.
 */
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/../TOP
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/action.js
/**
 * @fileOverview Action helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Previews an action on an element.
 * @todo check descriptions for accuracy
 * @param {Object} previewState The saved state of the target.
 * @param {jQuery} target Element to have the preview applied to it.
 * @param {function} action The action to be previewed.
 * @returns {Object} ??
 */
function actionPreview(previewState, target, action) {
    // <strict/>

    actionPreviewRestore(previewState, target);

    previewState = stateSave(target);
    action();
    rangy.getSelection().removeAllRanges();
    return previewState;
}

/**
 * Changes an element back to its saved state and returns that element.
 * @todo check descriptions please.
 * @param {Object} previewState The previously saved state of the target.
 * @param {jQuery} target The element to have it's state restored.
 * @returns {jQuery} The restored target.
 */
function actionPreviewRestore(previewState, target) {
    if (previewState) {
        var state = stateRestore(target, previewState);
        if (state.ranges) {
            rangy.getSelection().setRanges(state.ranges);
        }
        return state.element;
    }
    return target;
}

/**
 * Applies an action.
 * @todo types for params
 * @param {type} action The action to apply.
 * @param {type} history
 */
function actionApply(action, history) {
    action();
}

/**
 * Undoes an action.
 *
 * @returns {undefined}
 */
function actionUndo() {

}

/**
 * Redoes an action.
 *
 * @returns {undefined}
 */
function actionRedo() {

}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/action.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/clean.js
/**
 * @fileOverview Cleaning helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen - david@panmedia.co.nz
 * @author Michael Robinson - michael@panmedia.co.nz
 */

/**
 * Replaces elements in another elements. E.g.
 *
 * @example
 * cleanReplaceElements('.content', {
 *     'b': '<strong/>',
 *     'i': '<em/>',
 * });
 *
 * @param  {jQuery|Element|Selector} selector The element to be find and replace in.
 * @param  {Object} replacements A map of selectors to replacements. The replacement
 *   can be a jQuery object, an element, or a selector.
 */
function cleanReplaceElements(selector, replacements) {
    for (var find in replacements) {
        var replacement = replacements[find];
        var i = 0;
        var found = false;
        do {
            found = $(selector).find(find);
            if (found.length) {
                found = $(found.get(0));
                var clone = $(replacement).clone();
                clone.html(found.html());
                clone.attr(elementGetAttributes(found));
                found.replaceWith(clone);
            }
        } while(found.length);
    }
}

/**
 * Unwrap function. Currently just wraps jQuery.unwrap() but may be extended in future.
 *
 * @param  {jQuery|Element|Selector} selector The element to unwrap.
 */
function cleanUnwrapElements(selector) {
    $(selector).unwrap();
}

/**
 * Takes a supplied element and removes all of the empty attributes from it.
 *
 * @param {jQuery} element This is the element to remove all the empty attributes from.
 * @param {array} attributes This is an array of the elements attributes.
 */
function cleanEmptyAttributes(element, attributes) {
    // <strict/>

    for (i = 0; i < attributes.length; i++) {
        if (!$.trim(element.attr(attributes[i]))) {
            element.removeAttr(attributes[i]);
        }
        element
            .find('[' + attributes[i] + ']')
            .filter(function() {
                return $.trim($(this).attr(attributes[i])) === '';
            }).removeAttr(attributes[i]);
    }
}


/**
 * Remove comments from element.
 *
 * @param  {jQuery} parent The jQuery element to have comments removed from.
 * @return {jQuery} The modified parent.
 */
function cleanRemoveComments(parent) {
    // <strict/>

    parent.contents().each(function() {
        if (this.nodeType == Node.COMMENT_NODE) {
            $(this).remove();
        }
    });
    parent.children().each(function() {
        cleanRemoveComments($(this));
    });
    return parent;
}


/**
 * Removed empty elements whose tag name matches the list of supplied tags.
 *
 * @param  {jQuery} parent The jQuery element to have empty element removed from.
 * @param  {String[]} tags The list of tags to clean.
 * @return {jQuery} The modified parent.
 */
function cleanEmptyElements(parent, tags) {
    // <strict/>
    var found;
    // Need to loop incase removing an empty element, leaves another one.
    do {
        found = false;
        parent.find(tags.join(',')).each(function() {
            if ($.trim($(this).html()) === '') {
                $(this).remove();
                found = true;
            }
        });
    } while (found);
    return parent;
}

/**
 * Wraps any text nodes in the node with the supplied tag. This does not scan child elements.
 *
 * @param  {Node} node
 * @param  {String} tag The tag to use from wrapping the text nodes.
 */
function cleanWrapTextNodes(node, tag) {
    // <strict/>

    var textNodes = nodeFindTextNodes(node);
    for (var i = 0, l = textNodes.length; i < l; i++) {
        var clone = textNodes[i].cloneNode(),
            wrapper = document.createElement(tag);
        wrapper.appendChild(clone);
        node.insertBefore(wrapper, textNodes[i]);
        node.removeChild(textNodes[i]);
    }
}

function cleanUnnestElement(element, selector) {
    var found;
    do {
        found = false;
        $(element).find(selector).each(function() {
            if ($(this).parent().is(selector)) {
                $(this).unwrap();
                found = true;
            }
        });
    } while (found);

}

/**
 * Generic clean function to remove misc elements.
 *
 * @param  {jQuery} element
 */
function clean(element) {
    $(element).find('.rangySelectionBoundary').remove();
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/clean.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/dock.js
/**
 * @fileOverview Docking to screen and element helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Docks a specified element to the screen.
 *
 * @param {jQuery} element The element to dock.
 * @param {string} options Any options to further specify the docking state.
 * @returns {Object} An object containing the docked element, a spacer div and the style state.
 */
function dockToScreen(element, options) {
    var position,
        spacer = $('<div>')
            .addClass('spacer');
    if (options.position === 'top') {
        position = {
            position: 'fixed',
            top: options.under ? $(options.under).outerHeight() : 0,
            left: 0,
            right: 0
        };
        if (options.spacer) {
            if (options.under) {
                spacer.insertAfter(options.under);
            } else {
                spacer.prependTo('body');
            }
        }
    } else if (options.position === 'topLeft') {
        position = {
            position: 'fixed',
            top: options.under ? $(options.under).outerHeight() : 0,
            left: 0
        };
        if (options.spacer) {
            if (options.under) {
                spacer.insertAfter(options.under);
            } else {
                spacer.prependTo('body');
            }
        }
    } else if (options.position === 'topRight') {
        position = {
            position: 'fixed',
            top: options.under ? $(options.under).outerHeight() : 0,
            right: 0
        };
        if (options.spacer) {
            if (options.under) {
                spacer.insertAfter(options.under);
            } else {
                spacer.prependTo('body');
            }
        }
    } else if (options.position === 'bottom') {
        position = {
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0
        };
        if (options.spacer) {
            spacer.appendTo('body');
        }
    } else if (options.position === 'bottomLeft') {
        position = {
            position: 'fixed',
            bottom: 0,
            left: 0
        };
        if (options.spacer) {
            spacer.appendTo('body');
        }
    } else if (options.position === 'bottomRight') {
        position = {
            position: 'fixed',
            bottom: 0,
            right: 0
        };
        if (options.spacer) {
            spacer.appendTo('body');
        }
    }
    var styleState = styleSwapState(element, position);
    spacer.css('height', element.outerHeight());
    setTimeout(function() {
        spacer.css('height', element.outerHeight());
    }, 300);
    return {
        dockedElement: element,
        spacer: spacer,
        styleState: styleState
    };
}

/**
 * Undocks a docked element from the screen.
 * @todo not sure of description for dockState
 * @param {jQuery} dockState
 * @returns {unresolved}
 */
function undockFromScreen(dockState) {
    styleRestoreState(dockState.dockedElement, dockState.styleState);
    dockState.spacer.remove();
    return dockState.dockedElement.detach();
}

/**
 * Docks an element to a another element.
 *
 * @param {jQuery} elementToDock This is the element to be docked.
 * @param {jQuery} dockTo This is the element to which the elementToDock will be docked to.
 * @param {string} options These are any options to refine the docking position.
 * @returns {Object} An object containing the docked element, what it has been docked to, and their style states.
 */
function dockToElement(elementToDock, dockTo, options) {
    var wrapper = dockTo
            .wrap('<div>')
            .parent(),
        innerStyleState = styleSwapWithWrapper(wrapper, dockTo, {
            'float': 'none',
            display: 'block',
            clear: 'none',
            position: 'static',

            /* Margin */
            margin: 0,
            marginLeft: 0,
            marginRight: 0,
            marginTop: 0,
            marginBottom: 0,

            /* Padding */
            padding: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            paddingBottom: 0,

            outline: 0,
            width: 'auto',
            border: 'none'
        }),
        dockedElementStyleState = styleSwapState(elementToDock, {
            position: 'static'
        });
    wrapper
        .prepend(elementToDock)
        .addClass(options.wrapperClass ? options.wrapperClass : '');
    return {
        dockedElement: elementToDock,
        dockedTo: dockTo,
        innerStyleState: innerStyleState,
        dockedElementStyleState: dockedElementStyleState
    };
}

/**
 * Undocks an element from the screen.
 *@todo not sure of description for dockState
 * @param {jQuery} dockState
 * @returns {Object} The undocked element.
 */
function undockFromElement(dockState) {
    styleRestoreState(dockState.dockedTo, dockState.innerStyleState);
    styleRestoreState(dockState.dockedElement, dockState.dockedElementStyleState);
    var dockedElement = dockState.dockedElement.detach();
    dockState.dockedTo.unwrap();
    return dockedElement;
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/dock.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/element.js
/**
 * @fileOverview Element manipulation helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Remove all but the allowed attributes from the parent.
 *
 * @param {jQuery} parent The jQuery element to cleanse of attributes.
 * @param {String[]|null} allowedAttributes An array of allowed attributes.
 * @return {jQuery} The modified parent.
 */
function elementRemoveAttributes(parent, allowedAttributes) {
    parent.children().each(function() {
        var stripAttributes = $.map(this.attributes, function(item) {
            if ($.inArray(item.name, allowedAttributes) === -1) {
                return item.name;
            }
        });
        var child = $(this);
        $.each(stripAttributes, function(i, attributeName) {
            child.removeAttr(attributeName);
        });
        element.removeAttributes($(this), allowedAttributes);
    });
    return parent;
}

/**
 * Sets the z-index CSS property on an element to 1 above all its sibling elements.
 *
 * @param {jQuery} element The jQuery element to have it's z index increased.
 */
function elementBringToTop(element) {
    var zIndex = 1;
    element.siblings().each(function() {
        var z = $(this).css('z-index');
        if (!isNaN(z) && z > zIndex) {
            zIndex = z + 1;
        }
    });
    element.css('z-index', zIndex);
}

/**
 * Retrieve outer html from an element.
 *
 * @param  {jQuery} element The jQuery element to retrieve the outer HTML from.
 * @return {String} The outer HTML.
 */
function elementOuterHtml(element) {
    return element.clone().wrap('<div/>').parent().html();
}

/**
 * Retrieve outer text from an element.
 *
 * @param  {jQuery} element The jQuery element to retrieve the outer text from.
 * @return {String} The outer text.
 */
function elementOuterText(element) {
    return element.clone().wrap('<div/>').parent().text();
}

/**
 * Determine whether element is block.
 *
 * @param  {Element} element The element to test.
 * @return {Boolean} True if the element is a block element
 */
function elementIsBlock(element) {
    return elementDefaultDisplay(element.tagName) === 'block';
}

/**
 * Determine whether element contains a block element.
 *
 * @param  {Element} element
 * @return {Boolean} True if the element contains a block element, false otherwise.
 */
function elementContainsBlockElement(element) {
    var containsBlock = false;
    element.contents().each(function() {
        if (!typeIsTextNode(this) && elementIsBlock(this)) {
            containsBlock = true;
            return;
        }
    });
    return containsBlock;
}

/**
 * Determine whether element is inline or block.
 *
 * @see http://stackoverflow.com/a/2881008/187954
 * @param  {string} tag Lower case tag name, e.g. 'a'.
 * @return {string} Default display style for tag.
 */
function elementDefaultDisplay(tag) {
    var cStyle,
        t = document.createElement(tag),
        gcs = "getComputedStyle" in window;

    document.body.appendChild(t);
    cStyle = (gcs ? window.getComputedStyle(t, "") : t.currentStyle).display;
    document.body.removeChild(t);

    return cStyle;
}

/**
 * Check that the given element is one of the the given tags.
 *
 * @param  {jQuery|Element} element The element to be tested.
 * @param  {Array}  validTags An array of valid tag names.
 * @return {Boolean} True if the given element is one of the give valid tags.
 */
function elementIsValid(element, validTags) {
    return -1 !== $.inArray($(element)[0].tagName.toLowerCase(), validTags);
}

/**
 * According to the given array of valid tags, find and return the first invalid
 * element of a valid parent. Recursively search parents until the wrapper is
 * encountered.
 *
 * @param  {Node} element
 * @param  {string[]} validTags
 * @param  {Element} wrapper
 * @return {Node}           [description]
 */
function elementFirstInvalidElementOfValidParent(element, validTags, wrapper) {
    // <strict/>
    var parent = element.parentNode;
    if (parent[0] === wrapper[0]) {
        // <strict/>
        return element;
    }
    if (elementIsValid(parent, validTags)) {
        return element;
    }
    return elementFirstInvalidElementOfValidParent(parent, validTags, wrapper);
}

/**
 * Calculate and return the visible rectangle for the element.
 *
 * @param  {jQuery|Element} element The element to calculate the visible rectangle for.
 * @return {Object} Visible rectangle for the element.
 */
function elementVisibleRect(element) {
    // <strict/>
    element = $(element);

    var rect = {
        top: Math.round(element.offset().top),
        left: Math.round(element.offset().left),
        width: Math.round(element.outerWidth()),
        height: Math.round(element.outerHeight())
    };


    var scrollTop = $(window).scrollTop();
    var windowHeight = $(window).height();
    var scrollBottom = scrollTop + windowHeight;
    var elementBottom = Math.round(rect.height + rect.top);

    // If top & bottom of element are within the viewport, do nothing.
    if (scrollTop < rect.top && scrollBottom > elementBottom) {
        return rect;
    }

    // Top of element is outside the viewport
    if (scrollTop > rect.top) {
        rect.top = scrollTop;
    }

    // Bottom of element is outside the viewport
    if (scrollBottom < elementBottom) {
        rect.height = scrollBottom - rect.top;
    } else {
        // Bottom of element inside viewport
        rect.height = windowHeight - (scrollBottom - elementBottom);
    }

    return rect;
}

/**
 * Returns a map of an elements attributes and values. The result of this function
 * can be passed directly to $('...').attr(result);
 *
 * @param  {jQuery|Element|Selector} element The element to get the attributes from.
 * @return {Object} A map of attribute names mapped to their values.
 */
function elementGetAttributes(element) {
    var attributes = $(element).get(0).attributes,
        result = {};
    for (var i = 0, l = attributes.length; i < l; i++) {
        result[attributes[i].name] = attributes[i].value;
    }
    return result;
}

/**
 * Gets the styles of an element.
 * @todo the type for result.
 * FIXME: this function needs reviewing.
 * @param {jQuerySelector|jQuery|Element} element This is the element to get the style from.
 * @returns {unresolved} The style(s) of the element.
 */
function elementGetStyles(element) {
    var result = {};
    var style = window.getComputedStyle(element[0], null);
    for (var i = 0; i < style.length; i++) {
        result[style.item(i)] = style.getPropertyValue(style.item(i));
    }
    return result;
}

/**
 * Wraps the inner content of an element with a tag.
 *
 * @param {jQuerySelector|jQuery|Element} element The element(s) to wrap.
 * @param {String} tag The wrapper tag name
 * @returns {jQuery} The wrapped element.
 */
function elementWrapInner(element, tag) {
    var result = new jQuery();
    selectionSave();
    for (var i = 0, l = element.length; i < l; i++) {
        var wrapper = $('<' + tag + '/>').html($(element[i]).html());
        element.html(wrapper);
        result.push(wrapper[0]);
    }
    selectionRestore();
    return result;
}

/**
 * Toggles the styles of an element.
 *
 * FIXME: this function needs reviewing
 * @public @static
 * @param {jQuerySelector|jQuery|Element} element The jQuery element to have it's style changed.
 * @param {type} styles The styles to add or remove from the element.
 * @returns {undefined}
 */
function elementToggleStyle(element, styles) {
    $.each(styles, function(property, value) {
        if ($(element).css(property) === value) {
            $(element).css(property, '');
        } else {
            $(element).css(property, value);
        }
    });
}

/**
 * Swaps the styles of two elements.
 *
 * @param {jQuery|Element} element1 The element for element 2 to get its styles from.
 * @param {jQuery|Element} element2 The element for element 1 to get its styles from.
 * @param {Object} style The style to be swapped between the two elements.
 */
function elementSwapStyles(element1, element2, style) {
    for (var name in style) {
        element1.css(name, element2.css(name));
        element2.css(name, style[name]);
    }
}

/**
 * Checks if an element is empty.
 *
 * @param {Element} element The element to be checked.
 * @returns {Boolean} Returns true if element is empty.
 */
function elementIsEmpty(element) {
    // <strict/>

    // Images and elements containing images are not empty
    if (element.is('img') || element.find('img').length) {
        return false;
    }
    if ((/&nbsp;/).test(element.html())) {
        return false;
    }
    return element.text() === '';
}

/**
 * Positions an element underneath another element.
 *
 * @param {jQuery} element Element to position.
 * @param {jQuery} under Element to position under.
 */
function elementPositionUnder(element, under) {
    var pos = $(under).offset(),
        height = $(under).outerHeight();
    $(element).css({
        top: (pos.top + height - $(window).scrollTop()) + 'px',
        left: pos.left + 'px'
    });
}

/**
 * Removes the element from the DOM to manipulate it using a function passed to the method, then replaces it back to it's origional position.
 *
 * @todo desc and type for manip
 * @param {jQuery|Element} element The element to be manipulated.
 * @param {type} manip A function used to manipulate the element i think.
 */
function elementDetachedManip(element, manip) {
    var parent = $(element).parent();
    $(element).detach();
    manip(element);
    parent.append(element);
}

/**
 * Finds the closest parent, up to a limit element, to the supplied element that is not an display inline or null.
 * If the parent element is the same as the limit element then it returns null.
 *
 * @param {jQuery} element The element to find the closest parent of.
 * @param {jQuery} limitElement The element to stop looking for the closest parent at.
 * @returns {jQuery} Closest element that is not display inline or null, or null if the parent element is the same as the limit element.
 */
function elementClosestBlock(element, limitElement) {
    // <strict/>
    while (element.length > 0 &&
        element[0] !== limitElement[0] &&
        (element[0].nodeType === Node.TEXT_NODE || element.css('display') === 'inline')) {
        element = element.parent();
    }
    if (element[0] === limitElement[0]) {
        return null;
    }
    return element;
}

/**
 * Generates a unique id.
 *
 * @returns {String} The unique id.
 */
function elementUniqueId() {
    var id = 'ruid-' + new Date().getTime() + '-' + Math.floor(Math.random() * 100000);
    while ($('#' + id).length) {
        id = 'ruid-' + new Date().getTime() + '-' + Math.floor(Math.random() * 100000);
    }
    return id;
}

/**
 * Changes the tags on a given element.
 *
 * @todo not sure of details of return
 * @param {jQuerySelector|jQuery|Element} element The element(s) to have it's tags changed
 * @param {Element} newTag The new tag for the element(s)
 * @returns {Element}
 */
function elementChangeTag(element, newTag) {
    // <strict/>
    var tags = [];
    for (var i = element.length - 1; 0 <= i ; i--) {
        var node = document.createElement(newTag);
        node.innerHTML = element[i].innerHTML;
        $.each(element[i].attributes, function() {
            $(node).attr(this.name, this.value);
        });
        $(element[i]).after(node).remove();
        tags[i] = node;
    }
    return $(tags);
}

/**
 * Positions an element over top of another element.
 *  - If the other element is big, then the element is positioned in the center of the visible part of the other element.
 *  - If the other element is small and not at the top of the screen, the other element is positioned at the top of the other element.
 *  - If the other element is small and not is at the top of the screen, the other element is positioned at the bottom of the other element.
 *
 * @param {Element} element The element to position.
 * @param {Element} over The element to position over.
 */
function elementPositionOver(element, over) {
    if (element.outerHeight() > over.outerHeight() - 20) {
        var visibleRect = elementVisibleRect(over),
            offset = over.offset();
        element.css({
            position: 'absolute',
            // Calculate offset center for the element
            top:  offset.top - element.outerHeight(),
            left: visibleRect.left + ((visibleRect.width / 2)  - (element.outerWidth()  / 2))
        });
    } else {
        var visibleRect = elementVisibleRect(over);
        element.css({
            position: 'absolute',
            // Calculate offset center for the element
            top:  visibleRect.top  + ((visibleRect.height / 2) - (element.outerHeight() / 2)),
            left: visibleRect.left + ((visibleRect.width / 2)  - (element.outerWidth()  / 2))
        });
    }
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/element.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/fragment.js
/**
 * @fileOverview DOM fragment manipulation helper functions
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Convert a DOMFragment to an HTML string. Optionally wraps the string in a tag.
 * @todo type for domFragment and tag.
 * @param {type} domFragment The fragment to be converted to a HTML string.
 * @param {type} tag The tag that the string may be wrapped in.
 * @returns {String} The DOMFragment as a string, optionally wrapped in a tag.
 */
function fragmentToHtml(domFragment, tag) {
    var html = '';
    // Get all nodes in the extracted content
    for (var j = 0, l = domFragment.childNodes.length; j < l; j++) {
        var node = domFragment.childNodes.item(j);
        var content = node.nodeType === Node.TEXT_NODE ? node.nodeValue : elementOuterHtml($(node));
        if (content) {
            html += content;
        }
    }
    if (tag) {
        html = $('<' + tag + '>' + html + '</' + tag + '>');
        html.find('p').wrapInner('<' + tag + '/>');
        html.find('p > *').unwrap();
        html = $('<div/>').html(html).html();
    }
    return html;
}

/**
 * Insert a DOMFragment before an element and wraps them both in a tag.
 *
 * @public @static
 * @param {DOMFragment} domFragment This is the DOMFragment to be inserted.
 * @param {jQuerySelector|jQuery|Element} beforeElement This is the element the DOMFragment is to be inserted before.
 * @param {String} wrapperTag This is the tag to wrap the domFragment and the beforeElement in.
 */
function fragmentInsertBefore(domFragment, beforeElement, wrapperTag) {
    // Get all nodes in the extracted content
    for (var j = 0, l = domFragment.childNodes.length; j < l; j++) {
        var node = domFragment.childNodes.item(j);
        // Prepend the node before the current node
        var content = node.nodeType === Node.TEXT_NODE ? node.nodeValue : $(node).html();
        if (content) {
            $('<' + wrapperTag + '/>')
                .html($.trim(content))
                .insertBefore(beforeElement);
        }
    }
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/fragment.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/list.js
/**
 * @fileOverview List manipulation helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Determines the appropriate list toggling action then performs it.
 *
 * @param {String} listType This is the type of list to check the selection against.
 * @param {Object} listItem This is the list item to use as the selection.
 * @param {Element} wrapper Element containing the entire action, may not be modified.
 */
function listToggle(listType, listItem, wrapper) {
    if (wrapper.html().trim() === '') {
        return;
    }
    if (!selectionExists()) {
        return;
    }
    if (listShouldConvertType(listType, listItem, wrapper)) {
        console.log('listShouldConvertType');
        return listConvertListType(listType, listItem, wrapper);
    }
    if (listShouldUnwrap(listType, listItem)) {
        console.log('listShouldUnwrap');
        return listUnwrapSelection(listType, listItem, wrapper);
    }
    if (listShouldWrap(listType, listItem, wrapper)) {
        console.log('listShouldWrap');
        return listWrapSelection(listType, listItem, wrapper);
    }
}

/**
 * @param  {String} listType
 * @param  {String} listItem
 * @return {Boolean}
 */
function listShouldUnwrap(listType, listItem) {
    var selectedElements = $(selectionGetElements());
    if (selectedElements.is(listType)) {
        return true;
    }
    if (listType === 'blockquote' && !selectedElements.parent().is(listType)) {
        return false;
    }
    if (selectedElements.is(listItem) && selectedElements.parent().is(listType)) {
        return true;
    }
    if (selectedElements.parentsUntil(listType, listItem).length) {
        return true;
    }
    return false;
}

/**
 * @param  {String} listType
 * @param  {String} listItem
 * @return {Boolean}
 */
function listShouldConvertType(listType, listItem, wrapper) {
    var range = selectionRange();
    var commonAncestor = $(rangeGetCommonAncestor(range));
    if (rangeIsEmpty(range)) {
        var closestListItem = commonAncestor.closest(listItem, wrapper);
        if (closestListItem.length) {
            rangeExpandTo(range, [closestListItem]);
        } else {
            rangeExpandToParent(range);
        }
    }
    commonAncestor = $(rangeGetCommonAncestor(range));

    // Do not convert blockquotes that have partial selections
    if (listType === 'blockquote' &&
        !rangeContainsNode(range, commonAncestor.get(0))) {
        return false;
    }

    if ($(commonAncestor).is(listItem) &&
        !$(commonAncestor).parent().is(listType)) {
        return true;
    }
    return false;
}

function listShouldWrap(listType, listItem, wrapper) {
    if (listType === 'blockquote') {
        return elementIsValid(wrapper, listValidBlockQuoteParents);
    }
    return elementIsValid(wrapper, listValidUlOlParents);
}

/**
 * @type {String[]} Tags allowed within an li.
 */
var listValidLiChildren = [
    'a', 'abbr','acronym', 'applet', 'b', 'basefont', 'bdo', 'big', 'br', 'button',
    'cite', 'code', 'dfn', 'em', 'font', 'i', 'iframe', 'img', 'input', 'kbd',
    'label', 'map', 'object', 'p', 'q', 's',  'samp', 'select', 'small', 'span',
    'strike', 'strong', 'sub', 'sup', 'textarea', 'tt', 'u', 'var',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
];

/**
 * @type {String][]} Tags ol & ul are allowed within.
 */
var listValidUlOlParents =  [
    'article', 'nav', 'section', 'footer', 'blockquote', 'body', 'button',
    'center', 'dd', 'div', 'fieldset', 'form', 'iframe', 'li', 'noframes',
    'noscript', 'object', 'td', 'th'
];

/**
 * @type {String][]} Tags blockquote is allowed within.
 */
var listValidBlockQuoteParents = [
    'body', 'center', 'dd', 'div', 'dt', 'fieldset', 'form', 'iframe', 'li', 'td', 'th'
];

 var listValidPChildren = [
    'a', 'abbr', 'acronym', 'applet', 'b', 'basefont', 'bdo', 'big', 'br',
    'button', 'cite', 'code', 'dfn', 'em', 'font', 'i', 'iframe', 'img',
    'input', 'kbd', 'label', 'map', 'object', 'q', 's', 'samp', 'script',
    'select', 'small', 'span', 'strike', 'strong', 'sub', 'sup', 'textarea',
    'u'
];

var listValidPParents = [
    'address', 'blockquote', 'body', 'button', 'center', 'dd', 'div', 'fieldset',
    'form', 'iframe', 'li', 'noframes', 'noscript', 'object', 'td', 'th'
];

/**
 * Convert tags invalid within the context of listItem.
 *
 * @param  {Element} list
 * @param  {String} listItem
 * @param  {String[]} validChildren
 */
function listEnforceValidChildren(list, listItem, validChildren, removeEmpty) {
    removeEmpty = typeof removeEmpty === 'undefined' ? true : removeEmpty;
    // <strict/>
    var removeEmptyElements = function(node) {
        if ($(node).is('img') || $(node).find('img').length) {
            return;
        }
        if (!$(node).text().trim()) {
            $(node).remove();
            return true;
        }
    };

    list.find('> ' + listItem).each(function() {
        if (removeEmpty && removeEmptyElements(this)) {
            return true;
        }
        $(this).contents().each(function() {
            if (removeEmpty && removeEmptyElements(this)) {
                return true;
            }
            if (listItem === 'p') {
                if (!typeIsTextNode(this) &&
                    !elementIsValid(this, validChildren)) {
                    $(this).contents().unwrap();
                    return true;
                }
            } else {
                // Do nothing for bare text nodes
                if (typeIsTextNode(this)) {
                    return true;
                }
                // Unwrap the invalid element and remove it if empty
                if (!elementIsValid(this, validChildren)) {
                    $(this).contents().unwrap();
                    removeEmptyElements(this);
                    return true;
                }
            }
        });
    });
}

/**
 * Wraps the selected element(s) in list tags.
 *
 * @param {String} listType The type of list that the selection is to be transformed into.
 * @param {String} listItem The list item to be used in creating the list.
 * @param {Element} wrapper Element containing the entire action, may not be modified.
 */
function listWrapSelection(listType, listItem, wrapper) {
    var range = selectionRange(),
        commonAncestor = rangeGetCommonAncestor(range),
        startContainer = range.startContainer,
        endContainer = range.endContainer;


    var contents = range.extractContents(),
        html = fragmentToHtml(contents),
        nodes = nodeFromHtml('<' + listType + '>' + html + '</' + listType + '>'),
        elements = $(nodes);
    elements.children().wrap('<li>')
    selectionReplace(elements);
    return;

    /**
     * <wrapper>{}<p>Some content</p></wrapper>
     */
    if (rangeIsEmpty(range) && commonAncestor === wrapper.get(0)) {
        return;
    }
    console.log(range.startContainer);

    // Having a <td> fully selected is a special case: without intervention
    // the surrounding <table> would be split, with a <listType> inserted between
    // the two <tables>.
    if ($(commonAncestor).is('td,th') || commonAncestor === wrapper.get(0)) {
        rangeSelectElementContent(range, commonAncestor);

    // Other cases require checking if the range contains the full text of the
    // common ancestor. In these cases the commonAncestor should be selected
    } else if (rangeContainsNodeText(range, commonAncestor)) {
        rangeSelectElement(range, $(commonAncestor));
    }

    if (rangeIsEmpty(range)) {
        range.selectNode(elementClosestBlock($(commonAncestor), wrapper).get(0));
    }

    var contents = listConvertItemsForList(fragmentToHtml(range.extractContents()), listItem);
    var validParents = listType === 'blockquote' ? listValidBlockQuoteParents : listValidUlOlParents;
    var uniqueId = elementUniqueId();
    var replacementHtml = '<' + listType + ' id="' + uniqueId + '">' + $('<div/>').html(contents).html() + '</' + listType + '>';

    rangeReplaceWithinValidTags(range, replacementHtml, wrapper, validParents);

    var replacement = $('#' + uniqueId).removeAttr('id');
    var validChildren = listType === 'blockquote' ? listValidPChildren : listValidLiChildren;
    listEnforceValidChildren(replacement, listItem, validChildren);
    if (replacement.is(listType)) {
        var child = replacement.find(' > ' + listItem);
        if (child.length === 0) {
            replacement = $(document.createElement('li')).appendTo(replacement);
        }
    }
    selectionSelectInner(replacement.get(0));
}

/**
 * Wrap non block elements in <p> tags, then in <li>'s.
 *
 * @param  {String} items HTML to be prepared.
 * @param  {String} listItem
 * @return {String} Prepared HTML.
 */
function listConvertItemsForList(items, listItem) {
    items = $('<div/>').html(items);

    if (!elementContainsBlockElement(items)) {
        // Do not double wrap p's
        if (listItem === 'p') {
            return '<' + listItem + '>' + items.html() + '</' + listItem + '>';
        }
        return '<' + listItem + '><p>' + items.html() + '</p></' + listItem + '>';
    }

    items.contents().each(function() {
        if ($(this).is('img')) {
            return true;
        }
        if (elementIsEmpty($(this))) {
            return $(this).remove();
        }
        $(this).wrap('<' + listItem + '/>');
        if (!elementIsBlock(this)) {
            $(this).wrap('<p>');
        }
    });

    return items.html();
}

/**
 * Convert the given list item to the given tag. If the listItem has children,
 * convert them and unwrap the containing list item.
 *
 * @param  {Element} listItem
 * @param  {string} listType
 * @param  {string} tag
 * @param  {string[]} validTagChildren Array of valid child tag names.
 * @return {Element|null} Result of the final conversion.
 */
function listConvertListItem(listItem, listType, tag) {
     // <strict/>
    var listItemChildren = listItem.contents();
    if (listItemChildren.length) {
        listItemChildren.each(function() {
            if ($(this).text().trim() === '') {
                return $(this).remove();
            }
            if (typeIsTextNode(this) || !elementIsBlock(this)) {
                return $(this).wrap('<' + tag + '>');
            }
        });
        return listItem.contents().unwrap();
    } else {
        return elementChangeTag(listItem, tag);
    }
}

/**
 * Convert listItems to paragraphs and unwrap the containing listType.
 *
 * @param  {Element} list
 * @param  {string} listItem
 * @param  {string} listType
 */
function listUnwrap(list, listItem, listType) {
    // <strict/>
    var convertedItem = null;
    list.find(listItem).each(function() {
        listConvertListItem($(this), listType, 'p');
    });
    return list.contents().unwrap();
}

/**
 * Tidy lists that have been modified, including removing empty listItems and
 * removing the list if it is completely empty.
 *
 * @param  {Element} list
 * @param  {string} listType
 * @param  {string} listItem
 */
function listTidyModified(list, listType, listItem) {
    // <strict/>
    listRemoveEmptyItems(list, listType, listItem);
    listRemoveEmpty(list, listType, listItem);
}

/**
 * Remove empty listItems from within the list.
 *
 * @param  {Element} list
 * @param  {string} listType
 * @param  {string} listItem
 */
function listRemoveEmptyItems(list, listType, listItem) {
    // <strict/>
    if (!list.is(listType)) {
        return;
    }
    list.find(listItem).each(function() {
        if ($(this).text().trim() === '') {
            $(this).remove();
        }
    });
}

/**
 * Remove list if it is of listType and empty.
 *
 * @param  {Element} list
 * @param  {string} listType
 * @param  {string} listItem
 */
function listRemoveEmpty(list, listType, listItem) {
    // <strict/>
    if (!list.is(listType)) {
        return;
    }
    if (list.text().trim() === '') {
        list.remove();
    }
}

/**
 * Unwrap the list items between the range's startElement & endElement.
 *
 * @param  {RangyRange} range
 * @param  {string} listType
 * @param  {string} listItem
 * @param  {Element} wrapper
 */
function listUnwrapSelectedListItems(range, listType, listItem, wrapper) {
    var startElement = rangeGetStartElement(range);
    var endElement = rangeGetEndElement(range);
    var replacementPlaceholderId = elementUniqueId();

    rangeExpandToParent(range);
    var breakOutValidityList = listType === 'blockquote' ? listValidBlockQuoteParents : listValidPParents;
    breakOutValidityList = $.grep(breakOutValidityList, function(item) {
        return item !== 'li';
    });
    rangeReplaceWithinValidTags(range, $('<p/>').attr('id', replacementPlaceholderId), wrapper, breakOutValidityList);

    var replacementPlaceholder = $('#' + replacementPlaceholderId);

    listTidyModified(replacementPlaceholder.prev(), listType, listItem);
    listTidyModified(replacementPlaceholder.next(), listType, listItem);

    var toUnwrap = [startElement];
    if (startElement !== endElement) {
        $(startElement).nextUntil(endElement).each(function() {
            if (this === endElement) {
                return;
            }
            toUnwrap.push(this);
        });
        toUnwrap.push(endElement);
    }

    toUnwrap.reverse();

    $(toUnwrap).each(function() {
        replacementPlaceholder.after(this);
        listConvertListItem($(this), listType, 'p');
    });

    replacementPlaceholder.remove();

    return listEnforceValidChildren($(rangeGetCommonAncestor(range)), listItem, listValidLiChildren);
}

/**
 * Unwraps the selected list item(s) and puts it into <p> tags.
 *
 * @param {Object} listItem
 */
function listUnwrapSelection(listType, listItem, wrapper) {
    var range = selectionRange();
    if (rangeIsEmpty(range)) {
        rangeExpandTo(range, [listItem]);
    }

    var commonAncestor = $(rangeGetCommonAncestor(range));

    /**
     * Selection contains more than one <listItem>, or the whole <listType>
     */
    if (commonAncestor.is(listType)) {
        var startElement = rangeGetStartElement(range);
        var endElement = rangeGetEndElement(range);

        /**
         * {<listType>
         *     <listItem>list content</listItem>
         * </listType>}
         */
        if ($(endElement).is(listType) && $(startElement).is(listType)) {
            return listUnwrap(commonAncestor, listItem, listType);
        }

        /**
         * <listType>
         *     <listItem>{list content</listItem>
         *     <listItem>list content}</listItem>
         *     <listItem>list content</listItem>
         * </listType>
         */
         return listUnwrapSelectedListItems(range, listType, listItem, wrapper);
    }

    if (!commonAncestor.is(listItem)) {
        commonAncestor = commonAncestor.closest(listItem);
    }
    /**
     * <listType>
     *     <li>{list content}</li>
     * </listType>
     */
    if (!commonAncestor.prev().length && !commonAncestor.next().length) {
        return listUnwrap(commonAncestor.closest(listType), listItem, listType);
    }

    /**
     * <listType>
     *     <listItem>list content</listItem>
     *     <listItem>{list content}</listItem>
     *     <listItem>list content</listItem>
     * </listType>
     */
    if (commonAncestor.next().length && commonAncestor.prev().length) {
        return listUnwrapSelectedListItems(range, listType, listItem, wrapper);
    }

    /**
     * <listType>
     *     <listItem>{list content}</listItem>
     *     <listItem>list content</listItem>
     * </listType>
     */
    if (commonAncestor.next().length && !commonAncestor.prev().length) {
        commonAncestor.parent().before(listConvertListItem(commonAncestor, listType, 'p'));
        commonAncestor.remove();
        return;
    }

    /**
     * <listType>
     *     <listItem>list content</listItem>
     *     <listItem>{list content}</listItem>
     * </listType>
     */
    if (!commonAncestor.next().length && commonAncestor.prev().length) {
        commonAncestor.parent().after(listConvertListItem(commonAncestor, 'p', listType));
        commonAncestor.remove();
        return;
    }
}

function listConvertListType(listType, listItem, wrapper) {
    var range = selectionRange();
    if (rangeIsEmpty(range)) {
        rangeExpandTo(range, [listItem]);
    }

    var startElement = rangeGetStartElement(range);
    var endElement = rangeGetEndElement(range);
    var replacementPlaceholderId = elementUniqueId();

    rangeExpandToParent(range);
    var breakOutValidityList = $.grep(listValidPParents, function(item) {
        return item !== listItem;
    });
    rangeReplaceWithinValidTags(range, $('<p/>').attr('id', replacementPlaceholderId), wrapper, breakOutValidityList);

    var replacementPlaceholder = $('#' + replacementPlaceholderId);

    listTidyModified(replacementPlaceholder.prev(), listType, listItem);
    listTidyModified(replacementPlaceholder.next(), listType, listItem);

    var toUnwrap = [startElement];
    if (startElement !== endElement) {
        $(startElement).nextUntil(endElement).each(function() {
            if (this === endElement) {
                return;
            }
            toUnwrap.push(this);
        });
        toUnwrap.push(endElement);
    }

    toUnwrap.reverse();

    $(toUnwrap).each(function() {
        replacementPlaceholder.after(this);
    });
    replacementPlaceholder.remove();
    var convertedList = $(toUnwrap).wrap('<' + listType + '>').parent();

    return listEnforceValidChildren(convertedList, listItem, listValidLiChildren);
}

/**
 * Break the currently selected list, replacing the selection.
 *
 * @param  {String} listType
 * @param  {String} listItem
 * @param  {Element} wrapper
 * @param  {String|Element} replacement
 * @return {Element|Boolean} The replaced element, or false if replacement did not
 *                               occur.
 */
function listBreakByReplacingSelection(listType, listItem, wrapper, replacement) {
    var selectedElement = selectionGetElement();
    if (!selectedElement.closest(listItem).length) {
        return false;
    }

    var parentList = selectedElement.closest(listType);
    if (!parentList.length || wrapper.get(0) === parentList.get(0)) {
        return false;
    }

    selectionSelectToEndOfElement(selectedElement);
    selectionDelete();

    var top = $('<' + listType + '/>'),
        bottom = $('<' + listType + '/>'),
        middlePassed = false;
    parentList.children().each(function() {
        if (selectedElement.closest(listItem).get(0) === this) {
            middlePassed = true;
            top.append(this);
            return;
        }
        if (!middlePassed) {
            top.append(this);
        } else {
            bottom.append(this);
        }
    });
    parentList.replaceWith(top);
    replacement = $(replacement).appendTo($('body'));
    top.after(replacement, bottom);

    return replacement;
}

/**
 * Add a new list item below the selection. New list item contains content of original
 * list item from selection end to end of element.
 *
 * @param  {String} listType
 * @param  {String} listItem
 * @param  {Element} wrapper
 * @param  {String|Element} replacement
 * @return {Element|Boolean}
 */
function listBreakAtSelection(listType, listItem, wrapper) {
    var selectedElement = selectionGetElement();
    if (!selectedElement.closest(listItem).length) {
        return false;
    }

    selectionDelete();
    selectionSelectToEndOfElement(selectedElement);
    var html = selectionGetHtml();
    if (html.trim() === '') {
        html = '&nbsp;';
    }
    selectionDelete();

    if (selectedElement.text().trim() === '') {
        selectedElement.html('&nbsp;');
    }
    var newListItem = $('<' + listItem + '>').html(html);
    selectedElement.closest(listItem).after(newListItem);

    listEnforceValidChildren(selectedElement.closest(listType), listItem, listValidLiChildren, false);

    return newListItem;
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/list.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/node.js
/**
 * @fileOverview Find node parent helper function.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */


/**
 * Find the first parent of a node that is not a text node.
 *
 * @param {Node} node
 * @returns {Node}
 */
function nodeFindParent(node) {
    while (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode;
    }
    return node;
}

function nodeFindTextNodes(node) {
    var textNodes = [], whitespace = /^\s*$/;
    for (var i = 0, l = node.childNodes.length; i < l; i++) {
        if (node.childNodes[i].nodeType == Node.TEXT_NODE) {
            if (!whitespace.test(node.childNodes[i].nodeValue)) {
                textNodes.push(node.childNodes[i]);
            }
        }
    }
    return textNodes;
}

function nodeIsChildOf(child, parent) {
     var node = child.parentNode;
     while (node != null) {
         if (node == parent) {
             return true;
         }
         node = node.parentNode;
     }
     return false;
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/node.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/persist.js
/**
 * @fileOverview Storage helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Stores key-value data.
 * If local storage is already configured, retrieve what is stored and convert it to an array, otherwise create a blank array.
 * The value is then set in the array based on the key and the array is saved into local storage.
 * @todo desc and type for returns
 * @param {type} key The key for the data to be stored at
 * @param {type} value The data to be stored at the key.
 * @returns {persistSet} ??
 */
function persistSet(key, value) {
    if (localStorage) {
        var storage;
        if (localStorage.raptor) {
            storage = JSON.parse(localStorage.raptor);
        } else {
            storage = {};
        }
        storage[key] = value;
        localStorage.raptor = JSON.stringify(storage);
    }
}

/**
 * Gets the data stored at the supplied key.
 *
 * @param {type} key The key to get the stored data from.
 * @returns {Object} The data stored at the key.
 */
function persistGet(key) {
    if (localStorage) {
        var storage;
        if (localStorage.raptor) {
            storage = JSON.parse(localStorage.raptor);
        } else {
            storage = {};
        }
        return storage[key];
    }
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/persist.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/range.js
/**
 * @fileOverview Range manipulation helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Expands a range to to surround all of the content from its start container
 * to its end container.
 *
 * @param {RangyRange} range The range to expand.
 */
function rangeExpandToParent(range) {
    // <strict/>
    range.setStartBefore(range.startContainer);
    range.setEndAfter(range.endContainer);
}

/**
 * Ensure range selects entire element.
 *
 * @param  {RangyRange} range
 * @param  {Element} element
 */
function rangeSelectElement(range, element) {
    // <strict/>
    range.selectNode($(element)[0]);
}

function rangeSelectElementContent(range, element) {
    // <strict/>
    range.selectNodeContents($(element).get(0));
}

/**
 * Expand range to contain given elements.
 *
 * @param {RangyRange} range The range to expand.
 * @param {array} elements An array of elements to check the current range against.
 */
function rangeExpandTo(range, elements) {
    // <strict/>
    do {
        rangeExpandToParent(range);
        for (var i = 0, l = elements.length; i < l; i++) {
            if ($(range.commonAncestorContainer).is(elements[i])) {
                return;
            }
        }
    } while (range.commonAncestorContainer);
}

/**
 * Replaces the content of range with the given html.
 *
 * @param  {RangyRange} range The range to replace.
 * @param  {jQuery|String} html The html to use when replacing range.
 * @return {Node[]} Array of new nodes inserted.
 */
function rangeReplace(range, html) {
    // <strict/>

    var result = [],
        nodes = $('<div/>').append(html)[0].childNodes;
    range.deleteContents();
    if (nodes.length === undefined || nodes.length === 1) {
        range.insertNode(nodes[0].cloneNode(true));
    } else {
        $.each(nodes, function(i, node) {
            result.unshift(node.cloneNode(true));
            range.insertNodeAtEnd(result[0]);
        });
    }
    return result;
}

/**
 * Empties a supplied range of all the html tags.
 *
 * @param {RangyRange} range This is the range to remove tags from.
 * @returns {boolean} True if the range is empty.
 */
function rangeEmptyTag(range) {
    var html = rangeToHtml(range);
    if (typeof html === 'string') {
        html = html.replace(/([ #;&,.+*~\':"!^$[\]()=>|\/@])/g,'\\$1');
    }
    return stringHtmlStringIsEmpty(html);
}

/**
 * @param  {RangyRange} range
 * @return {Node} The range's start element.
 */
function rangeGetStartElement(range) {
    // <strict/>
    return nodeFindParent(range.startContainer);
}

/**
 * @param  {RangyRange} range
 * @return {Node} The range's end element.
 */
function rangeGetEndElement(range) {
    // <strict/>
    return nodeFindParent(range.endContainer);
}

/**
 * Returns a single selected range's common ancestor.
 * Works for single ranges only.
 *
 * @param {RangyRange} range
 * @return {Element} The range's common ancestor.
 */
function rangeGetCommonAncestor(range) {
    // <strict/>
    return nodeFindParent(range.commonAncestorContainer);
}

/**
 * Returns true if the supplied range is empty (has a length of 0)
 *
 * @public @static
 * @param {RangyRange} range The range to check if it is empty
 */
function rangeIsEmpty(range) {
    // <strict/>
    return range.startOffset === range.endOffset &&
           range.startContainer === range.endContainer;
}

/**
 * @param  {RangyRange} range
 * @param  {Node} node
 * @return {boolean} True if the range is entirely contained by the given node.
 */
function rangeIsContainedBy(range, node) {
    // <strict/>
    var nodeRange = range.cloneRange();
    nodeRange.selectNodeContents(node);
    return nodeRange.containsRange(range);
}

/**
 * @param  {RangyRange} range
 * @param  {Node} node
 * @return {Boolean} True if node is contained within the range, false otherwise.
 */
function rangeContainsNode(range, node) {
    // <strict/>
    return range.containsNode(node);
}

/**
 * Tests whether the range contains all of the text (within text nodes) contained
 * within node. This is to provide an intuitive means of checking whether a range
 * "contains" a node if you consider the range as just in terms of the text it
 * contains without having to worry about niggly details about range boundaries.
 *
 * @param  {RangyRange} range
 * @param  {Node} node
 * @return {Boolean}
 */
function rangeContainsNodeText(range, node) {
    // <strict/>
    return range.containsNodeText(node);
}

/**
 * Removes the white space at the start and the end of the range.
 *
 * @param {RangyRange} range This is the range of selected text.
 */
function rangeTrim(range) {
    // <strict/>
    if (range.startContainer.data) {
        while (/\s/.test(range.startContainer.data.substr(range.startOffset, 1))) {
            range.setStart(range.startContainer, range.startOffset + 1);
        }
    }

    if (range.endContainer.data) {
        while (range.endOffset > 0 && /\s/.test(range.endContainer.data.substr(range.endOffset - 1, 1))) {
            range.setEnd(range.endContainer, range.endOffset - 1);
        }
    }
}

/**
 * Serializes supplied ranges.
 *
 * @param {RangyRange} ranges This is the set of ranges to be serialized.
 * @param {Node} rootNode
 * @returns {String} A string of the serialized ranges separated by '|'.
 */
function rangeSerialize(range, rootNode) {
    // <strict/>
    return rangy.serializeRange(range, true, rootNode);
}

/**
 * Deseralizes supplied ranges.
 *
 * @param {string} serialized This is the already serailized range to be deserialized.
 * @param {Node} rootNode
 * @returns {Array} An array of deserialized ranges.
 */
function rangeDeserialize(serialized, rootNode) {
    // <strict/>
    var serializedRanges = serialized.split("|"),
        ranges = [];
    for (var i = 0, l = serializedRanges.length; i < l; i++) {
        ranges[i] = rangy.deserializeRange(serializedRanges[i], rootNode);
    }
    return ranges;
}

/**
 * Split the selection container and insert the given html between the two elements created.
 *
 * @param  {RangyRange}
 * @param  {jQuery|Element|string} html The html to replace selection with.
 */
function rangeReplaceSplitInvalidTags(range, html, wrapper, validTagNames) {
    // <strict/>
    var commonAncestor = rangeGetCommonAncestor(range);

    if (!elementIsValid(commonAncestor, validTagNames)) {
        commonAncestor = elementFirstInvalidElementOfValidParent(commonAncestor, validTagNames, wrapper);
    }

    // Select from start of selected element to start of selection
    var startRange = rangy.createRange();
    startRange.setStartBefore(commonAncestor);
    startRange.setEnd(range.startContainer, range.startOffset);
    var startFragment = startRange.cloneContents();

    // Select from end of selected element to end of selection
    var endRange = rangy.createRange();
    endRange.setStart(range.endContainer, range.endOffset);
    endRange.setEndAfter(commonAncestor);
    var endFragment = endRange.cloneContents();

    // Replace the start element's html with the content that was not selected, append html & end element's html
    var replacement = elementOuterHtml($(fragmentToHtml(startFragment)));
    replacement += elementOuterHtml($(html).attr('data-replacement', true));
    replacement += elementOuterHtml($(fragmentToHtml(endFragment)));

    replacement = $(replacement);

    $(commonAncestor).replaceWith(replacement);
    replacement = replacement.parent().find('[data-replacement]').removeAttr('data-replacement');

    // Remove empty surrounding tags only if they're of the same type as the split element
    if (replacement.prev().is(commonAncestor.tagName.toLowerCase()) &&
        !replacement.prev().html().trim()) {
        replacement.prev().remove();
    }
    if (replacement.next().is(commonAncestor.tagName.toLowerCase()) &&
        !replacement.next().html().trim()) {
        replacement.next().remove();
    }
    return replacement;
}

/**
 * Replace the given range, splitting the parent elements such that the given html
 * is contained only by valid tags.
 *
 * @param  {RangyRange} range
 * @param  {string} html
 * @param  {Element} wrapper
 * @param  {string[]} validTagNames
 * @return {Element}
 */
function rangeReplaceWithinValidTags(range, html, wrapper, validTagNames) {
    var startElement = nodeFindParent(range.startContainer);
    var endElement = nodeFindParent(range.endContainer);
    var selectedElement = rangeGetCommonAncestor(range);

    var selectedElementValid = elementIsValid(selectedElement, validTagNames);
    var startElementValid = elementIsValid(startElement, validTagNames);
    var endElementValid = elementIsValid(endElement, validTagNames);

    // The html may be inserted within the selected element & selection start / end.
    if (selectedElementValid && startElementValid && endElementValid) {
        return rangeReplace(range, html);
    }

    // Context is invalid. Split containing element and insert list in between.
    return rangeReplaceSplitInvalidTags(range, html, wrapper, validTagNames);
}

function rangeToHtml(range) {
    return fragmentToHtml(range.cloneContents());
}

function rangeGet() {
    var selection = rangy.getSelection();
    if (selection.rangeCount > 0) {
        return selection.getRangeAt(0);
    }
    return null;
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/range.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/selection.js
/**
 * @fileOverview Selection manipulation helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * @type {Boolean|Object} current saved selection.
 */
var savedSelection = false;

/**
 * Save selection wrapper, preventing plugins / UI from accessing rangy directly.
 * @todo check desc and type for overwrite.
 * @param {Boolean} overwrite True if selection is able to be overwritten.
 */
function selectionSave(overwrite) {
    if (savedSelection && !overwrite) return;
    savedSelection = rangy.saveSelection();
}

/**
 * Restore selection wrapper, preventing plugins / UI from accessing rangy directly.
 */
function selectionRestore() {
    if (savedSelection) {
        rangy.restoreSelection(savedSelection);
        savedSelection = false;
    }
}

/**
 * Reset saved selection.
 */
function selectionDestroy() {
    if (savedSelection) {
        rangy.removeMarkers(savedSelection);
    }
    savedSelection = false;
}

/**
 * Returns whether the selection is saved.
 *
 * @returns {Boolean} True if there is a saved selection.
 */
function selectionSaved() {
    return savedSelection !== false;
}

/**
 * Iterates over all ranges in a selection and calls the callback for each
 * range. The selection/range offsets is updated in every iteration in in the
 * case that a range was changed or removed by a previous iteration.
 *
 * @public @static
 * @param {function} callback The function to call for each range. The first and only parameter will be the current range.
 * @param {RangySelection} [selection] A RangySelection, or by default, the current selection.
 * @param {object} [context] The context in which to call the callback.
 */
function selectionEachRange(callback, selection, context) {
    selection = selection || rangy.getSelection();
    var range, i = 0;
    // Create a new range set every time to update range offsets
    while (range = selection.getAllRanges()[i++]) {
        callback.call(context, range);
    }
}

/**
 * Replaces the current selection with the specified range.
 *
 * @param {RangySelection} mixed The specified range to replace the current range.
 */
function selectionSet(mixed) {
    rangy.getSelection().setSingleRange(mixed);
}

/**
 * Replaces the given selection (or the current selection if selection is not
 * supplied) with the given html.
 * @todo type for result
 * @public @static
 * @param  {jQuery|String} html The html to use when replacing.
 * @param  {RangySelection|null} selection The selection to replace, or null to replace the current selection.
 * @returns {type} The replaced selection.
 */
function selectionReplace(html, selection) {
    var result = [];
    selectionEachRange(function(range) {
        result = result.concat(rangeReplace(range, html));
    }, selection, this);
    return result;
}

/**
 * Selects all the contents of the supplied element, excluding the element itself.
 *
 * @public @static
 * @param {jQuerySelector|jQuery|Element} element
 * @param {RangySelection} [selection] A RangySelection, or by default, the current selection.
 */
 /*
function selectionSelectInner(element, selection) {
    selection = selection || rangy.getSelection();
    selection.removeAllRanges();
    $(element).focus().contents().each(function() {
        var range = rangy.createRange();
        range.selectNodeContents(this);
        selection.addRange(range);
    });
}
*/
/**
 * Selects all the contents of the supplied node, excluding the node itself.
 *
 * @public @static
 * @param {Node} node
 * @param {RangySelection} [selection] A RangySelection, or by default, the current selection.
 */
function selectionSelectInner(node, selection) {
    // <strict/>
    selection = selection || rangy.getSelection();
    var range = rangy.createRange();
    range.selectNodeContents(node);
    selection.setSingleRange(range);
}

/**
 * Selects all the contents of the supplied node, including the node itself.
 *
 * @public @static
 * @param {Node} node
 * @param {RangySelection} [selection] A RangySelection, or null to use the current selection.
 */
function selectionSelectOuter(node, selection) {
    // <strict/>
    var range = rangy.createRange();
    range.selectNode(node);
    rangy.getSelection().setSingleRange(range);
}

/**
 * Move selection to the start or end of element.
 *
 * @param  {jQuerySelector|jQuery|Element} element The subject element.
 * @param  {RangySelection|null} selection A RangySelection, or null to use the current selection.
 * @param {Boolean} start True to select the start of the element.
 */
function selectionSelectEdge(element, selection, start) {
    selection = selection || rangy.getSelection();
    selection.removeAllRanges();

    $(element).each(function() {
        var range = rangy.createRange();
        range.selectNodeContents(this);
        range.collapse(start);
        selection.addRange(range);
    });
}

/**
 * Move selection to the end of element.
 *
 * @param  {jQuerySelector|jQuery|Element} element The subject element.
 * @param  {RangySelection|null} selection A RangySelection, or null to use the current selection.
 */
function selectionSelectEnd(element, selection) {
    selectionSelectEdge(element, selection, false);
}

/**
 * Move selection to the start of element.
 *
 * @param  {jQuerySelector|jQuery|Element} element The subject element.
 * @param  {RangySelection|null} selection A RangySelection, or null to use the current selection.
 */
function selectionSelectStart(element, selection) {
    selectionSelectEdge(element, selection, true);
}

/**
 * Extend selection to the end of element.
 *
 * @param  {Element} element
 * @param  {RangySelection|null} selection
 */
function selectionSelectToEndOfElement(element, selection) {
    // <strict/>
    selection = selection || rangy.getSelection();
    var range = selectionRange();
    selection.removeAllRanges();
    range.setEndAfter(element.get(0));
    selection.addRange(range);
}

/**
 * Gets the HTML from a selection. If no selection is supplied then current selection will be used.
 *
 * @param  {RangySelection|null} selection Selection to get html from or null to use current selection.
 * @return {string} The html content of the selection.
 */
function selectionGetHtml(selection) {
    selection = selection || rangy.getSelection();
    return selection.toHtml();
}

/**
 * Gets the closest common ancestor container to the given or current selection that isn't a text node.
 * @todo check please
 *
 * @param {RangySelection} range The selection to get the element from.
 * @returns {jQuery} The common ancestor container that isn't a text node.
 */
function selectionGetElement(range, selection) {
    selection = selection || rangy.getSelection();
    if (!selectionExists()) {
        return new jQuery;
    }
    var range = selectionRange(),
        commonAncestor;
    // Check if the common ancestor container is a text node
    if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
        // Use the parent instead
        commonAncestor = range.commonAncestorContainer.parentNode;
    } else {
        commonAncestor = range.commonAncestorContainer;
    }
    return $(commonAncestor);
}

/**
 * Gets all elements within and including the selection's common ancestor that contain a selection (excluding text nodes) and
 * returns them as a jQuery array.
 *
 * @public @static
 * @param {RangySelection|null} A RangySelection, or by default, the current selection.
 */
function selectionGetElements(selection) {
    var result = new jQuery();
    selectionEachRange(function(range) {
        result.push(selectionGetElement(range)[0]);
    }, selection, this);
    return result;
}

/**
 * Gets the start element of a selection.
 * @todo check the type of the return...i guessed and i have a feeling i might be wrong.
 * @returns {jQuery|Object} If the anchor node is a text node then the parent of the anchor node is returned, otherwise the anchor node is returned.
 */
function selectionGetStartElement() {
    var selection = rangy.getSelection();
    if (selection.anchorNode === null) {
        return null;
    }
    if (selection.isBackwards()) {
        return selection.focusNode.nodeType === Node.TEXT_NODE ? $(selection.focusNode.parentElement) : $(selection.focusNode);
    }
    if (!selection.anchorNode) console.trace();
    return selection.anchorNode.nodeType === Node.TEXT_NODE ? $(selection.anchorNode.parentElement) : $(selection.anchorNode);
}

/**
 * Gets the end element of the selection.
 * @returns {jQuery|Object} If the focus node is a text node then the parent of the focus node is returned, otherwise the focus node is returned.
 */
function selectionGetEndElement() {
    var selection = rangy.getSelection();
    if (selection.anchorNode === null) {
        return null;
    }
    if (selection.isBackwards()) {
        return selection.anchorNode.nodeType === Node.TEXT_NODE ? $(selection.anchorNode.parentElement) : $(selection.anchorNode);
    }
    return selection.focusNode.nodeType === Node.TEXT_NODE ? $(selection.focusNode.parentElement) : $(selection.focusNode);
}

/**
 * Checks to see if the selection is at the end of the element.
 *
 * @returns {Boolean} True if the node immediately after the selection ends does not exist or is empty,
 *                      false if the whole nodes' text is not selected or it doesn't fit the criteria for the true clause.
 */
function selectionAtEndOfElement() {
    var selection = rangy.getSelection();
    var focusNode = selection.isBackwards() ? selection.anchorNode : selection.focusNode;
    var focusOffset = selection.isBackwards() ? selection.focusOffset : selection.anchorOffset;
    if (focusOffset !== focusNode.textContent.length) {
        return false;
    }
    var previous = focusNode.nextSibling;
    if (!previous || $(previous).html() === '') {
        return true;
    } else {
        return false;
    }
}

/**
 * Checks to see if the selection is at the start of the element.
 *
 * @returns {Boolean} True if the node immediately before the selection starts does not exist or is empty,
 *                      false if the whole nodes' text is not selected or it doesn't fit the criteria for the true clause.
 */
function selectionAtStartOfElement() {
    var selection = rangy.getSelection();
    var anchorNode = selection.isBackwards() ? selection.focusNode : selection.anchorNode;
    if (selection.isBackwards() ? selection.focusOffset : selection.anchorOffset !== 0) {
        return false;
    }
    var previous = anchorNode.previousSibling;
    if (!previous || $(previous).html() === '') {
        return true;
    } else {
        return false;
    }
}

/**
 * Checks to see if the selection is empty.
 * @returns {Boolean} Returns true if the selection is empty.
 */
function selectionIsEmpty() {
    return rangy.getSelection().toHtml() === '';
}

/**
 * FIXME: this function needs reviewing.
 *
 * This should toggle an inline style, and normalise any overlapping tags, or adjacent (ignoring white space) tags.
 * @todo apparently this needs fixing and i'm not sure what it returns.
 * @public @static
 *
 * @param {String} tag This is the tag to be toggled.
 * @param {Array} options These are any additional properties to add to the element.
 * @returns {selectionToggleWrapper}
 */
function selectionToggleWrapper(tag, options) {
    options = options || {};
    var applier = rangy.createCssClassApplier(options.classes || '', {
        normalize: true,
        elementTagName: tag,
        elementProperties: options.attributes || {}
    });
    selectionEachRange(function(range) {
        if (rangeEmptyTag(range)) {
            var element = $('<' + tag + '/>')
                .addClass(options.classes)
                .attr(options.attributes || {})
                .append(fragmentToHtml(range.cloneContents()));
            rangeReplace(range, element);
        } else {
            applier.toggleRange(range);
        }
    }, null, this);
}

/**
 * @todo method description and check types
 *
 * @param {String} tag The tag for the selection to be wrapped in.
 * @param {String} attributes The attributes to be added to the selection.
 * @param {String} classes The classes to be added to the selection
 */
function selectionWrapTagWithAttribute(tag, attributes, classes) {
    selectionEachRange(function(range) {
        var element = selectionGetElement(range);
        if (element.is(tag)) {
            element.attr(attributes);
        } else {
            selectionToggleWrapper(tag, {
                classes: classes,
                attributes: attributes
            });
        }
    }, null, this);
}

/**
 * Check if there is a current selection.
 *
 * @public @static
 * @returns {Boolean} Returns true if there is at least one range selected.
 */
function selectionExists() {
    return rangy.getSelection().rangeCount !== 0;
}

/**
 * Gets the first range in the current selection. In strict mode if no selection
 * exists an error occurs.
 *
 * @public @static
 * @returns {RangyRange} Returns true if there is at least one range selected.
 */
function selectionRange() {
    // <strict/>
    return rangy.getSelection().getRangeAt(0);
}

/**
 * Split the selection container and insert the given html between the two elements created.
 * @param  {jQuery|Element|string} html The html to replace selection with.
 * @param  {RangySelection|null} selection The selection to replace, or null for the current selection.
 * @returns {Object} The selection container with it's new content added.
 */
function selectionReplaceSplittingSelectedElement(html, selection) {
    selection = selection || rangy.getSelection();

    var selectionRange = selectionRange();
    var selectedElement = selectionGetElements()[0];

    // Select from start of selected element to start of selection
    var startRange = rangy.createRange();
    startRange.setStartBefore(selectedElement);
    startRange.setEnd(selectionRange.startContainer, selectionRange.startOffset);
    var startFragment = startRange.cloneContents();

    // Select from end of selected element to end of selection
    var endRange = rangy.createRange();
    endRange.setStart(selectionRange.endContainer, selectionRange.endOffset);
    endRange.setEndAfter(selectedElement);
    var endFragment = endRange.cloneContents();

    // Replace the start element's html with the content that was not selected, append html & end element's html
    var replacement = elementOuterHtml($(fragmentToHtml(startFragment)));
    replacement += elementOuterHtml($(html).attr('data-replacement', true));
    replacement += elementOuterHtml($(fragmentToHtml(endFragment)));

    replacement = $(replacement);

    $(selectedElement).replaceWith(replacement);
    return replacement.parent().find('[data-replacement]').removeAttr('data-replacement');
}

/**
 * Replace current selection with given html, ensuring that selection container is split at
 * the start & end of the selection in cases where the selection starts / ends within an invalid element.
 *
 * @param  {jQuery|Element|string} html The html to replace current selection with.
 * @param  {Array} validTagNames An array of tag names for tags that the given html may be inserted into without having the selection container split.
 * @param  {RangySeleciton|null} selection The selection to replace, or null for the current selection.
 * @returns {Object} The replaced selection if everything is valid or the selection container with it's new content added.
 */
function selectionReplaceWithinValidTags(html, validTagNames, selection) {
    selection = selection || rangy.getSelection();

    if (!selectionExists()) {
        return;
    }

    var startElement = selectionGetStartElement()[0];
    var endElement = selectionGetEndElement()[0];
    var selectedElement = selectionGetElements()[0];

    var selectedElementValid = elementIsValid(selectedElement, validTagNames);
    var startElementValid = elementIsValid(startElement, validTagNames);
    var endElementValid = elementIsValid(endElement, validTagNames);

    // The html may be inserted within the selected element & selection start / end.
    if (selectedElementValid && startElementValid && endElementValid) {
        return selectionReplace(html);
    }

    // Context is invalid. Split containing element and insert list in between.
    return selectionReplaceSplittingSelectedElement(html, selection);
}

/**
 * Toggles style(s) on the first block level parent element of each range in a selection
 *
 * @public @static
 * @param {Object} styles styles to apply
 * @param {jQuerySelector|jQuery|Element} limit The parent limit element.
 * If there is no block level elements before the limit, then the limit content
 * element will be wrapped with a "div"
 */
function selectionToggleBlockStyle(styles, limit) {
    selectionEachRange(function(range) {
        var parent = $(range.commonAncestorContainer);
        while (parent.length && parent[0] !== limit[0] && (
                parent[0].nodeType === Node.TEXT_NODE || parent.css('display') === 'inline')) {
            parent = parent.parent();
        }
        if (parent[0] === limit[0]) {
            // Only apply block style if the limit element is a block
            if (limit.css('display') !== 'inline') {
                // Wrap the HTML inside the limit element
                elementWrapInner(limit, 'div');
                // Set the parent to the wrapper
                parent = limit.children().first();
            }
        }
        // Apply the style to the parent
        elementToggleStyle(parent, styles);
    }, null, this);
}

/**
 * Iterates throught each block in the selection and calls the callback function.
 *
 * @todo revise blockContainer parameter!
 * @param {function} callback The function to be called on each block in the selection.
 * @param {jQuery} limitElement The element to stop searching for block elements at.
 * @param {undefined|Sring} blockContainer Thia parameter is unused for some reason.
 */
function selectionEachBlock(callback, limitElement, blockContainer) {
    // <strict/>
    selectionEachRange(function(range) {
        // Loop range parents until a block element is found, or the limit element is reached
        var startBlock = elementClosestBlock($(range.startContainer), limitElement),
            endBlock = elementClosestBlock($(range.endContainer), limitElement),
            blocks;
        if (!startBlock || !endBlock) {
            // Wrap the HTML inside the limit element
            callback(elementWrapInner(limitElement, blockContainer).get(0));
        } else {
            if (startBlock.is(endBlock)) {
                blocks = startBlock;
            } else if (startBlock && endBlock) {
                blocks = startBlock.nextUntil(endBlock).andSelf().add(endBlock);
            }
            for (var i = 0, l = blocks.length; i < l; i++) {
                callback(blocks[i]);
            }
        }
    });
}

/**
 * Add or removes a set of classes to the closest block elements in a selection.
 * If the `limitElement` is closer than a block element, then a new
 * `blockContainer` element wrapped around the selection.
 *
 * If any block in the selected text has not got the class applied to it, then
 * the class will be applied to all blocks.
 *
 * @todo revise blockContainer parameter!
 * @param {string[]} addClasses This is a set of classes to be added.
 * @param {string[]} removeClasses This is a set of classes to be removed.
 * @param {jQuery} limitElement The element to stop searching for block elements at.
 * @param {undefined|String} blockContainer Thia parameter is unused for some reason.
 */
function selectionToggleBlockClasses(addClasses, removeClasses, limitElement, blockContainer) {
    // <strict/>

    var apply = false,
        blocks = new jQuery();

    selectionEachBlock(function(block) {
        blocks.push(block);
        if (!apply) {
            for (var i = 0, l = addClasses.length; i < l; i++) {
                if (!$(block).hasClass(addClasses[i])) {
                    apply = true;
                }
            }
        }
    }, limitElement, blockContainer);

    $(blocks).removeClass(removeClasses.join(' '));
    if (apply) {
        $(blocks).addClass(addClasses.join(' '));
    } else {
        $(blocks).removeClass(addClasses.join(' '));
    }
}

/**
 * Removes all ranges from a selection that are not contained within the
 * supplied element.
 *
 * @public @static
 * @param {jQuerySelector|jQuery|Element} element The element to exclude the removal of ranges.
 * @param {RangySelection} [selection] The selection from which to remove the ranges.
 */
function selectionConstrain(node, selection) {
    // <strict/>
    selection = selection || rangy.getSelection();
    var ranges = selection.getAllRanges(),
        newRanges = [];
    for (var i = 0, l = ranges.length; i < l; i++) {
        var newRange = ranges[i].cloneRange();
        if (ranges[i].startContainer !== node &&
                !nodeIsChildOf(ranges[i].startContainer, node)) {
            newRange.setStart(node, 0);
        }
        if (ranges[i].endContainer !== node &&
                !nodeIsChildOf(ranges[i].endContainer, node)) {
            newRange.setEnd(node, node.childNodes.length);
        }
        newRanges.push(newRange);
    }
    selection.setRanges(newRanges);
}

/**
 * Clears the formatting on a supplied selection.
 *
 * @param {Node} limitNode The containing element.
 * @param {RangySelection} [selection] The selection to have it's formatting cleared.
 */
function selectionClearFormatting(limitNode, selection) {
    // <strict/>

    limitNode = limitNode || document.body;
    selection = selection || rangy.getSelection();
    if (selectionExists()) {
        // Create a copy of the selection range to work with
        var range = selectionRange().cloneRange();

        // Get the selected content
        var content = range.extractContents();

        // Expand the range to the parent if there is no selected content
        // and the range's ancestor is not the limitNode
        if (fragmentToHtml(content) === '') {
            rangeSelectElementContent(range, range.commonAncestorContainer);
            selection.setSingleRange(range);
            content = range.extractContents();
        }

        content = $('<div/>').append(fragmentToHtml(content)).html().replace(/(<\/?.*?>)/gi, function(match) {
            if (match.match(/^<(img|object|param|embed|iframe)/) !== null) {
                return match;
            }
            return '';
        });

        // Get the containing element
        var parent = range.commonAncestorContainer;
        while (parent && parent.parentNode !== limitNode) {
            parent = parent.parentNode;
        }

        if (parent) {
            // Place the end of the range after the paragraph
            range.setEndAfter(parent);

            // Extract the contents of the paragraph after the caret into a fragment
            var contentAfterRangeStart = range.extractContents();

            // Collapse the range immediately after the paragraph
            range.collapseAfter(parent);

            // Insert the content
            range.insertNode(contentAfterRangeStart);

            // Move the caret to the insertion point
            range.collapseAfter(parent);
        }
        content = $.parseHTML(content);
        if (content !== null) {
            $(content.reverse()).each(function() {
                if ($(this).is('img')) {
                    range.insertNode($(this).removeAttr('width height class style').get(0));
                    return;
                }
                range.insertNode(this);
            });
        }
    }
}

/**
 * Replaces specified tags and classes on a selection.
 *
 * @todo check descriptions and types please
 * @param {String} tag1 This is the tag to appear on the selection at the end of the method.
 * @param {jQuery} class1 This is the class to appear on the selection at the end of the method.
 * @param {String} tag2 This is the current tag on the selection, which is to be replaced.
 * @param {jQuery} class2 This is the current class on the selection, which is to be replaced.
 */
function selectionInverseWrapWithTagClass(tag1, class1, tag2, class2) {
    selectionSave();
    // Assign a temporary tag name (to fool rangy)
    var id = 'domTools' + Math.ceil(Math.random() * 10000000);

    selectionEachRange(function(range) {
        var applier2 = rangy.createCssClassApplier(class2, {
            elementTagName: tag2
        });

        // Check if tag 2 is applied to range
        if (applier2.isAppliedToRange(range)) {
            // Remove tag 2 to range
            applier2.toggleSelection();
        } else {
            // Apply tag 1 to range
            rangy.createCssClassApplier(class1, {
                elementTagName: id
            }).toggleSelection();
        }
    }, null, this);

    // Replace the temporary tag with the correct tag
    $(id).each(function() {
        $(this).replaceWith($('<' + tag1 + '/>').addClass(class1).html($(this).html()));
    });

    selectionRestore();
}

/**
 * Expands the user selection to encase a whole word.
 */
function selectionExpandToWord() {
    var ranges = rangy.getSelection().getAllRanges();
    if (ranges.length === 1) {
        if (rangeToHtml(ranges[0]) === '') {
            rangy.getSelection().expand('word');
        }
    }
}

/**
 * Expands the user selection to contain the supplied selector, stopping at the specified limit element.
 *
 * @param {jQuerySelector} selector The selector to expand the selection to.
 * @param {jQuerySelector} limit The element to stop at.
 * @param {boolean} outer If true, then the outer most matched element (by the
 *   selector) is wrapped. Otherwise the first matched element is wrapped.
 */
function selectionExpandTo(selector, limit, outer) {
    var ranges = rangy.getSelection().getAllRanges();
    for (var i = 0, l = ranges.length; i < l; i++) {
        // Start container
        var element = $(nodeFindParent(ranges[i].startContainer));
        if (outer || (!element.is(selector) && !element.is(limit))) {
            element = element.parentsUntil(limit, selector);
        }
        if (outer) {
            element = element.last();
        } else {
            element = element.first();
        }
        if (element.length === 1 && !element.is(limit)) {
            ranges[i].setStart(element[0], 0);
        }

        // End container
        element = $(nodeFindParent(ranges[i].endContainer));
        if (outer || (!element.is(selector) && !element.is(limit))) {
            element = element.parentsUntil(limit, selector);
        }
        if (outer) {
            element = element.last();
        } else {
            element = element.first();
        }
        if (element.length === 1 && !element.is(limit)) {
            ranges[i].setEnd(element[0], element[0].childNodes.length);
        }
    }
    rangy.getSelection().setRanges(ranges);
}

/**
 * Trims an entire selection as per rangeTrim.
 *
 * @see rangeTrim
 */
function selectionTrim() {
    if (selectionExists()) {
        var range = selectionRange();
        rangeTrim(range);
        selectionSet(range);
    }
}

/**
 * Finds the inner elements and the wrapping tags for a selector.
 *
 * @param {string} selector A jQuery selector to match the wrapping/inner element against.
 * @param {jQuery} limitElement The element to stop searching at.
 * @returns {jQuery}
 */
function selectionFindWrappingAndInnerElements(selector, limitElement) {
    var result = new jQuery();
    selectionEachRange(function(range) {
        var startNode = range.startContainer;
        while (startNode.nodeType === Node.TEXT_NODE) {
            startNode = startNode.parentNode;
        }

        var endNode = range.endContainer;
        while (endNode.nodeType === Node.TEXT_NODE) {
            endNode = endNode.parentNode;
        }

        var filter = function() {
            if (!limitElement.is(this)) {
                result.push(this);
            }
        };

        do {
            $(startNode).filter(selector).each(filter);

            if (!limitElement.is(startNode) && result.length === 0) {
                $(startNode).parentsUntil(limitElement, selector).each(filter);
            }

            $(startNode).find(selector).each(filter);

            if ($(endNode).is(startNode)) {
                break;
            }

            startNode = $(startNode).next();
        } while (startNode.length > 0 && $(startNode).prevAll().has(endNode).length === 0);
    });
    return result;
}

/**
 * Changes the tags on a selection.
 *
 * @param {String} changeTo The tag to be changed to.
 * @param {String} changeFrom The tag to be changed from.
 * @param {jQuery} limitElement The element to stop changing the tags at.
 */
function selectionChangeTags(changeTo, changeFrom, limitElement) {
    var elements = selectionFindWrappingAndInnerElements(changeFrom.join(','), limitElement);
    if (elements.length) {
        selectionSave();
        elementChangeTag(elements, changeTo);
        selectionRestore();
    } else {
        var limitNode = limitElement.get(0);
        if (limitNode.innerHTML.trim()) {
            selectionSave();
            limitNode.innerHTML = '<' + changeTo + '>' + limitNode.innerHTML + '</' + changeTo + '>';
            selectionRestore();
        } else {
            limitNode.innerHTML = '<' + changeTo + '>&nbsp;</' + changeTo + '>';
            selectionSelectInner(limitNode.childNodes[0]);
        }
    }
}

/**
 * Checks that the selecton only contains valid children.
 *
 * @param {String} selector A string containing a selector expression to match the current set of elements against.
 * @param {jQuery} limit The element to stop changing the tags at.
 * @returns {Boolean} True if the selection contains valid children.
 */
function selectionContains(selector, limit) {
    var result = true;
    selectionEachRange(function(range) {
        // Check if selection only contains valid children
        var children = $(range.commonAncestorContainer).find('*');
        if ($(range.commonAncestorContainer).parentsUntil(limit, selector).length === 0 &&
                (children.length === 0 || children.length !== children.filter(selector).length)) {
            result = false;
        }
    });
    return result;
}

function selectionDelete(selection) {
    selection = selection || rangy.getSelection();
    selection.deleteFromDocument();
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/selection.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/state.js
/**
 * @fileOverview Save state helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Saves the state of an element.
 * @param {jQuery} element The element to have its current state saved.
 * @returns {Object} The saved state of the element.
 */
function stateSave(element) {
    // <strict/>

    var range = rangeGet();
    return {
        element: element.clone(true),
        ranges: range ? rangeSerialize(range, element.get(0)) : null
    };
}

/**
 * Restores an element from its saved state.
 *
 * @param {jQuery} element The element to have its state restored.
 * @param {jQuery} state The state to restore the element to.
 * @returns {Object} The restored element.
 */
function stateRestore(element, state) {
    // <strict/>

    element.replaceWith(state.element);
    var ranges = null;
    try {
        if (state.ranges) {
            ranges = rangeDeserialize(state.ranges, state.element.get(0));
        }
    } catch (exception) {
        // <debug/>
    }
    return {
        element: state.element,
        ranges: ranges
    };
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/state.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/string.js
/**
 * @fileOverview String helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Modification of strip_tags from PHP JS - http://phpjs.org/functions/strip_tags:535.
 * @param  {string} content HTML containing tags to be stripped
 * @param {Array} allowedTags Array of tags that should not be stripped
 * @return {string} HTML with all tags not present allowedTags array.
 */
function stringStripTags(content, allowedTags) {
    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    allowed = [];
    for (var allowedTagsIndex = 0; allowedTagsIndex < allowedTags.length; allowedTagsIndex++) {
        if (allowedTags[allowedTagsIndex].match(/[a-z][a-z0-9]{0,}/g)) {
            allowed.push(allowedTags[allowedTagsIndex]);
        }
    }
    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*\/?>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

    return content.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf($1.toLowerCase()) > -1 ? $0 : '';
    });
}

/**
 * Converts a string in camelcase to lower case words separated with a dash or other supplied delimiter.
 * @param {String} string The string to be converted from camelcase.
 * @param {String} delimiter The character to separate the words, '-' if null.
 * @returns {String} A lowercase string separated by dashes.
 */
function stringCamelCaseConvert(string, delimiter) {
    return string.replace(/([A-Z])/g, function(match) {
        return (delimiter || '-') + match.toLowerCase();
    });
}

/**
 * Checks if an html string is empty.
 *
 * @param {Element} element The element to be checked.
 * @returns {Element}
 */
function stringHtmlStringIsEmpty(html) {
    // <strict/>
    return $($.parseHTML(html)).is(':empty');
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/string.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/style.js
/**
 * @fileOverview Style helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * @todo desc all
 * @param {jQuerySelector|jQuery|Element} element This is the element to have its styles swapped.
 * @param {array} newState The new state to be applied to the element.
 * @returns {array}
 */
function styleSwapState(element, newState) {
    var node = element.get(0),
        previousState = {};
    // Double loop because jQuery will automatically assign other style properties like 'margin-left' when setting 'margin'
    for (var key in newState) {
        previousState[key] = node.style[key];
    }
    for (key in newState) {
        element.css(key, newState[key]);
    }
    return previousState;
}

/**
 * @todo type for wrapper and inner and descriptions
 * @param {type} wrapper
 * @param {type} inner
 * @param {array} newState
 * @returns {unresolved}
 */
function styleSwapWithWrapper(wrapper, inner, newState) {
    var innerNode = inner.get(0),
        previousState = {};
    // Double loop because jQuery will automatically assign other style properties like 'margin-left' when setting 'margin'
    for (var key in newState) {
        previousState[key] = innerNode.style[key];
    }
    for (key in newState) {
        wrapper.css(key, inner.css(key));
        inner.css(key, newState[key]);
    }
    return previousState;
}

/**
 * @todo all
 * @param {jQuery} element
 * @param {array} state
 * @returns {undefined}
 */
function styleRestoreState(element, state) {
    for (var key in state) {
        element.css(key, state[key] || '');
    }
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/style.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/table.js
/**
 * @fileOverview Table helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen - david@panmedia.co.nz
 */

/**
 * Create and return a new table element with the supplied number of rows/columns.
 *
 * @public @static
 * @param {int} columns The number of columns to add to the table.
 * @param {int} rows The number of rows to add to the table.
 * @param [options] Extra options to apply.
 * @param [options.placeHolder=""] Place holder HTML to insert into each created cell.
 * @returns {HTMLTableElement}
 */
function tableCreate(columns, rows, options) {
    options = options || {};
    var table = document.createElement('table');
    while (rows--) {
        var row = table.insertRow(0);
        for (var i = 0; i < columns; i++) {
            var cell = row.insertCell(0);
            if (options.placeHolder) {
                cell.innerHTML = options.placeHolder;
            }
        }
    }
    return table;
}

/**
 * Adds a column to a table.
 *
 * @param {HTMLTableElement} table
 * @param {int[]} index Position to insert the column at, starting at 0.
 * @param [options] Extra options to apply.
 * @param [options.placeHolder=""] Place holder HTML to insert into each created cell.
 * @returns {HTMLTableCellElement[]} An array of cells added to the table.
 */
function tableInsertColumn(table, index, options) {
    return resizeTable(table, 0, 0, 1, index, options || {});
}
/**
 * Removes a column from a table.
 *
 * @param {HTMLTableElement} table
 * @param {int} index Position to remove the column at, starting at 0.
 */
function tableDeleteColumn(table, index) {
    resizeTable(table, 0, 0, -1, index);
}

/**
 * Adds a row to a table, and append as many cells as the longest row in the table.
 *
 * @param {HTMLTableElement} table
 * @param {int[]} index Position to insert the row at, starting at 0.
 * @param [options] Extra options to apply.
 * @param [options.placeHolder=""] Place holder HTML to insert into each created cell.
 * @returns {HTMLTableCellElement[]} An array of cells added to the table.
 */
function tableInsertRow(table, index, options) {
    var googTable = new GoogTable(table);
    return googTable.insertRow(index, options);
}

/**
 * Removes a row from a table.
 *
 * @param {HTMLTableElement} table The table to remove the row from.
 * @param {int} index Position to remove the row at, starting at 0.
 */
function tableDeleteRow(table, index) {
    resizeTable(table, -1, index, 0, 0);
}

/**
 * Return the x/y position of a table cell, taking into consideration the column/row span.
 *
 * @param {HTMLTableCellElement} cell The table cell to get the index for.
 * @returns {tableGetCellIndex.Anonym$0}
 */
function tableGetCellIndex(cell) {
    var x, y, tx, ty,
        matrix = [],
        rows = cell.parentNode.parentNode.parentNode.tBodies[0].rows;
    for (var r = 0; r < rows.length; r++) {
        y = rows[r].sectionRowIndex;
        y = r;
        for (var c = 0; c < rows[r].cells.length; c++) {
            x = c;
            while (matrix[y] && matrix[y][x]) {
                // Skip already occupied cells in current row
                x++;
            }
            for (tx = x; tx < x + (rows[r].cells[c].colSpan || 1); ++tx) {
                // Mark matrix elements occupied by current cell with true
                for (ty = y; ty < y + (rows[r].cells[c].rowSpan || 1); ++ty) {
                    if (!matrix[ty]) {
                        // Fill missing rows
                        matrix[ty] = [];
                    }
                    matrix[ty][tx] = true;
                }
            }
            if (cell === rows[r].cells[c]) {
                return {
                    x: x,
                    y: y
                };
            }
        }
    }
}

/**
 * Gets a table cell by a given index.
 *
 * @param {HTMLTableElement} table This is the table to get the cell from.
 * @param {int} index This is the index to find the cell.
 * @returns {HTMLTableCellElement|null} The cell at the specified index.
 */
function tableGetCellByIndex(table, index) {
    var rows = table.tBodies[0].rows;
    for (var r = 0; r < rows.length; r++) {
        for (var c = 0; c < rows[r].cells.length; c++) {
            var currentIndex = tableGetCellIndex(rows[r].cells[c]);
            if (currentIndex.x === index.x &&
                    currentIndex.y === index.y) {
                return rows[r].cells[c];
            }
        }
    }
    return null;
}

/**
 * Returns an array of cells found within the supplied indexes.
 *
 * @param {HTMLTableElement} table
 * @param {int} startIndex This is the index to start searching at.
 * @param {int} endIndex This is the index to stop searching at.
 * @returns {Array} An array of the cells in the range supplied.
 */
function tableCellsInRange(table, startIndex, endIndex) {
    var startX = Math.min(startIndex.x, endIndex.x),
        x = startX,
        y = Math.min(startIndex.y, endIndex.y),
        endX = Math.max(startIndex.x, endIndex.x),
        endY = Math.max(startIndex.y, endIndex.y),
        cells = [];
    while (y <= endY) {
        while (x <= endX) {
            var cell = tableGetCellByIndex(table, {
                x: x,
                y: y
            });
            if (cell !== null) {
                cells.push(cell);
            }
            x++;
        }
        x = startX;
        y++;
    }
    return cells;
}

/**
 * Checks if the cells selected can be merged.
 *
 * @param {HTMLTableElement} table The table to check the selection with.
 * @param {int} startX Selection's start x position.
 * @param {int} startY Selection's start y position.
 * @param {int} endX Selection's end x position.
 * @param {int} endY Selection's end y position.
 */
function tableCanMergeCells(table, startX, startY, endX, endY) {
}

/**
 * Merges the selected cells of a table.
 *
 * @param {HTMLTableElement} table This is the table that is going to have cells merged.
 * @param {int} startX This is the X coordinate to start merging the cells at.
 * @param {int} startY This is the Y coordinate to start merging the cells at.
 * @param {int} endX This is the X coordinate to stop merging the cells at.
 * @param {int} endY This is the Y coordinate to stop merging the cells at.
 */
function tableMergeCells(table, startX, startY, endX, endY) {
    var googTable = new GoogTable(table);
    googTable.mergeCells(startX, startY, endX, endY);
}

/**
 * Checks if the cell at the given index can be split.
 *
 * @param {HTMLTableElement} table Table to check the seleciton with.
 * @param {int} x The X coordinate of the cell to be checked.
 * @param {int} y Ths Y coordinate of the cell to be checked.
 */
function tableCanSplitCells(table, x, y) {
}

/**
 * Splits the selected cell of a table.
 *
 * @param {HTMLTableElement} table The table to find the cell to be split on.
 * @param {int} x The X coordinate of the cell to be split.
 * @param {int} y The Y coordinate of the cell to be split.
 */
function tableSplitCells(table, x, y) {
    var googTable = new GoogTable(table);
    googTable.splitCell(x, y);
}


function tableIsEmpty(table) {
    for (var i = 0, l = table.rows.length; i < l; i++) {
        if (table.rows[i].cells.length > 0) {
            return false;
        }
    }
    return true;
};
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/table.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/template.js
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/template.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/types.js
/**
 * @fileOverview Type checking functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author Michael Robinson michael@panmedia.co.nz
 * @author David Neilsen david@panmedia.co.nz
 */

/**
 * Determines whether object is a rangy range.
 *
 * @param {mixed} object The object to be tested.
 * @returns {Boolean} True if the object is a rangy range.
 */
function typeIsRange(object) {
    return object instanceof rangy.WrappedRange;
}

/**
 * Determines whether object is a rangy selection.
 *
 * @param {mixed} object The object to be tested.
 * @returns {Boolean} True if the object is a rangy selection.
 */
function typeIsSelection(object) {
    return object instanceof rangy.WrappedSelection;
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/types.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/init.js
var $ = jQuery;

$(function() {
    // Initialise rangy
    if (!rangy.initialized) {
        rangy.init();
    }

    // Add helper method to rangy
    if (!$.isFunction(rangy.rangePrototype.insertNodeAtEnd)) {
        rangy.rangePrototype.insertNodeAtEnd = function(node) {
            var range = this.cloneRange();
            range.collapse(false);
            range.insertNode(node);
            range.detach();
            this.setEndAfter(node);
        };
    }
});

// Select menu close event (triggered when clicked off)
$('html').click(function(event) {
    $('.ui-editor-selectmenu-visible')
        .removeClass('ui-editor-selectmenu-visible');
});
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/init.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/support.js
var supported, ios, hotkeys, firefox, ie;

function isSupported() {
    if (supported === undefined) {
        supported = true;

        // <ios>
        ios = /(iPhone|iPod|iPad).*AppleWebKit/i.test(navigator.userAgent);
        if (ios) {
            $('html').addClass('raptor-ios');

            // Fixed position hack
            if (ios) {
                $(document).on('scroll', function(){
                    setInterval(function() {
                        $('body').css('height', '+=1').css('height', '-=1');
                    }, 0);
                });
            }
        }
        // </ios>

        firefox = /Firefox/i.test(navigator.userAgent);
        if (firefox) {
            $('html').addClass('raptor-ff');
        }

        // <ie>
        /**
         * Returns the version of Internet Explorer or a -1 (indicating the use of another browser).
         * http://obvcode.blogspot.co.nz/2007/11/easiest-way-to-check-ie-version-with.html
         */
        var ieVersion = (function() {
            var version = -1;
            if (navigator.appVersion.indexOf("MSIE") != -1) {
                version = parseFloat(navigator.appVersion.split("MSIE")[1]);
            }
            return version;
        })();

        ie = ieVersion !== -1;
        if (ie && ieVersion < 9) {
            supported = false;

            // Create message modal
            $(function() {
                var message = $('<div/>')
                    .addClass('raptor-unsupported')
                    .html(
                        '<div class="raptor-unsupported-overlay"></div>' +
                        '<div class="raptor-unsupported-content">' +
                        '    It has been detected that you a using a browser that is not supported by Raptor, please' +
                        '    use one of the following browsers:' +
                        '    <ul>' +
                        '        <li><a href="http://www.google.com/chrome">Google Chrome</a></li>' +
                        '        <li><a href="http://www.firefox.com">Mozilla Firefox</a></li>' +
                        '        <li><a href="http://windows.microsoft.com/ie">Internet Explorer</a></li>' +
                        '    </ul>' +
                        '    <div class="raptor-unsupported-input">' +
                        '        <button class="raptor-unsupported-close">Close</button>' +
                        '        <input name="raptor-unsupported-show" type="checkbox" />' +
                        '        <label>Don\'t show this message again</label>' +
                        '    </div>' +
                        '<div>'
                    )
                    .appendTo('body');

                /**
                 * Sets the z-index CSS property on an element to 1 above all its sibling elements.
                 *
                 * @param {jQuery} element The jQuery element to have it's z index increased.
                 */
                var elementBringToTop = function(element) {
                    var zIndex = 1;
                    element.siblings().each(function() {
                        var z = $(this).css('z-index');
                        if (!isNaN(z) && z > zIndex) {
                            zIndex = z + 1;
                        }
                    });
                    element.css('z-index', zIndex);
                }
                elementBringToTop(message);

                // Close event
                message.find('.raptor-unsupported-close').click(function() {
                    message.remove();
                });
            });
        }
        // </ie>

        hotkeys = jQuery.hotkeys !== undefined;
    }
    return supported;
}

// <ie>

/**
 * Object.create polyfill
 * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create
 */
if (!Object.create) {
    Object.create = function (o) {
        if (arguments.length > 1) {
            throw new Error('Object.create implementation only accepts the first parameter.');
        }
        function F() {}
        F.prototype = o;
        return new F();
    };
}

/**
 * Node.TEXT_NODE polyfill
 */
if (typeof Node === 'undefined') {
    Node = {
        TEXT_NODE: 3
    };
}

/**
 * String.trim polyfill
 * https://gist.github.com/eliperelman/1035982
 */
''.trim || (String.prototype.trim = // Use the native method if available, otherwise define a polyfill:
    function () { // trim returns a new string (which replace supports)
        return this.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g,'') // trim the left and right sides of the string
    });

// </ie>

// <strict/>;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/support.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/raptor.js
/**
 * @class Raptor
 */
var Raptor =  {

    globalDefaults: {},
    defaults: {},

    /** @property {boolean} enableHotkeys True to enable hotkeys */
    enableHotkeys: true,

    /** @property {Object} hotkeys Custom hotkeys */
    hotkeys: {},

    /**
     * Plugins added via Raptor.registerPlugin
     * @property {Object} plugins
     */
    plugins: {},

    /**
     * UI added via Raptor.registerUi
     * @property {Object} ui
     */
    ui: {},

    /**
     * Layouts added via Raptor.registerLayout
     * @property {Object} layouts
     */
    layouts: {},

    /**
     * Presets added via Raptor.registerPreset
     * @property {Object} presets
     */
    presets: {},

    hoverPanels: {},

    /**
     * @property {Raptor[]} instances
     */
    instances: [],

    /**
     * @returns {Raptor[]}
     */
    getInstances: function() {
        return this.instances;
    },

    eachInstance: function(callback) {
        for (var i = 0; i < this.instances.length; i++) {
            callback.call(this.instances[i], this.instances[i]);
        }
    },

    /*========================================================================*\
     * Templates
    \*========================================================================*/
    /**
     * @property {String} urlPrefix
     */
    urlPrefix: '/raptor/',

    /**
     * @param {String} name
     * @returns {String}
     */
    getTemplate: function(name, urlPrefix) {
        var template;
        if (!this.templates[name]) {
            // Parse the URL
            var url = urlPrefix || this.urlPrefix;
            var split = name.split('.');
            if (split.length === 1) {
                // URL is for and editor core template
                url += 'templates/' + split[0] + '.html';
            } else {
                // URL is for a plugin template
                url += 'plugins/' + split[0] + '/templates/' + split.splice(1).join('/') + '.html';
            }

            // Request the template
            $.ajax({
                url: url,
                type: 'GET',
                async: false,
                // <debug/>
                // 15 seconds
                timeout: 15000,
                error: function() {
                    template = null;
                },
                success: function(data) {
                    template = data;
                }
            });
            // Cache the template
            this.templates[name] = template;
        } else {
            template = this.templates[name];
        }
        return template;
    },

    /*========================================================================*\
     * Helpers
    \*========================================================================*/

    /**
     * @returns {boolean}
     */
    isDirty: function() {
        var instances = this.getInstances();
        for (var i = 0; i < instances.length; i++) {
            if (instances[i].isDirty()) return true;
        }
        return false;
    },

    /**
     *
     */
    unloadWarning: function() {
        var instances = this.getInstances();
        for (var i = 0; i < instances.length; i++) {
            if (instances[i].isDirty() &&
                    instances[i].isEditing() &&
                    instances[i].options.unloadWarning) {
                return tr('navigateAway');
            }
        }
    },

    /*========================================================================*\
     * Plugins and UI
    \*========================================================================*/

    /**
     * Registers a new UI component, overriding any previous UI components registered with the same name.
     *
     * @param {String} name
     * @param {Object} ui
     */
    registerUi: function(ui) {
        // <strict/>
        this.ui[ui.name] = ui;
    },

    /**
     * Registers a new layout, overriding any previous layout registered with the same name.
     *
     * @param {String} name
     * @param {Object} layout
     */
    registerLayout: function(layout) {
        // <strict/>

        this.layouts[layout.name] = layout;
    },

    registerPlugin: function(plugin) {
        // <strict/>

        this.plugins[plugin.name] = plugin;
    },

    registerPreset: function(preset, setDefault) {
        // <strict/>

        this.presets[preset.name] = preset;
        if (setDefault) {
            this.defaults = preset;
        }
    },

    /*========================================================================*\
     * Persistance
    \*========================================================================*/
    /**
     * @param {String} key
     * @param {mixed} value
     * @param {String} namespace
     */
    persist: function(key, value, namespace) {
        key = namespace ? namespace + '.' + key : key;
        // Local storage throws an error when using XUL
        try {
            if (localStorage) {
                var storage;
                if (localStorage.uiWidgetEditor) {
                    storage = JSON.parse(localStorage.uiWidgetEditor);
                } else {
                    storage = {};
                }
                if (value === undefined) {
                    return storage[key];
                }
                storage[key] = value;
                localStorage.uiWidgetEditor = JSON.stringify(storage);
            }
        } catch (e) {

        }
        return value;
    }

};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/raptor.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/raptor-widget.js
/**
 *
 * @author David Neilsen - david@panmedia.co.nz
 * @author Michael Robinson - michael@panmedia.co.nz
 * @version 0.1
 * @requires jQuery
 * @requires jQuery UI
 * @requires Rangy
 */

/**
 * Set to true when raptor is reloading the page after it has disabled editing.
 *
 * @type Boolean
 */
var disabledReloading = false;

/**
 * @class
 */
var RaptorWidget = {

    /**
     * @constructs RaptorWidget
     */
    _init: function() {
        // Prevent double initialisation
        if (this.element.attr('data-raptor-initialised')) {
            // <debug/>
            return;
        }
        this.element.attr('data-raptor-initialised', true);

        // Add the editor instance to the global list of instances
        if ($.inArray(this, Raptor.instances) === -1) {
            Raptor.instances.push(this);
        }

        var currentInstance = this;

        // <strict/>

        // Set the initial locale
        var locale = this.persist('locale') || this.options.initialLocale;
        if (locale) {
            currentLocale = locale;
        }

        var options = this.options;
        if (this.options.preset) {
            this.options = $.extend(true, {}, Raptor.globalDefaults, Raptor.presets[this.options.preset], this.options);
        } else {
            this.options = $.extend(true, {}, Raptor.globalDefaults, Raptor.defaults, this.options);
        }
        if (options.layouts && options.layouts.toolbar && options.layouts.toolbar.uiOrder) {
            this.options.layouts.toolbar.uiOrder = options.layouts.toolbar.uiOrder;
        }

        // Give the element a unique ID
        if (!this.element.attr('id')) {
            this.element.attr('id', elementUniqueId());
        }

        // Initialise properties
        this.ready = false;
        this.events = {};
        this.plugins = {};
        this.layouts = {};
        this.templates = $.extend({}, Raptor.templates);
        this.target = this.element;
        this.layout = null;
        this.previewState = null;
        this.pausedState = null;
        this.pausedScrollX = null;
        this.pausedScrollY = null;

        // True if editing is enabled
        this.enabled = false;

        // True if editing is enabled at least once
        this.initialised = false;

        // List of UI objects bound to the editor
        this.uiObjects = {};

        // List of hotkeys bound to the editor
        this.hotkeys = {};
        this.hotkeysSuspended = false;

        // If hotkeys are enabled, register any custom hotkeys provided by the user
        if (this.options.enableHotkeys) {
            this.registerHotkey(this.hotkeys);
        }

        // Bind default events
        for (var name in this.options.bind) {
            this.bind(name, this.options.bind[name]);
        }

        // Undo stack, redo pointer
        this.history = [];
        this.present = 0;
        this.historyEnabled = true;

        // Check for browser support
        if (!isSupported()) {
            // @todo If element isn't a textarea, replace it with one
            return;
        }

        // Store the original HTML
        this.setOriginalHtml(this.element.is(':input') ? this.element.val() : this.element.html());
        this.historyPush(this.getOriginalHtml());

        // Replace textareas/inputs with a div
        if (this.element.is(':input')) {
            this.replaceOriginal();
        }

        // Load plugins
        this.loadPlugins();

        // Stores if the current state of the content is clean
        this.dirty = false;

        // Stores the previous state of the content
        this.previousContent = null;

        // Stores the previous selection
        this.previousSelection = null;

        this.getElement().addClass('raptor-editable-block');

        this.loadLayouts();

        // Fire the ready event
        this.ready = true;
        this.fire('ready');

        // Automatically enable the editor if autoEnable is true
        if (this.options.autoEnable) {
            $(function() {
                currentInstance.enableEditing();
            });
        }
    },

    /*========================================================================*\
     * Core functions
    \*========================================================================*/

    /**
     * Attaches the editor's internal events.
     *
     * @fires RaptorWidget#resize
     */
    attach: function() {
        this.bind('change', this.historyPush);

        this.getElement().on('click.raptor', 'img', function(event) {
            selectionSelectOuter(event.target);
            this.checkSelectionChange();
        }.bind(this));
        this.getElement().on('focus.raptor', this.showLayout.bind(this));
        this.target.on('mouseup.raptor', this.checkSelectionChange.bind(this));
        this.target.on('input.raptor', this.checkChange.bind(this));

        // Unload warning
        $(window).bind('beforeunload', Raptor.unloadWarning.bind(Raptor));

        // Trigger editor resize when window is resized
        var editor = this;
        $(window).resize(function(event) {
            editor.fire('resize');
        });
    },

    /**
     * Detaches the editor's internal events.
     */
    detach: function() {
        this.unbind('change');
        this.getElement().off('click.raptor', 'img');
        this.getElement().off('focus.raptor');
        this.getElement().blur();

        this.target.off('mouseup.raptor');
        this.target.off('keyup.raptor');
    },

    /**
     * Reinitialises the editor, unbinding all events, destroys all UI and plugins
     * then recreates them.
     */
    localeChange: function() {
        if (!this.ready) {
            // If the edit is still initialising, wait until its ready
            var localeChange;
            localeChange = function() {
                // Prevent reinit getting called twice
                this.unbind('ready', localeChange);
                this.localeChange();
            };
            this.bind('ready', localeChange);
            return;
        }

        this.actionPreviewRestore();
        var visibleLayouts = [];
        for (var name in this.layouts) {
            if (this.layouts[name].isVisible()) {
                visibleLayouts.push(name);
            }
        }
        this.layoutsDestruct();
        this.events = {};
        this.plugins = {};
        this.uiObjects = {};
        this.hotkeys = {};
        this.loadPlugins();
        this.loadLayouts();
        for (var i = 0; i < visibleLayouts.length; i++) {
            this.layouts[visibleLayouts[i]].show();
        }
        this.checkSelectionChange();
    },

    /**
     * Restore focus to the element being edited.
     */
    restoreFocus: function() {
        this.getElement().focus();
    },

    /**
     * Returns the current content editable element, which will be either the
     * orignal element, or the div the orignal element was replaced with.
     * @returns {jQuery} The current content editable element
     */
    getElement: function() {
        return this.target;
    },

    getNode: function() {
        return this.target[0];
    },

    /**
     *
     */
    getOriginalElement: function() {
        return this.element;
    },

    /**
     * Replaces the original element with a content editable div. Typically used
     * to replace a textarea.
     */
    replaceOriginal: function() {
        if (!this.target.is(':input')) return;

        // Create the replacement div
        var target = $('<div/>')
            // Set the HTML of the div to the HTML of the original element, or if the original element was an input, use its value instead
            .html(this.element.val())
            // Insert the div before the original element
            .insertBefore(this.element)
            // Give the div a unique ID
            .attr('id', elementUniqueId())
            // Copy the original elements class(es) to the replacement div
            .addClass(this.element.attr('class'))
            // Add custom classes
            .addClass(this.options.classes);

        var style = elementGetStyles(this.element);
        for (var i = 0; i < this.options.replaceStyle.length; i++) {
            target.css(this.options.replaceStyle[i], style[this.options.replaceStyle[i]]);
        }

        this.element.hide();
        this.bind('change', function() {
            if (this.getOriginalElement().is(':input')) {
                this.getOriginalElement().val(this.getHtml()).trigger('input');
            } else {
                this.getOriginalElement().html(this.getHtml());
            }
        });

        this.target = target;
    },

    checkSelectionChange: function() {
        // Check if the caret has changed position
        var currentSelection = rangy.serializeSelection(null, false);
        if (this.previousSelection !== currentSelection) {
            this.fire('selectionChange');
        }
        this.previousSelection = currentSelection;
    },

    /**
     * Determine whether the editing element's content has been changed.
     */
    checkChange: function() {
        // Get the current content
        var currentHtml = this.getHtml();

        // Check if the dirty state has changed
        var wasDirty = this.dirty;

        // Check if the current content is different from the original content
        this.dirty = this.originalHtml !== currentHtml;

        // If the current content has changed since the last check, fire the change event
        if (this.previousHtml !== currentHtml) {
            this.previousHtml = currentHtml;
            this.fire('change', [currentHtml]);

            // If the content was changed to its original state, fire the cleaned event
            if (wasDirty !== this.dirty) {
                if (this.dirty) {
                    this.fire('dirty');
                } else {
                    this.fire('cleaned');
                }
            }

            this.checkSelectionChange();
        }
    },

    change: function() {
        this.fire('change', [this.getHtml()]);
    },

    /*========================================================================*\
     * Destructor
    \*========================================================================*/

    /**
     * Hides the toolbar, disables editing, and fires the destroy event, and unbinds any events.
     * @public
     */
    destruct: function(reinitialising) {
        this.disableEditing();

        // Trigger destroy event, for plugins to remove them selves
        this.fire('destroy');

        // Remove all event bindings
        this.events = {};

        // Unbind all events
        this.getElement().off('.raptor');

        if (this.getOriginalElement().is(':input')) {
            this.target.remove();
            this.target = null;
            this.element.show();
        }

        this.layoutsDestruct();
    },

    /**
     * Runs destruct, then calls the UI widget destroy function.
     * @see $.
     */
//    destroy: function() {
//        this.destruct();
//        $.Widget.prototype.destroy.call(this);
//    },

    /*========================================================================*\
     * Preview functions
    \*========================================================================*/

    actionPreview: function(action) {
        this.actionPreviewRestore();
        try {
            var ranges = this.fire('selectionCustomise');
            if (ranges.length > 0) {
                this.previewState = actionPreview(this.previewState, this.target, function() {
                    for (var i = 0, l = ranges.length; i < l; i++) {
                        rangy.getSelection().setSingleRange(ranges[i]);
                        this.selectionConstrain();
                        action();
                    }
                }.bind(this));
            } else {
                this.selectionConstrain();
                this.previewState = actionPreview(this.previewState, this.target, action);
            }
            this.checkSelectionChange();
        } catch (exception) {
            // <strict/>
        }
    },

    actionPreviewRestore: function() {
        if (this.previewState) {
            this.target = actionPreviewRestore(this.previewState, this.target);
            this.previewState = null;
            this.checkSelectionChange();
        }
    },

    actionApply: function(action) {
        this.actionPreviewRestore();
        var state = this.stateSave();
        try {
            var ranges = this.fire('selectionCustomise');
            if (ranges.length > 0) {
                actionApply(function() {
                    for (var i = 0, l = ranges.length; i < l; i++) {
                        rangy.getSelection().setSingleRange(ranges[i]);
                        this.selectionConstrain();
                        actionApply(action, this.history);
                    }
                }.bind(this), this.history);
            } else {
                this.selectionConstrain();
                actionApply(action, this.history);
            }
            this.checkChange();
        } catch (exception) {
            this.stateRestore(state);
            // <strict/>
        }
    },

    actionUndo: function() { },

    actionRedo: function() { },

    stateSave: function() {
        this.selectionConstrain();
        return stateSave(this.target);
    },

    stateRestore: function(state) {
        // if (!this.isEditing()) {
        //     return;
        // }
        var restoredState = stateRestore(this.target, state),
            selection = rangy.getSelection();
        this.target = restoredState.element;
        if (restoredState.ranges !== null) {
            selection.setRanges(restoredState.ranges);
            selection.refresh();
        }
    },

    selectionConstrain: function() {
        selectionConstrain(this.target[0]);
    },

    pause: function() {
        if (!this.pausedState) {
            this.pausedState = this.stateSave()
            this.suspendHotkeys();
            // <jquery-ui>
            // Hack to fix when a dialog is closed, the editable element is focused, and the scroll jumps to the top
            this.pausedScrollX = window.scrollX;
            this.pausedScrollY = window.scrollY;
            // </jquery-ui>
        }
    },

    resume: function() {
        if (this.pausedState) {
            this.stateRestore(this.pausedState);
            this.pausedState = null;
            this.resumeHotkeys();
            this.restoreFocus();
            // <jquery-ui>
            window.scrollTo(this.pausedScrollX, this.pausedScrollY);
            // </jquery-ui>
        }
    },

    /*========================================================================*\
     * Persistance Functions
    \*========================================================================*/

    /**
     * @param {String} key
     * @param {mixed} [value]
     * @returns {mixed}
     */
    persist: function(key, value) {
        if (!this.options.persistence) return null;
        return Raptor.persist(key, value, this.options.namespace);
    },

    /*========================================================================*\
     * Other Functions
    \*========================================================================*/

    /**
     *
     */
    enableEditing: function() {
        if (!this.enabled) {
            this.fire('enabling');

            // Attach core events
            this.attach();

            this.enabled = true;

            this.getElement()
                .addClass(this.options.baseClass + '-editing')
                .addClass(this.options.classes);

            if (this.options.partialEdit) {
                this.getElement().find(this.options.partialEdit).prop('contenteditable', true);
            } else {
                this.getElement().prop('contenteditable', true);
            }

            if (!this.initialised) {
                this.initialised = true;
//                try {
//                    document.execCommand('enableInlineTableEditing', false, false);
//                    document.execCommand('styleWithCSS', true, true);
//                } catch (error) {
//                    // <strict/>
//                }

                for (var name in this.plugins) {
                    this.plugins[name].enable();
                }

                this.bindHotkeys();

                this.getElement().closest('form').on('submit.raptor', function() {
                    clean(this.getElement());
                    this.fire('change', [this.getHtml()]);
                }.bind(this));
            }

            clean(this.getElement());
            this.fire('enabled');
            this.showLayout();

            var selectNode = this.options.partialEdit ? this.getElement().find('[contenteditable]')[0] : this.getNode();
            switch (this.options.autoSelect) {
                case 'all': {
                    selectionSelectInner(selectNode);
                    break;
                }
                case 'start': {
                    var selectInnerNode = $(selectNode).find('*:first')[0];
                    if (!selectInnerNode) {
                        selectionSelectInner(selectNode);
                        break;
                    }
                    var range = rangy.createRange();
                    range.setStartBefore(selectInnerNode);
                    range.setEndBefore(selectInnerNode);
                    selectionSet(range);
                    break;
                }
                case 'end': {
                    var selectInnerNode = $(selectNode).find('*:last')[0];
                    if (!selectInnerNode) {
                        selectionSelectInner(selectNode);
                        break;
                    }
                    selectionSelectInner(selectInnerNode);
                    var range = rangy.createRange();
                    range.setStartAfter(selectInnerNode);
                    range.setEndAfter(selectInnerNode);
                    selectionSet(range);
                    break;
                }
            }
        }
    },

    /**
     *
     */
    disableEditing: function() {
        if (this.enabled) {
            this.detach();
            this.enabled = false;
            this.getElement()
                .prop('contenteditable', false)
                .removeClass(this.options.baseClass + '-editing')
                .removeClass(this.options.classes);
            rangy.getSelection().removeAllRanges();
            this.fire('disabled');
            if (this.options.reloadOnDisable && !disabledReloading) {
                disabledReloading = true;
                window.location.reload();
            }
        }
    },

    cancelEditing: function() {
        this.unify(function(raptor) {
            raptor.stopEditing();
        });
    },

    stopEditing: function() {
        this.fire('cancel');
        if (!this.options.reloadOnDisable) {
            this.resetHtml();
        }
        this.disableEditing();
        this.dirty = false;
        selectionDestroy();
    },

    /**
     *
     * @returns {boolean}
     */
    isEditing: function() {
        return this.enabled;
    },

    /**
     * @param {jQuerySelector|jQuery|Element} element
     * @returns {boolean}
     */
    isRoot: function(element) {
        return this.getElement()[0] === $(element)[0];
    },

    /**
     * @param {function} callback
     * @param {boolean} [callSelf]
     */
    unify: function(callback, callSelf) {
        if (callSelf !== false) {
            callback(this);
        }
        if (this.options.unify) {
            var currentInstance = this;
            Raptor.eachInstance(function(instance) {
                if (instance === currentInstance) {
                    return;
                }
                if (instance.options.unify) {
                    callback(instance);
                }
            });
        }
    },

    /*========================================================================*\
     * Layout
    \*========================================================================*/
    getLayout: function(type) {
        // <strict/>
        return this.layouts[type];
    },

    loadLayouts: function() {
        for (var name in this.options.layouts) {
            if (typeof Raptor.layouts[name] === 'undefined') {
                // <strict/>
                continue;
            }
            this.layouts[name] = this.prepareComponent(Raptor.layouts[name], this.options.layouts[name], 'layout').instance;

            if (this.layouts[name].hotkeys) {
                this.registerHotkey(this.layouts[name].hotkeys, null, this.layouts[name]);
            }
        }
    },

    layoutsDestruct: function() {
        for (var name in this.layouts) {
            this.layouts[name].destruct();
        }
    },

    prepareComponent: function(component, componentOptions, prefix) {
        var instance = $.extend({}, component);

        var options = $.extend({}, this.options, {
            baseClass: this.options.baseClass + '-' + prefix + '-' + stringFromCamelCase(component.name)
        }, instance.options, componentOptions);

        instance.raptor = this;
        instance.options = options;
        // <strict/>
        var init = instance.init();

        return {
            init: init,
            instance: instance
        };
    },

    /**
     * Show the layout for the current element.
     */
    showLayout: function() {
        // <debug/>

        // If unify option is set, hide all other layouts first
        this.unify(function(raptor) {
            raptor.fire('layoutHide');
        }, false);

        this.fire('layoutShow');

        this.fire('resize');
        if (typeof this.getElement().attr('tabindex') === 'undefined') {
            this.getElement().attr('tabindex', -1);
        }
    },

    /*========================================================================*\
     * Template functions
    \*========================================================================*/

    /**
     * @param {String} name
     * @param {Object} variables
     */
    getTemplate: function(name, variables) {
        if (!this.templates[name]) {
            this.templates[name] = templateGet(name, this.options.urlPrefix);
        }
        // <strict/>
        return templateConvertTokens(this.templates[name], variables);
    },

    /*========================================================================*\
     * History functions
    \*========================================================================*/

    /**
     *
     */
    historyPush: function() {
        if (!this.historyEnabled) return;
        var html = this.getHtml();
        if (html !== this.historyPeek()) {
            // Reset the future on change
            if (this.present !== this.history.length - 1) {
                this.history = this.history.splice(0, this.present + 1);
            }

            // Add new HTML to the history
            this.history.push(this.getHtml());

            // Mark the persent as the end of the history
            this.present = this.history.length - 1;

            this.fire('historyChange');
        }
    },

    /**
     * @returns {String|null}
     */
    historyPeek: function() {
        if (!this.history.length) return null;
        return this.history[this.present];
    },

    /**
     *
     */
    historyBack: function() {
        if (this.present > 0) {
            this.present--;
            this.setHtml(this.history[this.present]);
            this.historyEnabled = false;
            this.change();
            this.historyEnabled = true;
            this.fire('historyChange');
        }
    },

    /**
     *
     */
    historyForward: function() {
        if (this.present < this.history.length - 1) {
            this.present++;
            this.setHtml(this.history[this.present]);
            this.historyEnabled = false;
            this.change();
            this.historyEnabled = true;
            this.fire('historyChange');
        }
    },

    /*========================================================================*\
     * Hotkeys
    \*========================================================================*/

    /**
     * @param {Array|String} mixed The hotkey name or an array of hotkeys
     * @param {Object} The hotkey object or null
     */
    registerHotkey: function(mixed, action) {
        // <strict/>

        this.hotkeys[mixed] = action;
    },

    bindHotkeys: function() {
        for (var keyCombination in this.hotkeys) {
            this.getElement().on('keydown.raptor', keyCombination, function(event) {
                if (this.isEditing() && !this.hotkeysSuspended) {
                    var result = this.hotkeys[event.data]();
                    if (result !== false) {
                        event.preventDefault();
                    }
                }
            }.bind(this));
        }
    },

    /**
     * Suspend hotkey functionality.
     */
    suspendHotkeys: function() {
        // <debug/>
        this.hotkeysSuspended = true;
    },

    /**
     * Resume hotkey functionality.
     */
    resumeHotkeys: function() {
        // <debug/>
        this.hotkeysSuspended = false;
    },

    /*========================================================================*\
     * Buttons
    \*========================================================================*/

    isUiEnabled: function(ui) {
        // Check if we are not automatically enabling UI, and if not, check if the UI was manually enabled
        if (this.options.enableUi === false &&
                typeof this.options.plugins[ui] === 'undefined' ||
                this.options.plugins[ui] === false) {
            // <debug/>
            return false;
        }

        // Check if we have explicitly disabled UI
        if ($.inArray(ui, this.options.disabledUi) !== -1 ||
                $.inArray(ui, this.options.disabledPlugins) !== -1) {
            // <strict/>
            return false;
        }

        return true;
    },

    /**
     * @deprecated
     * @param  {String} ui Name of the UI object to be returned.
     * @return {Object|null} UI object referenced by the given name.
     */
    getUi: function(ui) {
        // <strict/>
        return this.uiObjects[ui];
    },

    /*========================================================================*\
     * Plugins
    \*========================================================================*/
    /**
     * @param {String} name
     * @return {Object|undefined} plugin
     */
    getPlugin: function(name) {
        return this.uiObjects[name] || this.plugins[name];
    },

    /**
     *
     */
    loadPlugins: function() {
        var editor = this;

        if (!this.options.plugins) {
            this.options.plugins = {};
        }

        for (var name in Raptor.plugins) {
            // Check if we are not automaticly enabling plugins, and if not, check if the plugin was manually enabled
            if (this.options.enablePlugins === false &&
                    typeof this.options.plugins[name] === 'undefined' ||
                    this.options.plugins[name] === false) {
                // <debug/>
                continue;
            }

            // Check if we have explicitly disabled the plugin
            if ($.inArray(name, this.options.disabledUi) !== -1 ||
                    $.inArray(name, this.options.disabledPlugins) !== -1) {
                // <strict/>
                continue;
            }

            editor.plugins[name] = this.prepareComponent(Raptor.plugins[name], editor.options.plugins[name], 'plugin').instance;
        }
    },

    /*========================================================================*\
     * Content accessors
    \*========================================================================*/

    /**
     * @returns {boolean}
     */
    isDirty: function() {
        return this.dirty;
    },

    /**
     * @returns {String}
     */
    getHtml: function() {
        return this.getElement().html();
    },

    clean: function() {
        this.actionApply(function() {
            clean(this.getElement());
        }.bind(this));
    },

    /**
     * @param {String} html
     */
    setHtml: function(html) {
        this.getElement().html(html);
        this.fire('html');
        this.checkChange();
    },

    /**
     *
     */
    resetHtml: function() {
        this.setHtml(this.getOriginalHtml());
        this.fire('cleaned');
    },

    /**
     * @returns {String}
     */
    getOriginalHtml: function() {
        return this.originalHtml;
    },

    /**
     *
     */
    saved: function(args) {
        this.setOriginalHtml(this.getHtml());
        this.dirty = false;
        this.fire('saved', args);
        this.fire('cleaned');
    },

    /**
     * @param {String} html
     */
    setOriginalHtml: function(html) {
        this.originalHtml = html;
    },

    /*========================================================================*\
     * Event handling
    \*========================================================================*/
    /**
     * @param {String} name
     * @param {function} callback
     * @param {Object} [context]
     */
    bind: function(name, callback, context) {
        if (typeof callback === 'undefined' ||
            !$.isFunction(callback)) {
            // <strict/>
            return;
        }
        var names = name.split(/,\s*/);
        for (var i = 0, l = names.length; i < l; i++) {
            if (!this.events[names[i]]) {
                this.events[names[i]] = [];
            }
            this.events[names[i]].push({
                context: context,
                callback: callback
            });
        }
    },

    /**
     * @param {String} name
     * @param {function} callback
     * @param {Object} [context]
     */
    unbind: function(name, callback, context) {
        for (var i = 0, l = this.events[name].length; i < l; i++) {
            if (this.events[name][i] &&
                this.events[name][i].callback === callback &&
                this.events[name][i].context === context) {
                this.events[name].splice(i, 1);
            }
        }
    },

    /**
     * @param {String} name
     * @param {boolean} [global]
     * @param {boolean} [sub]
     */
    fire: function(name, args) {
        var result = [];

        // <debug/>

        if (this.events[name]) {
            for (var i = 0, l = this.events[name].length; i < l; i++) {
                var event = this.events[name][i];
                if (typeof event !== 'undefined' &&
                        typeof event.callback !== 'undefined') {
                    var currentResult = event.callback.apply(event.context || this, args);
                    if (typeof currentResult !== 'undefined') {
                        result = result.concat(currentResult);
                    }
                }
            }
        }

        return result;
    }
};

$.widget('ui.raptor', RaptorWidget);
$.fn.raptor.Raptor = Raptor;;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/raptor-widget.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/layout.js
function RaptorLayout(name) {
    this.name = name;
}

RaptorLayout.prototype.init = function() {
};

RaptorLayout.prototype.destruct = function() {
};

RaptorLayout.prototype.isVisible = function() {
    return false;
};

RaptorLayout.prototype.show = function() {
};

RaptorLayout.prototype.hide = function() {
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/layout.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/plugin.js
/**
 * @fileOverview Contains the raptor plugin class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class The raptor plugin class.
 *
 * @todo type and desc for name.
 * @param {type} name
 * @param {Object} overrides Options hash.
 * @returns {RaptorPlugin}
 */
function RaptorPlugin(name, overrides) {
    this.name = name;
    for (var key in overrides) {
        this[key] = overrides[key];
    }
}

/**
 * Initialize the raptor plugin.
 */
RaptorPlugin.prototype.init = function() {};

/**
 * Enable the raptor plugin.
 */
RaptorPlugin.prototype.enable = function() {};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/plugin.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/layout/ui-group.js
function UiGroup(raptor, uiOrder) {
    this.raptor = raptor;
    this.uiOrder = uiOrder;
};

UiGroup.prototype.appendTo = function(layout, panel) {
    // Loop the UI component order option
    for (var i = 0, l = this.uiOrder.length; i < l; i++) {
        var uiGroupContainer = $('<div/>')
            .addClass(this.raptor.options.baseClass + '-layout-toolbar-group');

        // Loop each UI in the group
        var uiGroup = this.uiOrder[i];
        for (var ii = 0, ll = uiGroup.length; ii < ll; ii++) {
            // Check if the UI component has been explicitly disabled
            if (!this.raptor.isUiEnabled(uiGroup[ii])) {
                continue;
            }

            // Check the UI has been registered
            if (Raptor.ui[uiGroup[ii]]) {
                var uiOptions = this.raptor.options.plugins[uiGroup[ii]];
                if (uiOptions === false) {
                    continue;
                }

                var component = this.raptor.prepareComponent(Raptor.ui[uiGroup[ii]], uiOptions, 'ui');
                component.instance.layout = layout;

                this.raptor.uiObjects[uiGroup[ii]] = component.instance;

                if (typeIsElement(component.init)) {
                    // Fix corner classes
                    component.init.removeClass('ui-corner-all');

                    // Append the UI object to the group
                    uiGroupContainer.append(component.init);
                }
            }
            // <strict/>
        }

        // Append the UI group to the editor toolbar
        if (uiGroupContainer.children().length > 0) {
            uiGroupContainer.appendTo(panel);
        }
    }

    // Fix corner classes
    panel.find('.ui-button:first-child').addClass('ui-corner-left');
    panel.find('.ui-button:last-child').addClass('ui-corner-right');
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/layout/ui-group.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/layout/toolbar.js
/**
 * @fileOverview Toolbar layout.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

function ToolbarLayout() {
    RaptorLayout.call(this, 'toolbar');
    this.wrapper = null;
}

ToolbarLayout.prototype = Object.create(RaptorLayout.prototype);

ToolbarLayout.prototype.init = function() {
    this.raptor.bind('enabled', this.show.bind(this));
    this.raptor.bind('disabled', this.hide.bind(this));
    this.raptor.bind('layoutShow', this.show.bind(this));
    this.raptor.bind('layoutHide', this.hide.bind(this));
    $(window).resize(this.constrainPosition.bind(this));
};

ToolbarLayout.prototype.destruct = function() {
    if (this.wrapper) {
        this.wrapper.remove();
        this.wrapper = null;
    }
    this.raptor.fire('toolbarDestroy');
};

/**
 * Show the toolbar.
 *
 * @fires RaptorWidget#toolbarShow
 */
ToolbarLayout.prototype.show = function() {
    if (!this.isVisible()) {
        this.getElement().css('display', '');
        this.constrainPosition();
        this.raptor.fire('toolbarShow');
    }
};

/**
 * Hide the toolbar.
 *
 * @fires RaptorWidget#toolbarHide
 */
ToolbarLayout.prototype.hide = function() {
    if (this.isReady()) {
        this.getElement().css('display', 'none');
        this.raptor.fire('toolbarHide');
    }
};

ToolbarLayout.prototype.initDragging = function() {
    if ($.fn.draggable &&
            this.options.draggable &&
            !this.getElement().data('ui-draggable')) {
        // <debug/>
        this.getElement().draggable({
            cancel: 'a, button',
            cursor: 'move',
            stop: this.constrainPosition.bind(this)
        });
        // Remove the relative position
        this.getElement().css('position', 'fixed');

        // Set the persistent position
        var pos = this.raptor.persist('position') || this.options.dialogPosition;

        if (!pos) {
            pos = [10, 10];
        }

        // <debug/>

        if (parseInt(pos[0], 10) + this.getElement().outerHeight() > $(window).height()) {
            pos[0] = $(window).height() - this.getElement().outerHeight();
        }
        if (parseInt(pos[1], 10) + this.getElement().outerWidth() > $(window).width()) {
            pos[1] = $(window).width() - this.getElement().outerWidth();
        }

        this.getElement().css({
            top: Math.abs(parseInt(pos[0], 10)),
            left: Math.abs(parseInt(pos[1], 10))
        });
    }
};

ToolbarLayout.prototype.enableDragging = function() {
    if ($.fn.draggable &&
            this.options.draggable &&
            this.getElement().data('ui-draggable')) {
        this.getElement().draggable('enable');
    }
};

ToolbarLayout.prototype.disableDragging = function() {
    if ($.fn.draggable &&
            this.options.draggable &&
            this.getElement().is('.ui-draggable')) {
        this.getElement().draggable('disable').removeClass('ui-state-disabled');
    }
};

ToolbarLayout.prototype.isReady = function() {
    return this.wrapper !== null;
};

ToolbarLayout.prototype.isVisible = function() {
    return this.isReady() && this.getElement().is(':visible');
};

ToolbarLayout.prototype.constrainPosition = function() {
    if (this.isVisible()) {
        var x = parseInt(this.wrapper.css('left')) || -999,
            y = parseInt(this.wrapper.css('top')) || -999,
            width = this.wrapper.outerWidth(),
            height = this.wrapper.outerHeight(),
            windowWidth = $(window).width(),
            windowHeight = $(window).height(),
            newX = Math.max(0, Math.min(x, windowWidth - width)),
            newY = Math.max(0, Math.min(y, windowHeight - height));

        if (newX !== x || newY !== y) {
            this.wrapper.css({
                left: newX,
                top: newY
            });
        }

        // Save the persistent position
        this.raptor.persist('position', [
            this.wrapper.css('top'),
            this.wrapper.css('left')
        ]);
    }
};

ToolbarLayout.prototype.getElement = function() {
    if (this.wrapper === null) {
        // Load all UI components if not supplied
        if (!this.options.uiOrder) {
            this.options.uiOrder = [[]];
            for (var name in Raptor.ui) {
                this.options.uiOrder[0].push(name);
            }
        }

        // <debug/>

        var toolbar = this.toolbar = $('<div/>')
            .addClass(this.options.baseClass + '-toolbar');
        var innerWrapper = this.toolbarWrapper = $('<div/>')
            .addClass(this.options.baseClass + '-inner')
            .addClass('ui-widget-content')
            .mousedown(function(event) {
                event.preventDefault();
            })
            .append(toolbar);
        var path = this.path = $('<div/>')
            .addClass(this.options.baseClass + '-path')
            .addClass('ui-widget-header');
        var wrapper = this.wrapper = $('<div/>')
            .addClass(this.options.baseClass + '-outer ' + this.raptor.options.baseClass + '-layout')
            .css('display', 'none')
            .append(path)
            .append(innerWrapper);

        var uiGroup = new UiGroup(this.raptor, this.options.uiOrder);
        uiGroup.appendTo(this, this.toolbar);
        $('<div/>').css('clear', 'both').appendTo(this.toolbar);

        $(function() {
            wrapper.appendTo('body');
            this.initDragging();
            this.constrainPosition(true);
            this.raptor.fire('layoutReady', [this.wrapper]);
            this.raptor.fire('toolbarReady', [this]);
        }.bind(this));
    }
    return this.wrapper;
};

Raptor.registerLayout(new ToolbarLayout());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/layout/toolbar.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/layout/hover-panel.js
/**
 * @fileOverview Hover panel layout.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

function HoverPanelLayout() {
    RaptorLayout.call(this, 'hoverPanel');
    this.hoverPanel = null;
    this.visible = false;
}

HoverPanelLayout.prototype = Object.create(RaptorLayout.prototype);

HoverPanelLayout.prototype.init = function() {
    this.raptor.bind('ready', this.ready.bind(this));
    this.raptor.bind('enabled', this.enabled.bind(this));
};

HoverPanelLayout.prototype.ready = function() {
    this.raptor.getElement()
        .mouseenter(this.show.bind(this))
        .mouseleave(this.hide.bind(this));
};

HoverPanelLayout.prototype.enabled = function() {
    this.getElement().hide();
};

HoverPanelLayout.prototype.getElement = function() {
    if (this.hoverPanel === null) {
        this.hoverPanel = $('<div/>')
            .addClass(this.raptor.options.baseClass + '-layout ' + this.options.baseClass)
            .mouseleave(this.hide.bind(this));

        var uiGroup = new UiGroup(this.raptor, this.options.uiOrder);
        uiGroup.appendTo(this, this.hoverPanel);

        $(window).bind('scroll', this.position.bind(this));

        this.hoverPanel
            .appendTo('body');

        this.raptor.fire('layoutReady', [this.hoverPanel]);
    }
    return this.hoverPanel;
};

HoverPanelLayout.prototype.show = function(event) {
    if (!this.raptor.isEditing()) {
        this.visible = true;
        this.getElement().show();
        this.position();
        this.raptor.getElement().addClass(this.raptor.options.baseClass + '-editable-block-hover');
    }
};

HoverPanelLayout.prototype.hide = function(event) {
    if (!this.visible) {
        return;
    }
    if (!event) {
        return;
    }
    if ($.contains(this.getElement().get(0), event.relatedTarget)) {
        return;
    }
    if (event.relatedTarget === this.getElement().get(0)) {
        return;
    }
    if (this.getElement().get(0) === $(event.relatedTarget).parent().get(0)) {
        return;
    }
    if ($.contains(this.raptor.getElement().get(0), event.relatedTarget)) {
        return;
    }
    if (event.relatedTarget === this.raptor.getElement().get(0)) {
        return;
    }
    this.visible = false;
    this.getElement().hide();
    this.raptor.getElement().removeClass(this.raptor.options.baseClass + '-editable-block-hover');
};

HoverPanelLayout.prototype.position = function() {
    if (this.visible) {
        var visibleRect = elementVisibleRect(this.raptor.getElement());
        this.getElement().css({
            // Calculate offset center for the hoverPanel
            top:  visibleRect.top  + ((visibleRect.height / 2) - (this.getElement().outerHeight() / 2)),
            left: visibleRect.left + ((visibleRect.width / 2)  - (this.getElement().outerWidth()  / 2))
        });
    }
};

HoverPanelLayout.prototype.destruct = function() {
    if (this.hoverPanel) {
        this.hoverPanel.remove();
        this.hoverPanel = null;
    }
    this.visible = false;
};

Raptor.registerLayout(new HoverPanelLayout());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/layout/hover-panel.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/layout/element-hover-panel.js
/**
 * @fileOverview Element hover panel layout.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 */

function ElementHoverPanelLayout() {
    RaptorLayout.call(this, 'elementHoverPanel');
    this.elements = 'img';
    this.hoverPanel = null;
    this.visible = false;
    this.target = null;
    this.enabled = true;
}

ElementHoverPanelLayout.prototype = Object.create(RaptorLayout.prototype);

ElementHoverPanelLayout.prototype.init = function() {
    this.raptor.bind('ready', this.ready.bind(this));
};

ElementHoverPanelLayout.prototype.ready = function() {
    this.raptor.getElement()
        .on('mouseenter', this.options.elements, this.show.bind(this))
        .on('mouseleave', this.options.elements, this.hide.bind(this));
};

ElementHoverPanelLayout.prototype.getElement = function() {
    if (this.hoverPanel === null) {
        this.hoverPanel = $('<div/>')
            .addClass(this.raptor.options.baseClass + '-layout raptor-layout-hover-panel ' + this.options.baseClass)
            .mouseleave(this.hide.bind(this));

        var uiGroup = new UiGroup(this.raptor, this.options.uiOrder);
        uiGroup.appendTo(this, this.hoverPanel);

        $(window).bind('scroll', this.position.bind(this));

        this.hoverPanel
            .appendTo('body');

        this.raptor.fire('layoutReady', [this.hoverPanel]);
    }
    return this.hoverPanel;
};

ElementHoverPanelLayout.prototype.show = function(event) {
    if (this.enabled && this.raptor.isEditing()) {
        this.target = event.target;
        this.visible = true;
        elementPositionOver(this.getElement().show(), $(this.target));
    }
};

ElementHoverPanelLayout.prototype.hide = function(event) {
    if (!this.visible) {
        return;
    }
    if (event) {
        if ($.contains(this.getElement().get(0), event.relatedTarget)) {
            return;
        }
        if (event.relatedTarget === this.getElement().get(0)) {
            return;
        }
        if (this.getElement().get(0) === $(event.relatedTarget).parent().get(0)) {
            return;
        }
        if ($.contains(this.raptor.getElement().get(0), event.relatedTarget)) {
            return;
        }
        if (event.relatedTarget === this.raptor.getElement().get(0)) {
            return;
        }
    }
    this.visible = false;
    this.getElement().hide();
};

ElementHoverPanelLayout.prototype.close = function() {
    if (this.visible) {
        this.enabled = false;
        this.visible = false;
        this.getElement().hide();
        setTimeout(function() {
            this.enabled = true;
        }.bind(this), 1000);
    }
};

ElementHoverPanelLayout.prototype.position = function() {
    if (this.visible) {
        elementPositionOver(this.getElement(), $(this.target));
    }
};

ElementHoverPanelLayout.prototype.destruct = function() {
    if (this.hoverPanel) {
        this.hoverPanel.remove();
        this.hoverPanel = null;
    }
    this.visible = false;
};

Raptor.registerLayout(new ElementHoverPanelLayout());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/layout/element-hover-panel.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/button.js
/**
 * @fileOverview Contains the core button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class The core button class.
 *
 * @param {Object} overrides Options hash.
 */
function Button(overrides) {
    this.text = false;
    this.label = null;
    this.icon = null;
    this.hotkey = null;
    for (var key in overrides) {
        this[key] = overrides[key];
    }
}

/**
 * Initialize the button.
 *
 * @return {Element}
 */
Button.prototype.init = function() {
    // Bind hotkeys
    if (typeof this.hotkey === 'string') {
        this.raptor.registerHotkey(this.hotkey, this.action.bind(this));
    } else if (typeIsArray(this.hotkey)) {
        for (var i = 0, l = this.hotkey.length; i < l; i++) {
            this.raptor.registerHotkey(this.hotkey[i], this.action.bind(this));
        }
    }

    // Return the button
    return this.getButton();
};

/**
 * Prepare and return the button Element to be used in the Raptor UI.
 *
 * @return {Element}
 */
Button.prototype.getButton = function() {
    if (!this.button) {
        var text = this.text || this.translate('Text', false);
        this.button = $('<div>')
            .html(text)
            .addClass(this.options.baseClass)
            .attr('title', this.getTitle())
            .click(this.click.bind(this));
        aButton(this.button, {
            icons: {
                primary: this.getIcon()
            },
            text: text,
            label: this.label
        });
    }
    return this.button;
};

/**
 * @return {String} The button's title property value, or if not present then the
 *   localized value for the button's name + Title.
 */
Button.prototype.getTitle = function() {
    return this.title || this.translate('Title');
};

/**
 * @return {String} The button's icon property value, or the ui-icon- prefix
 *   with the button's camel cased name appended.
 */
Button.prototype.getIcon = function() {
    if (this.icon === null) {
        return 'ui-icon-' + stringCamelCaseConvert(this.name);
    }
    return this.icon;
};

/**
 * Perform the button's action.
 *
 * @todo this probably should not nest actions
 */
Button.prototype.click = function() {
    if (aButtonIsEnabled(this.button)) {
        this.raptor.actionApply(this.action.bind(this));
    }
};

Button.prototype.translate = function(translation, variables) {
    return tr(this.name + translation, variables);
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/preview-button.js
/**
 * @fileOverview Contains the preview button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class the preview button class.
 *
 * @constructor
 * @augments Button
 *
 * @param {Object} options
 */
function PreviewButton(options) {
    this.preview = true;
    this.previewing = false;
    Button.call(this, options);
}

PreviewButton.prototype = Object.create(Button.prototype);

/**
 * Initialize the toggle preview button.
 *
 * @returns {Element}
 */
PreviewButton.prototype.init = function() {
    this.preview = typeof this.options.preview === 'undefined' ? true : false;
    return Button.prototype.init.apply(this, arguments);
};

/**
 * Prepare and return the preview button Element to be used in the Raptor UI.
 *
 * @returns {Element}
 */
PreviewButton.prototype.getButton = function() {
    if (!this.button) {
        this.button = Button.prototype.getButton.call(this)
            .mouseenter(this.mouseEnter.bind(this))
            .mouseleave(this.mouseLeave.bind(this));
    }
    return this.button;
};

/**
 * Sets the mouse enter function to enable the preview.
 */
PreviewButton.prototype.mouseEnter = function() {
    if (this.canPreview()) {
        this.previewing = true;
        this.raptor.actionPreview(this.action.bind(this));
    }
};

/**
 * Sets the mouse leave function to disable the preview.
 */
PreviewButton.prototype.mouseLeave = function() {
    this.previewing = false;
    this.raptor.actionPreviewRestore();
};

/**
 * Sets the click function to disable the preview and apply the style.
 *
 * @returns {Element}
 */
PreviewButton.prototype.click = function() {
    this.previewing = false;
    this.raptor.actionPreviewRestore();
    return Button.prototype.click.apply(this, arguments);
};

/**
 * Checks if the Element is able to generate a preview.
 *
 * @todo check as i guessed this.
 * @returns {Boolean} True if preview available.
 */
PreviewButton.prototype.canPreview = function() {
    return this.preview;
};
/**
 * Checks if the Element is in it's preview state.
 *
 * @todo check as i guessed this.
 * @returns {Boolean} True if in previewing state.
 */
PreviewButton.prototype.isPreviewing = function() {
    return this.previewing;
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/preview-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/toggle-button.js
/**
 * @fileOverview Contains the core button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * The toggle button class.
 *
 * @constructor
 * @augments Button
 *
 * @param {Object} options
 */
function ToggleButton(options) {
    this.disable = false;
    Button.call(this, options);
}

ToggleButton.prototype = Object.create(Button.prototype);

/**
 * Initialize the toggle button.
 *
 * @returns {Element}
 */
ToggleButton.prototype.init = function() {
    this.raptor.bind('selectionChange', this.selectionChange.bind(this));
    return Button.prototype.init.apply(this, arguments);
};

/**
 * Changes the state of the button depending on whether it is active or not.
 */
ToggleButton.prototype.selectionChange = function() {
    if (this.selectionToggle()) {
        aButtonActive(this.button);
        if (this.disable) {
            aButtonEnable(this.button);
        }
    } else {
        aButtonInactive(this.button);
        if (this.disable) {
            aButtonDisable(this.button);
        }
    }
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/toggle-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/preview-toggle-button.js
/**
 * @fileOverview Contains the preview toggle button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class the preview toggle button class.
 *
 * @constructor
 * @augments PreviewButton
 *
 * @param {Object} options
 */
function PreviewToggleButton(options) {
    PreviewButton.call(this, options);
}

PreviewToggleButton.prototype = Object.create(PreviewButton.prototype);

/**
 * Initialize the toggle preview button.
 *
 * @returns {Element}
 */
PreviewToggleButton.prototype.init = function() {
    this.raptor.bind('selectionChange', this.selectionChange.bind(this));
    return PreviewButton.prototype.init.apply(this, arguments);
};

/**
 * Sets the state of the button to active when preview is enabled.
 */
PreviewToggleButton.prototype.selectionChange = function() {
    if (this.selectionToggle()) {
        if (!this.isPreviewing()) {
            aButtonActive(this.button);
        }
    } else {
        aButtonInactive(this.button);
    }
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/preview-toggle-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/filtered-preview-button.js
/**
 * @fileOverview Contains the filtered preview button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class the filtered preview button class.
 *
 * @constructor
 * @augments PreviewButton
 *
 * @param {Object} options
 */
function FilteredPreviewButton(options) {
    Button.call(this, options);
}

FilteredPreviewButton.prototype = Object.create(PreviewButton.prototype);

/**
 * Initialize the filtered preview button.
 *
 * @returns {Element} result
 */
FilteredPreviewButton.prototype.init = function() {
    var result = PreviewButton.prototype.init.apply(this, arguments);
    this.raptor.bind('selectionChange', this.selectionChange.bind(this));
    return result;
};

/**
 * Toggles the button's disabled state.
 */
FilteredPreviewButton.prototype.selectionChange = function() {
    if (this.isEnabled()) {
        aButtonEnable(this.button);
    } else {
        aButtonDisable(this.button);
    }
};

// <strict/>


/**
 * @returns {Boolean} True if preview available and if the button is enabled, false otherwise.
 */
FilteredPreviewButton.prototype.canPreview = function() {
    return PreviewButton.prototype.canPreview.call(this) && this.isEnabled();
};

/**
 * @returns {Boolean} True if button is enabled, false otherwise.
 */
FilteredPreviewButton.prototype.isEnabled = function() {
    var range = rangeGet();
    if (range) {
        return !!this.getElement(range);
    }
    return !!this.previewing;
};

/**
 * Perform the button's action.
 */
FilteredPreviewButton.prototype.action = function() {
    selectionEachRange(function(range) {
        var element = this.getElement(range);
        if (element) {
            this.applyToElement(element);
        }
    }.bind(this));
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/filtered-preview-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/css-class-applier-button.js
/**
 * @fileOverview Contains the CSS class applier button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class The CSS class applier button.
 *
 * @constructor
 * @augments PreviewToggleButton
 * @param {Object} options
 */
function CSSClassApplierButton(options) {
    PreviewToggleButton.call(this, options);
}

CSSClassApplierButton.prototype = Object.create(PreviewToggleButton.prototype);

/**
 * Applies the class from the button to a selection.
 */
CSSClassApplierButton.prototype.action = function() {
    selectionExpandToWord();
    this.raptor.selectionConstrain();
    for (var i = 0, l = this.classes.length; i < l; i++) {
        var applier = rangy.createCssClassApplier(this.options.cssPrefix + this.classes[i], {
            elementTagName: this.tag || 'span'
        });
        applier.toggleSelection();
    }
};

/**
 * Checks whether a class has been applied to a selection.
 *
 * @returns {Boolean} True if the css has been applied to the selection, false otherwise.
 */
CSSClassApplierButton.prototype.selectionToggle = function() {
    for (var i = 0, l = this.classes.length; i < l; i++) {
        var applier = rangy.createCssClassApplier(this.options.cssPrefix + this.classes[i], {
            elementTagName: this.tag || 'span'
        });
        if (!applier.isAppliedToSelection()) {
            return false;
        }
    }
    return true;
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/css-class-applier-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/dialog-button.js
/**
 * @fileOverview Contains the dialog button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @type {Object} Container for Raptor dialogs.
 */
var dialogs = {};

/**
 * @class
 *
 * @constructor
 * @augments Button
 * @param {Object} options
 * @returns {DialogButton}
 */
function DialogButton(options) {
    this.state = null;
    Button.call(this, options);
}

DialogButton.prototype = Object.create(Button.prototype);

/**
 * A dialog button's action is to open a dialog, no content is modified at this
 * stage.
 */
DialogButton.prototype.action = function() {
    this.openDialog();
};

// <strict/>

/**
 * Checks the validility of a dialog.
 *
 * @param {type} dialog
 * @returns {Boolean} True if dialog is valid, false otherwise.
 */
DialogButton.prototype.validateDialog = function(dialog) {
    return true;
};

/**
 * Opens a dialog.
 *
 * @param {Object} dialog The dialog to open.
 */
DialogButton.prototype.openDialog = function() {
    this.raptor.pause();
    aDialogOpen(this.getDialog());
};

DialogButton.prototype.onDialogClose = function() {
    dialogs[this.name].instance.raptor.resume();
};

DialogButton.prototype.okButtonClick = function(event) {
    var valid = dialogs[this.name].instance.validateDialog();
    if (valid === true) {
        aDialogClose(dialogs[this.name].dialog);
        dialogs[this.name].instance.applyAction.call(dialogs[this.name].instance, dialogs[this.name].dialog);
    }
};

DialogButton.prototype.closeDialog = function() {
    aDialogClose(dialogs[this.name].dialog);
};

DialogButton.prototype.cancelButtonClick = DialogButton.prototype.closeDialog;

/**
 * Prepare and return the dialog's OK button's initialisation object.
 *
 * @param {String} name
 * @returns {Object} The initiialisation object for this dialog's OK button.
 */
DialogButton.prototype.getOkButton = function(name) {
    return {
        text: tr(name + 'DialogOKButton'),
        click: this.okButtonClick.bind(this),
        icons: {
            primary: 'ui-icon-circle-check'
        }
    };
};

/**
 * Prepare and return the dialog's cancel button's initialisation object.
 *
 * @param {String} name
 * @returns {Object} The initiialisation object for this dialog's cancel button.
 */
DialogButton.prototype.getCancelButton = function(name) {
    return {
        text: tr(name + 'DialogCancelButton'),
        click: this.cancelButtonClick.bind(this),
        icons: {
            primary: 'ui-icon-circle-close'
        }
    };
};

/**
 * Prepare and return the dialogs default options to be used in the Raptor UI.
 *
 * @param {String} name The name of the dialog to have the default options applied to it.
 * @returns {Object} the default options for the dialog.
 */
DialogButton.prototype.getDefaultDialogOptions = function(name) {
    var options = {
        modal: true,
        resizable: true,
        autoOpen: false,
        title: tr(name + 'DialogTitle'),
        dialogClass: this.options.baseClass + '-dialog ' + this.options.dialogClass,
        close: this.onDialogClose.bind(this),
        buttons: []
    };
    var okButton = this.getOkButton(name),
        cancelButton = this.getCancelButton(name);
    if (typeof okButton !== 'undefined' && okButton !== false) {
        options.buttons.push(okButton);
    }
    if (typeof cancelButton !== 'undefined' && cancelButton !== false) {
        options.buttons.push(cancelButton);
    }
    return options;
};

/**
 * Prepare and return the dialog to be used in the Raptor UI.
 *
 * @returns {Element} The dialog.
 */
DialogButton.prototype.getDialog = function() {
    if (typeof dialogs[this.name] === 'undefined') {
        dialogs[this.name] = {
            dialog: $(this.getDialogTemplate())
        };
        aDialog(dialogs[this.name].dialog, $.extend(this.getDefaultDialogOptions(this.name), this.dialogOptions));
    }
    dialogs[this.name].instance = this;
    return dialogs[this.name].dialog;
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/dialog-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/dialog-toggle-button.js
/**
 * @fileOverview Contains the dialog toggle button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class
 *
 * @constructor
 * @augments DialogButton
 * @augments ToggleButton
 *
 * @param {type} options
 */
function DialogToggleButton(options) {
    DialogButton.call(this, options);
    ToggleButton.call(this, options);
}

DialogToggleButton.prototype = Object.create(DialogButton.prototype);

DialogToggleButton.prototype.init = ToggleButton.prototype.init;

DialogToggleButton.prototype.selectionChange = ToggleButton.prototype.selectionChange;
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/dialog-toggle-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/menu-button.js
/**
 * @fileOverview Contains the menu button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @constructor
 * @augments Button
 *
 * @param {Menu} menu The menu to create the menu button for.
 * @param {Object} options
 */
function MenuButton(menu, options) {
    this.menu = menu;
    this.name = menu.name;
    this.raptor = menu.raptor;
    this.options = menu.options;
    Button.call(this, options);
}

MenuButton.prototype = Object.create(Button.prototype);

/**
 * Shows the menu when button is clicked.
 *
 * @param {Event} event The click event.
 */
MenuButton.prototype.click = function(event) {
    if (this.menu.getMenu().is(':visible')) {
        $('.raptor-menu').hide();
    } else {
        this.menu.show();
    }
    event.preventDefault();
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/menu-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/menu.js
/**
 * @fileOverview Contains the menu class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class
 * @constructor
 *
 * @param {Object} options
 * @returns {Menu}
 */
function Menu(options) {
    this.menu = null;
    this.menuContent = '';
    this.button = null;
    for (var key in options) {
        this[key] = options[key];
    }
}

/**
 * Initialize the menu.
 *
 * @returns {MenuButton}
 */
Menu.prototype.init = function() {
    this.setOptions();
    var button = this.getButton().init();
    button.addClass('raptor-menu-button');
    return button;
};

/**
 * Prepare and return the menu's button Element to be used in the Raptor UI.
 *
 * @returns {MenuButton}
 */
Menu.prototype.getButton = function() {
    if (!this.button) {
        this.button = new MenuButton(this);
    }
    return this.button;
};

/**
 * Applies options to the menu.
 */
Menu.prototype.setOptions = function() {
    this.options.title = tr(this.name + 'Title');
    this.options.icon = 'ui-icon-' + this.name;
};

/**
 * Prepare and return the menu Element to be used in the Raptor UI.
 *
 * @returns {Element}
 */
Menu.prototype.getMenu = function() {
    if (!this.menu) {
        this.menu = $('<div>')
            .addClass('ui-menu ui-widget ui-widget-content ui-corner-all ' + this.options.baseClass + '-menu ' + this.raptor.options.baseClass + '-menu')
            .html(this.menuContent)
            .css('position', 'fixed')
            .hide()
            .mousedown(function(event) {
                // Prevent losing the selection on the editor target
                event.preventDefault();
            })
            .children()
            .appendTo('body');
    }
    return this.menu;
};

/**
 * Display menu.
 */
Menu.prototype.show = function() {
    $('.raptor-menu').hide();
    elementPositionUnder(this.getMenu().toggle(), this.getButton().getButton());
};

/**
 * Click off close event.
 *
 * @param {Event} event The click event.
 */
$('html').click(function(event) {
    if (!$(event.target).hasClass('raptor-menu-button') &&
            $(event.target).closest('.raptor-menu-button').length === 0) {
        $('.raptor-menu').hide();
    }
});
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/menu.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/custom-menu.js
/**
 * @fileOverview Contains the custom menu class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class The custom menu class.
 *
 * @constructor
 * @augments Menu
 *
 * Prepares and returns the custom menu Element to be used in the Raptor UI.
 *
 * @returns {Element}
 */
Menu.prototype.getMenu = function() {
    if (!this.menu) {
        this.menu = $('<div>')
            .addClass('ui-menu ui-widget ui-widget-content ui-corner-all ' + this.options.baseClass + '-menu ' + this.raptor.options.baseClass + '-menu')
            .html(this.menuContent)
            .css('position', 'fixed')
            .hide()
            .appendTo('body')
            .mousedown(function(event) {
                // Prevent losing the selection on the editor target
                event.preventDefault();
            });
    }
    return this.menu;
};

;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/custom-menu.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/select-menu.js
/**
 * @fileOverview Contains the select menu class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class The select menu class.
 *
 * @constructor
 * @augments Menu
 *
 * @param {Object} options
 */
function SelectMenu(options) {
    Menu.call(this, options);
}

SelectMenu.prototype = Object.create(Menu.prototype);

SelectMenu.prototype.menuItemMouseDown = function(event) {
    // Prevent losing the selection on the editor target
    event.preventDefault();
};

SelectMenu.prototype.menuItemClick = function(event) {
    aButtonSetLabel(this.button.button, $(event.target).html());
    $(this.menu).closest('ul').hide();
    // Prevent jQuery UI focusing the menu
    return false;
};

SelectMenu.prototype.menuItemMouseEnter = function(event) {
};

SelectMenu.prototype.menuItemMouseLeave = function(event) {
};

/**
 * Prepare and return the select menu Element to be used in the Raptor UI.
 *
 * @returns {Element} The select menu.
 */
SelectMenu.prototype.getMenu = function() {
    if (!this.menu) {
        this.menu = $('<ul>')
            .addClass(this.options.baseClass + '-menu ' + this.raptor.options.baseClass + '-menu')
            .html(this.getMenuItems())
            .css('position', 'fixed')
            .hide()
            .find('a')
            .mousedown(this.menuItemMouseDown.bind(this))
            .mouseenter(this.menuItemMouseEnter.bind(this))
            .mouseleave(this.menuItemMouseLeave.bind(this))
            .click(this.menuItemClick.bind(this))
            .end()
            .appendTo('body');
        aMenu(this.menu);
    }
    return this.menu;
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/select-menu.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/expose.js

// <expose>
$.extend(Raptor, {
    Button: Button,
    CSSClassApplierButton: CSSClassApplierButton,
    DialogButton: DialogButton,
    DialogToggleButton: DialogToggleButton,
    FilteredPreviewButton: FilteredPreviewButton,
    HoverPanelLayout: HoverPanelLayout,
    Menu: Menu,
    MenuButton: MenuButton,
    PreviewButton: PreviewButton,
    PreviewToggleButton: PreviewToggleButton,
    RaptorLayout: RaptorLayout,
    RaptorPlugin: RaptorPlugin,
    SelectMenu: SelectMenu,
    TextAlignButton: TextAlignButton,
    ToggleButton: ToggleButton,
    ToolbarLayout: ToolbarLayout,
    UiGroup: UiGroup,
    aButton: aButton,
    aButtonActive: aButtonActive,
    aButtonDisable: aButtonDisable,
    aButtonEnable: aButtonEnable,
    aButtonInactive: aButtonInactive,
    aButtonIsEnabled: aButtonIsEnabled,
    aButtonSetIcon: aButtonSetIcon,
    aButtonSetLabel: aButtonSetLabel,
    aDialog: aDialog,
    aDialogClose: aDialogClose,
    aDialogOpen: aDialogOpen,
    aMenu: aMenu,
    aTabs: aTabs,
    actionApply: actionApply,
    actionPreview: actionPreview,
    actionPreviewRestore: actionPreviewRestore,
    actionRedo: actionRedo,
    actionUndo: actionUndo,
    clean: clean,
    cleanEmptyAttributes: cleanEmptyAttributes,
    cleanEmptyElements: cleanEmptyElements,
    cleanRemoveComments: cleanRemoveComments,
    cleanReplaceElements: cleanReplaceElements,
    cleanUnnestElement: cleanUnnestElement,
    cleanUnwrapElements: cleanUnwrapElements,
    cleanWrapTextNodes: cleanWrapTextNodes,
    dockToElement: dockToElement,
    dockToScreen: dockToScreen,
    elementBringToTop: elementBringToTop,
    elementChangeTag: elementChangeTag,
    elementClosestBlock: elementClosestBlock,
    elementContainsBlockElement: elementContainsBlockElement,
    elementDefaultDisplay: elementDefaultDisplay,
    elementDetachedManip: elementDetachedManip,
    elementFirstInvalidElementOfValidParent: elementFirstInvalidElementOfValidParent,
    elementGetAttributes: elementGetAttributes,
    elementGetStyles: elementGetStyles,
    elementIsBlock: elementIsBlock,
    elementIsEmpty: elementIsEmpty,
    elementIsValid: elementIsValid,
    elementOuterHtml: elementOuterHtml,
    elementOuterText: elementOuterText,
    elementPositionUnder: elementPositionUnder,
    elementRemoveAttributes: elementRemoveAttributes,
    elementSwapStyles: elementSwapStyles,
    elementToggleStyle: elementToggleStyle,
    elementUniqueId: elementUniqueId,
    elementVisibleRect: elementVisibleRect,
    elementWrapInner: elementWrapInner,
    extendLocale: extendLocale,
    fragmentInsertBefore: fragmentInsertBefore,
    fragmentToHtml: fragmentToHtml,
    getLocalizedString: getLocalizedString,
    listBreakAtSelection: listBreakAtSelection,
    listBreakByReplacingSelection: listBreakByReplacingSelection,
    listConvertItemsForList: listConvertItemsForList,
    listConvertListItem: listConvertListItem,
    listConvertListType: listConvertListType,
    listEnforceValidChildren: listEnforceValidChildren,
    listRemoveEmpty: listRemoveEmpty,
    listRemoveEmptyItems: listRemoveEmptyItems,
    listShouldConvertType: listShouldConvertType,
    listShouldUnwrap: listShouldUnwrap,
    listShouldWrap: listShouldWrap,
    listTidyModified: listTidyModified,
    listToggle: listToggle,
    listUnwrap: listUnwrap,
    listUnwrapSelectedListItems: listUnwrapSelectedListItems,
    listUnwrapSelection: listUnwrapSelection,
    listWrapSelection: listWrapSelection,
    nodeFindParent: nodeFindParent,
    nodeFindTextNodes: nodeFindTextNodes,
    nodeIsChildOf: nodeIsChildOf,
    persistGet: persistGet,
    persistSet: persistSet,
    rangeContainsNode: rangeContainsNode,
    rangeContainsNodeText: rangeContainsNodeText,
    rangeDeserialize: rangeDeserialize,
    rangeEmptyTag: rangeEmptyTag,
    rangeExpandTo: rangeExpandTo,
    rangeExpandToParent: rangeExpandToParent,
    rangeGet: rangeGet,
    rangeGetCommonAncestor: rangeGetCommonAncestor,
    rangeGetEndElement: rangeGetEndElement,
    rangeGetStartElement: rangeGetStartElement,
    rangeIsContainedBy: rangeIsContainedBy,
    rangeIsEmpty: rangeIsEmpty,
    rangeReplace: rangeReplace,
    rangeReplaceSplitInvalidTags: rangeReplaceSplitInvalidTags,
    rangeReplaceWithinValidTags: rangeReplaceWithinValidTags,
    rangeSelectElement: rangeSelectElement,
    rangeSelectElementContent: rangeSelectElementContent,
    rangeSerialize: rangeSerialize,
    rangeToHtml: rangeToHtml,
    rangeTrim: rangeTrim,
    registerLocale: registerLocale,
    selectionAtEndOfElement: selectionAtEndOfElement,
    selectionAtStartOfElement: selectionAtStartOfElement,
    selectionChangeTags: selectionChangeTags,
    selectionClearFormatting: selectionClearFormatting,
    selectionConstrain: selectionConstrain,
    selectionContains: selectionContains,
    selectionDelete: selectionDelete,
    selectionDestroy: selectionDestroy,
    selectionEachBlock: selectionEachBlock,
    selectionEachRange: selectionEachRange,
    selectionExists: selectionExists,
    selectionExpandTo: selectionExpandTo,
    selectionExpandToWord: selectionExpandToWord,
    selectionFindWrappingAndInnerElements: selectionFindWrappingAndInnerElements,
    selectionGetElement: selectionGetElement,
    selectionGetElements: selectionGetElements,
    selectionGetEndElement: selectionGetEndElement,
    selectionGetHtml: selectionGetHtml,
    selectionGetStartElement: selectionGetStartElement,
    selectionInverseWrapWithTagClass: selectionInverseWrapWithTagClass,
    selectionIsEmpty: selectionIsEmpty,
    selectionRange: selectionRange,
    selectionReplace: selectionReplace,
    selectionReplaceSplittingSelectedElement: selectionReplaceSplittingSelectedElement,
    selectionReplaceWithinValidTags: selectionReplaceWithinValidTags,
    selectionRestore: selectionRestore,
    selectionSave: selectionSave,
    selectionSaved: selectionSaved,
    selectionSelectEdge: selectionSelectEdge,
    selectionSelectEnd: selectionSelectEnd,
    selectionSelectInner: selectionSelectInner,
    selectionSelectOuter: selectionSelectOuter,
    selectionSelectStart: selectionSelectStart,
    selectionSelectToEndOfElement: selectionSelectToEndOfElement,
    selectionSet: selectionSet,
    selectionToggleBlockClasses: selectionToggleBlockClasses,
    selectionToggleBlockStyle: selectionToggleBlockStyle,
    selectionToggleWrapper: selectionToggleWrapper,
    selectionTrim: selectionTrim,
    selectionWrapTagWithAttribute: selectionWrapTagWithAttribute,
    setLocale: setLocale,
    stateRestore: stateRestore,
    stateSave: stateSave,
    stringCamelCaseConvert: stringCamelCaseConvert,
    stringHtmlStringIsEmpty: stringHtmlStringIsEmpty,
    stringStripTags: stringStripTags,
    styleRestoreState: styleRestoreState,
    styleSwapState: styleSwapState,
    styleSwapWithWrapper: styleSwapWithWrapper,
    tableCanMergeCells: tableCanMergeCells,
    tableCanSplitCells: tableCanSplitCells,
    tableCellsInRange: tableCellsInRange,
    tableCreate: tableCreate,
    tableDeleteColumn: tableDeleteColumn,
    tableDeleteRow: tableDeleteRow,
    tableGetCellByIndex: tableGetCellByIndex,
    tableGetCellIndex: tableGetCellIndex,
    tableInsertColumn: tableInsertColumn,
    tableInsertRow: tableInsertRow,
    tableMergeCells: tableMergeCells,
    tableSplitCells: tableSplitCells,
    templateConvertTokens: templateConvertTokens,
    templateGet: templateGet,
    templateGetVariables: templateGetVariables,
    typeIsArray: typeIsArray,
    typeIsElement: typeIsElement,
    typeIsNode: typeIsNode,
    typeIsNumber: typeIsNumber,
    typeIsRange: typeIsRange,
    typeIsSelection: typeIsSelection,
    typeIsString: typeIsString,
    typeIsTextNode: typeIsTextNode,
    undockFromElement: undockFromElement,
    undockFromScreen: undockFromScreen
});
window.Raptor = Raptor;
// </expose>
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/expose.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\presets/base.js
/**
 * @fileOverview Default options for Raptor.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @namespace Default options for Raptor.
 */
Raptor.globalDefaults = {
    /**
     * @type Object Default layouts to use.
     */
    layouts: {},

    /**
     * Plugins option overrides.
     *
     * @type Object
     */
    plugins: {},

    /**
     * UI option overrides.
     *
     * @type Object
     */
    ui: {},

    /**
     * Default events to bind.
     *
     * @type Object
     */
    bind: {},

    /**
     * Namespace used for persistence to prevent conflicting with other stored
     * values.
     *
     * @type String
     */
    namespace: null,

    /**
     * Switch to indicated that some events should be automatically applied to
     * all editors that are 'unified'
     *
     * @type boolean
     */
    unify: true,

    /**
     * Switch to indicate whether or not to stored persistent values, if set to
     * false the persist function will always return null
     *
     * @type boolean
     */
    persistence: true,

    /**
     * The name to store persistent values under
     * @type String
     */
    persistenceName: 'uiEditor',

    /**
     * Switch to indicate whether or not to a warning should pop up when the
     * user navigates aways from the page and there are unsaved changes
     *
     * @type boolean
     */
    unloadWarning: true,

    /**
     * Switch to automatically enabled editing on the element
     *
     * @type boolean
     */
    autoEnable: false,

    /**
     * Only enable editing on certian parts of the element
     *
     * @type {jQuerySelector}
     */
    partialEdit: false,

    /**
     * Automatically select the editable content when editing is enabled.
     *
     * @type boolean
     */
    autoSelect: 'end',

    /**
     * Switch to specify if the editor should automatically enable all plugins,
     * if set to false, only the plugins specified in the 'plugins' option
     * object will be enabled
     *
     * @type boolean
     */
    enablePlugins: true,

    /**
     * An array of explicitly disabled plugins.
     *
     * @type String[]
     */
    disabledPlugins: [],

    /**
     * Switch to specify if the editor should automatically enable all UI, if
     * set to false, only the UI specified in the {@link Raptor.defaults.ui}
     * option object will be enabled
     *
     * @type boolean
     */
    enableUi: true,

    /**
     * An array of explicitly disabled UI elements.
     *
     * @type String[]
     */
    disabledUi: [],

    /**
     * Switch to indicate that the element the editor is being applied to should
     * be replaced with a div (useful for textareas), the value/html of the
     * replaced element will be automatically updated when the editor element is
     * changed
     *
     * @type boolean
     */
    replace: false,

    /**
     * A list of styles that will be copied from the replaced element and
     * applied to the editor replacement element
     *
     * @type String[]
     */
    replaceStyle: [
        'display', 'position', 'float', 'width',
        'padding-left', 'padding-right', 'padding-top', 'padding-bottom',
        'margin-left', 'margin-right', 'margin-top', 'margin-bottom'
    ],

    /**
     *
     * @type String
     */
    baseClass: 'raptor',

    /**
     * CSS class prefix that is prepended to inserted elements classes.
     * E.g. "cms-bold"
     *
     * @type String
     */
    cssPrefix: 'cms-',

    draggable: true
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\presets/base.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\presets/full.js
/**
 * @fileOverview Contains the full options preset.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @namespace Full options for Raptor.
 */
Raptor.registerPreset({
    name: 'full',
    plugins: {
        imageSwap: {
            chooser: 'insertFile'
        }
    },
    layouts: {
        toolbar: {
            uiOrder: [
                ['logo'],
                ['save', 'cancel'],
                ['dockToScreen', 'dockToElement', 'guides'],
                ['viewSource'],
                ['historyUndo', 'historyRedo'],
                ['alignLeft', 'alignCenter', 'alignJustify', 'alignRight'],
                ['textBold', 'textItalic', 'textUnderline', 'textStrike'],
                ['textSuper', 'textSub'],
                ['listUnordered', 'listOrdered'],
                ['hrCreate', 'textBlockQuote'],
                ['textSizeDecrease', 'textSizeIncrease', 'fontFamilyMenu'],
                ['clearFormatting', 'cleanBlock'],
                ['linkCreate', 'linkRemove'],
                ['embed', 'insertFile'],
                ['floatLeft', 'floatNone', 'floatRight'],
                ['colorMenuBasic'],
                ['tagMenu'],
                ['classMenu'],
                ['snippetMenu', 'specialCharacters'],
                ['tableCreate', 'tableInsertRow', 'tableDeleteRow', 'tableInsertColumn', 'tableDeleteColumn'],
                ['languageMenu'],
                ['statistics']
            ]
        },
        hoverPanel: {
            uiOrder: [
                ['clickButtonToEdit']
            ]
        },
        elementHoverPanel: {
            elements: 'img',
            uiOrder: [
                ['imageResize', 'imageSwap', 'close']
            ]
        }
    }
}, true);
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\presets/full.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\presets/micro.js
/**
 * @fileOverview Contains the micro options preset.
 * @license http://www.raptor-editor.com/license
 * @author David Neilsen <david@panmedia.co.nz>
 */

/**
 * @namespace Micro options for Raptor.
 */
Raptor.registerPreset({
    name: 'micro',
    layouts: {
        toolbar: {
            uiOrder: [
                ['logo'],
                ['save', 'cancel'],
                ['dockToScreen', 'dockToElement'],
                ['historyUndo', 'historyRedo'],
                ['specialCharacters'],
                ['languageMenu'],
                ['statistics']
            ]
        },
        hoverPanel: {
            uiOrder: [
                ['clickButtonToEdit', 'revisions']
            ]
        }
    },
    plugins: {
        placeholder: false,
        paste: {
            panels: [
                'plain-text'
            ]
        },
        noBreak: {
            enabled: true
        }
    }
});
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\presets/micro.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\presets/inline.js
/**
 * @fileOverview Contains the inline preset.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 */

/**
 * @namespace Inline preset for Raptor.
 */
Raptor.registerPreset({
    name: 'inline',
    classes: 'raptor-editing-inline',
    autoEnable: true,
    draggable: false,
    unify: false,
    unloadWarning: false,
    reloadOnDisable: true,
    plugins: {
        unsavedEditWarning: false,
        dock: {
            dockToElement: true,
            docked: true,
            persist: false
        }
    },
    layouts: {
        toolbar: {
            uiOrder: [
                ['textBold', 'textItalic', 'textUnderline', 'textStrike'],
                ['colorMenuBasic'],
                ['textBlockQuote'],
                ['listOrdered', 'listUnordered'],
                ['textSizeDecrease', 'textSizeIncrease'],
                ['linkCreate', 'linkRemove']
            ]
        }
    }
});
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\presets/inline.js
;
// File start: c:\work\modules\raptor-gold\raptor-premium\src/presets/mammoth.js
/**
 * @fileOverview Contains the mammoth preset.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 */

/**
 * @namespace Mammoth preset for Raptor.
 */
Raptor.registerPreset({
    name: 'mammoth',
    plugins: {
        imageSwap: {
            chooser: 'fileManager'
        }
    },
    layouts: {
        toolbar: {
            uiOrder: [
                ['logo'],
                ['save', 'cancel'],
                ['dockToScreen', 'guides'],
                ['viewSource'],
                ['historyUndo', 'historyRedo'],
                ['alignLeft', 'alignCenter', 'alignJustify', 'alignRight'],
                ['textBold', 'textItalic', 'textUnderline', 'textStrike'],
                ['textSuper', 'textSub'],
                ['listUnordered', 'listOrdered'],
                ['hrCreate', 'textBlockQuote'],
                ['textSizeDecrease', 'textSizeIncrease'],
                ['clearFormatting', 'cleanBlock'],
                ['linkCreate', 'linkRemove'],
                ['embed', 'fileManager'],
                ['floatLeft', 'floatNone', 'floatRight'],
                ['colorMenuBasic'],
                ['tagMenu'],
                ['classMenu'],
                ['snippetMenu', 'specialCharacters', 'loremIpsum'],
                ['tableCreate', 'tableInsertRow', 'tableDeleteRow', 'tableInsertColumn', 'tableDeleteColumn']
            ]
        },
        hoverPanel: {
            uiOrder: [
                ['clickButtonToEdit', 'revisions']
            ]
        },
        elementHoverPanel: {
            elements: 'img',
            uiOrder: [
                ['imageResize', 'imageSwap', 'imageEditor', 'close']
            ]
        },
        imageEditor: {
            uiOrder: [
                ['save', 'cancel'],
                ['revert', 'upload'],
                ['undo', 'redo'],
                ['flipV', 'flipH', 'rotateLeft', 'rotateRight', 'resize', 'crop']
            ]
        },
        fileManager: {
            uiOrder: [
                ['insert', 'rename', 'edit', 'delete', 'download', 'view']
            ]
        }
    }
}, true);
;
// File end: c:\work\modules\raptor-gold\raptor-premium\src/presets/mammoth.js
;
// File start: c:\work\modules\raptor-gold\raptor-premium\src/presets/mammoth-inline.js
/**
 * @fileOverview Contains the mammoth preset.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 */

/**
 * @namespace Mammoth preset for Raptor.
 */
Raptor.registerPreset({
    name: 'mammoth-inline',
    classes: 'raptor-editing-inline',
    autoEnable: true,
    draggable: false,
    unify: false,
    unloadWarning: false,
    reloadOnDisable: true,
    plugins: {
        unsavedEditWarning: false,
        dock: {
            dockToElement: true,
            docked: true,
            persist: false
        }
    },
    layouts: {
        toolbar: {
            uiOrder: [
                ['viewSource', 'guides'],
                ['historyUndo', 'historyRedo'],
                ['alignLeft', 'alignCenter', 'alignJustify', 'alignRight'],
                ['textBold', 'textItalic', 'textUnderline', 'textStrike'],
                ['textSuper', 'textSub'],
                ['listUnordered', 'listOrdered'],
                ['hrCreate', 'textBlockQuote'],
                ['textSizeDecrease', 'textSizeIncrease'],
                ['clearFormatting', 'cleanBlock'],
                ['linkCreate', 'linkRemove'],
                ['embed', 'fileManager'],
                ['floatLeft', 'floatNone', 'floatRight'],
                ['colorMenuBasic'],
                ['tagMenu'],
                ['classMenu'],
                ['snippetMenu', 'specialCharacters'],
                ['tableCreate', 'tableInsertRow', 'tableDeleteRow', 'tableInsertColumn', 'tableDeleteColumn']
            ]
        }
    }
});
;
// File end: c:\work\modules\raptor-gold\raptor-premium\src/presets/mammoth-inline.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/cancel/cancel.js
/**
 * @fileOverview Contains the cancel editing dialog code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of a cancel dialog.
 *
 * @todo needs checking and not sure what to put in for the param stuff.
 * @param {type} param
 */
Raptor.registerUi(new DialogButton({
    name: 'cancel',
    hotkey: 'esc',
    dialogOptions: {
        width: 500
    },

    action: function() {
        if (this.raptor.isDirty()) {
            DialogButton.prototype.action.call(this);
        } else {
            this.applyAction();
        }
    },

    applyAction: function() {
        this.raptor.cancelEditing();
    },

    getDialogTemplate: function() {
        return $('<div>').html(tr('cancelDialogContent'));
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/cancel/cancel.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/class-menu/class-menu.js
/**
 * @fileOverview Contains the class menu class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * The select menu class.
 *
 * @constructor
 * @augments SelectMenu
 *
 * @param {Object} options
 */
function ClassMenu(options) {
    SelectMenu.call(this, {
        name: 'classMenu'
    });
}

ClassMenu.prototype = Object.create(SelectMenu.prototype);

/**
 * Initialises the class menu.
 *
 * @todo type and desc for result
 * @returns {unresolved} result
 */
ClassMenu.prototype.init = function() {
    var result = SelectMenu.prototype.init.call(this);
    if (typeof this.options.classes === 'object' &&
            Object.keys(this.options.classes).length > 0) {
        this.raptor.bind('selectionChange', this.updateButton.bind(this));
        return result;
    }
};

/**
 * Toggles a given set of classes on a selection.
 *
 * @param {Object} classes
 */
ClassMenu.prototype.changeClass = function(classes) {
    selectionToggleBlockClasses(classes, [], this.raptor.getElement());
};

/**
 * Applies the class on click.
 *
 * @param event
 */
ClassMenu.prototype.menuItemClick = function(event) {
    SelectMenu.prototype.menuItemClick.apply(this, arguments);
    this.raptor.actionApply(function() {
        this.changeClass([$(event.currentTarget).data('value')]);
    }.bind(this));
};

/**
 * Puts the selection into preview mode for the chosen class.
 *
 * @param event The mouse event which triggered the preview.
 */
ClassMenu.prototype.menuItemMouseEnter = function(event) {
    this.raptor.actionPreview(function() {
        this.changeClass([$(event.currentTarget).data('value')]);
    }.bind(this));
};

/**
 * Restores the selection from preview mode.
 *
 * @param event
 */
ClassMenu.prototype.menuItemMouseLeave = function(event) {
    this.raptor.actionPreviewRestore();
};
 /**
  * Updates the class menu button.
  */
ClassMenu.prototype.updateButton = function() {
};

//ClassMenu.prototype.getButton = function() {
//    if (!this.button) {
//        this.button = new Button({
//            name: this.name,
//            action: this.show.bind(this),
//            preview: false,
//            options: this.options,
//            icon: false,
//            text: 'Class Selector',
//            raptor: this.raptor
//        });
//    }
//    return this.button;
//};

/**
 * Prepare and return the menu items to be used in the Raptor UI.
 * @returns {Object} The menu items.
 */
ClassMenu.prototype.getMenuItems = function() {
    var items = '';
    for (var label in this.options.classes) {
        items += this.raptor.getTemplate('class-menu.item', {
            label: label,
            value: this.options.classes[label]
        });
    }
    return items;
};

Raptor.registerUi(new ClassMenu());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/class-menu/class-menu.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/clean-block/clean-block.js
/**
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 */

Raptor.registerUi(new PreviewButton({
    name: 'cleanBlock',
    action: function() {
        this.raptor.getElement().find('[style]').removeAttr('style');
        this.raptor.getElement().find('span:empty').remove();
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/clean-block/clean-block.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/clear-formatting/clear-formatting.js
/**
 * @fileOverview Contains the clear formatting button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the preview button that clears the
 * formatting on a selection.
 */
Raptor.registerUi(new PreviewButton({
    name: 'clearFormatting',
    action: function() {
        selectionClearFormatting(this.raptor.getElement().get(0));
        cleanEmptyElements(this.raptor.getElement(), [
            'a', 'b', 'i', 'sub', 'sup', 'strong', 'em', 'big', 'small', 'p'
        ]);
        cleanWrapTextNodes(this.raptor.getElement()[0], 'p');
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/clear-formatting/clear-formatting.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/click-button-to-edit/click-button-to-edit.js
/**
 * @fileOverview Contains the click button to edit code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */
Raptor.registerUi(new Button({
    name: 'clickButtonToEdit',
    action: function() {
        this.raptor.enableEditing();
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/click-button-to-edit/click-button-to-edit.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/close/close.js
/**
 * @fileOverview Contains the close panel code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 */
Raptor.registerUi(new Button({
    name: 'close',

    click: function() {
        this.layout.close();
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/close/close.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/color-menu-basic/color-menu-basic.js
/**
 * @fileOverview Contains the basic colour menu class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author  David Neilsen <david@panmedia.co.nz>
 * @author  Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * The basic colour menu class.
 *
 * @constructor
 * @augments SelectMenu
 *
 * @param {Object} options
 */
function ColorMenuBasic(options) {
    this.colors = [
        'white',
        'black',
        'grey',
        'blue',
        'red',
        'green',
        'purple',
        'orange'
    ];
    /**
     * Cache the current color so it can be reapplied to the button if the user
     * clicks the button to open the menu, hovers some colors then clicks off to
     * close it.
     *
     * @type {String}
     */
    this.currentColor = 'automatic';
    SelectMenu.call(this, {
        name: 'colorMenuBasic'
    });
}

ColorMenuBasic.prototype = Object.create(SelectMenu.prototype);

/**
 * Initialize the basic colour menu.
 *
 * @returns {Element}
 */
ColorMenuBasic.prototype.init = function() {
    this.raptor.bind('selectionChange', this.updateButton.bind(this));
    this.updateButton();
    return SelectMenu.prototype.init.apply(this, arguments);
};

/**
 * Updates the basic colour menu with the current colour.
 */
ColorMenuBasic.prototype.updateButton = function() {
    var tag = selectionGetElements()[0],
        button = this.getButton().getButton(),
        color = null,
        closest = null;

    // TODO: set automatic icon color to the color of the text
    aButtonSetLabel(button, tr('colorMenuBasicAutomatic'));
    aButtonSetIcon(button, false);
    if (!tag) {
        return;
    }
    tag = $(tag);
    for (var colorsIndex = 0; colorsIndex < this.colors.length; colorsIndex++) {
        closest = $(tag).closest('.' + this.options.cssPrefix + this.colors[colorsIndex]);
        if (closest.length) {
            color = this.colors[colorsIndex];
            break;
        }
    }
    if (color) {
        aButtonSetLabel(button, tr('colorMenuBasic' + (color.charAt(0).toUpperCase() + color.slice(1))));
        aButtonSetIcon(button, 'ui-icon-swatch');
        // FIXME: set color in an adapter friendly way
        button.find('.ui-icon').css('background-color', closest.css('color'));
        return;
    }
};

/**
 * Changes the colour of the selection.
 *
 * @param {type} color The current colour.
 */
ColorMenuBasic.prototype.changeColor = function(color, permanent) {
    if (permanent) {
        this.currentColor = color;
    }
    this.raptor.actionApply(function() {
        selectionExpandToWord();
        if (color === 'automatic') {
            selectionGetElements().parents('.' + this.options.cssPrefix + 'color').addBack().each(function() {
                var classes = $(this).attr('class');
                if (classes === null || typeof classes === 'undefined') {
                    return;
                }
                classes = classes.match(/(cms-(.*?))( |$)/ig);
                if (classes === null || typeof classes === 'undefined') {
                    return;
                }
                for (var i = 0, l = classes.length; i < l; i++) {
                    $(this).removeClass($.trim(classes[i]));
                }
            });
        } else {
            var uniqueId = elementUniqueId();
            selectionToggleWrapper('span', {
                classes: this.options.cssPrefix + 'color ' + this.options.cssPrefix + color,
                attributes: {
                    id: uniqueId
                }
            });
            var element = $('#' + uniqueId);
            if (element.length) {
                selectionSelectInner(element.removeAttr('id').get(0));
                var splitNode;
                do {
                    splitNode = $('#' + uniqueId);
                    splitNode.removeAttr('id');
                } while (splitNode.length);
            }
        }
    }.bind(this));
};

/**
 * The preview state for the basic colour menu.
 *
 * @param event The mouse event which triggered the preview.
 */
ColorMenuBasic.prototype.menuItemMouseEnter = function(event) {
    this.raptor.actionPreview(function() {
        this.changeColor($(event.currentTarget).data('color'));
    }.bind(this));
};

/**
 * Restores the selection from the preview.
 *
 * @param event
 */
ColorMenuBasic.prototype.menuItemMouseLeave = function(event) {
    this.raptor.actionPreviewRestore();
};

/**
 * Applies the colour change to the selection.
 *
 * @param event The mouse event to trigger the application of the colour.
 */
ColorMenuBasic.prototype.menuItemClick = function(event) {
    SelectMenu.prototype.menuItemClick.apply(this, arguments);
    this.raptor.actionApply(function() {
        this.changeColor($(event.currentTarget).data('color'), true);
    }.bind(this));
};

/**
 * Prepare and return the menu items to be used in the Raptor UI.
 * @returns {Element} The menu items.
 */
ColorMenuBasic.prototype.getMenuItems = function() {
    return this.raptor.getTemplate('color-menu-basic.menu', this.options);
};

Raptor.registerUi(new ColorMenuBasic());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/color-menu-basic/color-menu-basic.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/dock/dock-plugin.js
/**
 * @fileOverview Contains the dock plugin class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * The dock plugin class.
 *
 * @constructor
 * @augments RaptorPlugin
 *
 * @param {String} name
 * @param {Object} overrides
 */
function DockPlugin(name, overrides) {
    this.options = {
        dockToElement: false,
        docked: false,
        position: 'top',
        spacer: true,
        persist: true
    };
    this.dockState = false;
    this.marker = false;

    RaptorPlugin.call(this, name || 'dock', overrides);
}

DockPlugin.prototype = Object.create(RaptorPlugin.prototype);

/**
 * Initialize the dock plugin.
 */
DockPlugin.prototype.init = function() {
    var docked;
    if (this.options.persist) {
        docked = this.raptor.persist('docked');
    }
    if (typeof docked === 'undefined') {
        docked = this.options.docked;
    }
    if (typeof docked === 'undefined') {
        docked = false;
    }
    if (docked) {
        this.raptor.bind('toolbarReady', function() {
            if (docked) {
                this.toggleState();
            }
        }.bind(this));
        this.raptor.bind('toolbarHide', function() {
            if (this.dockState && this.dockState.spacer) {
                this.dockState.spacer.addClass(this.options.baseClass + '-hidden');
                this.dockState.spacer.removeClass(this.options.baseClass + '-visible');
            }
        }.bind(this));
        this.raptor.bind('toolbarShow', function() {
            if (this.dockState && this.dockState.spacer) {
                this.dockState.spacer.removeClass(this.options.baseClass + '-hidden');
                this.dockState.spacer.addClass(this.options.baseClass + '-visible');
            }
        }.bind(this));
        this.raptor.bind('toolbarDestroy', function() {
            if (this.dockState && this.dockState.spacer) {
                this.dockState.spacer.remove();
            }
        }.bind(this));
    }
};

/**
 * Switch between docked / undocked, depending on options.
 *
 * @return {Object} Resulting dock state
 */
DockPlugin.prototype.toggleState = function() {
    if (this.options.dockToElement) {
        return this.toggleDockToElement();
    }
    return this.toggleDockToScreen();
};

/**
 * Gets the dock state on toggle dock to element.
 *
 * @return {Object} Resulting dock state
 */
DockPlugin.prototype.toggleDockToElement = function() {
    if (this.dockState) {
        if (typeof this.dockState.dockedTo !== 'undefined') {
            this.undockFromElement();
        } else {
            this.undockFromScreen();
            this.dockToElement();
        }
    } else {
        this.dockToElement();
    }
};

/**
 * Gets the dock state on dock to element.
 *
 * @return {Object} Resulting dock state
 */
DockPlugin.prototype.dockToElement = function() {
    var element = this.raptor.getElement(),
        layoutElement = this.raptor.getLayout('toolbar').getElement();
    this.marker = $('<marker>').addClass(this.options.baseClass + '-marker').insertAfter(layoutElement);
    this.raptor.getLayout('toolbar').getElement().addClass(this.options.baseClass + '-docked-to-element');
    this.dockState = dockToElement(this.raptor.getLayout('toolbar').getElement(), element, {
        position: this.options.position,
        spacer: false,
        wrapperClass: this.options.baseClass + '-inline-wrapper'
    });
    this.activateButton(this.raptor.getPlugin('dockToElement'));
};

/**
 * Gets the dock state on undocking from an element.
 *
 * @return {Object} Resulting dock state
 */
DockPlugin.prototype.undockFromElement = function() {
    this.marker.replaceWith(undockFromElement(this.dockState));
    this.dockState = null;
    this.raptor.getLayout('toolbar').getElement().removeClass(this.options.baseClass + '-docked-to-element');
    this.deactivateButton(this.raptor.getPlugin('dockToElement'));
};

/**
 * Gets the dock state on toggle dock to screen.
 *
 * @return {Object} Resulting dock state
 */
DockPlugin.prototype.toggleDockToScreen = function() {
    if (this.dockState) {
        if (typeof this.dockState.dockedTo !== 'undefined') {
            this.undockFromElement();
            this.dockToScreen();
        } else {
            this.undockFromScreen();
        }
    } else {
        this.dockToScreen();
    }
};

/**
 * Gets the dock state on dock to screen.
 *
 * @return {Object} Resulting dock state
 */
DockPlugin.prototype.dockToScreen = function() {
    if (!this.dockState) {
        var layout = this.raptor.getLayout('toolbar');
        if (layout.isReady()) {
            this.raptor.persist('docked', true);
            var layoutElement = layout.getElement();
            this.marker = $('<marker>').addClass(this.options.baseClass + '-marker')
                                .insertAfter(layoutElement);
            layoutElement.addClass(this.options.baseClass + '-docked');
            layout.disableDragging();
            this.dockState = dockToScreen(layoutElement, {
                position: this.options.position,
                spacer: this.options.spacer,
                under: this.options.under
            });
            if (!layout.isVisible()) {
                this.dockState.spacer.removeClass(this.options.baseClass + '-visible');
                this.dockState.spacer.addClass(this.options.baseClass + '-hidden');
            }
            this.activateButton(this.raptor.getPlugin('dockToScreen'));
        }
    }
};

/**
 * Gets the dock state on undocking from the screen.
 *
 * @return {Object} Resulting dock state
 */
DockPlugin.prototype.undockFromScreen = function() {
    if (this.dockState) {
        this.raptor.persist('docked', false);
        var layout = this.raptor.getLayout('toolbar'),
            layoutElement = undockFromScreen(this.dockState);
        this.marker.replaceWith(layoutElement);
        layout.enableDragging();
        layout.constrainPosition();
        this.dockState = null;
        layoutElement.removeClass(this.options.baseClass + '-docked');
        this.deactivateButton(this.raptor.getPlugin('dockToScreen'));
    }
};

DockPlugin.prototype.deactivateButton = function(ui) {
    if (typeof ui !== 'undefined' &&
            typeof ui.button !== 'undefined') {
        aButtonInactive(ui.button);
    }
};

DockPlugin.prototype.activateButton = function(ui) {
    if (typeof ui !== 'undefined' &&
            typeof ui.button !== 'undefined') {
        aButtonActive(ui.button);
    }
};

Raptor.registerPlugin(new DockPlugin());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/dock/dock-plugin.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/dock/dock-to-screen.js
/**
 * @fileOverview Contains the dock to screen button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the dock to screen button for use in the Raptor UI.
 *
 * @todo des and type for the param.
 * @param {type} param
 */
Raptor.registerUi(new Button({
    name: 'dockToScreen',
    action: function() {
        this.raptor.unify(function(raptor) {
            raptor.plugins.dock.toggleDockToScreen();
        });
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/dock/dock-to-screen.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/dock/dock-to-element.js
/**
 * @fileOverview Contains the dock to element button code.
 * @author  David Neilsen <david@panmedia.co.nz>
 * @author  Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the dock to element button for use in the raptor UI.
 *
 * @todo not sure how to document this one.
 * @param {type} param
 */
Raptor.registerUi(new Button({
    name: 'dockToElement',
    action: function() {
        this.raptor.unify(function(raptor) {
            raptor.plugins.dock.toggleDockToElement();
        });
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/dock/dock-to-element.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/embed/embed.js
/**
 * @fileOverview Contains the embed dialog button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an intance of the embed dialog for use in the Raptor UI.
 *
 * @todo des and type for the param.
 * @param {type} param
 */
Raptor.registerUi(new DialogButton({
    name: 'embed',
    state: null,
    dialogOptions: {
        width: 600,
        height: 400
    },

    /**
     * Replace selection with embed textarea content.
     *
     * @param  {Element} dialog
     */
    applyAction: function(dialog) {
        this.raptor.actionApply(function() {
            selectionReplace(dialog.find('textarea').val());
        });
    },

    /**
     * Create and prepare the embed dialog template.
     *
     * @return {Element}
     */
    getDialogTemplate: function() {
        var template = $('<div>').html(this.raptor.getTemplate('embed.dialog', this.options));

        template.find('textarea').change(function(event) {
            template.find('.' + this.options.baseClass + '-preview').html($(event.target).val());
        }.bind(this));

        // Create fake jQuery UI tabs (to prevent hash changes)
        var tabs = template.find('.' + this.options.baseClass + '-panel-tabs');
        tabs.find('li')
            .click(function() {
                tabs.find('ul li').removeClass('ui-state-active').removeClass('ui-tabs-selected');
                $(this).addClass('ui-state-active').addClass('ui-tabs-selected');
                tabs.children('div').hide().eq($(this).index()).show();
            });
        return template;
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/embed/embed.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/float/float-left.js
/**
 * @fileOverview Contains the float left button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of a filtered preview button to float an image left.
 *
 * @todo des and type for the param.
 * @param {type} param
 */
Raptor.registerUi(new FilteredPreviewButton({
    name: 'floatLeft',
    applyToElement: function(element) {
        element.removeClass(this.options.cssPrefix + 'float-right');
        element.toggleClass(this.options.cssPrefix + 'float-left');
        cleanEmptyAttributes(element, ['class']);
    },
    getElement: function(range) {
        var images = $(range.commonAncestorContainer).find('img');
        return images.length ? images : null;
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/float/float-left.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/float/float-none.js
/**
 * @fileOverview Contains the float none button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of a filtered preview button to remove the float an image.
 *
 * @todo des and type for the param.
 * @param {type} param
 */
Raptor.registerUi(new FilteredPreviewButton({
    name: 'floatNone',
    applyToElement: function(element) {
        element.removeClass(this.options.cssPrefix + 'float-right');
        element.removeClass(this.options.cssPrefix + 'float-left');
        cleanEmptyAttributes(element, ['class']);
    },
    getElement: function(range) {
        var images = $(range.commonAncestorContainer).find('img');
        return images.length ? images : null;
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/float/float-none.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/float/float-right.js
/**
 * @fileOverview Contains the float right button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of a filtered preview button to float an image right.
 *
 * @todo des and type for the param.
 * @param {type} param
 */
Raptor.registerUi(new FilteredPreviewButton({
    name: 'floatRight',
    applyToElement: function(element) {
        element.removeClass(this.options.cssPrefix + 'float-left');
        element.toggleClass(this.options.cssPrefix + 'float-right');
        cleanEmptyAttributes(element, ['class']);
    },
    getElement: function(range) {
        var images = $(range.commonAncestorContainer).find('img');
        return images.length ? images : null;
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/float/float-right.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/guides/guides.js
/**
 * @fileOverview Contains the guides button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of a preview button to show the guides of the elements.
 *
 * @todo des and type for the param.
 * @param {type} param
 */
Raptor.registerUi(new PreviewButton({
    name: 'guides',

    action: function() {
        this.raptor.getElement().toggleClass(this.getClassName());
        this.updateButtonState();
    },

    updateButtonState: function() {
        if (this.raptor.getElement().hasClass(this.getClassName())) {
            aButtonActive(this.button);
        } else {
            aButtonInactive(this.button);
        }
    },

    init: function() {
        this.raptor.bind('cancel', this.removeClass.bind(this));
        this.raptor.bind('saved', this.removeClass.bind(this));
        return PreviewButton.prototype.init.call(this);
    },

    removeClass: function() {
        this.raptor.getElement().removeClass(this.getClassName());
    },

    getClassName: function() {
        return this.options.baseClass + '-visible';
    },

    mouseEnter: function() {
        PreviewButton.prototype.mouseEnter.call(this);
        this.updateButtonState();
    },

    mouseLeave: function() {
        PreviewButton.prototype.mouseLeave.call(this);
        this.updateButtonState();
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/guides/guides.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/history/history-redo.js
/**
 * @fileOverview Contains the history redo code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the button class to redo an action.
 *
 * @todo param details?
 * @param {type} param
 */
Raptor.registerUi(new Button({
    name: 'historyRedo',
    hotkey: ['ctrl+y', 'ctrl+shift+z'],

    action: function() {
        this.raptor.historyForward();
    },

    init: function () {
        this.raptor.bind('historyChange', this.historyChange.bind(this));
        Button.prototype.init.apply(this, arguments);
        aButtonDisable(this.button);
        return this.button;
    },

    historyChange: function() {
        if (this.raptor.present < this.raptor.history.length - 1) {
            aButtonEnable(this.button);
        } else {
            aButtonDisable(this.button);
        }
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/history/history-redo.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/history/history-undo.js
/**
 * @fileOverview Contains the history undo code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the button class to undo an action.
 *
 * @todo param details?
 * @param {type} param
 */
Raptor.registerUi(new Button({
    name: 'historyUndo',
    hotkey: 'ctrl+z',

    action: function() {
        this.raptor.historyBack();
    },

    init: function () {
        this.raptor.bind('historyChange', this.historyChange.bind(this));
        Button.prototype.init.apply(this, arguments);
        aButtonDisable(this.button);
        return this.button;
    },

    historyChange: function() {
        if (this.raptor.present === 0) {
            aButtonDisable(this.button);
        } else {
            aButtonEnable(this.button);
        }
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/history/history-undo.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/hr/hr-create.js
/**
 * @fileOverview Contains the hr button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the preview button to insert a hr at the selection.
 *
 * @todo param details?
 * @param {type} param
 */
Raptor.registerUi(new PreviewButton({
    name: 'hrCreate',
    action: function() {
        selectionReplace('<hr/>');
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/hr/hr-create.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/image-resize/image-resize.js
/**
 * @fileOverview Contains the image resize button code.
 * @author David Neilsen <david@panmedia.co.nz>
 */
Raptor.registerUi(new DialogButton({
    name: 'imageResize',
    proportional: true,
    image: null,
    dialogOptions: {
        width: 450
    },

    action: function() {
        var dialog = this.getDialog();
        this.image = nodeUniqueId(this.layout.target);
        this.originalWidth = this.layout.target.width;
        this.originalHeight = this.layout.target.height;
        dialog.find('[name=width]').val(this.layout.target.width),
        dialog.find('[name=height]').val(this.layout.target.height);
        this.openDialog();
    },

    applyAction: function() {
        var dialog = this.getDialog(),
            width = dialog.find('[name=width]').val(),
            height = dialog.find('[name=height]').val();
        this.raptor.actionApply(function() {
            $('#' + this.image)
                .css({
                    width: width,
                    height: height
                })
                .attr('width', width)
                .attr('height', height);
            selectionSelectOuter($('#' + this.image)[0]);
        }.bind(this));
    },

    getDialogTemplate: function() {
        var template = $('<div>').html(this.raptor.getTemplate('image-resize.dialog', this.options)),
            plugin = this;
        template.find('.' + this.options.baseClass + '-lock-proportions')
            .hover(function() {
                $(this).addClass('ui-state-hover');
            }, function() {
                $(this).removeClass('ui-state-hover');
            })
            .click(function() {
                dialogs[plugin.name].instance.proportional = !dialogs[plugin.name].instance.proportional;
                $(this)
                    .find('.ui-icon')
                    .toggleClass('ui-icon-locked', plugin.proportional)
                    .toggleClass('ui-icon-unlocked', !plugin.proportional);
            });

        var widthInput = template.find('[name=width]'),
            heightInput = template.find('[name=height]');

        widthInput.on('input.raptor', function() {
            var value = parseInt($(this).val());
            if (!isNaN(value)) {
                if (dialogs[plugin.name].instance.proportional) {
                    heightInput.val(Math.round(Math.abs(dialogs[plugin.name].instance.originalHeight / dialogs[plugin.name].instance.originalWidth * value)));
                }
            }
        });

        heightInput.on('input.raptor', function() {
            var value = parseInt($(this).val());
            if (!isNaN(value)) {
                if (dialogs[plugin.name].instance.proportional) {
                    widthInput.val(Math.round(Math.abs(dialogs[plugin.name].instance.originalWidth / dialogs[plugin.name].instance.originalHeight * value)));
                }
            }
        });

        return template;
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/image-resize/image-resize.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/image-swap/image-swap.js
/**
 * @fileOverview Contains the image swap button code.
 * @author David Neilsen <david@panmedia.co.nz>
 */
Raptor.registerUi(new Button({
    name: 'imageSwap',
    chooser: null,
    click: function() {
        selectionSelectOuter(this.layout.target);
        this.raptor.getPlugin(this.options.chooser).action(this.layout.target);
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/image-swap/image-swap.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/insert-file/insert-file.js
/**
 * @fileOverview Contains the insert file button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the button class to allow the insertation of files.
 *
 * @todo param details?
 * @param {type} param
 */
Raptor.registerUi(new DialogButton({
    name: 'insertFile',
    state: false,
    /** @type {string[]} Image extensions*/
    imageTypes: [
        'jpeg',
        'jpg',
        'png',
        'gif'
    ],
    options: {

        /**
         * Save the current state, show the insert file dialog or file manager.
         *
         * @type {null|Function} Specify a function to use instead of the default
         *                       file insertion dialog.
         * @return {Boolean} False to indicate that custom action failed and the
         *                         default dialog should be used.
         */
        customAction: false
    },

    /**
     * Open the insert file dialog or file manager.
     */
    action: function(target) {
        // If a customAction has been specified, use it instead of the default dialog.
        if (!this.options.customAction || this.options.customAction.call(this, target) === false) {
            if (typeof target !== 'undefined') {
                this.getDialog().find('[name=location]').val(target.getAttribute('src') || target.getAttribute('href'));
                this.getDialog().find('[name=name]').val(target.innerHTML);
            } else {
                this.getDialog().find('[name=location]').val('');
                this.getDialog().find('[name=name]').val('');
            }
            return this.openDialog();
        }
    },

    applyAction: function() {
        var dialog = this.getDialog(),
            location = dialog.find('[name=location]').val(),
            name = dialog.find('[name=name]').val();
        this.raptor.actionApply(function() {
            this.insertFiles([{
                location: location,
                name: name
            }]);
        }.bind(this));
    },

    getDialogTemplate: function() {
        return $(this.raptor.getTemplate('insert-file.dialog'));
    },

    /**
     * Attempt to determine the file type from either the file's explicitly set
     * extension property, or the file extension of the file's location property.
     *
     * @param  {Object} file
     * @return {string}
     */
    getFileType: function(file) {
        if (typeof file.extension !== 'undefined') {
            return file.extension.toLowerCase();
        }
        var extension = file.location.split('.');
        if (extension.length > 0) {
            return extension.pop().toLowerCase();
        }
        return 'unknown';
    },

    /**
     * @param  {Object} file
     * @return {Boolean} True if the file is an image.
     */
    isImage: function(file) {
        return $.inArray(this.getFileType(file), this.imageTypes) !== -1;
    },

    /**
     * Insert the given files. If files contains only one item, it is inserted
     * with selectionReplaceWithinValidTags using an appropriate valid tag array
     * for the file's type. If files contains more than one item, the items are
     * processed into an array of HTML strings, joined then inserted using
     * selectionReplaceWithinValidTags with a valid tag array of tags that may
     * contain both image and anchor tags.
     *
     * [
     *     {
     *         location: location of the file, e.g. http://www.raptor-editor.com/images/html5.png
     *         name: a name for the file, e.g. HTML5 Logo
     *         extension: explicitly defined extension for the file, e.g. png
     *     }
     * ]
     *
     * @param  {Object[]} files Array of files to be inserted.
     */
    insertFiles: function(files) {
        this.raptor.resume();
        if (!files.length) {
            return;
        }
        this.raptor.actionApply(function() {
            if (files.length === 1) {
                if ((this.isImage(files[0]) && $(selectionGetHtml()).is('img')) || selectionIsEmpty()) {
                    this.replaceFiles(files);
                } else {
                    this.linkFiles(files);
                }
            } else {
                this.linkFiles(files);
            }
        }.bind(this));
    },

    linkFiles: function(files) {
        selectionExpandTo('a', this.raptor.getElement());
        selectionTrim();
        var applier = rangy.createApplier({
            tag: 'a',
            attributes: {
                href: files[0].location.replace(/([^:])\/\//g, '$1/'),
                title: files[0].name,
                'class': this.options.cssPrefix + 'file ' + this.options.cssPrefix + this.getFileType(files[0])
            }
        });
        applier.applyToSelection();
    },

    replaceFiles: function(files) {
        var elements = [];
        for (var fileIndex = 0; fileIndex < files.length; fileIndex++) {
            elements.push(this.prepareElement(files[fileIndex]));
        }
        selectionReplace(elements.join(', '));
    },

    /**
     * Prepare the HTML for either an image or an anchor tag, depending on the file's type.
     *
     * @param {Object} file
     * @param {string|null} text The text to use as the tag's title and an anchor
     *                           tag's HTML. If null, the file's name is used.
     * @return {string} The tag's HTML.
     */
    prepareElement: function(file, text) {
        if (this.isImage(file)) {
            return this.prepareImage(file, this.options.cssPrefix + this.getFileType(file), text);
        } else {
            return this.prepareAnchor(file, this.options.cssPrefix + 'file ' + this.options.cssPrefix + this.getFileType(file), text);
        }
    },

    /**
     * Prepare HTML for an image tag.
     *
     * @param  {Object} file
     * @param  {string} classNames Classnames to apply to the image tag.
     * @param  {string|null} text Text to use as the image tag's title. If null,
     *                            the file's name is used.
     * @return {string} Image tag's HTML.
     */
    prepareImage: function(file, classNames, text) {
        return $('<div/>').html($('<img/>').attr({
            src: file.location.replace(/([^:])\/\//g, '$1/'),
            title: text || file.name,
            'class': classNames
        })).html();
    },

    /**
     * Prepare HTML for an anchor tag.
     *
     * @param  {Object} file
     * @param  {string} classNames Classnames to apply to the anchor tag.
     * @param  {string|null} text Text to use as the anchor tag's title & content. If null,
     *                            the file's name is used.
     * @return {string} Anchor tag's HTML.
     */
    prepareAnchor: function(file, classNames, text) {
        return $('<div/>').html($('<a/>').attr({
            href: file.location.replace(/([^:])\/\//g, '$1/'),
            title: file.name,
            'class': classNames
        }).html(text || file.name)).html();
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/insert-file/insert-file.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-create.js
/**
 * @fileOverview Contains the create link button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

var linkMenu,
    linkTypes,
    linkContent,
    linkAttributes;

/**
 * Creates an instance of the dialog toggle button to create links.
 *
 * @todo param stuff?
 * @param {type} param
 */
Raptor.registerUi(new DialogToggleButton({
    name: 'linkCreate',

    dialogOptions: {
        width: 850
    },

    applyAction: function() {
        this.raptor.actionApply(function() {
            selectionExpandToWord();
            selectionExpandTo('a', this.raptor.getElement());
            selectionTrim();
            var applier = rangy.createApplier({
                tag: 'a',
                attributes: linkAttributes
            });
            if (linkAttributes !== false && $.trim(linkAttributes.href) !== '') {
                applier.applyToSelection();
                cleanEmptyElements(this.raptor.getElement(), ['a']);
            }
        }.bind(this));
    },

    openDialog: function() {
        var element = selectionGetElement();
        if (element.is('a')) {
            for (var i = 0, l = linkTypes.length; i < l; i++) {
                var result = linkTypes[i].updateInputs(element, linkContent.children('div:eq(' + i + ')'));
                if (result) {
                    linkMenu.find(':radio:eq(' + i + ')').trigger('click');
                }
            }
        }
        DialogToggleButton.prototype.openDialog.call(this);
    },

    validateDialog: function() {
        var i = linkMenu.find(':radio:checked').val();
        linkAttributes = linkTypes[i].getAttributes(linkContent.children('div:eq(' + i + ')'));
        return linkAttributes !== false;
    },

    selectionToggle: function() {
        var element = selectionGetElement();
        if (!element) {
            return false;
        }
        if (element.closest('a').length) {
            return true;
        }
        return false;
    },

    getDialogTemplate: function() {
        var template = $(this.raptor.getTemplate('link.dialog', this.options));

        linkMenu = template.find('[data-menu]');
        linkContent = template.find('[data-content]');
        linkTypes = [
            new LinkTypeInternal(this.raptor),
            new LinkTypeExternal(this.raptor),
            new LinkTypeDocument(this.raptor),
            new LinkTypeEmail(this.raptor)
        ];

        for (var i = 0, l = linkTypes.length; i < l; i++) {
            $(this.raptor.getTemplate('link.label', linkTypes[i]))
                .click(function() {
                    linkContent.children('div').hide();
                    linkContent.children('div:eq(' + $(this).index() + ')').show();
                })
                .find(':radio')
                    .val(i)
                .end()
                .appendTo(linkMenu);
            $('<div>')
                .append(linkTypes[i].getContent())
                .hide()
                .appendTo(linkContent);
        }
        linkMenu.find(':radio:first').prop('checked', true);
        linkContent.children('div:first').show();

        return template;
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-create.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-remove.js
/**
 * @fileOverview Contains the remove link class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of teh toggle button to remove links.
 *
 * @todo param details?
 * @param {type} param
 */
Raptor.registerUi(new PreviewToggleButton({
    name: 'linkRemove',
    disable: true,

    action: function() {
        this.raptor.actionApply(function() {
            var applier = rangy.createApplier({
                tag: 'a'
            });
            selectionExpandToWord();
            this.raptor.selectionConstrain();
            applier.undoToSelection();
            cleanEmptyElements(this.raptor.getElement(), ['a']);
        }.bind(this));
    },

    selectionToggle: function() {
        var element = selectionGetElement();
        if (!element) {
            return false;
        }
        if (element.closest('a').length) {
            return true;
        }
        return false;
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-remove.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-type-document.js
/**
 * @fileOverview Contains the document link class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class The internal link class.
 *
 * @constructor
 * @param {Raptor} raptor
 */
function LinkTypeDocument(raptor) {
    this.raptor = raptor;
    this.label = tr('linkTypeDocumentLabel');
}

LinkTypeDocument.prototype = Object.create(LinkTypeExternal.prototype);

/**
 * @return {String} The document link panel content.
 */
LinkTypeDocument.prototype.getContent = function() {
    return this.raptor.getTemplate('link.document', this.raptor.options);
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-type-document.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-type-email.js
/**
 * @fileOverview Contains the internal link class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class Email link class.
 * @constructor
 *
 * @todo param details and des for return.
 * @param {type} raptor
 * @returns {LinkTypeEmail}
 */
function LinkTypeEmail(raptor) {
    this.raptor = raptor;
    this.label = tr('linkTypeEmailLabel');
}

/**
 * Gets the content of the email link.
 *
 * @returns {Element}
 */
LinkTypeEmail.prototype.getContent = function() {
    return this.raptor.getTemplate('link.email', this.raptor.options);
};

/**
 * Gets the attributes of the email link.
 *
 * @todo panel and return details
 * @param {type} panel
 * @returns {LinkTypeEmail.prototype.getAttributes.Anonym$0|Boolean}
 */
LinkTypeEmail.prototype.getAttributes = function(panel) {
    var address = panel.find('[name=email]').val(),
        subject = panel.find('[name=subject]').val();
    if ($.trim(subject)) {
        subject = '?Subject=' + encodeURIComponent(subject);
    }
    if ($.trim(address) === '') {
        return false;
    }
    return {
        href: 'mailto:' + address + subject
    };
};

/**
 * Updates the users inputs.
 *
 * @todo type and des for panel and des for return.
 * @param {String} link The email link.
 * @param {type} panel
 * @returns {Boolean}
 */
LinkTypeEmail.prototype.updateInputs = function(link, panel) {
    var result = false;
        email = '',
        subject = '',
        href = link.attr('href');
    if (href.indexOf('mailto:') === 0) {
        var subjectPosition = href.indexOf('?Subject=');
        if (subjectPosition > 0) {
            email = href.substring(7, subjectPosition);
            subject = href.substring(subjectPosition + 9);
        } else {
            email = href.substring(7);
            subject = '';
        }
        result = true;
    }
    panel.find('[name=email]').val(email);
    panel.find('[name=subject]').val(subject);
    return result;
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-type-email.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-type-external.js
/**
 * @fileOverview Contains the external link class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class The external link class.
 * @constructor
 *
 * @todo check please
 * @param {Object} raptor
 * @returns {Element}
 */
function LinkTypeExternal(raptor) {
    this.raptor = raptor;
    this.label = tr('linkTypeExternalLabel');
}

/**
 * Gets the content of the external link.
 *
 * @returns {Element}
 */
LinkTypeExternal.prototype.getContent = function() {
    return this.raptor.getTemplate('link.external', this.raptor.options);
};

/**
 * Gets the attributes of the external link.
 *
 * @todo type and des for panel
 * @param {type} panel
 * @returns {LinkTypeExternal.prototype.getAttributes.result|Boolean}
 */
LinkTypeExternal.prototype.getAttributes = function(panel) {
    var address = panel.find('[name=location]').val(),
        target = panel.find('[name=blank]').is(':checked'),
        result = {
            href: address
        };

    if (target) {
        result.target = '_blank';
    }

    if ($.trim(result.href) === 'http://') {
        return false;
    }

    return result;
};

/**
 * Updates the users inputs.
 *
 * @todo type and desc for panel and return.
 * @param {String} link The external link.
 * @param {type} panel
 * @returns {Boolean}
 */
LinkTypeExternal.prototype.updateInputs = function(link, panel) {
    var result = false,
        href = link.attr('href');
    if (href.indexOf('http://') === 0) {
        panel.find('[name=location]').val(href);
        result = true;
    } else {
        panel.find('[name=location]').val('http://');
    }
    if (link.attr('target') === '_blank') {
        panel.find('[name=blank]').prop('checked', true);
    } else {
        panel.find('[name=blank]').prop('checked', false);
    }
    return result;
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-type-external.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-type-internal.js
/**
 * @fileOverview Contains the internal link class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class The internal link class.
 * @constructor
 *
 * @todo check please
 * @param {Object} raptor
 * @returns {Element}
 */
function LinkTypeInternal(raptor) {
    this.raptor = raptor;
    this.label = tr('linkTypeInternalLabel');
}

/**
 * Gets the content of the internal link.
 *
 * @returns {Element}
 */
LinkTypeInternal.prototype.getContent = function() {
    return this.raptor.getTemplate('link.internal', {
        baseClass: this.raptor.options.baseClass,
        domain: window.location.protocol + '//' + window.location.host
    });
};

/**
 * Gets the attributes of the internal link.
 *
 * @todo type and des for panel and return
 * @param {type} panel
 * @returns {LinkTypeInternal.prototype.getAttributes.result}
 */
LinkTypeInternal.prototype.getAttributes = function(panel) {
    var address = panel.find('[name=location]').val(),
        target = panel.find('[name=blank]').is(':checked'),
        result = {
            href: address
        };

    if (target) {
        result.target = '_blank';
    }

    return result;
};

/**
 * Updates the users inputs.
 *
 * @todo type and des for panel and des for return.
 * @param {String} link The internal lnk.
 * @param {type} panel
 * @returns {Boolean}
 */
LinkTypeInternal.prototype.updateInputs = function(link, panel) {
    var href = link.attr('href');
    if (href.indexOf('http://') === -1 &&
            href.indexOf('mailto:') === -1) {
        panel.find('[name=location]').val(href);
    } else {
        panel.find('[name=location]').val('');
    }
    if (link.attr('target') === '_blank') {
        panel.find('[name=blank]').prop('checked', true);
    } else {
        panel.find('[name=blank]').prop('checked', false);
    }
    return false;
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-type-internal.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/list/list-ordered.js
/**
 * @fileOverview Contains the ordered list button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a new instance of the preview toggle button to create ordered lists.
 */
Raptor.registerUi(new Button({
    name: 'listOrdered',
    action: function() {
        document.execCommand('insertorderedlist');
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/list/list-ordered.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/list/list-unordered.js
/**
 * @fileOverview Contains the unordered list button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a new instance of the preview toggle button to create unordered lists.
 *
 * @todo param details?
 * @param {type} param
 */
Raptor.registerUi(new Button({
    name: 'listUnordered',
    action: function() {
        document.execCommand('insertunorderedlist');
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/list/list-unordered.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/logo/logo.js
/**
 * @fileOverview Contains the logo button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a new instance of the button class to display the raptor logo and
 * link to the raptor version page.
 */
Raptor.registerUi(new Button({
    name: 'logo',
    // <usage-statistics/>
    action: function() {
        window.open('http://www.raptor-editor.com/about/VERSION', '_blank');
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/logo/logo.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/no-break/no-break.js
/**
 * @fileOverview No break plugin.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 */

function NoBreakPlugin(name, overrides) {
    RaptorPlugin.call(this, name || 'noBreak', overrides);
}

NoBreakPlugin.prototype = Object.create(RaptorPlugin.prototype);

NoBreakPlugin.prototype.init = function() {
    this.raptor.getElement().on('keypress.raptor', this.preventReturn.bind(this));
    this.raptor.getElement().on('drop.raptor', this.preventDrop.bind(this));
};

NoBreakPlugin.prototype.preventReturn = function(event) {
    if (this.options.enabled && event.which === 13) {
        return false;
    }
};

NoBreakPlugin.prototype.preventDrop = function(event) {
    return this.options.enabled;
// Attempt to allow dropping of plain text (not working)
//
//    console.log(event.originalEvent);
//    var range = rangy.getSelection().getRangeAt(0).cloneRange();
//    console.log(range);
//    console.log(range.startOffset);
//    console.log(range.endOffset);
//    for (var i = 0, l = event.originalEvent.dataTransfer.items.length; i < l; i++) {
//        console.log(event.originalEvent);
//        if (event.originalEvent.dataTransfer.items[i].type == 'text/plain' &&
//                event.originalEvent.dataTransfer.items[i].kind == 'string') {
//            event.originalEvent.dataTransfer.items[i].getAsString(function(content) {
//                this.raptor.actionApply(function() {
//                    rangeReplace(range, content);
////                    selectionReplace(content);
//                })
//            }.bind(this));
//        }
//    }
//    return false;
};

Raptor.registerPlugin(new NoBreakPlugin());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/no-break/no-break.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/normalise-line-breaks/normalise-line-breaks.js
/**
 * @fileOverview Contains the view normalise line breaks button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Attempts to enforce standard behaviour across browsers for return &
 * shift+return key presses.
 *
 * @constructor
 * @param {String} name
 * @param {Object} overrides
 */
function NormaliseLineBreaksPlugin(name, overrides) {
    RaptorPlugin.call(this, name || 'normaliseLineBreaks', overrides);
}

NormaliseLineBreaksPlugin.prototype = Object.create(RaptorPlugin.prototype);

/**
 * Register hotkey actions.
 */
NormaliseLineBreaksPlugin.prototype.init = function() {
    this.raptor.registerHotkey('return', this.returnPressed.bind(this));
    this.raptor.registerHotkey('shift+return', this.shiftReturnPressed.bind(this));
};

NormaliseLineBreaksPlugin.prototype.returnPressedList = function(selectedElement) {
    var selectedListElement = selectedElement.closest('li');
    if (!selectedListElement.length) {
        return false;
    }

    var parentList = selectedListElement.closest('ul, ol');
    var listType = parentList.get(0).tagName.toLowerCase(),
        replacementElement = false;

    // If current list element is empty, list element needs to be replaced with <p>
    if (elementIsEmpty(selectedListElement)) {
        // If not at bottom of list, list must be broken
        var nextListElement = selectedListElement.next();
        if (nextListElement.length && nextListElement.is('li')) {
            replacementElement = listBreakByReplacingSelection(listType, 'li', this.raptor.getElement(), '<p>&nbsp;</p>');
            if (replacementElement) {
                selectionSelectInner(replacementElement.get(0));
            }
        } else {
            selectedListElement.remove();
            selectionSelectInner($('<p>&nbsp;</p>').insertAfter(parentList).get(0));
        }
    } else {
        replacementElement = listBreakAtSelection(listType, 'li', this.raptor.getElement());
        if (replacementElement) {
            selectionSelectStart(replacementElement.get(0));
        }
    }
    return true;

};

/**
 * Handle return keypress.
 *
 * When inside a ul/ol, the the current list item is split and the cursor is
 * placed at the start of the second list item.
 *
 * @return {Boolean} True if the keypress has been handled and should not propagate
 *                        further
 */
NormaliseLineBreaksPlugin.prototype.returnPressed = function() {
    var selectedElement = selectionGetElement();

    if (this.returnPressedList(selectedElement)) {
        return true;
    }
    return false;
};

NormaliseLineBreaksPlugin.prototype.shiftReturnPressedList = function(selectedElement) {
    if (selectedElement.closest('li').length) {
        var listType = selectedElement.closest('ul, ol').get(0).tagName.toLowerCase();
        var replacementElement = listBreakByReplacingSelection(listType, 'li', this.raptor.getElement(), '<p>&nbsp;</p>');
        if (replacementElement) {
            selectionSelectInner(replacementElement.get(0));
        }
        return true;
    }

    return false;
};

/**
 * Handle shift+return keypress.
 *
 * When inside a ul/ol, the the current selection is replaced with a p by splitting the list.
 *
 * @return {Boolean} True if the keypress has been handled and should not propagate
 *                        further
 */
NormaliseLineBreaksPlugin.prototype.shiftReturnPressed = function() {
    var selectedElement = selectionGetElement();
    if (this.shiftReturnPressedList(selectedElement)) {
        return true;
    }
    return false;
};

Raptor.registerPlugin(new NormaliseLineBreaksPlugin());

;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/normalise-line-breaks/normalise-line-breaks.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/paste/paste.js
/**
 * @fileOverview Contains the paste plugin class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

var pasteInProgress = false,
    pasteDialog = null,
    pasteInstance = null,
    pasteShiftDown = null;

/**
 * The paste plugin class.
 *
 * @constructor
 * @augments RaptorPlugin
 *
 * @param {String} name
 * @param {Object} overrides Options hash.
 */
function PastePlugin(name, overrides) {
    /**
     * Default options.
     *
     * @type {Object}
     */
    this.options = {
        /**
         * Tags that will not be stripped from pasted content.
         * @type {Array}
         */
        allowedTags: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote',
            'p', 'a', 'span', 'hr', 'br', 'strong', 'em'
        ],

        allowedAttributes: [
            'href', 'title'
        ],

        allowedEmptyTags: [
            'hr', 'br'
        ],
        
        panels: [
            'formatted-clean',
            'plain-text',
            'formatted-unclean',
            'source'
        ]
    };

    RaptorPlugin.call(this, name || 'paste', overrides);
}

PastePlugin.prototype = Object.create(RaptorPlugin.prototype);

/**
 * Enables pasting.
 */
PastePlugin.prototype.enable = function() {
    this.raptor.getElement().on('paste.raptor', this.capturePaste.bind(this));
};

/**
 * Captures the html to be pasted.
 *
 * @returns {Boolean} True if paste capture is successful.
 */
PastePlugin.prototype.capturePaste = function() {
    if (pasteShiftDown) {
        return;
    }
    if (pasteInProgress) {
        return false;
    }
    selectionSave();

    pasteInProgress = true;

    // Make a contentEditable div to capture pasted text
    $('.raptorPasteBin').remove();
    $('<div class="raptorPasteBin" contenteditable="true" style="width: 1px; height: 1px; overflow: hidden; position: fixed; top: -1px;" />').appendTo('body');
    $('.raptorPasteBin').focus();

    window.setTimeout(this.showPasteDialog.bind(this), 0);

    return true;
};

/**
 * Opens the paste dialog.
 */
PastePlugin.prototype.showPasteDialog = function() {
    aDialogOpen(this.getDialog(this));
};

/**
 * Inserts the pasted content into the selection.
 *
 * @param {HTML} html The html to be pasted into the selection.
 */
PastePlugin.prototype.pasteContent = function(html) {
    this.raptor.actionApply(function() {
        var uniqueId = elementUniqueId();
        selectionRestore();
        html = this.filterAttributes(html);
        html = this.filterChars(html);
        selectionReplace($('<placeholder id="' + uniqueId + '">' + html + '</placeholder>'));
        $('.raptorPasteBin').remove();
        var placeholder = $('#' + uniqueId);
        selectionSelectInner(placeholder.get(0));
        selectionSave();
        placeholder.contents().unwrap();
        selectionRestore();
    }.bind(this));
};

/**
 * Gets the paste dialog.
 *
 * @todo type for instance
 * @param {type} instance The paste instance
 * @returns {Object} The paste dialog.
 */
PastePlugin.prototype.getDialog = function(instance) {
    pasteInstance = instance;
    if (!pasteDialog) {
        pasteDialog = $('<div>').html(this.raptor.getTemplate('paste.dialog', this.options));
        for (var i = 0, l = this.options.panels.length; i < l; i++) {
            pasteDialog.find('.' + this.options.baseClass + '-tab-' + this.options.panels[i]).css('display', '');
            if (i === 0) {
                pasteDialog.find('.' + this.options.baseClass + '-content-' + this.options.panels[i]).css('display', '');
            }
        }
        pasteDialog.find('.' + this.options.baseClass + '-panel-tabs > div:visible:not(:first)').hide();
        aDialog(pasteDialog, {
            modal: true,
            resizable: true,
            autoOpen: false,
            width: 800,
            height: 500,
            title: tr('pasteDialogTitle'),
            dialogClass: this.options.baseClass + '-dialog',
            close: function() {
                pasteInProgress = false;
            },
            buttons: [
                {
                    text: tr('pasteDialogOKButton'),
                    click: function() {
                        var html = null,
                            element = pasteDialog.find('.' + this.options.baseClass + '-area:visible');

                        if (element.hasClass(this.options.baseClass + '-plain') || element.hasClass(this.options.baseClass + '-source')) {
                            html = element.val();
                        } else {
                            html = element.html();
                        }
                        aDialogClose(pasteDialog);
                        pasteInstance.pasteContent(html);
                    }.bind(this),
                    icons: {
                        primary: 'ui-icon-circle-check'
                    }
                },
                {
                    text: tr('pasteDialogCancelButton'),
                    click: function() {
                        selectionDestroy();
                        $('.raptorPasteBin').remove();
                        aDialogClose(pasteDialog);
                    },
                    icons: {
                        primary: 'ui-icon-circle-close'
                    }
                }
            ]
        });

        // Create fake jQuery UI tabs (to prevent hash changes)
        var tabs = pasteDialog.find('.' + this.options.baseClass + '-panel-tabs');
        tabs.find('li')
            .click(function() {
                tabs.find('ul li').removeClass('ui-state-active').removeClass('ui-tabs-selected');
                $(this).addClass('ui-state-active').addClass('ui-tabs-selected');
                tabs.children('div').hide().eq($(this).index()).show();
            });
    }
    this.updateAreas();
    return pasteDialog;
};

/**
 * Attempts to filter rubbish from content using regular expressions.
 *
 * @param  {String} content Dirty text
 * @return {String} The filtered content
 */
PastePlugin.prototype.filterAttributes = function(content) {
    // The filters variable is an array of of regular expression & handler pairs.
    //
    // The regular expressions attempt to strip out a lot of style data that
    // MS Word likes to insert when pasting into a contentEditable.
    // Almost all of it is junk and not good html.
    //
    // The hander is a place to put a function for match handling.
    // In most cases, it just handles it as empty string.  But the option is there
    // for more complex handling.
    var filters = [
        // Meta tags, link tags, and prefixed tags
        {regexp: /(<meta\s*[^>]*\s*>)|(<\s*link\s* href="file:[^>]*\s*>)|(<\/?\s*\w+:[^>]*\s*>)/gi, handler: ''},
        // MS class tags and comment tags.
        {regexp: /(class="Mso[^"]*")|(<!--(.|\s){1,}?-->)/gi, handler: ''},
        // Apple class tags
        {regexp: /(class="Apple-(style|converted)-[a-z]+\s?[^"]+")/, handle: ''},
        // Google doc attributes
        {regexp: /id="internal-source-marker_[^"]+"|dir="[rtl]{3}"/, handle: ''},
        // blank p tags
        {regexp: /(<p[^>]*>\s*(\&nbsp;|\u00A0)*\s*<\/p[^>]*>)|(<p[^>]*>\s*<font[^>]*>\s*(\&nbsp;|\u00A0)*\s*<\/\s*font\s*>\s<\/p[^>]*>)/ig, handler: ''},
        // Strip out styles containing mso defs and margins, as likely added in IE and are not good to have as it mangles presentation.
        {regexp: /(style="[^"]*mso-[^;][^"]*")|(style="margin:\s*[^;"]*;")/gi, handler: ''},
        // Style tags
        {regexp: /(?:<style([^>]*)>([\s\S]*?)<\/style>|<link\s+(?=[^>]*rel=['"]?stylesheet)([^>]*?href=(['"])([^>]*?)\4[^>\/]*)\/?>)/gi, handler: ''},
        // Scripts (if any)
        {regexp: /(<\s*script[^>]*>((.|\s)*?)<\\?\/\s*script\s*>)|(<\s*script\b([^<>]|\s)*>?)|(<[^>]*=(\s|)*[("|')]javascript:[^$1][(\s|.)]*[$1][^>]*>)/ig, handler: ''}
    ];

    $.each(filters, function(i, filter) {
        content = content.replace(filter.regexp, filter.handler);
    });

    return content;
};

/**
 * Replaces commonly-used Windows 1252 encoded chars that do not exist in ASCII or ISO-8859-1 with ISO-8859-1 cognates.
 * @param  {[type]} content [description]
 * @return {[type]}
 */
PastePlugin.prototype.filterChars = function(content) {
    var s = content;

    // smart single quotes and apostrophe
    s = s.replace(/[\u2018|\u2019|\u201A]/g, '\'');

    // smart double quotes
    s = s.replace(/[\u201C|\u201D|\u201E]/g, '\"');

    // ellipsis
    s = s.replace(/\u2026/g, '...');

    // dashes
    s = s.replace(/[\u2013|\u2014]/g, '-');

    // circumflex
    s = s.replace(/\u02C6/g, '^');

    // open angle bracket
    s = s.replace(/\u2039/g, '<');

    // close angle bracket
    s = s.replace(/\u203A/g, '>');

    // spaces
    s = s.replace(/[\u02DC|\u00A0]/g, ' ');

    return s;
};

/**
 * Strip all attributes from content (if it's an element), and every element contained within
 * Strip loop taken from <a href="http://stackoverflow.com/a/1870487/187954">Remove all attributes</a>
 * @param  {String|Element} content The string / element to be cleaned
 * @return {String} The cleaned string
 */
PastePlugin.prototype.stripAttributes = function(content) {
    content = $('<div/>').html(content);
    var allowedAttributes = this.options.allowedAttributes;

    $(content.find('*')).each(function() {
        // First copy the attributes to remove if we don't do this it causes problems iterating over the array
        // we're removing elements from
        var attributes = [];
        $.each(this.attributes, function(index, attribute) {
            // Do not remove allowed attributes
            if (-1 !== $.inArray(attribute.nodeName, allowedAttributes)) {
                return;
            }
            attributes.push(attribute.nodeName);
        });

        // now remove the attributes
        for (var attributeIndex = 0; attributeIndex < attributes.length; attributeIndex++) {
            $(this).attr(attributes[attributeIndex], null);
        }
    });
    return content.html();
};

/**
 * Remove empty tags.
 *
 * @param {String} content The HTML containing empty elements to be removed
 * @return {String} The cleaned HTML
 */
PastePlugin.prototype.stripEmpty = function(content) {
    var wrapper = $('<div/>').html(content);
    var allowedEmptyTags = this.options.allowedEmptyTags;
    wrapper.find('*').filter(function() {
        // Do not strip elements in allowedEmptyTags
        if (-1 !== $.inArray(this.tagName.toLowerCase(), allowedEmptyTags)) {
            return false;
        }
        // If the element has at least one child element that exists in allowedEmptyTags, do not strip it
        if ($(this).find(allowedEmptyTags.join(',')).length) {
            return false;
        }
        return $.trim($(this).text()) === '';
    }).remove();
    return wrapper.html();
};

/**
 * Remove spans that have no attributes.
 *
 * @param {String} content
 * @return {String} The cleaned HTML
 */
PastePlugin.prototype.stripSpans = function(content) {
    var wrapper = $('<div/>').html(content);
    wrapper.find('span').each(function() {
        if (!this.attributes.length) {
            $(this).replaceWith($(this).html());
        }
    });
    return wrapper.html();
};

/**
 * Update text input content.
 */
PastePlugin.prototype.updateAreas = function() {
    var markup = $('.raptorPasteBin').html();
    markup = this.filterAttributes(markup);
    markup = this.filterChars(markup);
    markup = this.stripEmpty(markup);
    markup = this.stripAttributes(markup);
    markup = this.stripSpans(markup);
    markup = stringStripTags(markup, this.options.allowedTags);

    var plain = $('<div/>').html($('.raptorPasteBin').html()).text();
    var html = $('.raptorPasteBin').html();

    pasteDialog.find('.' + this.options.baseClass + '-plain').val($('<div/>').html(plain).text());
    pasteDialog.find('.' + this.options.baseClass + '-rich').html(markup);
    pasteDialog.find('.' + this.options.baseClass + '-source').html(html);
    pasteDialog.find('.' + this.options.baseClass + '-markup').html(markup);
};

$(document).on('keyup.raptor keydown.raptor', function(event) {
    pasteShiftDown = event.shiftKey;
});

Raptor.registerPlugin(new PastePlugin());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/paste/paste.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/placeholder/placeholder.js
/**
 * @fileOverview Placeholder text component.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Placeholder plugin
 *
 * @constructor
 * @augments RaptorPlugin
 * @param {[type]} name
 * @param {[type]} overrides
 */
function PlaceholderPlugin(name, overrides) {

    /**
     * Default placholder plugin options.
     *
     * @type {Object}
     */
    this.options = {

        /**
         * The placeholder content used if the Raptor Editor's instance has no content.
         *
         * @type {String}
         */
        content: tr('placeholderPluginDefaultContent'),

        /**
         * Tag to wrap placeholder content.
         *
         * @type {String}
         */
        tag: 'p',

        /**
         * Select placeholder content when inserted.
         *
         * @type {Boolean}
         */
        select: true
    };

    RaptorPlugin.call(this, name || 'placeholder', overrides);
}

PlaceholderPlugin.prototype = Object.create(RaptorPlugin.prototype);

/**
 * Init placeholder plugin.
 */
PlaceholderPlugin.prototype.init = function() {
    this.raptor.bind('enabled', this.enabled.bind(this));
    this.raptor.bind('change', this.check.bind(this));
};

/**
 * Insert the placeholder if the editable element is empty.
 */
PlaceholderPlugin.prototype.enabled = function() {
    this.check(this.raptor.getHtml());
};

PlaceholderPlugin.prototype.check = function(html) {
    html = html.trim();
    if (!html || html === '<br>' || html === '<div><br></div>') {
        var raptorNode = this.raptor.getNode(),
            tag = document.createElement(this.options.tag);
        tag.innerHTML = this.options.content;
        raptorNode.innerHTML = '';
        raptorNode.appendChild(tag);
        if (this.options.select) {
            selectionSelectInner(raptorNode.childNodes[0]);
        }
        this.raptor.checkChange();
    }
};

Raptor.registerPlugin(new PlaceholderPlugin());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/placeholder/placeholder.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/save/save.js
/**
 * @fileOverview Contains the save class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the button class to save any changes.
 */
Raptor.registerUi(new Button({
    name: 'save',

    action: function() {
        if (this.getPlugin()) {
            this.getPlugin().save();
        } else {
            aNotify({
                text: tr('saveNotConfigured'),
                type: 'error'
            });
        }
    },

    init: function() {
        if (this.options.plugin === null) {
            return;
        }

        var result = Button.prototype.init.apply(this, arguments);

        // <strict/>

        this.raptor.bind('dirty', this.dirty.bind(this));
        this.raptor.bind('cleaned', this.clean.bind(this));
        this.clean();
        return result;
    },

    getPlugin: function() {
        return this.raptor.getPlugin(this.options.plugin);
    },

    dirty: function() {
        aButtonEnable(this.button);
    },

    clean: function() {
        aButtonDisable(this.button);
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/save/save.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/snippet-menu/snippet-menu.js
/**
 * @fileOverview Contains the snippet menu class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * The snippet menu class.
 *
 * @constructor
 * @augments SelectMenu
 *
 * @param {Object} options
 */
function SnippetMenu(options) {
    SelectMenu.call(this, {
        name: 'snippetMenu'
    });
}

SnippetMenu.prototype = Object.create(SelectMenu.prototype);

/**
 * Initialize the snippet menu.
 *
 * @returns {Element}
 */
SnippetMenu.prototype.init = function() {
    var result = SelectMenu.prototype.init.call(this);
    if (typeof this.options.snippets !== 'undefined' &&
            Object.keys(this.options.snippets).length > 0) {
        return result;
    }
};

/**
 * Inserts the snippet into the selected text.
 *
 * @todo type for name
 * @param {type} name The name of the snippet.
 */
SnippetMenu.prototype.insertSnippet = function(name) {
    selectionReplace(this.options.snippets[name]);
};

/**
 * Applies the insertion of the snippet.
 *
 * @param {type} event The click event that applies the snippet.
 */
SnippetMenu.prototype.menuItemMouseDown = function(event) {
    this.raptor.actionApply(function() {
        this.insertSnippet($(event.currentTarget).data('name'));
    }.bind(this));
};

/**
 * Previews the insertion of a snippet.
 *
 * @param {type} event The mouse event that triggers the preview.
 */
SnippetMenu.prototype.menuItemMouseEnter = function(event) {
    this.raptor.actionPreview(function() {
        this.insertSnippet($(event.currentTarget).data('name'));
    }.bind(this));
};

/**
 * Removes the preview state.
 */
SnippetMenu.prototype.menuItemMouseLeave = function() {
    this.raptor.actionPreviewRestore();
};

/**
 * Gets the menu items for the snippet menu.
 *
 * @todo check type for return
 * @returns {Element} The menu items.
 */
SnippetMenu.prototype.getMenuItems = function() {
    var items = '';
    for (var name in this.options.snippets) {
        items += this.raptor.getTemplate('snippet-menu.item', {
            name: name
        });
    }
    return items;
};

Raptor.registerUi(new SnippetMenu());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/snippet-menu/snippet-menu.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/special-characters/special-characters.js
/**
 * @fileOverview Contains the special characters button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

var insertCharacter = false;

/**
 * Creates an instance of the button class to insert special characters.
 */
Raptor.registerUi(new DialogButton({
    name: 'specialCharacters',
    dialogOptions: {
        width: 645
    },
    options: {
        setOrder: [
            'symbols',
            'mathematics',
            'arrows',
            'greekAlphabet'
        ],
        /**
         * Character sets available for display. From {@link http://turner.faculty.swau.edu/webstuff/htmlsymbols.html}
         */
        characterSets: {
            symbols: {
                name: tr('specialCharactersSymbols'),
                characters: [
                    ['<', '&lt;', 'less than'],
                    ['>', '&gt;', 'greater than'],
                    ['&', '&amp;', 'ampersand'],
                    ['"', '&quot;', 'quotation mark'],
                    ['&nbsp;', 'non-breaking space: \' \''],
                    ['&emsp;', 'em space: \'  \''],
                    ['&ensp;', 'en space: \' \''],
                    ['&thinsp;', 'thin space: \'\''],
                    ['&mdash;', 'em dash'],
                    ['&ndash;', 'en dash'],
                    ['&minus;', 'minus'],
                    ['-', 'hyphen'],
                    ['&oline;', 'overbar space'],
                    ['&cent;', 'cent'],
                    ['&pound;', 'pound'],
                    ['&euro;', 'euro'],
                    ['&sect;', 'section'],
                    ['&dagger;', 'dagger'],
                    ['&Dagger;', 'double dagger'],
                    ['&lsquo;', 'left single quotes'],
                    ['&rsquo;', 'right single quotes'],
                    ['\'', 'single quotes'],
                    ['&#x263a;', 'smiley face'],
                    ['&#x2605;', 'black star'],
                    ['&#x2606;', 'white star'],
                    ['&#x2610;', 'check box'],
                    ['&middot;', 'middle dot'],
                    ['&bull;', 'bullet'],
                    ['&copy;', 'copyright'],
                    ['&reg;', 'registered'],
                    ['&trade;', 'trade'],
                    ['&iquest;', 'inverted question mark'],
                    ['&iexcl;', 'inverted exclamation mark'],
                    ['&Aring;', 'Angström'],
                    ['&hellip;', 'ellipsis'],
                    ['&#x2295;', 'earth'],
                    ['&#x2299;', 'sun'],
                    ['&#x2640;', 'female'],
                    ['&#x2642;', 'male'],
                    ['&clubs;', 'clubs or shamrock'],
                    ['&spades;', 'spades'],
                    ['&hearts;', 'hearts or valentine'],
                    ['&diams;', 'diamonds'],
                    ['&loz;', 'diamond']
                ]
            },
            mathematics: {
                name: tr('specialCharactersMathematics'),
                characters: [
                    ['&lt;', 'less than'],
                    ['&le;', 'less than or equal to'],
                    ['&gt;', 'greater than'],
                    ['&ge;', 'greater than or equal to'],
                    ['&ne;', 'not equal'],
                    ['&asymp;', 'approximately equal to'],
                    ['&equiv;', 'identically equal to'],
                    ['&cong;', 'congruent to'],
                    ['&prop;', 'proportional'],
                    ['&there4;', 'therefore'],
                    ['&sum;', 'summation'],
                    ['&prod;', 'product'],
                    ['&prime;', 'prime or minutes'],
                    ['&Prime;', 'double prime or seconds'],
                    ['&Delta;', 'delta'],
                    ['&nabla;', 'del'],
                    ['&part;', 'partial'],
                    ['&int;', 'integral'],
                    ['&middot;', 'middle dot'],
                    ['&sdot;', 'dot operator'],
                    ['&bull;', 'bullet'],
                    ['&minus;', 'minus sign'],
                    ['&times;', 'multipllcation sign'],
                    ['&divide;', 'division sign'],
                    ['&frasl;', 'fraction slash, (ordinary / \\)'],
                    ['&plusmn;', 'plus or minus'],
                    ['&deg;', 'degree sign'],
                    ['&lfloor;', 'floor function'],
                    ['&rfloor;', 'floor function'],
                    ['&lceil;', 'ceiling function'],
                    ['&rceil;', 'ceiling function'],
                    ['&lowast;', 'asterisk operator, (ordinary *)'],
                    ['&oplus;', 'circled plus'],
                    ['&otimes;', 'circled times'],
                    ['&ordm;', 'masculine ordinal'],
                    ['&lang;', 'bra'],
                    ['&rang;', 'ket'],
                    ['&infin;', 'infinity'],
                    ['&pi;', 'pi'],
                    ['&frac12;', 'half'],
                    ['&alefsym;', 'aleph'],
                    ['&radic;', 'radical'],
                    ['&ang;', 'angle'],
                    ['&perp;', 'perpendicular'],
                    ['&real;', 'real'],
                    ['&isin;', 'is an element of'],
                    ['&notin;', 'not an element of'],
                    ['&empty;', 'null set'],
                    ['&sub;', 'subset of'],
                    ['&sube;', 'subset or or equal to'],
                    ['&nsub;', 'not a subset'],
                    ['&cap;', 'intersection'],
                    ['&cup;', 'union'],
                    ['&sim;', 'tilde operator (ordinary ~)'],
                    ['&Oslash;', 'slash O'],
                    ['&and;', 'logical and'],
                    ['&Lambda;', 'lambda (and)'],
                    ['&or;', 'logical or'],
                    ['&not;', 'not sign'],
                    ['&sim;', 'tilde operator (ordinary ~)'],
                    ['&rarr;', 'right arrow'],
                    ['&rArr;', 'double right arrow'],
                    ['&larr;', 'left arrow'],
                    ['&lArr;', 'left double arrow'],
                    ['&harr;', 'left right arrow'],
                    ['&hArr;', 'left right double arrow']
                ]
            },
            arrows: {
                name: tr('specialCharactersArrows'),
                characters: [
                    ['&darr;', 'down arrow'],
                    ['&dArr;', 'down double arrow'],
                    ['&uarr;', 'up arrow'],
                    ['&uArr;', 'up double arrow'],
                    ['&crarr;', 'arriage return arrow'],
                    ['&rarr;', 'right arrow'],
                    ['&rArr;', 'double right arrow'],
                    ['&larr;', 'left arrow'],
                    ['&lArr;', 'left double arrow'],
                    ['&harr;', 'left right arrow'],
                    ['&hArr;', 'left right double arrow']
                ]
            },
            greekAlphabet: {
                name: tr('specialCharactersGreekAlphabet'),
                characters: [
                    ['&alpha;', 'alpha'],
                    ['&beta;', 'beta'],
                    ['&gamma;', 'gamma'],
                    ['&delta;', 'delta'],
                    ['&epsilon;', 'epsilon'],
                    ['&zeta;', 'zeta'],
                    ['&eta;', 'eta'],
                    ['&theta;', 'theta'],
                    ['&iota;', 'iota'],
                    ['&kappa;', 'kappa'],
                    ['&lambda;', 'lambda'],
                    ['&mu;', 'mu'],
                    ['&nu;', 'nu'],
                    ['&xi;', 'xi'],
                    ['&omicron;', 'omicron'],
                    ['&pi;', 'pi'],
                    ['&rho;', 'rho'],
                    ['&sigma;', 'sigma'],
                    ['&tau;', 'tau'],
                    ['&upsilon;', 'upsilon'],
                    ['&phi;', 'phi'],
                    ['&chi;', 'chi'],
                    ['&psi;', 'psi'],
                    ['&omega;', 'omega'],
                    ['&Alpha;', 'alpha'],
                    ['&Beta;', 'beta'],
                    ['&Gamma;', 'gamma'],
                    ['&Delta;', 'delta'],
                    ['&Epsilon;', 'epsilon'],
                    ['&Zeta;', 'zeta'],
                    ['&Eta;', 'eta'],
                    ['&Theta;', 'theta'],
                    ['&Iota;', 'iota'],
                    ['&Kappa;', 'kappa'],
                    ['&Lambda;', 'lambda'],
                    ['&Mu;', 'mu'],
                    ['&Nu;', 'nu'],
                    ['&Xi;', 'xi'],
                    ['&Omicron;', 'omicron'],
                    ['&Pi;', 'pi'],
                    ['&Rho;', 'rho'],
                    ['&Sigma;', 'sigma'],
                    ['&Tau;', 'tau'],
                    ['&Upsilon;', 'upsilon'],
                    ['&Phi;', 'phi'],
                    ['&Chi;', 'chi'],
                    ['&Psi;', 'psi'],
                    ['&Omega;', 'omega']
                ]
            }
        }
    },

    applyAction: function(dialog) {
        this.raptor.actionApply(function() {
            if (insertCharacter) {
                selectionReplace(insertCharacter);
            }
            insertCharacter = false;
        });
    },

    /**
     * Prepare tabs and add buttons to tab content.
     *
     * @return {Element}
     */
    getDialogTemplate: function() {
        var html = $(this.raptor.getTemplate('special-characters.dialog')).appendTo('body').hide();
        var setKey, tabContent, character, characterButton;
        for (var setOrderIndex = 0; setOrderIndex < this.options.setOrder.length; setOrderIndex++) {
            setKey = this.options.setOrder[setOrderIndex];

            html.find('ul').append(this.raptor.getTemplate('special-characters.tab-li', {
                baseClass: this.options.baseClass,
                name: this.options.characterSets[setKey].name,
                key: setKey
            }));

            tabContent = $(this.raptor.getTemplate('special-characters.tab-content', {
                baseClass: this.options.baseClass,
                key: setKey
            }));
            var tabCharacters = [];
            for (var charactersIndex = 0; charactersIndex < this.options.characterSets[setKey].characters.length; charactersIndex++) {
                character = this.options.characterSets[setKey].characters[charactersIndex];
                characterButton = this.raptor.getTemplate('special-characters.tab-button', {
                    htmlEntity: character[0],
                    description: character[1],
                    setKey: setKey,
                    charactersIndex: charactersIndex
                });
                tabCharacters.push(characterButton);
            }
            tabContent.append(tabCharacters.join(''));
            html.find('ul').after(tabContent);
        }
        html.show();

        var _this = this;
        html.find('button').each(function() {
            aButton($(this));
        }).click(function() {
            var setKey = $(this).attr('data-setKey');
            var charactersIndex = $(this).attr('data-charactersIndex');
            insertCharacter = _this.options.characterSets[setKey].characters[charactersIndex][0];
            _this.getOkButton(_this.name).click.call(this);
        });
        aTabs(html);
        return html;
    },

    getCancelButton: function() {
        return;
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/special-characters/special-characters.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-cell-button.js
/**
 * @fileOverview Contains the table cell button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * The table cell button class.
 *
 * @constructor
 * @augments FilteredPreviewButton
 *
 * @param {Object} options Options hash.
 */
function TableCellButton(options) {
    FilteredPreviewButton.call(this, options);
}

TableCellButton.prototype = Object.create(FilteredPreviewButton.prototype);

/**
 * @todo
 *
 * @param {RangySelection} range The selection to get the cell from.
 * @returns {Element|null}
 */
TableCellButton.prototype.getElement = function(range) {
    var cell = $(range.commonAncestorContainer.parentNode).closest('td, th');
    if (cell.length) {
        return cell[0];
    }
    return null;
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-cell-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-create.js
/**
 * @fileOverview Contains the table menu class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * The table menu class.
 *
 * @constructor
 * @augments Menu
 *
 * @param {Object} options Options hash.
 */
function TableMenu(options) {
    Menu.call(this, {
        name: 'tableCreate'
    });
}

TableMenu.prototype = Object.create(Menu.prototype);

/**
 * Creates the menu table.
 *
 * @param event The mouse event to create the table.
 */
TableMenu.prototype.createTable = function(event) {
    this.raptor.actionApply(function() {
        selectionReplace(elementOuterHtml($(tableCreate(event.target.cellIndex + 1, event.target.parentNode.rowIndex + 1, {
            placeHolder: '&nbsp;'
        }))));
    });
};

/**
 * Highlights the cells inside the table menu.
 *
 * @param event The mouse event to trigger the function.
 */
TableMenu.prototype.highlight = function(event) {
    var cells = tableCellsInRange(this.menuTable.get(0), {
            x: 0,
            y: 0
        }, {
            x: event.target.cellIndex,
            y: event.target.parentNode.rowIndex
        });

    // highlight cells in menu
    this.highlightRemove(event);
    $(cells).addClass(this.options.baseClass + '-menu-hover');

    // Preview create
    this.raptor.actionPreview(function() {
        selectionReplace(elementOuterHtml($(tableCreate(event.target.cellIndex + 1, event.target.parentNode.rowIndex + 1, {
            placeHolder: '&nbsp;'
        }))));
    });
};

/**
 * Removes the highlight from the table menu.
 *
 * @param event The mouse event to trigger the function.
 */
TableMenu.prototype.highlightRemove = function(event) {
    this.menuTable
        .find('.' + this.options.baseClass + '-menu-hover')
        .removeClass(this.options.baseClass + '-menu-hover');
    this.raptor.actionPreviewRestore();
};

/**
 * Prepares and returns the menu for use in the Raptor UI.
 * @returns {Element}
 */
TableMenu.prototype.getMenu = function() {
    if (!this.menu) {
        this.menuContent = this.raptor.getTemplate('table.create-menu', this.options);
        Menu.prototype.getMenu.call(this)
            .on('click', 'td', this.createTable.bind(this))
            .on('mouseenter', 'td', this.highlight.bind(this))
            .mouseleave(this.highlightRemove.bind(this));
        this.menuTable = this.menu.find('table:eq(0)');
    }
    return this.menu;
};

Raptor.registerUi(new TableMenu());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-create.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-delete-column.js
/**
 * @fileOverview Contains the delete column button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a table cell button to delete a column from a table.
 */
Raptor.registerUi(new TableCellButton({
    name: 'tableDeleteColumn',
    applyToElement: function(cell) {
        var position = tableGetCellIndex(cell),
            table = cell.parentNode.parentNode.parentNode,
            nextCell;
        tableDeleteColumn(cell.parentNode.parentNode.parentNode, position.x);
        if (tableIsEmpty(table)) {
            table.parentNode.removeChild(table);
            return;
        }
        nextCell = tableGetCellByIndex(table, position);
        if (!nextCell && position.x > 0) {
            nextCell = tableGetCellByIndex(table, {
                x: position.x - 1,
                y: position.y
            });
        }
        selectionSelectInner(nextCell);
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-delete-column.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-delete-row.js
/**
 * @fileOverview Contains the delete column button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a table cell button to delete a row from a table.
 */
Raptor.registerUi(new TableCellButton({
    name: 'tableDeleteRow',
    applyToElement: function(cell) {
        var position = tableGetCellIndex(cell),
            table = cell.parentNode.parentNode.parentNode,
            nextCell;
        tableDeleteRow(cell.parentNode.parentNode.parentNode, position.y);
        if (tableIsEmpty(table)) {
            table.parentNode.removeChild(table);
            return;
        }
        nextCell = tableGetCellByIndex(table, position);
        if (!nextCell && position.y > 0) {
            nextCell = tableGetCellByIndex(table, {
                x: position.x,
                y: position.y - 1
            });
        }
        selectionSelectInner(nextCell);
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-delete-row.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-insert-column.js
/**
 * @fileOverview Contains the insert column button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a table cell button to insert a column into a table.
 */
Raptor.registerUi(new TableCellButton({
    name: 'tableInsertColumn',
    applyToElement: function(cell) {
        tableInsertColumn(cell.parentNode.parentNode.parentNode, tableGetCellIndex(cell).x + 1, {
            placeHolder: '&nbsp;'
        });
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-insert-column.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-insert-row.js
/**
 * @fileOverview Contains the insert row button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a table cell button to insert a row into a table.
 */
Raptor.registerUi(new TableCellButton({
    name: 'tableInsertRow',
    applyToElement: function(cell) {
        tableInsertRow(cell.parentNode.parentNode.parentNode, tableGetCellIndex(cell).y + 1, {
            placeHolder: '&nbsp;'
        });
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-insert-row.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-merge-cells.js
/**
 * @fileOverview Contains the split cell button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a button to merge the selected cells of a table.
 */
Raptor.registerUi(new Button({
    name: 'tableMergeCells',
    action: function() {
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-merge-cells.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-split-cells.js
/**
 * @fileOverview Contains the split cells button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a button to split the selected cell of a table.
 */
Raptor.registerUi(new Button({
    name: 'tableSplitCells',
    action: function() {
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-split-cells.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-support.js
/**
 * @fileOverview Contains the table helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

var tableSupportDragging = false,
    tableSupportStartCell = null;

/**
 * The supporting table class.
 *
 * @constructor
 *
 * @augments RaptorPlugin
 *
 * @param {String} name
 * @param {Object} overrides Options hash.
 */
function TableSupport(name, overrides) {
    RaptorPlugin.call(this, name || 'tableSupport', overrides);
}

TableSupport.prototype = Object.create(RaptorPlugin.prototype);

/**
 * Initialize the table support class.
 */
TableSupport.prototype.init = function() {
    this.raptor.bind('selectionCustomise', this.selectionCustomise.bind(this));
    this.raptor.registerHotkey('tab', this.tabToNextCell.bind(this));
    this.raptor.registerHotkey('shift+tab', this.tabToPrevCell.bind(this));
    this.raptor.getElement()
        .on('mousedown', 'tbody td', this.cellMouseDown.bind(this))
        .on('mouseover', 'tbody td', this.cellMouseOver.bind(this))
        .mouseup(this.cellMouseUp.bind(this));
};

/**
 * @todo i think this has something to do with the cell selection but i'm not sure
 * @returns {Array}
 */
TableSupport.prototype.selectionCustomise = function() {
    var ranges = [],
        range;
    $('.' + this.options.baseClass + '-cell-selected').each(function() {
        range = rangy.createRange();
        range.selectNodeContents(this);
        ranges.push(range);
    });
    return ranges;
};

/**
 * Event handler for mouse down.
 *
 * @param event The mouse event to trigger the function.
 */
TableSupport.prototype.cellMouseDown = function(event) {
    if (this.raptor.isEditing()) {
        tableSupportStartCell = tableGetCellIndex(event.target);
        if (tableSupportStartCell !== null) {
            tableSupportDragging = true;
            $(event.target).closest('table').addClass(this.options.baseClass + '-selected');
        }
    }
};

/**
 * Event handler for mouse up.
 *
 * @param event The mouse event to trigger the function.
 */
TableSupport.prototype.cellMouseUp = function(event) {
    tableSupportDragging = false;
    var cell = $(event.target).closest('td'),
        deselect = false;
    if (cell.length > 0 && tableSupportStartCell !== null) {
        var index = tableGetCellIndex(cell.get(0));
        if (index === null ||
                (index.x == tableSupportStartCell.x &&
                index.y == tableSupportStartCell.y)) {
            deselect = true;
        }
    } else {
        deselect = true;
    }
    if (deselect) {
        $('.' + this.options.baseClass + '-selected').removeClass(this.options.baseClass + '-selected');
        $('.' + this.options.baseClass + '-cell-selected').removeClass(this.options.baseClass + '-cell-selected');
    }
};

/**
 * Event handler for mouse hover.
 *
 * @param event The mouse event to trigger the function.
 */
TableSupport.prototype.cellMouseOver = function(event) {
    if (tableSupportDragging) {
        var cells = tableCellsInRange($(event.target).closest('table').get(0), tableSupportStartCell, tableGetCellIndex(event.target));
        $('.' + this.options.baseClass + '-cell-selected').removeClass(this.options.baseClass + '-cell-selected');
        $(cells).addClass(this.options.baseClass + '-cell-selected');
        rangy.getSelection().removeAllRanges();
    }
};

/**
 * Handles tabbing to the next table cell.
 */
TableSupport.prototype.tabToNextCell = function() {
    var range = rangy.getSelection().getRangeAt(0),
        parent = rangeGetCommonAncestor(range),
        cell = $(parent).closest('td');
    if (cell.length === 0) {
        return false;
    }
    var next = cell.next('td');
    if (next.length === 0) {
        next = cell.closest('tr').next('tr').find('td:first');
        if (next.length === 0) {
            next = cell.closest('tbody').find('td:first');
        }
    }
    rangeSelectElementContent(range, next);
    rangy.getSelection().setSingleRange(range);
};

/**
 * Handles tabbing to the next table cell.
 */
TableSupport.prototype.tabToPrevCell = function() {
    var range = rangy.getSelection().getRangeAt(0),
        parent = rangeGetCommonAncestor(range),
        cell = $(parent).closest('td');
    if (cell.length === 0) {
        return false;
    }
    var prev = cell.prev('td');
    if (prev.length === 0) {
        prev = cell.closest('tr').prev('tr').find('td:last');
        if (prev.length === 0) {
            prev = cell.closest('tbody').find('td:last');
        }
    }
    rangeSelectElementContent(range, prev);
    rangy.getSelection().setSingleRange(range);
};

Raptor.registerPlugin(new TableSupport());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-support.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/tag-menu/tag-menu.js
/**
 * @fileOverview Contains the left align button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * The tag menu class.
 *
 * @constructor
 * @augments SelectMenu
 *
 * @param {Object} options Options hash.
 */
function TagMenu(options) {
    SelectMenu.call(this, {
        name: 'tagMenu'
    });
}

TagMenu.prototype = Object.create(SelectMenu.prototype);

/**
 * Initializes the tag menu.
 */
TagMenu.prototype.init = function() {
    this.raptor.bind('selectionChange', this.updateButton.bind(this));
    return SelectMenu.prototype.init.apply(this, arguments);
};

/**
 * Changes the tags on the selected element(s).
 *
 * @param {HTML} tag The new tag.
 */
TagMenu.prototype.changeTag = function(tag) {
    // Prevent injection of illegal tags
    if (typeof tag === 'undefined' || tag === 'na') {
        return;
    }

    var selectedElement = selectionGetElement(),
        limitElement = this.raptor.getElement();
    if (selectedElement && !selectedElement.is(limitElement)) {
        var cell = selectedElement.closest('td, li, #' + limitElement.attr('id'));
        if (cell.length !== 0) {
            limitElement = cell;
        }
    }
    
    selectionChangeTags(tag, [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'div', 'pre', 'address'
    ], limitElement);
};

/**
 * Applies the tag change.
 *
 * @param event The mouse event to trigger the function.
 */
TagMenu.prototype.menuItemClick = function(event) {
    SelectMenu.prototype.menuItemClick.apply(this, arguments);
    this.raptor.actionApply(function() {
        this.changeTag($(event.currentTarget).data('value'));
    }.bind(this));
};

/**
 * Generates a preview state for a change of tag.
 *
 * @param event The mouse event to trigger the preview.
 */
TagMenu.prototype.menuItemMouseEnter = function(event) {
    this.raptor.actionPreview(function() {
        this.changeTag($(event.currentTarget).data('value'));
    }.bind(this));
};

/**
 * Restores the tag menu from it's preview state.
 *
 * @param event The mouse event to trigger the restoration of the tag menu.
 */
TagMenu.prototype.menuItemMouseLeave = function(event) {
    this.raptor.actionPreviewRestore();
};

/**
 * Updates the display of the tag menu button.
 */
TagMenu.prototype.updateButton = function() {
    var tag = selectionGetElements()[0],
        button = this.getButton().getButton();
    if (!tag) {
        return;
    }
    var tagName = tag.tagName.toLowerCase(),
        option = this.getMenu().find('[data-value=' + tagName + ']');
    if (option.length) {
        aButtonSetLabel(button, option.html());
    } else {
        aButtonSetLabel(button, tr('tagMenuTagNA'));
    }
//    if (this.raptor.getElement()[0] === tag) {
//        aButtonDisable(button);
//    } else {
//        aButtonEnable(button);
//    }
};

/**
 * Prepares and returns the menu items for use in the raptor UI.
 * @returns {Element}
 */
TagMenu.prototype.getMenuItems = function() {
    return this.raptor.getTemplate('tag-menu.menu', this.options);
};

Raptor.registerUi(new TagMenu());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/tag-menu/tag-menu.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/text-align-button.js
/**
 * @fileOverview Contains the text align button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * The text align button class.
 *
 * @constructor
 * @augments PreviewToggleButton
 *
 * @param {Object} options Options hash.
 */
function TextAlignButton(options) {
    PreviewToggleButton.call(this, options);
}

TextAlignButton.prototype = Object.create(PreviewToggleButton.prototype);

TextAlignButton.prototype.action = function() {
    selectionToggleBlockClasses([
        this.getClass()
    ], [
        this.options.cssPrefix + 'center',
        this.options.cssPrefix + 'left',
        this.options.cssPrefix + 'right',
        this.options.cssPrefix + 'justify'
    ], this.raptor.getElement(), 'span');
    this.selectionChange();
};

TextAlignButton.prototype.selectionToggle = function() {
    return rangy.getSelection().getAllRanges().length > 0 &&
        selectionContains('.' + this.getClass(), this.raptor.getElement());
};;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/text-align-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/center.js
/**
 * @fileOverview Contains the center align button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a text align button to align text center.
 */
Raptor.registerUi(new TextAlignButton({
    name: 'alignCenter',
    getClass: function() {
        return this.options.cssPrefix + 'center';
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/center.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/justify.js
/**
 * @fileOverview Contains the justify text button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a text align button to justify text.
 */
Raptor.registerUi(new TextAlignButton({
    name: 'alignJustify',
    getClass: function() {
        return this.options.cssPrefix + 'justify';
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/justify.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/left.js
/**
 * @fileOverview Contains the left align button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a text align button to align text left.
 */
Raptor.registerUi(new TextAlignButton({
    name: 'alignLeft',
    getClass: function() {
        return this.options.cssPrefix + 'left';
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/left.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/right.js
/**
 * @fileOverview Contains the right align button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a text align button to align text right.
 */
Raptor.registerUi(new TextAlignButton({
    name: 'alignRight',
    getClass: function() {
        return this.options.cssPrefix + 'right';
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/right.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/bold.js
/**
 * @fileOverview Contains the bold button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the CSS applier button to apply the bold class to a selection.
 */
Raptor.registerUi(new CSSClassApplierButton({
    name: 'textBold',
    hotkey: 'ctrl+b',
    tag: 'strong',
    classes: ['bold']
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/bold.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/italic.js
/**
 * @fileOverview Contains the italic button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the CSS applier button to apply the italic class to a
 * selection.
 */
Raptor.registerUi(new CSSClassApplierButton({
    name: 'textItalic',
    hotkey: 'ctrl+i',
    tag: 'em',
    classes: ['italic']
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/italic.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/strike.js
/**
 * @fileOverview Contains the strike button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the CSS applier button to apply the strike class to a
 * selection.
 */
Raptor.registerUi(new CSSClassApplierButton({
    name: 'textStrike',
    tag: 'del',
    classes: ['strike']
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/strike.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/size-decrease.js
/**
 * @fileOverview Contains the text size decrease button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the preview button to apply the text size decrease
 * class to a selection.
 */
Raptor.registerUi(new PreviewButton({
    name: 'textSizeDecrease',
    action: function() {
        selectionExpandToWord();
        this.raptor.selectionConstrain();
        selectionInverseWrapWithTagClass('small', this.options.cssPrefix + 'small', 'big', this.options.cssPrefix + 'big');
        this.raptor.getElement().find('small.' + this.options.cssPrefix + 'small:empty, big.' + this.options.cssPrefix + 'big:empty').remove();
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/size-decrease.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/size-increase.js
/**
 * @fileOverview Contains the text size increase button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the preview button to apply the text size increase
 * class to a selection.
 */
Raptor.registerUi(new PreviewButton({
    name: 'textSizeIncrease',
    action: function() {
        selectionExpandToWord();
        this.raptor.selectionConstrain();
        selectionInverseWrapWithTagClass('big', this.options.cssPrefix + 'big', 'small', this.options.cssPrefix + 'small');
        this.raptor.getElement().find('small.' + this.options.cssPrefix + 'small:empty, big.' + this.options.cssPrefix + 'big:empty').remove();
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/size-increase.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/underline.js
/**
 * @fileOverview Contains the underline button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the CSS applier button to apply the underline class to a selection.
 */
Raptor.registerUi(new CSSClassApplierButton({
    name: 'textUnderline',
    hotkey: 'ctrl+u',
    tag: 'u',
    classes: ['underline']
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/underline.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/sub.js
/**
 * @fileOverview Contains the subscript button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the CSS applier button to apply the subscript class to
 * a selection.
 */
Raptor.registerUi(new CSSClassApplierButton({
    name: 'textSub',
    tag: 'sub',
    classes: ['sub']
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/sub.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/super.js
/**
 * @fileOverview Contains the superscript button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the CSS applier button to apply the superscript class
 * to a selection.
 */
Raptor.registerUi(new CSSClassApplierButton({
    name: 'textSuper',
    tag: 'sup',
    classes: ['sup']
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/super.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/tool-tip/tool-tip.js
/**
 * @fileOverview Stylised tooltip plugin.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 */
function ToolTipPlugin(name, overrides) {
    RaptorPlugin.call(this, name || 'toolTip', overrides);
}

ToolTipPlugin.prototype = Object.create(RaptorPlugin.prototype);

ToolTipPlugin.prototype.init = function() {
    this.raptor.bind('layoutReady', function(node) {
        $(node)
            .on('mouseover', '[title]', function(event) {
                $(this)
                    .attr('data-title', $(this).attr('title'))
                    .removeAttr('title');
            });
    });
};

Raptor.registerPlugin(new ToolTipPlugin());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/tool-tip/tool-tip.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/unsaved-edit-warning/unsaved-edit-warning.js
/**
 * @fileOverview Contains the unsaved edit warning plugin class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

var unsavedEditWarningDirty = 0,
    unsavedEditWarningElement = null;

/**
 * The unsaved edit warning plugin.
 *
 * @constructor
 * @augments RaptorPlugin
 *
 * @param {String} name
 * @param {Object} overrides Options hash.
 */
function UnsavedEditWarningPlugin(name, overrides) {
    RaptorPlugin.call(this, name || 'unsavedEditWarning', overrides);
}

UnsavedEditWarningPlugin.prototype = Object.create(RaptorPlugin.prototype);

/**
 * Enables the unsaved edit warning plugin.
 *
 * @todo raptor details
 * @param {type} raptor
 */
UnsavedEditWarningPlugin.prototype.enable = function(raptor) {
    this.raptor.bind('dirty', this.show.bind(this));
    this.raptor.bind('cleaned', this.hide.bind(this));
};

/**
 * Shows the unsaved edit warning.
 */
UnsavedEditWarningPlugin.prototype.show = function() {
    unsavedEditWarningDirty++;
    elementBringToTop(this.getElement());
    this.getElement().addClass(this.options.baseClass + '-visible');
};

/**
 * Hides the unsaved edit warning.
 *
 * @param event The mouse event that triggers the function.
 */
UnsavedEditWarningPlugin.prototype.hide = function(event) {
    if (--unsavedEditWarningDirty === 0) {
        this.getElement().removeClass(this.options.baseClass + '-visible');
    }
};

/**
 * Prepares and returns the unsaved edit warning element for use in the Raptor UI.
 *
 * @todo instance details
 * @param {type} instance
 * @returns {Element}
 */
UnsavedEditWarningPlugin.prototype.getElement = function() {
    if (!unsavedEditWarningElement) {
        var dirtyClass = 'raptor-plugin-unsaved-edit-warning-dirty';
        unsavedEditWarningElement = $(this.raptor.getTemplate('unsaved-edit-warning.warning', this.options))
            .mouseenter(function() {
                Raptor.eachInstance(function(raptor) {
                    if (raptor.isDirty()) {
                        raptor.getElement().addClass(dirtyClass);
                    }
                });
            })
            .mouseleave(function() {
                $('.' + dirtyClass).removeClass(dirtyClass);            })
            .appendTo('body');
    }
    return unsavedEditWarningElement;
};

Raptor.registerPlugin(new UnsavedEditWarningPlugin());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/unsaved-edit-warning/unsaved-edit-warning.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/view-source/view-source.js
/**
 * @fileOverview Contains the view source dialog code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the dialog button to open the view source dialog.
 */
Raptor.registerUi(new DialogButton({
    name: 'viewSource',
    dialogOptions: {
        width: 600,
        height: 400
    },

    /**
     * Replace the editing element's content with the HTML from the dialog's textarea
     *
     * @param  {Element} dialog
     */
    applyAction: function(dialog) {
        var html = dialog.find('textarea').val();
        this.raptor.actionApply(function() {
            this.raptor.setHtml(html);
            selectionSelectStart(this.raptor.getElement().first());
            this.raptor.checkSelectionChange();
        }.bind(this));
    },

    /**
     * Update the dialog's text area with the current HTML.
     */
    openDialog: function() {
        var textarea = this.getDialog().find('textarea');
        textarea.val(this.raptor.getHtml());
        DialogButton.prototype.openDialog.call(this);
        textarea.select();
    },

    /**
     * @return {Element}
     */
    getDialogTemplate: function() {
        return $('<div>').html(this.raptor.getTemplate('view-source.dialog', this.options));
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/view-source/view-source.js
})();