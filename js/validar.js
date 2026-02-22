function validardesktop() {
    
    var FullName, phone, descrip, expresion;

    FullName = document.getElementById('fullnamedesktop').value;
    phone = document.getElementById('phonedesktop').value;
    descrip = document.getElementById('descripdesktop').value;

    pattern = new RegExp('^[A-Z\u00f1\u00d1\u00E0-\u00FC\\s]+$', 'i');
    words = /([a-zA-Z])\1{2,}/

    telephonePattern = /([1-8])\1{4,}/
    initialNumber = /^([1-8]){1}/

    expresion = /\w+@\w+\.+[a-z]/


    /*Validación nombres estudiante*/
    if (FullName === "" || phone === "" || descrip === "") {
        Swal.fire({
            title: "Error de envío",
            text: "Todos los campos son obligatorios.",
            icon: "error",
        });
        return false;
    }
    else if (FullName.length > 40) {
        Swal.fire({
            title: "Error de envío",
            text: "El campo nombre es demasiado largo.",
            icon: "error",
        });
        return false;
    }
    else if (FullName.length <= 2) {
        Swal.fire({
            title: "Error de envío",
            text: "El campo nombre debe tener mínimo 3 letras.",
            icon: "error",
        });
        return false;
    }
    else if (!pattern.test(FullName)) {
        Swal.fire({
            title: "Error de envío",
            text: "El campo de nombre no puede contener números.",
            icon: "error",
        });
        return false;
    }


    /*Validación telefono*/
    if (phone.length < 10) {
        Swal.fire({
            title: "Error de envío",
            text: "El campo de teléfono no puede contener menos de 10 dígitos.",
            icon: "error",
        });
        return false;
    }
    else if (phone.length > 10) {
        Swal.fire({
            title: "Error de envío",
            text: "El campo de teléfono no puede contener más de 10 dígitos.",
            icon: "error",
        });
        return false;
    }
    else if (phone.length === 10) {
        if (!phone.startsWith(3)) {
            Swal.fire({
                title: "Error de envío",
                text: "El campo para digitar tu número móvil no puede empezar por un número diferente a 3.",
                icon: "error",
            });
            return false;
        }
    }

    else {
        Swal.fire({
            title: "Correct",
            text: "Información enviada correctamente",
            icon: "success",
        });
        return true;
    }
}