var Instances = (function($) {
    function Instances() {
        var instancias = [];
        this.getInstancias = function (){
        	return instancias;
        };
        this.setInstancia = function (modal){
        	var id = "modal" + Date.now();
        	modal.ID = id;
        	instancias.push(modal);
        };
        this.getInstacia = function (id){
        	var instancia = $.grep(instancias, function (e){return e.ID == id});
        	return instancia[0];
        }
    }

    Instances.prototype = {
    	constructor: Instances
    }
    return Instances;
})(jQuery);

var instanciasModal = new Instances();

var Modal = (function($, instancias) {
    /**
     * @param {[type]}
     * @param {[type]}
     * @param {[type]}
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
                modal = $(rawModal).addClass('glm-ventana'),
                modalHead = that.__createHead();

            modalHead.find(".glm-ventana__cabecera--titulo").html(tituloModal);

            that.modalInstance = modal;
            //Agregamos opciones css al modal
            modal.css({
                "width": opciones.ancho + opciones.unidadMedida,
                "height": opciones.alto + opciones.unidadMedida,
                "backgroundColor": opciones.backgroundColor
            });
            //Agregamos los elementos al modal
            modal.append(modalHead);

            $("#" + idContenedor).addClass('glm-ventana__parent').append(that.modalInstance); //TODO: Obtener el contenedor desde el usuario

            return modal;
        }

        this.__createHead = function() {
            var $t = this,
                cabecera = $(document.createElement("header")).addClass("font0 glm-ventana__cabecera"),
                cabeceraContenedorBotones = $(document.createElement("div")).addClass("inline-block glm-ventana__cabecera--contenedor-botones"),
                cabeceraTitulo = $(document.createElement("span")).addClass("inline-block glm-ventana__cabecera--titulo"),
                botonCerrar = $(document.createElement("button")).addClass('cerrar-modal glm-ventana__cabecera--contenedor-botones__boton').html('x'),
                botonMinimizar = $(document.createElement("button")).addClass('minimizar-modal glm-ventana__cabecera--contenedor-botones__boton').html('_');

            //Acciones de los botones.
            botonCerrar.on("click", function() {
                $t.destroy();
            });
            botonMinimizar.on("click", function (){

            });

            //Agregamos los botones al contenedor
            cabeceraContenedorBotones.append(botonCerrar);

            //Agregamos los elementos a la cabecera
            cabecera.append(cabeceraTitulo);
            cabecera.append(cabeceraContenedorBotones);

            return cabecera;
        }



        //Métodos
        this.construir = function() {
            return doConstruir(this);
        }

        this.destruir = function() {
            this.modalInstance.remove();
        }
    }

    Modal.prototype = {
        constructor: Modal,
        show: function() {
            var modalInstance = this.construir();
            instancias.setInstancia(modalInstance);
        },
        destroy: function() {
            this.destruir();
        },
        dragModal: function() {
            var instanciaModal = this.modalInstance,
            	modal = $(this.modalInstance),
                contenedor = this.modalInstance.closest('.glm-ventana__parent'),
                cabecera = this.modalInstance.find(".glm-ventana__cabecera--titulo"),
                opcionesDraggable = {
                    handle: cabecera,
                    containment: contenedor,
                    drag: function(event, ui) {},
                    start: function(event, ui) {},
                    stop: function(event, ui) {
                        modal.css("z-index", 101);
                        var modalInst = instancias.getInstacia(instanciaModal.ID);
                        console.log(this);
                    }
                };
            $(this.modalInstance).draggable(opcionesDraggable);
            modal.on("mousedown", function() {
                $(this).css("z-index", 9999);
                $(".glm-ventana").not(modal).each(function() {
                    $(this).css("z-index", 100);
                });
            });
        }
    }

    return Modal;
})(jQuery, window.instanciasModal || (window.instanciasModal = {}));
