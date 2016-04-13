//////////////////////////////////////
//  Creado por: Mateo Casasbuenas   //
//  Fecha: 19/10/2015               //
//  Descripción: API MIGLM          //
//////////////////////////////////////

/**
 * API para MIGLM
 * @version 1.0
 * @exports doc/MIGLM_API
 * @namespace MIGLM_API
 */
var MIGLM_API = MIGLM_API || {};
var urlBase = (!window.location.origin) ? window.location.protocol + '//' + window.location.host : window.location.origin;
/**
 * Variables para la conexión con la api de drive
 */
var clientId = "329136717261-p7tbqbomt38rrotp8a3q85aptf70cn0m.apps.googleusercontent.com";
var developerKey = "AIzaSyB8xO7uC97TmgLPFnkaODgzAV2iHJA3sEw";

//Definicion de método extensor jQuery para obtener el tagName
jQuery.fn.tagName = function () {
    return this.prop("tagName");
}

/**
 * Constructor del namespace
 * @method
 * @memberof MIGLM_API
 * @param {string} namespace - El string con el nuevo namespace para crear al objeto.
 * @returns Nuevo objeto MIGLM_API con el nuevo namespace
 */
MIGLM_API.crearNS = function (namespace) {
    'use strict';
    var partesNS = namespace.split("."),
        padreNS = MIGLM_API,
        i = 0,
        totalNS = 0,
        nombreParteNS = "";
    //Verificamos que la raíz no esté incluida en el nuevo namespace
    //Si está incluida la removemos.
    if (partesNS[0] === "MIGLM_API") {
        partesNS = partesNS.slice(1);
    }
    totalNS = partesNS.length;
    //Iteramos las partes y creamos el nested namespace de ser necesario
    for (i = 0; i < totalNS; i = i + 1) {
        nombreParteNS = partesNS[i];
        //Verificamos que el objeto MIGLM_API no tenga declarado el nuevo NS.
        //Si es así lo declaramos
        if (typeof padreNS[nombreParteNS] === "undefined") {
            padreNS[nombreParteNS] = {};
        }
        //Referenciamos el padre al objeto mas profundo del MIGLM_API
        padreNS = padreNS[nombreParteNS];
    }
    //Retornamos el objeto con el namespace creado.
    return padreNS;
};

/**
 * Namespace aplicaciones UTILS. Libreria que contiene utilidades para extendar la funcionalidad de las aplicaciones de MiGLM 
 * @namespace MIGLM_API.UTILS
 * @memberof MIGLM_API
 */
MIGLM_API.UTILS = MIGLM_API.crearNS("MIGLM_API.UTILS");

/**
 * Función para mezclar 2 objetos
 * @function mergeObjects
 * @param {obj} defaultParams - Objeto con los parametros por defecto.
 * @param {obj} extensorParams - Objeto con los parametros a ser mezclados con los parametros por defecto.
 * @memberof MIGLM_API.UTILS
 * @returns {obj} mergedParams - Objeto con la mezcla de los 2 objetos.
 */
MIGLM_API.UTILS.mergeObjects = function (defaultParams, extensorParams) {
    'use strict';
    var mergedParams = defaultParams,
        key = 0;
    //Iteramos el objeto
    for (key in extensorParams) {
        //Verificamos que
        if (extensorParams.hasOwnProperty(key)) {
            if (extensorParams[key] !== 'undefined') {
                mergedParams[key] = extensorParams[key];
            }
        }
    }

    return mergedParams;
};

/**
 * Función para desplegar una consola de debug.
 * @function debug
 * @memberof MIGLM_API.UTILS
 * @param {string} msg El mensaje que se desplegara en la consola.          
 */
MIGLM_API.UTILS.debug = function (msg) {
    'use strict';
    var log = document.getElementById("debugLog"),
        contenidoLog = document.getElementById("debugLogContent"),
        nuevo = false,
        logHeader = document.createElement("header"),
        btnClose = document.createElement("button"),
        logTitle = document.createElement("H3"),
        pre = document.createElement("pre"),
        nMsg = typeof msg === "object" ? JSON.stringify(msg, null, "\t") : msg,
        text = document.createTextNode(nMsg),
        mousePos_x = 0,
        mousePos_y = 0,
        elemPos_x = 0,
        elemPos_y = 0,
        seleccionado = null;

    if (!log) {
        nuevo = true;
        log = document.createElement("div");
        log.id = "debugLog";
        logHeader.className = "log__header";
        btnClose.className = "log__closer";
        btnClose.innerHTML = "x";
        logTitle.innerHTML = "DEBUG LOG";
        contenidoLog = document.createElement("div");
        contenidoLog.id = "debugLogContent";
        logHeader.appendChild(btnClose);
        logHeader.appendChild(logTitle);
        log.appendChild(logHeader);
        log.appendChild(contenidoLog);
    }

    pre.className = "log__pre";
    pre.appendChild(text);
    contenidoLog.appendChild(pre);

    this.closeLog = function () {
        $(log).remove();
    };

    this._drag_init = function (elem) {
        seleccionado = elem;
        elemPos_x = mousePos_x - seleccionado.offsetLeft;
        elemPos_y = mousePos_y - seleccionado.offsetTop;
    };

    this._mover_elemento = function (e) {
        mousePos_x = document.all ? window.event.clientX : e.pageX;
        mousePos_y = document.all ? window.event.clientY : e.pageY;
        if (seleccionado !== null) {
            seleccionado.style.left = (mousePos_x - elemPos_x) + "px";
            seleccionado.style.top = (mousePos_y - elemPos_y) + "px";
        }
    };

    this._destroy = function () {
        seleccionado = null;
    };

    this.show = function () {
        var debugIns = this;
        if (nuevo) {
            document.body.appendChild(log);
            btnClose.onclick = this.closeLog;
            nuevo = false;
            logHeader.onmousedown = function () {
                debugIns._drag_init(this.parentNode);
                return false;
            };

            document.onmousemove = this._mover_elemento;
            document.onmouseup = this._destroy;
        }
    };

    this.show();
};

/**
 * Función para peticiones y envios xhr
 * @function _xhr    
 * @param {obj} opciones - Objeto con los parametros para las acciones y los métodos extensores.
 * @param {string} opciones.type - Cadena con el tipo de envío "POST" o "GET".
 * @param {bool} opciones.replaceable - Indica si el contenido debe ser remplazado.
 * @param {string} opciones.replace - Selector en donde se debe hacer el remplazo del contenido (Selector tipo jQuery).
 * @param {bool} opciones.appendable - Indica si la respuesta de la petición debe ser agregada al DOM.
 * @param {string} opciones.appendTo - Selector en donde se debe agregar el contenido (Selector tipo jQuery).
 * @param {string} opciones.url - url a la que se realizara la petición.
 * @param {bool} opciones.overlay - Indica si la petición abrira el "overlay" mientras se ejecuta.
 * @param {bool} opciones.mensajeProgreso - Indica si se pondra mensaje de progreso en algún lugar de la página.
 * @param {obj} opciones.mensajeProgresoOpciones - Objeto con las opciones que se usarán para los mensajes en las diferentes         etapas de la petición.
 * @param {string} opciones.mensajeProgresoOpciones.progreso - Cadena que indica el inicio de la petición.
 * @param {string} opciones.mensajeProgresoOpciones.finalizado - Cadena que indica el fin satisfactorio de la petición.
 * @param {string} opciones.mensajeProgresoOpciones.error - Cadena que indica que la petición genero un error.
 * @param {bool} opciones.mensajeProgresoOpciones.activo - Indica si el mensaje de progreso esta activo.
 * @param {string} opciones.mensajeProgresoOpciones.target - Selector que indica donde se debe desplegar el mensaje.
 * @memberof MIGLM_API.UTILS
 */
MIGLM_API.UTILS._xhr = function (opciones) {
    'use strict';
    var opcionesDefecto = {
        /**
         *Comando para ser ejecutado en antes del inicio de la petición. Extiende la funcionalidad del "beforesend" usado por jQuery
         * @memberof MIGLM_API.UTILS._xhr
         * @function onBeforeSend
         */
        onBeforeSend: function () {
            return false;
        },
        /**
         *Comando para ser ejecutado cuando hay respuesta positiva de la petición xhr. Extiende la funcionalidad del "success" usado por jQuery
         * @memberof MIGLM_API.UTILS._xhr
         * @function onSuccess
         */
        onSuccess: function (data, status, xhr) {
            return false;
        },
        /**
         *Comando para ser ejecutado cuando hay respuesta de error de la petición xhr. Extiende la funcionalidad del "success" usado por jQuery
         * @memberof MIGLM_API.UTILS._xhr
         * @function onSuccess
         */
        onError: function (xhr, status, error) {
            return false;
        },
        /**
         *Comando para ser ejecutado cuando hay respuesta de error de la petición xhr. Extiende la funcionalidad del "success" usado por jQuery
         * @memberof MIGLM_API.UTILS._xhr
         * @function onSuccess
         */
        onComplete: function (xhr, status) {
            return false;
        },

        //Parametros del envío de datos.
        type: "POST",
        replaceable: false,
        replace: "#contenedorReemplazable",
        url: urlBase,
        appendable: false,
        appendTo: "body",
        overlay: true,
        mensajeProgreso: false,
        mensajeProgresoOpciones: {
            progreso: "Guardando...",
            finalizado: "Todos los cambios han sido guardados",
            error: "No se han podido guardar los cambios",
            activo: false,
            target: "body"
        }
    };

    if (typeof opciones === "object") {
        opciones = MIGLM_API.UTILS.mergeObjects(opcionesDefecto, opciones);
    } else {
        opciones = opcionesDefecto;
    }

    $.ajax({
        cache: true,
        type: opciones.type,
        async: opciones.async,
        contentType: "application/json",
        url: opciones.url, //La acción debe llevar parametros GET de ser necesario
        data: JSON.stringify(opciones.params),
        beforeSend: function () {
            if (opciones.overlay) {
                //displayThrobber();
            }
            if (opciones.mensajeProgresoOpciones.activo) {
                $(opciones.mensajeProgresoOpciones.target).html((opciones.mensajeProgresoOpciones.progreso)).css({
                    "color": "#666"
                });
            }
            opciones.onBeforeSend();
        },
        success: function (data, status, xhr) {
            if (opciones.replaceable) {
                $(opciones.replace).html(data);
            }
            if (opciones.appendable) {
                $(opciones.appendTo).append(data);
            }
            if (opciones.mensajeProgresoOpciones.activo) {
                $(opciones.mensajeProgresoOpciones.target).html((opciones.mensajeProgresoOpciones.finalizado)).css({
                    "color": "#666"
                });
            }
            opciones.onSuccess(data, status, xhr);
        },
        error: function (xhr, status, error) {
            if (opciones.mensajeProgresoOpciones.activo) {
                $(opciones.mensajeProgresoOpciones.target).html((opciones.mensajeProgresoOpciones.error)).css({
                    "color": "red"
                });
            }
            opciones.onError(xhr, status, error);
        },
        complete: function (xhr, status) {
            opciones.onComplete(xhr, status);
        }
    });
};

/**
 * Función para extraer atributos del tipo "data-param-{nombre parametro}"
 * @function obtenerParams
 * @param {obj} $elem - Objeto jQuery con el elemento al que se le extraeran los parametros. 
 * @param {bool} tipoGet - Parametro para indicar si se debe agregar salida para peticion xhr tipo 'GET'. 
 */
MIGLM_API.UTILS.obtenerParams = function ($elem, tipoGET) {
    'use strict';
    var all_values = [],
        data = $($elem).data(),
        params = {},
        newKey = "",
        salidaGET = "";
    for (var key in data) {
        if (key.indexOf("param") > -1) {
            newKey = key.split("param");
            newKey = newKey[1].charAt(0).toLowerCase() + newKey[1].slice(1);
            params[newKey] = data[key],
            salidaGET += newKey + "=" + data[key] + "&";
        }
    }
    if (tipoGET) {
        params.GETParams = "?" + salidaGET;
    }
    return params;
};

/**
 *Función para construir el HTML del throber
 *TODO: Completar comentarios-docs
 */
MIGLM_API.UTILS.throbber = function (objetivo, opciones) {
    'use strict';
    var throbberHTML = document.createElement("div"),
        throbberWrapper = document.createElement("div"),
        overlayThrobberWrapper = document.createElement("div"),
        //objetivo = typeof objetivo === "undefined" ? document.body : objetivo,
        opcionesDefecto = {
            overlay: {
                activo: false,
                position: "absolute",
                color: {
                    r: "0",
                    g: "0",
                    b: "0",
                    opacidad: "0.5"
                }
            }
        };

    if (typeof opciones === "object") {
        opciones = MIGLM_API.UTILS.mergeObjects(opcionesDefecto, opciones);
    } else {
        opciones = opcionesDefecto;
    }

    this.obtenerOverlay = function () {
        if (opciones.overlay.activo) {
            return "rgba(" + [opciones.overlay.color.r, opciones.overlay.color.g, opciones.overlay.color.b, opciones.overlay.color.opacidad].join(",") + ")";
        } else {
            return "rgba(" + [opciones.overlay.color.r, opciones.overlay.color.g, opciones.overlay.color.b, 0].join(",") + ")";
        }
    };

    overlayThrobberWrapper.className = "overlay-throbber";
    overlayThrobberWrapper.style.backgroundColor = this.obtenerOverlay();
    overlayThrobberWrapper.style.position = opciones.overlay.position;
    overlayThrobberWrapper.style.zIndex = 10000;
    throbberWrapper.className = "absolute throbber-wrapper";
    throbberHTML.className = "throbber-loader";
    throbberHTML.innerText = "Cargando...";
    throbberWrapper.appendChild(throbberHTML);
    overlayThrobberWrapper.appendChild(throbberWrapper);



    this.show = function () {
        $(objetivo).css({ "position": "relative" }).append(overlayThrobberWrapper);
    }

    this.destroy = function () {
        $(objetivo).find(".overlay-throbber").remove();
    }

    return this;
};

/**
*
*/
MIGLM_API.UTILS.modal = function (opciones, contenido) {
    var defaultOptions = {
        width: 400,
        unidadWidth: "px",
        height: 200,
        unidadHeight: "px",
        padding: 20,
        closeButton: true,
        backgroundColor: "#FFDE14",
        centrar: true
    }

    if (typeof opciones == 'object') {
        opciones = MIGLM_API.UTILS.mergeObjects(defaultOptions, opciones);
    } else {
        opciones = defaultOptions;
    }	

    this.construir = function () {
        var modalInst = this,
            overlay = document.createElement("div"),
            modal = document.createElement("div"),
            modalContent = document.createElement("div"),
            modalHeader = document.createElement("div"),
            closeButton = document.createElement("button"),
            width = opciones.width + opciones.unidadWidth,
            height = opciones.height + opciones.unidadHeight,
            marginLeft = opciones.centrar ? -(opciones.width / 2) + opciones.unidadWidth : 0,
            marginTop = opciones.centrar ? -(opciones.height / 2) + opciones.unidadHeight : 0,
            padding = opciones.padding + "px";

        overlay.className = "overlay";
        modal.className = "modal-v2";
        modalContent.className = "modal-v2__content";
        closeButton.className = "modal-v2__close";
        closeButton.innerHTML = "X";
        closeButton.onclick = this.close;
        modalHeader.innerHTML = "Muevame";

        modal.style.height = "0";
        modalContent.style.width = width;
        modalContent.style.height = height;
        modalContent.style.marginLeft = marginLeft;
        modalContent.style.marginTop = marginTop;
        modalContent.style.padding = padding;
        modalContent.style.backgroundColor = opciones.backgroundColor;
        if (!opciones.centrar) {
            modalContent.style.top = 0;
            modalContent.style.left = 0;
        }

        modalContent.appendChild(modalHeader);

        modalContent.appendChild(contenido);
        if (opciones.closeButton) {
            modalContent.appendChild(closeButton);
        }
        modal.appendChild(modalContent);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        $(".modal-v2").animate({
            "height": "100%"
        }, 300);
        modalHeader.onmousedown = function () {
            modalInst._drag_init(modalContent);
            return false;
        };

        document.onmousemove = this._mover_elemento;
        document.onmouseup = this._destroy;

        $(modalContent).resizable();
    }
    this._drag_init = function (elem) {
        seleccionado = elem;
        elemPos_x = mousePos_x - seleccionado.offsetLeft;
        elemPos_y = mousePos_y - seleccionado.offsetTop;
    };

    this._mover_elemento = function (e) {
        mousePos_x = document.all ? window.event.clientX : e.pageX;
        mousePos_y = document.all ? window.event.clientY : e.pageY;
        if (seleccionado !== null) {
            seleccionado.style.left = (mousePos_x - elemPos_x) + "px";
            seleccionado.style.top = (mousePos_y - elemPos_y) + "px";
        }
    };

    this._destroy = function () {
        seleccionado = null;
    };

    this.show = function () {
        this.construir();
    }
    this.close = function (callback) {
        $(".modal-v2").animate({
            "height": "0"
        }, {
            duration: 300,
            complete: function () {
                $("#hiddenElements").append(contenido);
                setTimeout(function () {
                    $(".overlay").remove();
                }, 500);
            }
        });
    }
};

MIGLM_API.UTILS.notificacion = function (opciones) {
    var defaultOptions = {
        tipoMensaje: "mensaje satisfactorio",
        mensaje: "Guardado correctamente",
        tiempo: 2
    },
        notificacion = "";

    if (typeof opciones == 'object') {
        opciones = MIGLM_API.UTILS.mergeObjects(defaultOptions, opciones);
    } else {
        opciones = defaultOptions;
    }

    notificacion = "<div class='width1024px mensaje-notificacion align-center pdg2 " + opciones.tipoMensaje + "'>" + opciones.mensaje + "</div>";

    $("body").prepend(notificacion);
    setTimeout(function () {
        $(".mensaje-notificacion").fadeOut(500).promise().done(function () {
            $(this).remove();
        });
    }, (opciones.tiempo * 1000));
};

//MIGLM_API.UTILS.notificacionv2 = function (opciones) {
//    var defaultOptions = {
//        posicion: "",
//        mensaje: "Guardado correctamente",
//        tiempo: 2
//    },
//        notificacion = "";

//    if (typeof opciones == 'object') {
//        opciones = MIGLM_API.UTILS.mergeObjects(defaultOptions, opciones);
//    } else {
//        opciones = defaultOptions;
//    }

//};

MIGLM_API.UTILS.desplegable = {
    init: function (selector) {
        this.selector = "." + selector;
        this.listaDesplegables = $(this.selector);
        this.lockIn = true;
        this.lockOut = true;
        this.atarEventos();
    },
    atarEventos: function () {
        var $t = this;
        $(this.listaDesplegables).each(function () {
            var parent = $(this).closest("li"),
                element = this;
            element.style.display = "none";
            parent.on("mouseenter", $.proxy($t.entra, $t, element));
            parent.on("mouseleave", $.proxy($t.sale, $t, element));
        });
    },
    entra: function (element) {
        var t = this;
        t.lockIn = false;
        t.lockOut = true;
        clearTimeout(t.intervaloOut);
        t.intervaloIn = setTimeout(function () {
            if (!t.lockIn) {
                $(t.selector).not(element).slideUp(120);
                $(element).slideDown(120);
            }
        }, 250);
    },
    sale: function (element) {
        var t = this;
        t.lockIn = true;
        t.lockOut = false;
        clearTimeout(t.intervaloIn);
        t.intervaloOut = setTimeout(function () {
            $(t.selector).slideUp(120);
        }, 450);
    }
};

/**
 * Método que ejecuta el guardado del estado push para navegación asíncrona
 * @method estadoPush
 * @param {string} routeUrl - Url que se almacenara en el pushstate. 
 * @param {bool} routeObj - Indica si se debe o no almacenar el objeto de la petición.
 * @param {string} routeNombre - Nombre que se almacenara en el pushstate.
 * @param {bool} pushable - Indica si se debe almacenar pushstate.
 * @param {obj} datosEnvio - Objeto con los parámetros de la petición.
 */
MIGLM_API.UTILS.estadoPush = function (routeUrl, routeObj, routeNombre, pushable, datosEnvio) {
    'use strict';
    var objEnvio = routeObj ? datosEnvio : {};
    if (pushable && typeof window.history.pushState == 'function') {
        history.pushState(objEnvio, routeNombre, routeUrl);
    }
};

MIGLM_API.UTILS.navegacion = {
    cursor: -1,
    cursorLock: true,
    data: {
        url: "",
        reemplazo: "#contenedorReemplazable",
        padre: "",
        hijo: ""
    },
    tabs: {
        //selector debe ser clase ya que se asume que son multiples elementos
        init: function (selector) {
            'use strict';
            var listaElementos = $(selector);
            var contTabs = 0;
            $(".contenedor-tabs").each(function () {
                contTabs++;
                var $t = this;
                $t.id = "contenedorTab-" + contTabs;
            })
            for (var i = 0; i < listaElementos.length; i++) {
                //chequeo de eventos atados al elemento
                var evnt = $(listaElementos[i]).data("events");
                if (evnt == undefined) {
                    listaElementos[i].onclick = function () {
                        var el = $(this),
                            vista = el.attr("data-vista"),
                            accion = el.attr("data-accion"),
                            parent = el.closest("ul"),
                            replaceTarget = parent.attr("data-replace-target") || "#contenedorReemplazable",
                            reqType = el.attr("data-reqtype"),
                            params = MIGLM_API.UTILS.obtenerParams(el, false),
                            throbberRequest = new MIGLM_API.UTILS.throbber(document.body, { overlay: { activo: true, color: { r: "200", g: "200", b: "200", opacidad: "0.8" } } }),
                            datosEnvio = {
                                type: reqType,
                                replaceable: true,
                                replace: replaceTarget,
                                url: urlBase + accion,
                                overlay: true,
                                params: params,
                                onBeforeSend: function () {
                                    throbberRequest.show();
                                },
                                onComplete: function () {
                                    var routeUrl = el.attr("data-route-url"),
                                        routeObj = MIGLM_API.UTILS.parseBool(el.attr("data-route-obj")),
                                        routeNombre = el.attr("data-route-nombre"),
                                        pushable = MIGLM_API.UTILS.parseBool(el.attr("data-route-push"));
                                    MIGLM_API.UTILS.estadoPush(routeUrl, routeObj, routeNombre, pushable, { type: reqType, replaceable: true, replace: replaceTarget, url: urlBase + accion, overlay: true, params: params });
                                    throbberRequest.destroy();
                                }
                            };

                        $(".menu-desplegable-v2__contenedor-submenu, .menu-desplegable-v2__submenu-item").removeClass("active");
                        el.addClass("active");
                        el.closest(".menu-desplegable-v2__contenedor-submenu").addClass("active");

                        MIGLM_API.UTILS._xhr(datosEnvio);

                    }
                }
            }
            var goTo = function (datosEnvio, callback) {
                if (typeof window.history.pushState == 'function') {
                    var accion = "",
                        url = "";
                    if (datosEnvio.params.hasOwnProperty('id')) {
                        if (datosEnvio.url.indexOf("Unidad") > -1) {
                            accion = "unidad";
                            url = "/Estudio/Unidades/CrearUnidad"
                        } else if (datosEnvio.url.indexOf("Meta") > -1) {
                            accion = "meta";
                            url = "/Estudio/Metas/CrearMeta";
                        } else if (datosEnvio.url.indexOf("Evento") > -1) {
                            accion = "meta";
                            url = "/Estudio/Eventos/CrearEvento";
                        }
                        history.pushState({}, 'Crear ' + accion, url);
                    }
                    if (datosEnvio.params.hasOwnProperty('v')) {
                        accion = "";
                        if (datosEnvio.params.v.indexOf("Unidad") > -1) {
                            accion = "Unidades";
                            url = "/Estudio/Unidades/Listado";
                        } else if (datosEnvio.params.v.indexOf("Meta") > -1) {
                            accion = "Metas";
                            url = "/Estudio/Metas/Listado";
                        } else if (datosEnvio.params.v.indexOf("Evento") > -1) {
                            accion = "Eventos";
                            url = "/Estudio/Eventos/Listado";
                        } else if (datosEnvio.params.v.indexOf("Informes") > -1) {
                            accion = "Informes";
                            url = "/Estudio/Informes/Listado";
                        } else if (datosEnvio.params.v.indexOf("Informe") > -1) {
                            accion = "Informe";
                            var urlRaw = window.location.href,
                                urlContext = urlRaw.split("/Informe/")[1],
                                urlParams = urlContext.split("/"),
                                idMateria = urlParams[0],
                                idPeriodo = urlParams[1],
                                idAlumno = urlParams[2],
                                contexto = "";
                            if (datosEnvio.accion.indexOf("Observacion")) {
                                contexto = "/Observaciones";
                            } else if (datosEnvio.accion.indexOf("Alumno_Meta")) {
                                contexto = "/Metas"
                            } else if (datosEnvio.accion.indexOf("Ausencias")) {
                                contexto = "/Ausencias"
                            } else if (datosEnvio.accion.indexOf("Nivelaciones")) {
                                contexto = "/Nivelaciones"
                            };
                            url = "/Estudio/Informes/Informe/" + idMateria + "/" + idPeriodo + "/" + idAlumno + contexto;
                        }
                        history.pushState(datosEnvio, 'Meta ' + datosEnvio.params.id, url);
                    }
                }
                $.ajax({
                    cache: false,
                    type: datosEnvio.type,
                    contentType: "application/json",
                    url: urlBase + datosEnvio.accion,//La acción debe llevar parametros GET de ser necesario
                    data: JSON.stringify(datosEnvio.params),
                    beforeSend: function () {
                        //displayThrobber();
                    },
                    success: function (data) {
                        //closeThrobber();
                        $(datosEnvio.replace).html(data);
                        if (typeof callback === 'function' && callback()) {
                            callback(data);
                        }
                    },
                    error: function (xhr, status, error) {
                        //closeThrobber();
                        //mostrarMensaje('No fue posible realizar esta acci\u00f3n. <br/> Verifique su conexi\u00f3n a Internet e int\u00e9ntelo nuevamente.');
                    },
                    complete: function () {
                    }
                });
            }
        }
    },
    _getID: function (id) {
        return document.getElementById(id);
    }
};

MIGLM_API.UTILS.textboxAncho = function (elem, referencia) {
    $(referencia).html($(elem).val());
    console.log()
    $(elem).width($(referencia).width() + 14);
};

MIGLM_API.UTILS.textareaResize = function (elem, referencia) {
    if ($(elem).width() < 940) {
        $(referencia).html($(elem).val());
        $(elem).width($(referencia).width() + 20);
    } else {
        $(elem).width(940);
    }
    elem.style.height = (elem.scrollHeight + 2) + "px";
};

MIGLM_API.UTILS.parseBool = function (param) {
    if (param === "true" || param === "True") {
        return true;
    }
    if (param === "false" || param === "False") {
        return false;
    }
};

MIGLM_API.UTILS.drivePermissions = function (fileId) {
    var SCOPES = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file'];
    this.driveConnection = function () {
        gapi.client.load('drive', 'v2', this.onAuthApiLoad);
    }
    this.onAuthApiLoad = function () {
        window.gapi.auth.authorize({
            'client_id': clientId,
            'scope': SCOPES,
            immediate: true
        }, handleAuthResult);
    }
    var oauthToken;
    function handleAuthResult(authResult) {
        var $t = this;
        if (authResult && !authResult.error) {
            oauthToken = authResult.access_token;
            insertPermission(fileId, "anyone", "reader");
        } else {
            window.gapi.auth.authorize({
                'client_id': clientId,
                'scope': SCOPES,
                immediate: false
            }, handleAuthResult);
        }
    }
    /**
 * Insert a new permission.
 *
 * @param {String} fileId ID of the file to insert permission for.
 * @param {String} type The value "user", "group", "domain" or "default".
 * @param {String} role The value "owner", "writer" or "reader".
 */
    function insertPermission(fileId, type, role) {
        var body = {
            'type': type,
            'role': role,
            'withLink': true
        };
        var request = gapi.client.drive.permissions.insert({
            //'kind': "drive#permission",
            //'path': '/drive/v2/files',
            //'method': 'GET',
            'fileId': fileId,
            'resource': body
        });
        request.execute(function (resp) {
        });
    };
    this.driveConnection();
}

MIGLM_API.UTILS.driveDocs = function (opciones) {
    this.driveConnection = function () {
        gapi.load('auth', { 'callback': this.onAuthApiLoad });
        gapi.load('picker');
    }
    this.onAuthApiLoad = function () {
        window.gapi.auth.authorize({
            'client_id': clientId,
            'scope': ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file']
        }, handleAuthResult);
    }
    var oauthToken;
    function handleAuthResult(authResult) {
        var $t = this;
        if (authResult && !authResult.error) {
            oauthToken = authResult.access_token;
            createPicker();
        }
    }
    function createPicker() {
        var picker = {};
        if (typeof opciones === 'object' && opciones.hasOwnProperty("view")) {
            if (opciones.view === "upload") {
                picker = new google.picker.PickerBuilder()
                .addView(new google.picker.DocsUploadView())
                .setOAuthToken(oauthToken)
                .setDeveloperKey(developerKey)
                .setCallback(pickerCallback)
                .build();
            }
            if (opciones.view === "docs") {
                picker = new google.picker.PickerBuilder()
               .addView(new google.picker.DocsView())
               .setOAuthToken(oauthToken)
               .setDeveloperKey(developerKey)
               .setCallback(pickerCallback)
               .build();
            }
            if (opciones.view === "full") {
                picker = new google.picker.PickerBuilder()
               .addView(new google.picker.DocsUploadView())
               .addView(new google.picker.DocsView())
               .setOAuthToken(oauthToken)
               .setDeveloperKey(developerKey)
               .setCallback(pickerCallback)
               .build();
            }
        } else {
            picker = new google.picker.PickerBuilder()
                .addView(new google.picker.DocsUploadView())
                .addView(new google.picker.DocsView())
                .setOAuthToken(oauthToken)
                .setDeveloperKey(developerKey)
                .setCallback(pickerCallback)
                .build();
        }
        picker.setVisible(true);
    }
    pickerCallback = function (data) {
        var url = 'nothing',
            $t = this;
        if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
            var doc = data[google.picker.Response.DOCUMENTS][0];
            $t.opcionesDefecto = {
                onFinish: function (doc) {
                    return false;
                },
                view: "full"
            };
            if (typeof opciones === "object") {
                opciones = MIGLM_API.UTILS.mergeObjects($t.opcionesDefecto, opciones);
            } else {
                opciones = this.opcionesDefecto;
            }
            opciones.onFinish(doc);
        };
    }
    this.driveConnection();
};

MIGLM_API.UTILS.TemplatingForm = function (el) {
    this.el = $(el).addClass("hide");

    return this;
};


MIGLM_API.UTILS.TemplatingView = function (el) {
    this.el = $(el).addClass("hide");
    return this;
};

MIGLM_API.UTILS.TemplatingView.prototype.FillDetail = function (datos, callback) {
    var $t = this;
    $.each(datos, function (key, val) {
        var elem = "",
            txtRemplazo = "";
        if (key === "ID") {
            $t.el.attr("data-id", val);
        } else if (key === "IsActive") {
            $t.el.attr("data-active", val);
        } else if (key === "IsDeleted") {
            $t.el.attr("data-deleted", val);
        } else {
            elem = $t.el.find(".item-data:contains('{{" + key + "}}'), .item-data[data-value='{{" + key + "}}']");
            if (typeof elem === 'object' && elem.length) {
                if (typeof val === 'object' && val != null) {
                    var li = "";
                    $.each(val, function (keyM, valM) {
                        if (typeof MIGLM_API.UTILS.TemplatingForm.getHTML[key] === 'function') {
                            li = new MIGLM_API.UTILS.TemplatingForm.getHTML[key](valM);
                            elem.append(li);
                        }
                        if (val.tagName) {
                            elem.html("");
                            $(elem).html($(val).get());
                        }
                    });
                } else {
                    txtRemplazo = elem.html();
                    elem.html(txtRemplazo.replace("{{" + key + "}}", val));
                }
            }
        }
    });

    if (typeof callback !== 'undefined' && typeof callback === 'function') {
        callback();
    }
};

MIGLM_API.UTILS.TemplatingForm.getHTML = {
    RecursosDrive: function (info) {
        return $("<li class='item-lista mrgb1 mrgl1 pdgb1' data-id='" + info.ID + "' data-accion='recurso' data-url='_ActasRecursoMasAcciones' >" +
                    "<img class='vAlign-middle' src='" + info.IconURL + "' />" +
                    "<a class='mrgl1' href='" + info.URL + "' target='_blank'>" + info.Name + "</a>" +
                    "<span class='glm-icono cursor-pointer remover-recurso'>&#xe813;</span>" +
                "</li>"); //convenio.js ln edicion materia |     
    }
};

/**
 * Función para llenar el template de un formulario
 * @function fill
 * @memberof MIGLM_API.UTILS.TemplatingForm
 * @param {obj} datos - Objeto JSON con los datos recibidos del servidor. 
 * @param {func} callback - Función a ejecutar una vez finalizada la carga de datos. 
 */
MIGLM_API.UTILS.TemplatingForm.prototype.fill = function (datos, callback) {
    var $t = this;
    $.each(datos, function (key, val) {
        var elem = {},
            tag = "";
        if (key === "ID") {
            $t.el.attr("data-id", val);
        }
        elem = $t.el.find("*[data-value='{{" + key + "}}']");
        elem.each(function (keyEl) {
            tag = $(this).tagName();
            if (typeof tag !== 'undefined' && val != null) {
                switch (tag.toLowerCase()) {
                    case "input":
                        //Si val es un objeto recorremos los elementos y se optiene el id, que debe ser construido en parejas "key"-"valM"
                        if (val != null && typeof val === 'object') {
                            var $elem = $(this);
                            $.each(val, function (keyM, valM) {
                                $("#" + key + "-" + valM.ID).val(valM.Cupos);
                                $(this).attr("data-accion", key);
                            });
                            $(this).attr("data-value", value);

                        } else {
                            $(this).attr("data-value", val);
                            $(this).attr("data-accion", key);
                            $(this).val(val);
                        }
                        break;
                    case "textarea":
                        $(this).attr("data-value", val);
                        $(this).attr("data-accion", key);
                        $(this).html(val);
                        break;
                    case "select":
                        $(this).attr("data-accion", key);
                        if (typeof val === 'object') {
                            var value = "",
                                $elem = $(this);
                            $.each(val, function (keyM, valM) {
                                value += "," + valM.ID;
                                $elem.find("option[value='" + valM.ID + "']").prop("selected", true);
                            });
                            $elem.attr("data-value", value);
                        } else {
                            elem.attr("data-value", val);
                            elem.find("option[value='" + val + "']").prop("selected", true);
                        }
                        break;
                    case "button":
                        elem.attr("data-value", val);
                        elem.attr("data-accion", key);
                        if (key === "IsActive" || key === "IsDeleted") {
                            elem.addClass(val ? "active" : "inactive");
                        }
                        break;
                    case "ul":
                        if (typeof val === 'object') {
                            var li = "",
                                $elem = $(this);
                            $.each(val, function (keyM, valM) {
                                li = new MIGLM_API.UTILS.TemplatingForm.getHTML[key](valM);
                                $elem.append(li);
                            });
                            //$(this).attr("data-value", value);
                        } else {
                            //elem.attr("data-value", val);
                            //elem.find("option[value='" + val + "']").prop("selected", true);
                        }
                        break;
                    case "h1":
                    case "span":
                        elem.html(val);
                        break
                    default:
                        console.error("No se encontro la llave indicada: " + key);
                        break;
                }
            }
        });
    });
    $t.el.removeClass("hide");
    if (typeof callback !== 'undefined' && typeof callback === 'function') {
        callback();
    }
};


/**
 * Namespace aplicaciones CONTROLS. Libreria que contiene controles para extendar los elementos de las aplicaciones de MiGLM 
 * @namespace MIGLM_API.CONTROLS
 * @memberof MIGLM_API
 */
MIGLM_API.CONTROLS = MIGLM_API.crearNS("MIGLM_API.CONTROLS");

MIGLM_API.CONTROLS.customElements = {
    html: {
        select: $("<div class='custom-select' data-seleccionado=''>" +
            "<span class='custom-select-selected'></span>" +
            "<div class='custom-select-arrow-container'><span class='custom-select-arrow'></span></div>" +
            "<div class='custom-select-options'><div>" +
            "</div>"),
        checkboxSwitch: $("<div><label class='sub2 collapse-control__leyenda vAlign-top mrgr1'></label>" +
            "<div class='inline-block collapse-control-container'>" +
                "<div class='relative collapse-control'>" +
                    "<span data-estado='colapsado' class='collapse-control__boton absolute'></span>" +
                "</div>" +
            "</div></div>")
    },
    CESelect: function (clase, opciones) {
        var defaults = {
            onClick: function (value, targetId) {
                return false;
            },
            emptyItem: true
        };
        if (typeof opciones == 'object') {
            opciones = $.extend(defaults, opciones);
        } else {
            opciones = defaults;
        }
        this.init = function () {
            this.selects = $("." + clase);
            this.construir();
        };
        this.construir = function () {
            var $t = this;
            this.selects.each(function (i) {
                var $elemento = $(this),
                    currId = $elemento.attr("id"),
                    customElementID = "",
                    selectID = "",
                    customSelect = $t.html.select.clone(),
                    valorSeleccionado = $elemento.find("option:selected").val(),
                    opcionSeleccionada = $elemento.find("option:selected").html(),
                    opcionesSelect = $t.construirOpciones($(this));
                if (typeof currId !== typeof undefined && currId !== false) {
                    customElementID = "CEREF-" + currId;
                    customSelect.attr("id", customElementID);
                } else {
                    customElementID = "CEREF-CESelect-" + i;
                    selectID = "CESelect-" + i;
                    customSelect.attr("id", customElementID);
                    $(this).attr("id", selectID);
                }
                customSelect.find(".custom-select-selected").html(opcionSeleccionada);
                customSelect.find(".custom-select-options").hide().html(opcionesSelect);
                customSelect.find(".custom-select-option").each(function () {
                    $(this).on("click", $.proxy($t.toggleCESelectValue, $t, $(this)))
                });
                customSelect.insertAfter($(this));
                customSelect.on("click", $.proxy($t.toggleCE, $t, clase, customSelect));
                $(this).addClass("hide");
            });
        };
        this.toggleCE = function (clase, $elem) {
            if ($elem.find(".custom-select-options").hasClass("desplegado")) {
                $elem.find(".custom-select-options").slideUp(200);
                $elem.find(".custom-select-options").removeClass("desplegado");
            } else {
                $(".custom-select-options").slideUp(200).removeClass("desplegado");
                $elem.find(".custom-select-options").slideDown(200);
                $elem.find(".custom-select-options").addClass("desplegado");
            }
        };
        this.toggleCESelectValue = function ($elem) {
            var targetSelectId = "#" + $elem.closest(".custom-select").attr("id").split("CEREF-")[1];
            $elem.closest(".custom-select").find(".custom-select-selected").html($elem.html());
            $(targetSelectId).find("option[value='" + $elem.attr("data-opt-value") + "']").attr("selected", "selected");
            opciones.onClick($elem.attr("data-opt-value"), targetSelectId);
        };
        this.construirOpciones = function ($select) {
            var opciones = $select.find("option"),
                salidaOpciones = opciones.emptyItem ? "<span class='custom-select-option' data-opt-value='0'>- Seleccione -</span>" : "";
            opciones.each(function () {
                salidaOpciones += "<span class='custom-select-option' data-opt-value='" + $(this).val() + "'>" + $(this).html() + "</span>";
            });
            return salidaOpciones;
        };

        this.init();
    },
    CESwitchCheckbox: function (selector, opciones) {
        var defaultOptions = {
            textoTrue: "Colapsar",
            textoFalse: "Expandir"
        };

        this.init = function () {
            this.checkboxes = $(selector);

            this.construir();
        };
        this.construir = function () {
            var $t = this;
            this.checkboxes.each(function (i) {
                var $elemento = $(this),
                    currId = $elemento.attr("id"),
                    customElementID = "",
                    checkboxID = "",
                    customSwitchCheckbox = $t.html.checkboxSwitch.clone(),
                    seleccionado = $elemento.prop("checked");
                if (typeof currId !== typeof undefined && currId !== false) {
                    customElementID = "CEREF-" + currId;
                    customSwitchCheckbox.attr("id", customElementID);
                } else {
                    customElementID = "CEREF-CESwitchCheckbox-" + i;
                    checkboxID = "CESwitchCheckbox-" + i;
                    customSwitchCheckbox.attr("id", customElementID);
                    $(this).attr("id", checkboxID);
                }
                customSwitchCheckbox.find(".collapse-control__leyenda").html(seleccionado ? opciones.textoTrue : opciones.textoFalse);
                customSwitchCheckbox.find(".collapse-control__boton").addClass(seleccionado ? "expandido" : "");
                customSwitchCheckbox.find(".collapse-control__boton").on("click", $.proxy($t.switchElement, $t, $(this), customSwitchCheckbox));
                customSwitchCheckbox.insertAfter($(this));

                $(this).addClass("hide");
            });
        };
        this.switchElement = function ($elem, customSwitchCheckbox) {
            var colapseControl = customSwitchCheckbox.find(".collapse-control__boton"),
                switchLabel = customSwitchCheckbox.find(".collapse-control__leyenda");
            if (colapseControl.hasClass("expandido")) {
                colapseControl.removeClass("expandido");
                $elem.prop("checked", false);
                switchLabel.html(opciones.textoFalse);
            } else {
                colapseControl.addClass("expandido");
                $elem.prop("checked", true);
                switchLabel.html(opciones.textoTrue);
            }
        };

        this.init();
    }
};


//Módulo de listado.
MIGLM_API.CONTROLS.Listado = function (el) {
    this.el = $(el).addClass("hide");
    return this;
};

MIGLM_API.CONTROLS.Listado.prototype.poblar = function (templateURL, datos, callback) {
    var $t = this;
    this.el.find(".empty").remove();
    var url = urlBase + "/" + templateURL
    $.get(url).then(function (data) {
        $.each(datos, function (key, val) {
            var templateClon = $(data).clone();
            $t.agregarElemento(templateClon, val);
        })
    }).then(function () {
        $t.el.removeClass("hide");
        if (typeof callback !== 'undefined' && typeof callback === 'function') {
            callback();
        }
    });
};

MIGLM_API.CONTROLS.Listado.prototype.agregarElemento = function (clon, data) {
    $.each(data, function (key, val) {
        var elem = "",
            txtRemplazo = "";
        if (key === "ID") {
            clon.attr("data-id", val);
        } else if (key === "idColegio" || key === 'ColegioID') {
            clon.attr("data-id-colegio", val);
        } else if (key === "IsActive") {
            clon.attr("data-active", val);
        } else if (key === "IsDeleted") {
            clon.attr("data-deleted", val);
        } else if (key === "IconURL" || key === "IconoColegio") {
            elem = clon.find(".item-data[src='{{" + key + "}}']");
            elem.attr("src", urlBase + val);
        } else {
            elem = clon.find(".item-data:contains('{{" + key + "}}')");
            if (typeof elem === 'object' && elem.length) {
                txtRemplazo = elem.html();
                elem.html(txtRemplazo.replace("{{" + key + "}}", val));
            }
        }
    });
    this.el.append(clon);
};

MIGLM_API.CONTROLS.Boton = function (opciones) {
    var boton = $(document.createElement("BUTTON")),
        defaultOptions = {
            OnClick: function () {
                alert("Ha sido presionado el botón: " + opciones.texto);
                return false;
            },
            clases: "",
            texto: "Botón",
            attrs: {
            }
        }

    //Verificamos la existencia de opciones y unimos los objetos.
    if (typeof opciones === "object") {
        opciones = MIGLM_API.UTILS.mergeObjects(defaultOptions, opciones);
    } else {
        opciones = defaultOptions;
    }

    $.each(opciones.attrs, function (key, val) {
        boton.attr(key, val);
    });

    boton.html(opciones.texto);

    boton.addClass(opciones.clases);

    boton.on("click", function () {
        opciones.OnClick();
    });

    boton.id = "botonGlm-" + Math.floor(Date.now());

    return boton;
};

/**
 * Función para mezclar 2 objetos
 * @Constructor MenuAcciones
 * @param {str} el - Identificador para el contenedor del menu.
 * @memberof MIGLM_API.CONTROLS
 * @returns {obj} Instancia de objeto MenuAcciones.
 */
MIGLM_API.CONTROLS.MenuAcciones = function (el, botonesDef) {
    'use strict';
    this.el = $(el).addClass("lista-ordenable__item__elemento lista-ordenable__item__acciones align-right");
    var $t = this,
        ul = $(document.createElement("UL")).addClass("lista-ordenable__item__acciones--mas-acciones align-left"),
        controlButton = new MIGLM_API.CONTROLS.Boton({
            clases: "lista-ordenable__item__acciones__accion glm-icono ver-mas-acciones",
            texto: "&#xe8bf;",
            OnClick: function () {
                if ($t.el.hasClass("desplegado")) {
                    $t.el.removeClass("desplegado");
                } else {
                    $t.el.addClass("desplegado");
                }
            }
        });

    if (this.el.find(".lista-ordenable__item__acciones__accion").length > 0) {
        this.el.html("");
    } 
    this.el.append(controlButton);
    this.el.append(ul);

    //Verificamos que el objeto opciones sea un objeto.
    if (typeof botonesDef === "object") {
        this.init(botonesDef);
        return this;
    } else {
        throw new Error("No hay definicion para el inicializador de los botones");
    }

};


MIGLM_API.CONTROLS.MenuAcciones.prototype.controlPlegado = function () {
    if (this.el.hasClass("desplegado")) {
        this.el.removeClass("desplegado");
    } else {
        this.el.addClass("desplegado");
    }
}

MIGLM_API.CONTROLS.MenuAcciones.prototype.init = function (botonesDef) {
    'use strict';
    var arrayLength = botonesDef.length,
        i = 0;
    this.instancias = [];
    for (i; i < arrayLength; i++) {
        var boton = new MIGLM_API.CONTROLS.Boton(botonesDef[i]),
            instancia = { id: boton.id, instancia: boton };
        this.instancias.push(instancia);
        this.el.find("ul").append(boton);
        boton.wrap("<li class='lista-ordenable__item__acciones__item'></li>");
    }
};