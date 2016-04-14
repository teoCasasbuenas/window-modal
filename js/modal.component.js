var Instances = (function($) {
    /**
     * Generador de instancias para alamacenar los contenedores de los modales, las instancias, y referencias a estas.
     *
     * @class
     * @consructor
     */
    function Instances() {
        var instancias = {};
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
         * @param  {Object} modalParent Objeto contexto.
         * @return {[type]}             [description]
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
         * @param {[type]} idContenedor El identificador de la instancia que da contexto al contenedor de las ventanas minimizadas.
         */
        this.setInstanciaModal = function(modal, idContenedor) {
            var id = "modal" + Date.now();
            modal.ID = id;
            instancias[idContenedor].modales.push(modal);
        };
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
})(jQuery);

var instanciasModal = new Instances();

var Modal = (function($, instancias) {
    /**
     *
     * @param {[type]} tituloModal     [description]
     * @param {[type]} idContenedor    [description]
     * @param {[type]} opcionesUsuario [description]
     */
    function Modal(tituloModal, idContenedor, opcionesUsuario) {
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



        //Métodos privados.
        var doConstruir = function(that) {
            var opciones = that.opciones,
                rawModal = document.createElement("div"),
                modal = $(rawModal).addClass('ventanas'),
                modalHead = that.__createHead();

            modalHead.find(".ventanas__cabecera--titulo").html(tituloModal);

            that.modalInstance = modal;

            //Agregamos atr	ibutos css al modal
            modal.css({
                "width": opciones.ancho + opciones.unidadMedida,
                "height": opciones.alto + opciones.unidadMedida,
                "backgroundColor": opciones.backgroundColor
            });

            //Agregamos los elementos al modal
            modal.append(modalHead);

            modal.dblclick(function() {
                if ($(this).hasClass('minimizada')) {
                    $(this).removeClass('minimizada');
                }
            });

            $("#" + idContenedor).addClass('ventanas__parent').append(that.modalInstance); //TODO: Obtener el contenedor desde el usuario

            instancias.newInstance($("#" + idContenedor));

            return modal;
        }

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

        //Métodos privados
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
                idContenedor = modalInstance.closest('.ventanas__parent').attr("id");
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