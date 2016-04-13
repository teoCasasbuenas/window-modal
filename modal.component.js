var Modal = (function($) {
    function Modal(tituloModal, opcionesUsuario) {
        //Opciones por defecto del modal.
        var defaultOptions = {
                ancho: 400,
                unidadMedida: "px",
                alto: 200,
                padding: 20,
                backgroundColor: "#FFF"
            },
            seleccionado = null;

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

            $("#contenedor").addClass('glm-ventana__parent').append(that.modalInstance);
        }

        this.__createHead = function() {
            let $t = this,
                cabecera = $(document.createElement("header")).addClass("font0 glm-ventana__cabecera"),
                cabeceraContenedorBotones = $(document.createElement("div")).addClass("inline-block glm-ventana__cabecera--contenedor-botones"),
                cabeceraTitulo = $(document.createElement("span")).addClass("inline-block glm-ventana__cabecera--titulo"),
                botonCerrar = $(document.createElement("button")).addClass('glm-ventana__cabecera--contenedor-botones__boton').html('x');

            //Acciones de los botones.
            botonCerrar.on("click", function() {
                $t.destroy();
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
            this.construir();
        },
        destroy: function() {
            this.destruir();
        },

        dragModal: function() {
            let cabecera = this.modalInstance.find("header"),
                modalRaw = this.modalInstance.get()[0];

            var seleccionado = null;

            cabecera.on("dragstart", function(e) {
            	console.log(e);
                __dragInit(modalRaw, e)
                cabecera.get()[0].onmousemove = __moverElemento;

            }).on("mouseup", function(e) {
                __dragDestroy(modalRaw);
            });

            var __dragInit = function(elemento, e) {
                seleccionado = elemento;
                $(seleccionado).css("z-index", 99999);
                mousePos_x = document.all ? window.event.clientX : e.pageX;
                mousePos_y = document.all ? window.event.clientY : e.pageY;
                elemPos_x = mousePos_x - seleccionado.offsetLeft;
                elemPos_y = mousePos_y - seleccionado.offsetTop;
            }

            var __moverElemento = function(e) {
                mousePos_x = document.all ? window.event.clientX : e.pageX;
                mousePos_y = document.all ? window.event.clientY : e.pageY;
                if (seleccionado !== null) {
                    seleccionado.style.left = (mousePos_x - elemPos_x) + "px";
                    seleccionado.style.top = (mousePos_y - elemPos_y) + "px";
                }
            }

            var __dragDestroy = function() {
                seleccionado = null;
                console.log(seleccionado);
            }
        }
    }

    return Modal;
})(jQuery);