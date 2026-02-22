<?php
if($_SERVER['REQUEST_METHOD'] == 'POST') {
  $full_name = $_POST['fullnamedesktop'];
  $phone = $_POST['phonedesktop'];
  $description = $_POST['descripdesktop'];

  $to = 'omitarangel1992@gmail.com';
  $subject = 'Registro portafolio de servicio';
  $message = "Nombre completo: $full_name \n\n Teléfono: $phone \n\n Descripción: $description";
  $headers = "From: omitarangel1992@gmail.com\r\n" .
  "Reply-To: omitarangel1992@gmail.com\r\n" .
  "Content-Type: text/plain; charset=UTF-8\r\n";

  if(mail($to, $subject, $message, $headers)) {
    header('Location: http://ratimodesign.byethost22.com/index-typ.html');
    exit;
  } else {
    echo 'Error al enviar el mensaje';
  }
}
?>
