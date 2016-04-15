var Instances = (function($, store) {
    /**
     * Generador de instancias para alamacenar los contenedores de los modales, las instancias, y referencias a estas.
     *
     * @class
     * @consructor
     */
    function Instances() {
        var instancias = {},
            objLocation = window.location,
            modalLS = objLocation.pathname + objLocation.search;
        //Verificamoºs que el local storage esté disponible;
        if (!store.enabled) {
            alert('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.')
            return
        } else {
            instancias.LSinstance = store.get(modalLS); //Verificar si el hash es utilizable para los contextos.

            //Verificamos que exista una instancia del contexto window.location en local storage.
            if (instancias.LSinstance === undefined) {
                store.set(modalLS, {});
                instancias.LSinstance = store.get(modalLS);
            }else{
                __construirVentanas(instancias.LSinstance);
            }
        }

        function __construirVentanas(localInstances){
            var i = 1;
            for(var inst in localInstances){
                config = localInstances[inst];
            }
        }

        /**
         * Retorna las instancias disponibles.
         *
         * @method getInstancias
         * @return {Object} Objeto compuesto por las instancias creadas.
         */
        this.getInstancias = function() {
            return instancias;
        };
        /**
         * Crea una nueva instancia para el contexto seleccionado.
         *
         * @method newInstance
         * @param  {Object} modalParent Objeto contexto
         */
        this.newInstance = function(modalParent) {
            var id = modalParent.attr("id");
            if (!instancias.hasOwnProperty(id)) {
                instancias[id] = {};
                instancias[id].contexto = modalParent;
                instancias[id].modales = [];
            }
        };
        /**
         * Crea una nueva instancia del modal en el contexto seleccionado.
         *
         * @method setInstanciaModal
         * @param {object} modal        Objeto modal
         * @param {string} idContenedor El identificador de la instancia que da contexto al contenedor de las ventanas minimizadas.
         */
        this.setInstanciaModal = function(modal, idContenedor) {
            var id = "modal" + Date.now();
            modal.ID = id;
            instancias[idContenedor].modales.push(modal);
            instancias.LSinstance[id] = modal.storeConfig;
            store.set(modalLS, instancias.LSinstance);
        };
        /**
         * [getInstanciaModal description]
         * @param  {[type]} idModal      [description]
         * @param  {[type]} idContenedor [description]
         * @return {[type]}              [description]
         */
        this.getInstanciaModal = function(idModal, idContenedor) {
            var instancia = instancias[idContenedor].modales,
                modal = $.grep(instancia, function(e) {
                    return e.ID === idModal
                });
            return modal;
        }
        /**
         * Retorna instancia de los modales.
         *
         * @method getInstancia
         * @param  {string} id El identificador de la instancia.
         * @return {object}    Instacia requerida.
         */
        this.getInstancia = function(id) {
            return instancias[id];
        };
        /**
         * Crea la instancia para el contenedor de las ventanas minimizadas para el contexto seleccionado.
         *
         * @method setMiniContenedor
         * @param {string} id         El identificador de la instancia que da contexto al contenedor de las ventanas minimizadas.
         * @param {object} contenedor Objeto con referencia html
         */
        this.setMiniContenedor = function(id, contenedor) {
            instancias[id].mini = contenedor;
        };
        /**
         * Retorna la instancia del contenedor de las ventanas minimizadas para el contexto seleccionado.
         *
         * getMiniContenedor
         * @param  {string} idInstancia El identificador de la instancia que da contexto al contenedor de las ventanas minimizadas.
         * @return {object}             Referencia al contenedor.
         */
        this.getMiniContenedor = function(idInstancia) {
            return instancias[idInstancia].mini;
        };

    }

    Instances.prototype = {
        constructor: Instances
    }
    return Instances;
})(jQuery, store);

var instanciasModal = new Instances();

var Modal = (function($, instancias) {
    /**
     * [Modal description]
     * @param {String} tituloModal     [description]
     * @param {String} idContenedor    [description]
     * @param {Object} contenido       [description]
     * @param {Object} opcionesUsuario [description]
     */
    function Modal(tituloModal, idContenedor, configContenido, opcionesUsuario) {
        //Opciones por defecto del modal.
        var defaultOptions = {
            ancho: 400,
            unidadMedida: "px",
            alto: 200,
            padding: 20,
            backgroundColor: "#FFF"
        };


        //Propiedades.
        this.opciones = $.extend(defaultOptions, opcionesUsuario);
        this.modalInstance = {};


        this.__createHead = function() {
            var $t = this,
                cabecera = $(document.createElement("header")).addClass("font0 ventanas__cabecera"),
                cabeceraContenedorBotones = $(document.createElement("div")).addClass("inline-block ventanas__cabecera--contenedor-botones"),
                cabeceraTitulo = $(document.createElement("span")).addClass("inline-block ventanas__cabecera--titulo"),
                botonCerrar = $(document.createElement("button")).addClass('cerrar-modal ventanas__cabecera--contenedor-botones__boton').html('x'),
                botonMinimizar = $(document.createElement("button")).addClass('minimizar-modal ventanas__cabecera--contenedor-botones__boton').html('_');

            //Acciones de los botones.
            botonCerrar.on("click", function() {
                $t.destroy();
            });
            botonMinimizar.on("click", function() {
                $t.minimizar();
            });



            //Agregamos los botones al contenedor
            cabeceraContenedorBotones.append(botonMinimizar);
            cabeceraContenedorBotones.append(botonCerrar);

            //Agregamos los elementos a la cabecera
            cabecera.append(cabeceraTitulo);
            cabecera.append(cabeceraContenedorBotones);

            return cabecera;
        }

        //Métodos privados.
        var doConstruir = function(that) {
            var opciones = that.opciones,
                rawModal = document.createElement("div"),
                modal = $(rawModal).addClass('ventanas'),
                modalHead = that.__createHead(),
                modalContent = $(document.createElement("div")).addClass('ventanas__contenido');

            modalHead.find(".ventanas__cabecera--titulo").html(tituloModal);

            that.modalInstance = modal;

            //TODO: crear constructor para la hacer la configuración con constructor
            that.modalInstance.storeConfig = {
                tipo: configContenido.tipo,
                selector: (configContenido.hasOwnProperty("selector")) ? configContenido.selector : null,
                url: (configContenido.hasOwnProperty("url")) ? configContenido.url : null,
                idContexto: idContenedor,
                titulo: tituloModal,
                ancho: that.opciones.ancho,
                alto: that.opciones.alto,
                unidadMedida: that.opciones.unidadMedida
            }
            //Agregamos atributos css al modal
            modal.css({
                "width": opciones.ancho + opciones.unidadMedida,
                "height": opciones.alto + opciones.unidadMedida,
                "backgroundColor": opciones.backgroundColor
            });

            __getContenido(modalContent, configContenido);

            //Agregamos los elementos al modal
            modal.append(modalHead);
            modal.append(modalContent);

            modal.dblclick(function() {
                if ($(this).hasClass('minimizada')) {
                    $(this).removeClass('minimizada');
                }
            });

            //Atamos el evento para hacer resize de las ventanas.
            modal.resizable({
                handles: "se",
                start: function(event, ui) {
                    modalContent.getNiceScroll().remove();
                },
                stop: function(event, ui) {
                    modalContent.niceScroll();
                    that.storeConfig.ancho = ui.size.width;
                    that.storeConfig.alto = ui.size.height;
                    that.storeConfig.unidadMedida = "px";
                }
            });

            $("#" + idContenedor).addClass('ventanas__parent').append(that.modalInstance); //TODO: Obtener el contenedor desde el usuario

            instancias.newInstance($("#" + idContenedor));


            return modal;
        }

        /**
         * [__getContenido description]
         * @param  {Object} modalContent  [description]
         * @param  {Object} configObject [description]
         * @return {Object}              [description]
         */
        function __getContenido(modalContent, configObject) {
            if (configObject.hasOwnProperty("tipo")) {
                var tipo = configObject.tipo,
                    contenido = null;
                //TODO: Registrar eventos. (Si es posible, hacerlo en local storage.)
                switch (tipo) {
                    case "DOM":
                        if (configObject.hasOwnProperty("selector")) {
                            console.log(selector);
                            var selector = configObject.selector;
                            contenido = $("#" + selector).clone().css("width", "100%");
                            if (contenido.length === 0) {
                                console.error("No existe el contenido con el indentificador específicado.")
                            }
                        } else {
                            console.error("Para cargar contenido es necesaria la propiedad selector con el id del elemento.");
                        }
                        break;
                    case "GET":
                        if (configObject.hasOwnProperty("url")) {
                            var url = configObject.url;
                            $.get(url, function(data) {
                                contenido = data;
                            });
                        } else {
                            console.error("Para cargar contenido es necesaria la propiedad url con una URL válida.");
                        }
                        break;
                }

            } else {
                console.error("El atributo tipo debe estar definido en la configuración.");
            }
            setTimeout(function() {
                modalContent.append(contenido);
            }, 3000);
        }


        /**
         * [__getContenedorMiniVentanas description]
         * @param  {Object} modal [description]
         * @return {Object}       [description]
         */
        function __getContenedorMiniVentanas(modal) {
            var modalParent = modal.closest('.ventanas__parent'),
                contenedorMiniVentanas = null;
            if (modalParent.find(".contenedor__ventanas__minimizadas").length == 0) {
                var boton = $(document.createElement("button")).addClass('contenedor__ventanas__minimizadas__boton'),
                    contenedorDesplegable = $(document.createElement("div")).addClass('contenedor__ventanas__minimizadas__desplegable');

                contenedorMiniVentanas = $(document.createElement("div")).addClass('contenedor__ventanas__minimizadas');

                boton.on("click", function() {
                    if (contenedorDesplegable.hasClass('desplegado')) {
                        contenedorDesplegable.removeClass('desplegado');
                        contenedorDesplegable.css("height", "0px");
                    } else {
                        contenedorDesplegable.addClass('desplegado');
                        var altura = 0;
                        contenedorDesplegable.find("div").each(function(index, el) {
                            altura += $(this).height();
                        });
                        contenedorDesplegable.css("height", altura + "px");
                    }
                });

                contenedorMiniVentanas.append(boton);
                contenedorMiniVentanas.append(contenedorDesplegable);
                modalParent.append(contenedorMiniVentanas);
                instancias.setMiniContenedor(modalParent.attr("id"), contenedorMiniVentanas);
            } else {
                contenedorMiniVentanas = instancias.getMiniContenedor(modalParent.attr("id"));
            }

            return contenedorMiniVentanas;
        }

        //Métodos
        this.construir = function() {
            return doConstruir(this);
        }

        this.destruir = function() {
            this.modalInstance.remove();
        }

        this.minimizar = function() {
            var contenedorMiniVentanas = __getContenedorMiniVentanas(this.modalInstance),
                currInstancia = instancias.getInstancia(idContenedor),
                miniDiv = $(document.createElement("div")),
                texto = this.modalInstance.find(".ventanas__cabecera--titulo").html();

            this.modalInstance.addClass("mini__ventana");
            miniDiv.append(this.modalInstance);
            miniDiv.css("height", (this.modalInstance.height() * 0.35) + 20);

            var texto = this.modalInstance.find(".ventanas__cabecera--titulo").html();
            currInstancia.mini.find(".contenedor__ventanas__minimizadas__desplegable").append(miniDiv).append("<label class='mini__ventana__label'>" + texto + "</label>");
            this.modalInstance.dblclick(function(event) {
                $(this).removeClass('mini__ventana');
                miniDiv.next(".mini__ventana__label").remove();
                currInstancia.contexto.append($(this));
                miniDiv.remove();
                $(this).off("dblclick");
            });
        }
    }

    Modal.prototype = {
        constructor: Modal,
        show: function() {
            var modalInstance = this.construir(),
                idContenedor = modalInstance.closest('.ventanas__parent').attr("id"),
                contenido = modalInstance.find('.ventanas__contenido');
            contenido.niceScroll();
            instancias.setInstanciaModal(modalInstance, idContenedor);
        },
        destroy: function() {
            this.destruir();
        },
        dragModal: function() {
            var instanciaModal = this.modalInstance,
                modal = $(this.modalInstance),
                contenedor = this.modalInstance.closest('.ventanas__parent'),
                cabecera = this.modalInstance.find(".ventanas__cabecera--titulo"),
                opcionesDraggable = {
                    handle: cabecera,
                    containment: contenedor,
                    drag: function(event, ui) {},
                    start: function(event, ui) {},
                    stop: function(event, ui) {
                        modal.css("z-index", 101);
                        //var modalInst = instancias.getInstacia(instanciaModal.ID);

                    }
                };
            $(this.modalInstance).draggable(opcionesDraggable);
            modal.on("mousedown", function() {
                $(this).css("z-index", 9999);
                $(".ventanas").not(modal).each(function() {
                    $(this).css("z-index", 100);
                });
            });
        }
    }

    return Modal;
})(jQuery, window.instanciasModal || (window.instanciasModal = {}));