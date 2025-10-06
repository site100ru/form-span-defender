<?php
if (!session_id()) {
    session_start();
}

$display = isset($_SESSION['win']) && $_SESSION['win'] == 'block' ? 'block' : 'none';
$message = isset($_SESSION['recaptcha']) ? $_SESSION['recaptcha'] : '';
test 2
?>


<!DOCTYPE html>
<html lang="ru">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Тест формы</title>

		<!-- Bootstrap CSS -->
		<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

		<style>
			/* Стили для модального сообщения */
			#background-msg {
				display: none;
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background: rgba(0, 0, 0, 0.7);
				z-index: 9998;
			}

			#message {
				position: fixed;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				z-index: 9999;
			}

			#message p {
				margin: 0;
				font-size: 18px;
				line-height: 1.5;
				color: #fff;
			}
		</style>
	</head>

<body>
    <?php
    $display = isset($_SESSION['win']) ? $_SESSION['win'] : 'none';
    $message = isset($_SESSION['recaptcha']) ? $_SESSION['recaptcha'] : '';
    ?>
    <!-- Показываем сообщение об успешной отправке -->
    <div style="display: <?php echo $display; ?>;" onclick="modalClose();">
        <div id="background-msg" style="display: <?php echo $display; ?>;"></div>
        <button id="btn-close" type="button" class="btn-close btn-close-white" onclick="modalClose();"
            style="position: absolute; z-index: 9999; top: 15px; right: 15px; display: <?php echo $display; ?>;"></button>
        <div id="message" style="display: <?php echo $display; ?>;">
            <?php
            echo $message;
            if (isset($_SESSION['recaptcha'])) {
                unset($_SESSION['recaptcha']);
            }
            if (isset($_SESSION['win'])) {
                unset($_SESSION['win']);
            }
            ?>
        </div>
    </div>

    <script>
        // Функция закрытия модального окна с сообщением
        function modalClose() {
            document.getElementById('background-msg').style.display = 'none';
            document.getElementById('message').style.display = 'none';
            var parentDiv = document.getElementById('background-msg').parentElement;
            if (parentDiv) {
                parentDiv.style.display = 'none';
            }
        }
    </script>

    <div class="container mt-5">
        <h1>Тест защищенной формы</h1>
        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#callbackModal">
            Открыть форму
        </button>
    </div>

    <!-- Callback Modal -->
    <div class="modal fade" id="callbackModal" tabindex="-1" aria-labelledby="callbackModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <form method="post" action="mails/callback-mail.php" class="modal-content protected-form">
                <div class="modal-header">
                    <h5 class="modal-title" id="callbackModalLabel">Обратный звонок</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col">
                            <p><small>Мы свяжемся с Вами в течение 10 минут и ответим на все вопросы!</small></p>
                        </div>
                    </div>

                    <!-- Основные поля -->
                    <div class="row mb-3">
                        <div class="col-md-6 mb-3 mb-md-0">
                            <input type="text" name="user_name" class="form-control" placeholder="Ваше имя*" autocomplete="new-password" required />
                        </div>
                        <div class="col-md-6">
                            <input type="tel" name="tel" class="form-control telMask" placeholder="Ваш телефон*" required />
                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-md-6 mb-3 mb-md-0">
                            <input type="email" name="email" class="form-control" placeholder="Ваш email*" required />
                        </div>
                        <div class="col-md-6">
                            <input type="text" name="city" class="form-control" placeholder="Ваш город" />
                        </div>
                    </div>

                    <!-- HONEYPOT поле имени (НЕ УДАЛЯТЬ!) -->
                    <div style="position: absolute; left: -9999px; opacity: 0; pointer-events: none;" aria-hidden="true">
                        <input type="text" name="name" tabindex="-1" autocomplete="new-password" value="" />
                    </div>

                    <!-- Скрытые поля безопасности -->
                    <input type="hidden" name="form_timestamp" value="" />

                    <!-- Блок ошибок -->
                    <div class="alert alert-danger d-none form-errors"></div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn-lg btn btn-primary mx-auto">
                        Жду звонка
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <!-- Скрипт защиты формы -->
    <script src="js/form-protection.js"></script>
</body>

</html>